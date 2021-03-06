import { Formik, FormikErrors, FormikProps } from 'formik';
import { CheckBox } from 'native-base';
import * as React from 'react';
import { Keyboard, Text, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { string } from 'yup';

import {
	AvatarPicker,
	Header,
	HeaderButton,
	PrimaryButton,
	PrimaryTextInput,
	TKeyboardKeys,
	TRKeyboardKeys,
} from '../../components';
import { IOptionsMenuProps, ITranslatedProps } from '../../types';

import style, { colors } from './RegisterScreen.style';

export interface IRegisterData {
	email: string;
	name: string;
	alias: string;
	password: string;
	avatar: {
		uri: string;
	};
}

interface IRegisterFormData extends IRegisterData {
	confirmPassword: string;
	termsAccepted: boolean;
}

interface IRegisterScreenViewProps extends ITranslatedProps, IOptionsMenuProps {
	onRegister: (user: IRegisterData) => void;
	onNavigateToTermsAndConditions: () => void;
	onGoBack: () => void;
}

const nameRef: React.RefObject<PrimaryTextInput> = React.createRef();
const usernameRef: React.RefObject<PrimaryTextInput> = React.createRef();
const passwordRef: React.RefObject<PrimaryTextInput> = React.createRef();
const confirmPasswordRef: React.RefObject<PrimaryTextInput> = React.createRef();

const EMAIL_SCHEMA = string().email();

const ErrorMessage: React.SFC<{ text: any; visible: boolean }> = ({ text, visible }) => (
	<React.Fragment>
		{visible && (
			<View style={style.errorContainer}>
				<Text style={style.errorText}>{text}</Text>
			</View>
		)}
	</React.Fragment>
);

export const RegisterScreenView: React.SFC<IRegisterScreenViewProps> = ({
	onRegister,
	onNavigateToTermsAndConditions,
	onGoBack,
	showOptionsMenu,
	getText,
}) => (
	<View style={{ flex: 1 }}>
		<Header
			title={getText('register.screen.title')}
			left={<HeaderButton iconName="ios-arrow-back" onPress={onGoBack} />}
		/>
		<KeyboardAwareScrollView
			style={style.keyboardView}
			contentContainerStyle={style.container}
			alwaysBounceVertical={false}
			keyboardShouldPersistTaps="handled"
			enableOnAndroid={true}
		>
			<Formik
				initialValues={{
					email: '',
					name: '',
					alias: '',
					password: '',
					confirmPassword: '',
					avatar: {
						uri: '',
					},
					termsAccepted: false,
				}}
				validate={({
					email,
					name,
					alias,
					password,
					confirmPassword,
					termsAccepted,
				}: IRegisterFormData) => {
					const errors: FormikErrors<IRegisterFormData> = {};
					if (!email) {
						errors.email = getText('register.screen.email.required');
					} else if (!EMAIL_SCHEMA.isValidSync(email)) {
						errors.email = getText('register.screen.email.invalid');
					}
					if (!name) {
						errors.name = getText('register.screen.name.required');
					} else if (name.length < 4) {
						errors.name = getText('register.screen.name.length');
					}
					if (!alias) {
						errors.alias = getText('register.screen.username.required');
					} else if (alias.length < 6) {
						errors.alias = getText('register.screen.username.length');
					}
					if (!password) {
						errors.password = getText('register.screen.password.required');
					} else if (password.length < 6) {
						errors.password = getText('register.screen.password.length');
					}
					if (!confirmPassword) {
						errors.confirmPassword = getText('register.screen.password.required');
					} else if (!errors.password && confirmPassword !== password) {
						errors.confirmPassword = getText('register.screen.password.mismatch');
					}
					if (!termsAccepted) {
						errors.termsAccepted = getText('register.screen.terms.accepted');
					}
					return errors;
				}}
				onSubmit={({ termsAccepted, ...data }: IRegisterFormData) => {
					onRegister(data);
					Keyboard.dismiss();
				}}
				render={({
					values: { email, name, alias, password, confirmPassword, termsAccepted, avatar },
					errors,
					handleSubmit,
					isValid,
					touched,
					setFieldValue,
					setFieldTouched,
				}: FormikProps<IRegisterFormData>) => (
					<React.Fragment>
						<View style={style.avatarPickerContainer}>
							<AvatarPicker
								image={avatar.uri}
								afterImagePick={(path: string) => setFieldValue('avatar', { uri: path }, false)}
								showOptionsMenu={showOptionsMenu}
								getText={getText}
							/>
						</View>
						<View style={[style.textInputContainer, style.textInputContainerFirst]}>
							<PrimaryTextInput
								icon="ios-mail"
								placeholder={getText('register.email')}
								placeholderColor={colors.paleSky}
								borderColor={colors.transparent}
								returnKeyType={TRKeyboardKeys.next}
								keyboardType={TKeyboardKeys.emailAddress}
								value={email}
								persistKeyboard={true}
								onChangeText={(value: string) => {
									setFieldValue('email', value);
									setFieldTouched('email');
								}}
								onSubmitPressed={() => nameRef.current && nameRef.current.focusInput()}
							/>
							<ErrorMessage text={errors.email} visible={!!touched.email && !!errors.email} />
						</View>
						<View style={style.textInputContainer}>
							<PrimaryTextInput
								autoCapitalize="words"
								icon="md-person"
								placeholder={getText('register.name')}
								placeholderColor={colors.paleSky}
								borderColor={colors.transparent}
								returnKeyType={TRKeyboardKeys.next}
								value={name}
								ref={nameRef}
								persistKeyboard={true}
								onChangeText={(value: string) => {
									setFieldValue('name', value);
									setFieldTouched('name');
								}}
								onSubmitPressed={() => usernameRef.current && usernameRef.current.focusInput()}
							/>
							<ErrorMessage text={errors.name} visible={!!touched.name && !!errors.name} />
						</View>
						<View style={style.textInputContainer}>
							<PrimaryTextInput
								icon="md-person"
								placeholder={getText('register.username')}
								placeholderColor={colors.paleSky}
								borderColor={colors.transparent}
								returnKeyType={TRKeyboardKeys.next}
								value={alias}
								ref={usernameRef}
								persistKeyboard={true}
								onChangeText={(value: string) => {
									setFieldValue('alias', value);
									setFieldTouched('alias');
								}}
								onSubmitPressed={() => passwordRef.current && passwordRef.current.focusInput()}
							/>
							<ErrorMessage text={errors.alias} visible={!!touched.alias && !!errors.alias} />
						</View>
						<View style={style.textInputContainer}>
							<PrimaryTextInput
								isPassword={true}
								icon="ios-lock"
								placeholder={getText('register.password')}
								placeholderColor={colors.paleSky}
								borderColor={colors.transparent}
								returnKeyType={TRKeyboardKeys.next}
								value={password}
								ref={passwordRef}
								persistKeyboard={true}
								onChangeText={(value: string) => {
									setFieldValue('password', value);
									setFieldTouched('password');
								}}
								onSubmitPressed={() =>
									confirmPasswordRef.current && confirmPasswordRef.current.focusInput()
								}
							/>
							<ErrorMessage
								text={errors.password}
								visible={!!touched.password && !!errors.password}
							/>
						</View>
						<View style={style.textInputContainer}>
							<PrimaryTextInput
								isPassword={true}
								icon="ios-lock"
								placeholder={getText('register.confirm.password')}
								placeholderColor={colors.paleSky}
								borderColor={colors.transparent}
								returnKeyType={TRKeyboardKeys.done}
								value={confirmPassword}
								ref={confirmPasswordRef}
								blurOnSubmit={true}
								onChangeText={(value: string) => {
									setFieldValue('confirmPassword', value);
									setFieldTouched('confirmPassword');
								}}
							/>
							<ErrorMessage
								text={errors.confirmPassword}
								visible={!!touched.confirmPassword && !!errors.confirmPassword}
							/>
						</View>
						<View style={style.termsContainer}>
							<Text style={style.acceptText}>{getText('register.accept.part1')}</Text>
							<TouchableOpacity onPress={onNavigateToTermsAndConditions}>
								<Text style={style.acceptTextLink}>{getText('register.accept.part2')}</Text>
							</TouchableOpacity>
							<CheckBox
								checked={termsAccepted}
								onPress={() => setFieldValue('termsAccepted', !termsAccepted)}
								color={colors.pink}
								style={style.acceptCheckbox}
							/>
						</View>
						<View style={style.buttonContainer}>
							<PrimaryButton
								label={getText('register.button.label')}
								onPress={handleSubmit}
								disabled={!(isValid && termsAccepted)}
								borderColor={colors.transparent}
							/>
						</View>
					</React.Fragment>
				)}
			/>
		</KeyboardAwareScrollView>
	</View>
);
