/* ============================================================
   THE INFORMED PATIENT PROJECT — Main JavaScript
   ============================================================ */

/* ── Nav Active State ─────────────────────────────────────── */
(function setActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
})();

/* ── Mobile Nav Toggle ────────────────────────────────────── */
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', open);
    navToggle.querySelectorAll('span').forEach((s, i) => {
      s.style.transform = open
        ? (i === 0 ? 'rotate(45deg) translate(5px, 5px)' : i === 2 ? 'rotate(-45deg) translate(5px, -5px)' : 'opacity: 0')
        : '';
      if (i === 1) s.style.opacity = open ? '0' : '1';
    });
  });

  // Close nav on outside click
  document.addEventListener('click', e => {
    if (!e.target.closest('.nav') && navLinks.classList.contains('open')) {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

/* ── Scroll Reveal ────────────────────────────────────────── */
(function initReveal() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
})();

/* ── Download Modal ───────────────────────────────────────── */
const modalOverlay  = document.getElementById('downloadModal');
const modalDocName  = document.getElementById('modalDocName');
const modalSkipBtn  = document.getElementById('modalSkipBtn');
const modalClose    = document.getElementById('modalClose');
let   currentDownloadUrl = '';
let   currentDocFilename = '';

function openDownloadModal(url, name, filename) {
  currentDownloadUrl = url;
  currentDocFilename = filename;
  if (modalDocName)   modalDocName.textContent = name;

  // Update all donation links with UTM so you can track which PDF drove donations
  document.querySelectorAll('.modal-donate-btn').forEach(btn => {
    const base = btn.dataset.baseHref;
    if (base) btn.href = base + '?utm_source=download&utm_medium=modal&utm_content=' + encodeURIComponent(filename);
  });

  modalOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
  setTimeout(() => modalClose && modalClose.focus(), 100);
}

function closeModal() {
  if (modalOverlay) {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function triggerDownload(url, filename) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || url.split('/').pop();
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Bind download buttons
document.querySelectorAll('[data-download]').forEach(btn => {
  btn.addEventListener('click', e => {
    e.preventDefault();
    const url      = btn.dataset.download;
    const name     = btn.dataset.name     || 'Resource';
    const filename = btn.dataset.filename || url.split('/').pop();
    openDownloadModal(url, name, filename);
  });
});

if (modalClose) {
  modalClose.addEventListener('click', closeModal);
}

// Skip donation → download directly
if (modalSkipBtn) {
  modalSkipBtn.addEventListener('click', () => {
    closeModal();
    if (currentDownloadUrl) triggerDownload(currentDownloadUrl, currentDocFilename);
  });
}

// Clicking a donation link also triggers download after a short delay
document.querySelectorAll('.modal-donate-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    setTimeout(() => {
      closeModal();
      if (currentDownloadUrl) triggerDownload(currentDownloadUrl, currentDocFilename);
    }, 400);
  });
});

// Close on overlay click
if (modalOverlay) {
  modalOverlay.addEventListener('click', e => {
    if (e.target === modalOverlay) closeModal();
  });
}

// Close on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

/* ── Resource Filter ──────────────────────────────────────── */
const filterBtns     = document.querySelectorAll('.filter-btn[data-filter]');
const resourceCards  = document.querySelectorAll('[data-category]');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const filter = btn.dataset.filter;

    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    resourceCards.forEach(card => {
      const show = filter === 'all' || card.dataset.category === filter;
      card.style.display = show ? '' : 'none';
    });
  });
});

/* ── Condition Suggestion Form ────────────────────────────── */
const suggestForm = document.getElementById('suggestForm');
const formSuccess = document.getElementById('formSuccess');

if (suggestForm) {
  suggestForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = suggestForm.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Sending…';

    try {
      const res = await fetch(suggestForm.action, {
        method: 'POST',
        body: new FormData(suggestForm),
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        suggestForm.style.display = 'none';
        if (formSuccess) formSuccess.style.display = 'block';
      } else {
        throw new Error('Network response not ok');
      }
    } catch {
      btn.disabled = false;
      btn.textContent = 'Submit Suggestion';
      alert('Something went wrong. Please try again or email us directly.');
    }
  });
}

/* ── Smooth Anchor Offset (for sticky nav) ────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 88;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

/* ── Nav shadow on scroll ─────────────────────────────────── */
const nav = document.querySelector('.nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.style.boxShadow = window.scrollY > 10
      ? '0 2px 20px rgba(30,58,58,0.12)'
      : '0 1px 4px rgba(30,58,58,0.08)';
  }, { passive: true });
}
ntent of main.js needs to be fetched first.
