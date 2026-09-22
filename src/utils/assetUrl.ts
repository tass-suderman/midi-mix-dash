export const assetUrl = (name: string) =>
	new URL(
		`${import.meta.env.BASE_URL}${name}`,
		import.meta.env.DEV ? import.meta.url : window.location.origin,
	).href;
