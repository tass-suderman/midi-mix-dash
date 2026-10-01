import { AppBar, Toolbar } from '@mui/material';
import { GraphicEqRounded } from '@mui/icons-material';
const CustomAppBar = () => (
	<AppBar position="sticky" className="topbar" sx={{ backgroundColor: 'background.appBar' }}>
		<Toolbar sx={{ width: '100%', justifyContent: 'space-between' }}>
			<div className="brand">
				<span className="brand-icon">
					<GraphicEqRounded />
				</span>
				MIDI<span className="brand-light">WORKBENCH</span>
			</div>
		</Toolbar>
	</AppBar>
);
export default CustomAppBar;
