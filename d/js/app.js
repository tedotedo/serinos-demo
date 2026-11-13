/* Serino's Deli & Wine Bar — Concept D: Station Departure Board
   The page reads the clock and leads with whatever is being served now.
   Service times below are illustrative and must be confirmed by the owner. */
(function () {
  'use strict';

  var SERVICES = [
    {
      id: 'breakfast', name: 'BREAKFAST', start: 8 * 60, end: 11 * 60 + 30, mood: 'day',
      title: 'Breakfast is on.',
      lead: 'Coffee, brunch plates and something quick for the platform. Voted #1 Breakfast on This Is Yarm.',
      menuLabel: 'See the breakfast menu'
    },
    {
      id: 'deli', name: 'DELI & LUNCH', start: 11 * 60 + 30, end: 15 * 60, mood: 'day',
      title: 'The deli counter is open.',
      lead: 'Focaccia, toasted sandwiches and counter bakes, to sit in or take away.',
      menuLabel: 'See the deli & lunch menu'
    },
    {
      id: 'aperitivo', name: 'APERITIVO', start: 16 * 60 + 30, end: 18 * 60, mood: 'dusk',
      title: 'Aperitivo hour.',
      lead: 'A spritz and a few small plates before the evening gets going.',
      menuLabel: 'See the aperitivo menu'
    },
    {
      id: 'wine', name: 'WINE & PIZZA', start: 18 * 60, end: 22 * 60, mood: 'night',
      title: 'Wine and pizza tonight.',
      lead: 'Sharing boards, pizza from the oven and a proper wine list. Voted #3 Pizza on This Is Yarm.',
      menuLabel: 'See the wine & pizza menu'
    }
  ];

  var NAME_LEN = 12;
  var GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789&:';
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var root = document.documentElement;
  var rowsEl = document.querySelector('[data-board-rows]');
  var clockEl = document.querySelector('[data-clock]');
  var clockLabelEl = document.querySelector('[data-clock-label]');
  var tickerEl = document.querySelector('[data-ticker]');
  var previewMinutes = null; // null = live
  var lastStateKey = '';

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function hhmm(mins) { return pad(Math.floor(mins / 60)) + ':' + pad(mins % 60); }
  function nowMinutes() {
    if (previewMinutes !== null) return previewMinutes;
    var d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  }

  function statusFor(s, t) {
    if (t < s.start) return { key: 'later', text: 'Opens ' + hhmm(s.start) };
    if (t >= s.end) return { key: 'done', text: 'Finished' };
    if (s.end - t <= 30) return { key: 'last', text: 'Last orders' };
    return { key: 'now', text: 'Now serving' };
  }

  /* ---- Split-flap cells ---- */
  function buildCells(container, length) {
    container.textContent = '';
    for (var i = 0; i < length; i++) {
      var c = document.createElement('span');
      c.className = 'flap';
      c.textContent = ' ';
      container.appendChild(c);
    }
  }

  function setCells(container, text, animate) {
    var cells = container.children;
    for (var i = 0; i < cells.length; i++) {
      flipTo(cells[i], text.charAt(i) || ' ', animate ? i : -1);
    }
  }

  function flipTo(cell, target, index) {
    if (cell._timer && cell._target === target && index < 0) return; // already flipping to this
    if (cell._timer) { clearInterval(cell._timer); cell._timer = null; cell.classList.remove('is-flipping'); }
    cell._target = target;
    if (index < 0 || reduceMotion || cell.textContent === target) {
      cell.textContent = target;
      return;
    }
    var spins = 4 + index; // stagger left to right
    cell.classList.add('is-flipping');
    cell._timer = setInterval(function () {
      spins--;
      if (spins <= 0) {
        clearInterval(cell._timer);
        cell._timer = null;
        cell.textContent = target;
        cell.classList.remove('is-flipping');
      } else {
        cell.textContent = GLYPHS.charAt(Math.floor(Math.random() * GLYPHS.length));
      }
    }, 45);
  }

  function buildBoard() {
    SERVICES.forEach(function (s) {
      var li = document.createElement('li');
      li.className = 'row';
      li.setAttribute('data-row', s.id);

      var sr = document.createElement('span');
      sr.className = 'visually-hidden';
      sr.setAttribute('data-row-sr', '');
      li.appendChild(sr);

      var time = document.createElement('span');
      time.className = 'row__time';
      time.setAttribute('aria-hidden', 'true');
      buildCells(time, 5);
      li.appendChild(time);

      var name = document.createElement('span');
      name.className = 'row__name';
      name.setAttribute('aria-hidden', 'true');
      buildCells(name, NAME_LEN);
      li.appendChild(name);

      var status = document.createElement('span');
      status.className = 'row__status';
      status.setAttribute('aria-hidden', 'true');
      status.innerHTML = '<i class="lamp"></i><span data-row-status></span>';
      li.appendChild(status);

      rowsEl.appendChild(li);
      s.el = li;
    });
  }

  /* ---- Render everything from the current time ---- */
  function render(animate) {
    var t = nowMinutes();
    var current = null;
    var next = null;

    SERVICES.forEach(function (s) {
      var st = statusFor(s, t);
      if (st.key === 'now' || st.key === 'last') current = s;
      if (st.key === 'later' && !next) next = s;
      s.el.setAttribute('data-state', st.key);
      setCells(s.el.querySelector('.row__time'), hhmm(s.start), animate);
      setCells(s.el.querySelector('.row__name'), s.name, animate);
      s.el.querySelector('[data-row-status]').textContent = st.text;
      s.el.querySelector('[data-row-sr]').textContent =
        s.name.charAt(0) + s.name.slice(1).toLowerCase() + ', from ' + hhmm(s.start) + ' to ' + hhmm(s.end) + ': ' + st.text + '.';
    });

    var key = (current ? current.id : 'closed') + '|' + (next ? next.id : 'none');
    if (key === lastStateKey && !animate) return;
    lastStateKey = key;

    var mood = current ? current.mood : (t >= 15 * 60 && t < 22 * 60 ? 'dusk' : (t >= 22 * 60 || t < 6 * 60 ? 'night' : 'day'));
    root.setAttribute('data-mood', mood);
    root.setAttribute('data-service', current ? current.id : 'closed');

    var eyebrow = document.querySelector('[data-now-eyebrow]');
    var title = document.querySelector('[data-now-title]');
    var lead = document.querySelector('[data-now-lead]');
    var menuBtn = document.querySelector('[data-now-menu]');
    var nextEl = document.querySelector('[data-now-next]');
    var img = document.querySelector('[data-now-img]');

    if (current) {
      eyebrow.textContent = (current.end - t <= 30) ? 'Last orders' : 'Now serving';
      title.textContent = current.title;
      lead.textContent = current.lead;
      menuBtn.textContent = current.menuLabel;
      selectTab(current.id, false);
      nextEl.textContent = next ? 'Next: ' + titleCase(next.name) + ' from ' + hhmm(next.start) + '.' : 'That is the last service of the day.';
      tickerEl.textContent = titleCase(current.name) + ' until ' + hhmm(current.end) + ' · right beside Eaglescliffe railway station';
    } else if (next) {
      eyebrow.textContent = 'Between services';
      title.textContent = titleCase(next.name) + ' from ' + hhmm(next.start) + '.';
      lead.textContent = 'Nothing is being served this minute. Book ahead or have a look at what is coming up.';
      menuBtn.textContent = 'See what is next';
      selectTab(next.id, false);
      nextEl.textContent = '';
      tickerEl.textContent = 'Next service ' + hhmm(next.start) + ' · right beside Eaglescliffe railway station';
    } else {
      eyebrow.textContent = 'Closed for today';
      title.textContent = 'Back for breakfast at ' + hhmm(SERVICES[0].start) + '.';
      lead.textContent = 'The last service has finished. Book a table for tomorrow and we will confirm in the morning.';
      menuBtn.textContent = 'See the breakfast menu';
      selectTab('breakfast', false);
      nextEl.textContent = '';
      tickerEl.textContent = 'First service ' + hhmm(SERVICES[0].start) + ' · right beside Eaglescliffe railway station';
    }

    var night = mood !== 'day';
    img.src = night ? '../images/feature.jpg' : '../images/hero.jpg';
    img.alt = 'Illustrative image of the Serino\'s concept, ' + (night ? 'evening wine and pizza' : 'daytime deli');

    renderTrain();
  }

  function titleCase(s) {
    return s.toLowerCase().replace(/(^|\s)([a-z])/g, function (m, a, b) { return a + b.toUpperCase(); });
  }

  /* ---- Clock ---- */
  function tick() {
    if (previewMinutes !== null) {
      clockEl.textContent = hhmm(previewMinutes) + ':00';
      clockLabelEl.textContent = 'Preview time';
    } else {
      var d = new Date();
      clockEl.textContent = pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
      clockLabelEl.textContent = 'Time now';
      render(false);
    }
  }

  /* ---- Preview chips ---- */
  var previewChips = document.querySelectorAll('[data-preview]');
  Array.prototype.forEach.call(previewChips, function (chip) {
    chip.addEventListener('click', function () {
      var v = chip.getAttribute('data-preview');
      if (v === 'live') {
        previewMinutes = null;
      } else {
        var p = v.split(':');
        previewMinutes = parseInt(p[0], 10) * 60 + parseInt(p[1], 10);
      }
      Array.prototype.forEach.call(previewChips, function (c) {
        var on = c === chip;
        c.classList.toggle('is-active', on);
        c.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      tick();
      render(true);
    });
  });

  /* ---- Catching a train? ---- */
  var trainMins = 10;
  var TRAIN = {
    day: {
      5: ['Espresso at the counter.', 'Drink it standing, Italian style, and you will still make the platform.'],
      10: ['Coffee and a pastry to take with you.', 'Order at the counter and carry it across to the station.'],
      20: ['Sit in for a coffee and something from the deli.', 'Enough time for a seat by the window.'],
      40: ['Take a table.', 'A proper brunch or lunch, with time to spare.']
    },
    night: {
      5: ['Come back after your journey.', 'Five minutes is not enough for wine. Book a table for when you are home.'],
      10: ['A quick glass at the bar.', 'One glass, then the platform.'],
      20: ['A glass and a small plate.', 'Olives or bruschetta while you wait.'],
      40: ['Time for pizza.', 'Take a table and let the train wait for you.']
    },
    closed: ['We are between services.', 'Check the board above for the next one, or book ahead.']
  };

  function renderTrain() {
    var verdict = document.querySelector('[data-train-verdict]');
    var detail = document.querySelector('[data-train-detail]');
    var service = root.getAttribute('data-service');
    var pair;
    if (service === 'closed') pair = TRAIN.closed;
    else pair = TRAIN[(service === 'aperitivo' || service === 'wine') ? 'night' : 'day'][trainMins];
    verdict.textContent = pair[0];
    detail.textContent = pair[1];
  }

  var trainChips = document.querySelectorAll('[data-mins]');
  Array.prototype.forEach.call(trainChips, function (chip) {
    chip.addEventListener('click', function () {
      trainMins = parseInt(chip.getAttribute('data-mins'), 10);
      Array.prototype.forEach.call(trainChips, function (c) {
        var on = c === chip;
        c.classList.toggle('is-active', on);
        c.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      renderTrain();
    });
  });

  /* ---- Menu tabs ---- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));
  function selectTab(id, focus) {
    tabs.forEach(function (tab) {
      var on = tab.getAttribute('data-tab') === id;
      tab.setAttribute('aria-selected', on ? 'true' : 'false');
      tab.tabIndex = on ? 0 : -1;
      document.getElementById(tab.getAttribute('aria-controls')).hidden = !on;
      if (on && focus) tab.focus();
    });
  }
  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { selectTab(tab.getAttribute('data-tab'), false); });
    tab.addEventListener('keydown', function (e) {
      var to = null;
      if (e.key === 'ArrowRight') to = tabs[(i + 1) % tabs.length];
      if (e.key === 'ArrowLeft') to = tabs[(i - 1 + tabs.length) % tabs.length];
      if (e.key === 'Home') to = tabs[0];
      if (e.key === 'End') to = tabs[tabs.length - 1];
      if (to) { e.preventDefault(); selectTab(to.getAttribute('data-tab'), true); }
    });
  });

  /* ---- Booking form prints a ticket (demo only) ---- */
  var form = document.querySelector('[data-book-form]');
  var ticket = document.querySelector('[data-ticket]');
  var errorEl = document.querySelector('[data-book-error]');
  var dateInput = document.getElementById('bk-date');
  (function () {
    var d = new Date();
    dateInput.min = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  })();

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = form.elements;
    if (!f.date.value || !f.time.value || !f.name.value.trim() || !f.phone.value.trim()) {
      errorEl.hidden = false;
      return;
    }
    errorEl.hidden = true;
    var d = new Date(f.date.value + 'T12:00:00');
    var nice = isNaN(d) ? f.date.value : d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
    document.querySelector('[data-t-date]').textContent = nice;
    document.querySelector('[data-t-time]').textContent = f.time.value;
    document.querySelector('[data-t-guests]').textContent = f.guests.value;
    document.querySelector('[data-t-name]').textContent = f.name.value.trim();
    document.querySelector('[data-t-status]').textContent = 'Demo only – no booking has been sent.';
    ticket.classList.remove('is-printed');
    void ticket.offsetWidth;
    ticket.classList.add('is-printed');
    if (window.matchMedia('(max-width: 859px)').matches) {
      ticket.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    }
  });

  /* ---- Go ---- */
  buildBoard();
  tick();
  render(true);
  setInterval(tick, 1000);
})();
