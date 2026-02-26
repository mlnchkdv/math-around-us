/* ============================================================
   CORE.JS — Ядро «Математика вокруг нас»
   GSAP · ScrollTrigger · KaTeX · Прогресс · Навигация
   ============================================================ */

(function () {
  'use strict';

  /* --- Регистрация плагинов GSAP --- */
  function registerPlugins() {
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }
  }

  /* --- initScrollytelling(section) ---
     Универсальная функция scrollytelling:
     pin визуализации + отслеживание текстовых шагов */
  function initScrollytelling(section) {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    if (!section) return;

    var visual = section.querySelector('.viz-container');
    var steps = section.querySelectorAll('.story-step');
    if (!visual || steps.length === 0) return;

    // Pin визуализации
    ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      pin: visual,
      pinSpacing: false
    });

    // Отслеживание активного шага
    steps.forEach(function (step, i) {
      ScrollTrigger.create({
        trigger: step,
        start: 'top 60%',
        end: 'bottom 40%',
        onEnter: function () { activateStep(steps, i); },
        onEnterBack: function () { activateStep(steps, i); }
      });
    });
  }

  function activateStep(steps, activeIndex) {
    steps.forEach(function (step, i) {
      step.classList.toggle('is-active', i === activeIndex);
    });
    // Генерируем кастомное событие для визуализации
    document.dispatchEvent(new CustomEvent('storytelling:step', {
      detail: { index: activeIndex }
    }));
  }

  /* --- initKaTeX() ---
     Рендеринг формул с delimiters $...$ и $$...$$ */
  function initKaTeX() {
    if (typeof renderMathInElement !== 'function') return;

    renderMathInElement(document.body, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false }
      ],
      throwOnError: false,
      strict: false
    });
  }

  /* --- initProgressBar() ---
     Прогресс чтения страницы (полоска сверху) */
  function initProgressBar() {
    var fill = document.querySelector('.progress-bar__fill');
    if (!fill) return;

    function updateProgress() {
      var scrollTop = window.scrollY;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      fill.style.width = pct + '%';
    }

    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }

  /* --- initNavSidebar() ---
     Подсветка текущей секции в боковой навигации */
  function initNavSidebar() {
    var links = document.querySelectorAll('.nav-sidebar__link');
    if (links.length === 0) return;

    // Сопоставляем ссылки с целевыми секциями
    var sections = [];
    links.forEach(function (link) {
      var href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        var target = document.querySelector(href);
        if (target) sections.push({ link: link, target: target });
      }
    });

    if (sections.length === 0) return;

    function highlight() {
      var scrollY = window.scrollY + window.innerHeight * 0.3;
      var current = sections[0];
      for (var i = 0; i < sections.length; i++) {
        if (sections[i].target.offsetTop <= scrollY) {
          current = sections[i];
        }
      }
      links.forEach(function (l) { l.classList.remove('is-active'); });
      if (current) current.link.classList.add('is-active');
    }

    window.addEventListener('scroll', highlight, { passive: true });
    highlight();

    // Кнопка toggle на мобильных
    var toggle = document.querySelector('.nav-sidebar__toggle');
    var sidebar = document.querySelector('.nav-sidebar');
    if (toggle && sidebar) {
      toggle.addEventListener('click', function () {
        sidebar.classList.toggle('is-open');
      });
      // Закрываем при клике по ссылке
      links.forEach(function (link) {
        link.addEventListener('click', function () {
          sidebar.classList.remove('is-open');
        });
      });
    }
  }

  /* --- initFadeAnimations() ---
     Появление элементов при скролле через GSAP */
  function initFadeAnimations() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    // fade-in-up
    gsap.utils.toArray('.fade-in-up').forEach(function (el) {
      gsap.to(el, {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          once: true
        }
      });
    });

    // fade-in-left
    gsap.utils.toArray('.fade-in-left').forEach(function (el) {
      gsap.to(el, {
        x: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          once: true
        }
      });
    });

    // scale-in
    gsap.utils.toArray('.scale-in').forEach(function (el) {
      gsap.to(el, {
        scale: 1,
        opacity: 1,
        duration: 0.6,
        ease: 'back.out(1.4)',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          once: true
        }
      });
    });

    // reveal-text
    gsap.utils.toArray('.reveal-text').forEach(function (el) {
      gsap.to(el, {
        clipPath: 'inset(0 0% 0 0)',
        opacity: 1,
        duration: 1,
        ease: 'power3.inOut',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          once: true
        }
      });
    });
  }

  /* --- initChapterNavigation() ---
     Кнопки «Назад» / «Далее» */
  function initChapterNavigation() {
    var prevBtn = document.querySelector('.chapter-nav__link--prev');
    var nextBtn = document.querySelector('.chapter-nav__link--next');

    // Навигация через клавиши
    document.addEventListener('keydown', function (e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowLeft' && prevBtn) {
        window.location.href = prevBtn.getAttribute('href');
      }
      if (e.key === 'ArrowRight' && nextBtn) {
        window.location.href = nextBtn.getAttribute('href');
      }
    });
  }

  /* --- initHeroCanvas() ---
     Анимированные математические символы на canvas */
  function initHeroCanvas() {
    var canvas = document.querySelector('.hero__canvas canvas');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    var symbols = ['∑', 'π', 'φ', '∫', '∞', '√', 'Δ', 'λ', 'θ', '∂'];
    var particles = [];
    var animId;

    function resize() {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    }

    function createParticle() {
      return {
        x: Math.random() * canvas.width,
        y: canvas.height + 20,
        symbol: symbols[Math.floor(Math.random() * symbols.length)],
        size: 14 + Math.random() * 20,
        speedY: -(0.3 + Math.random() * 0.5),
        speedX: (Math.random() - 0.5) * 0.3,
        opacity: 0,
        maxOpacity: 0.08 + Math.random() * 0.12,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.005
      };
    }

    function init() {
      resize();
      var count = Math.floor(canvas.width / 80);
      for (var i = 0; i < count; i++) {
        var p = createParticle();
        p.y = Math.random() * canvas.height;
        p.opacity = p.maxOpacity;
        particles.push(p);
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Occasionally spawn new particles
      if (Math.random() < 0.03 && particles.length < 30) {
        particles.push(createParticle());
      }

      for (var i = particles.length - 1; i >= 0; i--) {
        var p = particles[i];
        p.y += p.speedY;
        p.x += p.speedX;
        p.rotation += p.rotationSpeed;

        // Fade in / out
        var progress = 1 - (p.y / canvas.height);
        if (progress < 0.1) {
          p.opacity = p.maxOpacity * (progress / 0.1);
        } else if (progress > 0.9) {
          p.opacity = p.maxOpacity * ((1 - progress) / 0.1);
        } else {
          p.opacity = p.maxOpacity;
        }

        // Remove off-screen particles
        if (p.y < -40) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity;
        ctx.font = p.size + 'px "JetBrains Mono", monospace';
        ctx.fillStyle = '#e8eaf0';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.symbol, 0, 0);
        ctx.restore();
      }

      animId = requestAnimationFrame(animate);
    }

    window.addEventListener('resize', debounce(resize, 200));
    init();
    animate();

    // Cleanup on page navigation
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        cancelAnimationFrame(animId);
      } else {
        animate();
      }
    });
  }

  /* --- initHeroAnimation() ---
     GSAP text-reveal для hero */
  function initHeroAnimation() {
    if (typeof gsap === 'undefined') return;

    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.from('.hero__title', {
      y: 40,
      opacity: 0,
      duration: 1,
      delay: 0.3
    })
    .from('.hero__subtitle', {
      y: 30,
      opacity: 0,
      duration: 0.8
    }, '-=0.5')
    .from('.hero__cta', {
      y: 20,
      opacity: 0,
      duration: 0.6
    }, '-=0.4');
  }

  /* --- initSmoothScroll() ---
     Плавный скролл для якорных ссылок */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var target = document.querySelector(this.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  /* --- DOMContentLoaded --- */
  document.addEventListener('DOMContentLoaded', function () {
    registerPlugins();

    // Общие функции для всех страниц
    initProgressBar();
    initFadeAnimations();
    initSmoothScroll();
    initChapterNavigation();

    // KaTeX — ждём загрузки скрипта (defer)
    if (typeof renderMathInElement === 'function') {
      initKaTeX();
    } else {
      document.addEventListener('DOMContentLoaded', initKaTeX);
      // Fallback: ждём ещё немного для defer-скриптов
      window.addEventListener('load', initKaTeX);
    }

    // Навигация (если есть sidebar)
    if (document.querySelector('.nav-sidebar')) {
      initNavSidebar();
    }

    // Scrollytelling секции
    document.querySelectorAll('.scroll-section').forEach(function (section) {
      initScrollytelling(section);
    });

    // Hero (только на главной)
    if (document.querySelector('.hero')) {
      initHeroCanvas();
      initHeroAnimation();
    }
  });

  // Экспортируем утилиты в глобальный объект для использования в главах
  window.MathSite = {
    initScrollytelling: initScrollytelling,
    initKaTeX: initKaTeX,
    initProgressBar: initProgressBar,
    initNavSidebar: initNavSidebar,
    initFadeAnimations: initFadeAnimations
  };

})();
