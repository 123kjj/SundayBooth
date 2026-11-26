// Sends small, anonymous events to Google Tag Manager's dataLayer.
// Only step names, film names and counts are sent — never photos, videos or captions.

type Params = Record<string, string | number | boolean>;

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

export function track(event: string, params: Params = {}) {
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, ...params });
  } catch {
    /* analytics must never break the booth */
  }
}
