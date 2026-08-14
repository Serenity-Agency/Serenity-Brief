const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const header = document.querySelector('[data-header]');
const progress = document.querySelector('.page-progress span');
const menuButton = document.querySelector('.menu-toggle');
const menu = document.querySelector('#mobile-menu');
const revealItems = document.querySelectorAll('.reveal');

const updateScrollState = () => {
  const top = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  header?.classList.toggle('scrolled', top > 40);
  if (progress) progress.style.transform = `scaleX(${max > 0 ? top / max : 0})`;
};

updateScrollState();
window.addEventListener('scroll', updateScrollState, { passive: true });

if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

const closeMenu = () => {
  menuButton?.setAttribute('aria-expanded', 'false');
  if (menu) menu.hidden = true;
  document.body.classList.remove('menu-open');
};

menuButton?.addEventListener('click', () => {
  const willOpen = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(willOpen));
  if (menu) menu.hidden = !willOpen;
  document.body.classList.toggle('menu-open', willOpen);
});

menu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

document.querySelectorAll('.process-steps details').forEach((detail) => {
  detail.addEventListener('toggle', () => {
    if (!detail.open) return;
    document.querySelectorAll('.process-steps details').forEach((other) => {
      if (other !== detail) other.open = false;
    });
  });
});

const awardSet = document.querySelector('.award-set');
const awardMarquee = document.querySelector('[data-awards-marquee]');
const awardTrack = awardMarquee?.querySelector('.marquee-track');
const awardPrevious = document.querySelector('[data-awards-prev]');
const awardNext = document.querySelector('[data-awards-next]');

if (awardSet && awardMarquee && awardTrack) {
  if (reducedMotion.matches) {
    const scrollAwards = (direction) => awardMarquee.scrollBy({ left: direction * awardMarquee.clientWidth * 0.7, behavior: 'auto' });
    awardPrevious?.addEventListener('click', () => scrollAwards(-1));
    awardNext?.addEventListener('click', () => scrollAwards(1));
  } else {
    const clone = awardSet.cloneNode(true);
    clone.classList.add('is-clone');
    clone.setAttribute('aria-hidden', 'true');
    clone.querySelectorAll('img').forEach((image) => image.setAttribute('alt', ''));
    awardSet.after(clone);

    let loopWidth = 1;
    let offset = 0;
    let previousFrame = performance.now();
    let isHovered = false;
    let isFocused = false;
    let isDragging = false;
    let dragStartX = 0;
    let dragStartOffset = 0;

    const wrapOffset = (value) => ((value % loopWidth) + loopWidth) % loopWidth;
    const renderAwards = () => { awardTrack.style.transform = `translate3d(${-offset}px, 0, 0)`; };
    const measureAwards = () => {
      loopWidth = awardSet.getBoundingClientRect().width || 1;
      offset = wrapOffset(offset);
      renderAwards();
    };
    const moveAwards = (distance) => {
      offset = wrapOffset(offset + distance);
      renderAwards();
    };
    const animateAwards = (now) => {
      const elapsed = Math.min(now - previousFrame, 64);
      previousFrame = now;
      if (!isHovered && !isFocused && !isDragging) moveAwards(elapsed * 0.022);
      requestAnimationFrame(animateAwards);
    };

    awardMarquee.addEventListener('mouseenter', () => { isHovered = true; });
    awardMarquee.addEventListener('mouseleave', () => { isHovered = false; });
    awardMarquee.addEventListener('focusin', () => { isFocused = true; });
    awardMarquee.addEventListener('focusout', () => { isFocused = false; });
    awardMarquee.addEventListener('dragstart', (event) => event.preventDefault());
    awardMarquee.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) return;
      isDragging = true;
      dragStartX = event.clientX;
      dragStartOffset = offset;
      awardMarquee.classList.add('is-dragging');
      awardMarquee.setPointerCapture(event.pointerId);
    });
    awardMarquee.addEventListener('pointermove', (event) => {
      if (!isDragging) return;
      offset = wrapOffset(dragStartOffset - (event.clientX - dragStartX));
      renderAwards();
    });
    const stopAwardsDrag = (event) => {
      if (!isDragging) return;
      isDragging = false;
      awardMarquee.classList.remove('is-dragging');
      if (awardMarquee.hasPointerCapture(event.pointerId)) awardMarquee.releasePointerCapture(event.pointerId);
    };
    awardMarquee.addEventListener('pointerup', stopAwardsDrag);
    awardMarquee.addEventListener('pointercancel', stopAwardsDrag);
    awardPrevious?.addEventListener('click', () => moveAwards(-Math.min(520, awardMarquee.clientWidth * 0.65)));
    awardNext?.addEventListener('click', () => moveAwards(Math.min(520, awardMarquee.clientWidth * 0.65)));
    window.addEventListener('resize', measureAwards);
    measureAwards();
    requestAnimationFrame(animateAwards);
  }
}

const mockup = document.querySelector('[data-tilt]');
if (mockup && !reducedMotion.matches && window.matchMedia('(pointer: fine)').matches) {
  mockup.addEventListener('pointermove', (event) => {
    const rect = mockup.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    mockup.style.transform = `perspective(1400px) rotateX(${-y * 1.4}deg) rotateY(${x * 1.4}deg)`;
  });
  mockup.addEventListener('pointerleave', () => { mockup.style.transform = ''; });
}
