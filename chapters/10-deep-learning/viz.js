/* ============================================================
   VIZ.JS — Глава 10: Глубокое обучение
   ScrollViz (5 шагов) + CNNInteractive + AttentionInteractive
   ============================================================ */
(function () {
  'use strict';

  /* ──────────────────── helpers ──────────────────── */
  var W = 800, H = 500;

  function sel(id) { return document.getElementById(id); }

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  /* ──────────────────── ScrollViz ──────────────────── */
  function ScrollViz() {
    var svg = d3.select('#svg-main');
    if (!svg.node()) return;

    svg.attr('viewBox', '0 0 ' + W + ' ' + H)
       .attr('preserveAspectRatio', 'xMidYMid meet')
       .style('width', '100%')
       .style('background', 'var(--bg-primary)');

    var layers = {};
    ['timeline', 'cnn', 'rnn', 'attention', 'scaling'].forEach(function (name) {
      layers[name] = svg.append('g').attr('class', 'layer-' + name).style('opacity', 0).style('display', 'none');
    });

    this.layers = layers;
    this.current = 0;
    this._drawTimeline();
    this._drawCNN();
    this._drawRNN();
    this._drawAttention();
    this._drawScaling();
    this.goToStep(1);

    var self = this;
    document.addEventListener('storytelling:step', function (e) {
      self.goToStep(e.detail.index);
    });
  }

  ScrollViz.prototype.goToStep = function (step) {
    var names = ['timeline', 'cnn', 'rnn', 'attention', 'scaling'];
    var target = names[step - 1] || names[0];
    var layers = this.layers;

    names.forEach(function (name) {
      var layer = layers[name];
      layer.interrupt();
      if (name === target) {
        layer.style('display', null).transition().duration(500).style('opacity', 1);
      } else {
        layer.style('opacity', 0).style('display', 'none');
      }
    });
    this.current = step;
  };

  /* --- Step 1: AI timeline --- */
  ScrollViz.prototype._drawTimeline = function () {
    var g = this.layers.timeline;
    var events = [
      { year: 1958, label: 'Перцептрон', color: 'var(--accent-blue)' },
      { year: 1986, label: 'Backprop', color: 'var(--accent-cyan)' },
      { year: 1998, label: 'LeNet-5', color: 'var(--accent-emerald)' },
      { year: 2012, label: 'AlexNet', color: 'var(--accent-amber)' },
      { year: 2017, label: 'Transformer', color: 'var(--accent-rose)' },
      { year: 2022, label: 'ChatGPT', color: 'var(--accent-violet)' }
    ];

    var x = d3.scaleLinear().domain([1955, 2025]).range([80, W - 40]);
    var y0 = H / 2;

    // Axis line
    g.append('line')
      .attr('x1', 60).attr('x2', W - 20)
      .attr('y1', y0).attr('y2', y0)
      .attr('stroke', 'var(--text-muted)').attr('stroke-width', 2)
      .attr('stroke-dasharray', '6,4');

    events.forEach(function (ev, i) {
      var cx = x(ev.year);
      var above = i % 2 === 0;
      var ty = above ? y0 - 60 : y0 + 60;

      g.append('line')
        .attr('x1', cx).attr('x2', cx)
        .attr('y1', y0).attr('y2', ty)
        .attr('stroke', ev.color).attr('stroke-width', 2);

      g.append('circle')
        .attr('cx', cx).attr('cy', y0)
        .attr('r', 8).attr('fill', ev.color);

      g.append('text')
        .attr('x', cx).attr('y', ty + (above ? -12 : 24))
        .attr('text-anchor', 'middle')
        .attr('fill', ev.color)
        .attr('font-family', 'var(--font-mono)')
        .attr('font-size', '14px')
        .attr('font-weight', '700')
        .text(ev.year);

      g.append('text')
        .attr('x', cx).attr('y', ty + (above ? -32 : 44))
        .attr('text-anchor', 'middle')
        .attr('fill', 'var(--text-primary)')
        .attr('font-size', '13px')
        .text(ev.label);
    });
  };

  /* --- Step 2: CNN diagram --- */
  ScrollViz.prototype._drawCNN = function () {
    var g = this.layers.cnn;
    var layersCNN = [
      { w: 80, h: 80, label: 'Вход', color: 'var(--accent-blue)' },
      { w: 60, h: 70, label: 'Conv1', color: 'var(--accent-cyan)' },
      { w: 50, h: 60, label: 'Conv2', color: 'var(--accent-emerald)' },
      { w: 40, h: 50, label: 'Pool', color: 'var(--accent-amber)' },
      { w: 30, h: 40, label: 'FC', color: 'var(--accent-rose)' },
      { w: 20, h: 30, label: 'Out', color: 'var(--accent-violet)' }
    ];

    var gap = (W - 120) / layersCNN.length;
    var cy = H / 2;

    layersCNN.forEach(function (layer, i) {
      var cx = 80 + gap * i + gap / 2;
      // Layer rectangle
      g.append('rect')
        .attr('x', cx - layer.w / 2)
        .attr('y', cy - layer.h / 2)
        .attr('width', layer.w)
        .attr('height', layer.h)
        .attr('rx', 6)
        .attr('fill', layer.color)
        .attr('opacity', 0.25)
        .attr('stroke', layer.color)
        .attr('stroke-width', 2);

      // Label
      g.append('text')
        .attr('x', cx).attr('y', cy + 4)
        .attr('text-anchor', 'middle')
        .attr('fill', 'var(--text-primary)')
        .attr('font-size', '13px')
        .attr('font-weight', '600')
        .text(layer.label);

      // Arrow to next
      if (i < layersCNN.length - 1) {
        var nextCx = 80 + gap * (i + 1) + gap / 2;
        g.append('line')
          .attr('x1', cx + layer.w / 2 + 4)
          .attr('x2', nextCx - layersCNN[i + 1].w / 2 - 4)
          .attr('y1', cy).attr('y2', cy)
          .attr('stroke', 'var(--text-muted)')
          .attr('stroke-width', 2)
          .attr('marker-end', 'url(#arrow-cnn)');
      }
    });

    // Arrow marker
    g.append('defs').append('marker')
      .attr('id', 'arrow-cnn')
      .attr('viewBox', '0 0 10 10')
      .attr('refX', 10).attr('refY', 5)
      .attr('markerWidth', 6).attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,0 L10,5 L0,10 Z')
      .attr('fill', 'var(--text-muted)');

    // Title
    g.append('text')
      .attr('x', W / 2).attr('y', 40)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--text-primary)')
      .attr('font-size', '16px')
      .attr('font-weight', '700')
      .text('Архитектура свёрточной сети');
  };

  /* --- Step 3: RNN diagram --- */
  ScrollViz.prototype._drawRNN = function () {
    var g = this.layers.rnn;
    var steps = ['x₁', 'x₂', 'x₃', 'x₄', 'x₅'];
    var gap = (W - 160) / steps.length;
    var cy = H / 2;
    var r = 30;

    // Title
    g.append('text')
      .attr('x', W / 2).attr('y', 40)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--text-primary)')
      .attr('font-size', '16px')
      .attr('font-weight', '700')
      .text('Рекуррентная сеть — развёрнутая во времени');

    steps.forEach(function (label, i) {
      var cx = 100 + gap * i + gap / 2;

      // Hidden state circle
      g.append('circle')
        .attr('cx', cx).attr('cy', cy)
        .attr('r', r)
        .attr('fill', 'var(--accent-cyan)')
        .attr('opacity', 0.2)
        .attr('stroke', 'var(--accent-cyan)')
        .attr('stroke-width', 2);

      g.append('text')
        .attr('x', cx).attr('y', cy + 4)
        .attr('text-anchor', 'middle')
        .attr('fill', 'var(--text-primary)')
        .attr('font-size', '14px')
        .attr('font-weight', '600')
        .text('h' + (i + 1));

      // Input below
      g.append('text')
        .attr('x', cx).attr('y', cy + r + 30)
        .attr('text-anchor', 'middle')
        .attr('fill', 'var(--accent-blue)')
        .attr('font-size', '14px')
        .text(label);

      g.append('line')
        .attr('x1', cx).attr('x2', cx)
        .attr('y1', cy + r + 14).attr('y2', cy + r + 2)
        .attr('stroke', 'var(--accent-blue)')
        .attr('stroke-width', 1.5)
        .attr('marker-end', 'url(#arrow-rnn)');

      // Output above
      g.append('text')
        .attr('x', cx).attr('y', cy - r - 20)
        .attr('text-anchor', 'middle')
        .attr('fill', 'var(--accent-emerald)')
        .attr('font-size', '14px')
        .text('y' + (i + 1));

      g.append('line')
        .attr('x1', cx).attr('x2', cx)
        .attr('y1', cy - r - 2).attr('y2', cy - r - 14)
        .attr('stroke', 'var(--accent-emerald)')
        .attr('stroke-width', 1.5)
        .attr('marker-end', 'url(#arrow-rnn-up)');

      // Arrow to next hidden state
      if (i < steps.length - 1) {
        var nextCx = 100 + gap * (i + 1) + gap / 2;
        g.append('line')
          .attr('x1', cx + r + 4)
          .attr('x2', nextCx - r - 4)
          .attr('y1', cy).attr('y2', cy)
          .attr('stroke', 'var(--accent-amber)')
          .attr('stroke-width', 2)
          .attr('marker-end', 'url(#arrow-rnn)');
      }
    });

    // Arrow markers
    var defs = g.append('defs');
    defs.append('marker')
      .attr('id', 'arrow-rnn')
      .attr('viewBox', '0 0 10 10')
      .attr('refX', 10).attr('refY', 5)
      .attr('markerWidth', 5).attr('markerHeight', 5)
      .attr('orient', 'auto')
      .append('path').attr('d', 'M0,0 L10,5 L0,10 Z').attr('fill', 'var(--accent-amber)');

    defs.append('marker')
      .attr('id', 'arrow-rnn-up')
      .attr('viewBox', '0 0 10 10')
      .attr('refX', 5).attr('refY', 0)
      .attr('markerWidth', 5).attr('markerHeight', 5)
      .attr('orient', 'auto')
      .append('path').attr('d', 'M0,10 L5,0 L10,10 Z').attr('fill', 'var(--accent-emerald)');
  };

  /* --- Step 4: Attention visualization --- */
  ScrollViz.prototype._drawAttention = function () {
    var g = this.layers.attention;
    var tokens = ['The', 'cat', 'sat', 'on', 'the', 'mat'];
    var n = tokens.length;
    var cellSize = 50;
    var offsetX = (W - n * cellSize) / 2;
    var offsetY = 80;

    // Simulated attention weights (row = query, col = key)
    var weights = [
      [0.6, 0.1, 0.05, 0.05, 0.15, 0.05],
      [0.05, 0.5, 0.15, 0.05, 0.05, 0.2],
      [0.05, 0.15, 0.4, 0.2, 0.05, 0.15],
      [0.1, 0.05, 0.15, 0.4, 0.2, 0.1],
      [0.3, 0.05, 0.05, 0.1, 0.4, 0.1],
      [0.05, 0.2, 0.1, 0.1, 0.05, 0.5]
    ];

    // Title
    g.append('text')
      .attr('x', W / 2).attr('y', 35)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--text-primary)')
      .attr('font-size', '16px')
      .attr('font-weight', '700')
      .text('Матрица внимания: Query × Key');

    var colorScale = d3.scaleSequential(d3.interpolateReds).domain([0, 0.7]);

    // Column headers
    tokens.forEach(function (t, j) {
      g.append('text')
        .attr('x', offsetX + j * cellSize + cellSize / 2)
        .attr('y', offsetY - 8)
        .attr('text-anchor', 'middle')
        .attr('fill', 'var(--text-secondary)')
        .attr('font-size', '12px')
        .text(t);
    });

    // Rows
    weights.forEach(function (row, i) {
      // Row label
      g.append('text')
        .attr('x', offsetX - 10)
        .attr('y', offsetY + i * cellSize + cellSize / 2 + 4)
        .attr('text-anchor', 'end')
        .attr('fill', 'var(--text-secondary)')
        .attr('font-size', '12px')
        .text(tokens[i]);

      row.forEach(function (w, j) {
        g.append('rect')
          .attr('x', offsetX + j * cellSize + 1)
          .attr('y', offsetY + i * cellSize + 1)
          .attr('width', cellSize - 2)
          .attr('height', cellSize - 2)
          .attr('rx', 3)
          .attr('fill', colorScale(w))
          .attr('opacity', 0.9);

        g.append('text')
          .attr('x', offsetX + j * cellSize + cellSize / 2)
          .attr('y', offsetY + i * cellSize + cellSize / 2 + 4)
          .attr('text-anchor', 'middle')
          .attr('fill', w > 0.35 ? '#fff' : 'var(--text-primary)')
          .attr('font-size', '11px')
          .attr('font-family', 'var(--font-mono)')
          .text(w.toFixed(2));
      });
    });

    // Legend
    g.append('text')
      .attr('x', W / 2).attr('y', offsetY + n * cellSize + 35)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--text-muted)')
      .attr('font-size', '12px')
      .text('Яркость = сила внимания от строки (Query) к столбцу (Key)');
  };

  /* --- Step 5: Scaling laws --- */
  ScrollViz.prototype._drawScaling = function () {
    var g = this.layers.scaling;
    var models = [
      { name: 'GPT-1', params: 0.117, year: 2018, color: 'var(--accent-blue)' },
      { name: 'BERT', params: 0.34, year: 2018, color: 'var(--accent-cyan)' },
      { name: 'GPT-2', params: 1.5, year: 2019, color: 'var(--accent-emerald)' },
      { name: 'GPT-3', params: 175, year: 2020, color: 'var(--accent-amber)' },
      { name: 'PaLM', params: 540, year: 2022, color: 'var(--accent-rose)' },
      { name: 'GPT-4', params: 1800, year: 2023, color: 'var(--accent-violet)' }
    ];

    var margin = { top: 60, right: 40, bottom: 60, left: 80 };
    var iw = W - margin.left - margin.right;
    var ih = H - margin.top - margin.bottom;

    var x = d3.scaleLinear().domain([2017, 2024]).range([0, iw]);
    var y = d3.scaleLog().domain([0.1, 2000]).range([ih, 0]);
    var rScale = d3.scaleSqrt().domain([0.1, 1800]).range([6, 40]);

    var chart = g.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // Title
    g.append('text')
      .attr('x', W / 2).attr('y', 30)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--text-primary)')
      .attr('font-size', '16px')
      .attr('font-weight', '700')
      .text('Масштабирование моделей (млрд параметров)');

    // Axes
    chart.append('g')
      .attr('transform', 'translate(0,' + ih + ')')
      .call(d3.axisBottom(x).ticks(7).tickFormat(d3.format('d')))
      .selectAll('text').attr('fill', 'var(--text-secondary)');
    chart.selectAll('.domain, .tick line').attr('stroke', 'var(--text-muted)');

    chart.append('g')
      .call(d3.axisLeft(y).ticks(5, '~s'))
      .selectAll('text').attr('fill', 'var(--text-secondary)');

    // Y label
    chart.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -ih / 2).attr('y', -55)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--text-secondary)')
      .attr('font-size', '12px')
      .text('Параметры (млрд)');

    // Bubbles
    models.forEach(function (m) {
      chart.append('circle')
        .attr('cx', x(m.year))
        .attr('cy', y(m.params))
        .attr('r', rScale(m.params))
        .attr('fill', m.color)
        .attr('opacity', 0.3)
        .attr('stroke', m.color)
        .attr('stroke-width', 2);

      chart.append('text')
        .attr('x', x(m.year))
        .attr('y', y(m.params) - rScale(m.params) - 6)
        .attr('text-anchor', 'middle')
        .attr('fill', m.color)
        .attr('font-size', '12px')
        .attr('font-weight', '600')
        .text(m.name);
    });
  };

  /* ──────────────────── CNN Interactive ──────────────────── */
  function CNNInteractive() {
    this.inputSize = 8;
    this.filterSize = 3;
    this.outputSize = this.inputSize - this.filterSize + 1; // 6
    this.cellSize = 36;
    this.grid = [];
    this.filter = [
      [-1, -1, -1],
      [-1,  8, -1],
      [-1, -1, -1]
    ];
    this.painting = false;

    for (var i = 0; i < this.inputSize; i++) {
      this.grid[i] = [];
      for (var j = 0; j < this.inputSize; j++) {
        this.grid[i][j] = 0;
      }
    }

    this.init();
  }

  CNNInteractive.prototype.init = function () {
    var self = this;
    var inputEl = sel('cnn-input');
    var filterEl = sel('cnn-filter');
    var outputEl = sel('cnn-output');
    if (!inputEl || !filterEl || !outputEl) return;

    // Input grid SVG
    var iw = this.inputSize * this.cellSize;
    this.svgInput = d3.select(inputEl).append('svg')
      .attr('viewBox', '0 0 ' + iw + ' ' + iw)
      .attr('width', iw).attr('height', iw)
      .style('max-width', '100%')
      .style('touch-action', 'none')
      .style('cursor', 'crosshair')
      .style('border', '1px solid var(--border-primary)')
      .style('border-radius', 'var(--radius-sm)');

    // Filter grid SVG
    var fw = this.filterSize * this.cellSize;
    this.svgFilter = d3.select(filterEl).append('svg')
      .attr('viewBox', '0 0 ' + fw + ' ' + fw)
      .attr('width', fw).attr('height', fw)
      .style('max-width', '100%')
      .style('border', '1px solid var(--border-primary)')
      .style('border-radius', 'var(--radius-sm)');

    // Output grid SVG
    var ow = this.outputSize * this.cellSize;
    this.svgOutput = d3.select(outputEl).append('svg')
      .attr('viewBox', '0 0 ' + ow + ' ' + ow)
      .attr('width', ow).attr('height', ow)
      .style('max-width', '100%')
      .style('border', '1px solid var(--border-primary)')
      .style('border-radius', 'var(--radius-sm)');

    // Draw input cells
    for (var i = 0; i < this.inputSize; i++) {
      for (var j = 0; j < this.inputSize; j++) {
        this.svgInput.append('rect')
          .attr('class', 'input-cell')
          .attr('data-row', i)
          .attr('data-col', j)
          .attr('x', j * this.cellSize)
          .attr('y', i * this.cellSize)
          .attr('width', this.cellSize)
          .attr('height', this.cellSize)
          .attr('fill', '#111')
          .attr('stroke', 'var(--border-primary)')
          .attr('stroke-width', 0.5);
      }
    }

    // Mouse/touch drawing on input
    this.svgInput
      .on('pointerdown', function (event) {
        self.painting = true;
        self._paint(event);
      })
      .on('pointermove', function (event) {
        if (self.painting) self._paint(event);
      })
      .on('pointerup', function () { self.painting = false; })
      .on('pointerleave', function () { self.painting = false; });

    // Buttons
    var btnEdge = sel('btn-filter-edge');
    var btnSharpen = sel('btn-filter-sharpen');
    var btnBlur = sel('btn-filter-blur');
    var btnEmboss = sel('btn-filter-emboss');
    var btnClear = sel('btn-cnn-clear');
    var btnExample = sel('btn-cnn-example');

    if (btnEdge) btnEdge.addEventListener('click', function () {
      self.setFilter([[-1,-1,-1],[-1,8,-1],[-1,-1,-1]]);
    });
    if (btnSharpen) btnSharpen.addEventListener('click', function () {
      self.setFilter([[0,-1,0],[-1,5,-1],[0,-1,0]]);
    });
    if (btnBlur) btnBlur.addEventListener('click', function () {
      self.setFilter([[1,1,1],[1,1,1],[1,1,1]]);
    });
    if (btnEmboss) btnEmboss.addEventListener('click', function () {
      self.setFilter([[-2,-1,0],[-1,1,1],[0,1,2]]);
    });
    if (btnClear) btnClear.addEventListener('click', function () {
      self.clearGrid();
    });
    if (btnExample) btnExample.addEventListener('click', function () {
      self.loadExample();
    });

    this.drawFilter();
    this.convolve();
  };

  CNNInteractive.prototype._paint = function (event) {
    var svg = this.svgInput.node();
    var pt = d3.pointer(event, svg);
    var col = Math.floor(pt[0] / this.cellSize);
    var row = Math.floor(pt[1] / this.cellSize);
    if (row >= 0 && row < this.inputSize && col >= 0 && col < this.inputSize) {
      this.grid[row][col] = clamp(this.grid[row][col] + 0.3, 0, 1);
      this.drawInput();
      this.convolve();
    }
  };

  CNNInteractive.prototype.drawInput = function () {
    var self = this;
    this.svgInput.selectAll('.input-cell').each(function () {
      var cell = d3.select(this);
      var r = +cell.attr('data-row');
      var c = +cell.attr('data-col');
      var v = self.grid[r][c];
      cell.attr('fill', d3.interpolateGreys(v));
    });
  };

  CNNInteractive.prototype.setFilter = function (f) {
    this.filter = f;
    this.drawFilter();
    this.convolve();
  };

  CNNInteractive.prototype.drawFilter = function () {
    this.svgFilter.selectAll('*').remove();
    var cs = this.cellSize;
    var vals = [];
    for (var i = 0; i < this.filterSize; i++) {
      for (var j = 0; j < this.filterSize; j++) {
        vals.push(this.filter[i][j]);
      }
    }
    var maxAbs = d3.max(vals, function (d) { return Math.abs(d); }) || 1;
    var colorScale = d3.scaleLinear()
      .domain([-maxAbs, 0, maxAbs])
      .range(['#3b82f6', '#1a1a2e', '#f43f5e']);

    for (var i = 0; i < this.filterSize; i++) {
      for (var j = 0; j < this.filterSize; j++) {
        var v = this.filter[i][j];
        this.svgFilter.append('rect')
          .attr('x', j * cs).attr('y', i * cs)
          .attr('width', cs).attr('height', cs)
          .attr('fill', colorScale(v))
          .attr('stroke', 'var(--border-primary)')
          .attr('stroke-width', 0.5);

        this.svgFilter.append('text')
          .attr('x', j * cs + cs / 2)
          .attr('y', i * cs + cs / 2 + 4)
          .attr('text-anchor', 'middle')
          .attr('fill', '#fff')
          .attr('font-size', '12px')
          .attr('font-family', 'var(--font-mono)')
          .text(v);
      }
    }
  };

  CNNInteractive.prototype.convolve = function () {
    var output = [];
    for (var i = 0; i < this.outputSize; i++) {
      output[i] = [];
      for (var j = 0; j < this.outputSize; j++) {
        var sum = 0;
        for (var fi = 0; fi < this.filterSize; fi++) {
          for (var fj = 0; fj < this.filterSize; fj++) {
            sum += this.grid[i + fi][j + fj] * this.filter[fi][fj];
          }
        }
        output[i][j] = sum;
      }
    }

    // Normalize output for display
    var flat = [];
    output.forEach(function (row) { row.forEach(function (v) { flat.push(v); }); });
    var minVal = d3.min(flat);
    var maxVal = d3.max(flat);
    var range = maxVal - minVal || 1;

    this.svgOutput.selectAll('*').remove();
    var cs = this.cellSize;

    for (var i = 0; i < this.outputSize; i++) {
      for (var j = 0; j < this.outputSize; j++) {
        var normalized = (output[i][j] - minVal) / range;
        this.svgOutput.append('rect')
          .attr('x', j * cs).attr('y', i * cs)
          .attr('width', cs).attr('height', cs)
          .attr('fill', d3.interpolateViridis(normalized))
          .attr('stroke', 'var(--border-primary)')
          .attr('stroke-width', 0.5);
      }
    }
  };

  CNNInteractive.prototype.clearGrid = function () {
    for (var i = 0; i < this.inputSize; i++) {
      for (var j = 0; j < this.inputSize; j++) {
        this.grid[i][j] = 0;
      }
    }
    this.drawInput();
    this.convolve();
  };

  CNNInteractive.prototype.loadExample = function () {
    // Draw a simple cross pattern
    var center = Math.floor(this.inputSize / 2);
    this.clearGrid();
    for (var i = 0; i < this.inputSize; i++) {
      this.grid[i][center] = 1;
      this.grid[i][center - 1] = 0.5;
      this.grid[center][i] = 1;
      this.grid[center - 1][i] = 0.5;
    }
    // Add some corners
    this.grid[1][1] = 0.8;
    this.grid[1][this.inputSize - 2] = 0.8;
    this.grid[this.inputSize - 2][1] = 0.8;
    this.grid[this.inputSize - 2][this.inputSize - 2] = 0.8;
    this.drawInput();
    this.convolve();
  };

  /* ──────────────────── Attention Interactive ──────────────────── */
  function AttentionInteractive() {
    this.locked = -1;
    this.examples = {
      translation: {
        words: ['Кот', 'сидел', 'на', 'коврике', '.'],
        // Simulated attention: each row = query word, cols = keys
        weights: [
          [0.65, 0.10, 0.05, 0.15, 0.05],
          [0.10, 0.50, 0.15, 0.10, 0.15],
          [0.05, 0.15, 0.50, 0.25, 0.05],
          [0.15, 0.05, 0.20, 0.55, 0.05],
          [0.05, 0.10, 0.10, 0.10, 0.65]
        ]
      },
      coreference: {
        words: ['Мария', 'сказала', 'что', 'она', 'придёт', 'завтра'],
        weights: [
          [0.60, 0.10, 0.05, 0.20, 0.03, 0.02],
          [0.15, 0.45, 0.10, 0.10, 0.15, 0.05],
          [0.05, 0.20, 0.40, 0.10, 0.15, 0.10],
          [0.45, 0.10, 0.05, 0.30, 0.05, 0.05],
          [0.05, 0.15, 0.05, 0.20, 0.45, 0.10],
          [0.03, 0.10, 0.07, 0.05, 0.25, 0.50]
        ]
      }
    };

    this.currentExample = 'translation';
    this.init();
  }

  AttentionInteractive.prototype.init = function () {
    var self = this;
    var canvas = sel('attention-canvas');
    if (!canvas) return;

    this.svg = d3.select(canvas).append('svg')
      .style('width', '100%')
      .style('touch-action', 'none');

    var btn1 = sel('btn-attn-example1');
    var btn2 = sel('btn-attn-example2');

    if (btn1) btn1.addEventListener('click', function () {
      self.currentExample = 'translation';
      self.locked = -1;
      self.draw();
    });
    if (btn2) btn2.addEventListener('click', function () {
      self.currentExample = 'coreference';
      self.locked = -1;
      self.draw();
    });

    this.draw();
  };

  AttentionInteractive.prototype.draw = function () {
    var self = this;
    var ex = this.examples[this.currentExample];
    var words = ex.words;
    var weights = ex.weights;
    var n = words.length;
    var cellSize = Math.min(50, 320 / n);
    var svgW = n * cellSize + 100;
    var svgH = n * cellSize + 80;

    this.svg.attr('viewBox', '0 0 ' + svgW + ' ' + svgH);
    this.svg.selectAll('*').remove();

    var offsetX = 70;
    var offsetY = 50;

    var colorScale = d3.scaleSequential(d3.interpolateReds).domain([0, 0.7]);

    // Draw word buttons
    var wordsEl = sel('attention-words');
    if (wordsEl) {
      wordsEl.innerHTML = '';
      words.forEach(function (w, i) {
        var span = document.createElement('span');
        span.className = 'attention-word';
        span.textContent = w;
        span.dataset.index = i;
        span.addEventListener('mouseenter', function () {
          if (self.locked < 0) self.highlight(i);
        });
        span.addEventListener('mouseleave', function () {
          if (self.locked < 0) self.highlight(-1);
        });
        span.addEventListener('click', function () {
          if (self.locked === i) {
            self.locked = -1;
            self.highlight(-1);
          } else {
            self.locked = i;
            self.highlight(i);
          }
        });
        wordsEl.appendChild(span);
      });
    }

    // Column headers
    words.forEach(function (w, j) {
      self.svg.append('text')
        .attr('x', offsetX + j * cellSize + cellSize / 2)
        .attr('y', offsetY - 10)
        .attr('text-anchor', 'middle')
        .attr('fill', 'var(--text-secondary)')
        .attr('font-size', Math.min(12, cellSize * 0.3) + 'px')
        .text(w);
    });

    // Rows + cells
    weights.forEach(function (row, i) {
      // Row label
      self.svg.append('text')
        .attr('x', offsetX - 8)
        .attr('y', offsetY + i * cellSize + cellSize / 2 + 4)
        .attr('text-anchor', 'end')
        .attr('fill', 'var(--text-secondary)')
        .attr('font-size', Math.min(12, cellSize * 0.3) + 'px')
        .text(words[i]);

      row.forEach(function (w, j) {
        self.svg.append('rect')
          .attr('class', 'attn-cell')
          .attr('data-row', i)
          .attr('data-col', j)
          .attr('x', offsetX + j * cellSize + 1)
          .attr('y', offsetY + i * cellSize + 1)
          .attr('width', cellSize - 2)
          .attr('height', cellSize - 2)
          .attr('rx', 2)
          .attr('fill', colorScale(w))
          .attr('opacity', 0.9)
          .attr('stroke', 'transparent')
          .attr('stroke-width', 2);

        if (cellSize >= 30) {
          self.svg.append('text')
            .attr('class', 'attn-label')
            .attr('data-row', i)
            .attr('x', offsetX + j * cellSize + cellSize / 2)
            .attr('y', offsetY + i * cellSize + cellSize / 2 + 4)
            .attr('text-anchor', 'middle')
            .attr('fill', w > 0.35 ? '#fff' : 'var(--text-primary)')
            .attr('font-size', '10px')
            .attr('font-family', 'var(--font-mono)')
            .attr('pointer-events', 'none')
            .text(w.toFixed(2));
        }
      });
    });

    // Interactive hover on cells
    this.svg.selectAll('.attn-cell')
      .on('mouseenter', function () {
        if (self.locked >= 0) return;
        var row = +d3.select(this).attr('data-row');
        self.highlight(row);
      })
      .on('mouseleave', function () {
        if (self.locked >= 0) return;
        self.highlight(-1);
      })
      .on('click', function () {
        var row = +d3.select(this).attr('data-row');
        if (self.locked === row) {
          self.locked = -1;
          self.highlight(-1);
        } else {
          self.locked = row;
          self.highlight(row);
        }
      });
  };

  AttentionInteractive.prototype.highlight = function (rowIndex) {
    var ex = this.examples[this.currentExample];
    var n = ex.words.length;

    // Highlight word chips
    var wordEls = document.querySelectorAll('.attention-word');
    wordEls.forEach(function (el) {
      el.classList.remove('is-highlighted');
    });

    if (rowIndex >= 0 && rowIndex < n) {
      if (wordEls[rowIndex]) wordEls[rowIndex].classList.add('is-highlighted');

      // Highlight row cells, dim others
      this.svg.selectAll('.attn-cell')
        .attr('opacity', function () {
          return +d3.select(this).attr('data-row') === rowIndex ? 1 : 0.3;
        })
        .attr('stroke', function () {
          return +d3.select(this).attr('data-row') === rowIndex ? 'var(--accent-rose)' : 'transparent';
        });

      // Highlight corresponding word chips based on attention weights
      var weights = ex.weights[rowIndex];
      wordEls.forEach(function (el, i) {
        if (weights[i] > 0.2) {
          el.classList.add('is-highlighted');
          el.style.opacity = 0.5 + weights[i];
        } else {
          el.style.opacity = 0.5;
        }
      });
      if (wordEls[rowIndex]) {
        wordEls[rowIndex].style.opacity = 1;
      }
    } else {
      // Reset
      this.svg.selectAll('.attn-cell')
        .attr('opacity', 0.9)
        .attr('stroke', 'transparent');
      wordEls.forEach(function (el) {
        el.style.opacity = 1;
      });
    }
  };

  /* ──────────────────── Bootstrap ──────────────────── */
  function boot() {
    new ScrollViz();
    new CNNInteractive();
    new AttentionInteractive();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
