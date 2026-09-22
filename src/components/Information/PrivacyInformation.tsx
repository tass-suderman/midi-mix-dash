import { Box, Stack, Typography, Link } from '@mui/material';
import { privacyPolicy } from '../../constants/siteInformation';
const PrivacyInformation = () => (
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
);
export default PrivacyInformation;
