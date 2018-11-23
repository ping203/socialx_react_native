/**
 * TODO list:
 * 1. Props actions: blockUser, reportProblem
 */

import * as React from 'react';

import { ActionTypes as AggActionTypes } from '../../../store/aggregations/posts/Types';
import { ActionTypes as ProfileActionTypes } from '../../../store/data/profiles/Types';
import { IError, IOptionsMenuProps, ITranslatedProps, IVisitedUser } from '../../../types';
import { getActivity } from '../../helpers';

import { IPostReturnData } from '../../../store/aggregations/posts';
import { WithAggregations } from '../../connectors/aggregations/WithAggregations';
import { WithI18n } from '../../connectors/app/WithI18n';
import { WithProfiles } from '../../connectors/data/WithProfiles';
import { WithActivities } from '../../connectors/ui/WithActivities';
import { WithOverlays } from '../../connectors/ui/WithOverlays';
import { WithCurrentUser, WithVisitedUserContent } from '../intermediary';

export interface IWithUserProfileEnhancedData {
	currentUserId: string;
	visitedUser: IVisitedUser;
	userPosts: { [owner: string]: IPostReturnData[] };
	errors: IError[];
	loadingProfile: boolean;
	loadingPosts: boolean;
}

export interface IWithUserProfileEnhancedActions extends ITranslatedProps, IOptionsMenuProps {
	getProfileForUser: (userName: string) => void;
	getPostsForUser: (userName: string) => void;
	addFriend: (userId: string) => void;
}

interface IUserProfileEnhancedProps {
	data: IWithUserProfileEnhancedData;
	actions: IWithUserProfileEnhancedActions;
}

interface IWithUserProfileProps {
	children(props: IUserProfileEnhancedProps): JSX.Element;
}

interface IWithUserProfileState {}

export class WithUserProfile extends React.Component<IWithUserProfileProps, IWithUserProfileState> {
	render() {
		return (
			<WithI18n>
				{({ getText }) => (
					<WithOverlays>
						{({ showOptionsMenu }) => (
							<WithProfiles>
								{({ addFriend, getProfileByUsername }) => (
									<WithActivities>
										{({ activities, errors }) => (
											<WithAggregations>
												{({ getUserPosts, userPosts }) => (
													<WithCurrentUser>
														{({ currentUser }) => (
															<WithVisitedUserContent>
																{({ visitedUser }) =>
																	this.props.children({
																		data: {
																			currentUserId: currentUser!.userId,
																			visitedUser: visitedUser!,
																			userPosts,
																			errors,
																			loadingProfile: getActivity(
																				activities,
																				ProfileActionTypes.GET_PROFILE_BY_USERNAME,
																			),
																			loadingPosts: getActivity(
																				activities,
																				AggActionTypes.GET_USER_POSTS,
																			),
																		},
																		actions: {
																			getProfileForUser: async (username: string) => {
																				await getProfileByUsername({
																					username,
																				});
																			},
																			getPostsForUser: async (username: string) => {
																				await getUserPosts({ username });
																			},
																			addFriend: async (username) => {
																				await addFriend({
																					username,
																				});
																			},
																			showOptionsMenu: (items) =>
																				showOptionsMenu({
																					items,
																				}),
																			getText,
																		},
																	})
																}
															</WithVisitedUserContent>
														)}
													</WithCurrentUser>
												)}
											</WithAggregations>
										)}
									</WithActivities>
								)}
							</WithProfiles>
						)}
					</WithOverlays>
				)}
			</WithI18n>
		);
	}
}
