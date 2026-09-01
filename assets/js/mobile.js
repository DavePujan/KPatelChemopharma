document.addEventListener('DOMContentLoaded', () => {
  // Ensure all .reveal elements are visible across subpages
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));

  initMobileNavigation();
  initSubpageMobileNav();
  
  // Initialize Product Range Carousel
  initCarousel({
    trackId: 'product-carousel',
    counterId: 'product-counter',
    dotsId: 'product-dots',
    prevBtnId: 'product-prev',
    nextBtnId: 'product-next',
    totalCount: 7
  });

  // Initialize Key Applications Carousel
  initCarousel({
    trackId: 'application-carousel',
    counterId: 'application-counter',
    dotsId: 'application-dots',
    prevBtnId: 'app-prev',
    nextBtnId: 'app-next',
    totalCount: 6
  });

  // Initialize Mobile Application Videos Controller
  initApplicationVideos();
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
        setTimeout(() => {
          const target = document.querySelector(href);
          if (target) {
            const headerHeight = 68;
            const top = target.getBoundingClientRect().top + window.scrollY - headerHeight;
            window.scrollTo({ top, behavior: 'smooth' });
          }
        }, 300);
      } else {
        closeMenu();
      }
    });
  });

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
 * Subpage mobile navigation
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
  if (closeBtn) closeBtn.addEventListener('click', closeSubpageMenu);

  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeSubpageMenu);
  });

  mobileNav.addEventListener('click', (e) => {
    if (e.target === mobileNav) closeSubpageMenu();
  });
}

/**
 * Milliken-Style Horizontal Carousel Controller
 * Features: Touch Swipe, Smooth Scroll, Arrow Navigation, Dot Indicators, Counter & Auto-scroll
 */
function initCarousel(config) {
  const { trackId, counterId, dotsId, prevBtnId, nextBtnId, totalCount } = config;
  const track = document.getElementById(trackId);
  if (!track) return;

  const counter = document.getElementById(counterId);
  const dotsContainer = document.getElementById(dotsId);
  const prevBtn = document.getElementById(prevBtnId);
  const nextBtn = document.getElementById(nextBtnId);

  let activeIndex = 0;
  let scrollTimeout = null;
  let autoScrollTimer = null;
  let isUserInteracting = false;
  let resumeTimer = null;
  let isVisible = false;

  // Build dot indicators if container exists
  if (dotsContainer && !dotsContainer.children.length) {
    dotsContainer.innerHTML = '';
    for (let i = 0; i < totalCount; i++) {
      const dot = document.createElement('button');
      dot.className = `m-carousel-dot${i === 0 ? ' is-active' : ''}`;
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => scrollToSlide(i));
      dotsContainer.appendChild(dot);
    }
  }

  function getCardStep() {
    const cards = track.children;
    if (!cards || cards.length === 0) return 300;
    const firstCard = cards[0];
    const gap = 14;
    return firstCard.offsetWidth + gap;
  }

  function scrollToSlide(index) {
    pauseInteraction();
    const clampedIndex = Math.max(0, Math.min(index, totalCount - 1));
    const step = getCardStep();
    track.scrollTo({
      left: clampedIndex * step,
      behavior: 'smooth'
    });
    updateUI(clampedIndex);
  }

  function updateUI(index) {
    activeIndex = index;
    // Update counter text (01 / 07)
    if (counter) {
      const formattedIndex = String(activeIndex + 1).padStart(2, '0');
      const formattedTotal = String(totalCount).padStart(2, '0');
      counter.textContent = `${formattedIndex} / ${formattedTotal}`;
    }

    // Update active dot
    if (dotsContainer) {
      const dots = dotsContainer.querySelectorAll('.m-carousel-dot');
      dots.forEach((dot, i) => {
        dot.classList.toggle('is-active', i === activeIndex);
      });
    }
  }

  function handleScroll() {
    const step = getCardStep();
    const scrollLeft = track.scrollLeft;
    const computedIndex = Math.round(scrollLeft / step);
    const clamped = Math.max(0, Math.min(computedIndex, totalCount - 1));
    if (clamped !== activeIndex) {
      updateUI(clamped);
    }
  }

  track.addEventListener('scroll', () => {
    if (scrollTimeout) clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(handleScroll, 40);
  }, { passive: true });

  // Arrow navigation
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      pauseInteraction();
      const newIndex = activeIndex <= 0 ? totalCount - 1 : activeIndex - 1;
      scrollToSlide(newIndex);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      pauseInteraction();
      const newIndex = activeIndex >= totalCount - 1 ? 0 : activeIndex + 1;
      scrollToSlide(newIndex);
    });
  }

  function pauseInteraction() {
    isUserInteracting = true;
    if (resumeTimer) clearTimeout(resumeTimer);
    resumeTimer = setTimeout(() => {
      isUserInteracting = false;
    }, 4500);
  }

  // Touch event tracking
  track.addEventListener('touchstart', pauseInteraction, { passive: true });
  track.addEventListener('touchmove', pauseInteraction, { passive: true });
  track.addEventListener('pointerdown', pauseInteraction, { passive: true });

  // Auto-scroll loop
  function stepAutoScroll() {
    if (isUserInteracting || !isVisible) return;
    const nextIdx = (activeIndex + 1) % totalCount;
    scrollToSlide(nextIdx);
  }

  function startAutoScroll() {
    stopAutoScroll();
    autoScrollTimer = setInterval(stepAutoScroll, 3600);
  }

  function stopAutoScroll() {
    if (autoScrollTimer) {
      clearInterval(autoScrollTimer);
      autoScrollTimer = null;
    }
  }

  // Viewport visibility observer
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

  // Initial state sync
  updateUI(0);
}

/**
 * Mobile Application Videos Performance & Lifecycle Controller
 * - Ensures playsinline, muted, autoplay, and loop on mobile devices
 * - Viewport-aware IntersectionObserver playback
 * - Automatic pause on background tab, resume on active
 * - Handles autoplay restrictions gracefully
 */
function initApplicationVideos() {
  const videos = Array.from(document.querySelectorAll('.application-video, .m-app-card video, .industry-card video'));
  if (!videos.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isSaveData = Boolean(navigator.connection && navigator.connection.saveData);

  if (prefersReducedMotion || isSaveData) {
    videos.forEach((video) => {
      video.pause();
      video.preload = 'none';
    });
    return;
  }

  // Ensure mandatory mobile attributes
  videos.forEach((video) => {
    video.muted = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
  });

  const playVideoSafely = (video) => {
    if (!video) return;
    if (video.paused) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay policy or power save handled silently
        });
      }
    }
  };

  const pauseVideo = (video) => {
    if (!video) return;
    if (!video.paused) {
      video.pause();
    }
  };

  // Viewport-aware playback
  if ('IntersectionObserver' in window) {
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        if (entry.isIntersecting) {
          playVideoSafely(video);
        } else {
          pauseVideo(video);
        }
      });
    }, {
      root: null,
      rootMargin: '100px 0px',
      threshold: 0.15
    });

    videos.forEach((vid) => videoObserver.observe(vid));
  } else {
    videos.forEach((vid) => playVideoSafely(vid));
  }

  // Tab visibility management
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      videos.forEach((v) => pauseVideo(v));
    } else {
      videos.forEach((v) => {
        const rect = v.getBoundingClientRect();
        const inViewport = rect.top < window.innerHeight && rect.bottom > 0;
        if (inViewport) playVideoSafely(v);
      });
    }
  });
}

