import { StyleSheet } from 'react-native';
import { Fonts, Sizes } from '../../environment/theme';

const styles: any = {
	container: {
		flex: 1,
		paddingHorizontal: Sizes.smartHorizontalScale(25),
		paddingVertical: Sizes.smartVerticalScale(16),
	},
	title: {
		...Fonts.centuryGothicBold,
		fontSize: Sizes.smartHorizontalScale(20),
		marginBottom: Sizes.smartVerticalScale(10),
	},
};

export default StyleSheet.create(styles);
