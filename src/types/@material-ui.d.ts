import '@mui/material/styles';

interface BorderColors {
	default: string;
	hover: string;
	button: string;
	disabled: string;
}
interface TextColors {
	default: string;
	hover: string;
	button: string;
	disabled: string;
}
// Same semantic palette names as the React portfolio, with complete sx typings.
declare module '@mui/material/styles' {
	interface TypeBackground {
		card: string;
		button: string;
		hover: string;
		appBar: string;
		disabled: string;
	}
	interface PaletteOptions {
		border?: BorderColors;
		textColor?: TextColors;
	}
	interface Palette {
		border: BorderColors;
		textColor: TextColors;
	}
}
