(() => {
  const state = {
    isMobile: window.matchMedia('(max-width: 767px)').matches,
    prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    deviceMemory: navigator.deviceMemory || 4, // hint, not guaranteed
  };

  // Utilities //
  function onScrollRAF(cb) {
    let ticking = false;
    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            cb();
            ticking = false;
          });
          ticking = true;
        }
      },
      { passive: true }
    );
  }

  // Smooth Scroll //
  function initSmoothScroll() {
    const links = document.querySelectorAll('a[data-link]');
    const nav = document.querySelector('nav');

    const scrollToY = (y) => {
      if (window.gsap?.to && window.ScrollToPlugin) {
        gsap.to(window, {
          duration: state.isMobile ? 0.6 : 0.9,
          scrollTo: { y, autoKill: false },
          ease: 'power2.out',
        });
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

        const navH = nav?.offsetHeight || 0;
        const y = target.getBoundingClientRect().top + window.pageYOffset - navH - 16;
        scrollToY(y);
        
        const menu = document.querySelector('nav ul');
        if (menu?.classList.contains('active')) {
          document.querySelector('.hamburger')?.click();
        }
      });
    });
  }

  // Hero Text Scramble //
  function scrambleIn(finalText, el, duration = 1400) {
    return new Promise((resolve) => {
      if (!el) return resolve();

      const pool =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{};:<>,.?/';
      const start = performance.now();

      function frame(now) {
        const t = Math.min((now - start) / duration, 1);
        const reveal = Math.floor(t * finalText.length);

        let out = finalText.slice(0, reveal);
        for (let i = reveal; i < finalText.length; i++) {
          const ch = finalText[i];
          out += ch === ' ' || /[.,!?]/.test(ch) ? ch : pool[(Math.random() * pool.length) | 0];
        }

        el.textContent = out;
        if (t < 1) requestAnimationFrame(frame);
        else {
          el.textContent = finalText;
          resolve();
        }
      }

      requestAnimationFrame(frame);
    });
  }

  function initHero() {
    const titleEl = document.getElementById('dynamicTitle'); 
    const introHeading = document.querySelector('.intro-heading');
    const studentP = document.querySelector('.hero-text p');
    const cta = document.querySelector('.hero-text .shiny-cta');
    const nav = document.querySelector('nav');
    
    if (window.gsap) {
      gsap.set([titleEl, studentP, cta, nav], { opacity: 0 });
    }

    const titles = ['Software Engineer', 'Full-Stack Developer', 'ML Engineer'];
    let idx = 0;
    let titleTimer = null;

    function cycleTitle() {
      if (!titleEl) return;
      titleEl.textContent = titles[idx];
      if (window.gsap) {
        gsap.fromTo(
          titleEl,
          { opacity: 0, y: 6 },
          { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }
        );
      }
      idx = (idx + 1) % titles.length;
    }

    (async () => {
      await scrambleIn("Hello! I'm Daniil, an Aspiring", introHeading, 1400);
      if (window.gsap) {
        gsap.to([titleEl, studentP, cta, nav], {
          opacity: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: 'power2.out',
        });
      }
      cycleTitle();
      const period = state.isMobile ? 2800 : 3400;
      const start = () => (titleTimer = setInterval(cycleTitle, period));
      const stop = () => (titleTimer ? clearInterval(titleTimer) : null);
      start();

      document.addEventListener('visibilitychange', () => {
        if (document.hidden) stop();
        else start();
      });
    })();
  }

  // Vanta Fog //
  let vantaInstance = null;
  function initVanta() {
    const el = document.getElementById('vanta-bg');
    const shouldSkip = state.prefersReducedMotion || (state.isMobile && state.deviceMemory <= 4);
    if (!el || shouldSkip || !window.VANTA || !window.THREE) return;

    vantaInstance = VANTA.FOG({
      el,
      THREE: window.THREE,
      mouseControls: !state.isMobile,
      touchControls: false,
      gyroControls: false,
      highlightColor: 0xbb86fc,
      midtoneColor: 0x0c0c18,
      lowlightColor: 0x02020a,
      baseColor: 0x0b0b14,
      blurFactor: state.isMobile ? 0.9 : 1.0,
      speed: state.isMobile ? 0.6 : 0.8,
      zoom: state.isMobile ? 0.25 : 0.22,
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden && vantaInstance?.destroy) {
        vantaInstance.destroy();
        vantaInstance = null;
      }
    });
  }

  function initHamburger() {
    const hamburger = document.querySelector('.hamburger');
    const menu = document.querySelector('nav ul');
    if (!hamburger || !menu) return;

    hamburger.addEventListener('click', () => {
      const active = menu.classList.toggle('active');
      hamburger.setAttribute('aria-expanded', active);
      hamburger.innerHTML = active
        ? '<i class="fa-solid fa-times"></i>'
        : '<i class="fa-solid fa-bars"></i>';
      if (active) menu.querySelector('a')?.focus();
    });
  }

  function initActiveLinkObserver() {
    const sections = document.querySelectorAll('section[id], header[id]');
    const links = document.querySelectorAll('nav ul li a');

    const setActive = (id) => {
      links.forEach((a) => {
        const match = a.getAttribute('href')?.slice(1) === id;
        a.classList.toggle('active-link', match);
        if (match) a.setAttribute('aria-current', 'page');
        else a.removeAttribute('aria-current');
      });
    };

    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { threshold: state.isMobile ? 0.4 : 0.55 }
    );

    sections.forEach((s) => observer.observe(s));
  }

  function initAutoHideNav() {
    const nav = document.querySelector('nav');
    if (!nav) return;
    let last = window.scrollY;

    onScrollRAF(() => {
      const y = window.scrollY;
      if (y > last && y > 100) nav.classList.add('navbar-hidden');
      else nav.classList.remove('navbar-hidden');
      last = y;
    });
  }

  // Swiper //
  function initSwiper() {
    if (!window.Swiper) return;
    const el = document.querySelector('.about-swiper');
    if (!el) return;

    const aboutSwiper = new Swiper('.about-swiper', {
      loop: true,
      speed: 650,
      effect: 'slide',        
      slidesPerView: 1,         
      centeredSlides: true,     
      autoHeight: true,        
      spaceBetween: 16,
      navigation: {
        nextEl: '.swiper-button-next.simple-swiper-btn',
        prevEl: '.swiper-button-prev.simple-swiper-btn',
      },
      pagination: { el: '.swiper-pagination', clickable: true },
      on: {
        slideChangeTransitionStart(swiper) {
          const content = swiper.slides[swiper.activeIndex]?.querySelector('.about-slide-content');
          if (content && window.gsap) {
            gsap.fromTo(content, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' });
          }
        },
      },
    });
  }

  window.addEventListener('DOMContentLoaded', () => {
    initSmoothScroll();
    initHero();
    initHamburger();
    initActiveLinkObserver();
    initAutoHideNav();
    initVanta();  
    initSwiper();
  });
})();
