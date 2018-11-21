import * as profileHandles from '../profiles/handles';
import * as postHandles from './handles';

import {
	IContext,
	IGunCallback,
	ILikesArray,
	ILikesMetasCallback,
	IMetasCallback,
} from '../../types';
import { ApiError } from '../../utils/errors';
import {
	cleanGunMetaFromObject,
	convertGunSetToArray,
	convertGunSetToArrayWithKey,
	datePathFromDate,
} from '../../utils/helpers';

import moment from 'moment';
import { ICommentData } from '../comments';
import {
	IMedia,
	IPostArrayData,
	IPostCallbackData,
	IPostMetasCallback,
	IPostReturnData,
	IPostsDataCallback,
	IPostUserMetasCallback,
} from './types';

const noop = () => {
	///
};

export const getPostPathsByUser = (
	context: IContext,
	{ username }: { username: string },
	callback: IGunCallback<string[]>,
) => {
	postHandles.postMetasByUsername(context, username).docLoad((metasCallback: any) => {
		if (!metasCallback || !Object.keys(metasCallback).length) {
			return callback(null, []);
		}
		postHandles
			.postMetasByUsername(context, username)
			.docLoad((postsMeta: IPostUserMetasCallback) => {
				if (!postsMeta || !Object.keys(postsMeta).length) {
					return callback([]);
				}
				const paths = convertGunSetToArray(postsMeta)
					.map((postMeta: any = {}) => (postMeta ? postMeta.postPath : undefined))
					.filter((path) => !!path);
				return callback(null, paths);
			});
	});
};

const convertLikesToArray = (likes: ILikesMetasCallback): ILikesArray =>
	convertGunSetToArrayWithKey(likes).reduce((likesAgg: any[], like: any) => {
		const { k, ...rest } = like;
		if (!like['#'] && rest.owner) {
			likesAgg = [...likesAgg, rest];
		}
		return likesAgg;
	}, []);

const convertMediaToArray = (media: any): IMedia[] =>
	convertGunSetToArray(media).reduce((mediaAgg: any[], m: any) => {
		const { ...rest } = m;
		if (!m['#'] && Object.keys(rest).length > 0) {
			mediaAgg = [...mediaAgg, m];
		}
		return mediaAgg;
	}, []);

const convertCommentsToArray = (comments: any): ICommentData[] =>
	convertGunSetToArrayWithKey(comments).reduce(
		(commentsAgg: any[], { k, ...postComment }: any & { k: string }) => {
			// convert comment likes into an array with key
			const commentLikes = convertLikesToArray(postComment.likes);
			const { likes, ...postRest } = postComment;
			if (!postComment['#'] && postComment.owner) {
				commentsAgg = [
					...commentsAgg,
					{
						commentId: k,
						likes: commentLikes,
						...postRest,
					},
				];
			}
			return commentsAgg;
		},
		[],
	);

export const fastGetPostByPath = (
	context: IContext,
	{ postPath, wait }: { postPath: string; wait?: number },
	callback: IGunCallback<IPostReturnData>,
) => {
	postHandles.postByPath(context, postPath).open(
		(postData: IPostCallbackData) => {
			if (!postData || !Object.keys(postData).length) {
				return callback(
					new ApiError('failed, no post found', {
						initialRequestBody: { postPath },
					}),
				);
			}

			let shouldWaitAndTryAgain = false;

			// const keys = Object.keys()
			const { likes, comments, media, ...restPost } = postData;
			// convert likes into an array with keys
			const postLikes = convertLikesToArray(likes);
			// convert comments and their likes into an array with keys
			const postComments: any = convertCommentsToArray(comments);
			// convert media to an array
			const mediaReturn = convertMediaToArray(media) || [];

			[postLikes, postComments, mediaReturn].forEach((propArray: any = []) => {
				if (propArray && propArray.length) {
					propArray.forEach((obj: any) => {
						if (obj && typeof obj === 'object' && Object.keys(obj).includes('#')) {
							shouldWaitAndTryAgain = true;
						}
					});
				}
			});
			// related to the retry checks
			if (
				postData.owner &&
				typeof postData.owner === 'object' &&
				Object.keys(postData.owner).length === 0
			) {
				shouldWaitAndTryAgain = true;
			}

			if (!shouldWaitAndTryAgain) {
				const post: IPostReturnData = {
					postId: postPath.split('.').reverse()[0],
					likes: postLikes,
					comments: postComments,
					media: mediaReturn,
					...restPost,
				};
				return callback(null, post);
			}
			getPostByPath(
				context,
				{
					wait: wait ? wait + 100 : 400,
					postPath,
				},
				callback,
			);
		},
		{ off: 1, wait: wait || 400 },
	);
};

export const getPostByPath = (
	context: IContext,
	{ postPath, wait, timeout }: { postPath: string; wait?: number; timeout?: number },
	callback: IGunCallback<IPostReturnData>,
) => {
	const docOpts = {
		wait: wait || 300,
		timeout: timeout || 600,
	};

	const mainGetter = () => {
		postHandles.postByPath(context, postPath).docLoad((postData: IPostCallbackData) => {
			if (!postData || !Object.keys(postData).length) {
				return callback(null, undefined);
			}

			// const keys = Object.keys()
			const { likes, comments, media, ...restPost } = postData;
			// convert likes into an array with keys
			const postLikes = convertLikesToArray(likes);
			// convert comments and their likes into an array with keys
			const postComments: any = convertCommentsToArray(comments);
			// convert media to an array
			const mediaReturn = convertMediaToArray(media) || [];

			const post: IPostReturnData = {
				postId: postPath.split('.').reverse()[0],
				likes: postLikes,
				comments: postComments,
				media: mediaReturn,
				...restPost,
			};
			return callback(null, post);
		});
	};
	postHandles.postByPath(context, postPath).once(
		() => {
			mainGetter();
		},
		{ wait: 300 },
	);
};

export const getPostById = (
	context: IContext,
	{ postId }: { postId: string },
	callback: IGunCallback<IPostReturnData>,
) => {
	postHandles.postMetaById(context, postId).once((postMeta: IPostMetasCallback) => {
		if (!postMeta || !Object.keys(postMeta).length) {
			return callback(
				new ApiError('failed, no post was found with this id', {
					initialRequestBody: { postId },
				}),
			);
		}
		const { postPath } = postMeta;

		getPostByPath(context, { postPath }, callback);
	});
};

const getAllPostRelevantData = (
	context: IContext,
	datePath: string,
	{ timeout, wait, tries }: { timeout: number; wait: number; tries: number },
	callback: IGunCallback<IPostArrayData>,
) =>
	postHandles.postsByDate(context, datePath).docLoad(
		(postsData: IPostsDataCallback) => {
			if (!postsData || !Object.keys(postsData).length) {
				return callback(null, []);
			}

			const allPosts: any = Object.entries(postsData).map(([key, value]) => {
				return {
					...value,
					postId: key,
				};
			});

			let shouldWaitAndTryAgain = false;
			const posts = allPosts
				.map((post: IPostCallbackData & { k: string }) => {
					// convert likes into an array with keys
					const postLikes = convertLikesToArray(post.likes);
					// convert comments and their likes into an array with keys
					const postComments: ICommentData[] = convertCommentsToArray(post.comments);
					// Convert media to an array
					const mediaReturn = convertMediaToArray(post.media) || [];

					// If we don't get data proper data i.e. a hashtag key is present,
					// stop current operation, append 100 to both timeout and wait
					// Try again the current operation
					[postLikes, postComments, mediaReturn].forEach((propArray: any = []) => {
						if (propArray && propArray.length) {
							propArray.forEach((obj: any) => {
								if (obj && typeof obj === 'object' && Object.keys(obj).includes('#')) {
									shouldWaitAndTryAgain = true;
								}
							});
						}
					});
					// related to the retry checks
					if (
						post.owner &&
						typeof post.owner === 'object' &&
						Object.keys(post.owner).length === 0
					) {
						shouldWaitAndTryAgain = true;
					}

					const { likes, comments, media, ...postRest } = post;
					if (postRest.owner) {
						return {
							...postRest,
							likes: postLikes,
							comments: postComments,
							media: mediaReturn,
						};
					} else {
						return null;
					}
				})
				.filter((post: any) => post !== null);

			if (!shouldWaitAndTryAgain) {
				return callback(null, posts);
			}

			getAllPostRelevantData(
				context,
				datePath,
				{ timeout: timeout + 100, wait: wait + 100, tries: tries + 1 },
				callback,
			);
		},
		{ timeout, wait },
	);

const getAllFriendsPostRelevantData = (
	context: IContext,
	datePath: string,
	friends: string[],
	{ timeout, wait, tries }: { timeout: number; wait: number; tries: number },
	callback: IGunCallback<IPostArrayData>,
) =>
	postHandles.postsByDate(context, datePath).docLoad(
		(postsData: IPostsDataCallback) => {
			if (!postsData || !Object.keys(postsData).length) {
				return callback(null, []);
			}

			const allPosts: any = Object.entries(postsData)
				.map(([key, value]) => {
					if (!value.owner) {
						// deleted posts
						return null;
					}
					if (friends.includes(value.owner.alias)) {
						return {
							...value,
							postId: key,
						};
					} else {
						return null;
					}
				})
				.filter((a) => a !== null);

			if (!allPosts.length) {
				return callback(null, []);
			}

			let shouldWaitAndTryAgain = false;
			const posts = allPosts
				.map((post: IPostCallbackData & { k: string }) => {
					// convert likes into an array with keys
					const postLikes = convertLikesToArray(post.likes);
					// convert comments and their likes into an array with keys
					const postComments: ICommentData[] = convertCommentsToArray(post.comments);
					// Convert media to an array
					const mediaReturn = convertMediaToArray(post.media) || [];

					// If we don't get data proper data i.e. a hashtag key is present,
					// stop current operation, append 100 to both timeout and wait
					// Try again the current operation
					[postLikes, postComments, mediaReturn].forEach((propArray: any = []) => {
						if (propArray && propArray.length) {
							propArray.forEach((obj: any) => {
								if (obj && typeof obj === 'object' && Object.keys(obj).includes('#')) {
									shouldWaitAndTryAgain = true;
								}
							});
						}
					});
					// related to the retry checks
					if (
						post.owner &&
						typeof post.owner === 'object' &&
						Object.keys(post.owner).length === 0
					) {
						shouldWaitAndTryAgain = true;
					}

					const { likes, comments, media, ...postRest } = post;
					if (postRest.owner) {
						return {
							...postRest,
							likes: postLikes,
							comments: postComments,
							media: mediaReturn,
						};
					} else {
						return null;
					}
				})
				.filter((post: any) => post !== null);

			if (!shouldWaitAndTryAgain) {
				return callback(null, posts);
			}

			getAllFriendsPostRelevantData(
				context,
				datePath,
				friends,
				{ timeout: timeout + 100, wait: wait + 100, tries: tries + 1 },
				callback,
			);
		},
		{ timeout, wait },
	);

export const getPublicPostsByDate = (
	context: IContext,
	{ date }: { date: Date },
	callback: IGunCallback<IPostArrayData>,
) => {
	const datePath = datePathFromDate(date);
	getAllPostRelevantData(context, datePath, { timeout: 700, wait: 300, tries: 0 }, callback);
};

export const getPublicFriendsPostsByDate = (
	context: IContext,
	{ date, friends }: { date: Date; friends: string[] },
	callback: IGunCallback<IPostArrayData>,
) => {
	const datePath = datePathFromDate(date);
	getAllFriendsPostRelevantData(
		context,
		datePath,
		friends,
		{ timeout: 700, wait: 300, tries: 0 },
		callback,
	);
};

// TODO: switch away from time iteration to post id/name meta
const recursiveSearchForPosts = (
	context: IContext,
	{ startTimestamp, daysBack }: { startTimestamp: number; daysBack: number },
	callback: IGunCallback<IPostArrayData>,
) => {
	if (daysBack > 5) {
		return callback(null, []);
	}
	const nextDate = moment(startTimestamp)
		.subtract(daysBack, 'd')
		.toDate();

	getPublicPostsByDate(context, { date: nextDate }, (err, posts) => {
		if (err) {
			return callback(err);
		}
		if (posts && posts.length) {
			return callback(null, posts);
		}
		return recursiveSearchForPosts(context, { startTimestamp, daysBack: daysBack + 1 }, callback);
	});
};

// TODO: switch away from time iteration to post id/name meta
const recursiveSearchForFriendsPosts = (
	context: IContext,
	{
		startTimestamp,
		daysBack,
		friends,
	}: { startTimestamp: number; daysBack: number; friends: string[] },
	callback: IGunCallback<IPostArrayData>,
) => {
	if (daysBack > 10) {
		return callback(null, []);
	}
	const nextDate = moment(startTimestamp)
		.subtract(daysBack, 'd')
		.toDate();

	getPublicFriendsPostsByDate(context, { date: nextDate, friends }, (err, posts) => {
		if (err) {
			return callback(err);
		}
		if (posts && posts.length) {
			return callback(null, posts);
		}
		return recursiveSearchForFriendsPosts(
			context,
			{ startTimestamp, daysBack: daysBack + 1, friends },
			callback,
		);
	});
};

export const getMostRecentFriendsPosts = (
	context: IContext,
	{ timestamp }: { timestamp: number },
	callback: IGunCallback<IPostArrayData>,
) => {
	profileHandles.currentProfileFriendsRecord(context).once((friendsCallback: IMetasCallback) => {
		if (!friendsCallback) {
			return callback(null, []);
		}
		const friendsNames = Object.keys(cleanGunMetaFromObject(friendsCallback));
		return recursiveSearchForFriendsPosts(
			context,
			{ startTimestamp: timestamp, daysBack: 0, friends: friendsNames },
			callback,
		);
	});
};

export const getMostRecentPosts = (
	context: IContext,
	{ timestamp }: { timestamp: number },
	callback: IGunCallback<IPostArrayData>,
) => {
	return recursiveSearchForPosts(context, { startTimestamp: timestamp, daysBack: 0 }, callback);
};

export default {
	getMostRecentPosts,
	getMostRecentFriendsPosts,
	getPostByPath,
	getPostById,
	getPostPathsByUser,
	getPublicPostsByDate,
	fastGetPostByPath,
};
