import React from 'react';
import { ActivityIndicator, SafeAreaView, Text, View } from 'react-native';
import Modal from 'react-native-modal';

import { WithManagedTransitions } from '..';
import { ITranslatedProps } from '../../types';

import styles, { defaultColor } from './OfflineOverlay.style';

interface IProps extends ITranslatedProps {
	visible: boolean;
}

export const OfflineOverlay: React.SFC<IProps> = ({ visible, getText }) => (
	<WithManagedTransitions modalVisible={visible}>
		{({ onDismiss, onModalHide }) => (
			<Modal
				onDismiss={onDismiss}
				onModalHide={onModalHide}
				isVisible={visible}
				backdropOpacity={0.5}
				animationIn="slideInDown"
				animationOut="slideOutUp"
				style={styles.container}
			>
				<SafeAreaView>
					<View style={styles.boxContainer}>
						<ActivityIndicator size="small" color={defaultColor} />
						<Text style={styles.message}>{getText('offline.overlay.message')}</Text>
					</View>
				</SafeAreaView>
			</Modal>
		)}
	</WithManagedTransitions>
);
