
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav__toggle');
  const close = document.querySelector('.nav__mobile-close');
  const mobileNav = document.getElementById('mobile-nav');

  if(toggle) {
    toggle.addEventListener('click', () => mobileNav.classList.toggle('is-open'));
  }
  if(close) {
    close.addEventListener('click', () => mobileNav.classList.remove('is-open'));
  }

  // Make reveals visible immediately on mobile to prevent JS intersection observer issues
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));
});

window.toggleCertifications = function(gridId = 'cert-grid', btnId = 'cert-toggle-btn') {
  const grid = document.getElementById(gridId);
  const btn = document.getElementById(btnId);
  if (!grid || !btn) return;
  
  const isCollapsed = grid.classList.contains('is-collapsed');
  if (isCollapsed) {
    grid.classList.remove('is-collapsed');
    btn.textContent = 'View Less';
    const cards = grid.querySelectorAll('.cert-card');
    cards.forEach(card => card.classList.add('is-visible'));
  } else {
    grid.classList.add('is-collapsed');
    btn.textContent = 'View More';
    const rect = grid.getBoundingClientRect();
    const navHeight = document.querySelector('.nav') ? document.querySelector('.nav').offsetHeight : 0;
    if (rect.top < navHeight) {
      const topPos = rect.top + window.scrollY - navHeight - 20;
      window.scrollTo({ top: topPos, behavior: 'smooth' });
    }
  }
};
