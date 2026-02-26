/* ============================================================
   VIZ.JS — Глава 1: Золотое сечение и числа Фибоначчи
   Scrollytelling · Спираль Фибоначчи · Проверь пропорции
   ============================================================ */

(function () {
  'use strict';

  var PHI = (1 + Math.sqrt(5)) / 2; // ≈ 1.6180339...
  var GOLDEN_ANGLE_DEG = 137.508;
  var GOLDEN_ANGLE_RAD = GOLDEN_ANGLE_DEG * Math.PI / 180;

  // CSS colors from design system
  function getCSSVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function fibSequence(n) {
    var seq = [1, 1];
    for (var i = 2; i < n; i++) {
      seq.push(seq[i - 1] + seq[i - 2]);
    }
    return seq;
  }

  /* ================================================================
     1. GoldenRatioViz — Scrollytelling визуализация
     ================================================================ */
  function GoldenRatioViz(containerSelector) {
    this.container = document.querySelector(containerSelector);
    if (!this.container) return;

    this.width = 800;
    this.height = 800;
    this.currentStep = 0;
    this.svg = null;
    this.layers = {};
  }

  GoldenRatioViz.prototype.init = function () {
    if (!this.container) return;

    var svgEl = this.container.querySelector('svg');
    if (!svgEl) return;

    this.svg = d3.select(svgEl)
      .attr('viewBox', '0 0 ' + this.width + ' ' + this.height)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    // Clear any existing content
    this.svg.selectAll('*').remove();

    // Background
    this.svg.append('rect')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('fill', 'transparent');

    // Create layers for each step
    this.layers.sunflower = this.svg.append('g').attr('class', 'layer-sunflower')
      .attr('transform', 'translate(' + this.width / 2 + ',' + this.height / 2 + ')');
    this.layers.fibonacci = this.svg.append('g').attr('class', 'layer-fibonacci');
    this.layers.ratios = this.svg.append('g').attr('class', 'layer-ratios');
    this.layers.rectangles = this.svg.append('g').attr('class', 'layer-rectangles');
    this.layers.spiral = this.svg.append('g').attr('class', 'layer-spiral');

    // Hide all layers initially
    Object.keys(this.layers).forEach(function (key) {
      this.layers[key].style('opacity', 0).style('display', 'none');
    }.bind(this));

    // Show step 1 by default
    this.goToStep(1);

    return this;
  };

  GoldenRatioViz.prototype.goToStep = function (step) {
    if (step === this.currentStep) return;
    this.currentStep = step;

    // Hide all layers
    var self = this;
    Object.keys(this.layers).forEach(function (key) {
      self.layers[key]
        .transition().duration(400)
        .style('opacity', 0)
        .on('end', function () {
          d3.select(this).style('display', 'none');
        });
    });

    // Show appropriate layer
    switch (step) {
      case 1: this.step1_sunflower(); break;
      case 2: this.step2_fibonacci_numbers(); break;
      case 3: this.step3_ratio_convergence(); break;
      case 4: this.step4_golden_rectangles(); break;
      case 5: this.step5_spiral(); break;
    }
  };

  /* --- Step 1: Sunflower pattern --- */
  GoldenRatioViz.prototype.step1_sunflower = function () {
    var layer = this.layers.sunflower;
    var numSeeds = 300;
    var scale = 11;
    var amber = getCSSVar('--accent-amber') || '#f59e0b';
    var cyan = getCSSVar('--accent-cyan') || '#06b6d4';

    layer.selectAll('*').remove();
    layer.style('display', 'block');

    // Generate sunflower points
    var seeds = [];
    for (var i = 0; i < numSeeds; i++) {
      var angle = i * GOLDEN_ANGLE_RAD;
      var r = scale * Math.sqrt(i);
      seeds.push({
        x: r * Math.cos(angle),
        y: r * Math.sin(angle),
        index: i,
        r: mapRange(i, 0, numSeeds, 2, 5)
      });
    }

    var colorScale = d3.scaleSequential(d3.interpolateWarm)
      .domain([0, numSeeds]);

    // Draw seeds with staggered animation
    layer.selectAll('circle')
      .data(seeds)
      .enter()
      .append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', 0)
      .attr('fill', function (d) { return colorScale(d.index); })
      .attr('opacity', 0)
      .transition()
      .duration(15)
      .delay(function (d) { return d.index * 8; })
      .attr('cx', function (d) { return d.x; })
      .attr('cy', function (d) { return d.y; })
      .attr('r', function (d) { return d.r; })
      .attr('opacity', 0.85);

    // Label
    layer.append('text')
      .attr('x', 0)
      .attr('y', -this.height / 2 + 40)
      .attr('text-anchor', 'middle')
      .attr('fill', getCSSVar('--text-muted') || '#64748b')
      .attr('font-size', '14px')
      .attr('font-family', 'Source Sans 3, sans-serif')
      .text('Угол расхождения: 137,5°')
      .attr('opacity', 0)
      .transition().delay(1500).duration(600)
      .attr('opacity', 1);

    layer.transition().duration(600).style('opacity', 1);
  };

  /* --- Step 2: Fibonacci numbers --- */
  GoldenRatioViz.prototype.step2_fibonacci_numbers = function () {
    var layer = this.layers.fibonacci;
    var w = this.width;
    var h = this.height;
    var fib = fibSequence(12);
    var amber = getCSSVar('--accent-amber') || '#f59e0b';
    var textPrimary = getCSSVar('--text-primary') || '#e8eaf0';
    var textMuted = getCSSVar('--text-muted') || '#64748b';

    layer.selectAll('*').remove();
    layer.style('display', 'block');

    var boxWidth = 60;
    var gap = 8;
    var totalW = fib.length * (boxWidth + gap);
    var startX = (w - totalW) / 2;
    var centerY = h / 2;

    // Draw boxes
    var groups = layer.selectAll('.fib-item')
      .data(fib)
      .enter()
      .append('g')
      .attr('class', 'fib-item')
      .attr('transform', function (d, i) {
        return 'translate(' + (startX + i * (boxWidth + gap) + boxWidth / 2) + ',' + centerY + ')';
      });

    groups.append('rect')
      .attr('x', -boxWidth / 2)
      .attr('y', -30)
      .attr('width', boxWidth)
      .attr('height', 60)
      .attr('rx', 8)
      .attr('fill', 'rgba(245, 158, 11, 0.1)')
      .attr('stroke', amber)
      .attr('stroke-width', 1.5)
      .attr('opacity', 0)
      .transition()
      .duration(400)
      .delay(function (d, i) { return i * 120; })
      .attr('opacity', 1);

    groups.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', textPrimary)
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('font-size', '18px')
      .attr('font-weight', '500')
      .text(function (d) { return d; })
      .attr('opacity', 0)
      .transition()
      .duration(400)
      .delay(function (d, i) { return i * 120 + 200; })
      .attr('opacity', 1);

    // Addition signs
    layer.selectAll('.plus-sign')
      .data(fib.slice(0, -1))
      .enter()
      .append('text')
      .attr('class', 'plus-sign')
      .attr('x', function (d, i) { return startX + (i + 0.5) * (boxWidth + gap) + boxWidth / 2; })
      .attr('y', centerY + 55)
      .attr('text-anchor', 'middle')
      .attr('fill', textMuted)
      .attr('font-size', '13px')
      .attr('font-family', 'JetBrains Mono, monospace')
      .text('+')
      .attr('opacity', 0)
      .transition()
      .delay(function (d, i) { return i * 120 + 300; })
      .duration(300)
      .attr('opacity', 0.6);

    // Title
    layer.append('text')
      .attr('x', w / 2)
      .attr('y', centerY - 80)
      .attr('text-anchor', 'middle')
      .attr('fill', textPrimary)
      .attr('font-family', 'Playfair Display, serif')
      .attr('font-size', '20px')
      .text('Последовательность Фибоначчи')
      .attr('opacity', 0)
      .transition().duration(600)
      .attr('opacity', 1);

    // Formula label
    layer.append('text')
      .attr('x', w / 2)
      .attr('y', centerY + 100)
      .attr('text-anchor', 'middle')
      .attr('fill', textMuted)
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('font-size', '14px')
      .text('Fₙ = Fₙ₋₁ + Fₙ₋₂')
      .attr('opacity', 0)
      .transition().delay(800).duration(600)
      .attr('opacity', 1);

    layer.transition().duration(600).style('opacity', 1);
  };

  /* --- Step 3: Ratio convergence to φ --- */
  GoldenRatioViz.prototype.step3_ratio_convergence = function () {
    var layer = this.layers.ratios;
    var w = this.width;
    var h = this.height;
    var fib = fibSequence(14);
    var amber = getCSSVar('--accent-amber') || '#f59e0b';
    var blue = getCSSVar('--accent-blue') || '#3b82f6';
    var textPrimary = getCSSVar('--text-primary') || '#e8eaf0';
    var textMuted = getCSSVar('--text-muted') || '#64748b';

    layer.selectAll('*').remove();
    layer.style('display', 'block');

    // Compute ratios
    var ratios = [];
    for (var i = 1; i < fib.length; i++) {
      ratios.push({
        index: i,
        value: fib[i] / fib[i - 1],
        label: fib[i] + '/' + fib[i - 1]
      });
    }

    var margin = { top: 80, right: 60, bottom: 80, left: 80 };
    var plotW = w - margin.left - margin.right;
    var plotH = h - margin.top - margin.bottom;

    var xScale = d3.scaleBand()
      .domain(ratios.map(function (d) { return d.index; }))
      .range([0, plotW])
      .padding(0.3);

    var yScale = d3.scaleLinear()
      .domain([1, 2.2])
      .range([plotH, 0]);

    var chart = layer.append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // φ line
    chart.append('line')
      .attr('x1', 0).attr('x2', plotW)
      .attr('y1', yScale(PHI)).attr('y2', yScale(PHI))
      .attr('stroke', amber)
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '8 4')
      .attr('opacity', 0)
      .transition().duration(800)
      .attr('opacity', 0.8);

    chart.append('text')
      .attr('x', plotW + 8)
      .attr('y', yScale(PHI))
      .attr('dy', '0.35em')
      .attr('fill', amber)
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('font-size', '14px')
      .text('φ ≈ 1,618')
      .attr('opacity', 0)
      .transition().delay(600).duration(600)
      .attr('opacity', 1);

    // Bars
    chart.selectAll('.ratio-bar')
      .data(ratios)
      .enter()
      .append('rect')
      .attr('class', 'ratio-bar')
      .attr('x', function (d) { return xScale(d.index); })
      .attr('y', yScale(1))
      .attr('width', xScale.bandwidth())
      .attr('height', 0)
      .attr('rx', 4)
      .attr('fill', function (d) {
        var dist = Math.abs(d.value - PHI);
        return dist < 0.05 ? amber : blue;
      })
      .attr('opacity', 0.8)
      .transition()
      .duration(600)
      .delay(function (d, i) { return i * 80; })
      .attr('y', function (d) { return yScale(d.value); })
      .attr('height', function (d) { return yScale(1) - yScale(d.value); });

    // Value labels on bars
    chart.selectAll('.ratio-label')
      .data(ratios)
      .enter()
      .append('text')
      .attr('class', 'ratio-label')
      .attr('x', function (d) { return xScale(d.index) + xScale.bandwidth() / 2; })
      .attr('y', function (d) { return yScale(d.value) - 8; })
      .attr('text-anchor', 'middle')
      .attr('fill', textPrimary)
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('font-size', '11px')
      .text(function (d) { return d.value.toFixed(3); })
      .attr('opacity', 0)
      .transition()
      .delay(function (d, i) { return i * 80 + 400; })
      .duration(400)
      .attr('opacity', 1);

    // X labels
    chart.selectAll('.x-label')
      .data(ratios)
      .enter()
      .append('text')
      .attr('class', 'x-label')
      .attr('x', function (d) { return xScale(d.index) + xScale.bandwidth() / 2; })
      .attr('y', plotH + 20)
      .attr('text-anchor', 'middle')
      .attr('fill', textMuted)
      .attr('font-size', '10px')
      .attr('font-family', 'JetBrains Mono, monospace')
      .text(function (d) { return d.label; });

    // Title
    layer.append('text')
      .attr('x', w / 2)
      .attr('y', 40)
      .attr('text-anchor', 'middle')
      .attr('fill', textPrimary)
      .attr('font-family', 'Playfair Display, serif')
      .attr('font-size', '20px')
      .text('Отношения последовательных чисел Фибоначчи');

    layer.transition().duration(600).style('opacity', 1);
  };

  /* --- Step 4: Golden rectangles --- */
  GoldenRatioViz.prototype.step4_golden_rectangles = function () {
    var layer = this.layers.rectangles;
    var w = this.width;
    var h = this.height;
    var amber = getCSSVar('--accent-amber') || '#f59e0b';
    var textPrimary = getCSSVar('--text-primary') || '#e8eaf0';
    var textMuted = getCSSVar('--text-muted') || '#64748b';

    layer.selectAll('*').remove();
    layer.style('display', 'block');

    var fib = fibSequence(10);
    var scale = 0.7;
    var rects = this._computeGoldenRects(fib, scale);

    // Center the drawing
    var bounds = this._getRectsBounds(rects);
    var offsetX = (w - (bounds.maxX - bounds.minX)) / 2 - bounds.minX;
    var offsetY = (h - (bounds.maxY - bounds.minY)) / 2 - bounds.minY;

    var g = layer.append('g')
      .attr('transform', 'translate(' + offsetX + ',' + offsetY + ')');

    var colorScale = d3.scaleSequential(d3.interpolateWarm)
      .domain([0, rects.length]);

    // Draw rectangles with staggered animation
    rects.forEach(function (rect, i) {
      // Square part
      g.append('rect')
        .attr('x', rect.sx).attr('y', rect.sy)
        .attr('width', rect.size).attr('height', rect.size)
        .attr('fill', 'none')
        .attr('stroke', colorScale(i))
        .attr('stroke-width', 2)
        .attr('opacity', 0)
        .transition()
        .duration(500)
        .delay(i * 300)
        .attr('opacity', 0.7);

      // Fib number label
      g.append('text')
        .attr('x', rect.sx + rect.size / 2)
        .attr('y', rect.sy + rect.size / 2)
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .attr('fill', textPrimary)
        .attr('font-family', 'JetBrains Mono, monospace')
        .attr('font-size', Math.max(10, Math.min(rect.size * 0.3, 24)) + 'px')
        .text(fib[i])
        .attr('opacity', 0)
        .transition()
        .duration(400)
        .delay(i * 300 + 200)
        .attr('opacity', 0.6);
    });

    // Title
    layer.append('text')
      .attr('x', w / 2).attr('y', 40)
      .attr('text-anchor', 'middle')
      .attr('fill', textPrimary)
      .attr('font-family', 'Playfair Display, serif')
      .attr('font-size', '20px')
      .text('Золотые прямоугольники');

    layer.transition().duration(600).style('opacity', 1);
  };

  /* --- Step 5: Fibonacci spiral --- */
  GoldenRatioViz.prototype.step5_spiral = function () {
    var layer = this.layers.spiral;
    var w = this.width;
    var h = this.height;
    var amber = getCSSVar('--accent-amber') || '#f59e0b';
    var textPrimary = getCSSVar('--text-primary') || '#e8eaf0';

    layer.selectAll('*').remove();
    layer.style('display', 'block');

    var fib = fibSequence(10);
    var scale = 0.7;
    var rects = this._computeGoldenRects(fib, scale);

    var bounds = this._getRectsBounds(rects);
    var offsetX = (w - (bounds.maxX - bounds.minX)) / 2 - bounds.minX;
    var offsetY = (h - (bounds.maxY - bounds.minY)) / 2 - bounds.minY;

    var g = layer.append('g')
      .attr('transform', 'translate(' + offsetX + ',' + offsetY + ')');

    var colorScale = d3.scaleSequential(d3.interpolateWarm)
      .domain([0, rects.length]);

    // Draw rectangles (faded)
    rects.forEach(function (rect, i) {
      g.append('rect')
        .attr('x', rect.sx).attr('y', rect.sy)
        .attr('width', rect.size).attr('height', rect.size)
        .attr('fill', 'none')
        .attr('stroke', colorScale(i))
        .attr('stroke-width', 1)
        .attr('opacity', 0.3);
    });

    // Draw spiral arcs
    var spiralPath = '';
    rects.forEach(function (rect, i) {
      var arc = self._computeArc(rect, i);
      spiralPath += arc;
    });

    var self = this;
    var pathData = this._buildSpiralPathData(rects);

    var spiralLine = g.append('path')
      .attr('d', pathData)
      .attr('fill', 'none')
      .attr('stroke', amber)
      .attr('stroke-width', 3)
      .attr('stroke-linecap', 'round');

    // Animate the spiral drawing
    var totalLength = spiralLine.node().getTotalLength();
    spiralLine
      .attr('stroke-dasharray', totalLength)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(2500)
      .ease(d3.easeCubicInOut)
      .attr('stroke-dashoffset', 0);

    // Title
    layer.append('text')
      .attr('x', w / 2).attr('y', 40)
      .attr('text-anchor', 'middle')
      .attr('fill', textPrimary)
      .attr('font-family', 'Playfair Display, serif')
      .attr('font-size', '20px')
      .text('Спираль Фибоначчи');

    layer.transition().duration(600).style('opacity', 1);
  };

  /* --- Helper: compute golden rectangle positions --- */
  GoldenRatioViz.prototype._computeGoldenRects = function (fib, scale) {
    var rects = [];
    var x = 0, y = 0;
    // Directions: 0=right, 1=down, 2=left, 3=up
    var dir = 0;

    for (var i = 0; i < fib.length; i++) {
      var size = fib[i] * scale;
      var sx, sy;

      switch (dir) {
        case 0: // place square to the right
          sx = x; sy = y;
          x = x + size;
          break;
        case 1: // place square below
          sx = x - size; sy = y;
          y = y + size;
          break;
        case 2: // place square to the left
          sx = x - size; sy = y - size;
          x = x - size;
          break;
        case 3: // place square above
          sx = x; sy = y - size;
          y = y - size;
          break;
      }

      rects.push({ sx: sx, sy: sy, size: size, dir: dir });
      dir = (dir + 1) % 4;
    }
    return rects;
  };

  GoldenRatioViz.prototype._getRectsBounds = function (rects) {
    var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    rects.forEach(function (r) {
      if (r.sx < minX) minX = r.sx;
      if (r.sy < minY) minY = r.sy;
      if (r.sx + r.size > maxX) maxX = r.sx + r.size;
      if (r.sy + r.size > maxY) maxY = r.sy + r.size;
    });
    return { minX: minX, minY: minY, maxX: maxX, maxY: maxY };
  };

  GoldenRatioViz.prototype._buildSpiralPathData = function (rects) {
    var parts = [];
    rects.forEach(function (rect, i) {
      var s = rect.size;
      var cx, cy, startAngle, endAngle;

      // Quarter-circle arc: pivot is at specific corner depending on direction
      switch (rect.dir) {
        case 0: // right → arc from bottom-left to top-right
          cx = rect.sx + s;
          cy = rect.sy + s;
          startAngle = Math.PI;
          endAngle = Math.PI * 1.5;
          break;
        case 1: // down → arc from top-left to bottom-right
          cx = rect.sx;
          cy = rect.sy + s;
          startAngle = Math.PI * 1.5;
          endAngle = Math.PI * 2;
          break;
        case 2: // left → arc from top-right to bottom-left
          cx = rect.sx;
          cy = rect.sy;
          startAngle = 0;
          endAngle = Math.PI * 0.5;
          break;
        case 3: // up → arc from bottom-right to top-left
          cx = rect.sx + s;
          cy = rect.sy;
          startAngle = Math.PI * 0.5;
          endAngle = Math.PI;
          break;
      }

      // Generate arc points
      var numPts = 20;
      for (var j = 0; j <= numPts; j++) {
        var t = j / numPts;
        var angle = startAngle + t * (endAngle - startAngle);
        var px = cx + s * Math.cos(angle);
        var py = cy + s * Math.sin(angle);
        if (i === 0 && j === 0) {
          parts.push('M ' + px + ' ' + py);
        } else {
          parts.push('L ' + px + ' ' + py);
        }
      }
    });
    return parts.join(' ');
  };


  /* ================================================================
     2. FibonacciSpiralInteractive — Интерактив со слайдером
     ================================================================ */
  function FibonacciSpiralInteractive(containerSelector) {
    this.container = document.querySelector(containerSelector);
    if (!this.container) return;

    this.width = 800;
    this.height = 600;
    this.svg = null;
  }

  FibonacciSpiralInteractive.prototype.init = function () {
    if (!this.container) return;

    this.svg = d3.select(this.container)
      .append('svg')
      .attr('viewBox', '0 0 ' + this.width + ' ' + this.height)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('width', '100%')
      .style('height', '100%');

    var slider = document.getElementById('spiral-steps');
    var valueDisplay = document.getElementById('spiral-steps-value');
    var self = this;

    if (slider) {
      this.draw(parseInt(slider.value, 10));
      slider.addEventListener('input', function () {
        var val = parseInt(this.value, 10);
        if (valueDisplay) valueDisplay.textContent = val;
        self.draw(val);
      });
    }

    return this;
  };

  FibonacciSpiralInteractive.prototype.draw = function (numSteps) {
    if (!this.svg) return;

    var w = this.width;
    var h = this.height;
    var fib = fibSequence(numSteps);
    var amber = getCSSVar('--accent-amber') || '#f59e0b';
    var rose = getCSSVar('--accent-rose') || '#f43f5e';
    var textPrimary = getCSSVar('--text-primary') || '#e8eaf0';

    // Compute scale to fit
    var maxFib = fib[fib.length - 1];
    var scale = Math.min(w * 0.6, h * 0.6) / (maxFib || 1);
    // Ensure small fib values still render nicely
    scale = Math.min(scale, 40);

    var rects = [];
    var x = 0, y = 0, dir = 0;

    for (var i = 0; i < fib.length; i++) {
      var size = fib[i] * scale;
      var sx, sy;
      switch (dir) {
        case 0: sx = x; sy = y; x += size; break;
        case 1: sx = x - size; sy = y; y += size; break;
        case 2: sx = x - size; sy = y - size; x -= size; break;
        case 3: sx = x; sy = y - size; y -= size; break;
      }
      rects.push({ sx: sx, sy: sy, size: size, dir: dir, fib: fib[i] });
      dir = (dir + 1) % 4;
    }

    // Center offset
    var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    rects.forEach(function (r) {
      if (r.sx < minX) minX = r.sx;
      if (r.sy < minY) minY = r.sy;
      if (r.sx + r.size > maxX) maxX = r.sx + r.size;
      if (r.sy + r.size > maxY) maxY = r.sy + r.size;
    });
    var offX = (w - (maxX - minX)) / 2 - minX;
    var offY = (h - (maxY - minY)) / 2 - minY;

    // Color gradient
    var colorScale = d3.scaleLinear()
      .domain([0, rects.length - 1])
      .range([amber, rose]);

    // Clear & redraw
    this.svg.selectAll('*').remove();

    var g = this.svg.append('g')
      .attr('transform', 'translate(' + offX + ',' + offY + ')');

    // Rectangles
    rects.forEach(function (rect, i) {
      g.append('rect')
        .attr('x', rect.sx).attr('y', rect.sy)
        .attr('width', rect.size).attr('height', rect.size)
        .attr('fill', 'none')
        .attr('stroke', colorScale(i))
        .attr('stroke-width', 2)
        .attr('opacity', 0)
        .transition().duration(400).delay(i * 100)
        .attr('opacity', 0.7);

      // Label
      if (rect.size > 20) {
        g.append('text')
          .attr('x', rect.sx + rect.size / 2)
          .attr('y', rect.sy + rect.size / 2)
          .attr('text-anchor', 'middle')
          .attr('dy', '0.35em')
          .attr('fill', textPrimary)
          .attr('font-family', 'JetBrains Mono, monospace')
          .attr('font-size', Math.max(9, Math.min(rect.size * 0.25, 20)) + 'px')
          .text(rect.fib)
          .attr('opacity', 0)
          .transition().duration(300).delay(i * 100 + 200)
          .attr('opacity', 0.5);
      }
    });

    // Build spiral path
    var parts = [];
    rects.forEach(function (rect, i) {
      var s = rect.size;
      var cx, cy, startAngle, endAngle;
      switch (rect.dir) {
        case 0: cx = rect.sx + s; cy = rect.sy + s; startAngle = Math.PI; endAngle = Math.PI * 1.5; break;
        case 1: cx = rect.sx; cy = rect.sy + s; startAngle = Math.PI * 1.5; endAngle = Math.PI * 2; break;
        case 2: cx = rect.sx; cy = rect.sy; startAngle = 0; endAngle = Math.PI * 0.5; break;
        case 3: cx = rect.sx + s; cy = rect.sy; startAngle = Math.PI * 0.5; endAngle = Math.PI; break;
      }
      var numPts = 20;
      for (var j = 0; j <= numPts; j++) {
        var t = j / numPts;
        var angle = startAngle + t * (endAngle - startAngle);
        var px = cx + s * Math.cos(angle);
        var py = cy + s * Math.sin(angle);
        if (i === 0 && j === 0) {
          parts.push('M ' + px + ' ' + py);
        } else {
          parts.push('L ' + px + ' ' + py);
        }
      }
    });

    var spiralLine = g.append('path')
      .attr('d', parts.join(' '))
      .attr('fill', 'none')
      .attr('stroke', amber)
      .attr('stroke-width', 3)
      .attr('stroke-linecap', 'round');

    var totalLength = spiralLine.node().getTotalLength();
    spiralLine
      .attr('stroke-dasharray', totalLength)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(1500)
      .delay(numSteps * 80)
      .ease(d3.easeCubicInOut)
      .attr('stroke-dashoffset', 0);
  };


  /* ================================================================
     3. ProportionChecker — Интерактив «Проверь пропорции»
     ================================================================ */
  function ProportionChecker(containerSelector) {
    this.container = document.querySelector(containerSelector);
    if (!this.container) return;

    this.width = 800;
    this.height = 160;
    this.margin = { left: 40, right: 40 };
    this.svg = null;
    this.dividerX = 0;
  }

  ProportionChecker.prototype.init = function () {
    if (!this.container) return;

    var self = this;
    var w = this.width;
    var h = this.height;
    var ml = this.margin.left;
    var mr = this.margin.right;
    var barWidth = w - ml - mr;
    var barY = 40;
    var barH = 36;

    // Initial divider at golden ratio position
    this.dividerX = ml + barWidth / PHI;
    // Offset a bit so user has to find it
    this.dividerX = ml + barWidth * 0.5;

    this.svg = d3.select(this.container)
      .append('svg')
      .attr('viewBox', '0 0 ' + w + ' ' + h)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('width', '100%')
      .style('height', '100%')
      .style('cursor', 'default');

    var amber = getCSSVar('--accent-amber') || '#f59e0b';
    var blue = getCSSVar('--accent-blue') || '#3b82f6';
    var cyan = getCSSVar('--accent-cyan') || '#06b6d4';
    var textPrimary = getCSSVar('--text-primary') || '#e8eaf0';
    var textMuted = getCSSVar('--text-muted') || '#64748b';
    var bgCard = getCSSVar('--bg-card') || '#1a2235';

    // Part A (left)
    this.partA = this.svg.append('rect')
      .attr('x', ml)
      .attr('y', barY)
      .attr('width', this.dividerX - ml)
      .attr('height', barH)
      .attr('rx', 4)
      .attr('fill', blue)
      .attr('opacity', 0.6);

    // Part B (right)
    this.partB = this.svg.append('rect')
      .attr('x', this.dividerX)
      .attr('y', barY)
      .attr('width', ml + barWidth - this.dividerX)
      .attr('height', barH)
      .attr('rx', 4)
      .attr('fill', cyan)
      .attr('opacity', 0.6);

    // Labels A and B
    this.labelA = this.svg.append('text')
      .attr('y', barY + barH / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .attr('fill', textPrimary)
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('font-size', '16px')
      .attr('font-weight', '500')
      .text('a');

    this.labelB = this.svg.append('text')
      .attr('y', barY + barH / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .attr('fill', textPrimary)
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('font-size', '16px')
      .attr('font-weight', '500')
      .text('b');

    // Divider handle
    this.divider = this.svg.append('g')
      .attr('class', 'divider-handle')
      .style('cursor', 'ew-resize');

    this.divider.append('rect')
      .attr('x', -12)
      .attr('y', barY - 8)
      .attr('width', 24)
      .attr('height', barH + 16)
      .attr('rx', 6)
      .attr('fill', textPrimary)
      .attr('opacity', 0.9);

    this.divider.append('line')
      .attr('x1', -3).attr('x2', -3)
      .attr('y1', barY).attr('y2', barY + barH)
      .attr('stroke', bgCard).attr('stroke-width', 1.5);
    this.divider.append('line')
      .attr('x1', 3).attr('x2', 3)
      .attr('y1', barY).attr('y2', barY + barH)
      .attr('stroke', bgCard).attr('stroke-width', 1.5);

    this.divider.attr('transform', 'translate(' + this.dividerX + ', 0)');

    // Scale below
    var scaleY = barY + barH + 30;
    var scaleGroup = this.svg.append('g');

    // Tick marks from 1.0 to 2.0
    for (var v = 1.0; v <= 2.01; v += 0.1) {
      var tx = ml + ((v - 1.0) / 1.0) * barWidth;
      scaleGroup.append('line')
        .attr('x1', tx).attr('x2', tx)
        .attr('y1', scaleY).attr('y2', scaleY + 8)
        .attr('stroke', textMuted).attr('stroke-width', 1);
      scaleGroup.append('text')
        .attr('x', tx).attr('y', scaleY + 22)
        .attr('text-anchor', 'middle')
        .attr('fill', textMuted)
        .attr('font-size', '10px')
        .attr('font-family', 'JetBrains Mono, monospace')
        .text(v.toFixed(1));
    }

    // φ mark
    var phiX = ml + ((PHI - 1.0) / 1.0) * barWidth;
    scaleGroup.append('line')
      .attr('x1', phiX).attr('x2', phiX)
      .attr('y1', scaleY - 4).attr('y2', scaleY + 12)
      .attr('stroke', amber).attr('stroke-width', 2);
    scaleGroup.append('text')
      .attr('x', phiX).attr('y', scaleY + 26)
      .attr('text-anchor', 'middle')
      .attr('fill', amber)
      .attr('font-size', '12px')
      .attr('font-weight', '600')
      .attr('font-family', 'JetBrains Mono, monospace')
      .text('φ');

    // Ratio indicator on scale
    this.ratioIndicator = this.svg.append('circle')
      .attr('cy', scaleY)
      .attr('r', 5)
      .attr('fill', textPrimary);

    // D3 drag
    var drag = d3.drag()
      .on('drag', function (event) {
        var newX = Math.max(ml + 30, Math.min(ml + barWidth - 30, event.x));
        self.dividerX = newX;
        self.update();
      });

    this.divider.call(drag);

    // Store references
    this.barWidth = barWidth;
    this.barY = barY;
    this.barH = barH;
    this.ml = ml;
    this.scaleY = scaleY;
    this.amber = amber;
    this.blue = blue;
    this.cyan = cyan;

    this.update();
    return this;
  };

  ProportionChecker.prototype.update = function () {
    var a = this.dividerX - this.ml;
    var b = this.ml + this.barWidth - this.dividerX;
    var ratioAB = a / b;
    var ratioTotal = (a + b) / a;
    var isGolden = Math.abs(ratioAB - PHI) < 0.02;

    // Update positions
    this.divider.attr('transform', 'translate(' + this.dividerX + ', 0)');
    this.partA.attr('width', a);
    this.partB.attr('x', this.dividerX).attr('width', b);

    this.labelA.attr('x', this.ml + a / 2);
    this.labelB.attr('x', this.dividerX + b / 2);

    // Color when golden
    if (isGolden) {
      this.partA.attr('fill', this.amber).attr('opacity', 0.8);
      this.partB.attr('fill', this.amber).attr('opacity', 0.5);
    } else {
      this.partA.attr('fill', this.blue).attr('opacity', 0.6);
      this.partB.attr('fill', this.cyan).attr('opacity', 0.6);
    }

    // Ratio indicator
    var indicatorX = this.ml + ((ratioAB - 1.0) / 1.0) * this.barWidth;
    indicatorX = Math.max(this.ml, Math.min(this.ml + this.barWidth, indicatorX));
    this.ratioIndicator
      .attr('cx', indicatorX)
      .attr('fill', isGolden ? this.amber : (getCSSVar('--text-primary') || '#e8eaf0'));

    // Update readout DOM
    var readoutAB = document.querySelector('#readout-ab .proportion-readout__value');
    var readoutTotal = document.querySelector('#readout-total .proportion-readout__value');
    var readoutABItem = document.getElementById('readout-ab');
    var readoutTotalItem = document.getElementById('readout-total');
    var goldenMsg = document.getElementById('golden-message');

    if (readoutAB) readoutAB.textContent = ratioAB.toFixed(3).replace('.', ',');
    if (readoutTotal) readoutTotal.textContent = ratioTotal.toFixed(3).replace('.', ',');

    if (readoutABItem) readoutABItem.classList.toggle('is-golden', isGolden);
    if (readoutTotalItem) readoutTotalItem.classList.toggle('is-golden', Math.abs(ratioTotal - PHI) < 0.02);
    if (goldenMsg) goldenMsg.classList.toggle('is-visible', isGolden);
  };


  /* ================================================================
     4. Initialization
     ================================================================ */
  function init() {
    // Scrollytelling visualization
    var scrollViz = new GoldenRatioViz('#viz-scrollytelling');
    if (scrollViz.container) {
      scrollViz.init();

      // Listen for step changes from core.js
      document.addEventListener('storytelling:step', function (e) {
        var step = e.detail.index + 1; // steps are 0-indexed in core.js
        scrollViz.goToStep(step);
      });
    }

    // Fibonacci spiral interactive
    var spiralInteractive = new FibonacciSpiralInteractive('#spiral-canvas');
    if (spiralInteractive.container) {
      spiralInteractive.init();
    }

    // Proportion checker interactive
    var proportionChecker = new ProportionChecker('#proportion-canvas');
    if (proportionChecker.container) {
      proportionChecker.init();
    }
  }

  // Wait for DOM and all defer scripts
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
