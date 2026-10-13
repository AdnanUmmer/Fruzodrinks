export function validateOrigin(value, production = false) {
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.pathname !== '/' || url.search || url.hash || /[,\s]/.test(value)) throw new Error();
    if (production && (url.protocol !== 'https:' || ['localhost','127.0.0.1','[::1]'].includes(url.hostname))) throw new Error();
    return url.origin;
  } catch {
    throw new Error('SITE_ORIGIN must contain exactly one origin, such as https://fruzodrinks.com. Production requires a public HTTPS origin.');
  }
}
export function jsonLd(value) { return JSON.stringify(value).replace(/</g, '\\u003c'); }
