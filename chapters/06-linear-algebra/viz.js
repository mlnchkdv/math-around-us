/* ============================================================
   VIZ.JS — Глава 6: Линейная алгебра — язык данных
   Scrollytelling · 2D Transforms · Eigenvectors
   ============================================================ */
(function () {
  'use strict';

  function getCSSVar(n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }

  /* ================================================================
     1. ScrollViz — Scrollytelling
     ================================================================ */
  function ScrollViz(sel) {
    this.container = document.querySelector(sel);
    if (!this.container) return;
    this.w = 800; this.h = 800; this.step = 0; this.svg = null; this.layers = {};
  }

  ScrollViz.prototype.init = function () {
    if (!this.container) return;
    var el = this.container.querySelector('svg');
    if (!el) return;
    this.svg = d3.select(el)
      .attr('viewBox', '0 0 ' + this.w + ' ' + this.h)
      .attr('preserveAspectRatio', 'xMidYMid meet');
    this.svg.selectAll('*').remove();

    var names = ['vector', 'transform', 'eigen', 'ml'];
    var self = this;
    names.forEach(function (n) {
      self.layers[n] = self.svg.append('g').attr('class', 'layer-' + n)
        .style('opacity', 0).style('display', 'none');
    });
    this.goToStep(1);
    return this;
  };

  ScrollViz.prototype.goToStep = function (s) {
    if (s === this.step) return;
    this.step = s;
    var self = this;
    Object.keys(this.layers).forEach(function (k) {
      self.layers[k].interrupt();
      self.layers[k].style('opacity', 0).style('display', 'none');
    });
    switch (s) {
      case 1: this.drawVector(); break;
      case 2: this.drawTransform(); break;
      case 3: this.drawEigen(); break;
      case 4: this.drawML(); break;
    }
  };

  ScrollViz.prototype._grid = function (g, cx, cy, size, step) {
    var c = getCSSVar('--text-muted') || '#64748b';
    for (var v = -size; v <= size; v += step) {
      g.append('line').attr('x1', cx + v).attr('y1', cy - size).attr('x2', cx + v).attr('y2', cy + size)
        .attr('stroke', c).attr('stroke-width', 0.5).attr('opacity', 0.3);
      g.append('line').attr('x1', cx - size).attr('y1', cy + v).attr('x2', cx + size).attr('y2', cy + v)
        .attr('stroke', c).attr('stroke-width', 0.5).attr('opacity', 0.3);
    }
    // axes
    g.append('line').attr('x1', cx - size).attr('y1', cy).attr('x2', cx + size).attr('y2', cy)
      .attr('stroke', c).attr('stroke-width', 1.5).attr('opacity', 0.6);
    g.append('line').attr('x1', cx).attr('y1', cy - size).attr('x2', cx).attr('y2', cy + size)
      .attr('stroke', c).attr('stroke-width', 1.5).attr('opacity', 0.6);
  };

  ScrollViz.prototype._arrow = function (g, cx, cy, dx, dy, scale, color, label) {
    var x2 = cx + dx * scale, y2 = cy - dy * scale;
    g.append('line').attr('x1', cx).attr('y1', cy).attr('x2', x2).attr('y2', y2)
      .attr('stroke', color).attr('stroke-width', 3).attr('marker-end', 'none');
    // arrowhead
    var angle = Math.atan2(-(dy * scale), dx * scale);
    var hs = 12;
    g.append('polygon')
      .attr('points', [
        [x2, y2],
        [x2 - hs * Math.cos(angle - 0.4), y2 + hs * Math.sin(angle - 0.4)],
        [x2 - hs * Math.cos(angle + 0.4), y2 + hs * Math.sin(angle + 0.4)]
      ].map(function (p) { return p.join(','); }).join(' '))
      .attr('fill', color);
    if (label) {
      g.append('text').attr('x', x2 + 10).attr('y', y2 - 10)
        .attr('fill', color).attr('font-family', 'JetBrains Mono, monospace')
        .attr('font-size', '14px').text(label);
    }
  };

  /* Step 1: Vector on grid */
  ScrollViz.prototype.drawVector = function () {
    var g = this.layers.vector;
    g.selectAll('*').remove(); g.style('display', 'block');
    var cx = this.w / 2, cy = this.h / 2, sc = 80;
    this._grid(g, cx, cy, 300, sc);
    this._arrow(g, cx, cy, 3, 2, sc, getCSSVar('--accent-violet') || '#8b5cf6', 'v = (3, 2)');
    g.append('text').attr('x', cx).attr('y', 60).attr('text-anchor', 'middle')
      .attr('fill', getCSSVar('--text-primary') || '#e8eaf0')
      .attr('font-family', 'Playfair Display, serif').attr('font-size', '20px')
      .text('Вектор на координатной плоскости');
    g.transition().duration(600).style('opacity', 1);
  };

  /* Step 2: Matrix transforms vector (rotation animation) */
  ScrollViz.prototype.drawTransform = function () {
    var g = this.layers.transform;
    g.selectAll('*').remove(); g.style('display', 'block');
    var cx = this.w / 2, cy = this.h / 2, sc = 80;
    var violet = getCSSVar('--accent-violet') || '#8b5cf6';
    var amber = getCSSVar('--accent-amber') || '#f59e0b';
    this._grid(g, cx, cy, 300, sc);

    // Original vector
    this._arrow(g, cx, cy, 3, 1, sc, violet, 'до');

    // Rotated vector (45 degrees)
    var theta = Math.PI / 4;
    var ox = 3, oy = 1;
    var nx = ox * Math.cos(theta) - oy * Math.sin(theta);
    var ny = ox * Math.sin(theta) + oy * Math.cos(theta);
    this._arrow(g, cx, cy, nx, ny, sc, amber, 'после');

    // Curved arrow showing rotation
    var r = 60;
    var arc = d3.arc().innerRadius(r - 2).outerRadius(r + 2)
      .startAngle(-Math.atan2(oy, ox)).endAngle(-Math.atan2(oy, ox) + theta);
    g.append('path').attr('d', arc())
      .attr('transform', 'translate(' + cx + ',' + cy + ') scale(1,-1)')
      .attr('fill', getCSSVar('--text-muted') || '#64748b').attr('opacity', 0.6);

    g.append('text').attr('x', cx).attr('y', 60).attr('text-anchor', 'middle')
      .attr('fill', getCSSVar('--text-primary') || '#e8eaf0')
      .attr('font-family', 'Playfair Display, serif').attr('font-size', '20px')
      .text('Матрица поворота × вектор');
    g.transition().duration(600).style('opacity', 1);
  };

  /* Step 3: Eigenvectors */
  ScrollViz.prototype.drawEigen = function () {
    var g = this.layers.eigen;
    g.selectAll('*').remove(); g.style('display', 'block');
    var cx = this.w / 2, cy = this.h / 2, sc = 80;
    var violet = getCSSVar('--accent-violet') || '#8b5cf6';
    var amber = getCSSVar('--accent-amber') || '#f59e0b';
    var blue = getCSSVar('--accent-blue') || '#3b82f6';
    this._grid(g, cx, cy, 300, sc);

    // Regular vector: gets rotated
    this._arrow(g, cx, cy, 1, 2, sc, blue, 'обычный');
    this._arrow(g, cx, cy, 2.5, 0.5, sc, 'rgba(59,130,246,0.4)');

    // Eigenvector: only scaled
    this._arrow(g, cx, cy, 1, 1, sc, amber, 'собственный');
    this._arrow(g, cx, cy, 2, 2, sc, amber);
    // dashed extension
    g.append('line').attr('x1', cx + sc).attr('y1', cy - sc).attr('x2', cx + 2 * sc).attr('y2', cy - 2 * sc)
      .attr('stroke', amber).attr('stroke-width', 1.5).attr('stroke-dasharray', '6 4').attr('opacity', 0.5);

    g.append('text').attr('x', cx).attr('y', 60).attr('text-anchor', 'middle')
      .attr('fill', getCSSVar('--text-primary') || '#e8eaf0')
      .attr('font-family', 'Playfair Display, serif').attr('font-size', '20px')
      .text('Собственный вектор: Av = λv');
    g.transition().duration(600).style('opacity', 1);
  };

  /* Step 4: ML pipeline */
  ScrollViz.prototype.drawML = function () {
    var g = this.layers.ml;
    g.selectAll('*').remove(); g.style('display', 'block');
    var w = this.w, h = this.h;
    var violet = getCSSVar('--accent-violet') || '#8b5cf6';
    var blue = getCSSVar('--accent-blue') || '#3b82f6';
    var amber = getCSSVar('--accent-amber') || '#f59e0b';
    var tp = getCSSVar('--text-primary') || '#e8eaf0';
    var tm = getCSSVar('--text-muted') || '#64748b';

    var boxes = [
      { x: 100, label: 'Данные\n(матрица)', color: blue },
      { x: 300, label: 'Веса\n(матрица)', color: violet },
      { x: 500, label: 'Умножение\nAx = y', color: amber },
      { x: 700, label: 'Предсказание\n(вектор)', color: getCSSVar('--accent-emerald') || '#10b981' }
    ];
    var bw = 130, bh = 80, cy = h / 2;

    boxes.forEach(function (b, i) {
      g.append('rect').attr('x', b.x - bw / 2).attr('y', cy - bh / 2)
        .attr('width', bw).attr('height', bh).attr('rx', 12)
        .attr('fill', 'none').attr('stroke', b.color).attr('stroke-width', 2)
        .attr('opacity', 0).transition().delay(i * 300).duration(500).attr('opacity', 0.8);
      var lines = b.label.split('\n');
      lines.forEach(function (line, li) {
        g.append('text').attr('x', b.x).attr('y', cy - 6 + li * 20)
          .attr('text-anchor', 'middle').attr('fill', tp)
          .attr('font-family', 'JetBrains Mono, monospace').attr('font-size', '13px')
          .text(line).attr('opacity', 0).transition().delay(i * 300 + 200).duration(400).attr('opacity', 1);
      });
      if (i < boxes.length - 1) {
        g.append('line').attr('x1', b.x + bw / 2 + 5).attr('y1', cy)
          .attr('x2', boxes[i + 1].x - bw / 2 - 5).attr('y2', cy)
          .attr('stroke', tm).attr('stroke-width', 2).attr('marker-end', 'none')
          .attr('opacity', 0).transition().delay(i * 300 + 100).duration(400).attr('opacity', 0.5);
      }
    });

    g.append('text').attr('x', w / 2).attr('y', 60).attr('text-anchor', 'middle')
      .attr('fill', tp).attr('font-family', 'Playfair Display, serif').attr('font-size', '20px')
      .text('ML = матричные операции');
    g.transition().duration(600).style('opacity', 1);
  };

  /* ================================================================
     2. TransformInteractive — 2D Linear Transforms
     ================================================================ */
  function TransformInteractive(sel) {
    this.container = document.querySelector(sel);
    if (!this.container) return;
    this.w = 800; this.h = 600; this.svg = null;
    this.scale = 60;
  }

  TransformInteractive.prototype.init = function () {
    if (!this.container) return;
    this.svg = d3.select(this.container).append('svg')
      .attr('viewBox', '0 0 ' + this.w + ' ' + this.h)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('width', '100%').style('height', '100%');

    var self = this;
    var ids = ['m-a11', 'm-a12', 'm-a21', 'm-a22'];
    ids.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('input', function () { self.draw(); });
    });

    // Presets
    var presets = {
      rotate45: [0.707, -0.707, 0.707, 0.707],
      scale2: [2, 0, 0, 2],
      reflect: [-1, 0, 0, 1],
      shear: [1, 0.5, 0, 1],
      squeeze: [2, 0, 0, 0.5],
      identity: [1, 0, 0, 1]
    };
    document.querySelectorAll('[data-preset]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var p = presets[this.dataset.preset];
        if (!p) return;
        document.getElementById('m-a11').value = p[0];
        document.getElementById('m-a12').value = p[1];
        document.getElementById('m-a21').value = p[2];
        document.getElementById('m-a22').value = p[3];
        self.draw();
      });
    });

    this.draw();
    return this;
  };

  TransformInteractive.prototype._getMatrix = function () {
    return [
      parseFloat(document.getElementById('m-a11').value) || 0,
      parseFloat(document.getElementById('m-a12').value) || 0,
      parseFloat(document.getElementById('m-a21').value) || 0,
      parseFloat(document.getElementById('m-a22').value) || 0
    ];
  };

  TransformInteractive.prototype.draw = function () {
    if (!this.svg) return;
    this.svg.selectAll('*').remove();
    var w = this.w, h = this.h, sc = this.scale;
    var cx = w / 2, cy = h / 2;
    var m = this._getMatrix();
    var a11 = m[0], a12 = m[1], a21 = m[2], a22 = m[3];
    var det = a11 * a22 - a12 * a21;

    var muted = getCSSVar('--text-muted') || '#64748b';
    var violet = getCSSVar('--accent-violet') || '#8b5cf6';
    var amber = getCSSVar('--accent-amber') || '#f59e0b';
    var blue = getCSSVar('--accent-blue') || '#3b82f6';
    var tp = getCSSVar('--text-primary') || '#e8eaf0';

    // Original grid (light)
    for (var i = -5; i <= 5; i++) {
      this.svg.append('line').attr('x1', cx + i * sc).attr('y1', cy - 5 * sc).attr('x2', cx + i * sc).attr('y2', cy + 5 * sc)
        .attr('stroke', muted).attr('stroke-width', 0.5).attr('opacity', 0.2);
      this.svg.append('line').attr('x1', cx - 5 * sc).attr('y1', cy + i * sc).attr('x2', cx + 5 * sc).attr('y2', cy + i * sc)
        .attr('stroke', muted).attr('stroke-width', 0.5).attr('opacity', 0.2);
    }
    // Axes
    this.svg.append('line').attr('x1', cx - 5 * sc).attr('y1', cy).attr('x2', cx + 5 * sc).attr('y2', cy)
      .attr('stroke', muted).attr('stroke-width', 1).attr('opacity', 0.4);
    this.svg.append('line').attr('x1', cx).attr('y1', cy - 5 * sc).attr('x2', cx).attr('y2', cy + 5 * sc)
      .attr('stroke', muted).attr('stroke-width', 1).attr('opacity', 0.4);

    // Transformed grid lines
    for (var j = -5; j <= 5; j++) {
      // vertical line at x=j: transformed: (a11*j + a12*t, a21*j + a22*t)
      var vx1 = cx + (a11 * j + a12 * (-5)) * sc;
      var vy1 = cy - (a21 * j + a22 * (-5)) * sc;
      var vx2 = cx + (a11 * j + a12 * 5) * sc;
      var vy2 = cy - (a21 * j + a22 * 5) * sc;
      this.svg.append('line').attr('x1', vx1).attr('y1', vy1).attr('x2', vx2).attr('y2', vy2)
        .attr('stroke', violet).attr('stroke-width', 0.8).attr('opacity', 0.35);
      // horizontal line at y=j
      var hx1 = cx + (a11 * (-5) + a12 * j) * sc;
      var hy1 = cy - (a21 * (-5) + a22 * j) * sc;
      var hx2 = cx + (a11 * 5 + a12 * j) * sc;
      var hy2 = cy - (a21 * 5 + a22 * j) * sc;
      this.svg.append('line').attr('x1', hx1).attr('y1', hy1).attr('x2', hx2).attr('y2', hy2)
        .attr('stroke', blue).attr('stroke-width', 0.8).attr('opacity', 0.35);
    }

    // Unit square (original)
    var sq = [[0, 0], [1, 0], [1, 1], [0, 1]];
    var sqPts = sq.map(function (p) { return (cx + p[0] * sc) + ',' + (cy - p[1] * sc); }).join(' ');
    this.svg.append('polygon').attr('points', sqPts)
      .attr('fill', 'rgba(100,100,100,0.1)').attr('stroke', muted).attr('stroke-width', 1).attr('stroke-dasharray', '4 3');

    // Transformed unit square
    var tsq = sq.map(function (p) {
      return [(a11 * p[0] + a12 * p[1]), (a21 * p[0] + a22 * p[1])];
    });
    var tsqPts = tsq.map(function (p) { return (cx + p[0] * sc) + ',' + (cy - p[1] * sc); }).join(' ');
    this.svg.append('polygon').attr('points', tsqPts)
      .attr('fill', 'rgba(139,92,246,0.15)').attr('stroke', violet).attr('stroke-width', 2);

    // Basis vectors transformed
    var drawArrow = function (svg, fx, fy, color, lbl) {
      var ex = cx + fx * sc, ey = cy - fy * sc;
      svg.append('line').attr('x1', cx).attr('y1', cy).attr('x2', ex).attr('y2', ey)
        .attr('stroke', color).attr('stroke-width', 3);
      var ang = Math.atan2(-fy * sc, fx * sc);
      var hs = 10;
      svg.append('polygon').attr('points', [
        [ex, ey],
        [ex - hs * Math.cos(ang - 0.4), ey + hs * Math.sin(ang - 0.4)],
        [ex - hs * Math.cos(ang + 0.4), ey + hs * Math.sin(ang + 0.4)]
      ].map(function (p) { return p.join(','); }).join(' ')).attr('fill', color);
      if (lbl) svg.append('text').attr('x', ex + 8).attr('y', ey - 8)
        .attr('fill', color).attr('font-family', 'JetBrains Mono, monospace').attr('font-size', '12px').text(lbl);
    };
    drawArrow(this.svg, a11, a21, amber, 'e₁\'');
    drawArrow(this.svg, a12, a22, getCSSVar('--accent-cyan') || '#06b6d4', 'e₂\'');

    // Determinant
    var detEl = document.getElementById('det-display');
    if (detEl) detEl.innerHTML = 'det(A) = <strong>' + det.toFixed(3) + '</strong>' +
      (Math.abs(det) < 0.001 ? ' — <em style="color:var(--accent-rose)">вырожденная!</em>' : '');
  };

  /* ================================================================
     3. EigenInteractive — Eigenvector visualization
     ================================================================ */
  function EigenInteractive(sel) {
    this.container = document.querySelector(sel);
    if (!this.container) return;
    this.w = 800; this.h = 600; this.svg = null; this.scale = 60;
  }

  EigenInteractive.prototype.init = function () {
    if (!this.container) return;
    this.svg = d3.select(this.container).append('svg')
      .attr('viewBox', '0 0 ' + this.w + ' ' + this.h)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('width', '100%').style('height', '100%');

    var self = this;
    ['e-a11', 'e-a12', 'e-a21', 'e-a22'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('input', function () { self.drawInitial(); });
    });

    var btn = document.getElementById('eigen-animate-btn');
    if (btn) btn.addEventListener('click', function () { self.animate(); });

    this.drawInitial();
    return this;
  };

  EigenInteractive.prototype._getMatrix = function () {
    return [
      parseFloat(document.getElementById('e-a11').value) || 0,
      parseFloat(document.getElementById('e-a12').value) || 0,
      parseFloat(document.getElementById('e-a21').value) || 0,
      parseFloat(document.getElementById('e-a22').value) || 0
    ];
  };

  EigenInteractive.prototype._computeEigen = function (m) {
    // 2x2 eigenvalues: λ² - (a+d)λ + (ad-bc) = 0
    var a = m[0], b = m[1], c = m[2], d = m[3];
    var trace = a + d;
    var det = a * d - b * c;
    var disc = trace * trace - 4 * det;
    if (disc < 0) return { values: [], vectors: [] };
    var sq = Math.sqrt(disc);
    var l1 = (trace + sq) / 2;
    var l2 = (trace - sq) / 2;
    var vectors = [];
    [l1, l2].forEach(function (lam) {
      var vx, vy;
      if (Math.abs(b) > 1e-8) {
        vx = b; vy = lam - a;
      } else if (Math.abs(c) > 1e-8) {
        vx = lam - d; vy = c;
      } else {
        vx = 1; vy = 0;
        if (Math.abs(lam - d) < 1e-8 && Math.abs(lam - a) > 1e-8) { vx = 0; vy = 1; }
      }
      var len = Math.sqrt(vx * vx + vy * vy);
      if (len > 1e-8) { vx /= len; vy /= len; }
      vectors.push([vx, vy]);
    });
    return { values: [l1, l2], vectors: vectors };
  };

  EigenInteractive.prototype.drawInitial = function () {
    if (!this.svg) return;
    this.svg.selectAll('*').remove();
    var w = this.w, h = this.h, sc = this.scale;
    var cx = w / 2, cy = h / 2;
    var muted = getCSSVar('--text-muted') || '#64748b';
    var amber = getCSSVar('--accent-amber') || '#f59e0b';
    var violet = getCSSVar('--accent-violet') || '#8b5cf6';

    // Grid
    for (var i = -5; i <= 5; i++) {
      this.svg.append('line').attr('x1', cx + i * sc).attr('y1', cy - 5 * sc).attr('x2', cx + i * sc).attr('y2', cy + 5 * sc)
        .attr('stroke', muted).attr('stroke-width', 0.5).attr('opacity', 0.2);
      this.svg.append('line').attr('x1', cx - 5 * sc).attr('y1', cy + i * sc).attr('x2', cx + 5 * sc).attr('y2', cy + i * sc)
        .attr('stroke', muted).attr('stroke-width', 0.5).attr('opacity', 0.2);
    }

    // Random vectors
    this.vectors = [];
    for (var n = 0; n < 20; n++) {
      var angle = (n / 20) * Math.PI * 2;
      this.vectors.push([Math.cos(angle) * 2, Math.sin(angle) * 2]);
    }

    var m = this._getMatrix();
    var eigen = this._computeEigen(m);
    var self = this;

    // Draw random vectors
    this.vectors.forEach(function (v) {
      var isEigen = false;
      eigen.vectors.forEach(function (ev) {
        var cross = Math.abs(v[0] * ev[1] - v[1] * ev[0]);
        var dot = v[0] * ev[0] + v[1] * ev[1];
        if (cross < 0.15 && dot > 0) isEigen = true;
      });
      var color = isEigen ? amber : violet;
      var ex = cx + v[0] * sc, ey = cy - v[1] * sc;
      self.svg.append('line').attr('x1', cx).attr('y1', cy).attr('x2', ex).attr('y2', ey)
        .attr('stroke', color).attr('stroke-width', isEigen ? 3 : 1.5).attr('opacity', isEigen ? 1 : 0.5)
        .attr('class', 'vec-line');
      self.svg.append('circle').attr('cx', ex).attr('cy', ey).attr('r', isEigen ? 5 : 3)
        .attr('fill', color).attr('class', 'vec-dot');
    });

    // Eigen info
    var info = document.getElementById('eigen-info');
    if (info) {
      if (eigen.values.length === 2) {
        info.innerHTML = 'Собственные значения: <span>λ₁ = ' + eigen.values[0].toFixed(3) +
          ', λ₂ = ' + eigen.values[1].toFixed(3) + '</span>';
      } else {
        info.innerHTML = 'Собственные значения: <span>комплексные (нет вещественных)</span>';
      }
    }
  };

  EigenInteractive.prototype.animate = function () {
    if (!this.svg || !this.vectors) return;
    var m = this._getMatrix();
    var cx = this.w / 2, cy = this.h / 2, sc = this.scale;
    var a = m[0], b = m[1], c = m[2], d = m[3];

    var lines = this.svg.selectAll('.vec-line');
    var dots = this.svg.selectAll('.vec-dot');
    var self = this;

    lines.each(function (dd, i) {
      if (i >= self.vectors.length) return;
      var v = self.vectors[i];
      var tx = a * v[0] + b * v[1];
      var ty = c * v[0] + d * v[1];
      d3.select(this).transition().duration(800).ease(d3.easeCubicInOut)
        .attr('x2', cx + tx * sc).attr('y2', cy - ty * sc);
    });
    dots.each(function (dd, i) {
      if (i >= self.vectors.length) return;
      var v = self.vectors[i];
      var tx = a * v[0] + b * v[1];
      var ty = c * v[0] + d * v[1];
      d3.select(this).transition().duration(800).ease(d3.easeCubicInOut)
        .attr('cx', cx + tx * sc).attr('cy', cy - ty * sc);
    });

    // Reset after animation
    setTimeout(function () { self.drawInitial(); }, 2000);
  };

  /* ================================================================
     Init
     ================================================================ */
  function init() {
    var scroll = new ScrollViz('#viz-scrollytelling');
    if (scroll.container) {
      scroll.init();
      document.addEventListener('storytelling:step', function (e) {
        scroll.goToStep(e.detail.index + 1);
      });
    }
    var transform = new TransformInteractive('#transform-canvas');
    if (transform.container) transform.init();
    var eigen = new EigenInteractive('#eigen-canvas');
    if (eigen.container) eigen.init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
