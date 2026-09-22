import { Box, Button, Stack, Typography, Link } from '@mui/material';
import { privacyPolicy, sourceRepository } from '../../constants/siteInformation';

const sectionSx = { py: 3, borderBottom: '1px dashed', borderColor: 'border.default' };
const InformationContent = () => (
	<Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 900 }}>
		<Typography variant="h4" component="h2">
			About MIDI Workbench
		</Typography>
		<Typography sx={{ mt: 2 }}>
			A browser-based editor for Moonlander firmware and Mixxx controller mappings. Start by
			importing your own source ZIP or controller files. Your workspace is temporary; download it
			before leaving.
		</Typography>
		<Box component="section" sx={sectionSx}>
			<Typography variant="h5" component="h3" gutterBottom>
				License · GNU AGPL v3
			</Typography>
			<Typography>
				This application is licensed under the GNU Affero General Public License, version 3
				(AGPL-3.0). The complete license and the corresponding application source are available
				below. Imported firmware and third-party dependencies retain their respective licenses.
			</Typography>
			<Stack direction="row" gap={2} sx={{ mt: 2, flexWrap: 'wrap' }}>
				<Button
					component="a"
					href={`${import.meta.env.BASE_URL}LICENSE.txt`}
					target="_blank"
					rel="noreferrer"
				>
					Read the AGPL
				</Button>
				<Button component="a" href={`${import.meta.env.BASE_URL}source.zip`} download>
					Download application source
				</Button>
				<Button component="a" href={sourceRepository} target="_blank" rel="noreferrer">
					Source repository
				</Button>
			</Stack>
		</Box>
		<Box component="section" sx={{ pt: 3 }}>
			<Typography variant="h5" component="h3">
				Privacy policy
			</Typography>
			<Typography variant="body2" sx={{ my: 1, color: 'text.secondary' }}>
				Effective September 21, 2026
			</Typography>
			{privacyPolicy.map((section) => (
				<Box key={section.title} sx={{ mt: 3 }}>
					<Typography variant="h6" component="h4" gutterBottom>
						{section.title}
					</Typography>
					<Typography>{section.text}</Typography>
				</Box>
			))}
			<Stack direction="row" gap={3} sx={{ mt: 3, flexWrap: 'wrap' }}>
				<Link href="https://vercel.com/docs/observability" target="_blank" rel="noreferrer">
					Vercel traffic logging
				</Link>
				<Link href="https://vercel.com/legal/privacy-notice" target="_blank" rel="noreferrer">
					Vercel privacy notice
				</Link>
			</Stack>
		</Box>
	</Box>
);
export default InformationContent;
