import { Box, Typography } from '@mui/material';
import LicenseInformation from './LicenseInformation';
import PrivacyInformation from './PrivacyInformation';
const InformationContent = () => (
	<Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 900, margin: '0 auto' }}>
		<Typography variant="h4" component="h2">
			About MIDI Workbench
		</Typography>
		<Typography sx={{ mt: 2 }}>
			A browser-based editor for Moonlander firmware and Mixxx controller mappings. Start by
			importing your own source ZIP or controller files. Your workspace is temporary; download it
			before leaving.
		</Typography>
		<LicenseInformation />
		<PrivacyInformation />
	</Box>
);
export default InformationContent;
