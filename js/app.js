/* ==========================================================================
   PORTFOLIO INTERACTIVE CONTROLLER
   Crafted for Syed Azhar Hussain A
   ========================================================================== */

/* --------------------------------------------------------------------------
   PRELOADER — "Portfolio Passport Door"
   Opens only when the visitor selects ENTER.
   -------------------------------------------------------------------------- */
(function initPreloader() {
  const preloader = document.getElementById('portfolioPreloader');
  if (!preloader) return;

  // Session-level guard: skip preloader on in-page navigation / back-forward
  if (sessionStorage.getItem('portfolioVisited')) {
    preloader.style.display = 'none';
    return;
  }

  // Lock scroll while preloader is visible
  document.documentElement.style.overflow = 'hidden';

  let dismissed = false;

  function dismissPreloader() {
    if (dismissed) return;
    dismissed = true;
    const openDelay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 420;
    preloader.classList.add('preloader-opening');
    sessionStorage.setItem('portfolioVisited', '1');
    // Let the click ripple travel outward before the doors swing open.
    setTimeout(() => {
      preloader.classList.add('preloader-exit');
      setTimeout(() => {
        document.documentElement.style.overflow = '';
        preloader.style.display = 'none';
      }, 1250);
    }, openDelay);
  }

  const enterButton = document.getElementById('preloaderEnterBtn');
  if (enterButton) enterButton.addEventListener('click', () => {
    enterButton.disabled = true;
    enterButton.classList.add('is-opening');
    dismissPreloader();
  });
})();

document.addEventListener('DOMContentLoaded', () => {
  // Initialize all interactive modules
  initSiteClickFeedback();
  initAudioSystem();
  initMobileNav();
  initNavScroll();
  initHeroCanvas();
  initExperienceTag();
  initCrtTerminal();
  initCertificationsConsole();
  initSkillsRolodex();
  initRetroConsole();
  initContactChecklistAndForm();
  initMechaAssistant();
  initStampInteractions();
  initThorChat();
  initMobileHeaderChat();
});

function initSiteClickFeedback() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const selector = 'button, a[href], [role="button"], input[type="submit"], .work-card-paper, .sticky-note-card, .rom-cartridge-btn';

  document.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target.closest(selector) : null;
    if (!target || target.matches(':disabled') || target.closest('#portfolioPreloader')) return;

    const bounds = target.getBoundingClientRect();
    const spark = document.createElement('span');
    spark.className = 'site-click-spark';
    spark.setAttribute('aria-hidden', 'true');
    spark.textContent = '✦';
    spark.style.left = `${event.clientX || bounds.left + bounds.width / 2}px`;
    spark.style.top = `${event.clientY || bounds.top + bounds.height / 2}px`;
    document.body.appendChild(spark);
    spark.addEventListener('animationend', () => spark.remove(), { once: true });
  }, true);
}

/* ==========================================================================
   1. SOUND SYNTHESIZER (Web Audio API)
   ========================================================================== */
let audioCtx = null;
let soundEnabled = true;

function initAudioSystem() {
  const toggleBtn = document.getElementById('audioToggleBtn');
  if (!toggleBtn) return;

  toggleBtn.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    toggleBtn.innerHTML = soundEnabled ? `<span>🔊</span> Sound: ON` : `<span>🔇</span> Sound: OFF`;
    if (soundEnabled) playClickSound();
  });
}

function getAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playClickSound() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch (e) {
    // Audio unsupported or blocked
  }
}

function playRetroBeep(freq = 600, duration = 0.08) {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {}
}

/* ==========================================================================
   2. NAVIGATION & SCROLL
   ========================================================================== */

/* ==========================================================================
   MOBILE NAVIGATION DRAWER
   ========================================================================== */
function initMobileNav() {
  const menuBtn = document.getElementById('mobileMenuBtn');
  const drawer = document.getElementById('mobileNavDrawer');
  const links = document.querySelectorAll('.mobile-nav-link');

  if (!menuBtn || !drawer) return;

  const toggle = (force) => {
    const willOpen = typeof force === 'boolean' ? force : !drawer.classList.contains('open');
    drawer.classList.toggle('open', willOpen);
    menuBtn.classList.toggle('active', willOpen);
    menuBtn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
    drawer.setAttribute('aria-hidden', willOpen ? 'false' : 'true');

    if (willOpen) {
      document.body.classList.add('mobile-nav-locked');
      playRetroBeep(520, 0.05);
    } else {
      document.body.classList.remove('mobile-nav-locked');
    }
  };

  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggle();
  });

  links.forEach(l => {
    l.addEventListener('click', () => {
      playClickSound();
      toggle(false);
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      toggle(false);
    }
  });

  drawer.addEventListener('click', (e) => {
    if (e.target === drawer) {
      toggle(false);
    }
  });
}

function initNavScroll() {
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');
  const backToTopBtn = document.getElementById('backToTopBtn');

  // Scrollspy
  window.addEventListener('scroll', () => {
    let current = '';
    const scrollPos = window.scrollY + 140;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });

    if (backToTopBtn) {
      if (window.scrollY > 400) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }
  });

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      playClickSound();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  navLinks.forEach(link => {
    link.addEventListener('click', () => playClickSound());
  });
}

/* ==========================================================================
   3. HERO ART WATERCOLOR CANVAS (Exact Reference Recreation)
   ========================================================================== */
function initHeroCanvas() {
  const container = document.getElementById('heroDoodleContainer');
  const canvas = document.getElementById('heroDoodleCanvas');
  const tag = document.getElementById('heroDoodleTag');
  if (!container || !canvas || !tag) return;

  const w = 1024;
  const maxRadius = 1600;
  canvas.width = w;
  canvas.height = w;

  const ctx = canvas.getContext('2d', { alpha: true });
  const offCanvas = document.createElement('canvas');
  offCanvas.width = w;
  offCanvas.height = w;
  const offCtx = offCanvas.getContext('2d', { alpha: true });

  // State variables
  let imagesLoaded = false;
  let isFullyPainted = false;
  let isHovering = false;
  let isTouchScratching = false;
  let touchStart = null;
  let suppressNextClick = false;
  let suppressClickTimer = null;
  let animFrame = null;
  let expandStartTime = null;

  // Position & interpolation vectors
  const clickPos = { x: 512, y: 512 };
  const targetPos = { x: 512, y: 512 };
  const currentPos = { x: 512, y: 512 };

  let targetRadius = 0;
  let currentRadius = 0;
  let targetAlpha = 0;
  let currentAlpha = 0;

  // Load Thor images (pre-rendered teal ink sketch + full vibrant lightning artwork)
  const imgTeal = new Image();
  const imgColor = new Image();
  let tealLoaded = false;
  let colorLoaded = false;

  const onAssetsLoaded = () => {
    if (tealLoaded && colorLoaded) {
      imagesLoaded = true;
      document.fonts.ready.then(() => {
        render();
      });
    }
  };

  imgTeal.onload = () => {
    tealLoaded = true;
    onAssetsLoaded();
  };
  imgColor.onload = () => {
    colorLoaded = true;
    onAssetsLoaded();
  };

  imgTeal.src = 'assets/images/thor_doodle_teal.jpg';
  imgColor.src = 'assets/images/thor_doodle_color.jpg';

  // Placard text renderer for Thor's wooden sign
  const drawPlacardText = (targetCtx, isColor) => {
    targetCtx.save();
    targetCtx.translate(622, 542);
    targetCtx.textAlign = 'center';
    targetCtx.textBaseline = 'middle';

    if (isColor) {
      targetCtx.font = "bold 26px 'Caveat', cursive, sans-serif";
      targetCtx.fillStyle = '#2c170b';
      targetCtx.fillText('Chai is important', 0, -18);
      targetCtx.fillText('while coding.', 0, 12);
      targetCtx.font = "bold 15px 'Caveat', cursive, sans-serif";
      targetCtx.fillStyle = '#9a3412';
      targetCtx.fillText('â€” strictly non-negotiable â€”', 0, 40);
    } else {
      targetCtx.font = "bold 26px 'Caveat', cursive, sans-serif";
      targetCtx.fillStyle = '#163f49';
      targetCtx.fillText('Chai is important', 0, -18);
      targetCtx.fillText('while coding.', 0, 12);
      targetCtx.font = "bold 15px 'Caveat', cursive, sans-serif";
      targetCtx.fillStyle = '#205562';
      targetCtx.fillText('â€” strictly non-negotiable â€”', 0, 40);
    }
    targetCtx.restore();
  };

  // Main composite render loop
  const render = () => {
    if (!ctx || !offCtx || !imagesLoaded) return;

    // 1. Draw base teal sketch
    ctx.clearRect(0, 0, w, w);
    ctx.drawImage(imgTeal, 0, 0, w, w);
    // drawPlacardText(ctx, false);

    const rad = Math.max(0, currentRadius);
    const alpha = Math.max(0, Math.min(1, currentAlpha));
    const cx = currentPos.x;
    const cy = currentPos.y;

    // 2. If brush or expansion wave is active, composite the color watercolor
    if (rad > 1 && alpha > 0.01) {
      offCtx.clearRect(0, 0, w, w);
      offCtx.globalCompositeOperation = 'source-over';
      offCtx.drawImage(imgColor, 0, 0, w, w);
      // drawPlacardText(offCtx, true);

      // Feathered radial mask
      offCtx.globalCompositeOperation = 'destination-in';
      const gradient = offCtx.createRadialGradient(cx, cy, 0, cx, cy, rad);
      gradient.addColorStop(0, 'rgba(0, 0, 0, 1.0)');
      gradient.addColorStop(0.45, 'rgba(0, 0, 0, 0.98)');
      gradient.addColorStop(0.78, 'rgba(0, 0, 0, 0.65)');
      gradient.addColorStop(0.92, 'rgba(0, 0, 0, 0.22)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.0)');

      offCtx.fillStyle = gradient;
      offCtx.beginPath();
      offCtx.arc(cx, cy, rad, 0, Math.PI * 2);
      offCtx.fill();

      // Draw masked color watercolor onto main canvas
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.drawImage(offCanvas, 0, 0, w, w);

      // Golden ambient watercolor rim when spreading
      if (rad < maxRadius * 0.9) {
        const rim = ctx.createRadialGradient(cx, cy, rad * 0.72, cx, cy, rad * 1.06);
        rim.addColorStop(0, 'rgba(255, 240, 200, 0.0)');
        rim.addColorStop(0.5, `rgba(255, 235, 170, ${(0.22 * alpha).toFixed(3)})`);
        rim.addColorStop(1, 'rgba(255, 240, 200, 0.0)');
        ctx.fillStyle = rim;
        ctx.beginPath();
        ctx.arc(cx, cy, rad * 1.06, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  };

  // Animation frame loop
  const animate = () => {
    // A) If click-expansion animation is running
    if (expandStartTime !== null) {
      const elapsed = performance.now() - expandStartTime;
      const progress = Math.min(1, elapsed / 2200);
      const ease = 1 - Math.pow(1 - progress, 3.5); // Ease-out cubic

      const startX = clickPos.x;
      const startY = clickPos.y;
      currentPos.x = startX + (512 - startX) * ease * 0.65;
      currentPos.y = startY + (512 - startY) * ease * 0.65;
      currentRadius = 120 + 1520 * ease;
      currentAlpha = Math.min(1, 0.3 + ease * 0.7);

      render();

      if (progress < 1) {
        animFrame = requestAnimationFrame(animate);
      } else {
        currentRadius = maxRadius;
        currentAlpha = 1;
        expandStartTime = null;
        render();
        animFrame = null;
      }
      return;
    }

    // B) Mouse hover brush interpolation
    const lerp = 0.18;
    currentPos.x += (targetPos.x - currentPos.x) * lerp;
    currentPos.y += (targetPos.y - currentPos.y) * lerp;
    currentRadius += (targetRadius - currentRadius) * lerp;
    currentAlpha += (targetAlpha - currentAlpha) * lerp;

    render();

    const isNearlyStill = 
      Math.abs(targetRadius - currentRadius) < 0.2 &&
      Math.abs(targetAlpha - currentAlpha) < 0.01 &&
      Math.abs(targetPos.x - currentPos.x) < 0.3 &&
      Math.abs(targetPos.y - currentPos.y) < 0.3;

    if (!isNearlyStill || targetRadius > 0 || currentRadius > 0.5) {
      animFrame = requestAnimationFrame(animate);
    } else {
      animFrame = null;
    }
  };

  const scheduleAnimation = () => {
    if (!animFrame) {
      animFrame = requestAnimationFrame(animate);
    }
  };

  // Transform browser coordinates to 1024x1024 canvas space
  const getCanvasCoords = (clientX, clientY) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = w / rect.width;
    const scaleY = w / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  // Click / Tap Handler
  const handleFullPaint = (clientX, clientY) => {
    playRetroBeep(750, 0.09);

    if (isFullyPainted) {
      // Reset back to sketch
      isFullyPainted = false;
      expandStartTime = null;
      currentRadius = 0;
      targetRadius = 0;
      currentAlpha = 0;
      targetAlpha = 0;
      tag.textContent = '✨ hover or drag to reveal · tap to fill';
      tag.classList.add('animate-bounce');
      render();
      return;
    }

    // Trigger full expansion
    isFullyPainted = true;
    const coords = (clientX !== undefined && clientY !== undefined)
      ? getCanvasCoords(clientX, clientY)
      : { x: 512, y: 512 };

    clickPos.x = coords.x;
    clickPos.y = coords.y;
    currentPos.x = coords.x;
    currentPos.y = coords.y;

    expandStartTime = performance.now();
    tag.textContent = '✨ click or tap to reset sketch';
    tag.classList.remove('animate-bounce');
    scheduleAnimation();
  };

  // Event Listeners
  container.addEventListener('click', (e) => {
    // A drag paints under the finger; it should not also trigger the tap-to-fill action.
    if (suppressNextClick) {
      suppressNextClick = false;
      clearTimeout(suppressClickTimer);
      return;
    }
    handleFullPaint(e.clientX, e.clientY);
  });

  container.addEventListener('pointerenter', (e) => {
    if (isFullyPainted) return;
    if (e.pointerType !== 'touch') {
      isHovering = true;
      targetRadius = 240;
      targetAlpha = 1;
      const coords = getCanvasCoords(e.clientX, e.clientY);
      targetPos.x = coords.x;
      targetPos.y = coords.y;
      scheduleAnimation();
    }
  });

  container.addEventListener('pointermove', (e) => {
    if (isFullyPainted) return;
    if (e.pointerType === 'touch' && isTouchScratching) {
      if (touchStart) {
        const movedX = e.clientX - touchStart.x;
        const movedY = e.clientY - touchStart.y;
        if ((movedX * movedX) + (movedY * movedY) > 64) suppressNextClick = true;
      }
      isHovering = true;
      targetRadius = 240;
      targetAlpha = 1;
    }
    if (e.pointerType === 'touch' && !isTouchScratching) return;
    const coords = getCanvasCoords(e.clientX, e.clientY);
    targetPos.x = coords.x;
    targetPos.y = coords.y;
    if (!isHovering && e.pointerType !== 'touch') {
      isHovering = true;
      targetRadius = 240;
      targetAlpha = 1;
    }
    scheduleAnimation();
  });

  // Touch screens have no hover event, so paint while a finger is dragged across the art.
  container.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'touch' || isFullyPainted) return;
    isTouchScratching = true;
    touchStart = { x: e.clientX, y: e.clientY };
    isHovering = true;
    targetRadius = 240;
    targetAlpha = 1;
    const coords = getCanvasCoords(e.clientX, e.clientY);
    targetPos.x = coords.x;
    targetPos.y = coords.y;
    if (container.setPointerCapture) container.setPointerCapture(e.pointerId);
    scheduleAnimation();
  });

  const stopTouchScratch = (e) => {
    if (e.pointerType !== 'touch' || !isTouchScratching) return;
    isTouchScratching = false;
    touchStart = null;
    clearTimeout(suppressClickTimer);
    suppressClickTimer = setTimeout(() => { suppressNextClick = false; }, 500);
    isHovering = false;
    targetRadius = 0;
    targetAlpha = 0;
    scheduleAnimation();
  };
  container.addEventListener('pointerup', stopTouchScratch);
  container.addEventListener('pointercancel', stopTouchScratch);

  container.addEventListener('pointerleave', (e) => {
    if (isFullyPainted) return;
    isHovering = false;
    targetRadius = 0;
    targetAlpha = 0;
    scheduleAnimation();
  });
}


/* ==========================================================================
   4. EXPERIENCE 3D HANGING LUGGAGE TAG
   ========================================================================== */
const experiencesData = [
  {
    id: 'trios',
    company: 'Trios Technologies',
    role: 'Full Stack Developer Intern (Python)',
    period: '2026 — PRESENT',
    status: 'CURRENT INTERNSHIP',
    summary: 'Contributing to 2+ production-grade full-stack web applications using Python, Django/Flask, and React.js, serving real end users in Chennai.',
    barcode: 'TRIOS2026INT',
    contributions: [
      'Contributing to 2+ production-grade full-stack web applications using Python, Django/Flask, and React.js, serving real end users.',
      'Designed and integrated 5+ RESTful APIs connecting React.js front-end with back-end databases and third-party services.',
      'Improved data retrieval efficiency by optimizing SQL and MongoDB queries, reducing average query response time.',
      'Managed CI/CD deployment pipelines using Git and cloud hosting platforms including Vercel and Render.'
    ],
    tech: ['Python', 'Django', 'Flask', 'React.js', 'REST APIs', 'MongoDB', 'SQL', 'Vercel', 'Render']
  },
  {
    id: 'cognifyz',
    company: 'Cognifyz IT Solutions Pvt. Ltd.',
    role: 'Full Stack Developer Intern',
    period: 'June 2026 — July 2026',
    status: 'COMPLETED INTERNSHIP',
    summary: 'Developed and delivered 3+ full-stack web application features using React.js and RESTful APIs, reducing manual data handling time by approximately 25%.',
    barcode: 'COG2026INT',
    contributions: [
      'Developed and delivered 3+ full-stack web application features using React.js and RESTful APIs, reducing manual data handling time by ~25%.',
      'Built 10+ dynamic, reusable UI components integrated with back-end APIs, improving overall application performance and user experience.',
      'Collaborated with a team of 5 developers following Agile practices, completing sprint tasks consistently on schedule.',
      'Maintained 100% code documentation standards through peer code reviews, improving codebase maintainability.',
      'Resolved 15+ bugs and performance issues across front-end and back-end modules during the internship period.'
    ],
    tech: ['React.js', 'Node.js', 'RESTful APIs', 'JavaScript (ES6+)', 'Agile', 'Scrum', 'Git']
  },
  {
    id: 'client',
    company: 'Veedu Vadagaikku & Client Platforms',
    role: 'Full-Stack Developer (Client Projects)',
    period: '2024 — PRESENT',
    status: 'DEPLOYED PRODUCTION',
    summary: 'Designed and deployed real-world full-stack platforms including Veedu Vadagaikku Chennai (property rental platform with Firebase), Aadhif\'s Homemade e-commerce, and corporate client portals.',
    barcode: 'VV2026CLNT',
    contributions: [
      'Designed and developed a full-stack house rental web application for a client, enabling tenants to browse, search, and filter rental properties across Chennai with zero brokerage.',
      'Built responsive listing and detail pages with role-based authentication and an admin panel for managing property listings, integrated through REST APIs.',
      'Architected full-stack e-commerce platforms with product listings, shopping cart persistence, payment integration, and inventory management.',
      'Configured cloud hosting and serverless Firebase architecture with Firestore database and real-time synchronization.'
    ],
    tech: ['React.js', 'Node.js', 'Python', 'Firebase', 'Firestore', 'MongoDB', 'REST APIs', 'Tailwind CSS']
  }
];

function initExperienceTag() {
  const flipper = document.getElementById('luggageTagFlipper');
  const tabs = document.querySelectorAll('.exp-tab-btn');
  if (!flipper) return;

  // Click to flip 3D card
  flipper.addEventListener('click', () => {
    playClickSound();
    flipper.classList.toggle('flipped');
  });

  // Tab switching
  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.stopPropagation();
      playClickSound();
      const expId = tab.getAttribute('data-exp');
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const data = experiencesData.find(item => item.id === expId);
      if (data) {
        updateLuggageTagContent(data);
      }
    });
  });
}

function updateLuggageTagContent(data) {
  document.getElementById('tagCompanyPixel').textContent = data.company;
  document.getElementById('tagRoleSubhead').textContent = `${data.role} Â· ${data.period}`;
  document.getElementById('tagStatusBadge').textContent = data.status;
  document.getElementById('tagBodyText').textContent = data.summary;
  document.getElementById('tagBarcodeNum').textContent = data.barcode;

  // Back face
  document.getElementById('tagBackTitle').textContent = `${data.company} â€” Impact`;
  const list = document.getElementById('tagContributionsList');
  list.innerHTML = data.contributions.map(c => `<li>${c}</li>`).join('');

  const techContainer = document.getElementById('tagTechPills');
  techContainer.innerHTML = data.tech.map(t => `<span class="tag-tech-badge">${t}</span>`).join('');
}

/* ==========================================================================
   5. SELECTED WORK: RETRO CRT MONITOR & TERMINAL (6 Client Projects)
   Faithfully matching maazprofile.tech + Advanced Interactive Enhancements
   ========================================================================== */
const projectsData = [
  {
    id: 'veedu',
    title: 'VeeduVadagaikku',
    category: 'PROPERTY RENTAL & LISTING PLATFORM',
    tag: 'rental platform / full stack',
    href: 'https://github.com/azhar2006-collab',
    bullets: [
      '> Property listing platform for owners to publish & manage properties',
      '> Owner dashboard with listing plans, validity & payment gateway',
      '> Property browsing with filters, detailed view & enquiry system',
      '> React (Vite) + Node.js + PostgreSQL + Razorpay + Cloudinary'
    ],
    image: 'assets/images/veedu_vadagaikku_live.png',
    techStack: ['React (Vite)', 'Node.js & Express', 'PostgreSQL', 'Razorpay', 'Firebase Auth', 'Cloudinary', 'TypeScript'],
    shortDesc: "A full-stack property rental and listing platform where property owners can publish, manage and promote listings with subscription plans, validity controls, and integrated payment gateway.",
    fullDesc: "VeeduVadagaikku is a full-stack property rental and listing web application connecting property owners with prospective tenants across Chennai. Owners can register, create property listings with photos, and select subscription-based publishing plans with validity controls. The platform includes a dedicated owner dashboard for managing active listings, tracking expiry, and upgrading plans via an integrated Razorpay payment gateway. Tenants can browse available properties with filters, view detailed property pages, and contact owners directly.",
    keyFeatures: [
      'Property Publishing System: Owners create and publish listings with photos, amenities, and property details via a structured form.',
      'Subscription Plans & Validity: Tiered listing plans with expiry management and renewal flows powered by Razorpay payment integration.',
      'Owner Dashboard: Full management interface for active listings, plan status, photo uploads via Cloudinary, and enquiry tracking.',
      'Property Browsing & Filters: Tenants browse properties with category, location, and price filters with detailed property view pages.',
      'Firebase Authentication: Secure user authentication with Firebase Auth for both property owners and tenant accounts.',
      'TypeScript + REST API Backend: Strongly-typed Express.js REST API with PostgreSQL via Prisma ORM for data integrity.'
    ],
    contribution: 'Full-stack development — React frontend, Express/TypeScript backend, Razorpay payment integration, Cloudinary photo management, Prisma ORM schema design, and Firebase Auth.'
  },
  {
    id: 'jpholidays',
    title: 'JP Holidays',
    category: 'GLOBAL TRAVEL / PRODUCTION SEO',
    tag: 'travel portal / production seo',
    href: 'https://github.com/azhar2006-collab',
    bullets: [
      '> International & domestic tour portal offering 3,000+ destinations',
      '> Interactive search engine for honeymoon, luxury & group escapes',
      '> Direct WhatsApp enquiry pipeline & custom itinerary planner',
      '> Production SEO with Google Search Console Schema.org JSON-LD'
    ],
    image: 'assets/images/jpholidays_live.png',
    techStack: ['JavaScript (ES6+)', 'HTML5 / Semantic CSS3', 'Font Awesome 6', 'Schema.org JSON-LD', 'WhatsApp API'],
    shortDesc: "South India's premier travel agency website presenting 3,000+ domestic and international destinations, custom honeymoon specials, WhatsApp enquiry routing, and Google Search Console Schema.org JSON-LD.",
    fullDesc: "JP Holidays is an award-winning travel agency web platform based in Chennai that serves over 45,000+ global travelers. The site showcases domestic and international holiday packages spanning Bali, Maldives, Dubai, Singapore, Europe, and South India with tailored itineraries for families, couples, and corporate groups.",
    keyFeatures: [
      'Comprehensive Package Catalog: Browse 3,000+ destinations with detailed day-wise itineraries, inclusion lists, and pricing.',
      'Custom Itinerary Builder: Interactive trip search filtered by destination, tour category (Honeymoon, Group, Luxury), and duration.',
      'One-Click Travel Inquiries: Integrated WhatsApp routing and instant callback request forms.',
      'Search Engine Dominance: Full Google Search Central Schema.org JSON-LD structured data for WebSite, Organization, and Sitelinks Search Box.',
      'High-Impact Visual Layout: Full-bleed hero visuals with crimson accent branding (#C8102E) and mobile-optimized touch controls.'
    ],
    contribution: 'Full-stack frontend development, responsive travel package grid, dynamic search parameter parsing, and structured data implementation.'
  },
  {
    id: '77fitness',
    title: '77 Fitness Studio',
    category: 'PREMIUM FITNESS / LUXURY DARK',
    tag: 'dark editorial / luxury fitness',
    href: 'https://github.com/azhar2006-collab',
    bullets: [
      '> Modern fitness studio portal across Kodambakkam, Nungambakkam & Vadapalani',
      '> Editorial dark-mode aesthetic with luxury gym experience branding',
      '> Structured progression training programs & recovery floor walkthroughs',
      '> Integrated Google Maps location finder & WhatsApp onboarding'
    ],
    image: 'assets/images/77fitness_live.png',
    techStack: ['Vanilla CSS3', 'Modern JavaScript (ES6+)', 'Dark Mode System', 'Google Maps API', 'WhatsApp API'],
    shortDesc: "A sleek, luxury-first fitness and wellness studio website for three premier locations across Chennai, blending high-end design with seamless member onboarding.",
    fullDesc: "77 Fitness Studio represents a calm, luxury-first gym experience designed for modern Chennai. The website reflects this brand philosophy across three prime neighborhoods (Kodambakkam, Nungambakkam, and Vadapalani), presenting clean floor layouts, international-grade equipment, tailored training stages, and dedicated post-workout recovery spaces.",
    keyFeatures: [
      'Multi-Location Studio Directory: Interactive branch details for Kodambakkam, Nungambakkam, and Vadapalani with direct Google Maps routing.',
      'Tailored Training Stage Programs: Structured guidance for strength, hypertrophy, functional conditioning, and cardiovascular health.',
      'Luxury Dark-Mode Presentation: Deep-black interface with crimson contrast accents, fluid typography, and clean editorial spacing.',
      'Instant WhatsApp Membership Connect: Direct links to studio managers for trial pass bookings and package consultation.',
      'Community & Transformation Showcase: Member stories, gym atmosphere highlights, and social channels integration.'
    ],
    contribution: 'Visual design execution, responsive dark theme implementation, multi-branch location navigation, and mobile menu interactions.'
  },
  {
    id: 'aadhifs',
    title: "Aadhif's Homemade",
    category: 'HOMEMADE PRODUCTS / E-COMMERCE',
    tag: 'e-commerce / payment gateway',
    href: 'https://github.com/azhar2006-collab',
    bullets: [
      '> Homemade products e-commerce store with product browsing & cart',
      '> Integrated UPI & online payment gateway for seamless checkout',
      '> Dynamic product catalog: images, descriptions & live pricing',
      '> Admin panel for order management, stock & delivery tracking'
    ],
    image: 'assets/images/aadhifs_live.png',
    techStack: ['JavaScript (ES6+)', 'Node.js & Express', 'UPI Payment Gateway', 'REST APIs', 'Admin Dashboard'],
    shortDesc: "A full-stack e-commerce platform for homemade products featuring product browsing, shopping cart, integrated payment gateway, and an admin panel for order and delivery management.",
    fullDesc: "Aadhif's Homemade is a dedicated e-commerce web application built to sell handcrafted homemade products directly to customers. The platform showcases a curated product catalog with images, descriptions, and pricing. Customers can browse products, add items to cart, and complete purchases via an integrated UPI-based payment gateway. A dedicated admin panel allows the store owner to manage orders, update stock levels, track payment status, and monitor delivery workflows — all from a single interface.",
    keyFeatures: [
      'Product Catalog & Browsing: Rich product pages with images, descriptions, and dynamic pricing across product categories.',
      'Shopping Cart & Checkout: Customer cart management with seamless checkout flow and order confirmation.',
      'Integrated Payment Gateway: UPI-based online payment integration enabling secure digital transactions at checkout.',
      'Order Management Admin Panel: Backend admin dashboard for tracking incoming orders, payment verification, and delivery status.',
      'Order History & Status: Customers can track their order status post-purchase through the platform.',
      'REST API Backend: Node.js & Express REST API with structured routes for orders, admin operations, and payment handling.'
    ],
    contribution: 'Full-stack development — product frontend, shopping cart, UPI payment integration, admin panel, and order management REST API backend.'
  },
  {
    id: 'unihut',
    title: 'UniHut Tax & Corpserv',
    category: 'CORPORATE LEGAL / TAX PORTAL',
    tag: 'corporate legal / advisory portal',
    href: 'https://github.com/azhar2006-collab',
    bullets: [
      '> Corporate legal & taxation advisory portal ("All under One Hut")',
      '> Multi-service catalog: Incorporation, GST, ITR, Trademark & Payroll',
      '> Luxury corporate aesthetic with cream, deep-teal and gold accents',
      '> WhatsApp Business advisory consultation & dynamic inquiry pipeline'
    ],
    image: 'assets/images/unihut_live.png',
    techStack: ['HTML5 / Semantic CSS3', 'JavaScript (ES6+)', 'Cormorant Garamond Typography', 'WhatsApp Business API'],
    shortDesc: "An authoritative corporate legal and taxation services portal presenting private limited company setup, GST filing, and financial compliance under one roof.",
    fullDesc: "Unihut Tax & Corpserv Pvt. Ltd. is a comprehensive business support hub providing end-to-end corporate secretarial, direct/indirect tax planning, and statutory compliance. The platform presents business founders and SMEs with accessible legal services, from initial business incorporation to annual auditing and trademark protection.",
    keyFeatures: [
      'Comprehensive Services Catalog: Dedicated breakdown for Private Limited, LLP, Partnership registration, GST returns, and annual ROC filings.',
      'Editorial Corporate Design: Harmonious color palette combining warm parchment cream (#f3e3c8), regal deep teal (#073a4f), and amber gold (#da9d23).',
      'Founder Advisory Funnel: Streamlined client intake allowing entrepreneurs to schedule instant consultations via WhatsApp or callback.',
      'Interactive Service Explorer: Multi-tab navigation with detailed compliance checklists, document requirements, and expected turnaround timelines.',
      'Mobile-Optimized Experience: Fully responsive layout with custom Cormorant Garamond serif headers and accessible navigation.'
    ],
    contribution: 'Front-end development, service catalog styling, brand aesthetic implementation, and WhatsApp business consultation integration.'
  },
  {
    id: 'ktech',
    title: 'Ktech Solutions',
    category: 'ENTERPRISE / PIPELINE TELEMETRY',
    tag: 'enterprise / microservices telemetry',
    href: 'https://github.com/azhar2006-collab',
    bullets: [
      '> Enterprise workflow automation & process orchestration system',
      '> RESTful API telemetry & distributed microservices architecture',
      '> Real-time system monitoring, error alerting & log analytics',
      '> High-throughput transaction processing with enterprise security'
    ],
    image: 'assets/images/ktech.webp',
    techStack: ['Node.js & Express', 'PostgreSQL', 'Docker', 'RESTful APIs', 'Telemetry & Logging'],
    shortDesc: "Enterprise software systems & automated workflow pipelines with RESTful architecture and telemetry.",
    fullDesc: "Ktech Solutions is an enterprise-scale software engineering platform architected to streamline mission-critical business automation, data transformation pipelines, and systems orchestration. Featuring robust service integrations, telemetry tracking, and fault-tolerant architecture.",
    keyFeatures: [
      'Automated Workflow Pipelines: Orchestrates data synchronization, approval chains, and external webhooks with zero human intervention.',
      'RESTful Microservices Telemetry: Real-time service health monitoring, distributed request tracing, and latency logging.',
      'Data Integrity & Reliability: ACID-compliant transactions with PostgreSQL and automated schema versioning.',
      'High-Availability Architecture: Designed for low latency and continuous uptime across multi-tenant deployments.'
    ],
    contribution: 'Backend service architecture, database design, API telemetry pipelines, and performance profiling.'
  },
  {
    id: 'webspide',
    title: 'Webspide Technologies',
    category: 'TECHNOLOGY BLOG / DIGITAL AGENCY',
    tag: 'tech blog / digital agency',
    href: 'https://github.com/azhar2006-collab',
    bullets: [
      '> Technology-focused blog & digital agency website',
      '> Articles, tutorials, industry updates & service pages',
      '> Blog admin panel with content management & publishing',
      '> Modern responsive UI with multi-page service architecture'
    ],
    image: 'assets/images/webspide_live.jpg',
    techStack: ['HTML5 / Semantic CSS3', 'JavaScript (ES6+)', 'Blog CMS', 'Node.js', 'Responsive Design'],
    shortDesc: "A professional technology blog and digital agency website showcasing services, publishing technology articles, programming tutorials, and industry updates for tech enthusiasts.",
    fullDesc: "Webspide Technologies is a full-featured digital agency and technology blog website. The platform serves a dual purpose — presenting the agency's service offerings (web development, app development, digital marketing, SEO, and UI/UX design) alongside a robust blog section for technology articles, programming tutorials, and industry insights. The site includes a blog admin panel with content management, a structured multi-page service architecture, and a modern responsive design for a professional digital presence.",
    keyFeatures: [
      'Technology Blog Platform: Fully functional blog section with articles, programming tutorials, and tech industry updates for tech audiences.',
      'Blog Admin Panel: Dedicated admin interface for publishing, editing, and managing blog content without requiring technical knowledge.',
      'Service Pages Architecture: Comprehensive service detail pages for web development, mobile apps, digital marketing, SEO, and UI/UX.',
      'Multi-Page Responsive Design: Clean, modern layout optimized across desktop, tablet, and mobile with semantic HTML5 structure.',
      'Content Discovery: Blog listing, search, and category navigation enabling readers to explore technology content efficiently.',
      'Agency Contact & Inquiry: Lead generation forms and contact sections connecting potential clients with the agency team.'
    ],
    contribution: 'Full frontend development, blog CMS integration, multi-page service architecture, admin panel, and responsive design implementation.'
  },
  {
    id: 'mithas',
    title: 'Mithas Ice Cream',
    category: 'ICE CREAM BRAND / PRODUCT SHOWCASE',
    tag: 'brand website / product showcase',
    href: 'https://github.com/azhar2006-collab',
    bullets: [
      '> Brand website for Mithas — an ice cream company',
      '> Showcase ice cream flavours, products & brand story',
      '> Franchise & retail kiosk information pages',
      '> Colourful, visually engaging mobile-responsive design'
    ],
    image: 'assets/images/mithas_live.png',
    techStack: ['HTML5 / CSS3', 'JavaScript (ES6+)', 'Responsive Design', 'WhatsApp Enquiry'],
    shortDesc: "A vibrant, mobile-responsive brand website for Mithas Ice Cream showcasing flavours, product images, retail kiosk details, and franchise information in an engaging visual design.",
    fullDesc: "Mithas Ice Cream (operating under Thirupura Krishnah Dairy Pvt Ltd) is an ice cream brand with a retail presence across Chennai and Tamil Nadu. The brand website serves as the digital face of the company — showcasing the ice cream product range, flavours, and high-quality product photography. The site presents information on retail kiosks, outdoor carts, indoor parlour setups, and franchise opportunities for prospective partners, all wrapped in a colourful, food-brand aesthetic with a fully responsive layout.",
    keyFeatures: [
      'Product & Flavour Showcase: Visually rich product gallery highlighting the ice cream range with professional product photography.',
      'Brand Story & Identity: Dedicated sections presenting the brand heritage, manufacturing quality, and dairy credentials.',
      'Retail & Kiosk Information: Pages covering indoor parlours, outdoor carts, AC kiosks, and franchise setup options.',
      'Franchise Enquiry Section: Information page for prospective franchise partners with WhatsApp-based enquiry routing.',
      'Mobile-Responsive Layout: Fully optimized across all device sizes ensuring a smooth experience for mobile users.',
      'Colourful Brand Design: Vibrant colour palette and food photography-driven visual design reflecting the ice cream brand identity.'
    ],
    contribution: 'Frontend design and development, brand visual implementation, responsive layout, product gallery, and franchise information pages.'
  },
  {
    id: 'crazeespot',
    title: 'Crazeespot',
    category: 'GIFTS & COLLECTIBLES / E-COMMERCE',
    tag: 'gifting e-commerce / miniatures',
    href: 'https://github.com/azhar2006-collab',
    bullets: [
      '> Online store for personalised gifts, miniatures & collectibles',
      '> Product catalog: frames, keychains, caricatures & resin art',
      '> E-commerce with payment gateway & product browsing',
      '> Pan-India delivery with order & enquiry management'
    ],
    image: 'assets/images/crazeespot_live.png',
    techStack: ['HTML5 / CSS3', 'JavaScript (ES6+)', 'Payment Gateway', 'Product Catalog', 'Responsive Design'],
    shortDesc: "An online gifting and miniature collectibles store for Crazeespot (Coimbatore), featuring a personalised product catalog, payment gateway, and pan-India delivery for custom gift items.",
    fullDesc: "Crazeespot is a gifting brand based in Coimbatore, Tamil Nadu, specialising in handcrafted personalised gifts and miniature collectibles. The e-commerce website showcases a wide product range including custom photo frames, polaroids, magic frames, personalised wallets, hand-drawn caricatures, keychains, nameboards, resin art, wood engravings, birthday hampers, baby frames, and corporate gifting items. The platform enables customers to browse products, place orders with a payment gateway, and receive pan-India delivery for all custom merchandise.",
    keyFeatures: [
      'Personalised Product Catalog: Extensive gallery covering photo frames, caricatures, resin art, keychains, and corporate gifting items.',
      'E-Commerce with Payment Gateway: Integrated payment gateway for secure online transactions and order placement.',
      'Product Detail Pages: Individual product pages with images, descriptions, customisation notes, and pricing information.',
      'Pan-India Delivery: Order management supporting nationwide shipping for all personalised and standard gift products.',
      'Corporate Gifting Section: Dedicated section for corporate gift enquiries including standees, trophies, and branded merchandise.',
      'Mobile-Responsive Storefront: Fully responsive layout optimized for browsing and ordering on all devices.'
    ],
    contribution: 'E-commerce frontend development, product catalog pages, payment gateway integration, order enquiry system, and responsive design.'
  },
  {
    id: 'deliheaven',
    title: 'Deliheaven',
    category: 'HOMEMADE PRODUCTS / ONLINE STORE',
    tag: 'homemade products / online store',
    href: 'https://github.com/azhar2006-collab',
    bullets: [
      '> Online platform for showcasing & selling homemade products',
      '> Product catalog with images, descriptions & live pricing',
      '> Online ordering with payment integration at checkout',
      '> Clean, mobile-responsive design with easy navigation'
    ],
    image: 'assets/images/aadhifs_oils.jpg',
    techStack: ['HTML5 / CSS3', 'JavaScript (ES6+)', 'Payment Integration', 'Responsive Design'],
    shortDesc: "A clean, mobile-responsive e-commerce website for Deliheaven showcasing homemade products with a curated catalog, online ordering, and integrated payment functionality.",
    fullDesc: "Deliheaven is an online platform designed for showcasing and selling homemade products directly to customers. The website presents a structured product catalogue featuring product images, descriptions, and pricing in a clean and attractive layout. Customers can browse available products, add items, and proceed to checkout with integrated payment functionality. The site is built with a mobile-first responsive design, ensuring a smooth and pleasant shopping experience across all devices.",
    keyFeatures: [
      'Homemade Product Catalog: Structured product listing with images, names, descriptions, and pricing for all available products.',
      'Online Ordering & Checkout: Customer-facing order flow with a clear checkout process and payment integration.',
      'Payment Integration: Integrated payment gateway enabling secure online transactions at the checkout stage.',
      'Clean & Attractive UI: Minimal, food-brand-friendly design with clear navigation for an enjoyable browsing experience.',
      'Mobile-Responsive Layout: Fully responsive design ensuring the store works seamlessly on smartphones, tablets, and desktops.',
      'Product Detail View: Individual product pages with detailed descriptions and imagery to support purchasing decisions.'
    ],
    contribution: 'Frontend design and development, product catalog, checkout flow, payment integration, and responsive mobile-first layout.'
  },
  {
    id: 'splashcomputer',
    title: 'Splash Computer',
    category: 'COMPUTER SERVICES / BUSINESS WEBSITE',
    tag: 'business website / services',
    href: 'https://github.com/azhar2006-collab',
    bullets: [
      '> Professional website for a computer services business in Chennai',
      '> Services: hardware repair, custom PC builds & performance upgrades',
      '> Service descriptions, business info & contact/enquiry section',
      '> Clean, responsive design to attract & convert customers'
    ],
    image: 'assets/images/ktech.webp',
    techStack: ['HTML5 / Semantic CSS3', 'JavaScript (ES6+)', 'Responsive Design', 'WhatsApp Enquiry'],
    shortDesc: "A professional, responsive business website for Splash Computer (T. Nagar, Chennai) showcasing computer services including hardware repair, custom PC builds, and performance upgrades with a customer enquiry system.",
    fullDesc: "Splash Computer is a computer services business located in T. Nagar, Chennai, specialising in hardware repair, chip-level troubleshooting, custom PC builds, and performance upgrades for gaming, editing, and professional workloads. The business website serves as a professional digital presence to attract and convert customers — presenting detailed service descriptions, business contact information, and an enquiry system for direct customer-to-business communication.",
    keyFeatures: [
      'Service Catalog Presentation: Detailed service pages covering hardware repair, custom PC builds, and performance upgrade offerings.',
      'Business Information Display: Business location (T. Nagar, Chennai), contact numbers, and email prominently presented.',
      'Customer Enquiry System: Contact and enquiry functionality enabling customers to reach the business directly for service requests.',
      'Professional UI Design: Clean, trustworthy design appropriate for a technical services business targeting local and online customers.',
      'Mobile-Responsive Layout: Fully responsive design ensuring accessibility across mobile, tablet, and desktop for all visitors.',
      'WhatsApp Integration: Direct WhatsApp enquiry routing for quick customer-to-business communication on service requests.'
    ],
    contribution: 'Frontend development, service page design, business information layout, enquiry system, and mobile-responsive implementation.'
  }
];

let currentProjectIndex = 0;

/* Synthesize authentic CRT cathode beam switch sound */
function playCrtSwitchSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx || ctx.state === 'suspended') return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(750, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch (e) {
    // audio fallback
  }
}

function initCrtTerminal() {
  const crtScreen = document.getElementById('crtScreen');
  const screenContent = document.getElementById('crtScreenContent');
  const screenNextBtn = document.getElementById('crtScreenNextBtn');
  const detailsBtn = document.getElementById('crtDetailsBtn');
  const crtHint = document.getElementById('crtHint');
  const powerBtn = document.getElementById('crtPowerBtn');
  const toggleGridBtn = document.getElementById('toggleGridBtn');
  const toggleGridText = document.getElementById('toggleGridText');
  const toggleGridArrow = document.getElementById('toggleGridArrow');
  const gridView = document.getElementById('projectsGridView');

  const renderProject = (idx) => {
    const proj = projectsData[idx];
    if (!proj) return;

    const titleEl = document.getElementById('crtProjectTitle');
    const catEl = document.getElementById('crtProjectCategory');
    const counterEl = document.getElementById('crtCounter');
    const bulletsContainer = document.getElementById('crtProjectBullets');

    if (titleEl) titleEl.textContent = proj.title;
    if (catEl) catEl.textContent = proj.category;
    if (counterEl) counterEl.textContent = `${String(idx + 1).padStart(2,'0')} / ${String(projectsData.length).padStart(2,'0')}`;

    if (bulletsContainer) {
      bulletsContainer.innerHTML = proj.bullets.map(b => `<p>${b}</p>`).join('') +
        '<p class="crt-typing-cursor">&gt; _</p>';
    }

    // Highlight active card in grid below
    if (gridView) {
      const cards = gridView.querySelectorAll('.work-card-paper');
      cards.forEach((card, i) => {
        card.classList.toggle('is-active-project', i === idx);
      });
    }
  };

  const changeProject = (delta) => {
    playCrtSwitchSound();
    if (crtHint) crtHint.classList.remove('show');

    if (crtScreen) {
      crtScreen.classList.add('is-glitching');
      setTimeout(() => {
        currentProjectIndex = (currentProjectIndex + delta + projectsData.length) % projectsData.length;
        renderProject(currentProjectIndex);
        crtScreen.classList.remove('is-glitching');
      }, 140);
    } else {
      currentProjectIndex = (currentProjectIndex + delta + projectsData.length) % projectsData.length;
      renderProject(currentProjectIndex);
    }
  };

  // Initial render
  renderProject(0);

  // Auto-appearing tooltip hint ("click next to browse →" matching Maaz)
  if (crtHint) {
    const hintTimer = setTimeout(() => {
      crtHint.classList.add('show');
    }, 1600);
    const hideTimer = setTimeout(() => {
      crtHint.classList.remove('show');
    }, 4600);
  }

  // Next Arrow Button
  if (screenNextBtn) {
    screenNextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      changeProject(1);
    });
  }

  // Clicking CRT Screen itself opens deep technical modal inspector
  if (crtScreen) {
    crtScreen.addEventListener('click', (e) => {
      // Don't trigger if clicked next button
      if (e.target.closest('#crtScreenNextBtn')) return;
      playClickSound();
      openProjectModal(projectsData[currentProjectIndex]);
    });
  }

  // Below screen "SPECS & ARCH" button
  if (detailsBtn) {
    detailsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      playClickSound();
      openProjectModal(projectsData[currentProjectIndex]);
    });
  }

  // CRT Power toggle switch (Advanced feature)
  if (powerBtn && crtScreen) {
    powerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      playRetroBeep(320, 0.08);
      const isOff = crtScreen.classList.toggle('power-off');
      powerBtn.setAttribute('title', isOff ? 'Terminal STANDBY — Click to power on' : 'Terminal ONLINE — Click to toggle CRT power');
    });
  }

  // Keyboard navigation when browsing work section
  window.addEventListener('keydown', (e) => {
    const projectsSec = document.getElementById('projects');
    if (!projectsSec) return;
    const rect = projectsSec.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
    if (isVisible) {
      if (e.key === 'ArrowRight') {
        changeProject(1);
      } else if (e.key === 'ArrowLeft') {
        changeProject(-1);
      }
    }
  });

  // Mobile Touch Swipe detection on CRT screen
  if (crtScreen) {
    let touchStartX = 0;
    let touchEndX = 0;
    crtScreen.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    crtScreen.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const swipeDiff = touchEndX - touchStartX;
      if (Math.abs(swipeDiff) > 45) {
        if (swipeDiff < 0) {
          changeProject(1); // Swipe left -> Next
        } else {
          changeProject(-1); // Swipe right -> Prev
        }
      }
    }, { passive: true });
  }

  // Toggle Grid View Pill Button ("SEE ALL PROJECTS" / "HIDE ALL PROJECTS")
  if (toggleGridBtn && gridView) {
    toggleGridBtn.addEventListener('click', () => {
      playClickSound();
      const isOpen = gridView.classList.toggle('active');
      toggleGridBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      if (toggleGridText) {
        toggleGridText.textContent = isOpen ? 'HIDE ALL PROJECTS' : 'SEE ALL PROJECTS';
      }
      if (toggleGridArrow) {
        toggleGridArrow.classList.toggle('is-open', isOpen);
      }
    });
  }
}

// Advanced Feature: Beam project directly to CRT monitor above
window.beamProjectToCrt = function(idx) {
  if (idx < 0 || idx >= projectsData.length) return;
  playCrtSwitchSound();
  currentProjectIndex = idx;
  const crtScreen = document.getElementById('crtScreen');
  if (crtScreen) {
    crtScreen.classList.add('is-glitching');
    setTimeout(() => {
      const titleEl = document.getElementById('crtProjectTitle');
      const catEl = document.getElementById('crtProjectCategory');
      const counterEl = document.getElementById('crtCounter');
      const bulletsContainer = document.getElementById('crtProjectBullets');
      const proj = projectsData[idx];

      if (titleEl) titleEl.textContent = proj.title;
      if (catEl) catEl.textContent = proj.category;
      if (counterEl) counterEl.textContent = `${String(idx + 1).padStart(2,'0')} / ${String(projectsData.length).padStart(2,'0')}`;
      if (bulletsContainer) {
        bulletsContainer.innerHTML = proj.bullets.map(b => `<p>${b}</p>`).join('') +
          '<p class="crt-typing-cursor">&gt; _</p>';
      }
      const gridView = document.getElementById('projectsGridView');
      if (gridView) {
        const cards = gridView.querySelectorAll('.work-card-paper');
        cards.forEach((card, i) => {
          card.classList.toggle('is-active-project', i === idx);
        });
      }
      crtScreen.classList.remove('is-glitching');
    }, 140);

    // Smooth scroll back to monitor
    crtScreen.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
};

function openProjectModal(project) {
  const modal = document.getElementById('projectModal');
  if (!modal) return;

  document.getElementById('modalProjectTitle').textContent = project.title;
  document.getElementById('modalProjectCategory').textContent = project.category;
  document.getElementById('modalProjectDesc').textContent = project.fullDesc;
  document.getElementById('modalProjectImg').src = project.image;
  document.getElementById('modalProjectImg').alt = `${project.title} live interface preview`;

  const featuresContainer = document.getElementById('modalProjectFeatures');
  if (featuresContainer && project.keyFeatures) {
    featuresContainer.innerHTML = project.keyFeatures.map(feat => {
      const parts = feat.split(': ');
      if (parts.length > 1) {
        return `<div style="display:flex; gap:10px; align-items:flex-start;">
          <span style="color:var(--primary); font-weight:bold; flex-shrink:0;">✓</span>
          <div><strong style="color:var(--chalk);">${parts[0]}:</strong> ${parts.slice(1).join(': ')}</div>
        </div>`;
      }
      return `<div style="display:flex; gap:10px; align-items:flex-start;">
        <span style="color:var(--primary); font-weight:bold; flex-shrink:0;">✓</span>
        <div>${feat}</div>
      </div>`;
    }).join('');
  }

  const techContainer = document.getElementById('modalProjectTech');
  if (techContainer && project.techStack) {
    techContainer.innerHTML = project.techStack.map(t => 
      `<span class="tag-tech-badge">${t}</span>`
    ).join('');
  }

  const contributionEl = document.getElementById('modalProjectContribution');
  if (contributionEl && project.contribution) {
    contributionEl.textContent = project.contribution;
  }

  modal.classList.add('active');
}

// Global modal launcher from grid card buttons
window.openProjectModalByIndex = function(idx) {
  playClickSound();
  if (projectsData[idx]) {
    openProjectModal(projectsData[idx]);
  }
};

/* ==========================================================================
   5B. VERIFIED CREDENTIALS INDEX CONSOLE (Screenshot 2)
   ========================================================================== */
const certificationsData = [
  {
    id: 'aws-saa',
    category: 'cloud',
    cardNum: '001',
    title: 'AWS SOLUTIONS ARCHITECT',
    issuer: 'Amazon Web Services',
    domain: 'Cloud Architecture',
    level: 'Professional',
    credentialId: 'AWS-SAA-PRO-2023',
    issuedOn: '12 NOV 2023',
    iconSvg: `<svg viewBox="0 0 90 50" class="w-18 h-12" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M22 30 C22 23 27 18 35 18 C38 13 46 12 52 16 C58 14 66 18 67 24 C72 26 73 33 68 37 C64 40 28 40 22 30 Z" stroke-width="2" />
      <text x="35" y="28" font-family="monospace" font-size="11" font-weight="bold" fill="currentColor" stroke="none">AWS</text>
      <path d="M33 33 Q45 38 57 33" stroke-width="2" stroke-linecap="round"/>
      <path d="M55 31 L58 33 L55 35" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
  },
  {
    id: 'fullstack-101',
    category: 'cloud',
    cardNum: '002',
    title: 'FULL-STACK DEVELOPMENT 101',
    issuer: 'Simplilearn SkillUp',
    domain: 'Full-Stack Web Engineering & React',
    level: 'Professional',
    credentialId: '8681019',
    issuedOn: 'JULY 2025',
    iconSvg: `<svg viewBox="0 0 90 50" class="w-18 h-12" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="20" y="10" width="50" height="30" rx="3" stroke-width="2"/>
      <path d="M28 25 L34 20 M28 25 L34 30 M42 25 L38 20 M42 25 L38 30" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="50" y1="28" x2="62" y2="28" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: 'cyber-sim',
    category: 'sap',
    cardNum: '003',
    title: 'CYBER JOB SIMULATION',
    issuer: 'Deloitte (Forage)',
    domain: 'Cyber Security & Threat Analysis',
    level: 'Job Simulation',
    credentialId: 'tnNM2ApNPMQL50fw',
    issuedOn: 'AUGUST 2025',
    iconSvg: `<svg viewBox="0 0 90 50" class="w-18 h-12" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M45 10 L68 18 C68 30 57 40 45 44 C33 40 22 30 22 18 Z" stroke-width="2"/>
      <circle cx="45" cy="24" r="4"/>
      <line x1="45" y1="28" x2="45" y2="34" stroke-width="2.2" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: 'intro-web',
    category: 'cloud',
    cardNum: '004',
    title: 'INTRODUCTION TO WEB DEV',
    issuer: 'LearnTube',
    domain: 'Frontend Engineering & Web Standards',
    level: 'Foundational',
    credentialId: 'INT-M-2-3705-1066795',
    issuedOn: 'AUGUST 2025',
    iconSvg: `<svg viewBox="0 0 90 50" class="w-18 h-12" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="18" y="12" width="54" height="28" rx="4" stroke-width="2"/>
      <line x1="18" y1="20" x2="72" y2="20" stroke-width="1.5"/>
      <circle cx="24" cy="16" r="1.5" fill="currentColor"/>
      <circle cx="29" cy="16" r="1.5" fill="currentColor"/>
      <circle cx="34" cy="16" r="1.5" fill="currentColor"/>
    </svg>`
  },
  {
    id: 'powerbi-workshop',
    category: 'data',
    cardNum: '005',
    title: 'POWERBI WORKSHOP',
    issuer: 'OfficeMaster',
    domain: 'AI-Powered Dashboards & Business KPIs',
    level: 'Applied Analytics & BI',
    credentialId: 'OM-PBI-2025',
    issuedOn: 'AUGUST 2025',
    iconSvg: `<svg viewBox="0 0 90 50" class="w-18 h-12" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="22" y="24" width="8" height="16" rx="1"/>
      <rect x="36" y="18" width="8" height="22" rx="1"/>
      <rect x="50" y="12" width="8" height="28" rx="1"/>
      <path d="M64 16 L64 40" stroke-width="2" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: 'bigdata-infosys',
    category: 'data',
    cardNum: '006',
    title: 'BIG DATA 101 & 301',
    issuer: 'Infosys Springboard',
    domain: 'Big Data Architecture & Processing',
    level: 'Advanced (101 & 301)',
    credentialId: 'INF-BD-101-301',
    issuedOn: 'NOVEMBER 2025',
    iconSvg: `<svg viewBox="0 0 90 50" class="w-18 h-12" fill="none" stroke="currentColor" stroke-width="2">
      <ellipse cx="45" cy="15" rx="22" ry="7"/>
      <path d="M23 15 v10 c0 3.8 9.8 7 22 7 s22 -3.2 22 -7 v-10"/>
      <path d="M23 25 v10 c0 3.8 9.8 7 22 7 s22 -3.2 22 -7 v-10"/>
    </svg>`
  },
  {
    id: 'it-arch-bcg',
    category: 'sap',
    cardNum: '007',
    title: 'IT ARCHITECTURE SIMULATION',
    issuer: 'BCG Platinion (Forage)',
    domain: 'Future-Ready Enterprise Systems',
    level: 'Architecture Simulation',
    credentialId: 'BCG-PLAT-2025',
    issuedOn: 'DECEMBER 2025',
    iconSvg: `<svg viewBox="0 0 90 50" class="w-18 h-12" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="18" y="10" width="18" height="14" rx="2"/>
      <rect x="54" y="10" width="18" height="14" rx="2"/>
      <rect x="36" y="30" width="18" height="14" rx="2"/>
      <path d="M27 24 v6 h36 v-6 M45 30 v-6" stroke-width="1.8"/>
    </svg>`
  },
  {
    id: 'tech-sim-deloitte',
    category: 'sap',
    cardNum: '008',
    title: 'TECHNOLOGY JOB SIMULATION',
    issuer: 'Deloitte (Forage)',
    domain: 'Coding & Enterprise Software',
    level: 'Technology Simulation',
    credentialId: 'DEL-TECH-2025',
    issuedOn: 'DECEMBER 2025',
    iconSvg: `<svg viewBox="0 0 90 50" class="w-18 h-12" fill="none" stroke="currentColor" stroke-width="2">
      <polygon points="45,10 68,22 68,38 45,46 22,38 22,22"/>
      <line x1="22" y1="22" x2="45" y2="34"/>
      <line x1="68" y1="22" x2="45" y2="34"/>
      <line x1="45" y1="34" x2="45" y2="46"/>
    </svg>`
  },
  {
    id: 'ms-sql-ai',
    category: 'ai',
    cardNum: '009',
    title: 'MICROSOFT SQL AI DEVELOPER',
    issuer: 'Microsoft',
    domain: 'SQL AI Engineering & Vector DB',
    level: 'Advanced',
    credentialId: 'MS-SQL-AI-2025',
    issuedOn: '02 FEB 2025',
    iconSvg: `<svg viewBox="0 0 90 50" class="w-18 h-12" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="15" y="10" width="26" height="13"/>
      <rect x="45" y="10" width="26" height="13"/>
      <rect x="15" y="27" width="26" height="13"/>
      <rect x="45" y="27" width="26" height="13"/>
    </svg>`
  },
  {
    id: 'anthropic-claude',
    category: 'ai',
    cardNum: '010',
    title: 'ANTHROPIC CLAUDE ARCHITECT',
    issuer: 'Anthropic',
    domain: 'Prompt Engineering & Tool Calling',
    level: 'Professional',
    credentialId: 'ANT-CLAUDE-9842',
    issuedOn: '15 JAN 2025',
    iconSvg: `<svg viewBox="0 0 90 50" class="w-18 h-12" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="35" cy="25" r="14"/>
      <circle cx="55" cy="25" r="14"/>
      <line x1="35" y1="25" x2="55" y2="25"/>
    </svg>`
  },
  {
    id: 'openai-codex',
    category: 'ai',
    cardNum: '011',
    title: 'OPENAI GENERATIVE AI SPECIALIST',
    issuer: 'OpenAI / Codex Challenge',
    domain: 'Autonomous Agents & LLM RAG',
    level: 'Top 30% Finalist',
    credentialId: 'OAI-CODEX-2024',
    issuedOn: '12 NOV 2024',
    iconSvg: `<svg viewBox="0 0 90 50" class="w-18 h-12" fill="none" stroke="currentColor" stroke-width="2">
      <polygon points="45,10 65,22 65,40 45,48 25,40 25,22"/>
      <circle cx="45" cy="28" r="6"/>
    </svg>`
  },
  {
    id: 'sap-bpa',
    category: 'sap',
    cardNum: '012',
    title: 'SAP BUILD PROCESS AUTOMATION',
    issuer: 'SAP SE',
    domain: 'Enterprise BTP Workflows & RPA',
    level: 'Associate Consultant',
    credentialId: 'SAP-BPA-7721',
    issuedOn: '20 OCT 2024',
    iconSvg: `<svg viewBox="0 0 90 50" class="w-18 h-12" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M20 35 L45 15 L70 35 Z"/>
      <circle cx="45" cy="28" r="4"/>
    </svg>`
  }
];

let activeCertCategory = 'all';
let activeCertIndex = 0;

function initCertificationsConsole() {
  const tabs = document.querySelectorAll('.cert-tab-btn');
  const prevBtn = document.getElementById('certPrevBtn');
  const nextBtn = document.getElementById('certNextBtn');
  const ticket = document.getElementById('certPunchcardTicket');
  if (!ticket) return;

  const getFilteredCerts = () => {
    if (activeCertCategory === 'all') return certificationsData;
    return certificationsData.filter(c => c.category === activeCertCategory);
  };

  const renderCertCard = (idx) => {
    const list = getFilteredCerts();
    if (!list.length) return;
    const cert = list[idx % list.length];

    const cardNumEl = document.getElementById('certCardNumber');
    const titleEl = document.getElementById('certTicketTitle');
    const issuerEl = document.getElementById('certIssuer');
    const domainEl = document.getElementById('certDomain');
    const levelEl = document.getElementById('certLevel');
    const credIdEl = document.getElementById('certCredId');
    const issuedOnEl = document.getElementById('certIssuedOn');
    const domainIconEl = document.getElementById('certDomainIcon');
    const activeIdxEl = document.getElementById('certActiveIndex');
    const totalCountEl = document.getElementById('certTotalCount');

    if (cardNumEl) cardNumEl.textContent = cert.cardNum;
    if (titleEl) titleEl.textContent = cert.title;
    if (issuerEl) issuerEl.textContent = `: ${cert.issuer}`;
    if (domainEl) domainEl.textContent = `: ${cert.domain}`;
    if (levelEl) levelEl.textContent = `: ${cert.level}`;
    if (credIdEl) credIdEl.textContent = `: ${cert.credentialId}`;
    if (issuedOnEl) issuedOnEl.textContent = `: ${cert.issuedOn}`;
    if (domainIconEl && cert.iconSvg) domainIconEl.innerHTML = cert.iconSvg;

    if (activeIdxEl) activeIdxEl.textContent = (idx % list.length) + 1;
    if (totalCountEl) totalCountEl.textContent = list.length;
  };

  const cycleCert = (delta) => {
    playRetroBeep(delta > 0 ? 560 : 420, 0.05);
    const list = getFilteredCerts();
    if (!list.length) return;
    activeCertIndex = (activeCertIndex + delta + list.length) % list.length;
    
    // Quick paper cycle feedback
    ticket.style.transform = 'translateY(-4px) scale(0.995)';
    setTimeout(() => {
      ticket.style.transform = '';
      renderCertCard(activeCertIndex);
    }, 90);
  };

  // Category Tabs (ALL, SAP, CLOUD, AI, DATA)
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      playClickSound();
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeCertCategory = tab.getAttribute('data-cert-cat') || 'all';
      activeCertIndex = 0;
      renderCertCard(0);
    });
  });

  if (prevBtn) {
    prevBtn.addEventListener('click', () => cycleCert(-1));
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => cycleCert(1));
  }

  ticket.addEventListener('click', () => cycleCert(1));

  // Initialize with ALL category (matching uploaded screenshot: CARD 1 OF 12)
  renderCertCard(0);
}

/* ==========================================================================
   6. SKILLS ROLODEX PUNCHED CARD
   ========================================================================== */
const skillsData = {
  all: [
    'React.js', 'Python & Django',
    'Node.js & Express', 'RESTful APIs',
    'JavaScript (ES6+)', 'Firebase & GCP',
    'MongoDB & SQL', 'HTML5 & Modern CSS3',
    'Git & GitHub', 'PowerBI Dashboards'
  ],
  frontend: [
    'React.js', 'JavaScript (ES6+)',
    'HTML5 & Modern CSS3', 'Responsive Design',
    'UI/UX Design', 'DOM Manipulation'
  ],
  backend: [
    'Python & Django', 'Flask Framework',
    'Node.js Runtime', 'Express.js Framework',
    'RESTful APIs', 'Server-Side Logic'
  ],
  database: [
    'Firebase Firestore', 'Realtime Database',
    'MongoDB (NoSQL)', 'PostgreSQL & SQL',
    'MySQL Database', 'SQLite Storage'
  ],
  tools: [
    'Git & GitHub', 'Vercel & Render',
    'Docker (Basics)', 'PowerBI Analytics',
    'VS Code Environment', 'Agile & Scrum'
  ]
};

function initSkillsRolodex() {
  const tabs = document.querySelectorAll('.rolodex-tab-btn');
  const container = document.getElementById('cardSkillsGrid');
  const title = document.getElementById('punchedCardTitle');
  if (!container) return;

  const renderCategory = (category) => {
    const list = skillsData[category] || skillsData.all;
    container.innerHTML = list.map(skill => `
      <div class="skill-row-item">
        <span class="skill-bullet">•</span>
        <span>${skill}</span>
      </div>
    `).join('');
    if (title) {
      title.textContent = `STACK INDEX // ${category.toUpperCase()}`;
    }
  };

  renderCategory('all');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      playClickSound();
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const cat = tab.getAttribute('data-cat');
      renderCategory(cat);
    });
  });
}

/* ==========================================================================
   7. RETRO HANDHELD GAME CONSOLE & PLAYABLE ARCADE
   ========================================================================== */
let gameInterval = null;
let currentGameMode = 'snake'; // 'snake' (default first) or 'memory'
let activeRomIdx = 0; // Default to Retro Snake Game (active first!)

// Snake Game State
let snake = [];
let food = { x: 5, y: 5 };
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let snakeScore = 0;
let snakeHiScore = 0;
let isGameRunning = false;
const GRID_SIZE = 14;
let canvasCtx = null;
let gameCanvas = null;

// Traffic racer state (shared canvas and timer with the Snake cartridge)
let trafficLane = 1;
let trafficCars = [];
let trafficScore = 0;
let trafficBest = 0;
let trafficSpeed = 4;
let trafficSpeedControl = 0;
let trafficSpawnTick = 0;
let trafficRoadOffset = 0;
let trafficGameOver = false;

const consoleRomCartridges = [
  {
    idx: 0,
    type: 'snake',
    romCode: 'RETRO SNAKE ARCADE.ROM',
    subLabel: '• PLAYABLE ARCADE',
    title: 'RETRO SNAKE ARCADE',
    tagline: 'D-PAD / ARROWS TO SLITHER · [A] TO ADVANCE'
  },
  {
    idx: 1,
    type: 'traffic',
    romCode: 'THOR TRAFFIC RUNNER.ROM',
    subLabel: '• PLAYABLE ARCADE',
    title: 'THOR TRAFFIC RUNNER',
    tagline: '← → STEER · ↑ BOOST · ↓ BRAKE · [A] RETRY'
  },
  {
    idx: 2,
    type: 'memory',
    romCode: 'BATTLESTATION RIG.ROM',
    subLabel: '• DEV & GAMING RIG',
    title: 'RGB BATTLESTATION SETUP',
    tagline: 'DEV RIG · Custom Mechanical Keyboard & Performance Battlestation',
    image: 'assets/images/memory-1-battlestation.jpg'
  },
  {
    idx: 3,
    type: 'memory',
    romCode: 'MISTY MOUNTAIN TRAILS.ROM',
    subLabel: '• MOUNTAIN ODYSSEY',
    title: 'MISTY MOUNTAIN TRAILS',
    tagline: 'WESTERN GHATS · Road Trips, Mountain Passes & Weekend Rides',
    image: 'assets/images/memory-2-mountain.png'
  },
  {
    idx: 4,
    type: 'memory',
    romCode: 'GOLDEN SUNSET HORIZON.ROM',
    subLabel: '• COASTAL HORIZONS',
    title: 'GOLDEN SUNSET HORIZON',
    tagline: 'COASTAL SERENITY · Evening Waves, Golden Hour & Life Reflections',
    image: 'assets/images/memory-3-sunset-beach.png'
  },
  {
    idx: 5,
    type: 'memory',
    romCode: 'FEATHERS NIGHT RETREAT.ROM',
    subLabel: '• CHENNAI RETREAT',
    title: 'FEATHERS LUXURY RETREAT',
    tagline: 'RADHA HOTEL · Executive Celebrations & Modern Architectural Elegance',
    image: 'assets/images/memory-4-feathers-hotel.png'
  }
];

function initRetroConsole() {
  const cartridgeBtns = document.querySelectorAll('.rom-cartridge-btn');
  const memoryImg = document.getElementById('consoleMemoryImg');
  const captionTitle = document.getElementById('consoleCaptionTitle');
  const captionTagline = document.getElementById('consoleCaptionTagline');
  const screenDisplay = document.getElementById('consoleScreenDisplay');
  gameCanvas = document.getElementById('retroGameCanvas');

  if (gameCanvas) {
    canvasCtx = gameCanvas.getContext('2d');
  }

  // Buttons & D-Pad
  const btnA = document.getElementById('gameboyBtnA');
  const btnB = document.getElementById('gameboyBtnB');
  const btnStart = document.getElementById('consoleBtnStart');
  const btnSelect = document.getElementById('consoleBtnSelect');
  const dpadUp = document.getElementById('dpadUp');
  const dpadDown = document.getElementById('dpadDown');
  const dpadLeft = document.getElementById('dpadLeft');
  const dpadRight = document.getElementById('dpadRight');
  const setPadLabels = (mode) => {
    if (dpadLeft) dpadLeft.setAttribute('aria-label', mode === 'traffic' ? 'Steer car left' : 'Move left or previous memory');
    if (dpadRight) dpadRight.setAttribute('aria-label', mode === 'traffic' ? 'Steer car right' : 'Move right or next memory');
    if (dpadUp) dpadUp.setAttribute('aria-label', mode === 'traffic' ? 'Accelerate' : 'Move up or next memory');
    if (dpadDown) dpadDown.setAttribute('aria-label', mode === 'traffic' ? 'Brake' : 'Move down or previous memory');
  };

  const renderCartridge = (idx) => {
    const item = consoleRomCartridges[idx % consoleRomCartridges.length];
    if (!item) return;

    activeRomIdx = idx % consoleRomCartridges.length;

    if (btnA) btnA.setAttribute('aria-label', item.type === 'traffic' ? 'Restart traffic racer (Button A)' : 'Next game or memory (Button A)');
    if (screenDisplay) {
      screenDisplay.classList.toggle('game-active', item.type === 'snake' || item.type === 'traffic');
    }

    // Update active cartridge highlight (with green neon tabs)
    cartridgeBtns.forEach(btn => {
      const btnIdx = parseInt(btn.getAttribute('data-rom-idx'), 10);
      if (btnIdx === activeRomIdx) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    if (item.type === 'snake') {
      currentGameMode = 'snake';
      setPadLabels('snake');
      if (memoryImg) memoryImg.style.display = 'none';
      if (gameCanvas) gameCanvas.style.display = 'block';

      if (captionTitle) captionTitle.textContent = item.title;
      if (captionTagline) captionTagline.textContent = `D-PAD / ARROWS TO SLITHER · [A] NEXT MEMORY`;

      startSnakeGame();
    } else if (item.type === 'traffic') {
      stopSnakeGame();
      currentGameMode = 'traffic';
      setPadLabels('traffic');
      if (memoryImg) memoryImg.style.display = 'none';
      if (gameCanvas) gameCanvas.style.display = 'block';
      if (captionTitle) captionTitle.textContent = item.title;
      if (captionTagline) captionTagline.textContent = item.tagline;
      startTrafficGame();
    } else {
      currentGameMode = 'memory';
      setPadLabels('memory');
      stopSnakeGame();

      if (gameCanvas) gameCanvas.style.display = 'none';
      if (memoryImg) {
        memoryImg.style.display = 'block';
        memoryImg.style.opacity = '0.3';
        memoryImg.src = item.image;
        memoryImg.alt = `${item.title} photograph`;
        setTimeout(() => {
          memoryImg.style.opacity = '1';
        }, 80);
      }

      if (captionTitle) captionTitle.textContent = item.title;
      if (captionTagline) captionTagline.textContent = item.tagline;
    }
  };

  const cycleCartridge = (delta) => {
    playRetroBeep(delta > 0 ? 760 : 480, 0.06);
    const nextIdx = (activeRomIdx + delta + consoleRomCartridges.length) % consoleRomCartridges.length;
    renderCartridge(nextIdx);
  };

  // Steer the active arcade game or browse cartridges in memory mode.
  const handleDirection = (dx, dy) => {
    playRetroBeep(520, 0.04);
    if (currentGameMode === 'snake') {
      if (!isGameRunning) {
        startSnakeGame();
        return;
      }
      if (dx !== 0 && direction.x === 0) nextDirection = { x: dx, y: 0 };
      if (dy !== 0 && direction.y === 0) nextDirection = { x: 0, y: dy };
    } else if (currentGameMode === 'traffic') {
      if (!isGameRunning) return;
      if (dx < 0) trafficLane = Math.max(0, trafficLane - 1);
      if (dx > 0) trafficLane = Math.min(2, trafficLane + 1);
      if (dy < 0) trafficSpeedControl = Math.min(1.2, trafficSpeedControl + 0.35);
      if (dy > 0) trafficSpeedControl = Math.max(-1.4, trafficSpeedControl - 0.35);
    } else {
      cycleCartridge(dy < 0 || dx > 0 ? 1 : -1);
    }
  };

  // D-Pad Click Listeners
  if (dpadUp) dpadUp.addEventListener('click', () => handleDirection(0, -1));
  if (dpadDown) dpadDown.addEventListener('click', () => handleDirection(0, 1));
  if (dpadLeft) dpadLeft.addEventListener('click', () => handleDirection(-1, 0));
  if (dpadRight) dpadRight.addEventListener('click', () => handleDirection(1, 0));

  // Physical Keyboard Listener (Arrow keys + WASD)
  window.addEventListener('keydown', (e) => {
    const arcadeSection = document.getElementById('arcade');
    if (!arcadeSection) return;

    // Check if arcade is roughly in view
    const rect = arcadeSection.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;

    if (inView) {
      if (currentGameMode === 'snake' || currentGameMode === 'traffic') {
        if (['ArrowUp', 'KeyW'].includes(e.code)) {
          e.preventDefault();
          handleDirection(0, -1);
        } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
          e.preventDefault();
          handleDirection(0, 1);
        } else if (['ArrowLeft', 'KeyA'].includes(e.code)) {
          e.preventDefault();
          handleDirection(-1, 0);
        } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
          e.preventDefault();
          handleDirection(1, 0);
        } else if (e.code === 'Space' || e.code === 'Enter') {
          e.preventDefault();
          if (!isGameRunning) {
            if (currentGameMode === 'traffic') startTrafficGame();
            else startSnakeGame();
          }
        }
      }
    }
  });

  // Button A restarts the racer; otherwise A and B browse the cartridge rack.
  if (btnA) {
    btnA.addEventListener('click', () => {
      playRetroBeep(880, 0.08);
      if (currentGameMode === 'traffic') {
        startTrafficGame();
        return;
      }
      // Cycle through the games and memory cartridges.
      cycleCartridge(1);
    });
  }

  if (btnB) {
    btnB.addEventListener('click', () => {
      playRetroBeep(640, 0.08);
      // Button B cycles backwards
      cycleCartridge(-1);
    });
  }

  // Start & Select buttons
  if (btnStart) {
    btnStart.addEventListener('click', () => {
      playRetroBeep(920, 0.1);
      const chassis = document.querySelector('.gameboy-console-chassis');
      const pingDot = document.querySelector('.power-ping-dot');
      if (chassis) chassis.classList.toggle('power-boost');
      if (pingDot) pingDot.classList.toggle('power-boost');

      if (currentGameMode === 'snake') {
        if (!isGameRunning) {
          startSnakeGame();
        } else {
          isGameRunning = false;
          if (gameInterval) clearInterval(gameInterval);
          drawPauseScreen();
        }
      } else if (currentGameMode === 'traffic') {
        if (trafficGameOver) {
          startTrafficGame();
        } else if (!isGameRunning) {
          isGameRunning = true;
          gameInterval = setInterval(trafficGameLoop, 50);
        } else {
          isGameRunning = false;
          if (gameInterval) clearInterval(gameInterval);
          drawTrafficPause();
        }
      }
    });
  }

  if (btnSelect) {
    btnSelect.addEventListener('click', () => {
      playRetroBeep(640, 0.08);
      cycleCartridge(1);
    });
  }

  // Cartridge rack click handlers
  cartridgeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      playRetroBeep(720, 0.07);
      const clickedIdx = parseInt(btn.getAttribute('data-rom-idx'), 10);
      if (!isNaN(clickedIdx)) {
        renderCartridge(clickedIdx);
      }
    });
  });

  // Screen click
  if (screenDisplay) {
    screenDisplay.addEventListener('click', () => {
      if (currentGameMode === 'snake') {
        if (!isGameRunning) startSnakeGame();
      } else if (currentGameMode === 'traffic') {
        if (!isGameRunning) {
          if (trafficGameOver) startTrafficGame();
          else {
            isGameRunning = true;
            gameInterval = setInterval(trafficGameLoop, 50);
          }
        }
      } else {
        cycleCartridge(1);
      }
    });
  }

  // INITIALIZE WITH SNAKE GAME FIRST (ROM 0)
  renderCartridge(0);
}

/* ==========================================================================
   PLAYABLE RETRO SNAKE ARCADE GAME ENGINE
   ========================================================================== */
function startSnakeGame() {
  snake = [
    { x: 8, y: 7 },
    { x: 7, y: 7 },
    { x: 6, y: 7 },
    { x: 5, y: 7 }
  ];
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  snakeScore = 0;
  isGameRunning = true;
  placeFood();

  if (gameInterval) clearInterval(gameInterval);
  gameInterval = setInterval(gameLoop, 125);
  drawSnakeGame();
}

function stopSnakeGame() {
  isGameRunning = false;
  if (gameInterval) clearInterval(gameInterval);
}

function startTrafficGame() {
  trafficLane = 1;
  trafficCars = [];
  trafficScore = 0;
  trafficSpeed = 4;
  trafficSpeedControl = 0;
  trafficSpawnTick = 0;
  trafficRoadOffset = 0;
  trafficGameOver = false;
  isGameRunning = true;
  if (gameInterval) clearInterval(gameInterval);
  gameInterval = setInterval(trafficGameLoop, 50);
  drawTrafficGame();
}

function trafficGameLoop() {
  if (!isGameRunning || !canvasCtx) return;

  trafficSpeed = Math.min(7.2, Math.max(2.6, 4 + Math.floor(trafficScore / 45) * 0.25 + trafficSpeedControl));
  trafficRoadOffset = (trafficRoadOffset + trafficSpeed) % 40;
  trafficScore += trafficSpeed / 20;
  trafficSpawnTick += 1;

  const spawnEvery = Math.max(17, 31 - Math.floor(trafficScore / 45));
  if (trafficSpawnTick >= spawnEvery) {
    trafficSpawnTick = 0;
    const lastLane = trafficCars.length ? trafficCars[trafficCars.length - 1].lane : -1;
    const availableLanes = [0, 1, 2].filter(lane => lane !== lastLane);
    trafficCars.push({
      lane: availableLanes[Math.floor(Math.random() * availableLanes.length)],
      y: -42,
      color: ['#ef476f', '#ffd166', '#8b8cff', '#f4f1de'][Math.floor(Math.random() * 4)]
    });
  }

  trafficCars.forEach(car => { car.y += trafficSpeed; });
  trafficCars = trafficCars.filter(car => car.y < 205);

  const playerY = 146;
  const hit = trafficCars.some(car => car.lane === trafficLane && car.y < playerY + 44 && car.y + 36 > playerY);
  if (hit) {
    isGameRunning = false;
    trafficGameOver = true;
    if (gameInterval) clearInterval(gameInterval);
    trafficBest = Math.max(trafficBest, Math.floor(trafficScore));
    playRetroBeep(180, 0.28);
    drawTrafficGameOver();
    return;
  }

  drawTrafficGame();
}

function drawTrafficCar(centerX, y, color, isPlayer = false) {
  if (isPlayer) {
    drawF1Player(centerX, y);
    return;
  }

  const left = centerX - 12;
  canvasCtx.fillStyle = '#071210';
  canvasCtx.fillRect(left - 3, y + 7, 5, 13);
  canvasCtx.fillRect(left + 22, y + 7, 5, 13);
  canvasCtx.fillRect(left - 3, y + 25, 5, 11);
  canvasCtx.fillRect(left + 22, y + 25, 5, 11);
  canvasCtx.fillStyle = color;
  canvasCtx.fillRect(left, y + 2, 24, 34);
  canvasCtx.fillRect(left + 3, y, 18, 7);
  canvasCtx.fillStyle = '#d9f3f0';
  canvasCtx.fillRect(left + 4, y + 8, 16, 8);
  canvasCtx.fillStyle = '#102322';
  canvasCtx.fillRect(left + 5, y + 18, 14, 7);
  canvasCtx.fillStyle = '#fff0b3';
  canvasCtx.fillRect(left + 2, y + 30, 5, 3);
  canvasCtx.fillRect(left + 17, y + 30, 5, 3);
}

function drawF1Player(centerX, y) {
  const ctx = canvasCtx;
  const x = centerX;

  // A compact top-down formula-car silhouette: wings, slicks, sidepods, and halo.
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.fillRect(x - 19, y + 5, 38, 40);

  // Carbon wings and red end plates.
  ctx.fillStyle = '#101a19';
  ctx.fillRect(x - 21, y + 11, 42, 4);
  ctx.fillRect(x - 18, y + 38, 36, 5);
  ctx.fillRect(x - 21, y + 8, 3, 8);
  ctx.fillRect(x + 18, y + 8, 3, 8);
  ctx.fillRect(x - 19, y + 37, 3, 8);
  ctx.fillRect(x + 16, y + 37, 3, 8);
  ctx.fillStyle = '#ff3347';
  ctx.fillRect(x - 20, y + 12, 3, 2);
  ctx.fillRect(x + 17, y + 12, 3, 2);

  // Four exposed slick tyres with sidewall highlights.
  ctx.fillStyle = '#090d0d';
  ctx.fillRect(x - 16, y + 10, 7, 13);
  ctx.fillRect(x + 9, y + 10, 7, 13);
  ctx.fillRect(x - 17, y + 30, 8, 14);
  ctx.fillRect(x + 9, y + 30, 8, 14);
  ctx.fillStyle = '#66716d';
  ctx.fillRect(x - 15, y + 12, 1, 8);
  ctx.fillRect(x + 14, y + 12, 1, 8);
  ctx.fillRect(x - 16, y + 33, 1, 8);
  ctx.fillRect(x + 15, y + 33, 1, 8);

  // Sculpted scarlet monocoque narrowing from engine cover to the pointed nose.
  const bodyGradient = ctx.createLinearGradient(x - 10, 0, x + 10, 0);
  bodyGradient.addColorStop(0, '#a20f23');
  bodyGradient.addColorStop(0.48, '#ff4052');
  bodyGradient.addColorStop(1, '#a20f23');
  ctx.fillStyle = bodyGradient;
  ctx.beginPath();
  ctx.moveTo(x, y + 1);
  ctx.lineTo(x + 3, y + 8);
  ctx.lineTo(x + 5, y + 16);
  ctx.lineTo(x + 9, y + 21);
  ctx.lineTo(x + 8, y + 31);
  ctx.lineTo(x + 5, y + 38);
  ctx.lineTo(x - 5, y + 38);
  ctx.lineTo(x - 8, y + 31);
  ctx.lineTo(x - 9, y + 21);
  ctx.lineTo(x - 5, y + 16);
  ctx.lineTo(x - 3, y + 8);
  ctx.closePath();
  ctx.fill();

  // Sidepods, floor accents, and cockpit halo.
  ctx.fillStyle = '#b5162a';
  ctx.fillRect(x - 11, y + 22, 4, 10);
  ctx.fillRect(x + 7, y + 22, 4, 10);
  ctx.fillStyle = '#ffd5d8';
  ctx.fillRect(x - 10, y + 24, 2, 1);
  ctx.fillRect(x + 8, y + 24, 2, 1);
  ctx.fillStyle = '#071817';
  ctx.beginPath();
  ctx.ellipse(x, y + 20, 4.2, 6.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#d7fff8';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.ellipse(x, y + 20, 5.2, 7.2, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#fde047';
  ctx.beginPath();
  ctx.arc(x, y + 19, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Nose stripe and racing number.
  ctx.fillStyle = '#fde047';
  ctx.fillRect(x - 1, y + 3, 2, 7);
  ctx.fillStyle = '#f4fffc';
  ctx.font = 'bold 5px "Space Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('07', x, y + 34);
  ctx.textAlign = 'start';
}

function drawTrafficGame() {
  if (!canvasCtx) return;
  const ctx = canvasCtx;
  const laneCenters = [72, 140, 208];

  ctx.fillStyle = '#0e1816';
  ctx.fillRect(0, 0, 280, 235);
  ctx.fillStyle = '#12443c';
  ctx.fillRect(0, 0, 34, 196);
  ctx.fillRect(246, 0, 34, 196);
  ctx.fillStyle = '#26302c';
  ctx.fillRect(34, 0, 212, 196);
  ctx.fillStyle = 'rgba(0, 229, 201, 0.35)';
  ctx.fillRect(34, 0, 2, 196);
  ctx.fillRect(244, 0, 2, 196);

  // Animated dashed lane markings and roadside reflectors.
  ctx.fillStyle = 'rgba(244, 241, 222, 0.78)';
  [106, 174].forEach(x => {
    for (let y = -40 + trafficRoadOffset; y < 196; y += 40) ctx.fillRect(x - 1, y, 2, 20);
  });
  ctx.fillStyle = '#fde047';
  for (let y = -18 + ((trafficRoadOffset * 1.5) % 36); y < 196; y += 36) {
    ctx.fillRect(18, y, 4, 12);
    ctx.fillRect(258, y, 4, 12);
  }

  trafficCars.forEach(car => drawTrafficCar(laneCenters[car.lane], car.y, car.color));
  drawTrafficCar(laneCenters[trafficLane], 146, '#00e5c9', true);

  ctx.fillStyle = '#071210';
  ctx.fillRect(0, 196, 280, 39);
  ctx.strokeStyle = 'rgba(0, 229, 201, 0.35)';
  ctx.beginPath();
  ctx.moveTo(0, 196);
  ctx.lineTo(280, 196);
  ctx.stroke();
  ctx.fillStyle = '#00ffcc';
  ctx.font = '9px "Silkscreen", monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`DIST: ${String(Math.floor(trafficScore)).padStart(3, '0')}`, 9, 218);
  ctx.fillStyle = '#fde047';
  ctx.fillText(`BEST: ${String(trafficBest).padStart(3, '0')}`, 116, 218);
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.font = '7px "Space Mono", monospace';
  ctx.textAlign = 'right';
  ctx.fillText('STEER / DODGE', 270, 231);
  ctx.textAlign = 'start';
  applyScanlines();
}

function drawTrafficPause() {
  drawTrafficGame();
  canvasCtx.fillStyle = 'rgba(0, 0, 0, 0.72)';
  canvasCtx.fillRect(0, 0, 280, 196);
  canvasCtx.fillStyle = '#fde047';
  canvasCtx.font = '12px "Silkscreen", monospace';
  canvasCtx.textAlign = 'center';
  canvasCtx.fillText('RACE PAUSED', 140, 91);
  canvasCtx.font = '8px "Space Mono", monospace';
  canvasCtx.fillStyle = '#ffffff';
  canvasCtx.fillText('PRESS START TO RESUME', 140, 116);
  canvasCtx.textAlign = 'start';
}

function drawTrafficGameOver() {
  drawTrafficGame();
  canvasCtx.fillStyle = 'rgba(8, 12, 12, 0.82)';
  canvasCtx.fillRect(0, 0, 280, 196);
  canvasCtx.textAlign = 'center';
  canvasCtx.fillStyle = '#ef476f';
  canvasCtx.font = '13px "Silkscreen", monospace';
  canvasCtx.fillText('CRASH!', 140, 77);
  canvasCtx.fillStyle = '#ffffff';
  canvasCtx.font = '9px "Space Mono", monospace';
  canvasCtx.fillText(`DISTANCE: ${Math.floor(trafficScore)}`, 140, 101);
  canvasCtx.fillStyle = '#00ffcc';
  canvasCtx.font = '8px "Silkscreen", monospace';
  canvasCtx.fillText('PRESS [A] TO RACE AGAIN', 140, 128);
  canvasCtx.textAlign = 'start';
}

function placeFood() {
  const maxX = Math.floor(280 / GRID_SIZE);
  const maxY = Math.floor(190 / GRID_SIZE);
  let newFood;
  while (true) {
    newFood = {
      x: Math.floor(Math.random() * maxX),
      y: Math.floor(Math.random() * maxY)
    };
    const onSnake = snake.some(seg => seg.x === newFood.x && seg.y === newFood.y);
    if (!onSnake) break;
  }
  food = newFood;
}

function gameLoop() {
  if (!isGameRunning || !canvasCtx) return;

  direction = nextDirection;
  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

  // Wall collisions (seamless wrap-around for smooth arcade fun)
  const maxX = Math.floor(280 / GRID_SIZE);
  const maxY = Math.floor(190 / GRID_SIZE);
  if (head.x < 0) head.x = maxX - 1;
  if (head.x >= maxX) head.x = 0;
  if (head.y < 0) head.y = maxY - 1;
  if (head.y >= maxY) head.y = 0;

  // Self collision
  for (let segment of snake) {
    if (segment.x === head.x && segment.y === head.y) {
      playRetroBeep(220, 0.25);
      isGameRunning = false;
      if (gameInterval) clearInterval(gameInterval);
      drawGameOver();
      return;
    }
  }

  snake.unshift(head);

  // Eat Food
  if (head.x === food.x && head.y === food.y) {
    snakeScore += 10;
    if (snakeScore > snakeHiScore) snakeHiScore = snakeScore;
    playRetroBeep(880, 0.08);
    placeFood();

    const captionTagline = document.getElementById('consoleCaptionTagline');
    if (captionTagline) {
      captionTagline.textContent = `D-PAD / ARROWS TO SLITHER · SCORE: ${snakeScore}`;
    }
  } else {
    snake.pop();
  }

  drawSnakeGame();
}

function drawSnakeGame() {
  if (!canvasCtx) return;

  // 1. Clear background to retro Game Boy dark olive / cyber teal
  canvasCtx.fillStyle = '#0e1816';
  canvasCtx.fillRect(0, 0, 280, 235);

  // 2. Faint Grid Lines
  canvasCtx.strokeStyle = 'rgba(0, 229, 201, 0.06)';
  canvasCtx.lineWidth = 1;
  for (let x = 0; x <= 280; x += GRID_SIZE) {
    canvasCtx.beginPath();
    canvasCtx.moveTo(x, 0);
    canvasCtx.lineTo(x, 196);
    canvasCtx.stroke();
  }
  for (let y = 0; y <= 196; y += GRID_SIZE) {
    canvasCtx.beginPath();
    canvasCtx.moveTo(0, y);
    canvasCtx.lineTo(280, y);
    canvasCtx.stroke();
  }

  // 3. Draw Food (Glowing golden pixel fruit)
  canvasCtx.fillStyle = '#fde047';
  canvasCtx.shadowColor = '#fde047';
  canvasCtx.shadowBlur = 8;
  canvasCtx.fillRect(food.x * GRID_SIZE + 2, food.y * GRID_SIZE + 2, GRID_SIZE - 4, GRID_SIZE - 4);
  // Red core accent
  canvasCtx.fillStyle = '#ef4444';
  canvasCtx.fillRect(food.x * GRID_SIZE + 5, food.y * GRID_SIZE + 5, GRID_SIZE - 10, GRID_SIZE - 10);
  canvasCtx.shadowBlur = 0;

  // 4. Draw Snake
  snake.forEach((seg, index) => {
    if (index === 0) {
      // Head: bright cyan with glowing eyes
      canvasCtx.fillStyle = '#00ffcc';
      canvasCtx.shadowColor = '#00e5c9';
      canvasCtx.shadowBlur = 6;
      canvasCtx.fillRect(seg.x * GRID_SIZE + 1, seg.y * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2);
      canvasCtx.shadowBlur = 0;

      // Eye dots
      canvasCtx.fillStyle = '#0e1816';
      canvasCtx.fillRect(seg.x * GRID_SIZE + 3, seg.y * GRID_SIZE + 3, 2, 2);
      canvasCtx.fillRect(seg.x * GRID_SIZE + 9, seg.y * GRID_SIZE + 3, 2, 2);
    } else {
      // Body: gradient cyber teal
      canvasCtx.fillStyle = index % 2 === 0 ? '#00e5c9' : '#0d9488';
      canvasCtx.fillRect(seg.x * GRID_SIZE + 1.5, seg.y * GRID_SIZE + 1.5, GRID_SIZE - 3, GRID_SIZE - 3);
    }
  });

  // 5. Bottom HUD Score Banner
  canvasCtx.fillStyle = '#071210';
  canvasCtx.fillRect(0, 196, 280, 39);
  canvasCtx.strokeStyle = 'rgba(0, 229, 201, 0.25)';
  canvasCtx.beginPath();
  canvasCtx.moveTo(0, 196);
  canvasCtx.lineTo(280, 196);
  canvasCtx.stroke();

  canvasCtx.fillStyle = '#00ffcc';
  canvasCtx.font = '9px "Silkscreen", monospace';
  canvasCtx.textAlign = 'left';
  canvasCtx.fillText(`SCORE: ${String(snakeScore).padStart(3, '0')}`, 10, 218);

  canvasCtx.fillStyle = '#fde047';
  canvasCtx.fillText(`HI: ${String(snakeHiScore).padStart(3, '0')}`, 110, 218);

  canvasCtx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  canvasCtx.font = '8px "Space Mono", monospace';
  canvasCtx.textAlign = 'right';
  canvasCtx.fillText(`[D-PAD] SLITHER`, 270, 218);

  applyScanlines();
}

function drawPauseScreen() {
  if (!canvasCtx) return;
  canvasCtx.fillStyle = 'rgba(0, 0, 0, 0.75)';
  canvasCtx.fillRect(0, 0, 280, 196);
  canvasCtx.fillStyle = '#fde047';
  canvasCtx.font = '12px "Silkscreen", monospace';
  canvasCtx.textAlign = 'center';
  canvasCtx.fillText('GAME PAUSED', 140, 95);
  canvasCtx.fillStyle = '#ffffff';
  canvasCtx.font = '9px "Space Mono", monospace';
  canvasCtx.fillText('Press START or [A] to Resume', 140, 120);
  canvasCtx.textAlign = 'start';
}

function drawGameOver() {
  if (!canvasCtx) return;
  canvasCtx.fillStyle = 'rgba(10, 2, 2, 0.82)';
  canvasCtx.fillRect(0, 0, 280, 196);

  canvasCtx.fillStyle = '#ef4444';
  canvasCtx.font = '14px "Silkscreen", monospace';
  canvasCtx.textAlign = 'center';
  canvasCtx.fillText('GAME OVER!', 140, 80);

  canvasCtx.fillStyle = '#ffffff';
  canvasCtx.font = '10px "Space Mono", monospace';
  canvasCtx.fillText(`Final Score: ${snakeScore}`, 140, 106);

  canvasCtx.fillStyle = '#00ffcc';
  canvasCtx.font = '9px "Silkscreen", monospace';
  canvasCtx.fillText('PRESS [A] TO PLAY AGAIN', 140, 134);
  canvasCtx.textAlign = 'start';

  const captionTagline = document.getElementById('consoleCaptionTagline');
  if (captionTagline) {
    captionTagline.textContent = `GAME OVER! FINAL SCORE: ${snakeScore} · PRESS [A] TO RESTART`;
  }
}

function applyScanlines() {
  if (!canvasCtx) return;
  canvasCtx.fillStyle = 'rgba(0, 0, 0, 0.15)';
  for (let i = 0; i < 235; i += 4) {
    canvasCtx.fillRect(0, i, 280, 2);
  }
}

/* ==========================================================================
   8. CONTACT CHECKLIST & WORKING FORM
   ========================================================================== */
function initContactChecklistAndForm() {
  const checkItems = document.querySelectorAll('.check-item');
  const resumeItem = document.getElementById('checkDownloadResume');
  const form = document.getElementById('contactForm');

  checkItems.forEach(item => {
    item.addEventListener('click', () => {
      playClickSound();
      const box = item.querySelector('.custom-checkbox');
      if (box) box.classList.toggle('checked');
    });
  });

  if (resumeItem) {
    resumeItem.addEventListener('click', () => {
      openResumeModal();
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      playClickSound();

      const name = document.getElementById('formName').value.trim();
      const email = document.getElementById('formEmail').value.trim();
      const message = document.getElementById('formMessage').value.trim();

      if (!name || !email || !message) {
        alert('Please fill out all required fields.');
        return;
      }

      // Show success modal
      openReceiptModal(name, email, message);
      form.reset();
    });
  }
}

function openReceiptModal(name, email, message) {
  const modal = document.getElementById('receiptModal');
  if (!modal) return;
  document.getElementById('receiptSenderName').textContent = name;
  document.getElementById('receiptSenderEmail').textContent = email;
  document.getElementById('receiptTime').textContent = new Date().toLocaleString();
  modal.classList.add('active');
}

function openResumeModal() {
  const modal = document.getElementById('resumeModal');
  if (!modal) return;
  modal.classList.add('active');
}

/* ==========================================================================
   9. TALK TO SYED MECHA HELMET ASSISTANT
   ========================================================================== */
const faqAnswers = {
  stack: "Syed's primary technical stack includes React.js, Node.js, Python, Django, Flask, Express.js, REST APIs, and Firebase, along with databases like MySQL, PostgreSQL, and MongoDB.",
  projects: "Featured highlights include his full-stack E-Commerce Web Application (React, Node, Python, MongoDB), Interactive Puzzle Game, Dynamic Event Platform, and production client platforms like Veedu Vadagaikku and JP Holidays.",
  education: "Syed is pursuing a Bachelor of Engineering (B.E.) in Computer Science and Engineering at The Meenakshi College of Engineering, Chennai (2023 – 2027).",
  contact: "You can reach Syed directly via email at azhar12082006@gmail.com or connect via LinkedIn and GitHub!"
};

function initMechaAssistant() {
  const avatarBtn = document.getElementById('mechaAvatarBtn');
  const modal = document.getElementById('assistantModal');
  const answerBox = document.getElementById('assistantAnswerBox');
  const promptButtons = document.querySelectorAll('.assistant-prompt-btn');
  const closeBtn = document.getElementById('closeChatBtn');
  const gotItBtn = document.getElementById('chatGotItBtn');
  const backdrop = document.getElementById('chatBackdropOverlay');

  /** Toggle backdrop overlay (visible only on mobile via CSS) */
  function syncBackdrop(show) {
    if (!backdrop) return;
    if (show) {
      backdrop.classList.add('active');
    } else {
      backdrop.classList.remove('active');
    }
  }

  if (avatarBtn && modal) {
    avatarBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      playRetroBeep(680, 0.08);
      const willOpen = !modal.classList.contains('active');
      modal.classList.toggle('active');
      modal.style.display = willOpen ? 'block' : 'none';
      syncBackdrop(willOpen);
    });
  }

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      playClickSound();
      modal.classList.remove('active');
      modal.style.display = 'none';
      syncBackdrop(false);
    });
  }

  if (gotItBtn && modal) {
    gotItBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      playClickSound();
      modal.classList.remove('active');
      modal.style.display = 'none';
      syncBackdrop(false);
    });
  }

  // Close via backdrop overlay tap (mobile)
  if (backdrop && modal) {
    backdrop.addEventListener('click', () => {
      playClickSound();
      modal.classList.remove('active');
      modal.style.display = 'none';
      syncBackdrop(false);
    });
  }

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (modal && modal.classList.contains('active')) {
      if (!modal.contains(e.target) && e.target !== avatarBtn && !avatarBtn?.contains(e.target)) {
        modal.classList.remove('active');
        modal.style.display = 'none';
        syncBackdrop(false);
      }
    }
  });

  promptButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      playClickSound();
      const key = btn.getAttribute('data-qa');
      const text = faqAnswers[key] || "I'm Syed's digital agent! Feel free to explore his projects or send him a message below.";
      typewriterAnswer(answerBox, text);
    });
  });
}

function typewriterAnswer(container, text) {
  if (!container) return;
  container.textContent = '';
  let i = 0;
  const interval = setInterval(() => {
    container.textContent += text.charAt(i);
    i++;
    if (i >= text.length) clearInterval(interval);
  }, 16);
}

/* ==========================================================================
   10. STAMP & DOODLE INTERACTIONS
   ========================================================================== */
function initStampInteractions() {
  const stampCells = document.querySelectorAll('.stamp-cell');
  stampCells.forEach(cell => {
    cell.addEventListener('click', () => {
      playRetroBeep(720, 0.05);
      const label = cell.getAttribute('data-stamp');
      console.log(`Stamp clicked: ${label}`);
    });
  });

  const doodles = document.querySelectorAll('.floating-doodle');
  doodles.forEach(doodle => {
    doodle.addEventListener('click', () => {
      playRetroBeep(580, 0.07);
    });
  });

  // Global modal close handler
  const closeButtons = document.querySelectorAll('.modal-close-btn, .modal-backdrop');
  closeButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-backdrop') || e.target.classList.contains('modal-close-btn')) {
        playClickSound();
        document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('active'));
      }
    });
  });
}

/* ==========================================================================
   ⚡ THOR AI CHAT WIDGET
   Portfolio-aware assistant with redesigned Thor avatar & verified resume data
   ========================================================================== */
function initThorChat() {
  const toggleBtn  = document.getElementById('thorChatToggle');
  const closeBtn   = document.getElementById('thorChatClose');
  const chatWindow = document.getElementById('thorChatWindow');
  const feed       = document.getElementById('thorMessagesFeed');
  const input      = document.getElementById('thorChatInput');
  const sendBtn    = document.getElementById('thorChatSend');
  const chips      = document.querySelectorAll('.thor-chip');
  if (!toggleBtn || !chatWindow || !feed) return;

  const heroSection = document.getElementById('hero');
  const chatWrapper = document.getElementById('thorChatWrapper');
  if (heroSection && chatWrapper && 'IntersectionObserver' in window) {
    const heroObserver = new IntersectionObserver(([entry]) => {
      chatWrapper.classList.toggle('hero-visible', entry.isIntersecting);
    }, { threshold: 0.12 });
    heroObserver.observe(heroSection);
  }

  let isOpen    = false;
  let hasGreeted = false;

  /* -------- INTELLIGENT KNOWLEDGE & QUESTION MATCHING ENGINE -------- */
  function getBotReply(rawText) {
    const query = (rawText || '').trim();
    if (!query) return `⚡ What knowledge of Azhar's realm do you seek, warrior? Ask about his projects, skills, internships, education, or certifications!`;

    const lower = query.toLowerCase();
    const clean = lower.replace(/[?!.,;:'"()&#*\/\\_+\-=@~<>]/g, ' ');
    const tokens = clean.split(/\s+/).filter(Boolean);
    const tokenSet = new Set(tokens);

    const has = (...words) => words.some(w => tokenSet.has(w));
    const phrase = (str) => lower.includes(str);

    // 1. PHONE / MOBILE / CALL / WHATSAPP (Respect privacy - mobile number removed)
    if (has('phone', 'mobile', 'call', 'telephone', 'cell', 'whatsapp', 'sms') || phrase('phone number') || phrase('mobile number') || phrase('contact number')) {
      return `⚡ Azhar's personal mobile number is not publicly listed on this portfolio to respect privacy.\n\nYou can reach him directly through his verified channels:\n📧 <strong>Email:</strong> azhar12082006@gmail.com\n💼 <strong>LinkedIn:</strong> <a href="https://linkedin.com/in/syed-azhar-hussain-a-a721b535a" target="_blank" rel="noopener" style="color: #4dff9a; text-decoration: underline;">linkedin.com/in/syed-azhar-hussain-a-a721b535a</a>\n🐙 <strong>GitHub:</strong> <a href="https://github.com/azhar2006-collab" target="_blank" rel="noopener" style="color: #4dff9a; text-decoration: underline;">github.com/azhar2006-collab</a>\n\nOr dispatch a note through the contact form at the bottom of the page — he responds promptly! ⚡`;
    }

    // 2. RESUME / CV / PDF DOWNLOAD
    if (has('resume', 'cv', 'pdf') || phrase('download resume') || phrase('view resume') || phrase('get resume')) {
      return `📄 Azhar's official resume is available directly on this portfolio!\n\nYou can view and download his verified resume PDF (<strong>Syed_Azhar_Hussain_Resume.pdf</strong>) by clicking the <strong>"Download Resume 📄"</strong> button in the hero card or the contact checklist.\n\nIt contains his verified academic record (B.E. CSE 2023–2027), internships at Trios Technologies & Cognifyz, verified credentials, and complete technical competencies! ⚡`;
    }

    // 3. EDUCATION / COLLEGE / DEGREE / UNIVERSITY / CGPA
    if (has('education', 'college', 'degree', 'university', 'study', 'studying', 'studied', 'academic', 'academics', 'school', 'meenakshi', 'gpa', 'cgpa', 'graduating', 'graduation', 'bachelor', 'engineering') || phrase('what did he study') || phrase('where did he study')) {
      return `🎓 <strong>Academic Background (from official resume):</strong>\n\n📜 <strong>Degree:</strong> Bachelor of Engineering (B.E.) in Computer Science and Engineering\n🏛️ <strong>Institution:</strong> The Meenakshi College of Engineering, Chennai, India\n🗓️ <strong>Duration:</strong> 2023 – 2027\n\nAzhar maintains a strong focus on software engineering, data structures, full-stack web applications, and database architecture! ✈️`;
    }

    // 4. SPECIFIC INTERNSHIPS
    // 4a. Trios Technologies
    if (has('trios')) {
      return `🏢 <strong>Full Stack Developer Intern (Python) | Trios Technologies</strong>\n📍 <em>Chennai, India · 2026 – Present (Current Internship)</em>\n\n• Contributing to 2+ production-grade full-stack web applications using Python, Django/Flask, and React.js, serving real end users.\n• Designed and integrated 5+ RESTful APIs connecting React.js front-end with back-end databases and third-party services.\n• Improved data retrieval efficiency by optimizing SQL and MongoDB queries, reducing average query response time.\n• Managed CI/CD deployment pipelines using Git and cloud hosting platforms including Vercel and Render. ⚡`;
    }

    // 4b. Cognifyz IT Solutions
    if (has('cognifyz')) {
      return `🏢 <strong>Full Stack Developer Intern | Cognifyz IT Solutions Pvt. Ltd.</strong>\n📍 <em>Chennai, India · June 2026 – July 2026 (Completed Internship)</em>\n\n• Developed and delivered 3+ full-stack web application features using React.js and RESTful APIs, reducing manual data handling time by ~25%.\n• Built 10+ dynamic, reusable UI components integrated with back-end APIs, improving overall performance and user experience.\n• Collaborated with a team of 5 developers following Agile practices, completing sprint tasks consistently on schedule.\n• Maintained 100% code documentation standards through peer code reviews.\n• Resolved 15+ bugs and performance issues across front-end and back-end modules. 🛡️`;
    }

    // 4c. General Experience / Internships / Work History
    if (has('experience', 'internship', 'internships', 'intern', 'jobs', 'workplace', 'company', 'companies') || phrase('where did he work') || phrase('where has he worked') || phrase('work history') || phrase('professional experience')) {
      return `🏢 <strong>Professional Experience (from official resume):</strong>\n\n1️⃣ <strong>Trios Technologies</strong> (Chennai, India | 2026 – Present)\n<em>Full Stack Developer Intern (Python)</em>\n• Contributing to 2+ production web apps using Python, Django/Flask, and React.js.\n• Architected 5+ RESTful APIs, optimized SQL/MongoDB queries, and deployed via Vercel and Render.\n\n2️⃣ <strong>Cognifyz IT Solutions Pvt. Ltd.</strong> (Chennai, India | June 2026 – July 2026)\n<em>Full Stack Developer Intern</em>\n• Delivered 3+ full-stack web app features using React.js and RESTful APIs (~25% data handling time reduction).\n• Built 10+ reusable UI components, resolved 15+ bugs, and collaborated in a 5-developer Agile sprint team.\n\nFlip the 3D luggage tag in the <strong>"Where I've Worked"</strong> section for interactive details! 🃏`;
    }

    // 5. CERTIFICATIONS & JOB SIMULATIONS
    if (has('certification', 'certifications', 'cert', 'certs', 'certificate', 'certificates', 'certified', 'deloitte', 'forage', 'simplilearn', 'learntube', 'officemaster', 'infosys', 'springboard', 'platinion', 'simulation', 'simulations') || phrase('what certifications')) {
      return `🏆 <strong>Verified Certifications & Credentials (from official resume):</strong>\n\n1. 📜 <strong>Full-Stack Development 101</strong> — Simplilearn SkillUp (July 2025 | ID: 8681019)\n2. 🛡️ <strong>Cyber Job Simulation</strong> — Deloitte / Forage (August 2025 | ID: tnNM2ApNPMQL50fw)\n3. 🌐 <strong>Introduction to Web Development</strong> — LearnTube (August 2025 | ID: INT-M-2-3705-1066795)\n4. 📊 <strong>PowerBI Workshop</strong> — OfficeMaster (August 2025 | AI-powered dashboards)\n5. 💾 <strong>Big Data 101 & Big Data 301</strong> — Infosys Springboard (November 2025)\n6. 🏛️ <strong>IT Architecture Job Simulation</strong> — BCG Platinion / Forage (December 2025 | Enterprise solution architecture)\n7. 💻 <strong>Technology Job Simulation</strong> — Deloitte / Forage (December 2025 | Coding & Development)\n\nInspect the <strong>"Certifications Console"</strong> on this portfolio for verification details! 🎖️`;
    }

    // 6. SPECIFIC TECHNOLOGIES
    // 6a. Python / Django / Flask
    if (has('python', 'django', 'flask')) {
      return `🐍 <strong>Python & Backend Engineering:</strong>\n\nAzhar actively wields <strong>Python</strong>, <strong>Django</strong>, and <strong>Flask</strong> for backend development and API architecture:\n• At <strong>Trios Technologies</strong>, he is contributing to 2+ production-grade web applications using Python, Django/Flask, and React.js.\n• Developed and integrated 5+ RESTful APIs connecting front-end interfaces to SQL and MongoDB.\n• Built the backend logic for his full-stack <strong>E-Commerce Web Application</strong> using Python and Node.js! ⚡`;
    }

    // 6b. React / React.js
    if (has('react', 'reactjs') || phrase('react.js')) {
      return `⚛️ <strong>React.js Experience:</strong>\n\nReact is one of Azhar's primary front-end frameworks:\n• <strong>Cognifyz IT Solutions:</strong> Built 10+ dynamic, reusable React components and delivered 3+ production features.\n• <strong>Trios Technologies:</strong> Engineered responsive front-ends connected via REST APIs.\n• <strong>E-Commerce Web Application:</strong> Complete customer-facing storefront with cart and payments.\n• <strong>Veedu Vadagaikku Chennai:</strong> Client rental platform built using React (Vite) and TanStack Query! ⚡`;
    }

    // 6c. Node.js / Express
    if (has('node', 'nodejs', 'express', 'expressjs') || phrase('node.js')) {
      return `🟢 <strong>Node.js & Express.js:</strong>\n\nAzhar leverages Node.js and Express.js for scalable server-side development:\n• Built RESTful APIs connecting clients with PostgreSQL and MongoDB.\n• Implemented secure payment processing and inventory management in his E-Commerce platform.\n• Powered backend routing and persistent storage for his Dynamic Event Platform! ⚡`;
    }

    // 6d. Databases
    if (has('database', 'databases', 'sql', 'mongodb', 'postgresql', 'postgres', 'mysql', 'sqlite', 'firestore')) {
      return `🗄️ <strong>Databases & Data Management:</strong>\n\nFrom his verified resume, Azhar has hands-on proficiency in:\n• <strong>Relational:</strong> MySQL, PostgreSQL, SQLite\n• <strong>NoSQL & Cloud:</strong> MongoDB, Firebase Firestore, Realtime Database\n\nAt Trios Technologies, he optimized SQL and MongoDB queries to reduce query latency and improve server efficiency! ⚡`;
    }

    // 6e. Firebase / Cloud / DevOps
    if (has('firebase', 'cloud', 'gcp', 'render', 'vercel', 'netlify', 'serverless')) {
      return `☁️ <strong>Cloud & Serverless Technologies:</strong>\n\n• <strong>Firebase:</strong> Authentication, Firestore, Realtime Database, Cloud Functions, and Firebase Hosting.\n• <strong>Google Cloud Platform (GCP):</strong> Fundamental cloud services.\n• <strong>Deployments & CI/CD:</strong> Git-driven automated pipelines across Vercel and Render. 🚀`;
    }

    // 6f. PowerBI / Analytics
    if (has('powerbi', 'analytics', 'bi') || phrase('power bi') || phrase('data analysis')) {
      return `📊 <strong>PowerBI & Business Intelligence:</strong>\n\n• Certified in <strong>PowerBI Workshop</strong> (OfficeMaster) and <strong>Big Data</strong> (Infosys Springboard).\n• Built 3 AI-powered interactive PowerBI dashboards visualizing 10+ business KPIs for stakeholders.\n• Streamlined executive reporting workflows and slashed reporting turnaround time by 40%! 📈`;
    }

    // 6g. Developer Tools & Platforms
    if (has('docker', 'git', 'github', 'vscode', 'tools', 'platform', 'platforms')) {
      return `🛠️ <strong>Tools & Development Environment:</strong>\n\n• <strong>Version Control:</strong> Git, GitHub\n• <strong>Hosting Platforms:</strong> Vercel, Netlify, Render\n• <strong>Containerization:</strong> Docker (Basics)\n• <strong>Workflow & IDE:</strong> VS Code, Agile, Scrum, and peer code review standards! ⚙️`;
    }

    // 6h. Frontend & UI
    if (has('frontend', 'html', 'css', 'javascript', 'js', 'ui', 'ux', 'responsive') && !has('skills', 'skill', 'stack')) {
      return `🎨 <strong>Front-End Web Development:</strong>\n\nAzhar specializes in HTML5, CSS3, modern JavaScript (ES6+), React.js, responsive web design, UI/UX design, and DOM manipulation. He develops responsive layouts with zero layout shifts, fluid animations, and cross-browser reliability! 🖥️`;
    }

    // 6i. All Technical Skills Summary
    if (has('skills', 'skill', 'stack', 'technologies', 'technology', 'tech', 'languages', 'language')) {
      return `🔧 <strong>Azhar's Technical Skills (from official resume):</strong>\n\n• <strong>Front-End:</strong> HTML5, CSS3, JavaScript (ES6+), React.js, Responsive Web Design, UI/UX Design, DOM Manipulation\n• <strong>Back-End:</strong> Python, Node.js, Django, Flask, Express.js, REST API Development, Server-Side Rendering\n• <strong>Databases:</strong> MySQL, PostgreSQL, MongoDB, SQLite, Firebase Firestore, Realtime Database\n• <strong>Cloud & Serverless:</strong> Firebase (Auth, Functions, Hosting), GCP, Vercel, Netlify, Render, Docker (Basics)\n• <strong>Tools & Methods:</strong> Git, GitHub, VS Code, PowerBI, Agile, Scrum\n\nA comprehensive full-stack toolkit! ⚡`;
    }

    // 7. SPECIFIC PROJECTS
    // 7a. E-Commerce
    if (has('ecommerce', 'store', 'cart', 'shop', 'shopping') || phrase('e-commerce')) {
      return `🛒 <strong>E-Commerce Web Application (Resume Project):</strong>\n\n• <strong>Stack:</strong> React.js, Node.js, Python, REST API, MongoDB\n• <strong>Overview:</strong> Designed and developed a fully responsive full-stack platform with 5+ core modules including product catalog, shopping cart persistence, secure payment gateway integration, and back-end inventory management.\n• <strong>Impact:</strong> Integrated 4 REST APIs for seamless client-server communication, reducing page load times by 30%! ⚡`;
    }

    // 7b. Puzzle / Game
    if (has('puzzle', 'game', 'snake', 'arcade')) {
      return `🧩 <strong>Interactive Puzzle Game (Resume Project):</strong>\n\n• <strong>Stack:</strong> Vanilla JavaScript, HTML5, CSS3\n• <strong>Overview:</strong> Browser-based puzzle game featuring 3 difficulty tiers, real-time score calculation, and dynamic game state management using vanilla JavaScript and advanced DOM manipulation.\n\n🎮 <em>Tip: You can also play the Retro Snake Arcade in the 'Arcade' section of this portfolio!</em>`;
    }

    // 7c. Dynamic Event Platform
    if (has('event', 'events', 'registration', 'registrations')) {
      return `📅 <strong>Dynamic Event Platform (Resume Project):</strong>\n\n• <strong>Stack:</strong> React.js, Node.js, SQL, REST API\n• <strong>Overview:</strong> Multi-page web application supporting 100+ event registrations with interactive schedule management, dynamic UI components, and a database backend for persistent data management. ⚡`;
    }

    // 7d. PowerBI Project
    if (phrase('powerbi dashboard') || phrase('power bi dashboard') || phrase('analytics dashboard')) {
      return `📊 <strong>PowerBI Analytics Dashboard (Resume Project):</strong>\n\n• <strong>Stack:</strong> PowerBI, Data Analysis, AI Integration\n• <strong>Overview:</strong> Built 3 AI-powered interactive dashboards visualizing 10+ business KPIs for stakeholders.\n• <strong>Impact:</strong> Accelerated decision-making and decreased reporting turnaround time by 40%! 📈`;
    }

    // 7e. Veedu Vadagaikku
    if (has('veedu', 'vadagaikku', 'rental')) {
      return `🏠 <strong>Veedu Vadagaikku Chennai (Client Project):</strong>\n\n• <strong>Stack:</strong> React (Vite), TanStack Query, Firebase, Tailwind CSS, REST APIs\n• <strong>Overview:</strong> Zero-brokerage direct tenant-to-landlord rental marketplace for Chennai with bilingual Tamil/English UI, multi-category listings (houses, PGs, shops), and landlord listing packages! 🔑`;
    }

    // 7f. JP Holidays
    if (has('jpholidays', 'holiday', 'holidays', 'travel', 'tour')) {
      return `✈️ <strong>JP Holidays (Client Project):</strong>\n\n• <strong>Stack:</strong> JavaScript (ES6+), HTML5/CSS3, Schema.org JSON-LD, WhatsApp API\n• <strong>Overview:</strong> International and domestic travel agency web platform showcasing 3,000+ tour packages, custom itinerary search, and structured SEO! 🌍`;
    }

    // 7g. 77 Fitness
    if (has('fitness', 'gym', 'workout') || phrase('77 fitness')) {
      return `💪 <strong>77 Fitness Studio (Client Project):</strong>\n\n• <strong>Stack:</strong> Vanilla CSS3, Modern JavaScript (ES6+), Dark Mode System, Google Maps API\n• <strong>Overview:</strong> Editorial dark-mode gym and lifestyle website for 3 premier Chennai branches (Kodambakkam, Nungambakkam, Vadapalani). 🏋️`;
    }

    // 7h. Aadhif's Oils
    if (has('aadhif', 'aadhifs', 'oil', 'oils', 'ghee')) {
      return `🧴 <strong>Aadhif's Wood Pressed Oils (Client Project):</strong>\n\n• <strong>Stack:</strong> JavaScript (ES6+), Node.js & Express, PostgreSQL, Tailwind CSS\n• <strong>Overview:</strong> Artisanal cold-pressed oil store featuring live bottle size pricing configurators, cart calculations, and WhatsApp checkout integration! 🥥`;
    }

    // 7i. UniHut
    if (has('unihut', 'tax', 'corpserv')) {
      return `📊 <strong>UniHut Tax & Corpserv (Client Project):</strong>\n\n• <strong>Stack:</strong> Semantic HTML5/CSS3, JavaScript (ES6+), Cormorant Garamond typography\n• <strong>Overview:</strong> Corporate legal and taxation portal presenting private limited company formation, GST filing, and financial compliance! 📑`;
    }

    // 7j. Ktech Solutions
    if (has('ktech')) {
      return `🖥️ <strong>Ktech Solutions (Client Project):</strong>\n\n• <strong>Stack:</strong> Node.js, Express, PostgreSQL, Docker, RESTful APIs\n• <strong>Overview:</strong> Enterprise workflow automation & process orchestration system with real-time RESTful telemetry and microservices architecture! ⚙️`;
    }

    // 7k. General Projects
    if (has('projects', 'project', 'built', 'build', 'apps', 'work') || phrase('what projects') || phrase('what did he build')) {
      return `⚔️ <strong>Azhar's Featured Projects & Builds:</strong>\n\n📂 <strong>Resume Projects:</strong>\n1. 🛒 <strong>E-Commerce Web Application</strong> — React.js, Node.js, Python, MongoDB (5+ modules, 4 REST APIs, 30% speedup)\n2. 🧩 <strong>Interactive Puzzle Game</strong> — Vanilla JS, HTML5, CSS3 (3 difficulty tiers, score tracking)\n3. 📅 <strong>Dynamic Event Platform</strong> — React.js, Node.js, SQL (100+ attendee registrations)\n4. 📊 <strong>PowerBI Analytics Dashboard</strong> — 3 AI-powered KPI dashboards (40% faster reporting)\n\n🚀 <strong>Client Platforms:</strong>\n• 🏠 <strong>Veedu Vadagaikku:</strong> Zero-brokerage Chennai property rental platform\n• ✈️ <strong>JP Holidays:</strong> 3,000+ tour package travel portal\n• 💪 <strong>77 Fitness:</strong> Luxury dark-mode gym web platform\n• 🧴 <strong>Aadhif's Oils:</strong> E-commerce oil storefront\n\nCheck the <strong>"Selected Work"</strong> section on this site to see each project in action! 🛡️`;
    }

    // 8. CONTACT / REACH / HIRE / EMAIL / CONNECT
    if (has('contact', 'reach', 'hire', 'email', 'connect', 'message', 'mail', 'write', 'talk', 'linkedin', 'github') || phrase('how can i contact') || phrase('get in touch') || phrase('reach out')) {
      return `📡 <strong>Connect with Syed Azhar Hussain:</strong>\n\n📧 <strong>Email:</strong> azhar12082006@gmail.com\n💼 <strong>LinkedIn:</strong> <a href="https://linkedin.com/in/syed-azhar-hussain-a-a721b535a" target="_blank" rel="noopener" style="color: #4dff9a; text-decoration: underline;">linkedin.com/in/syed-azhar-hussain-a-a721b535a</a>\n🐙 <strong>GitHub:</strong> <a href="https://github.com/azhar2006-collab" target="_blank" rel="noopener" style="color: #4dff9a; text-decoration: underline;">github.com/azhar2006-collab</a>\n📍 <strong>Location:</strong> Chennai, Tamil Nadu, India\n\nYou can also dispatch a message directly via the contact letterhead form at the bottom of the page! ⚡`;
    }

    // 9. CORE COMPETENCIES / STRENGTHS
    if (has('competencies', 'competency', 'strengths', 'strength', 'why') || phrase('why should we hire') || phrase('why hire') || phrase('what makes him good')) {
      return `💪 <strong>Core Competencies (from official resume):</strong>\n\n✦ Full Stack Web Development (React.js, Node.js, Python, Django)\n✦ REST API Design, Integration & Optimization\n✦ Cloud & Firebase Serverless Architecture\n✦ Responsive UI/UX Development & DOM Manipulation\n✦ Database Design & Query Optimization (SQL & MongoDB)\n✦ Agile & Collaborative Sprint Execution (5-member teams)\n✦ Clean Code, Peer Code Reviews & Software Best Practices ⚡`;
    }

    // 10. ABOUT / WHO IS AZHAR / PROFILE SUMMARY
    if (phrase('who is azhar') || phrase('who is syed') || phrase('about azhar') || phrase('tell me about yourself') || phrase('introduce yourself') || phrase('tell me about azhar') || phrase('tell me about syed') || (has('who', 'about', 'summary', 'profile', 'bio', 'intro', 'introduction') && has('azhar', 'syed', 'him', 'developer', 'candidate', 'author'))) {
      return `⚡ <strong>Syed Azhar Hussain</strong> is a motivated Full Stack Developer based in Chennai, India!\n\n🎓 Pursuing his <strong>Bachelor of Engineering (B.E.) in Computer Science & Engineering (2023 – 2027)</strong> at The Meenakshi College of Engineering, Chennai.\n🏢 Currently interning at <strong>Trios Technologies</strong> as a Full Stack Developer (Python), with prior internship experience at <strong>Cognifyz IT Solutions</strong>.\n🔧 Skilled in <strong>React.js, Node.js, Python, Django, REST APIs, and Firebase</strong>, with proven hands-on experience delivering scalable, responsive web applications.\n\nAsk me about his skills, projects, internships, education, or certifications! 🔱`;
    }

    // 11. BOT IDENTITY / THOR PERSONA
    if (phrase('who are you') || phrase('what are you') || phrase('your name') || phrase('what can you do') || (has('who') && has('you'))) {
      return `⚡ I am <strong>THOR</strong>, the portfolio AI guardian for Syed Azhar Hussain!\n\nI am powered directly by Azhar's verified resume data. I can tell you about:\n• 💼 <strong>Projects & client builds</strong>\n• 🏢 <strong>Internships at Trios & Cognifyz</strong>\n• ⚙️ <strong>Technical stack (React, Python, Node, Firebase, SQL)</strong>\n• 🎓 <strong>Education & college details (B.E. CSE 2023–2027)</strong>\n• 🏆 <strong>7 verified certifications</strong>\n• 📩 <strong>How to contact or hire him</strong>\n\nWhat wisdom do you seek, warrior? ⚔️`;
    }

    // 12. GREETINGS
    if (has('hello', 'hi', 'hey', 'howdy', 'greetings', 'sup', 'yo', 'vanakkam', 'namaste', 'hola') || phrase('good morning') || phrase('good afternoon') || phrase('good evening')) {
      return `⚡ GREETINGS, visitor! I am <strong>THOR</strong>, guardian of Azhar's portfolio realm!\n\nI am armed with every detail from Azhar's verified resume. How can I assist your quest today?\n\n• Ask about his <strong>projects</strong> (E-Commerce, Puzzle Game, Veedu Vadagaikku)\n• Inquire about his <strong>skills</strong> (React, Python, Django, Node.js, Firebase)\n• Review his <strong>internships</strong> (Trios Technologies, Cognifyz)\n• Check his <strong>education & certifications</strong>\n\nWhat knowledge do you seek? ⚔️`;
    }

    // 13. THANKS / PRAISE
    if (has('thanks', 'thank', 'awesome', 'great', 'cool', 'nice', 'good', 'super', 'wonderful', 'brilliant', 'perfect')) {
      return `⚡ You are most welcome, noble friend! The All-Father smiles upon your quest for knowledge!\n\nIs there anything else you wish to know about Azhar's projects, skills, or credentials? I stand ready! 🔱`;
    }

    // 14. EXPLICIT UNAVAILABLE INFO CHECK & POLITE FALLBACK
    return `⚡ That specific information is <strong>not mentioned in Azhar's official resume</strong>.\n\nAccording to his verified resume, Azhar is a Full Stack Developer (B.E. CSE, 2023–2027) skilled in React.js, Python, Node.js, Django, REST APIs, and Firebase.\n\nFeel free to ask about his <strong>skills</strong>, <strong>internships at Trios Technologies & Cognifyz</strong>, <strong>projects</strong>, <strong>education</strong>, or <strong>certifications</strong>! 🛡️`;
  }

  /* -------- HELPERS -------- */
  function addMessage(text, role) {
    const msg = document.createElement('div');
    msg.classList.add('thor-msg', role);

    if (role === 'bot') {
      const avatar = document.createElement('img');
      avatar.src = 'assets/images/thor-avatar.png';
      avatar.alt = 'Thor';
      avatar.classList.add('thor-msg-avatar');
      msg.appendChild(avatar);
    } else {
      const initials = document.createElement('div');
      initials.classList.add('thor-user-initials');
      initials.textContent = 'YOU';
      msg.appendChild(initials);
    }

    const bubble = document.createElement('div');
    bubble.classList.add('thor-msg-bubble');
    if (role === 'bot') bubble.innerHTML = text.replace(/\n/g, '<br/>');
    else bubble.textContent = text;
    msg.appendChild(bubble);

    feed.appendChild(msg);
    feed.scrollTop = feed.scrollHeight;
    return msg;
  }

  function showTyping() {
    const row = document.createElement('div');
    row.classList.add('thor-msg', 'bot');
    row.id = 'thorTypingRow';

    const avatar = document.createElement('img');
    avatar.src = 'assets/images/thor-avatar.png';
    avatar.alt = 'Thor';
    avatar.classList.add('thor-msg-avatar');
    row.appendChild(avatar);

    const indicator = document.createElement('div');
    indicator.classList.add('thor-typing-indicator');
    indicator.innerHTML = '<span class="thor-typing-dot"></span><span class="thor-typing-dot"></span><span class="thor-typing-dot"></span>';
    row.appendChild(indicator);

    feed.appendChild(row);
    feed.scrollTop = feed.scrollHeight;
  }

  function removeTyping() {
    const row = document.getElementById('thorTypingRow');
    if (row) row.remove();
  }

  function sendMessage(text) {
    if (!text.trim()) return;
    addMessage(text, 'user');
    if (input) input.value = '';

    showTyping();
    const delay = 600 + Math.random() * 500;
    setTimeout(() => {
      removeTyping();
      addMessage(getBotReply(text), 'bot');
    }, delay);
  }

  /* -------- TOGGLE OPEN/CLOSE -------- */
  function openChat() {
    isOpen = true;
    chatWindow.classList.add('open');
    toggleBtn.setAttribute('aria-expanded', 'true');
    // Remove notification badge if any
    const badge = toggleBtn.querySelector('.thor-fab-badge');
    if (badge) badge.remove();

    // Greet on first open
    if (!hasGreeted) {
      hasGreeted = true;
      setTimeout(() => {
        showTyping();
        setTimeout(() => {
          removeTyping();
          addMessage(`⚡ HAIL, visitor! I am <strong>THOR</strong>, guardian of Azhar's portfolio realm!\n\nI am armed with verified knowledge from his official resume — ask me about his <strong>projects</strong>, <strong>skills</strong>, <strong>internships</strong>, <strong>certifications</strong>, or <strong>education</strong>!\n\nWhat wisdom do you seek, mortal? ⚔️`, 'bot');
        }, 800);
      }, 200);
    }

    if (input) {
      setTimeout(() => input.focus(), 350);
    }
  }

  function closeChat() {
    isOpen = false;
    chatWindow.classList.remove('open');
    toggleBtn.setAttribute('aria-expanded', 'false');
  }

  // Expose global controller helpers
  window.openThorChat = openChat;
  window.closeThorChat = closeChat;

  /* -------- EVENT LISTENERS -------- */
  toggleBtn.addEventListener('click', () => {
    if (isOpen) closeChat();
    else openChat();
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => closeChat());
  }

  if (sendBtn) {
    sendBtn.addEventListener('click', () => sendMessage(input.value));
  }

  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage(input.value);
      }
    });
  }

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const query = chip.getAttribute('data-query');
      if (query) sendMessage(query);
    });
  });

  // Show a notification badge after 3s if not opened yet
  setTimeout(() => {
    if (!isOpen && !hasGreeted) {
      const existingBadge = toggleBtn.querySelector('.thor-fab-badge');
      if (!existingBadge) {
        const badge = document.createElement('span');
        badge.classList.add('thor-fab-badge');
        badge.textContent = '1';
        toggleBtn.appendChild(badge);
      }
    }
  }, 3000);
}

/* ==========================================================================
   MOBILE HEADER CHATBOT BUTTON (beside "Hussain" on mobile nav)
   Taps into the same Thor chat window opened by the FAB
   ========================================================================== */
function initMobileHeaderChat() {
  const mobileBtn = document.getElementById('mobileThorChatBtn');
  if (!mobileBtn) return;

  mobileBtn.addEventListener('click', () => {
    // Use the global openThorChat helper exposed by initThorChat()
    if (typeof window.openThorChat === 'function') {
      window.openThorChat();
    } else {
      // Fallback: simulate a click on the main FAB toggle
      const fab = document.getElementById('thorChatToggle');
      if (fab) fab.click();
    }
  });
}

