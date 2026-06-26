// === Студия «Олимпия» — клиентский JS ===
// 1) мобильное меню (open/close + автозакрытие при клике по ссылке)
// 2) lightbox для галереи
// 3) reveal-on-scroll через IntersectionObserver
// 4) лёгкий parallax на фоновых картинках секций

document.addEventListener('DOMContentLoaded', () => {

  /* === Мобильное меню === */
  const toggle = document.getElementById('menu-toggle');
  const menu   = document.getElementById('mobile-menu');

  if (toggle && menu) {
    toggle.addEventListener('click', () => menu.classList.toggle('hidden'));
    menu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => menu.classList.add('hidden'));
    });
  }

  /* === Lightbox === */
  const lightbox    = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const closeBtn    = document.getElementById('lightbox-close');

  if (lightbox && lightboxImg) {
    document.querySelectorAll('.gallery-item').forEach(item => {
      item.addEventListener('click', () => {
        const src = item.dataset.src;
        if (!src) return;
        lightboxImg.src = src;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    });

    const close = () => {
      lightbox.classList.remove('active');
      lightboxImg.src = '';
      document.body.style.overflow = '';
    };

    closeBtn?.addEventListener('click', close);
    lightbox.addEventListener('click', e => {
      if (e.target === lightbox) close();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && lightbox.classList.contains('active')) close();
    });
  }

  /* === Reveal-on-scroll === */
  // Уважаем prefers-reduced-motion: если пользователь не хочет анимаций — сразу показываем.
  // Также параметр ?show в URL форсирует показ всего сразу (для отладки/скриншотов).
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const forceShow    = new URLSearchParams(location.search).has('show');

  const reveals = document.querySelectorAll('.reveal, .reveal-stagger');
  if (reduceMotion || forceShow) {
    reveals.forEach(el => el.classList.add('is-visible'));
  } else if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('is-visible'));
  }

  /* === Лёгкий parallax на фоновых картинках === */
  // На мобильных не делаем — лишняя нагрузка и iOS-баги.
  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  if (!reduceMotion && !isMobile) {
    const parallaxImgs = document.querySelectorAll('.parallax-bg');
    let ticking = false;

    const updateParallax = () => {
      const wh = window.innerHeight;
      parallaxImgs.forEach(img => {
        const parent = img.closest('section');
        if (!parent) return;
        const rect = parent.getBoundingClientRect();
        // только секции, попавшие в зону видимости
        if (rect.bottom < 0 || rect.top > wh) return;
        // расстояние от центра viewport до центра секции, нормированное к -1..1
        const center = rect.top + rect.height / 2 - wh / 2;
        const ratio  = Math.max(-1, Math.min(1, center / wh));
        // сдвигаем фон в противоход — амплитуда ±20px
        const shift  = -ratio * 20;
        img.style.transform = `translate3d(0, ${shift}px, 0) scale(1.08)`;
      });
      ticking = false;
    };

    // выставить scale(1.08) сразу, чтобы при сдвиге не появлялись пустые края
    parallaxImgs.forEach(img => { img.style.transform = 'scale(1.08)'; });
    updateParallax();

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });

    window.addEventListener('resize', updateParallax);
  }

});
