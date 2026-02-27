/* ============================================================
   VIZ.JS — Глава 8: Введение в машинное обучение
   Scrollytelling · Linear Regression · Classification
   ============================================================ */
(function () {
  'use strict';

  function getCSSVar(n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }

  /* ================================================================
     1. ScrollViz
     ================================================================ */
  function ScrollViz(sel) {
    this.container = document.querySelector(sel);
    if (!this.container) return;
    this.w = 800; this.h = 800; this.step = 0; this.svg = null; this.layers = {};
  }

  ScrollViz.prototype.init = function () {
    if (!this.container) return;
    var el = this.container.querySelector('svg'); if (!el) return;
    this.svg = d3.select(el).attr('viewBox', '0 0 ' + this.w + ' ' + this.h).attr('preserveAspectRatio', 'xMidYMid meet');
    this.svg.selectAll('*').remove();
    var names = ['paradigm', 'regression', 'loss', 'classify'];
    var self = this;
    names.forEach(function (n) {
      self.layers[n] = self.svg.append('g').attr('class', 'layer-' + n).style('opacity', 0).style('display', 'none');
    });
    this.goToStep(1);
    return this;
  };

  ScrollViz.prototype.goToStep = function (s) {
    if (s === this.step) return; this.step = s;
    var self = this;
    Object.keys(this.layers).forEach(function (k) { self.layers[k].interrupt(); self.layers[k].style('opacity', 0).style('display', 'none'); });
    switch (s) { case 1: this.drawParadigm(); break; case 2: this.drawRegression(); break; case 3: this.drawLoss(); break; case 4: this.drawClassify(); break; }
  };

  /* Step 1: Traditional vs ML */
  ScrollViz.prototype.drawParadigm = function () {
    var g = this.layers.paradigm; g.selectAll('*').remove(); g.style('display', 'block');
    var w = this.w, h = this.h;
    var blue = getCSSVar('--accent-blue') || '#3b82f6';
    var emerald = getCSSVar('--accent-emerald') || '#10b981';
    var tp = getCSSVar('--text-primary') || '#e8eaf0';
    var tm = getCSSVar('--text-muted') || '#64748b';

    // Traditional row
    var ty = h * 0.3;
    var tBoxes = [{ x: 180, label: 'Правила' }, { x: 400, label: 'Данные' }, { x: 620, label: 'Ответы' }];
    g.append('text').attr('x', w / 2).attr('y', ty - 60).attr('text-anchor', 'middle').attr('fill', blue)
      .attr('font-family', 'Playfair Display').attr('font-size', '18px').text('Традиционное программирование');
    tBoxes.forEach(function (b, i) {
      g.append('rect').attr('x', b.x - 60).attr('y', ty - 25).attr('width', 120).attr('height', 50).attr('rx', 8)
        .attr('fill', 'none').attr('stroke', blue).attr('stroke-width', 2);
      g.append('text').attr('x', b.x).attr('y', ty + 5).attr('text-anchor', 'middle').attr('fill', tp)
        .attr('font-family', 'JetBrains Mono').attr('font-size', '14px').text(b.label);
      if (i < tBoxes.length - 1) {
        g.append('text').attr('x', (b.x + tBoxes[i + 1].x) / 2).attr('y', ty + 5).attr('text-anchor', 'middle')
          .attr('fill', tm).attr('font-size', '20px').text('+→');
      }
    });

    // ML row
    var my = h * 0.6;
    var mBoxes = [{ x: 180, label: 'Данные' }, { x: 400, label: 'Ответы' }, { x: 620, label: 'Правила!' }];
    g.append('text').attr('x', w / 2).attr('y', my - 60).attr('text-anchor', 'middle').attr('fill', emerald)
      .attr('font-family', 'Playfair Display').attr('font-size', '18px').text('Машинное обучение');
    mBoxes.forEach(function (b, i) {
      g.append('rect').attr('x', b.x - 60).attr('y', my - 25).attr('width', 120).attr('height', 50).attr('rx', 8)
        .attr('fill', i === 2 ? 'rgba(16,185,129,0.15)' : 'none').attr('stroke', emerald).attr('stroke-width', 2);
      g.append('text').attr('x', b.x).attr('y', my + 5).attr('text-anchor', 'middle').attr('fill', tp)
        .attr('font-family', 'JetBrains Mono').attr('font-size', '14px').attr('font-weight', i === 2 ? '700' : '400').text(b.label);
      if (i < mBoxes.length - 1) {
        g.append('text').attr('x', (b.x + mBoxes[i + 1].x) / 2).attr('y', my + 5).attr('text-anchor', 'middle')
          .attr('fill', tm).attr('font-size', '20px').text('+→');
      }
    });
    g.transition().duration(600).style('opacity', 1);
  };

  /* Step 2: Regression fit */
  ScrollViz.prototype.drawRegression = function () {
    var g = this.layers.regression; g.selectAll('*').remove(); g.style('display', 'block');
    var w = this.w, h = this.h, mx = 100, my = 100, pw = w - 2 * mx, ph = h - 2 * my;
    var emerald = getCSSVar('--accent-emerald') || '#10b981';
    var blue = getCSSVar('--accent-blue') || '#3b82f6';
    var tp = getCSSVar('--text-primary') || '#e8eaf0';
    var tm = getCSSVar('--text-muted') || '#64748b';

    // Axes
    g.append('line').attr('x1', mx).attr('y1', h - my).attr('x2', w - mx).attr('y2', h - my).attr('stroke', tm).attr('stroke-width', 1.5);
    g.append('line').attr('x1', mx).attr('y1', h - my).attr('x2', mx).attr('y2', my).attr('stroke', tm).attr('stroke-width', 1.5);

    // Random-ish data points
    var data = [[1, 2.5], [2, 3.8], [3, 4.5], [4, 5.2], [5, 7], [6, 6.5], [7, 8.5], [8, 9.2], [9, 8.8], [10, 10.5]];
    var xMax = 11, yMax = 12;
    data.forEach(function (d) {
      g.append('circle')
        .attr('cx', mx + (d[0] / xMax) * pw).attr('cy', h - my - (d[1] / yMax) * ph).attr('r', 6)
        .attr('fill', blue).attr('opacity', 0.8);
    });

    // Best fit line (approximate)
    var x1 = mx, y1 = h - my - (1.8 / yMax) * ph;
    var x2 = w - mx, y2 = h - my - (10.8 / yMax) * ph;
    g.append('line').attr('x1', x1).attr('y1', y1).attr('x2', x2).attr('y2', y2)
      .attr('stroke', emerald).attr('stroke-width', 3).attr('opacity', 0)
      .transition().duration(1000).attr('opacity', 1);

    g.append('text').attr('x', w / 2).attr('y', 60).attr('text-anchor', 'middle').attr('fill', tp)
      .attr('font-family', 'Playfair Display, serif').attr('font-size', '20px').text('Линейная регрессия: подбор прямой');
    g.transition().duration(600).style('opacity', 1);
  };

  /* Step 3: Loss function (errors) */
  ScrollViz.prototype.drawLoss = function () {
    var g = this.layers.loss; g.selectAll('*').remove(); g.style('display', 'block');
    var w = this.w, h = this.h, mx = 100, my = 100, pw = w - 2 * mx, ph = h - 2 * my;
    var emerald = getCSSVar('--accent-emerald') || '#10b981';
    var blue = getCSSVar('--accent-blue') || '#3b82f6';
    var rose = getCSSVar('--accent-rose') || '#f43f5e';
    var tp = getCSSVar('--text-primary') || '#e8eaf0';
    var tm = getCSSVar('--text-muted') || '#64748b';

    g.append('line').attr('x1', mx).attr('y1', h - my).attr('x2', w - mx).attr('y2', h - my).attr('stroke', tm).attr('stroke-width', 1.5);
    g.append('line').attr('x1', mx).attr('y1', h - my).attr('x2', mx).attr('y2', my).attr('stroke', tm).attr('stroke-width', 1.5);

    var data = [[1, 2.5], [2, 3.8], [3, 4.5], [4, 5.2], [5, 7], [6, 6.5], [7, 8.5], [8, 9.2], [9, 8.8], [10, 10.5]];
    var xMax = 11, yMax = 12;
    // Line: y ≈ 0.9x + 1.5
    var lineW = 0.9, lineB = 1.5;

    // Line
    var lx1 = mx + (0.5 / xMax) * pw, ly1 = h - my - ((0.5 * lineW + lineB) / yMax) * ph;
    var lx2 = mx + (10.5 / xMax) * pw, ly2 = h - my - ((10.5 * lineW + lineB) / yMax) * ph;
    g.append('line').attr('x1', lx1).attr('y1', ly1).attr('x2', lx2).attr('y2', ly2)
      .attr('stroke', emerald).attr('stroke-width', 2.5);

    // Points + error bars + error squares
    data.forEach(function (d, i) {
      var px = mx + (d[0] / xMax) * pw;
      var pyActual = h - my - (d[1] / yMax) * ph;
      var pyPred = h - my - ((d[0] * lineW + lineB) / yMax) * ph;

      // Error bar
      g.append('line').attr('x1', px).attr('y1', pyActual).attr('x2', px).attr('y2', pyPred)
        .attr('stroke', rose).attr('stroke-width', 2).attr('opacity', 0)
        .transition().delay(i * 100).duration(400).attr('opacity', 0.7);

      // Error square (visual)
      var errH = Math.abs(pyActual - pyPred);
      g.append('rect').attr('x', px).attr('y', Math.min(pyActual, pyPred))
        .attr('width', errH).attr('height', errH)
        .attr('fill', rose).attr('opacity', 0).transition().delay(i * 100 + 200).duration(400).attr('opacity', 0.1);

      // Point
      g.append('circle').attr('cx', px).attr('cy', pyActual).attr('r', 5).attr('fill', blue);
    });

    g.append('text').attr('x', w / 2).attr('y', 60).attr('text-anchor', 'middle').attr('fill', tp)
      .attr('font-family', 'Playfair Display, serif').attr('font-size', '20px').text('MSE: минимизация квадратов ошибок');
    g.transition().duration(600).style('opacity', 1);
  };

  /* Step 4: 2-class classification */
  ScrollViz.prototype.drawClassify = function () {
    var g = this.layers.classify; g.selectAll('*').remove(); g.style('display', 'block');
    var w = this.w, h = this.h, cx = w / 2, cy = h / 2;
    var blue = getCSSVar('--accent-blue') || '#3b82f6';
    var amber = getCSSVar('--accent-amber') || '#f59e0b';
    var emerald = getCSSVar('--accent-emerald') || '#10b981';
    var tp = getCSSVar('--text-primary') || '#e8eaf0';

    // Class 1 (blue) - left cluster
    var class1 = [];
    for (var i = 0; i < 25; i++) {
      class1.push([cx - 130 + (Math.random() - 0.5) * 200, cy + (Math.random() - 0.5) * 250]);
    }
    // Class 2 (amber) - right cluster
    var class2 = [];
    for (var j = 0; j < 25; j++) {
      class2.push([cx + 130 + (Math.random() - 0.5) * 200, cy + (Math.random() - 0.5) * 250]);
    }

    class1.forEach(function (p) {
      g.append('circle').attr('cx', p[0]).attr('cy', p[1]).attr('r', 6).attr('fill', blue).attr('opacity', 0.7);
    });
    class2.forEach(function (p) {
      g.append('circle').attr('cx', p[0]).attr('cy', p[1]).attr('r', 6).attr('fill', amber).attr('opacity', 0.7);
    });

    // Decision boundary
    g.append('line').attr('x1', cx).attr('y1', 80).attr('x2', cx).attr('y2', h - 80)
      .attr('stroke', emerald).attr('stroke-width', 3).attr('stroke-dasharray', '8 4')
      .attr('opacity', 0).transition().delay(500).duration(800).attr('opacity', 0.8);

    g.append('text').attr('x', cx - 150).attr('y', h - 50).attr('text-anchor', 'middle').attr('fill', blue)
      .attr('font-family', 'JetBrains Mono').attr('font-size', '14px').text('Класс 1');
    g.append('text').attr('x', cx + 150).attr('y', h - 50).attr('text-anchor', 'middle').attr('fill', amber)
      .attr('font-family', 'JetBrains Mono').attr('font-size', '14px').text('Класс 2');
    g.append('text').attr('x', w / 2).attr('y', 50).attr('text-anchor', 'middle').attr('fill', tp)
      .attr('font-family', 'Playfair Display, serif').attr('font-size', '20px').text('Классификация: разделяющая граница');
    g.transition().duration(600).style('opacity', 1);
  };

  /* ================================================================
     2. RegressionInteractive
     ================================================================ */
  function RegressionInteractive(sel) {
    this.container = document.querySelector(sel);
    if (!this.container) return;
    this.w = 800; this.h = 500; this.svg = null;
    this.points = [];
    this.margin = { l: 60, r: 30, t: 30, b: 50 };
  }

  RegressionInteractive.prototype.init = function () {
    if (!this.container) return;
    var self = this;
    this.svg = d3.select(this.container).append('svg')
      .attr('viewBox', '0 0 ' + this.w + ' ' + this.h)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('width', '100%').style('height', '100%').style('cursor', 'crosshair');

    this.svg.on('click', function (event) {
      var pt = d3.pointer(event, self.svg.node());
      var m = self.margin, pw = self.w - m.l - m.r, ph = self.h - m.t - m.b;
      var x = (pt[0] - m.l) / pw * 10;
      var y = (1 - (pt[1] - m.t) / ph) * 10;
      if (x >= 0 && x <= 10 && y >= 0 && y <= 10) {
        self.points.push({ x: x, y: y });
        self.draw();
      }
    });

    var btnEx = document.getElementById('btn-example-reg');
    var btnCl = document.getElementById('btn-clear-reg');
    if (btnEx) btnEx.addEventListener('click', function () {
      self.points = [
        { x: 1, y: 3 }, { x: 2, y: 3.5 }, { x: 2.5, y: 4 }, { x: 3, y: 4.5 },
        { x: 4, y: 5.5 }, { x: 5, y: 6 }, { x: 5.5, y: 5.8 }, { x: 6, y: 7 },
        { x: 7, y: 7.5 }, { x: 8, y: 8 }, { x: 8.5, y: 9 }, { x: 9, y: 8.5 }
      ];
      self.draw();
    });
    if (btnCl) btnCl.addEventListener('click', function () { self.points = []; self.draw(); });

    this.draw();
    return this;
  };

  RegressionInteractive.prototype._leastSquares = function () {
    var pts = this.points;
    if (pts.length < 2) return null;
    var n = pts.length;
    var sx = 0, sy = 0, sxy = 0, sx2 = 0;
    pts.forEach(function (p) { sx += p.x; sy += p.y; sxy += p.x * p.y; sx2 += p.x * p.x; });
    var denom = n * sx2 - sx * sx;
    if (Math.abs(denom) < 1e-10) return null;
    var w = (n * sxy - sx * sy) / denom;
    var b = (sy - w * sx) / n;
    // MSE
    var mse = 0;
    pts.forEach(function (p) { var e = p.y - (w * p.x + b); mse += e * e; });
    mse /= n;
    return { w: w, b: b, mse: mse };
  };

  RegressionInteractive.prototype.draw = function () {
    if (!this.svg) return;
    this.svg.selectAll('*').remove();
    var w = this.w, h = this.h, m = this.margin;
    var pw = w - m.l - m.r, ph = h - m.t - m.b;
    var emerald = getCSSVar('--accent-emerald') || '#10b981';
    var blue = getCSSVar('--accent-blue') || '#3b82f6';
    var rose = getCSSVar('--accent-rose') || '#f43f5e';
    var tm = getCSSVar('--text-muted') || '#64748b';
    var tp = getCSSVar('--text-primary') || '#e8eaf0';

    var xScale = d3.scaleLinear().domain([0, 10]).range([m.l, w - m.r]);
    var yScale = d3.scaleLinear().domain([0, 10]).range([h - m.b, m.t]);

    // Grid
    for (var i = 0; i <= 10; i += 2) {
      this.svg.append('line').attr('x1', xScale(i)).attr('y1', yScale(0)).attr('x2', xScale(i)).attr('y2', yScale(10))
        .attr('stroke', tm).attr('stroke-width', 0.5).attr('opacity', 0.2);
      this.svg.append('line').attr('x1', xScale(0)).attr('y1', yScale(i)).attr('x2', xScale(10)).attr('y2', yScale(i))
        .attr('stroke', tm).attr('stroke-width', 0.5).attr('opacity', 0.2);
      this.svg.append('text').attr('x', xScale(i)).attr('y', yScale(0) + 18).attr('text-anchor', 'middle')
        .attr('fill', tm).attr('font-size', '11px').attr('font-family', 'JetBrains Mono').text(i);
      this.svg.append('text').attr('x', xScale(0) - 10).attr('y', yScale(i) + 4).attr('text-anchor', 'end')
        .attr('fill', tm).attr('font-size', '11px').attr('font-family', 'JetBrains Mono').text(i);
    }

    var fit = this._leastSquares();
    var self = this;

    // Regression line + errors
    if (fit) {
      this.svg.append('line')
        .attr('x1', xScale(0)).attr('y1', yScale(fit.b))
        .attr('x2', xScale(10)).attr('y2', yScale(fit.w * 10 + fit.b))
        .attr('stroke', emerald).attr('stroke-width', 3);

      // Error bars
      this.points.forEach(function (p) {
        var predicted = fit.w * p.x + fit.b;
        self.svg.append('line').attr('x1', xScale(p.x)).attr('y1', yScale(p.y))
          .attr('x2', xScale(p.x)).attr('y2', yScale(predicted))
          .attr('stroke', rose).attr('stroke-width', 1.5).attr('opacity', 0.5);
      });
    }

    // Points
    this.points.forEach(function (p) {
      self.svg.append('circle').attr('cx', xScale(p.x)).attr('cy', yScale(p.y)).attr('r', 6)
        .attr('fill', blue).attr('stroke', '#fff').attr('stroke-width', 1.5);
    });

    // Info
    var info = document.getElementById('regression-info');
    if (info) {
      if (fit) {
        info.innerHTML = 'y = <strong>' + fit.w.toFixed(2) + '</strong>x + <strong>' + fit.b.toFixed(2) +
          '</strong> | MSE = <strong>' + fit.mse.toFixed(3) + '</strong> | n = ' + this.points.length;
      } else {
        info.textContent = 'Поставьте хотя бы 2 точки';
      }
    }
  };

  /* ================================================================
     3. ClassifyInteractive
     ================================================================ */
  function ClassifyInteractive(sel) {
    this.container = document.querySelector(sel);
    if (!this.container) return;
    this.w = 800; this.h = 500; this.svg = null;
    this.points = [];
    this.margin = { l: 40, r: 20, t: 20, b: 40 };
  }

  ClassifyInteractive.prototype.init = function () {
    if (!this.container) return;
    var self = this;
    this.svg = d3.select(this.container).append('svg')
      .attr('viewBox', '0 0 ' + this.w + ' ' + this.h)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('width', '100%').style('height', '100%').style('cursor', 'crosshair');

    // Prevent context menu for right-click
    this.container.addEventListener('contextmenu', function (e) { e.preventDefault(); });

    this.svg.on('click', function (event) {
      var pt = d3.pointer(event, self.svg.node());
      self.points.push({ x: pt[0], y: pt[1], cls: 0 });
      self.draw();
    });
    this.svg.on('contextmenu', function (event) {
      event.preventDefault();
      var pt = d3.pointer(event, self.svg.node());
      self.points.push({ x: pt[0], y: pt[1], cls: 1 });
      self.draw();
    });

    var btnLin = document.getElementById('btn-example-linear');
    var btnNon = document.getElementById('btn-example-nonlinear');
    var btnCl = document.getElementById('btn-clear-cls');
    if (btnLin) btnLin.addEventListener('click', function () {
      self.points = [];
      for (var i = 0; i < 20; i++) {
        self.points.push({ x: 100 + Math.random() * 250, y: 80 + Math.random() * 340, cls: 0 });
        self.points.push({ x: 450 + Math.random() * 250, y: 80 + Math.random() * 340, cls: 1 });
      }
      self.draw();
    });
    if (btnNon) btnNon.addEventListener('click', function () {
      self.points = [];
      for (var i = 0; i < 30; i++) {
        var a = Math.random() * Math.PI * 2;
        var r1 = 80 + Math.random() * 40;
        self.points.push({ x: 400 + Math.cos(a) * r1, y: 250 + Math.sin(a) * r1, cls: 0 });
        var r2 = 160 + Math.random() * 50;
        self.points.push({ x: 400 + Math.cos(a) * r2, y: 250 + Math.sin(a) * r2, cls: 1 });
      }
      self.draw();
    });
    if (btnCl) btnCl.addEventListener('click', function () { self.points = []; self.draw(); });

    this.draw();
    return this;
  };

  ClassifyInteractive.prototype._findBoundary = function () {
    var c0 = this.points.filter(function (p) { return p.cls === 0; });
    var c1 = this.points.filter(function (p) { return p.cls === 1; });
    if (c0.length === 0 || c1.length === 0) return null;
    var cx0 = d3.mean(c0, function (p) { return p.x; });
    var cy0 = d3.mean(c0, function (p) { return p.y; });
    var cx1 = d3.mean(c1, function (p) { return p.x; });
    var cy1 = d3.mean(c1, function (p) { return p.y; });
    // Perpendicular bisector of the line connecting centroids
    var midX = (cx0 + cx1) / 2, midY = (cy0 + cy1) / 2;
    var dx = cx1 - cx0, dy = cy1 - cy0;
    var len = Math.sqrt(dx * dx + dy * dy);
    if (len < 1) return null;
    var nx = -dy / len, ny = dx / len; // perpendicular
    return { mx: midX, my: midY, nx: nx, ny: ny };
  };

  ClassifyInteractive.prototype.draw = function () {
    if (!this.svg) return;
    this.svg.selectAll('*').remove();
    var blue = getCSSVar('--accent-blue') || '#3b82f6';
    var amber = getCSSVar('--accent-amber') || '#f59e0b';
    var emerald = getCSSVar('--accent-emerald') || '#10b981';
    var tm = getCSSVar('--text-muted') || '#64748b';

    // Background grid
    for (var i = 0; i < this.w; i += 50) {
      this.svg.append('line').attr('x1', i).attr('y1', 0).attr('x2', i).attr('y2', this.h)
        .attr('stroke', tm).attr('stroke-width', 0.3).attr('opacity', 0.2);
    }
    for (var j = 0; j < this.h; j += 50) {
      this.svg.append('line').attr('x1', 0).attr('y1', j).attr('x2', this.w).attr('y2', j)
        .attr('stroke', tm).attr('stroke-width', 0.3).attr('opacity', 0.2);
    }

    // Decision boundary
    var boundary = this._findBoundary();
    if (boundary) {
      var ext = 600;
      this.svg.append('line')
        .attr('x1', boundary.mx + boundary.nx * ext).attr('y1', boundary.my + boundary.ny * ext)
        .attr('x2', boundary.mx - boundary.nx * ext).attr('y2', boundary.my - boundary.ny * ext)
        .attr('stroke', emerald).attr('stroke-width', 3).attr('stroke-dasharray', '8 4').attr('opacity', 0.8);
    }

    // Points
    var self = this;
    this.points.forEach(function (p) {
      self.svg.append('circle').attr('cx', p.x).attr('cy', p.y).attr('r', 7)
        .attr('fill', p.cls === 0 ? blue : amber).attr('opacity', 0.8)
        .attr('stroke', '#fff').attr('stroke-width', 1.5);
    });
  };

  /* ================================================================
     Init
     ================================================================ */
  function init() {
    var scroll = new ScrollViz('#viz-scrollytelling');
    if (scroll.container) {
      scroll.init();
      document.addEventListener('storytelling:step', function (e) { scroll.goToStep(e.detail.index + 1); });
    }
    var reg = new RegressionInteractive('#regression-canvas');
    if (reg.container) reg.init();
    var cls = new ClassifyInteractive('#classify-canvas');
    if (cls.container) cls.init();
  }

  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); } else { init(); }
})();
