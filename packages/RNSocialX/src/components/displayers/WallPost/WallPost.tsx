import { isEqual } from 'lodash';
import * as React from 'react';
import {
	Animated,
	Clipboard,
	Dimensions,
	findNodeHandle,
	Keyboard,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	View,
} from 'react-native';
import { connect } from 'react-redux';

import { CommentCard, HeartAnimation, ReportProblem } from '../../';
import {
	CommentInput,
	Likes,
	PostText,
	TopComments,
	UserDetails,
	ViewAllComments,
	WallPostActions,
	WallPostMedia,
	WarnOffensiveContent,
} from './';

import {
	IWallPostEnhancedActions,
	IWallPostEnhancedData,
	WithWallPost,
} from '../../../enhancers/components/WithWallPost';
import { shapePost } from '../../../enhancers/helpers';
import {
	IWithLikingEnhancedActions,
	IWithLikingEnhancedData,
	IWithNavigationHandlersEnhancedActions,
	WithLiking,
	WithNavigationHandlers,
} from '../../../enhancers/intermediary';
import { IApplicationState, selectPost, selectProfile } from '../../../store';

import { OS_TYPES } from '../../../environment/consts';
import { Sizes } from '../../../environment/theme';
import { IComment, INavigationProps, IWallPost } from '../../../types';

import { PrimaryTextInput } from '../../inputs/PrimaryTextInput';
import styles, { SCREEN_WIDTH } from './WallPost.style';

interface IWallPostProps extends INavigationProps {
	postId: string;
	placeholderPostId?: string | null;
	commentInput?: boolean;
	isCommentsScreen?: boolean;
	keyboardRaised?: boolean;
	postContainerRef?: React.RefObject<View>;
	onCommentInputPress?: (y: number, h: number) => void;
}

interface IProps
	extends IWallPostProps,
		IWallPostEnhancedActions,
		IWallPostEnhancedData,
		IWithLikingEnhancedActions,
		IWithLikingEnhancedData,
		IWithNavigationHandlersEnhancedActions,
		INavigationProps {
	post: IWallPost;
}

interface IState {
	fullTextVisible: boolean;
	comment: string;
	commentInputFocused: boolean;
	commentInputWidth: Animated.Value;
	sendCommentIconPosition: Animated.Value;
	viewOffensiveContent: boolean;
	reportAProblem: boolean;
}

class Component extends React.Component<IProps, IState> {
	public state = {
		fullTextVisible: false,
		comment: '',
		commentInputFocused: false,
		commentInputWidth: new Animated.Value(SCREEN_WIDTH),
		sendCommentIconPosition: new Animated.Value(100),
		viewOffensiveContent: false,
		reportAProblem: false,
	};

	private scrollRef: React.RefObject<ScrollView> = React.createRef();
	private commentInputRef: React.RefObject<PrimaryTextInput> = React.createRef();
	private postRef: React.RefObject<View> = React.createRef();

	public shouldComponentUpdate(nextProps: IProps, nextState: IState) {
		return (
			this.state !== nextState ||
			this.props.heartAnimation !== nextProps.heartAnimation ||
			this.props.animationProgress !== nextProps.animationProgress ||
			!isEqual(this.props.post, nextProps.post)
		);
	}

	public render() {
		const {
			post,
			currentUser,
			commentInput,
			isCommentsScreen,
			keyboardRaised,
			animationProgress,
			heartAnimation,
			onLikePost,
			onDoubleTapLikePost,
			onViewLikes,
			onLikeComment,
			onViewComments,
			onViewImage,
			onViewUserProfile,
			onGoBack,
			getText,
			navigation,
		} = this.props;

		const {
			postId,
			postText,
			location,
			taggedFriends,
			timestamp,
			owner,
			media,
			commentIds,
			likeIds,
			topCommentIds,
			likedByCurrentUser,
			numberOfSuperLikes,
			numberOfWalletCoins,
			offensiveContent,
			creating,
		} = post;

		const {
			viewOffensiveContent,
			commentInputWidth,
			sendCommentIconPosition,
			fullTextVisible,
			comment,
			reportAProblem,
		} = this.state;

		const animationValues = {
			width: commentInputWidth,
			send: sendCommentIconPosition,
		};

		const isPhoneXOrAbove = Platform.OS === OS_TYPES.IOS && Dimensions.get('screen').height > 800;

		if (post) {
			return (
				<View
					ref={this.postRef}
					style={[
						styles.container,
						{ opacity: creating ? 0.5 : 1, paddingBottom: isCommentsScreen ? 10 : 16 },
					]}
				>
					{post.creating && <View style={styles.overlay} />}
					<UserDetails
						canBack={isCommentsScreen!}
						user={owner}
						timestamp={timestamp}
						taggedFriends={taggedFriends}
						location={location}
						onUserPress={onViewUserProfile}
						onShowOptions={this.onShowPostOptionsHandler}
						onGoBack={onGoBack}
						getText={getText}
					/>
					<ReportProblem
						visible={reportAProblem}
						onConfirm={(subject: string, description: string) =>
							this.onReportAProblemHandler(true, subject, description)
						}
						onDecline={() => this.onReportAProblemHandler(false)}
						getText={getText}
					/>
					{isCommentsScreen && (
						<React.Fragment>
							<ScrollView
								style={{ flex: 1 }}
								ref={this.scrollRef}
								onLayout={() => this.scrollRef.current && this.scrollRef.current.scrollToEnd()}
								onContentSizeChange={() =>
									this.scrollRef.current && this.scrollRef.current.scrollToEnd()
								}
							>
								<PostText
									text={postText}
									fullTextVisible={fullTextVisible}
									onShowFullText={this.onShowFullTextHandler}
									handleHashTag={() => undefined}
									handleUserTag={() => undefined}
									handleUrls={() => undefined}
									getText={getText}
								/>
								{media.length > 0 && (
									<View style={styles.media}>
										{heartAnimation && <HeartAnimation animationProgress={animationProgress} />}
										<WallPostMedia
											media={media}
											onMediaObjectView={(index: number) => onViewImage(media, index, postId)}
											onDoublePress={() => onDoubleTapLikePost(postId)}
											creating={creating}
											getText={getText}
										/>
									</View>
								)}
								<WallPostActions
									creating={creating}
									likedByCurrentUser={likedByCurrentUser}
									numberOfSuperLikes={numberOfSuperLikes}
									numberOfWalletCoins={numberOfWalletCoins}
									onLikePost={() => onLikePost(postId)}
									onCommentPress={() =>
										this.commentInputRef.current && this.commentInputRef.current.focusInput()
									}
									onSuperLikePress={() => undefined}
									onWalletCoinsPress={() => undefined}
								/>
								{likeIds.length > 0 && (
									<Likes
										alias={likeIds[likeIds.length - 1]}
										total={likeIds.length}
										onUserPress={onViewUserProfile}
										onViewLikes={() => onViewLikes(likeIds)}
										getText={getText}
									/>
								)}
								{commentIds.length > 0 &&
									commentIds.map((id) => (
										<CommentCard
											key={id}
											commentId={id}
											alias={currentUser.alias}
											pub={currentUser.pub}
											onLikeComment={onLikeComment}
											onUserPress={onViewUserProfile}
											onShowOptionsMenu={this.onShowCommentOptionsHandler}
											navigation={navigation}
											getText={getText}
										/>
									))}
							</ScrollView>
							<KeyboardAvoidingView
								behavior="padding"
								keyboardVerticalOffset={isPhoneXOrAbove ? 50 : 30}
								enabled={Platform.OS === OS_TYPES.IOS}
							>
								<CommentInput
									commentInputRef={this.commentInputRef}
									comment={comment}
									autoFocus={keyboardRaised}
									onCommentInputChange={this.onCommentInputChangeHandler}
									onSubmitComment={this.onSubmitCommentHandler}
									getText={getText}
								/>
							</KeyboardAvoidingView>
						</React.Fragment>
					)}
					{!isCommentsScreen && (
						<React.Fragment>
							<PostText
								text={postText}
								fullTextVisible={fullTextVisible}
								onShowFullText={this.onShowFullTextHandler}
								handleHashTag={() => undefined}
								handleUserTag={() => undefined}
								handleUrls={() => undefined}
								getText={getText}
							/>
							{media.length > 0 && (
								<View style={styles.media}>
									{heartAnimation && <HeartAnimation animationProgress={animationProgress} />}
									{(!offensiveContent || viewOffensiveContent) && (
										<WallPostMedia
											media={media}
											onMediaObjectView={(index: number) => onViewImage(media, index, postId)}
											onDoublePress={() => onDoubleTapLikePost(post.postId)}
											creating={creating}
											getText={getText}
										/>
									)}
									<WarnOffensiveContent
										getText={getText}
										onShowOffensiveContent={this.onShowOffensiveContentHandler}
										visible={offensiveContent && !viewOffensiveContent}
									/>
								</View>
							)}
							<WallPostActions
								creating={creating}
								likedByCurrentUser={likedByCurrentUser}
								numberOfSuperLikes={numberOfSuperLikes}
								numberOfWalletCoins={numberOfWalletCoins}
								onLikePost={() => onLikePost(postId)}
								onCommentPress={() => onViewComments(postId, true)}
								onSuperLikePress={() => undefined}
								onWalletCoinsPress={() => undefined}
							/>
							{likeIds.length > 0 && (
								<Likes
									alias={likeIds[likeIds.length - 1]}
									total={likeIds.length}
									onUserPress={onViewUserProfile}
									onViewLikes={() => onViewLikes(likeIds)}
									getText={getText}
								/>
							)}
							<ViewAllComments
								commentIds={commentIds}
								onCommentPress={() => onViewComments(postId, false)}
								getText={getText}
							/>
							<TopComments
								commentIds={topCommentIds}
								onUserPress={onViewUserProfile}
								onCommentPress={() => onViewComments(postId, false)}
							/>
							{!!commentInput && !creating && (
								<CommentInput
									feed={true}
									comment={comment}
									avatar={currentUser.avatar}
									animationValues={animationValues}
									onCommentInputChange={this.onCommentInputChangeHandler}
									onCommentInputPress={this.onCommentInputPressHandler}
									onCommentInputBlur={this.onCommentInputBlur}
									onSubmitComment={this.onSubmitCommentHandler}
									getText={getText}
								/>
							)}
						</React.Fragment>
					)}
				</View>
			);
		}

		return null;
	}

	private onCommentInputBlur = () => {
		const { commentInputFocused, commentInputWidth, sendCommentIconPosition } = this.state;

		if (commentInputFocused) {
			Animated.parallel([
				Animated.timing(commentInputWidth, {
					toValue: SCREEN_WIDTH,
					duration: 250,
				}),
				Animated.timing(sendCommentIconPosition, {
					toValue: 100,
					duration: 250,
					useNativeDriver: true,
				}),
			]).start();
			this.setState({ commentInputFocused: false });
		}
	};

	private onCommentInputPressHandler = () => {
		const { onCommentInputPress, postContainerRef } = this.props;
		const { commentInputFocused, commentInputWidth, sendCommentIconPosition } = this.state;

		if (!commentInputFocused) {
			if (onCommentInputPress && this.postRef.current && postContainerRef) {
				this.postRef.current.measureLayout(
					findNodeHandle(postContainerRef.current) as number,
					(x, y, w, h) => {
						onCommentInputPress(y, h);
					},
					() => undefined,
				);
			}

			Animated.parallel([
				Animated.timing(commentInputWidth, {
					toValue: SCREEN_WIDTH - Sizes.smartHorizontalScale(115),
					duration: 250,
				}),
				Animated.timing(sendCommentIconPosition, {
					toValue: 0,
					duration: 250,
					useNativeDriver: true,
				}),
			]).start();
			this.setState({ commentInputFocused: true });
		}
	};

	private onCommentInputChangeHandler = (comment: string) => {
		this.setState({ comment });
	};

	private onShowOffensiveContentHandler = () => {
		this.setState({
			viewOffensiveContent: true,
		});
	};

	private onShowPostOptionsHandler = () => {
		const { post, showOptionsMenu, getText } = this.props;

		const baseItems = [
			{
				label: getText('wall.post.menu.block.user'),
				icon: 'ios-close-circle',
				actionHandler: () => undefined,
			},
			{
				label: getText('wall.post.menu.report.problem'),
				icon: 'ios-warning',
				actionHandler: () => this.setState({ reportAProblem: true }),
			},
		];
		const deleteItem = {
			label: getText('wall.post.menu.delete.post'),
			icon: 'ios-trash',
			actionHandler: async () => {
				await this.props.onRemovePost(post.postId);
			},
		};

		const items = post.removable ? [...baseItems, deleteItem] : baseItems;
		showOptionsMenu(items);
	};

	private onShowFullTextHandler = () => {
		this.setState({
			fullTextVisible: true,
		});
	};

	private onSubmitCommentHandler = () => {
		const { post, currentUser, onSubmitComment } = this.props;
		const escapedCommentText = this.state.comment.replace(/\n/g, '\\n');

		this.setState({ comment: '' }, Keyboard.dismiss);
		onSubmitComment(escapedCommentText, currentUser.alias, currentUser.pub, post.postId);
	};

	private onShowCommentOptionsHandler = (comment: IComment) => {
		const { post, currentUser, showOptionsMenu, onRemoveComment, getText } = this.props;

		const baseItems = [
			{
				label: getText('comments.screen.advanced.menu.copy'),
				icon: 'ios-copy',
				actionHandler: () => Clipboard.setString(comment.text),
			},
		];
		const deleteItem = {
			label: getText('comments.screen.advanced.menu.delete'),
			icon: 'ios-trash',
			actionHandler: () => onRemoveComment(comment.commentId, post.postId),
		};

		const items =
			comment.owner.alias === currentUser.alias ? [...baseItems, deleteItem] : baseItems;
		showOptionsMenu(items);
	};

	private onReportAProblemHandler = async (
		confirm: boolean,
		subject?: string,
		description?: string,
	) => {
		if (confirm && subject && description) {
			this.props.onReportProblem(subject, description);
		} else {
			this.setState({ reportAProblem: false });
		}
	};
}

const EnhancedComponent: React.SFC<IProps> = (props) => (
	<WithWallPost>
		{(wallPost) => (
			<WithNavigationHandlers navigation={props.navigation}>
				{(nav) => (
					<WithLiking likedByCurrentUser={props.post.likedByCurrentUser || false}>
						{(likes) => (
							<Component
								{...props}
								{...wallPost.data}
								{...wallPost.actions}
								{...likes.data}
								{...likes.actions}
								{...nav.actions}
							/>
						)}
					</WithLiking>
				)}
			</WithNavigationHandlers>
		)}
	</WithWallPost>
);

const mapStateToProps = (state: IApplicationState, props: IWallPostProps) => {
	const storePost = selectPost(state.data.posts, props.postId);
	const profile = selectProfile(state.data.profiles, storePost.owner.alias);
	const currentUserAlias = state.auth.database.gun!.alias!;

	return {
		post: shapePost(storePost, profile, currentUserAlias),
	};
};

export const WallPost = connect(mapStateToProps)(EnhancedComponent as any);
