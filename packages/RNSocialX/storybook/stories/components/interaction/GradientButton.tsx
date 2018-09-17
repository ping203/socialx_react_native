import {storiesOf} from '@storybook/react-native';
import * as React from 'react';
import {Alert} from 'react-native';

import {ButtonSizes, GradientButton} from '../../../../src/components';
import {Colors} from '../../../../src/environment/theme';
import CenterView from '../../../helpers/CenterView';

storiesOf('Components/interaction', module)
	.addDecorator((getStory: any) => <CenterView>{getStory()}</CenterView>)
	.add('GradientButton', () => (
		// @ts-ignore
		<GradientButton
			label={'Button (Surprising, I know)'}
			disabled={false}
			onPress={() => Alert.alert('Pressed!')}
			size={ButtonSizes.Normal}
			autoWidth={true}
			borderColor={Colors.pink}
			textColor={Colors.white}
			loading={false}
			colorStart={Colors.pink}
			colorEnd={Colors.ceriseRed}
		/>
	));