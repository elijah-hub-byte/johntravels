// ═══════════════════════════════════════════════════════
//  JOHN TRAVELS  –  main.js
// ═══════════════════════════════════════════════════════

// ── HELPERS ────────────────────────────────────────────
function showToast(msg, dur = 3500) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), dur);
}
function qs(sel) { return document.querySelector(sel); }
function qsa(sel) { return document.querySelectorAll(sel); }

// ── NAV SCROLL ─────────────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

// ── HAMBURGER ──────────────────────────────────────────
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
hamburger.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('open');
  hamburger.classList.toggle('open', open);
  document.body.style.overflow = open ? 'hidden' : '';
});
window.closeMenu = function() {
  mobileMenu.classList.remove('open');
  hamburger.classList.remove('open');
  document.body.style.overflow = '';
};
document.addEventListener('click', e => {
  if (!navbar.contains(e.target) && !mobileMenu.contains(e.target)) closeMenu();
});

// ── LANG TOGGLE ────────────────────────────────────────
document.getElementById('langToggle').addEventListener('click', toggleLang);
const ltm = document.getElementById('langToggleMobile');
if (ltm) ltm.addEventListener('click', toggleLang);

// ── MINI CAR SCROLL ────────────────────────────────────
const miniCar = document.getElementById('mini-car');
if (miniCar) {
  function updateCar() {
    const pct = Math.min(window.scrollY / (document.documentElement.scrollHeight - window.innerHeight), 1);
    miniCar.style.top = (10 + pct * 75) + 'vh';
    miniCar.style.transform = 'translateY(0)';
  }
  window.addEventListener('scroll', updateCar, { passive: true });
  updateCar();
}

// ── STATS COUNTER ──────────────────────────────────────
function animateCounter(el, target, suffix = '+') {
  const dur = 2000, fps = 60, steps = dur / (1000 / fps);
  let cur = 0; const inc = target / steps;
  const timer = setInterval(() => {
    cur = Math.min(cur + inc, target);
    el.textContent = Math.floor(cur).toLocaleString() + suffix;
    if (cur >= target) clearInterval(timer);
  }, 1000 / fps);
}

async function loadStats() {
  try {
    const res = await fetch('/api/stats');
    const s = await res.json();
    animateCounter(document.getElementById('stat-trips'),     s.trips_completed);
    animateCounter(document.getElementById('stat-customers'), s.happy_customers);
    animateCounter(document.getElementById('stat-cities'),    s.cities_covered);
    animateCounter(document.getElementById('stat-years'),     s.years_experience);
  } catch (e) {
    ['stat-trips','stat-customers','stat-cities','stat-years'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = '—';
    });
  }
}
// Fire stats when bar enters viewport
new IntersectionObserver((entries, obs) => {
  entries.forEach(e => { if (e.isIntersecting) { loadStats(); obs.disconnect(); } });
}, { threshold: 0.3 }).observe(document.getElementById('statsBar'));

// ── VEHICLE CARDS REVEAL ───────────────────────────────
const vObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); } });
}, { threshold: 0.12 });
qsa('.vehicle-card[data-aos]').forEach(c => vObs.observe(c));

// ── ABOUT CARDS STAGGER ────────────────────────────────
const aboutCards = qsa('.about-card');
const aObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const idx = Array.from(aboutCards).indexOf(e.target);
      e.target.style.animationDelay = (idx * 0.1) + 's';
      e.target.style.animation = 'fadeUp .6s ease both';
      aObs.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });
aboutCards.forEach(c => aObs.observe(c));

// ── BOOKING FORM ───────────────────────────────────────
const bookingForm = document.getElementById('bookingForm');
const submitBtn   = document.getElementById('submitBtn');
const formMsg     = document.getElementById('form-msg');

if (bookingForm) {
  // Set min date to today
  const dateInput = bookingForm.querySelector('input[name="trip_date"]');
  if (dateInput) dateInput.min = new Date().toISOString().split('T')[0];

  bookingForm.addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData(bookingForm);
    const data = Object.fromEntries(fd.entries());

    if (!data.name.trim() || !data.phone.trim()) {
      showFormMsg('Please fill your name and phone number.', 'error');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(data.phone.trim())) {
      showFormMsg('Please enter a valid 10-digit Indian phone number.', 'error');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="17" height="17"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg> Sending...`;

    try {
      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (json.success) {
        showFormMsg('✅ ' + json.message, 'success');
        bookingForm.reset();
        showToast('🎉 Booking enquiry sent! We\'ll call you shortly.');
        // Also open WhatsApp with pre-filled message
        const waMsg = encodeURIComponent(
          `Hi John Travels! I want to book a cab.\n\n` +
          `Name: ${data.name}\nPhone: ${data.phone}\n` +
          `Vehicle: ${data.vehicle || 'Any'}\nTrip: ${data.trip_type || 'Any'}\n` +
          `From: ${data.from_location || '-'}\nTo: ${data.to_location || '-'}\n` +
          `Date: ${data.trip_date || '-'}\nTime: ${data.trip_time || '-'}\n` +
          `Note: ${data.message || '-'}`
        );
        setTimeout(() => window.open(`https://wa.me/919603689642?text=${waMsg}`, '_blank'), 1200);
      } else {
        showFormMsg('❌ ' + json.message, 'error');
      }
    } catch (err) {
      showFormMsg('❌ Network error. Please call us directly: 9603689642', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="17" height="17"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> <span data-key="send_enquiry">Send Enquiry</span>`;
    }
  });
}

function showFormMsg(msg, type) {
  formMsg.textContent = msg;
  formMsg.className = 'form-msg ' + type;
  formMsg.style.display = 'block';
  setTimeout(() => { formMsg.style.display = 'none'; }, 5000);
}

// ── TESTIMONIALS SLIDER ────────────────────────────────
let testimonials = [], currentSlide = 0, sliderTimer = null;

async function loadTestimonials() {
  try {
    const res = await fetch('/api/testimonials');
    testimonials = await res.json();
    renderSlider();
  } catch (e) { console.warn('Could not load testimonials.'); }
}

function renderSlider() {
  const slider = document.getElementById('testimonialsSlider');
  const dots   = document.getElementById('sliderDots');
  if (!slider || !testimonials.length) return;

  slider.innerHTML = testimonials.map(t => `
    <div class="testimonial-card">
      <div class="tc-stars">${'★'.repeat(t.rating)}${'☆'.repeat(5 - t.rating)}</div>
      <p class="tc-review">${t.review}</p>
      <div class="tc-bottom">
        <div class="tc-avatar">${t.name.charAt(0)}</div>
        <div>
          <div class="tc-name">${t.name}</div>
          <div class="tc-loc">📍 ${t.location}</div>
          ${t.vehicle ? `<span class="tc-vehicle">🚗 ${t.vehicle}</span>` : ''}
        </div>
      </div>
    </div>`).join('');

  dots.innerHTML = testimonials.map((_, i) =>
    `<div class="dot ${i === 0 ? 'active' : ''}" data-i="${i}"></div>`).join('');

  dots.querySelectorAll('.dot').forEach(d =>
    d.addEventListener('click', () => goToSlide(parseInt(d.dataset.i))));

  startAutoSlide();
}

function goToSlide(n) {
  currentSlide = (n + testimonials.length) % testimonials.length;
  const slider = document.getElementById('testimonialsSlider');
  if (slider) slider.style.transform = `translateX(-${currentSlide * 100}%)`;
  document.querySelectorAll('.dot').forEach((d, i) =>
    d.classList.toggle('active', i === currentSlide));
}

function startAutoSlide() {
  if (sliderTimer) clearInterval(sliderTimer);
  sliderTimer = setInterval(() => goToSlide(currentSlide + 1), 4500);
}

const sliderPrev = document.getElementById('sliderPrev');
const sliderNext = document.getElementById('sliderNext');
if (sliderPrev) sliderPrev.addEventListener('click', () => { goToSlide(currentSlide - 1); startAutoSlide(); });
if (sliderNext) sliderNext.addEventListener('click', () => { goToSlide(currentSlide + 1); startAutoSlide(); });

// Touch swipe for mobile
let tsX = null;
document.getElementById('testimonialsSlider')?.addEventListener('touchstart', e => { tsX = e.touches[0].clientX; }, { passive: true });
document.getElementById('testimonialsSlider')?.addEventListener('touchend', e => {
  if (tsX === null) return;
  const diff = tsX - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 50) { goToSlide(currentSlide + (diff > 0 ? 1 : -1)); startAutoSlide(); }
  tsX = null;
});

loadTestimonials();
