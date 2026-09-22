import { type ThemeOptions } from '@mui/material';

// Matched to tass-suderman-portfolio-react/src/material-ui/themes/darkTheme.ts
// and its LinkButton component. Hardware glows remain semantic mapping colors.
export const colors = {
	background: '#080F1D',
	paper: '#111620',
	appBar: '#1F1F28',
	button: '#363646',
	hover: '#A4B9EF',
	border: '#957FB8',
	borderHover: '#7AA89F',
	disabled: '#565575',
	text: '#FFFFFF',
};
const darkTheme: ThemeOptions = {
	shadows: Array(25).fill('none') as ThemeOptions['shadows'],
	palette: {
		mode: 'dark',
		primary: { main: colors.hover, contrastText: colors.appBar },
		secondary: { main: colors.border },
		background: {
			default: colors.background,
			paper: colors.paper,
			card: colors.background,
			button: colors.button,
			hover: colors.hover,
			appBar: colors.appBar,
			disabled: '#2A2A3767',
		},
		border: {
			default: colors.border,
			button: colors.border,
			hover: colors.borderHover,
			disabled: colors.disabled,
		},
		textColor: {
			default: colors.text,
			button: colors.hover,
			hover: colors.appBar,
			disabled: colors.hover,
		},
		text: { primary: colors.text, secondary: colors.hover },
		divider: `${colors.border}55`,
	},
	typography: {
		fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
		button: { fontWeight: 500 },
	},
	shape: { borderRadius: 15 },
	components: {
		MuiButton: {
			styleOverrides: {
				root: {
					borderRadius: 15,
					padding: '10px 18px',
					border: `1px solid ${colors.border}`,
					backgroundColor: colors.button,
					color: colors.hover,
					'&:hover': {
						backgroundColor: colors.hover,
						color: colors.appBar,
						borderColor: colors.borderHover,
					},
					'&.Mui-disabled': {
						backgroundColor: '#2A2A3767',
						color: `${colors.hover}77`,
						borderColor: colors.disabled,
					},
				},
			},
		},
		MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
		MuiTextField: { defaultProps: { fullWidth: true } },
		MuiOutlinedInput: {
			styleOverrides: { notchedOutline: { borderColor: `${colors.border}88` } },
		},
		MuiTab: {
			styleOverrides: { root: { textTransform: 'none', minHeight: 70 } },
		},
		MuiListSubheader: {
			styleOverrides: {
				root: {
					color: colors.border,
					backgroundColor: colors.paper,
					fontWeight: 700,
				},
			},
		},
	},
};
export default darkTheme;
