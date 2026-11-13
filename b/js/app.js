/* ==========================================================================
   Serino's Deli & Wine Bar — Concept B Interactive Logic
   4-Act Ritual Reel + Dots · Lightbox · Mood Sync · Presets · Smart Dock · Ticket
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

  function formatShortLabel(date) {
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

  /* 2. Smart Form & Footer Auto-Clearance for Floating Dock */
  var floatingDock = document.querySelector('.floating-dock');
  if (floatingDock && 'IntersectionObserver' in window) {
    var visibleClearanceEls = new Set();
    var syncDockVisibility = function () {
      floatingDock.classList.toggle('is-dock-hidden', visibleClearanceEls.size > 0);
    };
    var dockObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          visibleClearanceEls.add(entry.target);
        } else {
          visibleClearanceEls.delete(entry.target);
        }
      });
      syncDockVisibility();
    }, { threshold: 0.08 });

    document.querySelectorAll('form, footer').forEach(function (el) {
      dockObserver.observe(el);
    });
  }

  /* 3. Horizontal 4-Act Ritual Reel Controls, Counter Pill & Active Dots */
  var reel = document.querySelector('[data-ritual-reel]');
  var reelCards = reel ? Array.prototype.slice.call(reel.querySelectorAll('[data-reel-card]')) : [];
  var reelPrev = document.querySelector('[data-reel-prev]');
  var reelNext = document.querySelector('[data-reel-next]');
  var reelCounter = document.querySelector('[data-reel-counter]');
  var reelDots = Array.prototype.slice.call(document.querySelectorAll('[data-reel-dot]'));

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

  function updateReelState() {
    if (!reelCards.length) return;
    var activeIdx = getActiveReelIndex();
    if (reelCounter) {
      reelCounter.textContent = String(activeIdx + 1).padStart(2, '0') + ' / ' + String(reelCards.length).padStart(2, '0');
    }
    reelDots.forEach(function (dot, idx) {
      var isCurrent = idx === activeIdx;
      dot.classList.toggle('is-active', isCurrent);
      dot.setAttribute('aria-current', String(isCurrent));
    });
  }

  function scrollToReelCard(targetIdx) {
    if (!reel || !reelCards.length) return;
    var bounded = Math.max(0, Math.min(reelCards.length - 1, targetIdx));
    var card = reelCards[bounded];
    reel.scrollTo({
      left: card.offsetLeft - reel.offsetLeft,
      behavior: reducedMotion ? 'auto' : 'smooth'
    });
  }

  if (reel) {
    reel.addEventListener('scroll', updateReelState, { passive: true });
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
    reelDots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var idx = parseInt(dot.getAttribute('data-reel-dot') || '0', 10);
        scrollToReelCard(idx);
      });
    });
    updateReelState();
  }

  /* 4. Day/Night Menu Accordions, Filter Pills & Persisted Mood Sync */
  var accordions = Array.prototype.slice.call(document.querySelectorAll('.velvet-acc'));
  var filterBtns = Array.prototype.slice.call(document.querySelectorAll('[data-carta-filter]'));
  var moodBtns = Array.prototype.slice.call(document.querySelectorAll('[data-mood-btn]'));
  var sittingSelect = document.getElementById('b-res-sitting');

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

  function setCartaFilter(mode) {
    filterBtns.forEach(function (b) {
      var active = b.getAttribute('data-carta-filter') === mode;
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
  }

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var mode = btn.getAttribute('data-carta-filter');
      setCartaFilter(mode);
      if (mode === 'day' || mode === 'night') {
        syncMood(mode, false, true);
      }
    });
  });

  function getSavedMood() {
    try {
      var m = window.localStorage.getItem(MOOD_KEY);
      if (m === 'day' || m === 'night') return m;
    } catch (e) {}
    return document.documentElement.getAttribute('data-mood') === 'day' ? 'day' : 'night';
  }

  function syncMood(mood, syncCartaToo, showToast) {
    var clean = mood === 'day' ? 'day' : 'night';
    document.documentElement.setAttribute('data-mood', clean);
    try {
      window.localStorage.setItem(MOOD_KEY, clean);
    } catch (e) {}

    moodBtns.forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-mood-btn') === clean));
    });

    if (syncCartaToo) {
      setCartaFilter(clean);
    }

    if (sittingSelect && !sittingSelect.value) {
      sittingSelect.value = clean === 'day' ? 'Morning Coffee & Brunch' : 'Evening Wine & Pizza (Main)';
    }

    if (showToast) {
      showMicroToast(
        clean === 'day'
          ? '☀ Daytime Deli & Brunch mood synced'
          : '☾ Evening Wine & Stone-Baked Pizza mood synced'
      );
    }
  }

  syncMood(getSavedMood(), false, false);

  moodBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      syncMood(btn.getAttribute('data-mood-btn'), true, true);
    });
  });

  /* Reel Jump Actions -> Open Accordion or Prefill Sitting */
  document.querySelectorAll('[data-open-accordion]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.getAttribute('data-open-accordion');
      var target = document.getElementById(id);
      if (!target) return;
      setCartaFilter('all');
      target.hidden = false;
      toggleAccordion(target, true);
      target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    });
  });

  document.querySelectorAll('[data-prefill-sitting]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var val = btn.getAttribute('data-prefill-sitting');
      if (sittingSelect && val) {
        sittingSelect.value = val;
        sittingSelect.dispatchEvent(new Event('change', { bubbles: true }));
      }
      showMicroToast('Sitting selected: ' + val);
      var reserveSec = document.getElementById('reserve');
      if (reserveSec) reserveSec.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    });
  });

  /* 5. 1-Tap Quick-Date Chips & 1-Tap Experience Presets */
  var dateInput = document.getElementById('b-res-date');
  var quickWrap = document.querySelector('[data-quick-dates]');
  var partySelect = document.getElementById('b-res-party');
  var notesInput = document.getElementById('b-res-notes');

  var today = new Date();
  today.setHours(12, 0, 0, 0);
  var tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  var fridayDate = new Date(today);
  var saturdayDate = new Date(today);
  for (var offset = 0; offset <= 7; offset++) {
    var probe = new Date(today);
    probe.setDate(today.getDate() + offset);
    if (probe.getDay() === 5 && offset >= 0 && fridayDate === today) {
      fridayDate = probe;
    }
    if (probe.getDay() === 6 && offset >= 0 && saturdayDate === today) {
      saturdayDate = probe;
    }
  }
  if (fridayDate.getDay() !== 5) {
    fridayDate = new Date(today);
    fridayDate.setDate(today.getDate() + ((5 - today.getDay() + 7) % 7 || 7));
  }
  if (saturdayDate.getDay() !== 6) {
    saturdayDate = new Date(today);
    saturdayDate.setDate(today.getDate() + ((6 - today.getDay() + 7) % 7 || 7));
  }

  var chipEls = [];
  if (dateInput && quickWrap) {
    dateInput.min = formatISODate(today);

    var candidates = [
      { label: 'Today · ' + formatShortLabel(today), iso: formatISODate(today) },
      { label: 'Tomorrow · ' + formatShortLabel(tomorrow), iso: formatISODate(tomorrow) },
      { label: formatShortLabel(fridayDate), iso: formatISODate(fridayDate) },
      { label: formatShortLabel(saturdayDate), iso: formatISODate(saturdayDate) }
    ];

    /* Deduplicate ISO dates if Today/Tomorrow happens to be Fri/Sat */
    var seenIso = {};
    var uniqueCandidates = candidates.filter(function (c) {
      if (seenIso[c.iso]) return false;
      seenIso[c.iso] = true;
      return true;
    });

    uniqueCandidates.forEach(function (item, idx) {
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

    if (uniqueCandidates[1]) {
      dateInput.value = uniqueCandidates[1].iso;
    }

    dateInput.addEventListener('change', function () {
      chipEls.forEach(function (c) {
        c.classList.toggle('is-selected', c.getAttribute('data-iso') === dateInput.value);
      });
    });
  }

  var presetBtns = Array.prototype.slice.call(document.querySelectorAll('[data-serinos-preset]'));

  function applyPreset(key, showToast) {
    presetBtns.forEach(function (b) {
      var isAct = b.getAttribute('data-serinos-preset') === key;
      b.classList.toggle('is-active', isAct);
      b.setAttribute('aria-pressed', String(isAct));
    });

    if (key === 'brunch') {
      syncMood('day', true, false);
      if (dateInput) {
        dateInput.value = formatISODate(tomorrow);
        dateInput.dispatchEvent(new Event('change', { bubbles: true }));
        dateInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      if (sittingSelect) {
        sittingSelect.value = 'Morning Coffee & Brunch';
        sittingSelect.dispatchEvent(new Event('change', { bubbles: true }));
      }
      if (partySelect) partySelect.value = '2 Guests';
      if (notesInput) notesInput.value = 'Morning brunch table (#1 Voted on This Is Yarm) — sunlit table if available.';
      if (showToast) showMicroToast('☀ Morning Brunch Table (#1 Voted) preset loaded');
    } else if (key === 'wine-for-2') {
      syncMood('night', true, false);
      if (dateInput) {
        dateInput.value = formatISODate(fridayDate);
        dateInput.dispatchEvent(new Event('change', { bubbles: true }));
        dateInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      if (sittingSelect) {
        sittingSelect.value = 'Evening Wine & Pizza (Main)';
        sittingSelect.dispatchEvent(new Event('change', { bubbles: true }));
      }
      if (partySelect) partySelect.value = '2 Guests';
      if (notesInput) notesInput.value = 'Candlelit wine, antipasti sharing board & stone-baked pizza table for 2.';
      if (showToast) showMicroToast('🍷 Candlelit Wine & Pizza for 2 preset loaded');
    } else if (key === 'group-arch') {
      syncMood('night', true, false);
      if (dateInput) {
        dateInput.value = formatISODate(saturdayDate);
        dateInput.dispatchEvent(new Event('change', { bubbles: true }));
        dateInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      if (sittingSelect) {
        sittingSelect.value = 'Group Wine Night / Private Hire';
        sittingSelect.dispatchEvent(new Event('change', { bubbles: true }));
      }
      if (partySelect) partySelect.value = '7+ Group';
      if (notesInput) notesInput.value = 'Station-arch group evening — curated Italian wines, antipasti grazing boards & stone-baked pizzas.';
      if (showToast) showMicroToast('🥂 Station-Arch Group Evening preset loaded');
    }
  }

  presetBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      applyPreset(btn.getAttribute('data-serinos-preset'), true);
    });
  });

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
        if (activeLightboxPreset) {
          applyPreset(activeLightboxPreset, true);
        }
        closeLightbox(false);
      });
    }
  }

  /* 7. Accessible Client-Side Demo Form Validation & Owner-Receipt Ticket */
  function copyText(text, done) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(function () {
        fallbackCopyText(text, done);
      });
    } else {
      fallbackCopyText(text, done);
    }
  }

  function fallbackCopyText(text, done) {
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

    var items = [
      { label: 'Guest Name', val: payload.guestName, full: false },
      { label: 'Phone / Email', val: payload.contact, full: false },
      { label: 'Date & Session', val: payload.dateSession, full: false },
      { label: 'Party / Experience', val: payload.party, full: false },
      { label: 'Notes', val: payload.notes || 'None specified', full: true }
    ];

    items.forEach(function (it) {
      var row = document.createElement('div');
      row.className = 'owner-receipt-ticket__row' + (it.full ? ' owner-receipt-ticket__row--full' : '');

      var lbl = document.createElement('span');
      lbl.className = 'owner-receipt-ticket__label';
      lbl.textContent = it.label;

      var val = document.createElement('span');
      val.className = 'owner-receipt-ticket__val';
      val.textContent = it.val;

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

    var rawSummary = [
      "Serino's Deli & Wine Bar — Enquiry Summary (" + payload.refCode + ')',
      'Guest: ' + payload.guestName,
      'Contact: ' + payload.contact,
      'Date & Session: ' + payload.dateSession,
      'Party / Experience: ' + payload.party,
      'Notes: ' + (payload.notes || 'None specified')
    ].join('\n');

    copyBtn.addEventListener('click', function () {
      copyText(rawSummary, function () {
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

  var form = document.querySelector('[data-demo-form]');
  if (form) {
    var statusBox = form.querySelector('[data-demo-status]');
    var summaryEl = form.querySelector('[data-demo-summary]');
    var ticketEl = form.querySelector('[data-owner-ticket]');

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
      var guestName = String(fd.get('guest_name') || '').trim();
      var guestPhone = String(fd.get('guest_phone') || '').trim();
      var guestEmail = String(fd.get('guest_email') || '').trim();
      var prefDate = String(fd.get('preferred_date') || '').trim();
      var sittingVal = String(fd.get('sitting') || '').trim();
      var partyVal = String(fd.get('party_size') || '').trim();
      var notesVal = String(fd.get('notes') || '').trim();
      var refCode = 'SRN-' + String(Math.floor(1000 + Math.random() * 9000));

      if (summaryEl) {
        summaryEl.textContent = '5 Station Road, Eaglescliffe TS16 0BU · Direct desk: 01642 788864.';
      }

      renderOwnerTicket(
        ticketEl,
        {
          refCode: refCode,
          guestName: guestName,
          contact: [guestPhone, guestEmail].filter(Boolean).join(' · '),
          dateSession: [prefDate, sittingVal].filter(Boolean).join(' · '),
          party: partyVal,
          notes: notesVal
        },
        function () {
          form.reset();
          if (dateInput && chipEls[1]) {
            dateInput.value = chipEls[1].getAttribute('data-iso') || '';
            chipEls.forEach(function (c, i) { c.classList.toggle('is-selected', i === 1); });
          }
          presetBtns.forEach(function (b) {
            b.classList.remove('is-active');
            b.setAttribute('aria-pressed', 'false');
          });
          if (statusBox) statusBox.hidden = true;
          if (ticketEl) ticketEl.innerHTML = '';
          var nameCtrl = document.getElementById('b-res-name');
          if (nameCtrl) nameCtrl.focus();
          showMicroToast('Demo form reset');
        }
      );

      if (statusBox) {
        statusBox.hidden = false;
        statusBox.focus();
        showMicroToast('✓ Enquiry preview ticket generated');
      }
    });
  }

  /* 8. Below-the-Fold Choreographed Scroll Reveals */
  if (!reducedMotion && 'IntersectionObserver' in window) {
    var revealTargets = document.querySelectorAll('.velvet-acc, .station-panel, .velvet-booking-card');
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          revealObs.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.08 });

    var vh = window.innerHeight || 800;
    revealTargets.forEach(function (el) {
      if (el.getBoundingClientRect().top > vh * 0.96) {
        el.classList.add('reveal-ready');
        revealObs.observe(el);
      }
    });
  }
})();
