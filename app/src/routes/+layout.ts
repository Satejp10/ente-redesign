// Static hosting on GitHub Pages: every route is prerendered to its own
// index.html. Rendering is client-only because the grid's geometry depends on
// the real viewport, and a server has no viewport to measure.
export const prerender = true;
export const ssr = false;

// Emit `albums/index.html` rather than `albums.html`. Extensionless URLs are a
// host-specific courtesy; a directory with an index file is served correctly
// everywhere.
export const trailingSlash = 'always';
