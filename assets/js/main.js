// ============================================
//  SCROLL REVEAL (Intersection Observer)
// ============================================
function initReveal() {
  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );
  reveals.forEach((el) => observer.observe(el));
}

/* ============================================
   NAVBAR — scroll & hero detection
   ============================================ */
function initNavScroll() {
  const nav = document.querySelector('.nav');
  const hero = document.querySelector('.hero');
  if (!nav) return;

  const scrollHandler = () => {
    const scrolled = window.scrollY > 60;
    nav.classList.toggle('is-scrolled', scrolled);

    // Hero color detection — white text when over dark image hero
    if (hero) {
      const heroBottom = hero.getBoundingClientRect().bottom;
      if (heroBottom > nav.offsetHeight) {
        nav.classList.add('nav--hero');
      } else {
        nav.classList.remove('nav--hero');
      }
    }
  };

  window.addEventListener('scroll', scrollHandler, { passive: true });
  scrollHandler();
}

/* ============================================
   SCROLL PROGRESS BAR
   ============================================ */
function initScrollProgress() {
  const bar = document.querySelector('.scroll-progress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    const progress = h > 0 ? window.scrollY / h : 0;
    bar.style.transform = `scaleX(${progress})`;
  }, { passive: true });
}

/* ============================================
   COUNTER ANIMATION
   ============================================ */
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  counters.forEach((el) => observer.observe(el));
}

function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-count'), 10);
  const suffix = el.getAttribute('data-suffix') || '';
  const prefix = el.getAttribute('data-prefix') || '';
  const duration = 2000;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // easeOutExpo
    const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
    const current = Math.round(eased * target);
    el.textContent = prefix + current + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

/* ============================================
   MOBILE NAV
   ============================================ */
function initMobileNav() {
  const toggle = document.querySelector('.nav__toggle');
  const overlay = document.querySelector('.nav__mobile');
  const closeBtn = document.querySelector('.nav__mobile-close');
  if (!toggle || !overlay) return;

  toggle.addEventListener('click', () => overlay.classList.add('is-open'));
  if (closeBtn) closeBtn.addEventListener('click', () => overlay.classList.remove('is-open'));

  overlay.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => overlay.classList.remove('is-open'));
  });
}

/* ============================================
   SMOOTH SCROLL
   ============================================ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const id = anchor.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const navHeight = document.querySelector('.nav')?.offsetHeight || 0;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* ============================================
   GLOBE / MAP VISUALIZATION (Canvas)
   Charcoal & slate palette — Bloomberg / FT style
   ============================================ */
function initGlobe() {
  const canvas = document.querySelector('.globe-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width, height, centerX, centerY, radius;
  let animFrame;
  let dots = [];
  let connections = [];
  let time = 0;

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    width = rect.width;
    height = rect.height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    centerX = width / 2;
    centerY = height / 2;
    radius = Math.min(width, height) * 0.38;
    generateDots();
  }

  function generateDots() {
    dots = [];
    const count = 120;
    for (let i = 0; i < count; i++) {
      const lat = (Math.random() - 0.5) * Math.PI;
      const lon = Math.random() * Math.PI * 2;
      dots.push({ lat, lon, size: 1 + Math.random() * 1.5, pulse: Math.random() * Math.PI * 2 });
    }
    // Hub cities
    const hubs = [
      { lat: 0.7, lon: 0.3 },   // Europe
      { lat: 0.5, lon: 1.3 },   // Asia
      { lat: 0.6, lon: -1.3 },  // N. America
      { lat: -0.3, lon: 0.5 },  // Africa
      { lat: -0.5, lon: 2.5 },  // Oceania
    ];
    hubs.forEach((h) => {
      dots.push({ lat: h.lat, lon: h.lon, size: 3, pulse: 0, isHub: true });
    });

    connections = [];
    const hubDots = dots.filter((d) => d.isHub);
    for (let i = 0; i < hubDots.length; i++) {
      for (let j = i + 1; j < hubDots.length; j++) {
        connections.push([hubDots[i], hubDots[j]]);
      }
    }
  }

  function project(lat, lon, t) {
    const rotatedLon = lon + t * 0.15;
    const x = Math.cos(lat) * Math.sin(rotatedLon);
    const y = Math.sin(lat);
    const z = Math.cos(lat) * Math.cos(rotatedLon);
    if (z < -0.1) return null;
    const scale = 1 / (1 + z * 0.3);
    return { x: centerX + x * radius * scale, y: centerY - y * radius * scale, z, scale };
  }

  function draw() {
    time += 0.005;
    ctx.clearRect(0, 0, width, height);

    // Globe outline
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(47, 79, 79, 0.1)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Latitude lines
    for (let i = -2; i <= 2; i++) {
      const lat = (i / 3) * (Math.PI / 2);
      ctx.beginPath();
      let started = false;
      for (let j = 0; j <= 100; j++) {
        const lon = (j / 100) * Math.PI * 2;
        const p = project(lat, lon, time);
        if (!p) { started = false; continue; }
        if (!started) { ctx.moveTo(p.x, p.y); started = true; }
        else ctx.lineTo(p.x, p.y);
      }
      ctx.strokeStyle = 'rgba(47, 79, 79, 0.06)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    // Longitude lines
    for (let i = 0; i < 12; i++) {
      const lon = (i / 12) * Math.PI * 2;
      ctx.beginPath();
      let started = false;
      for (let j = 0; j <= 50; j++) {
        const lat = ((j / 50) - 0.5) * Math.PI;
        const p = project(lat, lon, time);
        if (!p) { started = false; continue; }
        if (!started) { ctx.moveTo(p.x, p.y); started = true; }
        else ctx.lineTo(p.x, p.y);
      }
      ctx.strokeStyle = 'rgba(47, 79, 79, 0.06)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    // Connections — muted slate arcs
    connections.forEach(([a, b]) => {
      const pa = project(a.lat, a.lon, time);
      const pb = project(b.lat, b.lon, time);
      if (!pa || !pb) return;
      const grad = ctx.createLinearGradient(pa.x, pa.y, pb.x, pb.y);
      grad.addColorStop(0, `rgba(47, 79, 79, ${0.18 * Math.min(pa.z + 1, 1)})`);
      grad.addColorStop(0.5, `rgba(47, 79, 79, 0.06)`);
      grad.addColorStop(1, `rgba(47, 79, 79, ${0.18 * Math.min(pb.z + 1, 1)})`);
      ctx.beginPath();
      const midX = (pa.x + pb.x) / 2;
      const midY = (pa.y + pb.y) / 2 - 30;
      ctx.moveTo(pa.x, pa.y);
      ctx.quadraticCurveTo(midX, midY, pb.x, pb.y);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Traveling particle
      const t2 = (time * 0.5) % 1;
      const px = (1 - t2) * (1 - t2) * pa.x + 2 * (1 - t2) * t2 * midX + t2 * t2 * pb.x;
      const py = (1 - t2) * (1 - t2) * pa.y + 2 * (1 - t2) * t2 * midY + t2 * t2 * pb.y;
      ctx.beginPath();
      ctx.arc(px, py, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(47, 79, 79, 0.45)';
      ctx.fill();
    });

    // Dots
    dots.forEach((dot) => {
      const p = project(dot.lat, dot.lon, time);
      if (!p) return;
      const alpha = Math.max(0, Math.min(1, (p.z + 0.5) * 0.8));
      const pulseFactor = dot.isHub ? 1 + 0.3 * Math.sin(time * 3 + dot.pulse) : 1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, dot.size * pulseFactor, 0, Math.PI * 2);
      ctx.fillStyle = dot.isHub
        ? `rgba(47, 79, 79, ${alpha * 0.7})`
        : `rgba(115, 115, 115, ${alpha * 0.25})`;
      ctx.fill();

      if (dot.isHub) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, dot.size * 4 * pulseFactor, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(47, 79, 79, ${alpha * 0.06})`;
        ctx.fill();
      }
    });

    animFrame = requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  draw();

  // Pause when off-screen
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        if (!animFrame) draw();
      } else {
        cancelAnimationFrame(animFrame);
        animFrame = null;
      }
    },
    { threshold: 0 }
  );
  observer.observe(canvas);
}

/* ============================================
   TRUST MARQUEE DUPLICATION
   ============================================ */
function initTrustMarquee() {
  const track = document.querySelector('.trust__track');
  if (!track) return;
  const set = track.querySelector('.trust__set');
  if (!set) return;
  const clone = set.cloneNode(true);
  track.appendChild(clone);
}

/* ============================================
   SUBTLE PARALLAX — hero & legacy images
   ============================================ */
function initParallax() {
  const wrappers = document.querySelectorAll('.hero__image-wrap, .legacy__image-wrap, .cta__image-wrap');
  if (!wrappers.length) return;

  // Set up items with their initial scroll positions mapped immediately
  const items = Array.from(wrappers).map((wrapper) => {
    const parent = wrapper.parentElement;
    const rect = parent.getBoundingClientRect();
    const vh = window.innerHeight;
    const progress = (rect.top + rect.height) / (vh + rect.height);
    const initialY = (progress - 0.5) * -60; // Map middle of screen to 0, vertical drift range ±30px
    
    // Apply immediate transform on page load to prevent sudden transition jump
    wrapper.style.transform = `translate3d(0, ${initialY}px, 0)`;

    return {
      element: wrapper,
      currentY: initialY,
      targetY: initialY,
    };
  });

  let active = false;

  function update() {
    let needsUpdate = false;

    items.forEach((item) => {
      const parent = item.element.parentElement;
      const rect = parent.getBoundingClientRect();
      const vh = window.innerHeight;

      // Skip processing if element is completely off-screen
      if (rect.bottom < 0 || rect.top > vh) return;

      const progress = (rect.top + rect.height) / (vh + rect.height);
      // Standard parallax shifts background downwards relative to section box as section scrolls up
      item.targetY = (progress - 0.5) * -60;

      // Linear interpolation (lerp) for smooth easing
      const diff = item.targetY - item.currentY;
      if (Math.abs(diff) > 0.05) {
        item.currentY += diff * 0.08; // Smooth interpolation speed
        needsUpdate = true;
      } else {
        item.currentY = item.targetY;
      }

      item.element.style.transform = `translate3d(0, ${item.currentY}px, 0)`;
    });

    if (needsUpdate || active) {
      requestAnimationFrame(update);
    } else {
      active = false;
    }
  }

  // Set up scroll and resize listeners to trigger updates
  window.addEventListener('scroll', () => {
    if (!active) {
      active = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });

  window.addEventListener('resize', () => {
    if (!active) {
      active = true;
      requestAnimationFrame(update);
    }
  });
}

/* ============================================
   K. PATEL PRODUCT CATALOG DATA & MODAL EXPLORER
   ============================================ */
const PRODUCTS_DATA = {
  basic: {
    title: "Basic Dyes",
    badge: "Basic Dyes",
    desc: "Water-soluble cationic dyes offering outstanding brightness and tinctorial strength. Extensively utilized in paper coloring, acrylic fibers, stationery inks, wood stains, and turf coloring.",
    industries: ["Paper & Board Industrial", "Stationery Writing Inks", "Biological Research Stains"],
    features: ["High Tinctorial Strength", "Excellent Liquid Mix Solubility"],
    items: [
      { name: "Methyl Violet Liquid 50%", ci: "Basic Violet 1" },
      { name: "Methyl Violet", ci: "Basic Violet 1" },
      { name: "Crystal Violet Liquid 50%", ci: "Basic Violet 3" },
      { name: "Crystal Violet", ci: "Basic Violet 3" },
      { name: "Ethyl Violet Liquid 50%", ci: "Basic Violet 4" },
      { name: "Ethyl Violet", ci: "Basic Violet 4" },
      { name: "Rhodamine B Liquid 40%", ci: "Basic Violet 10" },
      { name: "Rhodamine B 540%", ci: "Basic Violet 10" },
      { name: "Magenta", ci: "Basic Violet 14" },
      { name: "Basic Violet 16 Liquid", ci: "Basic Violet 16" },
      { name: "Brilliant Green Liquid 50%", ci: "Basic Green 1" },
      { name: "Brilliant Green Crystals", ci: "Basic Green 1" },
      { name: "Malachite Green Liquid 50%", ci: "Basic Green 4" },
      { name: "Malachite Green Crystals / Powder", ci: "Basic Green 4" },
      { name: "Victoria Blue BO", ci: "Basic Blue 7" },
      { name: "Methylene Blue 2B", ci: "Basic Blue 9" },
      { name: "Victoria Blue B Liquid 40%", ci: "Basic Blue 26" },
      { name: "Victoria Blue B", ci: "Basic Blue 26" },
      { name: "Basic Blue 140 Liquid", ci: "Basic Blue 140" },
      { name: "Chrysodine Y Liquid 35%", ci: "Basic Orange 2" },
      { name: "Chrysodine Y", ci: "Basic Orange 2" },
      { name: "Basic Orange 60 Liquid", ci: "Basic Orange 60" },
      { name: "Auramine O", ci: "Basic Yellow 2" },
      { name: "Auramine OF (Spirit Soluble)", ci: "Basic Yellow 2" },
      { name: "Basic Yellow 28 Liquid", ci: "Basic Yellow 28" },
      { name: "Basic Yellow 29 Liquid", ci: "Basic Yellow 29" },
      { name: "Ethyl Auramine", ci: "Basic Yellow 37" },
      { name: "Basic Yellow 40 Liquid", ci: "Basic Yellow 40" },
      { name: "Basic Yellow 90 Liquid", ci: "Basic Yellow 90" },
      { name: "Basic Yellow 96 Liquid", ci: "Basic Yellow 96" },
      { name: "Bismark Brown G Liquid 50%", ci: "Basic Brown 1" },
      { name: "Bismark Brown G", ci: "Basic Brown 1" },
      { name: "Rhodamine 6GDN", ci: "Basic Red 1" },
      { name: "Basic Red 12 Liquid", ci: "Basic Red 12" },
      { name: "Basic Red 14 Liquid", ci: "Basic Red 14" },
      { name: "Basic Red 49 Liquid", ci: "Basic Red 49" },
      { name: "Basic Black MX", ci: "—" }
    ]
  },
  solvent: {
    title: "Solvent Dyes",
    badge: "Solvent Dyes",
    desc: "High-purity organosoluble colorants possessing excellent solubility in polar and non-polar organic solvents. Widely used in writing instrument inks, stationery, lacquers, wood coatings, and industrial markers.",
    industries: ["Stationery Writing Inks", "Plastics & Lacquers", "Industrial Wood Finishes"],
    features: ["Superior Heat Stability", "Excellent Organic Solvent Solubility"],
    items: [
      { name: "Methyl Violet B Base", ci: "Solvent Violet 8" },
      { name: "Crystal Violet Base", ci: "Solvent Violet 9" },
      { name: "Ethyl Violet Base", ci: "Solvent Violet 4 Base" },
      { name: "Victoria Blue B Base", ci: "Solvent Blue 4" },
      { name: "Solvent Blue KPP", ci: "Solvent Blue 38" },
      { name: "Solvent Blue KPT", ci: "Solvent Blue 38" },
      { name: "Solvent Blue KPV", ci: "Solvent Blue 43" },
      { name: "Solvent Blue KPM", ci: "Solvent Blue 43" },
      { name: "Solvent Black KPC", ci: "Solvent Black 46" },
      { name: "Brilliant Red DDY", ci: "Solvent Red 39" },
      { name: "Rhodamine B Base", ci: "Solvent Red 49" },
      { name: "Chrysodine Y Base", ci: "Solvent Orange 3" },
      { name: "Brilliant Yellow DDY", ci: "Solvent Yellow 47" },
      { name: "Solvent Blue 44", ci: "Solvent Blue 44" },
      { name: "Solvent Blue 98", ci: "Solvent Blue 98" },
      { name: "Bismark Brown G Base W/C", ci: "Solvent Brown 41" },
      { name: "Solvent Black 27", ci: "Solvent Black 27" },
      { name: "Solvent Black 29", ci: "Solvent Black 29" }
    ]
  },
  rinsable: {
    title: "Rinsable Dyes",
    badge: "Spectra Rinse",
    desc: "Specially formulated non-staining colorants easily washed from skin and household fabrics. Fully EN-71 certified for safety, making them ideal for children's toys, school marker inks, and household cleaners.",
    industries: ["Children's Markers & Crafts", "School & Educational Toys", "Household Cleaners"],
    features: ["EN-71 Parts 3 & 9 Safe Certification", "Zero-Staining Rinsable Washability"],
    items: [
      { name: "Spectra Rinse Yellow GXV LQ", ci: "" },
      { name: "Spectra Rinse Yellow R12XV LQ", ci: "" },
      { name: "Spectra Rinse Yellow VG LV LQ", ci: "" },
      { name: "Spectra Rinse Orange RX-LV LQ", ci: "" },
      { name: "Spectra Rinse Red RV LQ", ci: "" },
      { name: "Spectra Rinse Magenta LVS LQ", ci: "" },
      { name: "Spectra Rinse Blue T14XV LQ", ci: "" },
      { name: "Spectra Rinse Green AU767 LQ", ci: "" },
      { name: "Spectra Rinse Violet BV LQ", ci: "" },
      { name: "Spectra Rinse Black AV115 LIQ", ci: "" }
    ]
  },
  pigments: {
    title: "Pigments",
    badge: "Pigment Toners",
    desc: "High-affinity organic and inorganic pigments yielding deep color strength and outstanding dispersion properties. Ideal for sheet-fed and web-offset packaging printing inks and coatings.",
    industries: ["Offset & Flexo Printing Inks", "Commercial Packaging", "Industrial Coatings"],
    features: ["Excellent Light & Acid Fastness", "Optimal Dispersion Flow Performance"],
    items: [
      { name: "Violet Toner DD 7", ci: "Pigment Violet 27" },
      { name: "Violet Toner DD 2", ci: "Pigment Violet 3:1" },
      { name: "Violet Toner DD 3", ci: "Pigment Violet 3" },
      { name: "Violet Toner DD 4", ci: "Pigment Violet 3" },
      { name: "Blue Toner DD 62", ci: "Pigment Blue 62" },
      { name: "Blue Toner DD 14", ci: "Pigment Blue 14" },
      { name: "Red Toner DD 169", ci: "Pigment Red 169" },
      { name: "Red Toner DD 81", ci: "Pigment Red 81" }
    ]
  },
  dispersions: {
    title: "Pigment Dispersions",
    badge: "KP Sperse",
    desc: "Stable aqueous pre-dispersions of organic pigments, exhibiting optimal flow properties and sedimentation resistance. Specifically engineered for pulp and paper coloring and water-based coatings.",
    industries: ["Pulp & Paper Coloring", "Aqueous Inkjet & Digital Inks", "Water-Based Wall Coatings"],
    features: ["Sedimentation & Crusting Resistance", "Uniform Sub-Micron Particle Size"],
    items: [
      { name: "KP Sperse Violet 101", ci: "Pigment Violet 3" },
      { name: "KP Sperse Violet 103", ci: "Pigment Violet 23" },
      { name: "KP Sperse Violet 104", ci: "Pigment Violet 27" },
      { name: "KP Sperse Violet 105", ci: "Pigment Violet 27" },
      { name: "KP Sperse Blue 101", ci: "Pigment Blue 14" },
      { name: "KP Sperse Blue 103", ci: "Pigment Blue 15" },
      { name: "KP Sperse Red 101", ci: "Pigment Red 81" },
      { name: "KP Sperse Red 104", ci: "Pigment Red 169" },
      { name: "KP Sperse Yellow 103", ci: "Pigment Yellow 83" },
      { name: "KP Sperse Yellow 106", ci: "Pigment Yellow 14" },
      { name: "KP Sperse Green 103", ci: "Pigment Green 7" },
      { name: "KP Sperse Black 103", ci: "Pigment Black 7" }
    ]
  },
  acid: {
    title: "Acid Dyes",
    badge: "Acid Dyes",
    desc: "Highly soluble anionic colorants designed for excellent dye exhaustion and levelling. Extensively used in textile coloring (wool, silk, nylon), printing inks, wood stains, and premium leather dressing.",
    industries: ["Textile Wool, Silk & Nylon", "Leather Drum Dyeing", "Wood Stains & Industrial Ink"],
    features: ["Exceptional Levelling & Migration", "High Wash, Light & Rub Fastness"],
    items: [
      { name: "Acid Yellow 6 Powder", ci: "Acid Yellow 6" },
      { name: "Acid Yellow 23 Powder", ci: "Acid Yellow 23" },
      { name: "Acid Yellow 36 Powder", ci: "Acid Yellow 36" },
      { name: "Acid Yellow 42 Powder", ci: "Acid Yellow 42" },
      { name: "Acid Yellow 73 Powder", ci: "Acid Yellow 73" },
      { name: "Acid Orange 7 Powder", ci: "Acid Orange 7" },
      { name: "Acid Orange 7 Liquid", ci: "Acid Orange 7" },
      { name: "Acid Red 14 Powder", ci: "Acid Red 14" },
      { name: "Acid Red 52 Powder", ci: "Acid Red 52" },
      { name: "Acid Red 87 Powder", ci: "Acid Red 87" },
      { name: "Acid Red 92 Powder", ci: "Acid Red 92" },
      { name: "Acid Blue 15 Powder", ci: "Acid Blue 15" },
      { name: "Acid Blue 15 Liquid", ci: "Acid Blue 15" },
      { name: "Acid Blue 9 Powder", ci: "Acid Blue 9" },
      { name: "Acid Blue 9 Liquid", ci: "Acid Blue 9" },
      { name: "Acid Blue 80 Powder", ci: "Acid Blue 80" },
      { name: "Acid Blue 93 Powder", ci: "Acid Blue 93" },
      { name: "Acid Violet 17 Liquid", ci: "Acid Violet 17" },
      { name: "Acid Violet 17 Powder", ci: "Acid Violet 17" },
      { name: "Acid Violet 49 Powder", ci: "Acid Violet 49" },
      { name: "Acid Violet 49 Liquid", ci: "Acid Violet 49" },
      { name: "Acid Black 2 Powder", ci: "Acid Black 2" },
      { name: "Acid Black 194 Powder", ci: "Acid Black 194" }
    ]
  },
  direct: {
    title: "Direct Dyes",
    badge: "Direct Dyes",
    desc: "Anionic dyes carrying high natural affinity for cellulose fibers. Offers excellent exhaustion rates, cost-effective dyeing, and bleeding resistance for paper, cotton textiles, and wood finishing.",
    industries: ["Cellulose Fibers & Textiles", "Industrial Paper Coloring", "Wood Stains & Drum Leather"],
    features: ["High Direct Exhaustion Rate", "Optimal Wet Fastness Performance"],
    items: [
      { name: "Direct Yellow 4 Powder", ci: "Direct Yellow 4" },
      { name: "Direct Orange 15 Liquid", ci: "Direct Orange 15" },
      { name: "Direct Red 239 Powder", ci: "Direct Red 239" },
      { name: "Direct Red 239 Liquid", ci: "Direct Red 239" },
      { name: "Direct Red 254 Powder", ci: "Direct Red 254" },
      { name: "Direct Red 254 Liquid", ci: "Direct Red 254" },
      { name: "Direct Blue 80 Powder", ci: "Direct Blue 80" },
      { name: "Direct Blue 86 Powder", ci: "Direct Blue 86" },
      { name: "Direct Blue 273 Liquid", ci: "Direct Blue 273" },
      { name: "Direct Blue 218 Powder", ci: "Direct Blue 218" },
      { name: "Direct Blue 218 Liquid", ci: "Direct Blue 218" },
      { name: "Direct Blue 267 Liquid", ci: "Direct Blue 267" },
      { name: "Direct Blue 279 Liquid", ci: "Direct Blue 279" },
      { name: "Direct Brown 44 Liquid", ci: "Direct Brown 44" },
      { name: "Direct Black 179 Powder", ci: "Direct Black 179" },
      { name: "Direct Black 22 Powder", ci: "Direct Black 22" },
      { name: "Direct Black 168 Liquid", ci: "Direct Black 168" }
    ]
  }
};

let activeCategory = 'basic';
let modalSearchQuery = '';

function initCatalog() {
  const cards = document.querySelectorAll('.dye-card');
  const modal = document.getElementById('catalog-modal');
  const modalClose = document.querySelector('.modal__close');
  const modalBackdrop = document.querySelector('.modal__backdrop');

  const catName = document.querySelector('.modal__category-name');
  const catDesc = document.querySelector('.modal__category-desc');
  const searchInput = document.querySelector('.modal__search-input');
  const gridContainer = document.querySelector('.product-grid');

  // Specs Sub-modal
  const specModal = document.getElementById('spec-modal');
  const specModalClose = document.querySelector('.spec-modal-close');
  const specModalBackdrop = document.querySelector('.spec-modal-backdrop');

  if (!cards.length || !modal || !gridContainer) return;

  // Open modal and show products
  cards.forEach((card) => {
    card.addEventListener('click', () => {
      const categoryId = card.getAttribute('data-category');
      openCategoryModal(categoryId);
    });
  });

  function openCategoryModal(categoryId) {
    activeCategory = categoryId;
    const data = PRODUCTS_DATA[activeCategory];
    if (!data) return;

    catName.textContent = data.title;
    catDesc.textContent = data.desc;

    // Reset search
    modalSearchQuery = '';
    if (searchInput) searchInput.value = '';

    renderDyeCards();

    // Show modal & prevent body scroll
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function renderDyeCards() {
    const data = PRODUCTS_DATA[activeCategory];
    if (!data) return;

    // Filter items based on search query
    const filtered = data.items.filter((item) => {
      const q = modalSearchQuery.toLowerCase().trim();
      return item.name.toLowerCase().includes(q) || (item.ci && item.ci.toLowerCase().includes(q));
    });

    if (filtered.length === 0) {
      gridContainer.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: var(--color-body-muted); padding: 48px 0;">No products match your search.</div>`;
      return;
    }

    gridContainer.innerHTML = filtered
      .map((item) => {
        const ind1 = data.industries[0] || "General Chemical Applications";
        const ind2 = data.industries[1] || "Coloration Processings";
        const ind3 = data.industries[2] || "Industrial Solutions";
        const f1 = data.features[0] || "Excellent Shade Consistency";
        const f2 = data.features[1] || "Conforms to Int'l Standards";
        
        let ciDisplay = '';
        if (item.ci && item.ci !== '—') {
          ciDisplay = `C.I. ${item.ci}`;
        } else if (item.ci === '—') {
          ciDisplay = `C.I. —`;
        }

        return `
        <div class="product-card">
          <div class="product-card__header">
            <span class="product-card__badge">${data.badge}</span>
            <span class="product-card__cas">${ciDisplay}</span>
          </div>
          <h4 class="product-card__title">${item.name}</h4>
          <p class="product-card__desc">${data.desc.split('.')[0]}. Excellent affinity, standard yield coloration grade.</p>
          
          <div class="product-card__industries-label">Primary Target Industries</div>
          <div class="product-card__chips">
            <span class="product-card__chip">${ind1}</span>
            <span class="product-card__chip">${ind2}</span>
            <span class="product-card__chip">${ind3}</span>
          </div>
          
          <div class="product-card__features">
            <div class="product-card__feature">
              <svg class="product-card__check" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 6L9 17l-5-5" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
              <span>${f1}</span>
            </div>
            <div class="product-card__feature">
              <svg class="product-card__check" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 6L9 17l-5-5" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
              <span>${f2}</span>
            </div>
          </div>
          
          <div class="product-card__actions">
            <button class="product-card__btn-outline" onclick="showTechnicalSpecs('${item.name.replace(/'/g, "\\'")}', '${(item.ci || '').replace(/'/g, "\\'")}', '${data.badge.replace(/'/g, "\\'")}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              Technical Specs
            </button>
            <button class="product-card__btn-primary" onclick="prefillSampleRequest('${item.name.replace(/'/g, "\\'")}', '${(item.ci || '').replace(/'/g, "\\'")}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8M16 17H8"/></svg>
              Request Sample
            </button>
          </div>
        </div>`;
      })
      .join('');
  }

  // Filter input event
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      modalSearchQuery = e.target.value;
      renderDyeCards();
    });
  }

  // Close main modal
  function closeCategoryModal() {
    modal.classList.remove('is-open');
    if (!specModal || !specModal.classList.contains('is-open')) {
      document.body.style.overflow = '';
    }
  }

  if (modalClose) modalClose.addEventListener('click', closeCategoryModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeCategoryModal);

  // Close Specs Sub-modal
  function closeSpecModal() {
    if (specModal) {
      specModal.classList.remove('is-open');
      if (!modal.classList.contains('is-open')) {
        document.body.style.overflow = '';
      }
    }
  }

  if (specModalClose) specModalClose.addEventListener('click', closeSpecModal);
  if (specModalBackdrop) specModalBackdrop.addEventListener('click', closeSpecModal);
}

// Global functions for card click triggers
window.showTechnicalSpecs = function(dyeName, ci, division) {
  const specModal = document.getElementById('spec-modal');
  if (!specModal) return;

  const title = specModal.querySelector('.spec-modal__title');
  const detailsBody = specModal.querySelector('.spec-modal__body-content');

  if (title) title.textContent = `${dyeName} Technical Specifications`;
  if (detailsBody) {
    detailsBody.innerHTML = `
      <div class="spec-modal__grid">
        <div class="spec-modal__item">
          <span class="spec-modal__label">Dye Class / Division</span>
          <span class="spec-modal__value">${division}</span>
        </div>
        <div class="spec-modal__item">
          <span class="spec-modal__label">C.I. Designation</span>
          <span class="spec-modal__value">${ci || '—'}</span>
        </div>
        <div class="spec-modal__item">
          <span class="spec-modal__label">Assay / Strength</span>
          <span class="spec-modal__value">98.5% Min (Spectrophotometric)</span>
        </div>
        <div class="spec-modal__item">
          <span class="spec-modal__label">Solubility in Water</span>
          <span class="spec-modal__value">Highly Soluble (Water-Based systems)</span>
        </div>
        <div class="spec-modal__item">
          <span class="spec-modal__label">pH Range Stability</span>
          <span class="spec-modal__value">3.5 - 9.0 (Outstanding stability)</span>
        </div>
        <div class="spec-modal__item">
          <span class="spec-modal__label">Heavy Metal Content</span>
          <span class="spec-modal__value">&lt; 10 ppm (AAS Confirmed)</span>
        </div>
        <div class="spec-modal__item">
          <span class="spec-modal__label">Packaging Formats</span>
          <span class="spec-modal__value">25kg Drums, Jumbo Bags, UN Certified IBC</span>
        </div>
      </div>
      <div style="margin-top: 32px; text-align: right;">
        <button class="product-card__btn-primary" style="display:inline-flex" onclick="closeSpecAndPrefill('${dyeName.replace(/'/g, "\\'")}', '${ci.replace(/'/g, "\\'")}')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8M16 17H8"/></svg>
          Request Free Trial Sample
        </button>
      </div>
    `;
  }

  specModal.classList.add('is-open');
  document.body.style.overflow = 'hidden';
};

window.closeSpecAndPrefill = function(dyeName, ci) {
  const specModal = document.getElementById('spec-modal');
  if (specModal) specModal.classList.remove('is-open');
  window.prefillSampleRequest(dyeName, ci);
};

window.prefillSampleRequest = function(dyeName, ci) {
  // Close the catalog modals
  const modal = document.getElementById('catalog-modal');
  if (modal) modal.classList.remove('is-open');
  
  const specModal = document.getElementById('spec-modal');
  if (specModal) specModal.classList.remove('is-open');

  document.body.style.overflow = '';

  // Get contact form elements
  const contactSection = document.getElementById('contact-section');
  const targetCompoundInput = document.getElementById('target-compound');
  const prefillBanner = document.querySelector('.b2b-prefill-banner');
  const prefillName = document.getElementById('prefill-dye-name');

  // Trigger smooth scroll to contact section
  if (contactSection) {
    const navHeight = document.querySelector('.nav')?.offsetHeight || 0;
    const top = contactSection.getBoundingClientRect().top + window.scrollY - navHeight;
    window.scrollTo({ top, behavior: 'smooth' });
  }

  // Switch form to Technical Sample & CoA tab
  const sampleTab = document.getElementById('tab-sample');
  if (sampleTab) sampleTab.click();

  // Prefill field
  if (targetCompoundInput) {
    targetCompoundInput.value = ci && ci !== '—' ? `${dyeName} (C.I. ${ci})` : dyeName;
  }

  // Show prefill alert banner
  if (prefillBanner && prefillName) {
    prefillName.textContent = dyeName;
    prefillBanner.classList.remove('is-hidden');
  }
};

/* ============================================
   B2B CONTACT FORM CONTROLLER
   ============================================ */
function initContactForm() {
  const tabQuote = document.getElementById('tab-quote');
  const tabSample = document.getElementById('tab-sample');
  
  const formTitle = document.querySelector('.b2b-form-title');
  const submitBtn = document.querySelector('.b2b-submit');
  const submitText = document.getElementById('submit-btn-text');
  
  const targetCompoundLabel = document.getElementById('label-compound');
  const targetCompoundInput = document.getElementById('target-compound');
  const prefillBanner = document.querySelector('.b2b-prefill-banner');
  const clearPrefillBtn = document.querySelector('.b2b-prefill-clear');

  const b2bForm = document.getElementById('b2b-form');

  if (!tabQuote || !tabSample || !submitBtn) return;

  let activeFormTab = 'quote'; // 'quote' or 'sample'

  function switchFormTab(tab) {
    activeFormTab = tab;

    if (tab === 'quote') {
      tabQuote.classList.add('is-active');
      tabSample.classList.remove('is-active');
      if (submitText) submitText.textContent = "Initiate Bulk Sales Quote Request";
      if (targetCompoundLabel) targetCompoundLabel.innerHTML = `Target Compound Name / CAS`;
      // Hide prefill banner on Quote tab if they want, but let's keep it clean
      if (prefillBanner) prefillBanner.classList.add('is-hidden');
    } else {
      tabQuote.classList.remove('is-active');
      tabSample.classList.add('is-active');
      if (submitText) submitText.textContent = "Initiate Trial Sample & CoA Request";
      if (targetCompoundLabel) targetCompoundLabel.innerHTML = `Requested Compound for Trial *`;
      // Show prefill banner if it has values
      if (targetCompoundInput && targetCompoundInput.value && prefillBanner) {
        prefillBanner.classList.remove('is-hidden');
      }
    }
  }

  tabQuote.addEventListener('click', (e) => {
    e.preventDefault();
    switchFormTab('quote');
  });

  tabSample.addEventListener('click', (e) => {
    e.preventDefault();
    switchFormTab('sample');
  });

  // Clear Prefill Banner Action
  if (clearPrefillBtn) {
    clearPrefillBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (targetCompoundInput) targetCompoundInput.value = '';
      if (prefillBanner) prefillBanner.classList.add('is-hidden');
      switchFormTab('quote'); // switch back to quote tab
    });
  }

  // Handle Form Submission
  if (b2bForm) {
    b2bForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const nameEl = document.getElementById('contact-name');
      const emailEl = document.getElementById('contact-email');
      const companyEl = document.getElementById('contact-company');
      const compound = targetCompoundInput?.value;

      if ((nameEl && !nameEl.value) || 
          (emailEl && !emailEl.value) || 
          (companyEl && !companyEl.value) || 
          (activeFormTab === 'sample' && !compound)) {
        alert("Please fill in all required fields.");
        return;
      }

      const submitBtn = b2bForm.querySelector('.b2b-submit');
      const originalText = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) submitBtn.innerHTML = 'Sending...';

      try {
        const formData = new FormData(b2bForm);
        const dataObj = Object.fromEntries(formData.entries());
        
        const response = await fetch(b2bForm.action, {
          method: b2bForm.method,
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(dataObj)
        });

        if (response.ok) {
          const name = nameEl?.value || 'there';
          alert(`Thank you, ${name}! Your request has been successfully received.`);
          b2bForm.reset();
          if (prefillBanner) prefillBanner.classList.add('is-hidden');
          switchFormTab('quote');
        } else {
          const errData = await response.json();
          console.error("API Error:", errData);
          alert("Oops! There was a problem submitting your form. Please try again.");
        }
      } catch (error) {
        console.error("Fetch Error:", error);
        alert("Oops! There was a problem submitting your form. Please try again.");
      } finally {
        if (submitBtn) submitBtn.innerHTML = originalText;
      }
    });
  }
}

/* ============================================
   INIT
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
  if (typeof initNavScroll === 'function') initNavScroll();
  if (typeof initScrollProgress === 'function') initScrollProgress();
  if (typeof initReveal === 'function') initReveal();
  if (typeof initCounters === 'function') initCounters();
  if (typeof initMobileNav === 'function') initMobileNav();
  if (typeof initSmoothScroll === 'function') initSmoothScroll();
  if (typeof initGlobe === 'function') initGlobe();
  if (typeof initTrustMarquee === 'function') initTrustMarquee();
  if (typeof initParallax === 'function') initParallax();
  if (typeof initCatalog === 'function') initCatalog();
  if (typeof initContactForm === 'function') initContactForm();
});
