import hexRgb from 'hex-rgb';

// TODO: transform all RGB color to hex and rgba should use colorWithAlpha
export const Colors = {
	transparent: 'rgba(0,0,0,0)',
	white: '#FFFFFF',
	black: '#000000',
	red: '#FF0000',
	blackWithAlpha: (alpha: number) => {
		return 'rgba(0, 0, 0, ' + alpha + ')';
	},
	pink: '#ff0099',
	pinkLace: '#fecdec',
	background: '#4a5963',
	shuttleGray: '#54646e',
	paleSky: '#6D7886',
	cloudBurst: '#1F3149',
	postHour: '#039DE2',
	postButtonColor: '#AAAAAA',
	userAvatarFullName: '#006BFF',
	dustWhite: '#EEEEEE',
	grayText: '#9B9B9B',
	manatee: '#8F9095',
	fuchsiaBlue: '#814FBE',
	iron: '#D3D6DA',
	iron2: '#D6D9DE',
	rhino: '#273851',
	mercury: '#E5E5E5',
	alabaster: '#f7f7f7',
	green: '#43a324',
	geyser: '#D2DAE1',
	cadetBlue: '#A1B5C2',
	silverSand: '#BFC3C8',
	pigeonPost: '#A7BAD4',
	midnight: '#000F2B',
	catskillWhite: '#F0F3F8',
	sushi: '#79B933',
	grayNurse05: 'rgba(230,231,230,0.5)',
	grayNurse: '#E6E7E6',
	tundora: '#4A4A4A',
	ceriseRed: '#E0295A',
	dustGray: '#979797',
	gallery: '#efefef',
	monza: '#D0021B',
	blueMarguerite: '#6162C7',
	amethyst: '#9863D3',
	blueGem: '#4813A0',
	wildSand: '#F6F6F6',
	gray: '#808080',
	charade: '#2E333D',
};

export const colorWithAlpha = (color: string, alpha: number) => {
	const rgbValue = hexRgb(color);
	return `rgba(${rgbValue.red},${rgbValue.green},${rgbValue.blue},${alpha})`;
};

export const colorWithAlphaArray = (color: string, alpha: number) => {
	const rgbValue = hexRgb(color);
	return [rgbValue.red, rgbValue.green, rgbValue.blue, alpha];
};
