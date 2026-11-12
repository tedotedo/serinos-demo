/* ==========================================================================
   Serino's Deli & Wine Bar — Interactive UI & Accessible Demo Forms
   Zero external network calls.
   ========================================================================== */

(function () {
  'use strict';

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

    /* Deep-link via URL hash if matching a tab or panel ID */
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

  /* 3. Set sensible minimum date on date inputs */
  var todayIso = new Date().toISOString().split('T')[0];
  document.querySelectorAll('input[type="date"]').forEach(function (input) {
    if (!input.getAttribute('min')) {
      input.setAttribute('min', todayIso);
    }
  });

  /* 4. Client-Side Dummy Form Validation & Exact Demo Status Message */
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

  demoForms.forEach(function (form) {
    var fields = Array.prototype.slice.call(
      form.querySelectorAll('input, select, textarea')
    );
    var statusPanel = form.querySelector('[data-demo-status]');
    var summaryTarget = form.querySelector('[data-demo-summary]');

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
        if (summaryTarget) {
          var guestName = form.querySelector('[name="guest_name"]');
          var prefDate = form.querySelector('[name="preferred_date"]');
          var partyCount = form.querySelector('[name="party_size"], [name="guest_count"]');
          var slotOrType = form.querySelector('[name="service_slot"], [name="event_type"]');

          var parts = [];
          if (guestName && guestName.value.trim()) {
            parts.push('Enquiry prepared for ' + guestName.value.trim());
          }
          if (slotOrType && slotOrType.value) {
            parts.push(slotOrType.options ? slotOrType.options[slotOrType.selectedIndex].text : slotOrType.value);
          }
          if (partyCount && partyCount.value) {
            parts.push(partyCount.value + ' guests');
          }
          if (prefDate && prefDate.value) {
            parts.push('on ' + prefDate.value);
          }

          summaryTarget.textContent = parts.length
            ? 'Preview summary: ' + parts.join(' · ') + '. Prefer to speak right away? Call 01642 788864.'
            : 'Prefer to speak right away? Call 01642 788864.';
        }

        statusPanel.hidden = false;
        statusPanel.focus();
      }
    });
  });
})();
