import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

// GitHub Pages serves this project from https://<user>.github.io/ente-redesign,
// so every asset URL has to carry that prefix. Override with BASE_PATH='' to
// build for a root-hosted preview.
const base = process.env.BASE_PATH ?? '/ente-redesign';

/** @type {import('@sveltejs/kit').Config} */
export default {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			pages: '../docs',
			assets: '../docs',
			precompress: false,
			strict: true
		}),
		paths: { base },
		prerender: { entries: ['*'] }
	}
};
