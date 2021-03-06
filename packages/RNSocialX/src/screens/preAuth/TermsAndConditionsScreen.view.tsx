import * as React from 'react';
import { WebView } from 'react-native';
import { SafeAreaView } from 'react-navigation';

import { Header, HeaderButton } from '../../components';
import { ITranslatedProps } from '../../types';
import styles from './TermsAndConditionsScreen.style';

interface ITermsAndConditionsScreenViewProps extends ITranslatedProps {
	localSource: any;
	onGoBack: () => void;
}

export const TermsAndConditionsScreenView: React.SFC<ITermsAndConditionsScreenViewProps> = ({
	localSource,
	onGoBack,
	getText,
}) => (
	<SafeAreaView forceInset={{ top: 'never' }} style={styles.container}>
		<Header
			title={getText('terms.and.conditions.screen.title')}
			left={<HeaderButton iconName="ios-arrow-back" onPress={onGoBack} />}
		/>
		<WebView source={localSource} />
	</SafeAreaView>
);
