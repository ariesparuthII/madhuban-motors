// Search landing pages use the existing homepage consent and routing implementation.
window.MM_ANALYTICS = {
      ga4: 'G-674BE5JN8Q',
      metaPixel: ''
    };
    window.MM_LEAD_CONFIG = {
      /* Optional HTTPS endpoint that accepts POSTed JSON. Keep blank until an
         authorised lead endpoint with CORS enabled has been configured. */
      endpoint: ''
    };
    (function () {
      var cfg = window.MM_ANALYTICS || {};
      var consentKey = 'mm_privacy_preferences_v1';
      var loaded = false;

      function loadAnalytics() {
        if (loaded) return;
        loaded = true;
        if (cfg.ga4) {
          var g = document.createElement('script');
          g.async = true;
          g.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(cfg.ga4);
          document.head.appendChild(g);
          window.dataLayer = window.dataLayer || [];
          window.gtag = function () { window.dataLayer.push(arguments); };
          window.gtag('js', new Date());
          window.gtag('config', cfg.ga4);
        }

        if (cfg.metaPixel) {
          !function (f, b, e, v, n, t, s) {
            if (f.fbq) return; n = f.fbq = function () {
              n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
            };
            if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
            t = b.createElement(e); t.async = !0; t.src = v;
            s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
          }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
          window.fbq('init', cfg.metaPixel);
          window.fbq('track', 'PageView');
        }
      }

      window.mmTrack = function (name, params) {
        params = params || {};
        if (window.gtag) window.gtag('event', name, params);
        if (window.fbq) window.fbq('trackCustom', name, params);
      };

      function readPreference() {
        try { return JSON.parse(localStorage.getItem(consentKey) || 'null'); }
        catch (e) { return null; }
      }

      function savePreference(analytics) {
        try {
          localStorage.setItem(consentKey, JSON.stringify({
            analytics: !!analytics,
            updatedAt: new Date().toISOString()
          }));
        } catch (e) {}
      }

      function hideConsent() {
        var banner = document.getElementById('privacyConsent');
        if (banner) banner.hidden = true;
      }

      window.mmSetAnalyticsConsent = function (analytics) {
        savePreference(analytics);
        if (analytics) loadAnalytics();
        hideConsent();
      };

      var preference = readPreference();
      if (preference && preference.analytics === true) loadAnalytics();
      document.addEventListener('DOMContentLoaded', function () {
        var banner = document.getElementById('privacyConsent');
        if (banner) banner.hidden = !!preference;
      });
    })();

const MM_LEAD_CHANNEL_KEY = 'mm_lead_channel_v1';
const MM_LEAD_CAMPAIGN_KEY = 'mm_lead_campaign_v1';
const MM_LEAD_CREATIVE_KEY = 'mm_lead_creative_v1';
const MM_ATTRIBUTION_MAX_LENGTH = 64;
const MM_CONTACT_ROUTES = {
  organic: { callPhone:'919911443751', callDisplay:'+91 99114 43751', whatsappPhone:'919718373751', code:'ORG' },
  google:  { callPhone:'919911443751', callDisplay:'+91 99114 43751', whatsappPhone:'919718373751', code:'GGL' },
  meta:    { callPhone:'919911443751', callDisplay:'+91 99114 43751', whatsappPhone:'919718373751', code:'META' }
};

function sanitizeMMAttribution(value) {
  return (value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-_]+|[-_]+$/g, '')
    .slice(0, MM_ATTRIBUTION_MAX_LENGTH);
}

function detectMMLeadAttribution() {
  const params = new URLSearchParams(window.location.search);
  const utmSource = (params.get('utm_source') || '').trim().toLowerCase();
  let detected = '';
  if (utmSource === 'google' || params.has('gclid') || params.has('gbraid') || params.has('wbraid')) {
    detected = 'google';
  } else if (utmSource === 'meta' || params.has('fbclid')) {
    detected = 'meta';
  }

  let campaign = detected ? sanitizeMMAttribution(params.get('utm_campaign')) : '';
  let creative = detected ? sanitizeMMAttribution(params.get('utm_content')) : '';

  try {
    if (detected) {
      sessionStorage.setItem(MM_LEAD_CHANNEL_KEY, detected);
      if (campaign) sessionStorage.setItem(MM_LEAD_CAMPAIGN_KEY, campaign);
      else sessionStorage.removeItem(MM_LEAD_CAMPAIGN_KEY);
      if (creative) sessionStorage.setItem(MM_LEAD_CREATIVE_KEY, creative);
      else sessionStorage.removeItem(MM_LEAD_CREATIVE_KEY);
    }
    const stored = sessionStorage.getItem(MM_LEAD_CHANNEL_KEY);
    if (!detected && (stored === 'google' || stored === 'meta')) {
      detected = stored;
      campaign = sanitizeMMAttribution(sessionStorage.getItem(MM_LEAD_CAMPAIGN_KEY));
      creative = sanitizeMMAttribution(sessionStorage.getItem(MM_LEAD_CREATIVE_KEY));
    }
  } catch (error) {}
  return { channel:detected || 'organic', campaign, creative };
}

const mmLeadAttribution = detectMMLeadAttribution();

function getMMLeadRoute() {
  return { ...mmLeadAttribution, ...MM_CONTACT_ROUTES[mmLeadAttribution.channel] };
}

function getMMWhatsAppUrl(message) {
  const route = getMMLeadRoute();
  const neutralMessage = (message || 'Hi, I want to enquire about Madhuban Motors services.')
    .replace('Hi, I found you on Google and want to enquire about your services.', 'Hi, I want to enquire about your services.')
    .trim();
  const sourceParts = [route.code];
  if (route.campaign) sourceParts.push(`cmp:${route.campaign}`);
  if (route.creative) sourceParts.push(`cr:${route.creative}`);
  const sourceTag = `[Source: ${sourceParts.join(' | ')}]`;
  const preparedMessage = neutralMessage.includes(sourceTag)
    ? neutralMessage
    : `${neutralMessage}\n\n${sourceTag}`;
  return `https://wa.me/${route.whatsappPhone}?text=${encodeURIComponent(preparedMessage)}`;
}

function replaceContactNumberText(root, route) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);
  textNodes.forEach(node => {
    node.nodeValue = node.nodeValue
      .replace(/\+91\s*99114\s*43751/g, route.callDisplay)
      .replace(/9911443751/g, route.callPhone.slice(2));
  });
}

function applyMMLeadRouting() {
  const route = getMMLeadRoute();
  document.querySelectorAll('a[href*="wa.me/"]').forEach(link => {
    let message = '';
    try { message = new URL(link.href).searchParams.get('text') || ''; }
    catch (error) {}
    link.href = getMMWhatsAppUrl(message);
  });
  document.querySelectorAll('a[href^="tel:"]').forEach(link => {
    link.href = `tel:+${route.callPhone}`;
    replaceContactNumberText(link, route);
  });
  document.querySelectorAll('[data-routing-phone]').forEach(el => replaceContactNumberText(el, route));
}

applyMMLeadRouting();

function applySearchContacts() {
 document.querySelectorAll('[data-search-wa]').forEach(a => {
  const topic=a.dataset.searchWa || 'car accessories';
  a.href=getMMWhatsAppUrl(`Hi, I would like options, the fitted price and installation availability for ${topic}. My car is: `);
 });
}
applySearchContacts();
document.addEventListener('click', e => {
 const a=e.target.closest('a[href]'); if(!a)return;
 const href=a.getAttribute('href')||'';
 const name=href.includes('wa.me/')?'whatsapp_click':href.startsWith('tel:')?'call_click':href.includes('google.com/maps')?'directions_click':null;
 if(name) window.mmTrack(name,{location:a.closest('nav')?'navigation':a.closest('.search-contact-bar')?'mobile_bar':'page',page_path:location.pathname});
});
