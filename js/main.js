/* ==========================================================================
   Serino's Deli & Wine Bar — Interactive Mood Switcher, Lightbox, Presets & Demo Forms
   Zero external network calls · Persisted Day/Night Mood · Accessible <dialog> & Ticket
   ========================================================================== */

(function () {
  'use strict';

  var MOOD_KEY = 'serinos_mood';
  var moodButtons = Array.prototype.slice.call(
    document.querySelectorAll('[data-mood-btn]')
  );
  var toastEl = document.querySelector('[data-micro-toast]');
  var toastTimer = null;

  function showMicroToast(message) {
    if (!toastEl || !message) return;
    if (toastTimer) {
      window.clearTimeout(toastTimer);
    }
    toastEl.textContent = message;
    toastEl.hidden = false;
    toastTimer = window.setTimeout(function () {
      toastEl.hidden = true;
    }, 3200);
  }

  function toIso(d) {
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + m + '-' + day;
  }

  function nextWeekday(base, targetDow) {
    var diff = (targetDow - base.getDay() + 7) % 7;
    if (diff === 0) diff = 7;
    return new Date(base.getFullYear(), base.getMonth(), base.getDate() + diff);
  }

  function safeGetMood() {
    try {
      var stored = window.localStorage.getItem(MOOD_KEY);
      if (stored === 'day' || stored === 'night') return stored;
    } catch (err) {
      /* localStorage unavailable in strict privacy context */
    }
    return document.documentElement.getAttribute('data-mood') === 'night' ? 'night' : 'day';
  }

  function applyMood(mood, fromUserClick) {
    var cleanMood = mood === 'night' ? 'night' : 'day';
    document.documentElement.setAttribute('data-mood', cleanMood);

    try {
      window.localStorage.setItem(MOOD_KEY, cleanMood);
    } catch (err) {
      /* ignore */
    }

    moodButtons.forEach(function (btn) {
      var target = btn.getAttribute('data-mood-btn');
      btn.setAttribute('aria-pressed', String(target === cleanMood));
    });

    if (fromUserClick) {
      var menuTab = document.getElementById(cleanMood === 'night' ? 'tab-evening' : 'tab-brunch');
      if (menuTab) {
        menuTab.click();
      }

      var slotSelect = document.getElementById('res-slot');
      if (slotSelect && !slotSelect.value) {
        slotSelect.value = cleanMood === 'night' ? 'evening-late' : 'morning-brunch';
      }

      showMicroToast(
        cleanMood === 'night'
          ? '☾ Evening Enoteca & Pizza mood active'
          : '☀ Sunlit Daytime Deli & Brunch mood active'
      );
    }
  }

  applyMood(safeGetMood(), false);

  moodButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var chosen = btn.getAttribute('data-mood-btn');
      applyMood(chosen, true);
    });
  });

  /* 1. Keyboard-Accessible Mobile Navigation */
  var navToggle = document.querySelector('[data-nav-toggle]');
  var siteNav = document.querySelector('[data-site-nav]');

  function closeNav(returnFocus) {
    if (!navToggle || !siteNav) return;
    navToggle.setAttribute('aria-expanded', 'false');
    siteNav.classList.remove('is-open');
    if (returnFocus) {
      navToggle.focus();
    }
  }

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', function () {
      var expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      siteNav.classList.toggle('is-open', !expanded);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
        closeNav(true);
      }
    });

    document.addEventListener('click', function (e) {
      if (
        navToggle.getAttribute('aria-expanded') === 'true' &&
        !siteNav.contains(e.target) &&
        !navToggle.contains(e.target)
      ) {
        closeNav(false);
      }
    });

    siteNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        closeNav(false);
      });
    });
  }

  /* 2. Accessible Tab Switchers (Menus & Dual Booking Forms) */
  var tablists = document.querySelectorAll('[role="tablist"]');

  tablists.forEach(function (tablist) {
    var tabs = Array.prototype.slice.call(tablist.querySelectorAll('[role="tab"]'));

    function activateTab(targetTab, moveFocus) {
      tabs.forEach(function (tab) {
        var isSelected = tab === targetTab;
        var panelId = tab.getAttribute('aria-controls');
        var panel = panelId ? document.getElementById(panelId) : null;

        tab.setAttribute('aria-selected', String(isSelected));
        tab.setAttribute('tabindex', isSelected ? '0' : '-1');

        if (panel) {
          panel.hidden = !isSelected;
        }
      });

      if (moveFocus) {
        targetTab.focus();
      }
    }

    tabs.forEach(function (tab, index) {
      tab.addEventListener('click', function () {
        activateTab(tab, false);
      });

      tab.addEventListener('keydown', function (e) {
        var nextIndex = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          nextIndex = (index + 1) % tabs.length;
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          nextIndex = (index - 1 + tabs.length) % tabs.length;
        } else if (e.key === 'Home') {
          nextIndex = 0;
        } else if (e.key === 'End') {
          nextIndex = tabs.length - 1;
        }

        if (nextIndex !== null) {
          e.preventDefault();
          activateTab(tabs[nextIndex], true);
        }
      });
    });

    function checkHash() {
      var hash = window.location.hash ? window.location.hash.slice(1) : '';
      if (!hash) return;
      tabs.forEach(function (tab) {
        var panelId = tab.getAttribute('aria-controls');
        var tabHook = tab.getAttribute('data-hash');
        if (hash === panelId || hash === tabHook || hash === tab.id) {
          activateTab(tab, false);
        }
      });
    }

    checkHash();
    window.addEventListener('hashchange', checkHash);
  });

  /* 3. Native Accessible <dialog> Photo Lightbox */
  var lightbox = document.getElementById('photo-lightbox');
  var lightboxImg = lightbox ? lightbox.querySelector('[data-lightbox-img]') : null;
  var lightboxCaption = lightbox ? lightbox.querySelector('[data-lightbox-caption]') : null;
  var lightboxCta = lightbox ? lightbox.querySelector('[data-lightbox-cta]') : null;
  var lightboxClose = lightbox ? lightbox.querySelector('[data-lightbox-close]') : null;
  var lastLightboxTrigger = null;

  function openLightbox(triggerEl) {
    if (!lightbox || !lightboxImg) return;
    lastLightboxTrigger = triggerEl;
    var src = triggerEl.getAttribute('data-lightbox-src');
    var alt = triggerEl.getAttribute('data-lightbox-alt') || '';
    var caption = triggerEl.getAttribute('data-lightbox-caption') || '';
    var ctaHref = triggerEl.getAttribute('data-lightbox-cta-href') || 'bookings.html#panel-reserve';
    var ctaLabel = triggerEl.getAttribute('data-lightbox-cta-label') || 'Reserve a Table →';

    if (src) lightboxImg.src = src;
    lightboxImg.alt = alt;
    if (lightboxCaption) lightboxCaption.textContent = caption;
    if (lightboxCta) {
      lightboxCta.setAttribute('href', ctaHref);
      lightboxCta.textContent = ctaLabel;
    }

    if (typeof lightbox.showModal === 'function') {
      if (!lightbox.open) lightbox.showModal();
    } else {
      lightbox.setAttribute('open', '');
    }
    if (lightboxClose) lightboxClose.focus();
  }

  function closeLightboxDialog(restoreFocus) {
    if (!lightbox) return;
    if (typeof lightbox.close === 'function' && lightbox.open) {
      lightbox.close();
    } else {
      lightbox.removeAttribute('open');
    }
    if (restoreFocus && lastLightboxTrigger && typeof lastLightboxTrigger.focus === 'function') {
      lastLightboxTrigger.focus();
    }
  }

  if (lightbox) {
    document.querySelectorAll('[data-lightbox-src]').forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        openLightbox(trigger);
      });
      trigger.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(trigger);
        }
      });
    });

    if (lightboxClose) {
      lightboxClose.addEventListener('click', function () {
        closeLightboxDialog(true);
      });
    }

    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) {
        closeLightboxDialog(true);
      }
    });

    if (lightboxCta) {
      lightboxCta.addEventListener('click', function () {
        closeLightboxDialog(false);
      });
    }
  }

  /* 4. 1-Tap Experience Presets & Query String Pre-Fill */
  var today = new Date();
  var todayIso = toIso(today);
  var tomorrowIso = toIso(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1));
  var fridayIso = toIso(today.getDay() === 5 ? today : nextWeekday(today, 5));
  var saturdayIso = toIso(today.getDay() === 6 ? today : nextWeekday(today, 6));

  document.querySelectorAll('input[type="date"]').forEach(function (input) {
    if (!input.getAttribute('min')) {
      input.setAttribute('min', todayIso);
    }
  });

  var presetButtons = Array.prototype.slice.call(
    document.querySelectorAll('[data-serinos-preset]')
  );

  function triggerFieldClearError(el) {
    if (!el) return;
    el.dispatchEvent(new Event('change', { bubbles: true }));
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function applyExperiencePreset(key, showToast) {
    presetButtons.forEach(function (btn) {
      var active = btn.getAttribute('data-serinos-preset') === key;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', String(active));
    });

    var tabReserve = document.getElementById('tab-reserve');
    var tabHire = document.getElementById('tab-hire');
    var resDate = document.getElementById('res-date');
    var resSlot = document.getElementById('res-slot');
    var resParty = document.getElementById('res-party');
    var resNotes = document.getElementById('res-notes');
    var hireType = document.getElementById('hire-type');
    var hireGuests = document.getElementById('hire-guests');
    var hireDate = document.getElementById('hire-date');
    var hireNotes = document.getElementById('hire-notes');

    if (key === 'brunch') {
      applyMood('day', false);
      if (tabReserve) tabReserve.click();
      if (resDate) { resDate.value = tomorrowIso; triggerFieldClearError(resDate); }
      if (resSlot) { resSlot.value = 'morning-brunch'; triggerFieldClearError(resSlot); }
      if (resParty) { resParty.value = '2'; triggerFieldClearError(resParty); }
      if (resNotes) {
        resNotes.value = 'Morning brunch table (#1 Voted on This Is Yarm) — sunlit table if available.';
      }
      if (showToast) showMicroToast('☀ Morning Brunch Table (#1 Voted) preset loaded');
    } else if (key === 'wine-for-2') {
      applyMood('night', false);
      if (tabReserve) tabReserve.click();
      if (resDate) { resDate.value = fridayIso; triggerFieldClearError(resDate); }
      if (resSlot) { resSlot.value = 'evening-late'; triggerFieldClearError(resSlot); }
      if (resParty) { resParty.value = '2'; triggerFieldClearError(resParty); }
      if (resNotes) {
        resNotes.value = 'Candlelit wine, antipasti sharing board & stone-baked pizza table for 2.';
      }
      if (showToast) showMicroToast('🍷 Candlelit Wine & Pizza for 2 preset loaded');
    } else if (key === 'group-arch') {
      applyMood('night', false);
      if (tabHire) tabHire.click();
      if (hireType) { hireType.value = 'group-wine-night'; triggerFieldClearError(hireType); }
      if (hireGuests) { hireGuests.value = '12'; triggerFieldClearError(hireGuests); }
      if (hireDate) { hireDate.value = saturdayIso; triggerFieldClearError(hireDate); }
      if (hireNotes) {
        hireNotes.value = 'Station-arch group evening — curated Italian wines, antipasti grazing boards & stone-baked pizzas.';
        triggerFieldClearError(hireNotes);
      }
      if (showToast) showMicroToast('🥂 Station-Arch Group Evening preset loaded');
    }
  }

  presetButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var key = btn.getAttribute('data-serinos-preset');
      applyExperiencePreset(key, true);
    });
  });

  try {
    var params = new URLSearchParams(window.location.search);
    var presetParam = params.get('preset');
    var sittingParam = params.get('sitting');
    if (presetParam) {
      applyExperiencePreset(presetParam, true);
    } else if (sittingParam) {
      var resSlotEl = document.getElementById('res-slot');
      if (resSlotEl) {
        for (var i = 0; i < resSlotEl.options.length; i++) {
          if (resSlotEl.options[i].value === sittingParam) {
            resSlotEl.value = sittingParam;
            break;
          }
        }
      }
    }
  } catch (err) {
    /* ignore */
  }

  /* 5. Client-Side Dummy Form Validation & Live Digital Enquiry Ticket */
  var demoForms = document.querySelectorAll('[data-demo-form]');

  function validateField(field) {
    var errorElId = field.getAttribute('aria-describedby');
    var errorEl = errorElId ? document.getElementById(errorElId) : null;
    var val = (field.value || '').trim();
    var errorMsg = '';

    if (field.hasAttribute('required') && !val) {
      errorMsg = field.getAttribute('data-error-empty') || 'Please complete this field.';
    } else if (val && field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      errorMsg = 'Please enter a valid email address.';
    }

    if (errorMsg) {
      field.setAttribute('aria-invalid', 'true');
      if (errorEl) {
        errorEl.textContent = errorMsg;
        errorEl.hidden = false;
      }
      return false;
    } else {
      field.setAttribute('aria-invalid', 'false');
      if (errorEl) {
        errorEl.textContent = '';
        errorEl.hidden = true;
      }
      return true;
    }
  }

  function copyPlainText(text, onDone) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(onDone).catch(function () {
        fallbackCopy(text, onDone);
      });
    } else {
      fallbackCopy(text, onDone);
    }
  }

  function fallbackCopy(text, onDone) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
    } catch (e) {
      /* ignore */
    }
    document.body.removeChild(ta);
    if (onDone) onDone();
  }

  function buildOwnerTicket(ticketEl, data, onReset) {
    if (!ticketEl) return;
    ticketEl.innerHTML = '';

    var head = document.createElement('div');
    head.className = 'owner-receipt-ticket__head';

    var title = document.createElement('span');
    title.className = 'owner-receipt-ticket__title';
    title.textContent = "What Serino's Deli & Wine Bar Receives";

    var ref = document.createElement('span');
    ref.className = 'owner-receipt-ticket__ref';
    ref.textContent = 'Ref: ' + data.refCode;

    head.appendChild(title);
    head.appendChild(ref);
    ticketEl.appendChild(head);

    var grid = document.createElement('div');
    grid.className = 'owner-receipt-ticket__grid';

    var rows = [
      { label: 'Guest Name', val: data.guestName, full: false },
      { label: 'Phone / Email', val: data.contact, full: false },
      { label: 'Date & Session', val: data.dateSession, full: false },
      { label: 'Party / Experience', val: data.partyText, full: false },
      { label: 'Notes', val: data.notes || 'None specified', full: true }
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

    ticketEl.appendChild(grid);

    var actions = document.createElement('div');
    actions.className = 'owner-receipt-ticket__actions';

    var copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.className = 'ticket-action-btn';
    copyBtn.setAttribute('data-copy-ticket', '');
    copyBtn.textContent = 'Copy Summary';

    var plainSummary = [
      "Serino's Deli & Wine Bar — Enquiry Summary (" + data.refCode + ')',
      'Guest: ' + data.guestName,
      'Contact: ' + data.contact,
      'Date & Session: ' + data.dateSession,
      'Party / Experience: ' + data.partyText,
      'Notes: ' + (data.notes || 'None specified')
    ].join('\n');

    copyBtn.addEventListener('click', function () {
      copyPlainText(plainSummary, function () {
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
    ticketEl.appendChild(actions);
  }

  demoForms.forEach(function (form) {
    var fields = Array.prototype.slice.call(
      form.querySelectorAll('input, select, textarea')
    );
    var statusPanel = form.querySelector('[data-demo-status]');
    var summaryTarget = form.querySelector('[data-demo-summary]');
    var ticketTarget = form.querySelector('[data-owner-ticket]');

    fields.forEach(function (field) {
      field.addEventListener('input', function () {
        if (field.getAttribute('aria-invalid') === 'true') {
          validateField(field);
        }
      });
      field.addEventListener('change', function () {
        if (field.getAttribute('aria-invalid') === 'true') {
          validateField(field);
        }
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var firstInvalid = null;
      fields.forEach(function (field) {
        var ok = validateField(field);
        if (!ok && !firstInvalid) {
          firstInvalid = field;
        }
      });

      if (firstInvalid) {
        if (statusPanel) {
          statusPanel.hidden = true;
        }
        firstInvalid.focus();
        return;
      }

      if (statusPanel) {
        var guestNameEl = form.querySelector('[name="guest_name"]');
        var phoneEl = form.querySelector('[name="guest_phone"]');
        var emailEl = form.querySelector('[name="guest_email"]');
        var prefDateEl = form.querySelector('[name="preferred_date"]');
        var partyCountEl = form.querySelector('[name="party_size"], [name="guest_count"]');
        var slotOrTypeEl = form.querySelector('[name="service_slot"], [name="event_type"]');
        var notesEl = form.querySelector('[name="dietary_notes"], [name="event_notes"]');

        var guestName = guestNameEl ? guestNameEl.value.trim() : 'Guest';
        var phoneVal = phoneEl ? phoneEl.value.trim() : '';
        var emailVal = emailEl ? emailEl.value.trim() : '';
        var dateVal = prefDateEl ? prefDateEl.value.trim() : '';
        var sessionLabel = '';
        if (slotOrTypeEl && slotOrTypeEl.value) {
          sessionLabel = slotOrTypeEl.options
            ? slotOrTypeEl.options[slotOrTypeEl.selectedIndex].text
            : slotOrTypeEl.value;
        }
        var partyLabel = partyCountEl && partyCountEl.value ? partyCountEl.value + ' guests' : 'Table enquiry';
        var notesVal = notesEl ? notesEl.value.trim() : '';
        var refCode = 'SRN-' + String(Math.floor(1000 + Math.random() * 9000));

        if (summaryTarget) {
          summaryTarget.textContent = 'Prefer to speak right away? Call 01642 788864.';
        }

        buildOwnerTicket(
          ticketTarget,
          {
            refCode: refCode,
            guestName: guestName,
            contact: [phoneVal, emailVal].filter(Boolean).join(' · '),
            dateSession: [dateVal, sessionLabel].filter(Boolean).join(' · '),
            partyText: partyLabel,
            notes: notesVal
          },
          function () {
            form.reset();
            presetButtons.forEach(function (b) {
              b.classList.remove('is-active');
              b.setAttribute('aria-pressed', 'false');
            });
            form.querySelectorAll('.quick-date-chip.is-selected').forEach(function (c) {
              c.classList.remove('is-selected');
            });
            statusPanel.hidden = true;
            if (ticketTarget) ticketTarget.innerHTML = '';
            var firstField = fields[0];
            if (firstField) firstField.focus();
            showMicroToast('Demo form reset');
          }
        );

        statusPanel.hidden = false;
        statusPanel.focus();
        showMicroToast('✓ Enquiry preview ticket generated');
      }
    });
  });

  /* 6. Gallery Inspiration Polish: Scroll Progress, Below-Fold Reveals, Quick Date Chips & Smart Dock */
  function initGalleryPolish() {
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Top Header 2.5px Scroll-Progress Hairline
    var hdr = document.querySelector('header');
    if (hdr && !hdr.querySelector('.scroll-progress-rail')) {
      var cs = window.getComputedStyle(hdr);
      if (cs.position === 'static') {
        hdr.style.position = 'relative';
      }
      var rail = document.createElement('div');
      rail.className = 'scroll-progress-rail';
      rail.setAttribute('aria-hidden', 'true');
      hdr.insertBefore(rail, hdr.firstChild);
      var ticking = false;
      var updateRail = function () {
        var docH = document.documentElement.scrollHeight - window.innerHeight;
        var ratio = docH > 40 ? Math.min(1, Math.max(0, window.scrollY / docH)) : 0;
        rail.style.transform = 'scaleX(' + ratio.toFixed(4) + ')';
        ticking = false;
      };
      window.addEventListener('scroll', function () {
        if (!ticking) {
          ticking = true;
          window.requestAnimationFrame(updateRail);
        }
      }, { passive: true });
      updateRail();
    }

    // Smart Form & Footer Auto-Clearance for Mobile Action Bar
    var mobileBar = document.querySelector('.mobile-action-bar');
    if (mobileBar && 'IntersectionObserver' in window) {
      var activeClearance = new Set();
      var syncBar = function () {
        mobileBar.classList.toggle('is-dock-hidden', activeClearance.size > 0);
      };
      var clearObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            activeClearance.add(entry.target);
          } else {
            activeClearance.delete(entry.target);
          }
        });
        syncBar();
      }, { threshold: 0.08 });

      document.querySelectorAll('form, footer').forEach(function (el) {
        clearObs.observe(el);
      });
    }

    // Below-the-fold subtle reveals (never hides above-the-fold elements)
    if (!reduced && 'IntersectionObserver' in window) {
      var targets = document.querySelectorAll('.carta-leaf, .lookbook-frame, .ledger-box');
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            obs.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -6% 0px', threshold: 0.08 });

      var vh = window.innerHeight || 800;
      var staggerIdx = 0;
      targets.forEach(function (el) {
        var rect = el.getBoundingClientRect();
        if (rect.top > vh * 0.96) {
          el.style.setProperty('--reveal-delay', ((staggerIdx % 3) * 55) + 'ms');
          staggerIdx++;
          el.classList.add('reveal-ready');
          obs.observe(el);
        }
      });

      window.addEventListener('hashchange', function () {
        document.querySelectorAll('.reveal-ready:not(.is-revealed)').forEach(function (el) {
          if (el.getBoundingClientRect().top < window.innerHeight * 1.1) {
            el.classList.add('is-revealed');
          }
        });
      });
    }

    // 1-Tap Quick Date Chips under date inputs
    document.querySelectorAll('input[type="date"]').forEach(function (input) {
      var fieldWrap = input.parentElement;
      if (!fieldWrap || fieldWrap.querySelector('.quick-date-chips')) {
        return;
      }
      var chipRow = document.createElement('div');
      chipRow.className = 'quick-date-chips';
      chipRow.setAttribute('aria-label', 'Quick date options');

      var presets = [
        { label: 'Tomorrow', iso: tomorrowIso },
        { label: (today.getDay() === 5 ? 'Tonight (Fri)' : 'This Friday'), iso: fridayIso },
        { label: (today.getDay() === 6 ? 'Today (Sat)' : 'This Saturday'), iso: saturdayIso }
      ];

      presets.forEach(function (p) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'quick-date-chip';
        btn.textContent = p.label;
        btn.addEventListener('click', function () {
          input.value = p.iso;
          chipRow.querySelectorAll('.quick-date-chip').forEach(function (c) { c.classList.remove('is-selected'); });
          btn.classList.add('is-selected');
          input.dispatchEvent(new Event('change', { bubbles: true }));
          input.dispatchEvent(new Event('input', { bubbles: true }));
        });
        chipRow.appendChild(btn);
      });

      input.insertAdjacentElement('afterend', chipRow);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGalleryPolish);
  } else {
    initGalleryPolish();
  }
})();
