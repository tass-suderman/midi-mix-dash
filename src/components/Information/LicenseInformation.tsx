import { Box, Button, Stack, Typography } from '@mui/material';
import { assetUrl } from '../../utils/assetUrl';
import { sourceRepository } from '../../constants/siteInformation';
const sectionSx = { py: 3, borderBottom: '1px dashed', borderColor: 'border.default' };
const LicenseInformation = () => (
	<Box component="section" sx={sectionSx}>
		<Typography variant="h5" component="h3" gutterBottom>
			License · GNU AGPL v3
		</Typography>
		<Typography>
			This application is licensed under the GNU Affero General Public License, version 3
			(AGPL-3.0). The complete license and the corresponding application source are available below.
			Imported firmware and third-party dependencies retain their respective licenses.
		</Typography>
		<Stack direction="row" gap={2} sx={{ mt: 2, flexWrap: 'wrap' }}>
			<Button component="a" href={assetUrl('LICENSE.md')} target="_blank" rel="noreferrer">
				Read the AGPL
			</Button>
			<Button component="a" href={assetUrl('source.zip')} download>
				Download application source
			</Button>
			<Button component="a" href={sourceRepository} target="_blank" rel="noreferrer">
				Source repository
			</Button>
		</Stack>
	</Box>
);
export default LicenseInformation;
