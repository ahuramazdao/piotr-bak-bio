/* ============================================================
   Piotr Bąk — Bio page · interactions
   1) Inline SVG icon set (no CDN dependency)
   2) Cursor parallax on the aurora layers + glass lens
   Both degrade gracefully: no fine pointer / reduced motion = static.
   ============================================================ */

/* ---------- 1) Inline icon set (lucide / feather paths) ---------- */
window.renderIcons = function () {
  const ICONS = {
    'facebook': '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
    'linkedin': '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4V8h4v2a6 6 0 0 1 2-2z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>',
    'youtube': '<path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/>',
    'mail': '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    'arrow-up-right': '<path d="M7 7h10v10"/><path d="M7 17 17 7"/>',
    'arrow-right': '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    'send': '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
    'chevron-down': '<path d="m6 9 6 6 6-6"/>',
    'search': '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    'arrow-left': '<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>',
    'zoom-in': '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>',
    'download': '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
    'x': '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>'
  };
  document.querySelectorAll('svg[data-lucide]').forEach(function (svg) {
    const glyph = ICONS[svg.getAttribute('data-lucide')];
    if (!glyph) return;
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = glyph;
  });
  window.ICONS_LOADED = true;
};
window.renderIcons();

/* ---------- 2) Entrance animation (only while the page is visible) ----------
   Adds `.anim-in` so the .rise keyframes can play. If the tab is loaded in
   the background, we wait until it becomes visible — content stays visible
   the whole time, the entrance just plays when the user actually looks. */
(function () {
  function enable() { document.body.classList.add('anim-in'); }
  if (document.visibilityState === 'visible') {
    enable();
  } else {
    document.addEventListener('visibilitychange', function onVis() {
      if (document.visibilityState === 'visible') {
        document.removeEventListener('visibilitychange', onVis);
        enable();
      }
    });
  }
})();

/* ---------- 3) Cursor parallax ---------- */
(function () {
  const fine = window.matchMedia('(pointer: fine)').matches;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!fine || reduced) return;

  const layers = Array.prototype.slice.call(document.querySelectorAll('.plx'));

  let tx = 0, ty = 0, cx = 0, cy = 0;            // parallax target / current

  window.addEventListener('pointermove', function (e) {
    tx = e.clientX / window.innerWidth - 0.5;
    ty = e.clientY / window.innerHeight - 0.5;
  }, { passive: true });

  (function frame() {
    const off = document.body.classList.contains('motion-off');
    // background layers ease toward the cursor at different depths
    cx += (tx - cx) * 0.045;
    cy += (ty - cy) * 0.045;
    for (let i = 0; i < layers.length; i++) {
      const d = off ? 0 : Number(layers[i].dataset.depth);
      layers[i].style.transform = 'translate3d(' + (-cx * d).toFixed(2) + 'px,' + (-cy * d).toFixed(2) + 'px,0)';
    }
    requestAnimationFrame(frame);
  })();
})();

/* ---------- 4) Splash screen & Count-up statistics ---------- */
(function () {
  function initCounters() {
    const counters = document.querySelectorAll('.counter');
    const duration = 1400; // ms

    counters.forEach(function (counter) {
      const target = parseInt(counter.getAttribute('data-target'), 10);
      const suffix = counter.getAttribute('data-suffix') || '';
      const startTime = performance.now();

      function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (easeOutQuad)
        const ease = progress * (2 - progress);
        const currentValue = Math.floor(ease * target);
        
        // Format numbers with space as thousands separator
        let formatted = currentValue;
        if (target >= 1000) {
          formatted = currentValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
        }

        counter.textContent = formatted + suffix;

        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          let finalFormatted = target;
          if (target >= 1000) {
            finalFormatted = target.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
          }
          counter.textContent = finalFormatted + suffix;
        }
      }

      requestAnimationFrame(update);
    });
  }

  function hideSplash() {
    const splash = document.getElementById('splash');
    if (splash && !splash.classList.contains('fade-out')) {
      splash.classList.add('fade-out');
      // Trigger counters after splash fades out
      setTimeout(initCounters, 400);
    }
  }

  // Hide splash when window is loaded or after 1.2s max (fail-safe)
  if (document.readyState === 'complete') {
    setTimeout(hideSplash, 200);
  } else {
    window.addEventListener('load', function () {
      setTimeout(hideSplash, 200);
    });
    // Fail-safe
    setTimeout(hideSplash, 1200);
  }

  /* ---------- 5) AJAX Form Submission ---------- */
  const form = document.getElementById('contact-form');
  const result = document.getElementById('form-result');

  if (form && result) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      
      const button = form.querySelector('button[type="submit"]');
      const originalBtnText = button.innerHTML;
      
      button.disabled = true;
      button.innerHTML = 'Wysyłanie...';
      
      result.className = 'form-result-message';
      result.textContent = '';

      const formData = new FormData(form);
      const object = Object.fromEntries(formData);
      const json = JSON.stringify(object);

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: json
      })
      .then(async (response) => {
        let resJson = await response.json();
        if (response.status === 200 && resJson.success) {
          result.classList.add('success', 'show');
          result.textContent = 'Wiadomość została wysłana pomyślnie! 🚀';
          form.reset();
        } else {
          console.error(resJson);
          result.classList.add('error', 'show');
          result.textContent = resJson.message || 'Wystąpił błąd. Spróbuj ponownie.';
        }
      })
      .catch((error) => {
        console.error(error);
        result.classList.add('error', 'show');
        result.textContent = 'Wystąpił błąd sieci. Spróbuj ponownie później.';
      })
      .then(() => {
        button.disabled = false;
        button.innerHTML = originalBtnText;
        setTimeout(() => {
          result.classList.remove('show');
        }, 5000);
      });
    });
  }

  /* ---------- 6) FAQ Accordion ---------- */
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(function (item) {
    const trigger = item.querySelector('.faq-trigger');
    const content = item.querySelector('.faq-content');
    
    if (trigger && content) {
      trigger.addEventListener('click', function () {
        const isActive = item.classList.contains('active');
        
        // Close all other items for a clean single-open layout
        faqItems.forEach(function (otherItem) {
          if (otherItem !== item && otherItem.classList.contains('active')) {
            otherItem.classList.remove('active');
            otherItem.querySelector('.faq-content').style.maxHeight = '0px';
          }
        });
        
        if (isActive) {
          item.classList.remove('active');
          content.style.maxHeight = '0px';
        } else {
          item.classList.add('active');
          content.style.maxHeight = content.scrollHeight + 'px';
        }
      });
    }
  });

  /* ---------- 7) Certificate Dialog ---------- */
  const certDialog = document.getElementById('cert-dialog');
  const openCertBtn = document.getElementById('open-cert-btn');
  const previewCertTrigger = document.getElementById('preview-cert-trigger');
  const closeCertBtn = document.getElementById('close-cert-dialog-btn');

  if (certDialog) {
    const openDialog = () => {
      certDialog.showModal();
      if (typeof window.renderIcons === 'function') {
        window.renderIcons();
      }
    };

    if (openCertBtn) openCertBtn.addEventListener('click', openDialog);
    if (previewCertTrigger) previewCertTrigger.addEventListener('click', openDialog);
    if (closeCertBtn) closeCertBtn.addEventListener('click', () => certDialog.close());

    // Fallback for browsers without closedby support (like Safari)
    if (!('closedBy' in HTMLDialogElement.prototype)) {
      certDialog.addEventListener('click', (event) => {
        if (event.target !== certDialog) return;
        const rect = certDialog.getBoundingClientRect();
        const isDialogContent = (
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width
        );
        if (!isDialogContent) {
          certDialog.close();
        }
      });
    }
  }

  /* ---------- 8) Hero Intro Bio Toggle ---------- */
  const introWrapper = document.querySelector('.intro-wrapper');
  const introToggle = document.querySelector('.intro-toggle');
  if (introWrapper && introToggle) {
    introToggle.addEventListener('click', function () {
      const isExpanded = introWrapper.classList.toggle('expanded');
      introToggle.setAttribute('aria-expanded', isExpanded);
      introToggle.setAttribute('aria-label', isExpanded ? 'Zwiń opis' : 'Rozwiń opis');
    });
  }

  /* ---------- 9) Raport Scroll Animation ---------- */
  const chartLine = document.getElementById('chartLine');
  const chartArea = document.getElementById('chartArea');
  const chartDots = document.getElementById('chartDots');

  if (chartLine && typeof gsap !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    const pathLength = 630;
    
    gsap.set(chartLine, {
      strokeDasharray: pathLength,
      strokeDashoffset: pathLength
    });
    
    gsap.set([chartArea, chartDots], {
      opacity: 0
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".card-raport",
        start: "top 85%",
        end: "bottom 55%",
        scrub: 1.2
      }
    });

    tl.to(chartLine, {
      strokeDashoffset: 0,
      ease: "none"
    })
    .to(chartArea, {
      opacity: 1,
      ease: "power1.inOut"
    }, 0)
    .to(chartDots, {
      opacity: 1,
      ease: "power1.inOut"
    }, 0.2);
  }
})();
