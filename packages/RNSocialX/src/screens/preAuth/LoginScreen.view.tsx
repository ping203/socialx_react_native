import {Formik, FormikErrors, FormikProps} from 'formik';
import * as React from 'react';
import {Keyboard, SafeAreaView, Text, TouchableOpacity, View} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

import {PrimaryButton, PrimaryTextInput, TKeyboardKeys, TRKeyboardKeys} from '../../components';
import {KeyboardContext} from '../../environment/consts';
import {ITranslatedProps} from '../../types';
import style, {customStyleProps} from './LoginScreen.style';

const passwordRef: React.RefObject<PrimaryTextInput> = React.createRef();
const usernameRef: React.RefObject<PrimaryTextInput> = React.createRef();

interface ILoginFormProps extends ITranslatedProps {
	onStartLogin: (username: string, password: string) => void;
}

interface LoginScreenData {
	username: string;
	password: string;
}

const LoginForm: React.SFC<ILoginFormProps> = ({getText, onStartLogin}) => (
	<KeyboardContext.Consumer>
		{({marginBottom, safeRunAfterKeyboardHide}) => (
			<Formik
				initialValues={{
					username: '',
					password: '',
				}}
				validate={({username, password}: LoginScreenData) => {
					const errors: FormikErrors<LoginScreenData> = {};
					if (!username) {
						errors.username = getText('login.username.required');
					}
					if (!password) {
						errors.password = getText('login.password.required');
					}
					return errors;
				}}
				onSubmit={(values: LoginScreenData) => {
					safeRunAfterKeyboardHide(() => onStartLogin(values.username, values.password));
					Keyboard.dismiss();
				}}
				render={({
					values: {username, password},
					errors,
					handleBlur,
					handleSubmit,
					isValid,
					touched,
					setFieldValue,
					setFieldTouched,
				}: FormikProps<LoginScreenData>) => (
					<React.Fragment>
						<PrimaryTextInput
							placeholder={getText('login.username.input')}
							placeholderColor={customStyleProps.inputPlaceholderColor}
							returnKeyType={TRKeyboardKeys.next}
							keyboardType={TKeyboardKeys.emailAddress}
							value={username}
							onChangeText={(value: string) => {
								setFieldValue('username', value);
								setFieldTouched('username');
							}}
							focusUpdateHandler={(hasFocus) => !hasFocus && setFieldTouched('username')}
							onSubmitPressed={() => passwordRef.current && passwordRef.current.focusInput()}
							ref={usernameRef}
						/>
						{touched.username && errors.username && <Text style={style.errorText}>{errors.username}</Text>}
						<View style={style.passwordContainer}>
							<PrimaryTextInput
								placeholder={getText('login.password.input')}
								placeholderColor={customStyleProps.inputPlaceholderColor}
								returnKeyType={TRKeyboardKeys.go}
								onSubmitPressed={handleSubmit}
								isPassword={true}
								blurOnSubmit={true}
								value={password}
								onChangeText={(value: string) => {
									setFieldValue('password', value);
									setFieldTouched('password');
								}}
								focusUpdateHandler={(hasFocus) => !hasFocus && setFieldTouched('password')}
								ref={passwordRef}
							/>
							{touched.password && errors.password && <Text style={style.errorText}>{errors.password}</Text>}
						</View>
						<View style={style.fullWidth}>
							// @ts-ignore
							<PrimaryButton
								label={getText('login.login.button')}
								onPress={handleSubmit}
								disabled={!isValid}
								borderColor={customStyleProps.borderTransparent}
							/>
						</View>
					</React.Fragment>
				)}
			/>
		)}
	</KeyboardContext.Consumer>
);

interface ILoginScreenViewProps extends ITranslatedProps {
	onStartLogin: (username: string, password: string) => void;
	onNavigateToPasswordForgot: () => void;
	onNavigateToRegister: () => void;
	onNavigateToUploadKey: () => void;
}

export const LoginScreenView: React.SFC<ILoginScreenViewProps> = ({
	onStartLogin,
	onNavigateToPasswordForgot,
	onNavigateToRegister,
	onNavigateToUploadKey,
	getText,
}) => (
	<SafeAreaView style={style.safeAreaContainer}>
		<KeyboardAwareScrollView
			style={style.keyboardView}
			contentContainerStyle={style.container}
			alwaysBounceVertical={false}
			keyboardDismissMode={'interactive'}
			keyboardShouldPersistTaps={'handled'}
		>
			{/*<InputSMSCodeModal
				visible={showModalForSMSCode}
				confirmHandler={onSmsCodeConfirmed}
				declineHandler={onSmsCodeDeclined}
				resendHandler={onSmsCodeResend}
				phoneNumber={phoneNumber}
				errorMessage={'Test123'}
				getText={getText}
			/>*/}
			<Text style={style.welcomeText}>{getText('login.welcome.message')}</Text>
			<LoginForm getText={getText} onStartLogin={onStartLogin} />
			<TouchableOpacity onPress={onNavigateToPasswordForgot} style={style.forgotPassword}>
				<Text style={style.forgotPasswordText}>{getText('login.forgot.password')}</Text>
			</TouchableOpacity>
			// @ts-ignore
			<PrimaryButton
				label={getText('login.use.unlock.file')}
				onPress={onNavigateToUploadKey}
				borderColor={customStyleProps.borderTransparent}
				disabled={false}
			/>
			<View style={style.noAccountContainer}>
				<Text style={style.noAccountQuestion}>{getText('login.no.account.text')}</Text>
				<TouchableOpacity onPress={onNavigateToRegister}>
					<Text style={style.signUpText}>{getText('login.signUp.button')}</Text>
				</TouchableOpacity>
			</View>
		</KeyboardAwareScrollView>
	</SafeAreaView>
);