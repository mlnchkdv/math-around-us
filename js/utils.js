/* ============================================================
   UTILS.JS — Утилиты «Математика вокруг нас»
   ============================================================ */

/**
 * Debounce — откладывает вызов до паузы в событиях
 * @param {Function} fn
 * @param {number} delay — мс
 * @returns {Function}
 */
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Throttle — вызывает не чаще чем раз в delay мс
 * @param {Function} fn
 * @param {number} delay — мс
 * @returns {Function}
 */
function throttle(fn, delay) {
  let last = 0;
  let timer;
  return function (...args) {
    const now = Date.now();
    const remaining = delay - (now - last);
    clearTimeout(timer);
    if (remaining <= 0) {
      last = now;
      fn.apply(this, args);
    } else {
      timer = setTimeout(() => {
        last = Date.now();
        fn.apply(this, args);
      }, remaining);
    }
  };
}

/**
 * Линейная интерполяция
 * @param {number} a — начало
 * @param {number} b — конец
 * @param {number} t — 0..1
 * @returns {number}
 */
function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Перевод значения из одного диапазона в другой
 * @param {number} value
 * @param {number} inMin
 * @param {number} inMax
 * @param {number} outMin
 * @param {number} outMax
 * @returns {number}
 */
function mapRange(value, inMin, inMax, outMin, outMax) {
  return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
}

/**
 * Создаёт адаптивный SVG с viewBox и ResizeObserver
 * @param {HTMLElement|string} container — элемент или CSS-селектор
 * @param {number} aspectRatio — ширина / высота (напр. 16/9)
 * @returns {{ svg: SVGSVGElement, width: number, height: number, onResize: function }}
 */
function createResponsiveSVG(container, aspectRatio) {
  if (typeof container === 'string') {
    container = document.querySelector(container);
  }
  if (!container) {
    console.warn('createResponsiveSVG: контейнер не найден');
    return null;
  }

  const baseWidth = 800;
  const baseHeight = Math.round(baseWidth / aspectRatio);

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${baseWidth} ${baseHeight}`);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svg.style.width = '100%';
  svg.style.height = '100%';
  container.appendChild(svg);

  const state = { svg, width: baseWidth, height: baseHeight };
  const callbacks = [];

  const ro = new ResizeObserver(
    debounce(() => {
      const rect = container.getBoundingClientRect();
      state.width = rect.width;
      state.height = rect.width / aspectRatio;
      callbacks.forEach(cb => cb(state.width, state.height));
    }, 100)
  );
  ro.observe(container);

  state.onResize = function (cb) {
    callbacks.push(cb);
  };

  return state;
}

/**
 * Форматирование чисел (с разделителями, десятичные знаки)
 * @param {number} n
 * @param {number} [decimals=0]
 * @returns {string}
 */
function formatNumber(n, decimals) {
  if (decimals === undefined) decimals = 0;
  return n.toLocaleString('ru-RU', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

/**
 * Определение мобильного устройства
 * @returns {boolean}
 */
function isMobile() {
  return window.innerWidth < 768 ||
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}
