/**
 * K. Patel Chemopharma — Centralized Google Analytics 4 (GA4) Integration
 * 
 * Instructions:
 * When you have your GA4 Measurement ID, replace 'G-XXXXXXXXXX' below with your actual ID (e.g. 'G-1A2B3C4D5E').
 * The script will automatically initialize tracking and B2B conversion events across all pages.
 */

(function () {
  'use strict';

  // =========================================================================
  // 1. CONFIGURATION: Insert your GA4 Measurement ID here
  // =========================================================================
  const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'; // <-- Replace with your real GA4 ID

  // If placeholder is unchanged, do not load external script to avoid 404s/errors
  if (!GA_MEASUREMENT_ID || GA_MEASUREMENT_ID === 'G-XXXXXXXXXX') {
    // console.info('[GA4] Analytics is in standby. Add your Measurement ID to /assets/js/analytics.js to enable tracking.');
    return;
  }

  // =========================================================================
  // 2. INJECT GOOGLE TAG (gtag.js)
  // =========================================================================
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;

  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID, {
    send_page_view: true,
    anonymize_ip: true,
    cookie_flags: 'SameSite=None;Secure'
  });

  // =========================================================================
  // 3. AUTOMATIC B2B CONVERSION & EVENT TRACKING
  // =========================================================================
  document.addEventListener('DOMContentLoaded', function () {
    
    // A. Track Click-to-Call (tel:)
    document.addEventListener('click', function (e) {
      const telLink = e.target.closest('a[href^="tel:"]');
      if (telLink) {
        const phone = telLink.getAttribute('href').replace('tel:', '');
        gtag('event', 'click_to_call', {
          event_category: 'Contact',
          event_label: phone,
          phone_number: phone,
          page_location: window.location.href
        });
      }
    });

    // B. Track Click-to-Email (mailto:)
    document.addEventListener('click', function (e) {
      const mailLink = e.target.closest('a[href^="mailto:"]');
      if (mailLink) {
        const email = mailLink.getAttribute('href').replace('mailto:', '');
        gtag('event', 'click_to_email', {
          event_category: 'Contact',
          event_label: email,
          email_address: email,
          page_location: window.location.href
        });
      }
    });

    // C. Track Product Sample / Quote Requests
    document.addEventListener('click', function (e) {
      const sampleBtn = e.target.closest('a[href*="sample="], button[onclick*="prefillSample"]');
      if (sampleBtn) {
        const btnText = sampleBtn.innerText || sampleBtn.textContent || 'Sample Request';
        gtag('event', 'request_sample', {
          event_category: 'Product Lead',
          event_label: btnText.trim(),
          page_location: window.location.href
        });
      }
    });

    // D. Track Thank-You / Confirmation Page as a Lead Conversion
    if (window.location.pathname.includes('/thank-you')) {
      gtag('event', 'generate_lead', {
        event_category: 'Inquiry',
        event_label: 'Website Contact Form Submission',
        value: 1.0,
        currency: 'USD'
      });
    }

    // E. Track Product Catalog Live Search
    const searchInput = document.getElementById('product-live-search');
    if (searchInput) {
      let searchTimeout;
      searchInput.addEventListener('input', function () {
        clearTimeout(searchTimeout);
        const query = searchInput.value.trim();
        if (query.length >= 3) {
          searchTimeout = setTimeout(function () {
            gtag('event', 'search_product', {
              search_term: query,
              page_location: window.location.href
            });
          }, 800);
        }
      });
    }

  });

})();
