/* ==========================================================================
   Serino's Deli & Wine Bar — Concept C App Logic
   Segmented Day/Night + Mood Sync · Lightbox · Smart Dock · 3-Step Stepper + Ticket
   ========================================================================== */
(function () {
  'use strict';

  var MOOD_KEY = 'serinos_mood';
  var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var toastEl = document.querySelector('[data-micro-toast]');
  var toastTimer = null;

  function showMicroToast(message) {
    if (!toastEl || !message) return;
    if (toastTimer) window.clearTimeout(toastTimer);
    toastEl.textContent = message;
    toastEl.hidden = false;
    toastTimer = window.setTimeout(function () {
      toastEl.hidden = true;
    }, 3200);
  }

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

  /* 1. Top Header 2.5px Scroll-Progress Hairline */
  var progressRail = document.querySelector('[data-scroll-progress]');
  if (progressRail) {
    var scrollTicking = false;
    var updateProgress = function () {
      var docH = document.documentElement.scrollHeight - window.innerHeight;
      var ratio = docH > 40 ? Math.min(1, Math.max(0, window.scrollY / docH)) : 0;
      progressRail.style.transform = 'scaleX(' + ratio.toFixed(4) + ')';
      scrollTicking = false;
    };
    window.addEventListener('scroll', function () {
      if (!scrollTicking) {
        scrollTicking = true;
        window.requestAnimationFrame(updateProgress);
      }
    }, { passive: true });
    updateProgress();
  }

  /* 2. Smart Form & Footer Auto-Clearance for Floating Bottom Dock */
  var bottomDock = document.querySelector('.app-bottom-dock');
  if (bottomDock && 'IntersectionObserver' in window) {
    var activeDockClearance = new Set();
    var syncDock = function () {
      bottomDock.classList.toggle('is-dock-hidden', activeDockClearance.size > 0);
    };
    var dockObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          activeDockClearance.add(entry.target);
        } else {
          activeDockClearance.delete(entry.target);
        }
      });
      syncDock();
    }, { threshold: 0.08 });

    document.querySelectorAll('form, footer').forEach(function (el) {
      dockObs.observe(el);
    });
  }

  /* 3. Segmented Day / Night Menu Switcher + Persisted Mood Sync */
  var segDayBtn = document.getElementById('seg-tab-day');
  var segNightBtn = document.getElementById('seg-tab-night');
  var segDayPanel = document.getElementById('seg-panel-day');
  var segNightPanel = document.getElementById('seg-panel-night');
  var moodBtns = Array.prototype.slice.call(document.querySelectorAll('[data-mood-btn]'));

  function activateMenuPeriod(period) {
    var isDay = period !== 'night';
    if (segDayBtn && segNightBtn && segDayPanel && segNightPanel) {
      segDayBtn.classList.toggle('is-active', isDay);
      segDayBtn.setAttribute('aria-selected', isDay ? 'true' : 'false');
      segNightBtn.classList.toggle('is-active', !isDay);
      segNightBtn.setAttribute('aria-selected', !isDay ? 'true' : 'false');
      segDayPanel.hidden = !isDay;
      segNightPanel.hidden = isDay;
    }
  }

  function getSavedMood() {
    try {
      var m = window.localStorage.getItem(MOOD_KEY);
      if (m === 'day' || m === 'night') return m;
    } catch (e) {}
    return document.documentElement.getAttribute('data-mood') === 'night' ? 'night' : 'day';
  }

  function syncMood(mood, showToast) {
    var clean = mood === 'night' ? 'night' : 'day';
    document.documentElement.setAttribute('data-mood', clean);
    try {
      window.localStorage.setItem(MOOD_KEY, clean);
    } catch (e) {}

    moodBtns.forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-mood-btn') === clean));
    });

    activateMenuPeriod(clean);

    if (showToast) {
      showMicroToast(
        clean === 'night'
          ? '☾ Evening Wine & Pizza carta active'
          : '☀ Daytime Deli & Brunch carta active'
      );
    }
  }

  syncMood(getSavedMood(), false);

  moodBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      syncMood(btn.getAttribute('data-mood-btn'), true);
    });
  });

  if (segDayBtn && segNightBtn) {
    segDayBtn.addEventListener('click', function () { syncMood('day', true); });
    segNightBtn.addEventListener('click', function () { syncMood('night', true); });
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

  /* 4. Sticky Pill Nav Active State + Scroll Spy */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('[data-scrollspy-nav] a'));
  navLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      navLinks.forEach(function (l) { l.classList.toggle('is-active', l === link); });
    });
  });

  if ('IntersectionObserver' in window && navLinks.length) {
    var spyObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = '#' + entry.target.id;
          navLinks.forEach(function (l) {
            l.classList.toggle('is-active', l.getAttribute('href') === id);
          });
        }
      });
    }, { rootMargin: '-28% 0px -55% 0px', threshold: 0 });

    ['overview', 'la-carta', 'book-table', 'station-rd'].forEach(function (secId) {
      var el = document.getElementById(secId);
      if (el) spyObs.observe(el);
    });
  }

  /* 5. Mobbin 3-Step Resy-Style Table Stepper + 1-Tap Presets + Owner Ticket */
  function copyText(text, done) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(function () {
        fallbackCopy(text, done);
      });
    } else {
      fallbackCopy(text, done);
    }
  }

  function fallbackCopy(text, done) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
    if (done) done();
  }

  function renderOwnerTicket(container, payload, onReset) {
    if (!container) return;
    container.innerHTML = '';

    var head = document.createElement('div');
    head.className = 'owner-receipt-ticket__head';

    var title = document.createElement('span');
    title.className = 'owner-receipt-ticket__title';
    title.textContent = "What Serino's Deli & Wine Bar Receives";

    var ref = document.createElement('span');
    ref.className = 'owner-receipt-ticket__ref';
    ref.textContent = 'Ref: ' + payload.refCode;

    head.appendChild(title);
    head.appendChild(ref);
    container.appendChild(head);

    var grid = document.createElement('div');
    grid.className = 'owner-receipt-ticket__grid';

    var rows = [
      { label: 'Guest Name', val: payload.guestName, full: false },
      { label: 'Phone / Email', val: payload.contact, full: false },
      { label: 'Date & Session', val: payload.dateSession, full: false },
      { label: 'Party / Experience', val: payload.partyOccasion, full: false },
      { label: 'Notes', val: payload.notes || 'None specified', full: true }
    ];

    rows.forEach(function (r) {
      var row = document.createElement('div');
      row.className = 'owner-receipt-ticket__row' + (r.full ? ' owner-receipt-ticket__row--full' : '');

      var lbl = document.createElement('span');
      lbl.className = 'owner-receipt-ticket__label';
      lbl.textContent = r.label;

      var val = document.createElement('span');
      val.className = 'owner-receipt-ticket__val';
      val.textContent = r.val;

      row.appendChild(lbl);
      row.appendChild(val);
      grid.appendChild(row);
    });

    container.appendChild(grid);

    var actions = document.createElement('div');
    actions.className = 'owner-receipt-ticket__actions';

    var copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.className = 'ticket-action-btn';
    copyBtn.setAttribute('data-copy-ticket', '');
    copyBtn.textContent = 'Copy Summary';

    var plain = [
      "Serino's Deli & Wine Bar — Enquiry Summary (" + payload.refCode + ')',
      'Guest: ' + payload.guestName,
      'Contact: ' + payload.contact,
      'Date & Session: ' + payload.dateSession,
      'Party / Experience: ' + payload.partyOccasion,
      'Notes: ' + (payload.notes || 'None specified')
    ].join('\n');

    copyBtn.addEventListener('click', function () {
      copyText(plain, function () {
        copyBtn.textContent = 'Copied ✓';
        showMicroToast('Enquiry summary copied to clipboard');
        window.setTimeout(function () {
          copyBtn.textContent = 'Copy Summary';
        }, 2200);
      });
    });

    var resetBtn = document.createElement('button');
    resetBtn.type = 'button';
    resetBtn.className = 'ticket-action-btn ticket-action-btn--ghost';
    resetBtn.setAttribute('data-reset-demo', '');
    resetBtn.textContent = 'Reset Demo';
    resetBtn.addEventListener('click', onReset);

    actions.appendChild(copyBtn);
    actions.appendChild(resetBtn);
    container.appendChild(actions);
  }

  var applyStepperPreset = null;
  var form = document.querySelector('[data-stepper-form]');
  if (form) {
    var panes = Array.prototype.slice.call(form.querySelectorAll('[data-step-pane]'));
    var indicators = Array.prototype.slice.call(document.querySelectorAll('[data-step-indicator]'));
    var summaryText = form.querySelector('[data-step-summary-text]');
    var statusBanner = form.querySelector('[data-demo-status]');
    var statusSummary = form.querySelector('[data-demo-summary]');
    var ticketTarget = form.querySelector('[data-owner-ticket]');
    var currentStep = 1;

    var partySelect = document.getElementById('c-party');
    var partyPills = Array.prototype.slice.call(form.querySelectorAll('[data-party-val]'));
    var sittingSelect = document.getElementById('c-sitting');
    var sittingPills = Array.prototype.slice.call(form.querySelectorAll('[data-sitting-val]'));
    var dateInput = document.getElementById('c-date');
    var dateChipsWrap = form.querySelector('[data-c-date-chips]');
    var notesInput = document.getElementById('c-notes');
    var presetBtns = Array.prototype.slice.call(document.querySelectorAll('[data-serinos-preset]'));

    function syncPartyUI(val) {
      if (partySelect) partySelect.value = val;
      partyPills.forEach(function (p) {
        p.classList.toggle('is-selected', p.getAttribute('data-party-val') === val);
      });
    }

    function syncSittingUI(val) {
      if (sittingSelect) sittingSelect.value = val;
      sittingPills.forEach(function (p) {
        p.classList.toggle('is-selected', p.getAttribute('data-sitting-val') === val);
      });
    }

    partyPills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        syncPartyUI(pill.getAttribute('data-party-val'));
      });
    });
    if (partySelect) {
      partySelect.addEventListener('change', function () {
        syncPartyUI(partySelect.value);
      });
    }

    form.querySelectorAll('input[name="occasion"]').forEach(function (radio) {
      radio.addEventListener('change', function () {
        if (!sittingSelect) return;
        if (radio.value.indexOf('Evening') !== -1 || radio.value.indexOf('Group') !== -1) {
          syncSittingUI('Main Evening Wine & Pizza');
        } else if (radio.value.indexOf('Midday') !== -1) {
          syncSittingUI('Midday Lunch Sitting');
        } else {
          syncSittingUI('Morning Brunch Sitting');
        }
      });
    });

    sittingPills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        syncSittingUI(pill.getAttribute('data-sitting-val'));
      });
    });
    if (sittingSelect) {
      sittingSelect.addEventListener('change', function () {
        syncSittingUI(sittingSelect.value);
      });
    }

    var today = new Date();
    today.setHours(12, 0, 0, 0);
    var tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    var fridayDate = new Date(today);
    fridayDate.setDate(today.getDate() + ((5 - today.getDay() + 7) % 7 || 7));
    var saturdayDate = new Date(today);
    saturdayDate.setDate(today.getDate() + ((6 - today.getDay() + 7) % 7 || 7));

    var chipButtons = [];
    if (dateInput && dateChipsWrap) {
      dateInput.min = formatISODate(today);

      var dates = [];
      for (var i = 0; i < 5; i++) {
        var d = new Date(today);
        d.setDate(today.getDate() + i);
        var prefix = i === 0 ? 'Today · ' : i === 1 ? 'Tomorrow · ' : '';
        dates.push({ label: prefix + formatChipDate(d), iso: formatISODate(d) });
      }

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

    function setDateValue(isoStr) {
      if (!dateInput) return;
      dateInput.value = isoStr;
      chipButtons.forEach(function (b) {
        b.classList.toggle('is-selected', b.getAttribute('data-iso') === isoStr);
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

    applyStepperPreset = function (key, showToast) {
      presetBtns.forEach(function (b) {
        var isAct = b.getAttribute('data-serinos-preset') === key;
        b.classList.toggle('is-active', isAct);
        b.setAttribute('aria-pressed', String(isAct));
      });

      var occBrunch = document.getElementById('c-occ-brunch');
      var occEvening = document.getElementById('c-occ-evening');
      var occGroup = document.getElementById('c-occ-group');

      if (key === 'brunch') {
        syncMood('day', false);
        if (occBrunch) occBrunch.checked = true;
        syncPartyUI('2 Guests');
        setDateValue(formatISODate(tomorrow));
        syncSittingUI('Morning Brunch Sitting');
        if (notesInput) notesInput.value = 'Morning brunch table (#1 Voted on This Is Yarm) — sunlit table if available.';
        showStep(3);
        if (showToast) showMicroToast('☀ Morning Brunch Table preset loaded — add your details');
      } else if (key === 'wine-for-2') {
        syncMood('night', false);
        if (occEvening) occEvening.checked = true;
        syncPartyUI('2 Guests');
        setDateValue(formatISODate(fridayDate));
        syncSittingUI('Main Evening Wine & Pizza');
        if (notesInput) notesInput.value = 'Candlelit wine, antipasti sharing board & stone-baked pizza table for 2.';
        showStep(3);
        if (showToast) showMicroToast('🍷 Candlelit Wine & Pizza for 2 loaded — add your details');
      } else if (key === 'group-arch') {
        syncMood('night', false);
        if (occGroup) occGroup.checked = true;
        syncPartyUI('7+ Guests');
        setDateValue(formatISODate(saturdayDate));
        syncSittingUI('Main Evening Wine & Pizza');
        if (notesInput) notesInput.value = 'Station-arch group evening — curated Italian wines, antipasti grazing boards & stone-baked pizzas.';
        showStep(3);
        if (showToast) showMicroToast('🥂 Station-Arch Group Evening loaded — add your details');
      }
    };

    presetBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        applyStepperPreset(btn.getAttribute('data-serinos-preset'), true);
      });
    });

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
      var guestName = String(fd.get('guest_name') || '').trim();
      var guestPhone = String(fd.get('guest_phone') || '').trim();
      var guestEmail = String(fd.get('guest_email') || '').trim();
      var prefDate = String(fd.get('preferred_date') || '').trim();
      var sittingSlot = String(fd.get('sitting_slot') || '').trim();
      var partyVal = String(fd.get('party_size') || '').trim();
      var occasionVal = String(fd.get('occasion') || '').trim();
      var notesVal = String(fd.get('notes') || '').trim();
      var refCode = 'SRN-' + String(Math.floor(1000 + Math.random() * 9000));

      if (statusSummary) {
        statusSummary.textContent = '5 Station Road, Eaglescliffe TS16 0BU · Direct desk: 01642 788864.';
      }

      renderOwnerTicket(
        ticketTarget,
        {
          refCode: refCode,
          guestName: guestName,
          contact: [guestPhone, guestEmail].filter(Boolean).join(' · '),
          dateSession: [prefDate, sittingSlot].filter(Boolean).join(' · '),
          partyOccasion: [partyVal, occasionVal].filter(Boolean).join(' · '),
          notes: notesVal
        },
        function () {
          form.reset();
          syncPartyUI('2 Guests');
          syncSittingUI('Morning Brunch Sitting');
          if (chipButtons[1]) {
            setDateValue(chipButtons[1].getAttribute('data-iso') || formatISODate(tomorrow));
          }
          presetBtns.forEach(function (b) {
            b.classList.remove('is-active');
            b.setAttribute('aria-pressed', 'false');
          });
          if (statusBanner) statusBanner.hidden = true;
          if (ticketTarget) ticketTarget.innerHTML = '';
          showStep(1);
          showMicroToast('Demo booking app reset');
        }
      );

      if (statusBanner) {
        statusBanner.hidden = false;
        statusBanner.focus();
        showMicroToast('✓ Enquiry preview ticket generated');
      }
    });
  }

  /* 6. Native Accessible <dialog> Photo Lightbox */
  var lightbox = document.getElementById('photo-lightbox');
  var lightboxImg = lightbox ? lightbox.querySelector('[data-lightbox-img]') : null;
  var lightboxCaption = lightbox ? lightbox.querySelector('[data-lightbox-caption]') : null;
  var lightboxCta = lightbox ? lightbox.querySelector('[data-lightbox-cta]') : null;
  var lightboxClose = lightbox ? lightbox.querySelector('[data-lightbox-close]') : null;
  var lastTrigger = null;
  var activeLightboxPreset = '';

  function openLightbox(triggerEl) {
    if (!lightbox || !lightboxImg) return;
    lastTrigger = triggerEl;
    var src = triggerEl.getAttribute('data-lightbox-src');
    var alt = triggerEl.getAttribute('data-lightbox-alt') || '';
    var caption = triggerEl.getAttribute('data-lightbox-caption') || '';
    var ctaLabel = triggerEl.getAttribute('data-lightbox-cta-label') || 'Reserve a Table →';
    activeLightboxPreset = triggerEl.getAttribute('data-lightbox-preset') || '';

    if (src) lightboxImg.src = src;
    lightboxImg.alt = alt;
    if (lightboxCaption) lightboxCaption.textContent = caption;
    if (lightboxCta) lightboxCta.textContent = ctaLabel;

    if (typeof lightbox.showModal === 'function') {
      if (!lightbox.open) lightbox.showModal();
    } else {
      lightbox.setAttribute('open', '');
    }
    if (lightboxClose) lightboxClose.focus();
  }

  function closeLightbox(restoreFocus) {
    if (!lightbox) return;
    if (typeof lightbox.close === 'function' && lightbox.open) {
      lightbox.close();
    } else {
      lightbox.removeAttribute('open');
    }
    if (restoreFocus && lastTrigger && typeof lastTrigger.focus === 'function') {
      lastTrigger.focus();
    }
  }

  if (lightbox) {
    document.querySelectorAll('[data-lightbox-src]').forEach(function (el) {
      el.addEventListener('click', function () {
        openLightbox(el);
      });
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(el);
        }
      });
    });

    if (lightboxClose) {
      lightboxClose.addEventListener('click', function () {
        closeLightbox(true);
      });
    }

    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox(true);
    });

    if (lightboxCta) {
      lightboxCta.addEventListener('click', function () {
        if (activeLightboxPreset && typeof applyStepperPreset === 'function') {
          applyStepperPreset(activeLightboxPreset, true);
        }
        closeLightbox(false);
      });
    }
  }

  /* 7. Below-the-Fold Choreographed Scroll Reveals */
  if (!reducedMotion && 'IntersectionObserver' in window) {
    var revealEls = document.querySelectorAll('.bento-tile, .clean-menu-card, .stepper-shell, .station-app-card');
    var revObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          revObs.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.08 });

    var vh = window.innerHeight || 800;
    revealEls.forEach(function (el) {
      if (el.getBoundingClientRect().top > vh * 0.96) {
        el.classList.add('reveal-ready');
        revObs.observe(el);
      }
    });
  }
})();
