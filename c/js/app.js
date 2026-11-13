/* ==========================================================================
   Serino's Deli & Wine Bar — Concept C App Logic
   Segmented Day/Night Switcher · Scroll-Spy Pill Nav · 3-Step Resy Stepper
   ========================================================================== */
(function () {
  'use strict';

  function formatISODate(date) {
    var y = date.getFullYear();
    var m = String(date.getMonth() + 1).padStart(2, '0');
    var d = String(date.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
  }

  function formatChipDate(date) {
    return date.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  }

  /* 1. Segmented Day / Night Menu Switcher + Category Sub-Chips */
  var segDayBtn = document.getElementById('seg-tab-day');
  var segNightBtn = document.getElementById('seg-tab-night');
  var segDayPanel = document.getElementById('seg-panel-day');
  var segNightPanel = document.getElementById('seg-panel-night');

  function activateMenuPeriod(period) {
    var isDay = period === 'day';
    if (segDayBtn && segNightBtn && segDayPanel && segNightPanel) {
      segDayBtn.classList.toggle('is-active', isDay);
      segDayBtn.setAttribute('aria-selected', isDay ? 'true' : 'false');
      segNightBtn.classList.toggle('is-active', !isDay);
      segNightBtn.setAttribute('aria-selected', !isDay ? 'true' : 'false');
      segDayPanel.hidden = !isDay;
      segNightPanel.hidden = isDay;
    }
  }

  if (segDayBtn && segNightBtn) {
    segDayBtn.addEventListener('click', function () { activateMenuPeriod('day'); });
    segNightBtn.addEventListener('click', function () { activateMenuPeriod('night'); });
  }

  function bindSubFilters(chipAttr, sectionAttr) {
    var chips = Array.prototype.slice.call(document.querySelectorAll('[' + chipAttr + ']'));
    var sections = Array.prototype.slice.call(document.querySelectorAll('[' + sectionAttr + ']'));
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var val = chip.getAttribute(chipAttr);
        chips.forEach(function (c) { c.classList.toggle('is-active', c === chip); });
        sections.forEach(function (sec) {
          sec.hidden = !(val === 'all' || sec.getAttribute(sectionAttr) === val);
        });
      });
    });
  }

  bindSubFilters('data-day-cat', 'data-day-section');
  bindSubFilters('data-night-cat', 'data-night-section');

  /* 2. Sticky Pill Nav Active State */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('[data-scrollspy-nav] a'));
  navLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      navLinks.forEach(function (l) { l.classList.toggle('is-active', l === link); });
    });
  });

  /* 3. Mobbin 3-Step Resy-Style Table Stepper */
  var form = document.querySelector('[data-stepper-form]');
  if (form) {
    var panes = Array.prototype.slice.call(form.querySelectorAll('[data-step-pane]'));
    var indicators = Array.prototype.slice.call(document.querySelectorAll('[data-step-indicator]'));
    var summaryText = form.querySelector('[data-step-summary-text]');
    var statusBanner = form.querySelector('[data-demo-status]');
    var statusSummary = form.querySelector('[data-demo-summary]');
    var currentStep = 1;

    var partySelect = document.getElementById('c-party');
    var partyPills = Array.prototype.slice.call(form.querySelectorAll('[data-party-val]'));
    var sittingSelect = document.getElementById('c-sitting');
    var sittingPills = Array.prototype.slice.call(form.querySelectorAll('[data-sitting-val]'));
    var dateInput = document.getElementById('c-date');
    var dateChipsWrap = form.querySelector('[data-c-date-chips]');

    /* Sync Party Pills <-> Select */
    partyPills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        var val = pill.getAttribute('data-party-val');
        if (partySelect) partySelect.value = val;
        partyPills.forEach(function (p) { p.classList.toggle('is-selected', p === pill); });
      });
    });
    if (partySelect) {
      partySelect.addEventListener('change', function () {
        partyPills.forEach(function (p) {
          p.classList.toggle('is-selected', p.getAttribute('data-party-val') === partySelect.value);
        });
      });
    }

    /* Auto-sync Occasion Radio -> Recommended Sitting */
    form.querySelectorAll('input[name="occasion"]').forEach(function (radio) {
      radio.addEventListener('change', function () {
        if (!sittingSelect) return;
        if (radio.value.indexOf('Evening') !== -1 || radio.value.indexOf('Group') !== -1) {
          sittingSelect.value = 'Main Evening Wine & Pizza';
        } else if (radio.value.indexOf('Midday') !== -1) {
          sittingSelect.value = 'Midday Lunch Sitting';
        } else {
          sittingSelect.value = 'Morning Brunch Sitting';
        }
        sittingPills.forEach(function (p) {
          p.classList.toggle('is-selected', p.getAttribute('data-sitting-val') === sittingSelect.value);
        });
      });
    });

    /* Sync Sitting Pills <-> Select */
    sittingPills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        var val = pill.getAttribute('data-sitting-val');
        if (sittingSelect) sittingSelect.value = val;
        sittingPills.forEach(function (p) { p.classList.toggle('is-selected', p === pill); });
      });
    });
    if (sittingSelect) {
      sittingSelect.addEventListener('change', function () {
        sittingPills.forEach(function (p) {
          p.classList.toggle('is-selected', p.getAttribute('data-sitting-val') === sittingSelect.value);
        });
      });
    }

    /* Populate 1-Tap Date Chips */
    if (dateInput && dateChipsWrap) {
      var today = new Date();
      today.setHours(12, 0, 0, 0);
      dateInput.min = formatISODate(today);

      var dates = [];
      for (var i = 0; i < 5; i++) {
        var d = new Date(today);
        d.setDate(today.getDate() + i);
        var prefix = i === 0 ? 'Today · ' : i === 1 ? 'Tomorrow · ' : '';
        dates.push({ label: prefix + formatChipDate(d), iso: formatISODate(d) });
      }

      var chipButtons = [];
      dates.forEach(function (entry, idx) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'date-chip' + (idx === 1 ? ' is-selected' : '');
        btn.textContent = entry.label;
        btn.setAttribute('data-iso', entry.iso);
        btn.addEventListener('click', function () {
          dateInput.value = entry.iso;
          validateField(dateInput);
          chipButtons.forEach(function (b) { b.classList.toggle('is-selected', b === btn); });
        });
        dateChipsWrap.appendChild(btn);
        chipButtons.push(btn);
      });

      dateInput.value = dates[1].iso;
      dateInput.addEventListener('change', function () {
        chipButtons.forEach(function (b) {
          b.classList.toggle('is-selected', b.getAttribute('data-iso') === dateInput.value);
        });
      });
    }

    function validateField(ctrl) {
      var errId = ctrl.getAttribute('aria-describedby');
      var errEl = errId ? document.getElementById(errId) : null;
      var val = (ctrl.value || '').trim();
      var msg = '';

      if (ctrl.hasAttribute('required') && !val) {
        msg = ctrl.getAttribute('data-error-empty') || 'Please complete this field.';
      } else if (ctrl.type === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        msg = 'Please enter a valid email address.';
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

    function validatePane(stepNum) {
      var pane = form.querySelector('[data-step-pane="' + stepNum + '"]');
      if (!pane) return true;
      var controls = Array.prototype.slice.call(pane.querySelectorAll('input, select, textarea'));
      var firstBad = null;
      controls.forEach(function (c) {
        if (!validateField(c) && !firstBad) firstBad = c;
      });
      if (firstBad) {
        firstBad.focus();
        return false;
      }
      return true;
    }

    function updateStepSummary() {
      if (!summaryText) return;
      var occEl = form.querySelector('input[name="occasion"]:checked');
      var occ = occEl ? occEl.value : 'Table';
      var party = partySelect ? partySelect.value : '2 Guests';
      var dt = dateInput ? dateInput.value : '';
      var sit = sittingSelect ? sittingSelect.value : '';
      summaryText.textContent = [party, occ, dt, sit].filter(Boolean).join(' · ');
    }

    function showStep(target) {
      currentStep = target;
      panes.forEach(function (p) {
        var n = Number(p.getAttribute('data-step-pane'));
        p.hidden = n !== currentStep;
      });
      indicators.forEach(function (ind) {
        var n = Number(ind.getAttribute('data-step-indicator'));
        ind.classList.toggle('is-current', n === currentStep);
        ind.classList.toggle('is-done', n < currentStep);
      });
      if (currentStep === 3) updateStepSummary();
    }

    form.querySelectorAll('[data-next-step]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = Number(btn.getAttribute('data-next-step'));
        if (!validatePane(currentStep)) return;
        showStep(target);
      });
    });

    form.querySelectorAll('[data-prev-step]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        showStep(Number(btn.getAttribute('data-prev-step')));
      });
    });

    document.querySelectorAll('[data-goto-step]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = Number(btn.getAttribute('data-goto-step'));
        if (target > currentStep && !validatePane(currentStep)) return;
        showStep(target);
      });
    });

    form.querySelectorAll('input, select, textarea').forEach(function (ctrl) {
      ctrl.addEventListener('input', function () {
        if (ctrl.getAttribute('aria-invalid') === 'true') validateField(ctrl);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validatePane(1) || !validatePane(2) || !validatePane(3)) {
        if (statusBanner) statusBanner.hidden = true;
        return;
      }

      var fd = new FormData(form);
      var recap = [
        fd.get('guest_name'),
        fd.get('party_size'),
        fd.get('occasion'),
        fd.get('preferred_date'),
        fd.get('sitting_slot')
      ].filter(Boolean).join(' · ');

      if (statusSummary) {
        statusSummary.textContent = 'Submitted preview: ' + recap + ' — 5 Station Road, Eaglescliffe (01642 788864).';
      }
      if (statusBanner) {
        statusBanner.hidden = false;
        statusBanner.focus();
      }
    });
  }
})();
