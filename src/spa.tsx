import '@vitejs/plugin-react/preamble';
import styles from './index.css?inline';
import React from 'react';
import ReactDOM from 'react-dom/client';
import singleSpaReact from 'single-spa-react';
import Root from './Root';

const lifecycles = singleSpaReact({
	React,
	ReactDOMClient: ReactDOM,
	rootComponent: Root,
	errorBoundary(err: Error) {
		return <div>Error: {err.message}</div>;
	},
});

export const bootstrap = lifecycles.bootstrap;
let styleElement: HTMLStyleElement | undefined;
export const mount = async (props: Parameters<typeof lifecycles.mount>[0]) => {
	styleElement = document.createElement('style');
	styleElement.textContent = styles;
	document.head.appendChild(styleElement);
	try {
		await lifecycles.mount(props);
	} catch (error) {
		styleElement.remove();
		styleElement = undefined;
		throw error;
	}
};
export const unmount = async (props: Parameters<typeof lifecycles.unmount>[0]) => {
	try {
		await lifecycles.unmount(props);
	} finally {
		styleElement?.remove();
		styleElement = undefined;
	}
};
