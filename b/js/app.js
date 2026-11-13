/* ==========================================================================
   Serino's Deli & Wine Bar — Concept B Interactive Logic
   4-Act Ritual Reel · Day/Night Accordion · Quick-Date Chips · Demo Form
   ========================================================================== */
(function () {
  'use strict';

  function formatISODate(date) {
    var y = date.getFullYear();
    var m = String(date.getMonth() + 1).padStart(2, '0');
    var d = String(date.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
  }

  function formatShortLabel(date) {
    return date.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  }

  /* 1. Horizontal 4-Act Ritual Reel Controls & Counter */
  var reel = document.querySelector('[data-ritual-reel]');
  var reelCards = reel ? Array.prototype.slice.call(reel.querySelectorAll('[data-reel-card]')) : [];
  var reelPrev = document.querySelector('[data-reel-prev]');
  var reelNext = document.querySelector('[data-reel-next]');
  var reelCounter = document.querySelector('[data-reel-counter]');

  function getActiveReelIndex() {
    if (!reel || !reelCards.length) return 0;
    var scrollLeft = reel.scrollLeft;
    var closest = 0;
    var minDiff = Infinity;
    reelCards.forEach(function (card, idx) {
      var diff = Math.abs(card.offsetLeft - reel.offsetLeft - scrollLeft);
      if (diff < minDiff) {
        minDiff = diff;
        closest = idx;
      }
    });
    return closest;
  }

  function updateReelCounter() {
    if (!reelCounter || !reelCards.length) return;
    var idx = getActiveReelIndex() + 1;
    reelCounter.textContent = String(idx).padStart(2, '0') + ' / ' + String(reelCards.length).padStart(2, '0');
  }

  function scrollToReelCard(targetIdx) {
    if (!reel || !reelCards.length) return;
    var bounded = Math.max(0, Math.min(reelCards.length - 1, targetIdx));
    var card = reelCards[bounded];
    reel.scrollTo({ left: card.offsetLeft - reel.offsetLeft, behavior: 'smooth' });
  }

  if (reel) {
    reel.addEventListener('scroll', updateReelCounter, { passive: true });
    if (reelPrev) {
      reelPrev.addEventListener('click', function () {
        scrollToReelCard(getActiveReelIndex() - 1);
      });
    }
    if (reelNext) {
      reelNext.addEventListener('click', function () {
        scrollToReelCard(getActiveReelIndex() + 1);
      });
    }
    updateReelCounter();
  }

  /* 2. Day/Night Menu Accordions & Filter Pills */
  var accordions = Array.prototype.slice.call(document.querySelectorAll('.velvet-acc'));
  var filterBtns = Array.prototype.slice.call(document.querySelectorAll('[data-carta-filter]'));

  function toggleAccordion(accEl, forceOpen) {
    if (!accEl) return;
    var btn = accEl.querySelector('.velvet-acc__trigger');
    var panel = accEl.querySelector('.velvet-acc__panel');
    if (!btn || !panel) return;
    var nextState = typeof forceOpen === 'boolean' ? forceOpen : btn.getAttribute('aria-expanded') !== 'true';
    btn.setAttribute('aria-expanded', nextState ? 'true' : 'false');
    panel.hidden = !nextState;
  }

  accordions.forEach(function (acc) {
    var btn = acc.querySelector('.velvet-acc__trigger');
    if (btn) {
      btn.addEventListener('click', function () {
        toggleAccordion(acc);
      });
    }
  });

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var mode = btn.getAttribute('data-carta-filter');
      filterBtns.forEach(function (b) {
        var active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-pressed', active ? 'true' : 'false');
      });

      var openedFirst = false;
      accordions.forEach(function (acc) {
        var period = acc.getAttribute('data-carta-period');
        var visible = mode === 'all' || period === mode;
        acc.hidden = !visible;
        if (visible && !openedFirst) {
          toggleAccordion(acc, true);
          openedFirst = true;
        } else if (!visible) {
          toggleAccordion(acc, false);
        }
      });
    });
  });

  /* Reel Jump Actions -> Open Accordion or Prefill Sitting */
  document.querySelectorAll('[data-open-accordion]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.getAttribute('data-open-accordion');
      var target = document.getElementById(id);
      if (!target) return;
      target.hidden = false;
      toggleAccordion(target, true);
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  var sittingSelect = document.getElementById('b-res-sitting');
  document.querySelectorAll('[data-prefill-sitting]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var val = btn.getAttribute('data-prefill-sitting');
      if (sittingSelect && val) {
        sittingSelect.value = val;
      }
      var reserveSec = document.getElementById('reserve');
      if (reserveSec) reserveSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* 3. 1-Tap Quick-Date Chips */
  var dateInput = document.getElementById('b-res-date');
  var quickWrap = document.querySelector('[data-quick-dates]');

  if (dateInput && quickWrap) {
    var today = new Date();
    today.setHours(12, 0, 0, 0);
    dateInput.min = formatISODate(today);

    var candidates = [];
    var tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    candidates.push({ label: 'Today · ' + formatShortLabel(today), iso: formatISODate(today) });
    candidates.push({ label: 'Tomorrow · ' + formatShortLabel(tomorrow), iso: formatISODate(tomorrow) });

    /* Next upcoming Friday & Saturday */
    for (var offset = 2; offset <= 9; offset++) {
      var d = new Date(today);
      d.setDate(today.getDate() + offset);
      if (d.getDay() === 5 || d.getDay() === 6) {
        candidates.push({ label: formatShortLabel(d), iso: formatISODate(d) });
      }
      if (candidates.length >= 4) break;
    }

    var chipEls = [];
    candidates.forEach(function (item, idx) {
      var chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'quick-chip' + (idx === 1 ? ' is-selected' : '');
      chip.textContent = item.label;
      chip.setAttribute('data-iso', item.iso);
      chip.addEventListener('click', function () {
        dateInput.value = item.iso;
        dateInput.dispatchEvent(new Event('input', { bubbles: true }));
        chipEls.forEach(function (c) {
          c.classList.toggle('is-selected', c === chip);
        });
      });
      quickWrap.appendChild(chip);
      chipEls.push(chip);
    });

    if (candidates[1]) {
      dateInput.value = candidates[1].iso;
    }

    dateInput.addEventListener('change', function () {
      chipEls.forEach(function (c) {
        c.classList.toggle('is-selected', c.getAttribute('data-iso') === dateInput.value);
      });
    });
  }

  /* 4. Accessible Client-Side Demo Form Validation & Confirmation */
  var form = document.querySelector('[data-demo-form]');
  if (form) {
    var statusBox = form.querySelector('[data-demo-status]');
    var summaryEl = form.querySelector('[data-demo-summary]');

    function validateControl(ctrl) {
      var errId = ctrl.getAttribute('aria-describedby');
      var errEl = errId ? document.getElementById(errId) : null;
      var val = (ctrl.value || '').trim();
      var msg = '';

      if (ctrl.hasAttribute('required') && !val) {
        msg = ctrl.getAttribute('data-error-empty') || 'Please complete this field.';
      } else if (ctrl.type === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        msg = 'Please enter a valid email address (for example name@domain.co.uk).';
      }

      if (msg) {
        ctrl.setAttribute('aria-invalid', 'true');
        if (errEl) {
          errEl.textContent = msg;
          errEl.hidden = false;
        }
        return false;
      }

      ctrl.removeAttribute('aria-invalid');
      if (errEl) {
        errEl.textContent = '';
        errEl.hidden = true;
      }
      return true;
    }

    form.querySelectorAll('input, select, textarea').forEach(function (ctrl) {
      ctrl.addEventListener('input', function () {
        if (ctrl.getAttribute('aria-invalid') === 'true') validateControl(ctrl);
      });
      ctrl.addEventListener('change', function () {
        if (ctrl.getAttribute('aria-invalid') === 'true') validateControl(ctrl);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var controls = Array.prototype.slice.call(form.querySelectorAll('input, select, textarea'));
      var firstInvalid = null;

      controls.forEach(function (ctrl) {
        var ok = validateControl(ctrl);
        if (!ok && !firstInvalid) firstInvalid = ctrl;
      });

      if (firstInvalid) {
        if (statusBox) statusBox.hidden = true;
        firstInvalid.focus();
        return;
      }

      var fd = new FormData(form);
      var details = [
        fd.get('guest_name'),
        fd.get('party_size'),
        fd.get('sitting'),
        fd.get('preferred_date')
      ].filter(Boolean).join(' · ');

      if (summaryEl) {
        summaryEl.textContent = 'Preview summary: ' + details + ' — 5 Station Road, Eaglescliffe (01642 788864).';
      }
      if (statusBox) {
        statusBox.hidden = false;
        statusBox.focus();
      }
    });
  }
})();
