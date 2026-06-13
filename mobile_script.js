
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav__toggle');
  const close = document.querySelector('.nav__mobile-close');
  const mobileNav = document.getElementById('mobile-nav');

  if(toggle) {
    toggle.addEventListener('click', () => mobileNav.classList.add('is-open'));
  }
  if(close) {
    close.addEventListener('click', () => mobileNav.classList.remove('is-open'));
  }

  // Make reveals visible immediately on mobile to prevent JS intersection observer issues
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));
});
