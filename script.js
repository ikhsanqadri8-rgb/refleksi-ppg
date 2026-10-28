document.addEventListener('DOMContentLoaded', () => {
  /* ---------- Card mata kuliah ---------- */
  document.querySelectorAll('.course').forEach((course) => {
    course.querySelector('.course-head').addEventListener('click', () => {
      const isOpen = course.getAttribute('data-open') === 'true';
      course.setAttribute('data-open', String(!isOpen));
      if (isOpen) {
        course.setAttribute('data-lk2-open', 'false');
        const b = course.querySelector('.lk2-toggle');
        if (b) b.textContent = 'Lihat LK 2 lengkap';
      }
    });
  });

  document.querySelectorAll('.lk2-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const course = btn.closest('.course');
      const isOpen = course.getAttribute('data-lk2-open') === 'true';
      course.setAttribute('data-lk2-open', String(!isOpen));
      btn.textContent = isOpen ? 'Lihat LK 2 lengkap' : 'Sembunyikan LK 2 lengkap';
    });
  });

  /* ---------- Hero image fallback ---------- */
  const heroImg = document.querySelector('.hero-media img');
  if (heroImg) {
    const showFallback = () => {
      heroImg.style.display = 'none';
      const fb = heroImg.nextElementSibling;
      if (fb) fb.style.display = 'flex';
    };
    heroImg.addEventListener('error', showFallback);
    if (heroImg.complete && heroImg.naturalWidth === 0) showFallback();
  }

  /* ---------- Tab navigasi ---------- */
  const tabBtns = Array.from(document.querySelectorAll('.tab-btn'));
  const panels = Array.from(document.querySelectorAll('.tab-panel'));
  const tabsBar = document.querySelector('.tabs');
  const indicator = document.querySelector('.tab-indicator');
  const validIds = tabBtns.map((b) => b.dataset.tab);

  function moveIndicator() {
    const active = tabBtns.find((b) => b.getAttribute('aria-selected') === 'true');
    if (!active || !indicator) return;
    indicator.style.width = active.offsetWidth + 'px';
    indicator.style.transform = 'translateX(' + active.offsetLeft + 'px)';
    active.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }

  function showTab(id, opts) {
    opts = opts || {};
    if (validIds.indexOf(id) === -1) id = validIds[0];
    tabBtns.forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === id)));
    panels.forEach((p) => {
      const on = p.id === id;
      p.classList.toggle('active', on);
      if (on) p.removeAttribute('hidden'); else p.setAttribute('hidden', '');
    });
    moveIndicator();
    if (opts.updateHash !== false && location.hash !== '#' + id) {
      history.replaceState(null, '', '#' + id);
    }
    if (opts.scroll !== false) {
      const top = tabsBar.getBoundingClientRect().top + window.scrollY;
      if (window.scrollY > top) window.scrollTo({ top: top, behavior: 'smooth' });
    }
  }

  tabBtns.forEach((b, i) => {
    b.addEventListener('click', () => showTab(b.dataset.tab));
    b.addEventListener('keydown', (ev) => {
      let n = null;
      if (ev.key === 'ArrowRight') n = (i + 1) % tabBtns.length;
      if (ev.key === 'ArrowLeft') n = (i - 1 + tabBtns.length) % tabBtns.length;
      if (n !== null) { ev.preventDefault(); tabBtns[n].focus(); showTab(tabBtns[n].dataset.tab); }
    });
  });

  // Tombol di bagian "Mereviu" -> buka tab + card terkait
  document.querySelectorAll('.review-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.goto;
      const idx = parseInt(btn.dataset.course, 10);
      showTab(id, { scroll: false });
      const panel = document.getElementById(id);
      const course = panel && panel.querySelectorAll('.course')[idx];
      if (course) {
        course.setAttribute('data-open', 'true');
        setTimeout(() => {
          const y = course.getBoundingClientRect().top + window.scrollY - (tabsBar.offsetHeight + 16);
          window.scrollTo({ top: y, behavior: 'smooth' });
        }, 120);
      }
    });
  });

  const initial = (location.hash || '').replace('#', '');
  showTab(validIds.indexOf(initial) !== -1 ? initial : validIds[0], { scroll: false, updateHash: false });
  window.addEventListener('resize', moveIndicator);
  window.addEventListener('load', moveIndicator);
  window.addEventListener('hashchange', () => {
    const id = (location.hash || '').replace('#', '');
    if (validIds.indexOf(id) !== -1) showTab(id, { updateHash: false });
  });

  /* ---------- Checklist unggah ---------- */
  const KEY = 'lk2-upload-checklist';
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (err) { saved = {}; }
  document.querySelectorAll('input[data-upload]').forEach((cb) => {
    cb.checked = !!saved[cb.dataset.upload];
    cb.addEventListener('change', () => {
      saved[cb.dataset.upload] = cb.checked;
      try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch (err) { /* abaikan */ }
    });
  });

  /* ---------- Muncul halus saat di-scroll ---------- */
  const items = document.querySelectorAll('.reveal, .course');
  items.forEach((el) => el.classList.add('reveal'));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.05 });
  items.forEach((el) => io.observe(el));
});
