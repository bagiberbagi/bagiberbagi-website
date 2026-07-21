import { getEntry } from 'astro:content';

/**
 * Sumber tunggal status analytics: baca config `analytics` (Keystatic) dan
 * turunkan, per provider, apakah "aktif" (dicentang DAN ID terisi) plus
 * bendera lintas-provider (ada tool cookie? butuh consent? salah konfigurasi?).
 * BaseLayout memakai ini untuk memutuskan skrip mana yang disuntik.
 *
 * Provider ID = kode publik client-side, bukan rahasia — aman di repo.
 */

export interface ResolvedAnalytics {
  posthog: { active: boolean; host: string; projectKey: string };
  umami: { active: boolean; host: string; websiteId: string };
  ga4: { active: boolean; measurementId: string };
  metaPixel: { active: boolean; pixelId: string };
  clarity: { active: boolean; projectId: string };
  gtm: { active: boolean; containerId: string };
  consentBanner: boolean;
  /** Ada provider berbasis cookie yang aktif (GA4/Pixel/Clarity/GTM). */
  anyCookieProvider: boolean;
  /** Ada provider apa pun yang aktif. */
  anyProvider: boolean;
  /** Consent banner perlu dirender (ada tool cookie aktif). */
  needsConsentBanner: boolean;
  /** Tool cookie aktif tapi consent banner dimatikan — konfigurasi tak aman. */
  misconfigured: boolean;
}

export async function getAnalytics(): Promise<ResolvedAnalytics> {
  const entry = await getEntry('analytics', 'analytics');
  const c = entry?.data;

  const posthog = {
    active: !!c?.posthog.enabled && !!c?.posthog.projectKey,
    host: c?.posthog.host || 'https://us.i.posthog.com',
    projectKey: c?.posthog.projectKey || '',
  };
  const umami = {
    active: !!c?.umami.enabled && !!c?.umami.websiteId,
    host: (c?.umami.host || '').replace(/\/$/, ''),
    websiteId: c?.umami.websiteId || '',
  };
  const ga4 = {
    active: !!c?.ga4.enabled && !!c?.ga4.measurementId,
    measurementId: c?.ga4.measurementId || '',
  };
  const metaPixel = {
    active: !!c?.metaPixel.enabled && !!c?.metaPixel.pixelId,
    pixelId: c?.metaPixel.pixelId || '',
  };
  const clarity = {
    active: !!c?.clarity.enabled && !!c?.clarity.projectId,
    projectId: c?.clarity.projectId || '',
  };
  const gtm = {
    active: !!c?.gtm.enabled && !!c?.gtm.containerId,
    containerId: c?.gtm.containerId || '',
  };

  const consentBanner = c?.consentBanner ?? true;
  const anyCookieProvider = ga4.active || metaPixel.active || clarity.active || gtm.active;
  const anyProvider = anyCookieProvider || posthog.active || umami.active;
  const misconfigured = anyCookieProvider && !consentBanner;

  if (misconfigured) {
    // Guard build-time (design D4): jangan pernah kirim cookie tanpa consent.
    console.warn(
      '[analytics] Provider berbasis cookie aktif tapi consent banner dimatikan — ' +
        'cookie akan terkirim tanpa izin. Nyalakan consent banner atau matikan provider cookie-nya.'
    );
  }

  return {
    posthog,
    umami,
    ga4,
    metaPixel,
    clarity,
    gtm,
    consentBanner,
    anyCookieProvider,
    anyProvider,
    needsConsentBanner: anyCookieProvider,
    misconfigured,
  };
}
