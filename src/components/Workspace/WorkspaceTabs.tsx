import { Tab, Tabs } from '@mui/material';
import { Keyboard, TuneRounded, InfoOutlined } from '@mui/icons-material';
import type { Device } from '../../types/controllers';
interface Props {
	value: Device | 'information';
	onChange: (tab: Device | 'information') => void;
}
const WorkspaceTabs = ({ value, onChange }: Props) => (
	<div className="tabbar">
		<Tabs
			value={value}
			variant="scrollable"
			scrollButtons="auto"
			onChange={(_, value) => onChange(value)}
		>
			<Tab icon={<Keyboard />} iconPosition="start" value="moonlander" label="Moonlander" />
			<Tab icon={<TuneRounded />} iconPosition="start" value="midimix" label="Akai MIDImix" />
			<Tab icon={<InfoOutlined />} iconPosition="start" value="information" label="Information" />
		</Tabs>
		<span className="saved">
			<i /> Temporary session · download to keep
		</span>
	</div>
);
export default WorkspaceTabs;
