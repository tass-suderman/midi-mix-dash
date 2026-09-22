import { AppBar, Toolbar } from '@mui/material';
import { GraphicEqRounded } from '@mui/icons-material';
const CustomAppBar = () => (
	<AppBar position="sticky" className="topbar" sx={{ backgroundColor: 'background.appBar' }}>
		<Toolbar sx={{ width: '100%', justifyContent: 'space-between' }}>
			<a className="brand" href=".">
				<span className="brand-icon">
					<GraphicEqRounded />
				</span>
				MIDI<span className="brand-light">WORKBENCH</span>
			</a>
		</Toolbar>
	</AppBar>
);
export default CustomAppBar;
