import { createTheme, ThemeProvider, ScopedCssBaseline } from '@mui/material';
import darkTheme from './themes/darkTheme';
import Workspace from './components/Workspace/Workspace';
const theme = createTheme(darkTheme, {
	components: {
		MuiModal: { defaultProps: { container: () => document.querySelector('.midi-mix-dash') } },
		MuiPopover: { defaultProps: { container: () => document.querySelector('.midi-mix-dash') } },
	},
});
const App = () => (
	<ThemeProvider theme={theme}>
		<ScopedCssBaseline className="midi-mix-dash">
			<Workspace />
		</ScopedCssBaseline>
	</ThemeProvider>
);
export default App;
