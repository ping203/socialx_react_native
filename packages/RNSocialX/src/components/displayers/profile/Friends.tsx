import * as React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { connect } from 'react-redux';

import { IApplicationState, selectFriends } from '../../../store/selectors';
import { ITranslatedProps } from '../../../types';
import { Avatar } from './';

import styles from './Friends.style';

interface IFriendsProps extends ITranslatedProps {
	alias: string;
	tabs?: boolean;
	onViewFriends: (alias: string) => void;
}

interface IProps extends IFriendsProps {
	friends: string[];
}

export const Component: React.SFC<IProps> = ({ friends, alias, tabs, onViewFriends, getText }) => (
	<TouchableOpacity
		style={[styles.container, { borderBottomWidth: tabs ? 0 : 1 }]}
		onPress={() => onViewFriends(alias)}
	>
		<View style={styles.friends}>
			{friends.map((friend, index) => (
				<Avatar alias={friend} index={index} key={friend} />
			))}
		</View>
		<Text style={styles.text}>{getText('user.profile.screen.friends')}</Text>
	</TouchableOpacity>
);

const mapStateToProps = (state: IApplicationState, props: IFriendsProps) => {
	return {
		friends: selectFriends(state.data.profiles, props.alias),
	};
};

export const Friends = connect(mapStateToProps)(Component);
