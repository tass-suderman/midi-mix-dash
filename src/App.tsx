import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import darkTheme from './themes/darkTheme';
import Workspace from './components/Workspace/Workspace';
const theme = createTheme(darkTheme);
const App = () => (
	<ThemeProvider theme={theme}>
		<CssBaseline />
		<Workspace />
	</ThemeProvider>
);
export default App;
