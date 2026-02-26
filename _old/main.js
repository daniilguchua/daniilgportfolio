(() => {
  const state = {
    isMobile: window.matchMedia('(max-width: 767px)').matches,
    prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    mouseX: 0,
    mouseY: 0,
  };

  // Track global mouse position
  document.addEventListener('mousemove', (e) => {
    state.mouseX = e.clientX;
    state.mouseY = e.clientY;
  });

  function onScrollRAF(cb) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => { cb(); ticking = false; });
        ticking = true;
      }
    }, { passive: true });
  }

  // ── Phase 1: Register GSAP plugins ──
  function initScrollTrigger() {
    if (window.gsap && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
    }
    if (window.gsap && window.ScrollToPlugin) {
      gsap.registerPlugin(ScrollToPlugin);
    }
  }

  // ── Smooth scroll for nav links ──
  function initSmoothScroll() {
    const links = document.querySelectorAll('a[data-link]');
    const nav = document.querySelector('nav');
    const scrollToY = (y) => {
      if (window.gsap && window.ScrollToPlugin) {
        gsap.to(window, { duration: state.isMobile ? 0.6 : 0.9, scrollTo: { y, autoKill: false }, ease: 'power2.out' });
      } else {
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    };
    links.forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const id = link.getAttribute('href').slice(1);
        const target = document.getElementById(id);
        if (!target) return;
        const navH = nav ? nav.offsetHeight : 0;
        const y = target.getBoundingClientRect().top + window.pageYOffset - navH - 16;
        scrollToY(y);
        const menu = document.querySelector('nav ul');
        if (menu && menu.classList.contains('active')) {
          const hb = document.querySelector('.hamburger');
          if (hb) hb.click();
        }
      });
    });
  }

  // ── Hero: typing animation + GSAP entrance ──
  function initHero() {
    var heading = document.querySelector('.hero-heading');
    var tagline = document.querySelector('.hero-tagline');
    var cta = document.querySelector('.hero-cta-group');
    var codeEl = document.getElementById('heroCode');
    var eyebrow = document.querySelector('.hero-eyebrow');
    var codeWindow = document.querySelector('.code-window');

    var codeLines = [
      '<span class="syn-keyword">const</span> <span class="syn-property">daniil</span> <span class="syn-punctuation">=</span> <span class="syn-bracket">{</span>',
      '  <span class="syn-property">role</span><span class="syn-punctuation">:</span> <span class="syn-string">"AI Systems Engineer"</span><span class="syn-punctuation">,</span>',
      '  <span class="syn-property">school</span><span class="syn-punctuation">:</span> <span class="syn-string">"Northwestern \'27"</span><span class="syn-punctuation">,</span>',
      '  <span class="syn-property">think</span><span class="syn-punctuation">:</span> <span class="syn-bracket">[</span><span class="syn-string">"Systems"</span><span class="syn-punctuation">,</span> <span class="syn-string">"Cognitive AI"</span><span class="syn-punctuation">,</span> <span class="syn-string">"LLMs"</span><span class="syn-bracket">]</span><span class="syn-punctuation">,</span>',
      '  <span class="syn-property">building</span><span class="syn-punctuation">:</span> <span class="syn-string">"Axiom Engine"</span><span class="syn-punctuation">,</span>',
      '  <span class="syn-property">ask_me</span><span class="syn-punctuation">:</span> <span class="syn-string">"self-healing pipelines"</span>',
      '<span class="syn-bracket">}</span><span class="syn-punctuation">;</span>',
    ];

    try {
      if (!state.prefersReducedMotion && window.gsap) {
        var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
        tl.from(eyebrow, { y: 20, opacity: 0, duration: 0.5 }, 0.1)
          .from(heading, { y: 40, opacity: 0, duration: 0.7 }, 0.2)
          .from(tagline, { y: 20, opacity: 0, duration: 0.5 }, 0.6)
          .from(cta, { y: 20, opacity: 0, duration: 0.5 }, 0.8)
          .from(codeWindow, { y: 30, opacity: 0, duration: 0.7 }, 0.4)
          .add(function() { typeCode(codeEl, codeLines); }, 0.8);
      } else {
        if (codeEl) codeEl.innerHTML = codeLines.join('\n');
      }
    } catch (err) {
      console.warn('Hero animation error:', err);
      if (codeEl) codeEl.innerHTML = codeLines.join('\n');
      [eyebrow, heading, tagline, cta, codeWindow].forEach(function(el) {
        if (el) el.style.opacity = '1';
      });
    }
  }

  function typeCode(el, htmlLines, charDelay, lineDelay) {
    charDelay = charDelay || 25;
    lineDelay = lineDelay || 150;
    var plainLines = htmlLines.map(function(l) { return l.replace(/<[^>]+>/g, ''); });
    var completedHTML = [];
    var lineIdx = 0;

    function typeLine() {
      if (lineIdx >= plainLines.length) {
        el.innerHTML = htmlLines.join('\n') + '<span class="code-cursor"></span>';
        return;
      }
      var plain = plainLines[lineIdx];
      var charIdx = 0;

      function typeChar() {
        if (charIdx > plain.length) {
          completedHTML.push(htmlLines[lineIdx]);
          lineIdx++;
          el.innerHTML = completedHTML.join('\n') + '\n<span class="code-cursor"></span>';
          setTimeout(typeLine, lineDelay);
          return;
        }
        var partial = plain.substring(0, charIdx);
        el.innerHTML = completedHTML.join('\n') + (completedHTML.length ? '\n' : '') + partial + '<span class="code-cursor"></span>';
        charIdx++;
        setTimeout(typeChar, charDelay);
      }
      typeChar();
    }
    typeLine();
  }

  // ── Stats Counter ──
  function initStatsCounter() {
    var statItems = document.querySelectorAll('.stat-item');
    if (!statItems.length) return;

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var el = entry.target.querySelector('.stat-number');
          var target = parseInt(entry.target.dataset.target, 10);
          var suffix = entry.target.dataset.suffix || '';
          animateCount(el, target, suffix, entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    statItems.forEach(function(item) { observer.observe(item); });
  }

  function animateCount(el, target, suffix, container) {
    var duration = 2000;
    var start = performance.now();

    function easeOutQuart(t) { return 1 - Math.pow(1 - t, 4); }

    function frame(now) {
      var elapsed = now - start;
      var progress = Math.min(elapsed / duration, 1);
      var eased = easeOutQuart(progress);
      var current = Math.round(eased * target);
      el.textContent = current.toLocaleString() + suffix;
      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        // Trigger pulse-glow on completion
        if (container) container.classList.add('counted');
      }
    }
    requestAnimationFrame(frame);
  }

  function initHamburger() {
    var hamburger = document.querySelector('.hamburger');
    var menu = document.querySelector('nav ul');
    if (!hamburger || !menu) return;
    hamburger.addEventListener('click', function() {
      var active = menu.classList.toggle('active');
      hamburger.setAttribute('aria-expanded', active);
      hamburger.innerHTML = active ? '<i class="fa-solid fa-times"></i>' : '<i class="fa-solid fa-bars"></i>';
      if (active) { var a = menu.querySelector('a'); if (a) a.focus(); }
    });
  }

  function initActiveLinkObserver() {
    var sections = document.querySelectorAll('section[id], header[id]');
    var links = document.querySelectorAll('nav ul li a');
    function setActive(id) {
      links.forEach(function(a) {
        var href = a.getAttribute('href');
        var match = href ? href.slice(1) === id : false;
        a.classList.toggle('active-link', match);
        if (match) a.setAttribute('aria-current', 'page');
        else a.removeAttribute('aria-current');
      });
    }
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) { if (e.isIntersecting) setActive(e.target.id); });
    }, { threshold: state.isMobile ? 0.3 : 0.45 });
    sections.forEach(function(s) { observer.observe(s); });
  }

  function initAutoHideNav() {
    var nav = document.querySelector('nav');
    if (!nav) return;
    var last = window.scrollY;
    onScrollRAF(function() {
      var y = window.scrollY;
      nav.classList.toggle('scrolled', y > 50);
      if (y > last && y > 100) nav.classList.add('navbar-hidden');
      else nav.classList.remove('navbar-hidden');
      last = y;
    });
  }

  function initScrollReveal() {
    var reveals = document.querySelectorAll('[data-reveal]');
    if (!reveals.length) return;

    if (state.prefersReducedMotion) {
      reveals.forEach(function(el) { el.classList.add('revealed'); });
      return;
    }

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          if (window.gsap) {
            var delay = parseInt(el.dataset.delay || '0', 10) / 1000;
            gsap.to(el, {
              opacity: 1,
              y: 0,
              duration: 0.7,
              delay: delay,
              ease: 'power2.out',
              onComplete: function() { el.classList.add('revealed'); },
            });
          } else {
            el.classList.add('revealed');
          }
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

    reveals.forEach(function(el) { observer.observe(el); });
  }

  // ── Skills pills stagger animation ──
  function initSkillsStagger() {
    if (state.prefersReducedMotion || !window.gsap) return;
    var skillSection = document.getElementById('skills');
    if (!skillSection) return;

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var pills = skillSection.querySelectorAll('.skill-pills span');
          gsap.from(pills, {
            opacity: 0,
            scale: 0.8,
            y: 10,
            duration: 0.4,
            stagger: 0.03,
            ease: 'back.out(1.7)',
          });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    observer.observe(skillSection);
  }

  function initParallaxOrbs() {
    if (state.isMobile || state.prefersReducedMotion) return;
    var hero = document.querySelector('.hero');
    if (!hero) return;
    hero.addEventListener('mousemove', function(e) {
      var rect = hero.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width - 0.5;
      var y = (e.clientY - rect.top) / rect.height - 0.5;
      hero.style.setProperty('--orb-x', (x * 30) + 'px');
      hero.style.setProperty('--orb-y', (y * 20) + 'px');
    });
  }

  // ── Card tilt — updated to horizontal cards ──
  function initCardTilt() {
    if (state.isMobile || state.prefersReducedMotion) return;
    var cards = document.querySelectorAll('.project-card-h, .skill-category');
    cards.forEach(function(card) {
      var isProjectCard = card.classList.contains('project-card-h');
      card.addEventListener('mousemove', function(e) {
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width;
        var y = (e.clientY - rect.top) / rect.height;
        var rotateX = (0.5 - y) * 6;
        var rotateY = (x - 0.5) * 6;
        card.style.transform = 'perspective(1000px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateY(-4px)';

        var blueIntensity = (1 - x) * 0.35;
        var cyanIntensity = x * 0.35;
        var blueShadow = '0 0 50px rgba(59, 130, 246, ' + blueIntensity + ')';
        var cyanShadow = '0 0 50px rgba(6, 182, 212, ' + cyanIntensity + ')';
        var baseShadow = isProjectCard
          ? '0 8px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(59, 130, 246, 0.2)'
          : '0 8px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(6, 182, 212, 0.15)';
        card.style.boxShadow = baseShadow + ', ' + blueShadow + ', ' + cyanShadow;
      });
      card.addEventListener('mouseleave', function() {
        card.style.transform = '';
        card.style.boxShadow = '';
      });
    });
  }

  function initMagneticButtons() {
    if (state.isMobile || state.prefersReducedMotion) return;
    var buttons = document.querySelectorAll('.btn-primary, .btn-secondary');

    buttons.forEach(function(btn) {
      btn.addEventListener('mousemove', function(e) {
        var rect = btn.getBoundingClientRect();
        var btnCenterX = rect.left + rect.width / 2;
        var btnCenterY = rect.top + rect.height / 2;
        var distX = e.clientX - btnCenterX;
        var distY = e.clientY - btnCenterY;
        var distance = Math.sqrt(distX * distX + distY * distY);
        var maxDistance = 100;

        if (distance < maxDistance) {
          var strength = (maxDistance - distance) / maxDistance;
          var moveX = distX * strength * 0.3;
          var moveY = distY * strength * 0.3;
          btn.style.transform = 'translate(' + moveX + 'px, ' + moveY + 'px) translateY(-2px)';
        }
      });

      btn.addEventListener('mouseleave', function() {
        btn.style.transform = '';
      });
    });
  }

  // ── Phase 4: Hero Parallax ──
  function initHeroParallax() {
    if (!window.gsap || !window.ScrollTrigger || state.prefersReducedMotion) return;

    var heading = document.querySelector('.hero-heading');
    var codeWindow = document.querySelector('.code-window');
    var eyebrow = document.querySelector('.hero-eyebrow');

    if (heading) {
      gsap.to(heading, {
        y: -80,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    }

    if (codeWindow) {
      gsap.to(codeWindow, {
        y: 60,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    }

    if (eyebrow) {
      gsap.to(eyebrow, {
        y: -50,
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: '40% top',
          scrub: true,
        },
      });
    }
  }

  // ── Phase 4: Decorative Shape Parallax ──
  function initDecoParallax() {
    if (!window.gsap || !window.ScrollTrigger || state.isMobile || state.prefersReducedMotion) return;

    var shapes = [
      { selector: '.deco-circle-1', y: -180 },
      { selector: '.deco-circle-2', y: -120 },
      { selector: '.deco-line-1',   y: -300 },
      { selector: '.deco-dots',     y: -90  },
    ];

    shapes.forEach(function(s) {
      var el = document.querySelector(s.selector);
      if (!el) return;
      gsap.to(el, {
        y: s.y,
        ease: 'none',
        scrollTrigger: {
          trigger: document.body,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    });
  }

  // ── Phase 5: Horizontal Project Scroll ──
  function initHorizontalProjects() {
    if (!window.gsap || !window.ScrollTrigger) return;

    var section = document.querySelector('.projects-section');
    var track = document.querySelector('.project-track');
    if (!section || !track) return;

    // Mobile: degrade to vertical stack
    if (state.isMobile) return;

    gsap.to(track, {
      x: function() {
        return -(track.scrollWidth - window.innerWidth + 80);
      },
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        pin: true,
        scrub: 1,
        end: function() { return '+=' + track.scrollWidth; },
        invalidateOnRefresh: true,
      },
    });
  }

  // ── Phase 6: Section Title Clip-Path Reveals ──
  function initTitleReveals() {
    if (!window.gsap || !window.ScrollTrigger || state.prefersReducedMotion) return;

    var titles = document.querySelectorAll('.section-title');
    titles.forEach(function(title) {
      // Hero title is handled by initHero
      if (title.closest('.hero')) return;

      gsap.fromTo(title,
        { clipPath: 'inset(0 100% 0 0)' },
        {
          clipPath: 'inset(0 0% 0 0)',
          duration: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: title,
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        }
      );
    });
  }

  // ── Phase 6: About Blur-to-Sharp Reveal ──
  function initAboutBlurReveal() {
    if (!window.gsap || !window.ScrollTrigger || state.prefersReducedMotion) return;

    var aboutText = document.querySelector('.about-body-text');
    if (!aboutText) return;

    gsap.fromTo(aboutText,
      { filter: 'blur(8px)', opacity: 0.4 },
      {
        filter: 'blur(0px)',
        opacity: 1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: aboutText,
          start: 'top 85%',
          end: 'top 45%',
          scrub: 1,
        },
      }
    );
  }

  // ── Phase 6: Stats Slide-Up ──
  function initStatsSlideUp() {
    if (!window.gsap || !window.ScrollTrigger || state.prefersReducedMotion) return;

    var statsBar = document.querySelector('.stats-bar');
    if (!statsBar) return;

    gsap.from(statsBar, {
      y: 60,
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: statsBar,
        start: 'top 90%',
        toggleActions: 'play none none none',
      },
    });
  }

  // ── Phase 7: Project Modal System ──
  function initProjectModals() {
    var overlay = document.getElementById('projectModal');
    var modalContent = document.getElementById('modalContent');
    var closeBtn = document.querySelector('.modal-close');
    if (!overlay || !modalContent) return;

    var projects = {
      axiom: {
        title: 'Axiom Engine',
        date: 'Sep 2025 – Present',
        stack: ['Python', 'Flask', 'Gemini 2.5 Pro', 'FAISS', 'LangChain', 'Docker', 'GitHub Actions'],
        description: 'Turns natural language into interactive algorithm visualizations. 10,000+ lines of production code with a self-healing AI render pipeline that auto-recovers ~95% of broken LLM output.',
        highlights: [
          '4-tier self-healing render pipeline — auto-recovers ~95% of broken LLM output',
          'Two-tier semantic caching (SHA-256 exact + 768-dim cosine similarity)',
          'RAG document pipeline with FAISS vector search and 41 intent triggers',
          '3 AI teaching personas with real-time LLM streaming',
          '219 pytest tests, GitHub Actions CI/CD, Docker, 1K concurrent users',
        ],
        demo: null,
        github: 'https://github.com/daniilguchua',
        image: null,
      },
      slime: {
        title: 'Physarium Polycephalum Simulation',
        date: null,
        stack: ['JavaScript', 'WebGL', 'Canvas API'],
        description: 'Real-time biological simulation of slime mold behavior with thousands of autonomous agents rendered at 60fps via WebGL.',
        highlights: [
          'Optimized per-frame updates with typed arrays for thousands of dynamic agents',
          'Integrated WebGL plugins for real-time parameter adjustments',
          'Custom shader pipeline delivering smooth 60fps performance',
        ],
        demo: 'https://daniilguchua.github.io/SlimeMoldSimulation/',
        github: null,
        image: null,
      },
      ml: {
        title: 'ML Sentence Autocomplete',
        date: null,
        stack: ['Python', 'NLTK', 'spaCy', 'Flask', 'GPT-2'],
        description: 'ML-powered autocomplete engine with a Flask backend and GPT-2 integration that boosted model performance by 50%.',
        highlights: [
          'Flask backend with GPT-2 integration and custom NLP pipeline',
          'Increased model performance by 50% with real-time processing',
          'NLTK and spaCy preprocessing pipeline for text normalization',
        ],
        demo: null,
        github: 'https://github.com/daniilguchua/sentence-autocomplete-bot',
        image: 'documents/project1photo.jpeg',
      },
      vestibular: {
        title: 'Vestibular Rehabilitation Device',
        date: 'Mar 2024 – Jun 2024',
        stack: ['AutoCAD', 'Manufacturing', 'User Research', 'Rapid Prototyping'],
        description: 'Handheld rehabilitation device designed with Shirley Ryan AbilityLab clinicians for patients with vestibular disorders.',
        highlights: [
          'Interchangeable inserts and adjustable weights for progressive tolerance-building',
          'Designed through iterative user research with clinical practitioners',
          'Prototype validated with clinical staff at Shirley Ryan AbilityLab',
        ],
        demo: null,
        github: null,
        image: null,
      },
    };

    function buildModal(key) {
      var p = projects[key];
      if (!p) return '';

      var demoHTML = '';
      if (p.demo) {
        demoHTML = '<div class="modal-demo-area">' +
          '<iframe src="' + p.demo + '" sandbox="allow-scripts allow-same-origin" allowfullscreen title="' + p.title + ' demo"></iframe>' +
          '</div>';
      } else if (p.image) {
        demoHTML = '<div class="modal-demo-area modal-demo-image">' +
          '<img src="' + p.image + '" alt="' + p.title + '">' +
          '</div>';
      } else {
        demoHTML = '<div class="modal-demo-area modal-demo-placeholder">' +
          '<div class="modal-placeholder-inner">' +
          '<i class="fa-solid fa-code"></i>' +
          '<p>No live demo — see GitHub for details</p>' +
          '</div>' +
          '</div>';
      }

      var stackHTML = p.stack.map(function(s) {
        return '<span class="modal-stack-tag">' + s + '</span>';
      }).join('');

      var highlightsHTML = p.highlights.map(function(h) {
        return '<li>' + h + '</li>';
      }).join('');

      var linksHTML = '';
      if (p.demo) {
        linksHTML += '<a href="' + p.demo + '" target="_blank" rel="noopener noreferrer" class="btn-primary">' +
          'Live Demo <i class="fa-solid fa-arrow-up-right-from-square"></i></a>';
      }
      if (p.github) {
        linksHTML += '<a href="' + p.github + '" target="_blank" rel="noopener noreferrer" class="btn-secondary">' +
          'GitHub <i class="fa-brands fa-github"></i></a>';
      }

      return '<div class="modal-header">' +
        '<h2 class="modal-title" id="modalTitle">' + p.title + '</h2>' +
        (p.date ? '<p class="modal-date">' + p.date + '</p>' : '') +
        '</div>' +
        demoHTML +
        '<div class="modal-stack">' + stackHTML + '</div>' +
        '<p class="modal-desc">' + p.description + '</p>' +
        '<ul class="modal-highlights">' + highlightsHTML + '</ul>' +
        (linksHTML ? '<div class="modal-links">' + linksHTML + '</div>' : '');
    }

    function openModal(key) {
      modalContent.innerHTML = buildModal(key);
      overlay.setAttribute('aria-hidden', 'false');
      overlay.classList.add('active');
      document.body.classList.add('modal-open');

      if (window.gsap && !state.prefersReducedMotion) {
        var modal = overlay.querySelector('.project-modal');
        gsap.fromTo(modal,
          { scale: 0.9, y: 40, opacity: 0 },
          { scale: 1, y: 0, opacity: 1, duration: 0.4, ease: 'back.out(1.5)' }
        );
      }

      // Focus trap
      var close = overlay.querySelector('.modal-close');
      if (close) setTimeout(function() { close.focus(); }, 100);
    }

    function closeModal() {
      overlay.setAttribute('aria-hidden', 'true');
      overlay.classList.remove('active');
      document.body.classList.remove('modal-open');
    }

    // Bind trigger buttons
    document.querySelectorAll('[data-modal]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        openModal(btn.dataset.modal);
      });
    });

    // Close button
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    // Click outside modal
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) closeModal();
    });

    // ESC key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && overlay.classList.contains('active')) closeModal();
    });
  }

  // ── Phase 8: Skills Hover Interactivity ──
  function initSkillsInteractivity() {
    var allPills = document.querySelectorAll('.skill-pills [data-skill]');
    if (!allPills.length) return;

    allPills.forEach(function(pill) {
      pill.addEventListener('mouseenter', function() {
        var related = (pill.dataset.related || '').split(',').filter(Boolean);

        allPills.forEach(function(other) {
          if (other === pill) return;
          var otherSkill = other.dataset.skill;
          if (related.indexOf(otherSkill) !== -1) {
            other.classList.add('related-glow');
            other.classList.remove('dimmed');
          } else {
            other.classList.add('dimmed');
            other.classList.remove('related-glow');
          }
        });
      });

      pill.addEventListener('mouseleave', function() {
        allPills.forEach(function(other) {
          other.classList.remove('related-glow', 'dimmed');
        });
      });
    });
  }

  // ── DOMContentLoaded — wire everything up ──
  window.addEventListener('DOMContentLoaded', function() {
    initScrollTrigger();      // MUST be first — registers GSAP plugins
    initSmoothScroll();
    initHero();
    initHamburger();
    initActiveLinkObserver();
    initAutoHideNav();
    initScrollReveal();
    initStatsCounter();
    initSkillsStagger();
    initParallaxOrbs();
    initCardTilt();
    initMagneticButtons();
    // ScrollTrigger-powered effects
    initHeroParallax();
    initDecoParallax();
    initHorizontalProjects();
    initTitleReveals();
    initAboutBlurReveal();
    initStatsSlideUp();
    // Interactive systems
    initProjectModals();
    initSkillsInteractivity();
  });
})();
