import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

let lenis = null;
let observers = [];
let canvasStop = null;
let heroTimer = null;
let started = false;

/* ---------------- one-time global ---------------- */
function globalInit() {
  if (started) return;
  started = true;

  if (!reduce) {
    try {
      lenis = new Lenis({ duration: 1.05, smoothWheel: true, wheelMultiplier: 1 });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } catch (e) {
      lenis = null;
    }
  }

  // header condense — query fresh so it survives view transitions
  window.addEventListener('scroll', () => {
    const h = document.getElementById('header');
    if (h) h.classList.toggle('condensed', window.scrollY > 40);
  }, { passive: true });
}

/* ---------------- per-page ---------------- */
function cleanup() {
  observers.forEach((o) => o.disconnect());
  observers = [];
  ScrollTrigger.getAll().forEach((t) => t.kill());
  if (canvasStop) { canvasStop(); canvasStop = null; }
  if (heroTimer) { clearInterval(heroTimer); heroTimer = null; }
}

function setupHeroSlides() {
  const slides = document.querySelectorAll('.hero-slide');
  if (slides.length < 2) return;
  let idx = 0;
  const advance = () => {
    slides[idx].classList.remove('is-active');
    idx = (idx + 1) % slides.length;
    slides[idx].classList.add('is-active');
  };
  // reduced-motion でも静かにフェードで切替（動きは控えめに、間隔は長め）
  heroTimer = setInterval(advance, reduce ? 8000 : 5200);
}

function setupMenu() {
  const nav = document.getElementById('nav');
  const tgl = document.getElementById('navToggle');
  const cls = document.getElementById('navClose');
  if (!nav || !tgl) return;
  const open = () => {
    nav.classList.add('open'); document.body.classList.add('menu-open');
    tgl.setAttribute('aria-expanded', 'true'); if (lenis) lenis.stop();
  };
  const close = () => {
    nav.classList.remove('open'); document.body.classList.remove('menu-open');
    tgl.setAttribute('aria-expanded', 'false'); if (lenis) lenis.start();
  };
  tgl.addEventListener('click', open);
  if (cls) cls.addEventListener('click', close);
  nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', close));
}

function setupReveals() {
  const els = document.querySelectorAll('.reveal, .clip');
  if (reduce) { els.forEach((e) => e.classList.add('in')); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  els.forEach((el) => {
    if (el.classList.contains('reveal')) {
      const sibs = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
      el.style.transitionDelay = Math.min(sibs, 6) * 70 + 'ms';
    }
    io.observe(el);
  });
  observers.push(io);
}

function setupCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;
  const cio = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseInt(el.getAttribute('data-count'), 10);
      const plain = el.hasAttribute('data-plain');
      cio.unobserve(el);
      if (reduce) { el.textContent = plain ? target : target.toLocaleString(); return; }
      const dur = 1500; let start = null;
      const step = (ts) => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / dur, 1);
        const val = Math.round(target * (1 - Math.pow(1 - p, 3)));
        el.textContent = plain ? val : val.toLocaleString();
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }, { threshold: 0.5 });
  counters.forEach((c) => cio.observe(c));
  observers.push(cio);
}

function setupHeroLines() {
  const lns = document.querySelectorAll('[data-ln]');
  if (reduce) { lns.forEach((l) => l.classList.add('rise')); return; }
  lns.forEach((ln, i) => setTimeout(() => ln.classList.add('rise'), 160 + i * 140));
}

function setupParallax() {
  if (reduce) return;
  gsap.utils.toArray('[data-parallax]').forEach((img) => {
    const host = img.closest('section') || img.parentElement;
    gsap.fromTo(img, { yPercent: -8 }, {
      yPercent: 8, ease: 'none',
      scrollTrigger: { trigger: host, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });
}

function setupCanvas() {
  const cv = document.getElementById('ripple');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  let W, H, dpr, raf, running = true;
  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  const onResize = () => resize();
  window.addEventListener('resize', onResize);
  const waves = [
    { amp: 34, len: 0.0016, sp: 0.00022, y: 0.42, col: 'rgba(255,255,255,0.16)', w: 1.2 },
    { amp: 46, len: 0.0012, sp: 0.00016, y: 0.55, col: 'rgba(27,69,208,0.07)', w: 1.2 },
    { amp: 28, len: 0.0021, sp: 0.00030, y: 0.66, col: 'rgba(18,36,107,0.06)', w: 1 },
    { amp: 60, len: 0.0009, sp: 0.00012, y: 0.78, col: 'rgba(255,255,255,0.18)', w: 1.2 },
  ];
  const draw = (t) => {
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < waves.length; i++) {
      const wv = waves[i];
      ctx.beginPath();
      for (let x = 0; x <= W; x += 6) {
        const y = H * wv.y + Math.sin(x * wv.len + t * wv.sp) * wv.amp
          + Math.sin(x * wv.len * 2.3 + t * wv.sp * 1.7) * (wv.amp * 0.28);
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = wv.col; ctx.lineWidth = wv.w; ctx.stroke();
    }
  };
  const onVis = () => { running = !document.hidden; };
  document.addEventListener('visibilitychange', onVis);
  if (reduce) { draw(0); }
  else { const loop = (t) => { if (running) draw(t); raf = requestAnimationFrame(loop); }; raf = requestAnimationFrame(loop); }
  canvasStop = () => {
    if (raf) cancelAnimationFrame(raf);
    window.removeEventListener('resize', onResize);
    document.removeEventListener('visibilitychange', onVis);
  };
}

function pageInit() {
  if (window.__revealFailsafe) { clearTimeout(window.__revealFailsafe); window.__revealFailsafe = null; }
  cleanup();
  setupMenu();
  setupReveals();
  setupCounters();
  setupHeroLines();
  setupHeroSlides();
  setupCanvas();
  setupParallax();
  ScrollTrigger.refresh();
  if (lenis) { lenis.scrollTo(0, { immediate: true }); }
}

globalInit();
document.addEventListener('astro:page-load', pageInit);
