import * as React from 'react';
import { Image, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { NavigationScreenProp } from 'react-navigation';

import { IMAGE_PICKER_TYPES, SCREENS, TABS } from '../../environment/consts';
import { Icons } from '../../environment/theme';
import { INavigationParamsActions, IOptionsMenuProps, ITranslatedProps } from '../../types';
import {
	getCameraMediaObjectMultiple,
	getGalleryMediaObjectMultiple,
	getOptimizedMediaObject,
	IPickerImageMultiple,
} from '../../utilities';

import styles from './TabIcon.style';

interface ITabIconProps extends IOptionsMenuProps, INavigationParamsActions, ITranslatedProps {
	navigation: NavigationScreenProp<any>;
	focused: boolean;
	notifications: number;
}

export class TabIcon extends React.Component<ITabIconProps> {
	public render() {
		const { navigation, focused, notifications } = this.props;
		return (
			<SafeAreaView style={styles.container}>
				{this.getIcon(navigation.state.routeName, focused, notifications)}
			</SafeAreaView>
		);
	}

	private getIcon = (routeName: string, focused: boolean, notifications: number) => {
		let icon;
		switch (routeName) {
			case TABS.Feed:
				icon = (
					<Image
						source={focused ? Icons.iconTabBarHomeSelected : Icons.iconTabBarHome}
						resizeMode="contain"
						style={styles.icon}
					/>
				);
				break;
			case TABS.Search:
				icon = (
					<Image
						source={focused ? Icons.iconTabBarSearchSelected : Icons.iconTabBarSearch}
						resizeMode="contain"
						style={styles.icon}
					/>
				);
				break;
			case TABS.Notifications:
				icon = (
					<React.Fragment>
						<Image
							source={
								focused ? Icons.iconTabBarNotificationsSelected : Icons.iconTabBarNotifications
							}
							resizeMode="contain"
							style={styles.icon}
						/>
						{notifications > 0 ? (
							<View style={styles.background}>
								<Text style={styles.badge}>{notifications}</Text>
							</View>
						) : (
							<View />
						)}
					</React.Fragment>
				);
				break;
			case TABS.Profile:
				icon = (
					<Image
						source={focused ? Icons.iconTabBarProfileSelected : Icons.iconTabBarProfile}
						resizeMode="contain"
						style={styles.icon}
					/>
				);
				break;
			default:
				icon = (
					<TouchableOpacity activeOpacity={1} onPress={this.showPhotoOptionsMenu}>
						<Image source={Icons.iconTabBarPhoto} resizeMode="contain" style={styles.icon} />
					</TouchableOpacity>
				);
				break;
		}

		return icon;
	};

	private showPhotoOptionsMenu = () => {
		const { showOptionsMenu, getText } = this.props;

		const menuItems = [
			{
				label: getText('tab.bar.bottom.photo.picker.use.gallery'),
				icon: 'md-photos',
				actionHandler: () => this.onSelectOption(IMAGE_PICKER_TYPES.Gallery),
			},
			{
				label: getText('tab.bar.bottom.photo.picker.use.camera'),
				icon: 'md-camera',
				actionHandler: () => this.onSelectOption(IMAGE_PICKER_TYPES.Camera),
			},
		];
		showOptionsMenu(menuItems);
	};

	private onSelectOption = async (source: IMAGE_PICKER_TYPES) => {
		const { navigation, setNavigationParams } = this.props;

		let selectedmedia: IPickerImageMultiple = [];
		if (source === IMAGE_PICKER_TYPES.Gallery) {
			selectedmedia = await getGalleryMediaObjectMultiple();
		} else if (source === IMAGE_PICKER_TYPES.Camera) {
			selectedmedia = await getCameraMediaObjectMultiple();
		}

		if (selectedmedia.length > 0) {
			const optimizedmedia = await Promise.all(
				selectedmedia.map(async (obj) => getOptimizedMediaObject(obj)),
			);
			setNavigationParams({
				screenName: SCREENS.Photo,
				params: { media: optimizedmedia },
			});
			navigation.navigate(SCREENS.Photo);
		}
	};
}
