import * as React from 'react';
import { Keyboard, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import { OS_TYPES } from '../../environment/consts';
import style, { defaultStyles } from './PrimaryTextInput.style';

export enum TKeyboardKeys {
	default = 'default',
	numeric = 'numeric',
	emailAddress = 'email-address',
	phonePad = 'phone-pad',
}

export enum TRKeyboardKeys {
	done = 'done',
	next = 'next',
	search = 'search',
	send = 'send',
	go = 'go',
	default = 'default',
}

export enum InputSizes {
	Small = 'Small',
	Normal = 'Normal',
	Large = 'Large',
}

interface IPrimaryTextInputProps {
	width: number;
	icon: string;
	iconColor: string;
	placeholder: string;
	placeholderColor: string;
	disabled: boolean;
	isPassword: boolean;
	keyboardType: TKeyboardKeys;
	returnKeyType: TRKeyboardKeys;
	cancelButtonTextColor: string;
	canCancel: boolean;
	hasFocus: boolean;
	blurOnSubmit: boolean;
	borderColor: string;
	numberOfLines: number;
	value: string;
	autoFocus: boolean;
	size: InputSizes;
	borderWidth: number;
	multiline: boolean;
	autoCorrect: boolean;
	autoCapitalize: 'none' | 'sentences' | 'characters' | 'words';
	persistCancel: boolean;
	persistKeyboard: boolean;
	onSubmitPressed: (event: any) => void;
	onChangeText: (value: string) => void;
	onSetFocus: (hasFocus: boolean) => void;
	onPressCancel: () => void;
	onBlur?: () => void;
}

interface IPrimaryTextInputState {
	hasFocus: boolean;
	iconColor: string;
}

const InputIcon: React.SFC<{
	size: InputSizes;
	icon: string;
	iconColor: string;
}> = ({ size, icon, iconColor }) => {
	let iconHeight = defaultStyles.iconHeightNormal;

	if (size === InputSizes.Small) {
		iconHeight = defaultStyles.iconHeightSmall;
	} else if (size === InputSizes.Large) {
		iconHeight = defaultStyles.iconHeightLarge;
	}

	return (
		<View style={[style.iconContainer, style['iconContainer' + size]]}>
			<Icon name={icon} size={iconHeight} color={iconColor} />
		</View>
	);
};

const CancelButton: React.SFC<{
	persistCancel: boolean;
	canCancel: boolean;
	hasFocus: boolean;
	onPressCancel: () => void;
	cancelButtonTextColor: string;
}> = ({ persistCancel, canCancel, hasFocus, onPressCancel, cancelButtonTextColor }) => {
	if (persistCancel && canCancel && Platform.OS === OS_TYPES.IOS) {
		return (
			<TouchableOpacity style={style.cancelButton} onPress={onPressCancel}>
				<Text style={[style.cancelButtonText, { color: cancelButtonTextColor }]}>Cancel</Text>
			</TouchableOpacity>
		);
	} else if (hasFocus && canCancel && Platform.OS === OS_TYPES.IOS) {
		return (
			<TouchableOpacity
				style={style.cancelButton}
				onPress={() => {
					Keyboard.dismiss();
					onPressCancel();
				}}
			>
				<Text style={[style.cancelButtonText, { color: cancelButtonTextColor }]}>Cancel</Text>
			</TouchableOpacity>
		);
	}

	return null;
};

export class PrimaryTextInput extends React.Component<
	IPrimaryTextInputProps,
	IPrimaryTextInputState
> {
	public static defaultProps = {
		width: 0,
		icon: '',
		value: '',
		iconColor: defaultStyles.defaultIconColor,
		placeholder: '',
		placeholderColor: defaultStyles.defaultPlaceholderColor,
		disabled: false,
		isPassword: false,
		keyboardType: TKeyboardKeys.default,
		returnKeyType: TRKeyboardKeys.default,
		cancelButtonTextColor: defaultStyles.defaultCancelTextColor,
		canCancel: false,
		hasFocus: false,
		blurOnSubmit: false,
		borderColor: defaultStyles.defaultBorderColor,
		numberOfLines: 1,
		autoFocus: false,
		size: InputSizes.Normal,
		borderWidth: defaultStyles.defaultBorderWidth,
		multiline: false,
		autoCorrect: false,
		autoCapitalize: 'none',
		persistCancel: false,
		persistKeyboard: false,
		onSetFocus: () => undefined,
		onPressCancel: () => undefined,
		onChangeText: () => undefined,
		onSubmitPressed: () => undefined,
		onBlur: () => undefined,
	};

	public state = {
		hasFocus: false,
		iconColor: defaultStyles.defaultIconColor,
	};

	private inputRef: React.RefObject<TextInput> = React.createRef();

	public render() {
		const {
			icon,
			size,
			width,
			disabled,
			canCancel,
			cancelButtonTextColor,
			onPressCancel,
			persistCancel,
			autoFocus,
			returnKeyType,
			isPassword,
			keyboardType,
			placeholder,
			placeholderColor,
			autoCorrect,
			autoCapitalize,
			blurOnSubmit,
			numberOfLines,
			multiline,
			value,
			borderColor,
			borderWidth,
			persistKeyboard,
			onBlur,
			onChangeText,
			onSubmitPressed,
		} = this.props;
		const { hasFocus } = this.state;

		const isMultiLine = numberOfLines > 1 || multiline;
		const inputContainerStyles = [style.inputContainer, { borderColor, borderWidth }];
		const textInputStyles = [
			style.textInput,
			style['textInput' + size],
			...(isMultiLine ? [style.multilineTextInput, { height: 'auto' }] : []),
		];

		return (
			<View style={[style.container, width ? { width } : {}, disabled ? style.disabledInput : {}]}>
				<View style={inputContainerStyles}>
					{icon !== '' && <InputIcon icon={icon} iconColor={this.state.iconColor} size={size} />}
					<TextInput
						allowFontScaling={false}
						autoFocus={autoFocus}
						value={value || ''}
						onChangeText={onChangeText}
						onSubmitEditing={(event) => {
							onSubmitPressed(event);
							if (!persistKeyboard) {
								Keyboard.dismiss();
							}
						}}
						ref={this.inputRef}
						onFocus={() => this.setFocusHandler(true)}
						onBlur={() => {
							this.setFocusHandler(false);
							if (onBlur) {
								onBlur();
							}
						}}
						returnKeyType={returnKeyType}
						editable={!disabled}
						secureTextEntry={isPassword}
						keyboardType={keyboardType}
						style={textInputStyles}
						placeholder={placeholder}
						placeholderTextColor={placeholderColor}
						autoCorrect={autoCorrect}
						underlineColorAndroid={defaultStyles.defaultUnderlineColorAndroid}
						autoCapitalize={autoCapitalize}
						clearButtonMode="while-editing" // only works on iOS
						blurOnSubmit={blurOnSubmit}
						numberOfLines={numberOfLines}
						multiline={isMultiLine}
					/>
				</View>
				<CancelButton
					canCancel={canCancel}
					hasFocus={hasFocus}
					cancelButtonTextColor={cancelButtonTextColor}
					onPressCancel={onPressCancel}
					persistCancel={persistCancel}
				/>
			</View>
		);
	}

	public focusInput = () => {
		if (this.inputRef.current) {
			this.inputRef.current.focus();
		}
	};

	private setFocusHandler = (value: boolean) => {
		this.setState({
			hasFocus: value,
			iconColor: value ? defaultStyles.defaultIconActiveColor : this.props.iconColor,
		});
		this.props.onSetFocus(value);
	};
}
