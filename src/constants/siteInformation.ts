export const sourceRepository = 'https://github.com/tass-suderman/moonlander-midi-dj-firmware';

export const privacyPolicy = [
	{
		title: 'Your files stay with you',
		text: 'MIDI Workbench does not collect or store your files, mappings, or personal information in application databases or on an application server. Files selected through Import are read locally in your browser; their contents are not uploaded.',
	},
	{
		title: 'A temporary workspace',
		text: 'Your project exists only in the current tab’s memory. The app does not save it in cookies, local storage, session storage, or IndexedDB. Refreshing or closing the tab discards the workspace. Download a ZIP to keep a copy on your own device. A legacy autosave from an earlier version is removed when the app opens.',
	},
	{
		title: 'No application tracking',
		text: 'The app has no analytics, advertising, tracking pixels, accounts, or external database connections. Editing, importing, and exporting do not send your project data over the network. Your browser still requests the application’s static files from the host and may cache them.',
	},
	{
		title: 'Hosting-provider traffic logs',
		text: 'When this site is hosted on Vercel, Vercel processes ordinary requests to deliver and secure the site. Its infrastructure records traffic and operational information, which can include IP addresses and request metadata, even when Web Analytics is not enabled. This application does not control those hosting logs. Our no-storage statement applies to the application’s handling of your files and mappings, not to the hosting provider’s infrastructure.',
	},
	{
		title: 'Downloads and external links',
		text: 'ZIP exports are generated in your browser and saved only when you choose to download them. You control those copies. Documentation and source-repository links open other websites only when you follow them; those sites have their own privacy policies.',
	},
] as const;
