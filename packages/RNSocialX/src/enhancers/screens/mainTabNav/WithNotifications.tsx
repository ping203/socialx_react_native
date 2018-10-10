/**
 * TODO list:
 * 1. Props actions: checkNotification, acceptFriendRequest, declineFriendRequest, showConfirm, hideConfirm,
 * 2. LATER - Props data: refreshing, @Serkan: check if still needed?
 * 3. OBS: Only FRIEND_REQUEST and FRIEND_REQUEST_RESPONSE are implemented right now
 */

import * as React from 'react';
import { NOTIFICATION_TYPES } from '../../../environment/consts';
import {
	IConfirmActions,
	IConfirmationModalProps,
	INavigationParamsActions,
	ITranslatedProps,
} from '../../../types';

import { WithI18n } from '../../connectors/app/WithI18n';
import { WithNavigationParams } from '../../connectors/app/WithNavigationParams';
import { WithNotifications as WithNotificationsData } from '../../connectors/data/WithNotifications';
import { WithProfiles } from '../../connectors/data/WithProfiles';

const mock: IWithNotificationsEnhancedProps = {
	data: {
		notifications: [
			{
				requestId: '123tqa5',
				type: NOTIFICATION_TYPES.RECENT_COMMENT,
				avatarURL: 'https://placeimg.com/150/150/tech',
				fullName: 'Seth Saunders',
				timestamp: new Date(2018, 2, 12, 5, 51, 23),
				wallPosts: [
					{
						postThumbURL: 'https://placeimg.com/140/140/nature',
						postId: '11',
					},
					{
						postThumbURL: 'https://placeimg.com/141/141/nature',
						postId: '22',
					},
					{
						postThumbURL: 'https://placeimg.com/142/142/nature',
						postId: '33',
					},
					{
						postThumbURL: 'https://placeimg.com/143/143/nature',
						postId: '44',
					},
					{
						postThumbURL: 'https://placeimg.com/144/144/nature',
						postId: '55',
					},
				],
			},
			{
				requestId: '981326537',
				type: NOTIFICATION_TYPES.FRIEND_REQUEST,
				avatarURL: 'https://placeimg.com/151/151/people',
				fullName: 'Teresa Lamb',
				userName: 'terlamb',
			},
			{
				requestId: '981326538',
				type: NOTIFICATION_TYPES.FRIEND_REQUEST_RESPONSE,
				avatarURL: 'https://placeimg.com/160/160/people',
				fullName: 'Teresa Lamb',
				userName: 'terlamb',
			},
			{
				requestId: 'a24362',
				type: NOTIFICATION_TYPES.SUPER_LIKED,
				avatarURL: 'https://placeimg.com/152/152/tech',
				fullName: 'Cory Maxwell',
				timestamp: new Date(2018, 1, 24, 8, 23, 12),
				wallPosts: [
					{
						postThumbURL: 'https://placeimg.com/130/130/arch',
						postId: '130',
					},
					{
						postThumbURL: 'https://placeimg.com/131/131/arch',
						postId: '131',
					},
					{
						postThumbURL: 'https://placeimg.com/132/132/arch',
						postId: '132',
					},
					{
						postThumbURL: 'https://placeimg.com/133/133/arch',
						postId: '133',
					},
					{
						postThumbURL: 'https://placeimg.com/135/135/arch',
						postId: '134',
					},
				],
			},
			{
				requestId: '990325',
				type: NOTIFICATION_TYPES.GROUP_REQUEST,
				avatarURL: 'https://placeimg.com/150/150/tech',
				fullName: 'Claudia Kulmitzer',
				groupName: 'MfMJAkkAs2jLISYyv',
			},
		],
		refreshing: false,
	},
	actions: {
		showConfirm: (confirmationOptions: IConfirmationModalProps) => {
			/**/
		},
		hideConfirm: () => {
			/**/
		},
		loadNotifications: () => {
			/**/
		},
		checkNotification: (requestId: string) => {
			/**/
		},
		acceptFriendRequest: (requestId: string) => {
			/**/
		},
		declineFriendRequest: (requestId: string) => {
			/**/
		},
		setNavigationParams: () => {
			/**/
		},
		getText: (value: string, ...args: any[]) => value,
	},
};

interface INotificationData {
	requestId: string;
	type: NOTIFICATION_TYPES;
	fullName: string;
	avatarURL?: string;
	userName?: string;
	timestamp?: Date;
	text?: string;
	groupName?: string;
	wallPosts?: Array<{
		postThumbURL: string;
		postId: string;
	}>;
}

export interface IWithNotificationsEnhancedData {
	notifications: INotificationData[];
	refreshing: boolean;
}

export interface IWithNotificationsEnhancedActions
	extends ITranslatedProps,
		INavigationParamsActions,
		IConfirmActions {
	loadNotifications: () => void;
	checkNotification: (requestId: string) => void;
	acceptFriendRequest: (requestId: string) => void;
	declineFriendRequest: (requestId: string) => void;
}

interface IWithNotificationsEnhancedProps {
	data: IWithNotificationsEnhancedData;
	actions: IWithNotificationsEnhancedActions;
}

interface IWithNotificationsProps {
	children(props: IWithNotificationsEnhancedProps): JSX.Element;
}

interface IWithNotificationsState {}

export class WithNotifications extends React.Component<
	IWithNotificationsProps,
	IWithNotificationsState
> {
	render() {
		return (
			<WithI18n>
				{(i18nProps) => (
					<WithNavigationParams>
						{({ setNavigationParams }) => (
							<WithProfiles>
								{({ profiles }) => (
									<WithNotificationsData>
										{(notifcationsProps) => {
											return this.props.children({
												data: {
													...mock.data,
													notifications: notifcationsProps.notifications.map(
														(notification) => {
															const profile = profiles.find(
																(prof) => prof.pub === notification.from.pub,
															);

															return {
																requestId: notification.notificationId,
																type: notification.type,
																fullName: profile!.fullName,
																userName: notification.from.alias,
																avatarURL: profile!.avatar,
																timestamp: new Date(notification.timestamp),
															};
														},
													),
												},
												actions: {
													...mock.actions,
													loadNotifications: notifcationsProps.getNotifications,
													setNavigationParams,
													getText: i18nProps.getText,
												},
											});
										}}
									</WithNotificationsData>
								)}
							</WithProfiles>
						)}
					</WithNavigationParams>
				)}
			</WithI18n>
		);
	}
}
