/* ============================================================
   VIZ.JS — Глава 7: Математический анализ для ML
   Scrollytelling · Draw Derivative · Chain Rule
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
    var names = ['tangent', 'gradient', 'chain', 'backprop'];
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
    Object.keys(this.layers).forEach(function (k) {
      self.layers[k].interrupt(); self.layers[k].style('opacity', 0).style('display', 'none');
    });
    switch (s) { case 1: this.drawTangent(); break; case 2: this.drawGradient(); break; case 3: this.drawChain(); break; case 4: this.drawBackprop(); break; }
  };

  /* Step 1: Function + tangent line */
  ScrollViz.prototype.drawTangent = function () {
    var g = this.layers.tangent; g.selectAll('*').remove(); g.style('display', 'block');
    var w = this.w, h = this.h;
    var blue = getCSSVar('--accent-blue') || '#3b82f6';
    var amber = getCSSVar('--accent-amber') || '#f59e0b';
    var tp = getCSSVar('--text-primary') || '#e8eaf0';
    var tm = getCSSVar('--text-muted') || '#64748b';
    var mx = 80, my = 80, pw = w - 2 * mx, ph = h - 2 * my;

    // Axes
    g.append('line').attr('x1', mx).attr('y1', h - my).attr('x2', w - mx).attr('y2', h - my).attr('stroke', tm).attr('stroke-width', 1.5);
    g.append('line').attr('x1', mx).attr('y1', h - my).attr('x2', mx).attr('y2', my).attr('stroke', tm).attr('stroke-width', 1.5);
    g.append('text').attr('x', w - mx + 10).attr('y', h - my + 5).attr('fill', tm).attr('font-size', '14px').attr('font-family', 'JetBrains Mono').text('t');
    g.append('text').attr('x', mx - 5).attr('y', my - 10).attr('fill', tm).attr('font-size', '14px').attr('font-family', 'JetBrains Mono').text('s(t)');

    // Curve s(t) = t^2 (parabola)
    var pts = [];
    for (var t = 0; t <= 1; t += 0.01) {
      pts.push([mx + t * pw, h - my - t * t * ph]);
    }
    var line = d3.line().x(function (d) { return d[0]; }).y(function (d) { return d[1]; }).curve(d3.curveBasis);
    g.append('path').attr('d', line(pts)).attr('fill', 'none').attr('stroke', blue).attr('stroke-width', 3);

    // Tangent at t=0.6
    var tx = 0.6, ty = tx * tx;
    var slope = 2 * tx;
    var px = mx + tx * pw, py = h - my - ty * ph;
    var dx = pw * 0.2, dy = -slope * ph * 0.2;
    g.append('line').attr('x1', px - dx).attr('y1', py - dy).attr('x2', px + dx).attr('y2', py + dy)
      .attr('stroke', amber).attr('stroke-width', 2.5).attr('stroke-dasharray', '8 4');
    g.append('circle').attr('cx', px).attr('cy', py).attr('r', 6).attr('fill', amber);

    // Labels
    g.append('text').attr('x', px + 15).attr('y', py - 20).attr('fill', amber).attr('font-family', 'JetBrains Mono').attr('font-size', '14px')
      .text("наклон = скорость = f'(t)");
    g.append('text').attr('x', w / 2).attr('y', 50).attr('text-anchor', 'middle').attr('fill', tp)
      .attr('font-family', 'Playfair Display, serif').attr('font-size', '20px').text('Касательная = производная');
    g.transition().duration(600).style('opacity', 1);
  };

  /* Step 2: 2D contour + gradient arrow */
  ScrollViz.prototype.drawGradient = function () {
    var g = this.layers.gradient; g.selectAll('*').remove(); g.style('display', 'block');
    var w = this.w, h = this.h, cx = w / 2, cy = h / 2;
    var blue = getCSSVar('--accent-blue') || '#3b82f6';
    var amber = getCSSVar('--accent-amber') || '#f59e0b';
    var tp = getCSSVar('--text-primary') || '#e8eaf0';

    // Contour rings (f(x,y) = x^2 + y^2)
    var nRings = 8;
    for (var i = 1; i <= nRings; i++) {
      var r = i * 35;
      g.append('ellipse').attr('cx', cx).attr('cy', cy).attr('rx', r * 1.3).attr('ry', r)
        .attr('fill', 'none').attr('stroke', blue).attr('stroke-width', 1)
        .attr('opacity', 0.15 + i * 0.05);
    }

    // Point and gradient arrow
    var px = cx + 120, py = cy - 60;
    g.append('circle').attr('cx', px).attr('cy', py).attr('r', 7).attr('fill', amber);
    // Gradient points toward center (steepest ascent outward, descent toward center)
    var gx = cx - px, gy = cy - py;
    var glen = Math.sqrt(gx * gx + gy * gy);
    gx = gx / glen * 80; gy = gy / glen * 80;
    g.append('line').attr('x1', px).attr('y1', py).attr('x2', px + gx).attr('y2', py + gy)
      .attr('stroke', amber).attr('stroke-width', 3);
    var ang = Math.atan2(gy, gx);
    g.append('polygon').attr('points', [
      [px + gx, py + gy],
      [px + gx - 12 * Math.cos(ang - 0.4), py + gy - 12 * Math.sin(ang - 0.4)],
      [px + gx - 12 * Math.cos(ang + 0.4), py + gy - 12 * Math.sin(ang + 0.4)]
    ].map(function (p) { return p.join(','); }).join(' ')).attr('fill', amber);

    g.append('text').attr('x', px + gx / 2 + 15).attr('y', py + gy / 2 - 10)
      .attr('fill', amber).attr('font-family', 'JetBrains Mono').attr('font-size', '14px').text('−∇f');
    g.append('text').attr('x', cx).attr('y', 50).attr('text-anchor', 'middle').attr('fill', tp)
      .attr('font-family', 'Playfair Display, serif').attr('font-size', '20px').text('Градиент указывает путь спуска');
    g.transition().duration(600).style('opacity', 1);
  };

  /* Step 3: Chain rule blocks */
  ScrollViz.prototype.drawChain = function () {
    var g = this.layers.chain; g.selectAll('*').remove(); g.style('display', 'block');
    var w = this.w, h = this.h, cy = h / 2;
    var blue = getCSSVar('--accent-blue') || '#3b82f6';
    var violet = getCSSVar('--accent-violet') || '#8b5cf6';
    var amber = getCSSVar('--accent-amber') || '#f59e0b';
    var tp = getCSSVar('--text-primary') || '#e8eaf0';
    var tm = getCSSVar('--text-muted') || '#64748b';

    var blocks = [
      { x: 160, label: 'x', sub: 'вход', color: blue },
      { x: 320, label: 'g(x)', sub: 'слой 1', color: violet },
      { x: 480, label: 'f(g)', sub: 'слой 2', color: amber },
      { x: 640, label: 'L', sub: 'потери', color: getCSSVar('--accent-rose') || '#f43f5e' }
    ];
    var bw = 110, bh = 70;

    blocks.forEach(function (b, i) {
      g.append('rect').attr('x', b.x - bw / 2).attr('y', cy - bh / 2).attr('width', bw).attr('height', bh)
        .attr('rx', 10).attr('fill', 'none').attr('stroke', b.color).attr('stroke-width', 2);
      g.append('text').attr('x', b.x).attr('y', cy - 5).attr('text-anchor', 'middle')
        .attr('fill', tp).attr('font-family', 'JetBrains Mono').attr('font-size', '16px').text(b.label);
      g.append('text').attr('x', b.x).attr('y', cy + 18).attr('text-anchor', 'middle')
        .attr('fill', tm).attr('font-family', 'Source Sans 3').attr('font-size', '12px').text(b.sub);

      // Forward arrows
      if (i < blocks.length - 1) {
        g.append('line').attr('x1', b.x + bw / 2 + 5).attr('y1', cy)
          .attr('x2', blocks[i + 1].x - bw / 2 - 5).attr('y2', cy)
          .attr('stroke', tm).attr('stroke-width', 1.5).attr('opacity', 0.5);
      }
    });

    // Backward gradient arrows (below)
    var gradY = cy + bh / 2 + 40;
    for (var j = blocks.length - 1; j > 0; j--) {
      var from = blocks[j], to = blocks[j - 1];
      g.append('line').attr('x1', from.x).attr('y1', gradY).attr('x2', to.x).attr('y2', gradY)
        .attr('stroke', getCSSVar('--accent-rose') || '#f43f5e').attr('stroke-width', 2)
        .attr('stroke-dasharray', '6 3').attr('opacity', 0)
        .transition().delay((blocks.length - j) * 400).duration(600).attr('opacity', 0.7);
      g.append('text').attr('x', (from.x + to.x) / 2).attr('y', gradY - 8).attr('text-anchor', 'middle')
        .attr('fill', getCSSVar('--accent-rose') || '#f43f5e').attr('font-family', 'JetBrains Mono').attr('font-size', '11px')
        .text('∂' + from.label.charAt(0) + '/∂' + to.label.charAt(0))
        .attr('opacity', 0).transition().delay((blocks.length - j) * 400 + 200).duration(400).attr('opacity', 1);
    }

    g.append('text').attr('x', w / 2).attr('y', gradY + 35).attr('text-anchor', 'middle')
      .attr('fill', getCSSVar('--accent-rose') || '#f43f5e').attr('font-family', 'JetBrains Mono').attr('font-size', '13px')
      .text('← градиент течёт назад (backpropagation)');
    g.append('text').attr('x', w / 2).attr('y', 50).attr('text-anchor', 'middle').attr('fill', tp)
      .attr('font-family', 'Playfair Display, serif').attr('font-size', '20px').text('Chain Rule: градиент через цепочку');
    g.transition().duration(600).style('opacity', 1);
  };

  /* Step 4: Neural network backprop */
  ScrollViz.prototype.drawBackprop = function () {
    var g = this.layers.backprop; g.selectAll('*').remove(); g.style('display', 'block');
    var w = this.w, h = this.h;
    var blue = getCSSVar('--accent-blue') || '#3b82f6';
    var violet = getCSSVar('--accent-violet') || '#8b5cf6';
    var amber = getCSSVar('--accent-amber') || '#f59e0b';
    var rose = getCSSVar('--accent-rose') || '#f43f5e';
    var tp = getCSSVar('--text-primary') || '#e8eaf0';
    var tm = getCSSVar('--text-muted') || '#64748b';

    // Simple 3-layer network
    var layers = [[2, 3, 2, 1]]; // neurons per layer
    var neurons = [3, 4, 3, 1];
    var layerX = [150, 310, 470, 630];
    var allNodes = [];

    neurons.forEach(function (count, li) {
      var startY = h / 2 - (count - 1) * 50;
      for (var ni = 0; ni < count; ni++) {
        allNodes.push({ x: layerX[li], y: startY + ni * 100, layer: li });
      }
    });

    // Connections
    var prev = [];
    allNodes.forEach(function (node) {
      if (node.layer > 0) {
        prev.filter(function (p) { return p.layer === node.layer - 1; }).forEach(function (p) {
          g.append('line').attr('x1', p.x).attr('y1', p.y).attr('x2', node.x).attr('y2', node.y)
            .attr('stroke', tm).attr('stroke-width', 1).attr('opacity', 0.3);
        });
      }
      prev.push(node);
    });

    // Nodes
    var colors = [blue, violet, amber, rose];
    allNodes.forEach(function (node) {
      g.append('circle').attr('cx', node.x).attr('cy', node.y).attr('r', 18)
        .attr('fill', colors[node.layer]).attr('opacity', 0.8);
    });

    // Backward arrow (animation)
    var arrowY = h / 2 + neurons[0] * 50 + 30;
    for (var a = layerX.length - 1; a > 0; a--) {
      (function (idx) {
        g.append('line').attr('x1', layerX[idx]).attr('y1', arrowY).attr('x2', layerX[idx - 1]).attr('y2', arrowY)
          .attr('stroke', rose).attr('stroke-width', 3).attr('opacity', 0)
          .transition().delay((layerX.length - idx) * 500).duration(600).attr('opacity', 0.8);
      })(a);
    }

    g.append('text').attr('x', w / 2).attr('y', arrowY + 30).attr('text-anchor', 'middle')
      .attr('fill', rose).attr('font-family', 'JetBrains Mono').attr('font-size', '13px')
      .text('← ∂L/∂w  (backpropagation)');

    // Layer labels
    var labels = ['Вход', 'Скрытый 1', 'Скрытый 2', 'Выход'];
    layerX.forEach(function (x, i) {
      g.append('text').attr('x', x).attr('y', 60).attr('text-anchor', 'middle')
        .attr('fill', tm).attr('font-size', '13px').attr('font-family', 'Source Sans 3').text(labels[i]);
    });

    g.append('text').attr('x', w / 2).attr('y', 30).attr('text-anchor', 'middle').attr('fill', tp)
      .attr('font-family', 'Playfair Display, serif').attr('font-size', '20px').text('Backpropagation в нейросети');
    g.transition().duration(600).style('opacity', 1);
  };

  /* ================================================================
     2. DrawDerivative — free-draw + numeric derivative
     ================================================================ */
  function DrawDerivative() {
    this.canvas = document.getElementById('draw-canvas');
    this.derivContainer = document.getElementById('derivative-canvas');
    if (!this.canvas || !this.derivContainer) return;
    this.ctx = this.canvas.getContext('2d');
    this.points = [];
    this.drawing = false;
  }

  DrawDerivative.prototype.init = function () {
    if (!this.canvas) return;
    var self = this;
    var rect = this.canvas.getBoundingClientRect();

    // Resize canvas to actual pixel size
    var resizeCanvas = function () {
      var r = self.canvas.parentElement.getBoundingClientRect();
      self.canvas.width = r.width;
      self.canvas.height = 250;
      self.redraw();
    };
    resizeCanvas();
    window.addEventListener('resize', debounce(resizeCanvas, 200));

    // Mouse events
    this.canvas.addEventListener('mousedown', function (e) { self.drawing = true; self.points = []; self.addPoint(e); });
    this.canvas.addEventListener('mousemove', function (e) { if (self.drawing) self.addPoint(e); });
    this.canvas.addEventListener('mouseup', function () { self.drawing = false; self.computeDerivative(); });
    this.canvas.addEventListener('mouseleave', function () { self.drawing = false; self.computeDerivative(); });

    // Touch events
    this.canvas.addEventListener('touchstart', function (e) { e.preventDefault(); self.drawing = true; self.points = []; self.addTouchPoint(e); });
    this.canvas.addEventListener('touchmove', function (e) { e.preventDefault(); if (self.drawing) self.addTouchPoint(e); });
    this.canvas.addEventListener('touchend', function () { self.drawing = false; self.computeDerivative(); });

    // Buttons
    var btnSine = document.getElementById('btn-sine');
    var btnClear = document.getElementById('btn-clear');
    if (btnSine) btnSine.addEventListener('click', function () { self.drawSine(); });
    if (btnClear) btnClear.addEventListener('click', function () { self.clear(); });

    // Init derivative SVG
    this.derivSvg = d3.select(this.derivContainer).append('svg')
      .attr('viewBox', '0 0 800 200').attr('preserveAspectRatio', 'xMidYMid meet')
      .style('width', '100%').style('height', '100%');

    return this;
  };

  DrawDerivative.prototype.addPoint = function (e) {
    var rect = this.canvas.getBoundingClientRect();
    var x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
    var y = (e.clientY - rect.top) * (this.canvas.height / rect.height);
    this.points.push({ x: x, y: y });
    this.redraw();
  };

  DrawDerivative.prototype.addTouchPoint = function (e) {
    var touch = e.touches[0];
    var rect = this.canvas.getBoundingClientRect();
    var x = (touch.clientX - rect.left) * (this.canvas.width / rect.width);
    var y = (touch.clientY - rect.top) * (this.canvas.height / rect.height);
    this.points.push({ x: x, y: y });
    this.redraw();
  };

  DrawDerivative.prototype.redraw = function () {
    var ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Grid
    ctx.strokeStyle = 'rgba(100,116,139,0.2)';
    ctx.lineWidth = 0.5;
    for (var i = 0; i < this.canvas.width; i += 40) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, this.canvas.height); ctx.stroke();
    }
    for (var j = 0; j < this.canvas.height; j += 40) {
      ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(this.canvas.width, j); ctx.stroke();
    }

    // Curve
    if (this.points.length < 2) return;
    ctx.beginPath();
    ctx.moveTo(this.points[0].x, this.points[0].y);
    for (var k = 1; k < this.points.length; k++) {
      ctx.lineTo(this.points[k].x, this.points[k].y);
    }
    ctx.strokeStyle = getCSSVar('--accent-blue') || '#3b82f6';
    ctx.lineWidth = 3;
    ctx.stroke();
  };

  DrawDerivative.prototype.computeDerivative = function () {
    if (!this.derivSvg || this.points.length < 5) return;
    this.derivSvg.selectAll('*').remove();
    var amber = getCSSVar('--accent-amber') || '#f59e0b';
    var tm = getCSSVar('--text-muted') || '#64748b';

    // Sort by x, remove duplicates, compute numerical derivative
    var sorted = this.points.slice().sort(function (a, b) { return a.x - b.x; });
    var derivPts = [];
    var step = 3;
    for (var i = step; i < sorted.length - step; i++) {
      var dx = sorted[i + step].x - sorted[i - step].x;
      var dy = sorted[i + step].y - sorted[i - step].y;
      if (Math.abs(dx) > 0.1) {
        derivPts.push({ x: sorted[i].x, y: -dy / dx }); // negative because canvas y is inverted
      }
    }
    if (derivPts.length < 2) return;

    var xExtent = d3.extent(derivPts, function (d) { return d.x; });
    var yExtent = d3.extent(derivPts, function (d) { return d.y; });
    var xScale = d3.scaleLinear().domain(xExtent).range([40, 760]);
    var yScale = d3.scaleLinear().domain([yExtent[0] - 0.5, yExtent[1] + 0.5]).range([180, 20]);

    // Zero line
    if (yExtent[0] <= 0 && yExtent[1] >= 0) {
      this.derivSvg.append('line').attr('x1', 40).attr('y1', yScale(0)).attr('x2', 760).attr('y2', yScale(0))
        .attr('stroke', tm).attr('stroke-width', 1).attr('stroke-dasharray', '4 3');
    }

    var line = d3.line().x(function (d) { return xScale(d.x); }).y(function (d) { return yScale(d.y); }).curve(d3.curveBasis);
    this.derivSvg.append('path').attr('d', line(derivPts)).attr('fill', 'none').attr('stroke', amber).attr('stroke-width', 2.5);

    this.derivSvg.append('text').attr('x', 400).attr('y', 16).attr('text-anchor', 'middle')
      .attr('fill', amber).attr('font-family', 'JetBrains Mono').attr('font-size', '12px').text("f'(x) — производная");
  };

  DrawDerivative.prototype.drawSine = function () {
    this.points = [];
    var w = this.canvas.width, h = this.canvas.height;
    for (var x = 0; x < w; x += 2) {
      var t = (x / w) * 4 * Math.PI;
      this.points.push({ x: x, y: h / 2 - Math.sin(t) * (h * 0.35) });
    }
    this.redraw();
    this.computeDerivative();
  };

  DrawDerivative.prototype.clear = function () {
    this.points = [];
    this.redraw();
    if (this.derivSvg) this.derivSvg.selectAll('*').remove();
  };

  /* ================================================================
     3. ChainRuleViz
     ================================================================ */
  function ChainRuleViz(sel) {
    this.container = document.querySelector(sel);
    if (!this.container) return;
    this.w = 800; this.h = 220;
  }

  ChainRuleViz.prototype.init = function () {
    if (!this.container) return;
    this.svg = d3.select(this.container).append('svg')
      .attr('viewBox', '0 0 ' + this.w + ' ' + this.h)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('width', '100%').style('height', '100%');

    var slider = document.getElementById('chain-x');
    var self = this;
    if (slider) {
      this.draw(parseFloat(slider.value));
      slider.addEventListener('input', function () {
        var v = parseFloat(this.value);
        var disp = document.getElementById('chain-x-value');
        if (disp) disp.textContent = v.toFixed(1);
        self.draw(v);
      });
    }
    return this;
  };

  ChainRuleViz.prototype.draw = function (x) {
    if (!this.svg) return;
    this.svg.selectAll('*').remove();
    var w = this.w, h = this.h, cy = h / 2;
    var blue = getCSSVar('--accent-blue') || '#3b82f6';
    var violet = getCSSVar('--accent-violet') || '#8b5cf6';
    var amber = getCSSVar('--accent-amber') || '#f59e0b';
    var rose = getCSSVar('--accent-rose') || '#f43f5e';
    var tp = getCSSVar('--text-primary') || '#e8eaf0';
    var tm = getCSSVar('--text-muted') || '#64748b';

    // Functions: h(x) = x^2, g(h) = sin(h), f(g) = g^2
    var hVal = x * x;
    var gVal = Math.sin(hVal);
    var fVal = gVal * gVal;

    // Derivatives
    var dh_dx = 2 * x;
    var dg_dh = Math.cos(hVal);
    var df_dg = 2 * gVal;
    var df_dx = df_dg * dg_dh * dh_dx;

    var blocks = [
      { x: 100, label: 'x', val: x.toFixed(2), color: blue },
      { x: 270, label: 'h = x²', val: hVal.toFixed(2), color: violet },
      { x: 440, label: 'g = sin(h)', val: gVal.toFixed(3), color: amber },
      { x: 630, label: 'f = g²', val: fVal.toFixed(4), color: rose }
    ];
    var bw = 120, bh = 56;

    blocks.forEach(function (b, i) {
      this.svg.append('rect').attr('x', b.x - bw / 2).attr('y', cy - bh / 2).attr('width', bw).attr('height', bh)
        .attr('rx', 8).attr('fill', 'none').attr('stroke', b.color).attr('stroke-width', 2);
      this.svg.append('text').attr('x', b.x).attr('y', cy - 6).attr('text-anchor', 'middle')
        .attr('fill', tp).attr('font-family', 'JetBrains Mono').attr('font-size', '13px').text(b.label);
      this.svg.append('text').attr('x', b.x).attr('y', cy + 16).attr('text-anchor', 'middle')
        .attr('fill', b.color).attr('font-family', 'JetBrains Mono').attr('font-size', '12px').text('= ' + b.val);

      if (i < blocks.length - 1) {
        this.svg.append('line').attr('x1', b.x + bw / 2 + 3).attr('y1', cy)
          .attr('x2', blocks[i + 1].x - bw / 2 - 3).attr('y2', cy)
          .attr('stroke', tm).attr('stroke-width', 1.5).attr('opacity', 0.4);
      }
    }.bind(this));

    // Partial derivatives below arrows
    var derivs = [
      { x: (blocks[0].x + blocks[1].x) / 2, label: "dh/dx=" + dh_dx.toFixed(2) },
      { x: (blocks[1].x + blocks[2].x) / 2, label: "dg/dh=" + dg_dh.toFixed(3) },
      { x: (blocks[2].x + blocks[3].x) / 2, label: "df/dg=" + df_dg.toFixed(3) }
    ];
    var self = this;
    derivs.forEach(function (d) {
      self.svg.append('text').attr('x', d.x).attr('y', cy + bh / 2 + 20).attr('text-anchor', 'middle')
        .attr('fill', tm).attr('font-family', 'JetBrains Mono').attr('font-size', '10px').text(d.label);
    });

    // Chain values display
    var valEl = document.getElementById('chain-values');
    if (valEl) {
      valEl.innerHTML =
        'df/dx = df/dg × dg/dh × dh/dx = ' +
        '<strong>' + df_dg.toFixed(3) + ' × ' + dg_dh.toFixed(3) + ' × ' + dh_dx.toFixed(2) +
        ' = ' + df_dx.toFixed(4) + '</strong>';
    }
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
    var draw = new DrawDerivative();
    if (draw.canvas) draw.init();
    var chain = new ChainRuleViz('#chain-canvas');
    if (chain.container) chain.init();
  }

  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); } else { init(); }
})();
