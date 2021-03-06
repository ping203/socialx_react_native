import * as React from 'react';

import { INavigationProps } from '../../types';
import { ISettingsData, SettingsScreenView } from './SettingsScreen.view';

import {
	IWithSettingsEnhancedActions,
	IWithSettingsEnhancedData,
	WithSettings,
} from '../../enhancers/screens';
import { SCREENS } from '../../environment/consts';

type ISettingsScreenProps = INavigationProps &
	IWithSettingsEnhancedActions &
	IWithSettingsEnhancedData;

class Screen extends React.Component<ISettingsScreenProps> {
	public render() {
		const { currentUser, navigation, getText, showOptionsMenu } = this.props;

		return (
			<SettingsScreenView
				currentUser={currentUser}
				onSaveChanges={this.onSaveChangesHandler}
				onGoBack={() => this.onGoBackHandler(navigation)}
				onEditNodes={() => this.onEditNodesHandler(navigation)}
				showOptionsMenu={showOptionsMenu}
				getText={getText}
			/>
		);
	}

	private onSaveChangesHandler = async (user: ISettingsData) => {
		this.switchActivityIndicator(true);
		await this.props.updateUserProfile(user);
		this.switchActivityIndicator(false);
	};

	private onGoBackHandler = (navigation: any) => {
		navigation.goBack(null);
	};

	private onEditNodesHandler = (navigation: any) => {
		navigation.navigate(SCREENS.Nodes);
	};

	private switchActivityIndicator = (state: boolean) => {
		this.props.setGlobal({
			activity: {
				visible: state,
				title: this.props.getText('settings.progress.message'),
			},
		});
	};
}

export const SettingsScreen = ({ navigation, navigationOptions }: INavigationProps) => (
	<WithSettings>
		{({ data, actions }) => (
			<Screen
				navigation={navigation}
				navigationOptions={navigationOptions}
				{...data}
				{...actions}
			/>
		)}
	</WithSettings>
);
