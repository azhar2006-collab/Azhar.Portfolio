/* ==========================================================================
   PORTFOLIO INTERACTIVE CONTROLLER
   Crafted for Syed Azhar Hussain A
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize all interactive modules
  initAudioSystem();
  initMobileNav();
  initNavScroll();
  initHeroCanvas();
  initExperienceTag();
  initCrtTerminal();
  initSkillsRolodex();
  initRetroConsole();
  initContactChecklistAndForm();
  initMechaAssistant();
  initStampInteractions();
});

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
      tag.textContent = '✨ click or tap to paint completely';
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
    id: 'veedu',
    company: 'VeeduVadagaiku',
    role: 'Lead Full-Stack Engineer',
    period: '2024 â€” PRESENT',
    status: 'ACTIVE PROJECT',
    summary: 'Architected and built a comprehensive property rental and listing web application with real-time property management, landlord dashboards, and automated subscription validity.',
    barcode: 'VV2024PRSNT',
    contributions: [
      'Designed relational schema on PostgreSQL with Supabase Auth, Row Level Security (RLS), and automated database triggers.',
      'Developed property management workflow including multi-image uploads, location geo-tagging, and listing verification.',
      'Implemented tier-based subscription packages with automatic expiration jobs and tenant inquiry notification workflows.',
      'Optimized query performance and frontend hydration speeds to deliver sub-200ms page transitions.'
    ],
    tech: ['Next.js', 'TypeScript', 'PostgreSQL', 'Supabase', 'Tailwind CSS', 'Node.js']
  },
  {
    id: 'aadhifs',
    company: "Aadhif's Oils",
    role: 'Full-Stack Developer (Client Project)',
    period: '2024',
    status: 'SHIPPED',
    summary: 'End-to-end engineered a production e-commerce storefront for traditional organic wood-pressed oils with seamless checkout, cart persistence, and order fulfillment.',
    barcode: 'AOD2024SHPD',
    contributions: [
      'Engineered interactive product catalog, custom variation selectors (1L, 500ml), and local storage cart sync.',
      'Integrated payment gateway workflows with webhook verification and transactional customer email alerts.',
      'Built a dedicated administrative order dashboard to track shipping status, inventory deductions, and revenue metrics.',
      'Delivered a mobile-first responsive shopping experience with 98+ Google Lighthouse performance score.'
    ],
    tech: ['React', 'Node.js', 'Express', 'PostgreSQL', 'Stripe/Razorpay', 'Tailwind']
  },
  {
    id: 'fullstack',
    company: 'Cloud-Native Builder',
    role: 'Software & AI Innovator',
    period: '2023 â€” PRESENT',
    status: 'ACTIVE',
    summary: 'Building modern full-stack web applications, robust REST APIs, intelligent LLM agent workflows, and developer productivity tooling with scalable architectures.',
    barcode: 'AZH2026DEV',
    contributions: [
      'Constructed scalable backend microservices utilizing TypeScript, JWT/OAuth2 authentication, and strict type safety.',
      'Engineered intelligent agent integrations leveraging LLM APIs for automated workflow assistance and document extraction.',
      'Implemented clean database migration scripts, connection pooling, and resilient API error-handling middleware.',
      'Championed modern DevOps best practices with Git version control and automated cloud deployments.'
    ],
    tech: ['TypeScript', 'React', 'Node.js', 'Supabase', 'REST APIs', 'Agentic AI', 'Git']
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
   5. SELECTED WORK: RETRO CRT MONITOR & TERMINAL
   ========================================================================== */
const projectsData = [
  {
    title: 'VeeduVadagaiku',
    category: 'PROPERTY RENTAL & LISTING PLATFORM',
    bullets: [
      '> Real estate listing & tenant discovery engine',
      '> Landlord dashboard & property status management',
      '> Subscription packages & listing validity controls',
      '> Powered by Next.js, PostgreSQL & Supabase'
    ],
    image: 'assets/images/veedu_vadagaiku.jpg',
    liveUrl: '#',
    githubUrl: '#',
    fullDesc: 'VeeduVadagaiku is a modern, high-performance property rental platform designed to streamline rental transactions in Indian metropolitan areas. Built with a responsive Next.js frontend and PostgreSQL/Supabase backend, it features automated listing validity tracking, owner verification, and instant tenant inquiries.'
  },
  {
    title: "Aadhif's Oils",
    category: 'ORGANIC E-COMMERCE STOREFRONT',
    bullets: [
      '> Artisanal wood-pressed oil product showcase',
      '> Shopping cart persistence & checkout pipeline',
      '> Integrated payment gateway & order management',
      '> Built with React, Node.js & PostgreSQL'
    ],
    image: 'assets/images/aadhifs_oils.jpg',
    liveUrl: '#',
    githubUrl: '#',
    fullDesc: "Aadhif's Wood Pressed Oils is a digital storefront designed to honor traditional oil craftsmanship. It features interactive bottle size selection, nutrition breakdown, secure online checkout, and an administrative fulfillment dashboard for inventory reconciliation."
  },
  {
    title: 'Cloud Full-Stack App',
    category: 'TYPESCRIPT / SUPABASE / POSTGRESQL',
    bullets: [
      '> Enterprise-grade auth & session security (JWT)',
      '> Relational database architecture with RLS policies',
      '> Scalable REST API endpoints & real-time sync',
      '> Production-ready developer tooling & metrics'
    ],
    image: 'assets/images/fullstack_app.jpg',
    liveUrl: '#',
    githubUrl: '#',
    fullDesc: 'A full-stack cloud application engineered with strict TypeScript typing, PostgreSQL relational tables, and Supabase database functions. Features granular role-based access control (RBAC), connection pooling, audit logging, and responsive dark-mode analytics dashboards.'
  }
];

let currentProjectIndex = 0;

function initCrtTerminal() {
  const prevBtn = document.getElementById('crtPrevBtn');
  const nextBtn = document.getElementById('crtNextBtn');
  const toggleGridBtn = document.getElementById('toggleGridBtn');
  const gridView = document.getElementById('projectsGridView');
  const detailsBtn = document.getElementById('crtDetailsBtn');

  const renderProject = (idx) => {
    const proj = projectsData[idx];
    document.getElementById('crtProjectTitle').textContent = proj.title;
    document.getElementById('crtProjectCategory').textContent = proj.category;
    document.getElementById('crtCounter').textContent = `0${idx + 1} / 0${projectsData.length}`;

    const bulletsContainer = document.getElementById('crtProjectBullets');
    bulletsContainer.innerHTML = proj.bullets.map(b => `<p>${b}</p>`).join('');

    const visitBtn = document.getElementById('crtVisitBtn');
    if (visitBtn) {
      visitBtn.setAttribute('href', proj.liveUrl);
    }
  };

  renderProject(0);

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      playRetroBeep(450, 0.06);
      currentProjectIndex = (currentProjectIndex - 1 + projectsData.length) % projectsData.length;
      renderProject(currentProjectIndex);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      playRetroBeep(650, 0.06);
      currentProjectIndex = (currentProjectIndex + 1) % projectsData.length;
      renderProject(currentProjectIndex);
    });
  }

  // Toggle Grid View
  if (toggleGridBtn && gridView) {
    toggleGridBtn.addEventListener('click', () => {
      playClickSound();
      const isActive = gridView.classList.toggle('active');
      toggleGridBtn.textContent = isActive ? '▲ Collapse Grid View' : '▾ See All Projects (Grid)';
    });
  }

  // Project Details Modal
  if (detailsBtn) {
    detailsBtn.addEventListener('click', () => {
      playClickSound();
      openProjectModal(projectsData[currentProjectIndex]);
    });
  }
}

function openProjectModal(project) {
  const modal = document.getElementById('projectModal');
  if (!modal) return;
  document.getElementById('modalProjectTitle').textContent = project.title;
  document.getElementById('modalProjectCategory').textContent = project.category;
  document.getElementById('modalProjectDesc').textContent = project.fullDesc;
  document.getElementById('modalProjectImg').src = project.image;
  modal.classList.add('active');
}

/* ==========================================================================
   6. SKILLS ROLODEX PUNCHED CARD
   ========================================================================== */
const skillsData = {
  all: [
    'HTML5 & Modern CSS3', 'JavaScript (ES6+)', 'TypeScript',
    'React & Next.js', 'Node.js & Express', 'RESTful APIs',
    'PostgreSQL & SQL', 'Supabase Database', 'Authentication (JWT)',
    'Git & GitHub Workflow', 'Cloud Deployment & Linux', 'Agentic AI & LLMs'
  ],
  frontend: [
    'HTML5 Semantic Markup', 'CSS3 Vanilla & Flex/Grid', 'JavaScript (ES6+)',
    'TypeScript', 'React.js Components', 'Next.js App Router',
    'Responsive Design', 'Micro-Animations & UI Craft'
  ],
  backend: [
    'Node.js Runtime', 'Express.js Framework', 'RESTful API Architecture',
    'User Auth (JWT/OAuth)', 'Database Controllers', 'Middleware Pipelines'
  ],
  database: [
    'PostgreSQL Relational DB', 'Supabase Cloud Backend', 'SQL Schema Design & Queries',
    'Row Level Security (RLS)', 'Data Migrations', 'Connection Optimization'
  ],
  tools: [
    'Git Version Control', 'GitHub Actions & Repos', 'Cloud Deployment Platforms',
    'Postman API Testing', 'VS Code & Linux Environment', 'Intelligent AI Coding Workflows'
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
let currentGameMode = 'memory'; // 'memory' or 'snake'

// Snake Game Variables
let snake = [];
let food = { x: 5, y: 5 };
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let snakeScore = 0;
let isGameRunning = false;
const GRID_SIZE = 14;
let canvasCtx = null;

function initRetroConsole() {
  const cartridges = document.querySelectorAll('.cartridge-item-card');
  const canvas = document.getElementById('gameboyCanvas');
  const bannerTitle = document.getElementById('lcdBannerTitle');
  const bannerSub = document.getElementById('lcdBannerSub');
  if (!canvas) return;

  canvasCtx = canvas.getContext('2d');
  canvas.width = 280;
  canvas.height = 230;

  // Render initial Cartridge 1: Code & Coffee memory
  renderDevMemory();

  cartridges.forEach(card => {
    card.addEventListener('click', () => {
      playRetroBeep(700, 0.08);
      cartridges.forEach(c => c.classList.remove('active'));
      card.classList.add('active');

      const rom = card.getAttribute('data-rom');
      if (rom === 'snake') {
        currentGameMode = 'snake';
        bannerTitle.textContent = 'ARCADE: RETRO SNAKE 🐍';
        bannerSub.textContent = 'D-PAD / Arrow keys to move | Press A to Restart';
        startSnakeGame();
      } else {
        currentGameMode = 'memory';
        stopSnakeGame();
        if (rom === 'code_coffee') {
          bannerTitle.textContent = 'MEMORY: LATE NIGHT CODE';
          bannerSub.textContent = 'Chennai · 01:47 AM · South Indian Filter Coffee';
          renderDevMemory();
        } else if (rom === 'veedu') {
          bannerTitle.textContent = 'MEMORY: VEEDUVADAGAIKU';
          bannerSub.textContent = 'Architecting Property Management & Subscriptions';
          renderProjectMemory('assets/images/veedu_vadagaiku.jpg', 'VeeduVadagaiku Dev Build');
        } else if (rom === 'aadhifs') {
          bannerTitle.textContent = 'MEMORY: AADHIF\'S OILS';
          bannerSub.textContent = 'Storefront & Payment Gateway Engineering';
          renderProjectMemory('assets/images/aadhifs_oils.jpg', "Aadhif's Store Engine");
        }
      }
    });
  });

  // Controls: D-Pad
  const dpadUp = document.getElementById('dpadUp');
  const dpadDown = document.getElementById('dpadDown');
  const dpadLeft = document.getElementById('dpadLeft');
  const dpadRight = document.getElementById('dpadRight');
  const btnA = document.getElementById('gameboyBtnA');
  const btnB = document.getElementById('gameboyBtnB');

  if (dpadUp) dpadUp.addEventListener('click', () => handleDpadInput(0, -1));
  if (dpadDown) dpadDown.addEventListener('click', () => handleDpadInput(0, 1));
  if (dpadLeft) dpadLeft.addEventListener('click', () => handleDpadInput(-1, 0));
  if (dpadRight) dpadRight.addEventListener('click', () => handleDpadInput(1, 0));

  if (btnA) {
    btnA.addEventListener('click', () => {
      playRetroBeep(800, 0.06);
      if (currentGameMode === 'snake') {
        startSnakeGame();
      } else {
        // Toggle to next memory
        const nextCart = document.querySelector('.cartridge-item-card.active')?.nextElementSibling || document.querySelector('.cartridge-item-card');
        if (nextCart) nextCart.click();
      }
    });
  }

  if (btnB) {
    btnB.addEventListener('click', () => {
      playRetroBeep(400, 0.06);
      if (currentGameMode === 'snake') {
        isGameRunning = !isGameRunning;
      } else {
        const prevCart = document.querySelector('.cartridge-item-card.active')?.previousElementSibling;
        if (prevCart) prevCart.click();
      }
    });
  }

  // Keyboard navigation for Snake
  window.addEventListener('keydown', (e) => {
    if (currentGameMode !== 'snake') return;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
      e.preventDefault();
    }
    if (e.key === 'ArrowUp' && direction.y === 0) nextDirection = { x: 0, y: -1 };
    if (e.key === 'ArrowDown' && direction.y === 0) nextDirection = { x: 0, y: 1 };
    if (e.key === 'ArrowLeft' && direction.x === 0) nextDirection = { x: -1, y: 0 };
    if (e.key === 'ArrowRight' && direction.x === 0) nextDirection = { x: 1, y: 0 };
  });
}

function handleDpadInput(dx, dy) {
  playRetroBeep(520, 0.04);
  if (currentGameMode === 'snake') {
    if (dx !== 0 && direction.x === 0) nextDirection = { x: dx, y: 0 };
    if (dy !== 0 && direction.y === 0) nextDirection = { x: 0, y: dy };
  }
}

function renderDevMemory() {
  if (!canvasCtx) return;
  const img = new Image();
  img.src = 'assets/images/retro_memory_dev.jpg';
  img.onload = () => {
    canvasCtx.drawImage(img, 0, 0, 280, 230);
    applyScanlines();
  };
}

function renderProjectMemory(imageSrc, label) {
  if (!canvasCtx) return;
  const img = new Image();
  img.src = imageSrc;
  img.onload = () => {
    canvasCtx.drawImage(img, 0, 0, 280, 230);
    applyScanlines();
  };
}

function applyScanlines() {
  if (!canvasCtx) return;
  canvasCtx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  for (let i = 0; i < 230; i += 4) {
    canvasCtx.fillRect(0, i, 280, 2);
  }
}

/* Playable Snake Game */
function startSnakeGame() {
  snake = [
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
  gameInterval = setInterval(gameLoop, 130);
}

function stopSnakeGame() {
  isGameRunning = false;
  if (gameInterval) clearInterval(gameInterval);
}

function placeFood() {
  food = {
    x: Math.floor(Math.random() * (280 / GRID_SIZE)),
    y: Math.floor(Math.random() * (200 / GRID_SIZE))
  };
}

function gameLoop() {
  if (!isGameRunning || !canvasCtx) return;

  direction = nextDirection;
  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

  // Wall collisions (wrap-around)
  const maxX = Math.floor(280 / GRID_SIZE);
  const maxY = Math.floor(200 / GRID_SIZE);
  if (head.x < 0) head.x = maxX - 1;
  if (head.x >= maxX) head.x = 0;
  if (head.y < 0) head.y = maxY - 1;
  if (head.y >= maxY) head.y = 0;

  // Self collision
  for (let segment of snake) {
    if (segment.x === head.x && segment.y === head.y) {
      playRetroBeep(200, 0.2);
      isGameRunning = false;
      drawGameOver();
      return;
    }
  }

  snake.unshift(head);

  // Eat Food
  if (head.x === food.x && head.y === food.y) {
    snakeScore += 10;
    playRetroBeep(880, 0.08);
    placeFood();
  } else {
    snake.pop();
  }

  drawSnakeGame();
}

function drawSnakeGame() {
  if (!canvasCtx) return;
  // Clear screen to retro LCD olive green / dark
  canvasCtx.fillStyle = '#111817';
  canvasCtx.fillRect(0, 0, 280, 230);

  // Draw Grid lines
  canvasCtx.strokeStyle = '#182422';
  canvasCtx.lineWidth = 1;
  for (let x = 0; x < 280; x += GRID_SIZE) {
    canvasCtx.beginPath();
    canvasCtx.moveTo(x, 0);
    canvasCtx.lineTo(x, 200);
    canvasCtx.stroke();
  }
  for (let y = 0; y < 200; y += GRID_SIZE) {
    canvasCtx.beginPath();
    canvasCtx.moveTo(0, y);
    canvasCtx.lineTo(280, y);
    canvasCtx.stroke();
  }

  // Draw Food
  canvasCtx.fillStyle = '#fde047';
  canvasCtx.fillRect(food.x * GRID_SIZE + 2, food.y * GRID_SIZE + 2, GRID_SIZE - 4, GRID_SIZE - 4);

  // Draw Snake
  snake.forEach((seg, index) => {
    canvasCtx.fillStyle = index === 0 ? '#00e5c9' : '#0d9488';
    canvasCtx.fillRect(seg.x * GRID_SIZE + 1, seg.y * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2);
  });

  // Top score bar
  canvasCtx.fillStyle = '#062420';
  canvasCtx.fillRect(0, 200, 280, 30);
  canvasCtx.fillStyle = '#1cf5d2';
  canvasCtx.font = '10px Silkscreen, monospace';
  canvasCtx.fillText(`SCORE: ${snakeScore}   [D-PAD OR ARROWS]`, 10, 218);

  applyScanlines();
}

function drawGameOver() {
  canvasCtx.fillStyle = 'rgba(0, 0, 0, 0.75)';
  canvasCtx.fillRect(0, 0, 280, 200);
  canvasCtx.fillStyle = '#ef4444';
  canvasCtx.font = '14px Silkscreen, monospace';
  canvasCtx.textAlign = 'center';
  canvasCtx.fillText('GAME OVER!', 140, 90);
  canvasCtx.fillStyle = '#ffffff';
  canvasCtx.font = '10px Space Mono, monospace';
  canvasCtx.fillText(`Final Score: ${snakeScore}`, 140, 115);
  canvasCtx.fillStyle = '#00e5c9';
  canvasCtx.fillText('Press [A] to Restart', 140, 140);
  canvasCtx.textAlign = 'start';
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
  stack: "Syed's primary stack includes TypeScript, React, Next.js, Node.js, PostgreSQL, and Supabase. He specializes in full-stack architecture, API engineering, and AI agent integration.",
  projects: "Featured highlights include VeeduVadagaiku (property rental & subscription platform) and Aadhif's Wood Pressed Oils (e-commerce storefront with checkout & analytics).",
  education: "Syed is a final-year B.E. Computer Science and Engineering student based in Chennai, India (graduating 2026), with high passion for building scalable software systems.",
  contact: "You can reach Syed directly at azharhussain@example.com or connect via LinkedIn and GitHub!"
};

function initMechaAssistant() {
  const avatarBtn = document.getElementById('mechaAvatarBtn');
  const modal = document.getElementById('assistantModal');
  const answerBox = document.getElementById('assistantAnswerBox');
  const promptButtons = document.querySelectorAll('.assistant-prompt-btn');

  if (avatarBtn && modal) {
    avatarBtn.addEventListener('click', () => {
      playRetroBeep(680, 0.08);
      modal.classList.add('active');
    });
  }

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
