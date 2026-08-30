/* ==========================================================
   MOBILE INTERACTIVE CONTROLLER
   K. Patel Chemopharma Private Limited
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Ensure all .reveal elements are visible across subpages
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));

  initMobileNavigation();
  initSubpageMobileNav();
  initCarousel('product-carousel', 'product-counter', 7);
  initCarousel('application-carousel', 'application-counter', 6);
});

/**
 * Full-screen mobile navigation with body scroll lock
 */
function initMobileNavigation() {
  const toggle = document.getElementById('menu-toggle');
  const close = document.getElementById('menu-close');
  const menu = document.getElementById('mobile-menu');
  const links = menu ? menu.querySelectorAll('.m-menu__link') : [];

  if (!toggle || !menu) return;

  function openMenu() {
    menu.classList.add('is-open');
    menu.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    menu.classList.remove('is-open');
    menu.setAttribute('aria-hidden', 'true');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  toggle.addEventListener('click', openMenu);
  if (close) close.addEventListener('click', closeMenu);

  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        closeMenu();
        // Wait for menu close animation (250ms) + small buffer before scrolling
        setTimeout(() => {
          const target = document.querySelector(href);
          if (target) {
            const headerHeight = 68; // .m-header height
            const top = target.getBoundingClientRect().top + window.scrollY - headerHeight;
            window.scrollTo({ top, behavior: 'smooth' });
          }
        }, 300);
      } else {
        closeMenu();
      }
    });
  });

  // Handle hash on initial load
  if (window.location.hash) {
    const hash = window.location.hash;
    setTimeout(() => {
      const target = document.querySelector(hash) || document.querySelector('#m-' + hash.replace('#', ''));
      if (target) {
        const headerHeight = 68;
        const top = target.getBoundingClientRect().top + window.scrollY - headerHeight;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }, 300);
  }
}

/**
 * Subpage mobile navigation — wires up .nav__toggle / .nav__mobile / .nav__mobile-close
 * Used on all subpages: applications, infrastructure, csr, sustainability, contact, about
 */
function initSubpageMobileNav() {
  const toggle = document.querySelector('.nav__toggle');
  const mobileNav = document.getElementById('mobile-nav');
  const closeBtn = mobileNav ? mobileNav.querySelector('.nav__mobile-close') : null;

  if (!toggle || !mobileNav) return;

  function openSubpageMenu() {
    mobileNav.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    toggle.setAttribute('aria-expanded', 'true');
  }

  function closeSubpageMenu() {
    mobileNav.classList.remove('is-open');
    document.body.style.overflow = '';
    toggle.setAttribute('aria-expanded', 'false');
  }

  toggle.addEventListener('click', openSubpageMenu);

  if (closeBtn) {
    closeBtn.addEventListener('click', closeSubpageMenu);
  }

  // Close when tapping any nav link
  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeSubpageMenu);
  });

  // Close on backdrop tap (outside the menu content)
  mobileNav.addEventListener('click', (e) => {
    if (e.target === mobileNav) closeSubpageMenu();
  });
}

/**
 * Enhanced Horizontal Carousel with Counter and Touch-Aware Auto-Scroll
 */
function initCarousel(carouselId, counterId, totalCount) {
  const track = document.getElementById(carouselId);
  const counter = document.getElementById(counterId);

  if (!track) return;

  let scrollTimeout = null;
  let autoScrollTimer = null;
  let isUserInteracting = false;
  let resumeTimer = null;
  let isVisible = false;

  // Counter updater
  function updateCounter() {
    if (!counter) return;
    const cards = track.children;
    if (!cards || cards.length === 0) return;

    const firstCard = cards[0];
    const cardWidth = firstCard.offsetWidth + 14; // card width + gap
    const scrollLeft = track.scrollLeft;

    let activeIndex = Math.round(scrollLeft / cardWidth) + 1;
    activeIndex = Math.max(1, Math.min(activeIndex, totalCount));

    const formattedIndex = String(activeIndex).padStart(2, '0');
    const formattedTotal = String(totalCount).padStart(2, '0');

    counter.textContent = `${formattedIndex} / ${formattedTotal}`;
  }

  track.addEventListener('scroll', () => {
    if (scrollTimeout) clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(updateCounter, 40);
  }, { passive: true });

  // Initial counter set
  updateCounter();

  // Auto-scroll function
  function stepAutoScroll() {
    if (isUserInteracting || !isVisible) return;

    const cards = track.children;
    if (!cards || cards.length === 0) return;

    const firstCard = cards[0];
    const cardStep = firstCard.offsetWidth + 14;
    const maxScroll = track.scrollWidth - track.clientWidth;

    if (track.scrollLeft >= maxScroll - 15) {
      // Loop back to start
      track.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      track.scrollBy({ left: cardStep, behavior: 'smooth' });
    }
  }

  function startAutoScroll() {
    stopAutoScroll();
    autoScrollTimer = setInterval(stepAutoScroll, 3200);
  }

  function stopAutoScroll() {
    if (autoScrollTimer) {
      clearInterval(autoScrollTimer);
      autoScrollTimer = null;
    }
  }

  function pauseInteraction() {
    isUserInteracting = true;
    if (resumeTimer) clearTimeout(resumeTimer);
    resumeTimer = setTimeout(() => {
      isUserInteracting = false;
    }, 4000);
  }

  // Pause on user touch or wheel
  track.addEventListener('touchstart', pauseInteraction, { passive: true });
  track.addEventListener('touchmove', pauseInteraction, { passive: true });
  track.addEventListener('pointerdown', pauseInteraction, { passive: true });

  // IntersectionObserver to only auto-scroll when in view
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          isVisible = true;
          startAutoScroll();
        } else {
          isVisible = false;
          stopAutoScroll();
        }
      });
    }, { threshold: 0.25 });

    observer.observe(track);
  } else {
    isVisible = true;
    startAutoScroll();
  }
}
