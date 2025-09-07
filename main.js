(() => {
  const state = {
    isMobile: window.matchMedia('(max-width: 767px)').matches,
    prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    deviceMemory: navigator.deviceMemory || 4,
  };

  function onScrollRAF(cb){
    let ticking = false;
    window.addEventListener('scroll', () => {
      if(!ticking){ requestAnimationFrame(()=>{ cb(); ticking = false; }); ticking = true; }
    }, {passive:true});
  }

  function initAOS(){
    try{
      if(window.AOS && typeof AOS.init === 'function'){
        AOS.init({ once:true, duration:700, easing:'ease-out', offset:80 });
        document.documentElement.classList.remove('aos-disabled');
      }else{
        document.documentElement.classList.add('aos-disabled');
      }
    }catch{ document.documentElement.classList.add('aos-disabled'); }
  }

  function initSmoothScroll(){
    if(window.gsap && window.ScrollToPlugin){ try{ gsap.registerPlugin(ScrollToPlugin); }catch{} }
    const links = document.querySelectorAll('a[data-link]');
    const nav = document.querySelector('nav');

    const scrollToY = (y) => {
      if(window.gsap && window.ScrollToPlugin){
        gsap.to(window,{ duration: state.isMobile? .6:.9, scrollTo:{y, autoKill:false}, ease:'power2.out' });
      }else{
        window.scrollTo({ top:y, behavior:'smooth' });
      }
    };

    links.forEach(link=>{
      link.addEventListener('click',(e)=>{
        e.preventDefault();
        const id = link.getAttribute('href').slice(1);
        const target = document.getElementById(id);
        if(!target) return;
        const navH = nav?.offsetHeight || 0;
        const y = target.getBoundingClientRect().top + window.pageYOffset - navH - 16;
        scrollToY(y);
        const menu = document.querySelector('nav ul');
        if(menu?.classList.contains('active')) document.querySelector('.hamburger')?.click();
      });
    });
  }

  function initHero(){
    const nav          = document.querySelector('nav');
    const heroText     = document.querySelector('.hero-text');
    const introHeading = document.querySelector('.intro-heading');
    const titleStack   = document.getElementById('titleStack');
    const titleEl      = document.getElementById('titleA') || document.querySelector('#home .title-animated');
    const titleB       = document.getElementById('titleB'); // will be hidden
    const studentP     = heroText?.querySelector('p');
    const cta          = heroText?.querySelector('.shiny-cta');

    if(!heroText || !introHeading || !titleStack || !titleEl) return;

    if (titleB) titleB.style.display = 'none';

    const FINAL_INTRO = "Hello! I'm Daniil, an Aspiring";
    const TITLES      = ['Software Engineer','Full-Stack Developer','ML Engineer'];
    const PERIOD      = state.isMobile ? 2800 : 3400;
    const hasGSAP     = typeof window.gsap === 'function';

    nav?.classList.add('visible');

    const fadeTargets = [studentP, cta].filter(Boolean);
    if (hasGSAP && fadeTargets.length) gsap.set(fadeTargets, { opacity: 0 });
    else fadeTargets.forEach(el => el.style.opacity = 0);

    // Fix intro width while scrambling
    (function lockIntroWidth(){
      const m  = document.createElement('span');
      const cs = getComputedStyle(introHeading);
      Object.assign(m.style, {
        position:'absolute', visibility:'hidden', pointerEvents:'none', whiteSpace:'nowrap',
        fontFamily:cs.fontFamily, fontSize:cs.fontSize, fontWeight:cs.fontWeight,
        letterSpacing:cs.letterSpacing, textTransform:cs.textTransform, lineHeight:cs.lineHeight
      });
      m.textContent = FINAL_INTRO;
      document.body.appendChild(m);
      const r = m.getBoundingClientRect();
      document.body.removeChild(m);
      introHeading.style.whiteSpace = 'nowrap';
      introHeading.style.display    = 'inline-block';
      introHeading.style.width      = Math.ceil(r.width)  + 'px';
      introHeading.style.height     = Math.ceil(r.height) + 'px';
    })();

    // Reserve vertical space under the intro for the tallest wrapped title
    function reserveTitleHeight(){
      const containerWidth = Math.max(0, Math.floor(heroText.getBoundingClientRect().width));
      if(!containerWidth) return;
      const probe = document.createElement('h2');
      const cs = getComputedStyle(titleEl);
      Object.assign(probe.style, {
        position:'absolute', left:'-99999px', top:'-99999px', visibility:'hidden',
        whiteSpace:'normal', width: containerWidth + 'px', margin:'0',
        fontFamily:cs.fontFamily, fontSize:cs.fontSize, fontWeight:cs.fontWeight,
        letterSpacing:cs.letterSpacing, textTransform:cs.textTransform, lineHeight:cs.lineHeight
      });
      document.body.appendChild(probe);
      let maxH = 0;
      for(const t of TITLES){ probe.textContent = t; maxH = Math.max(maxH, Math.ceil(probe.getBoundingClientRect().height)); }
      document.body.removeChild(probe);
      titleStack.style.height = (maxH || 0) + 'px';
    }

    function scrambleIn(finalText, el, duration=1200){
      return new Promise(res=>{
        const pool='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const start=performance.now();
        function frame(now){
          const t=Math.min((now-start)/duration,1);
          const reveal=Math.floor(t*finalText.length);
          let out=finalText.slice(0,reveal);
          for(let i=reveal;i<finalText.length;i++){
            const ch=finalText[i];
            out+=(ch===' '||/[.,!?]/.test(ch))?ch:pool[(Math.random()*pool.length)|0];
          }
          el.textContent=out;
          if(t<1) requestAnimationFrame(frame); else { el.textContent=finalText; res(); }
        }
        requestAnimationFrame(frame);
      });
    }

    // fade the single title element out -> set text -> fade in
    let idx = 0, timer = null;
    function showNextTitle(){
      const next = TITLES[idx];
      if(hasGSAP){
        try{
          gsap.to(titleEl, { opacity:0, y:-6, duration:.25, ease:'power2.out',
            onComplete: ()=>{
              titleEl.textContent = next;
              gsap.fromTo(titleEl,{ opacity:0, y:8 },{ opacity:1, y:0, duration:.45, ease:'power2.out' });
            }
          });
        }catch{
          titleEl.style.opacity='0';
          titleEl.textContent = next;
          requestAnimationFrame(()=>{
            titleEl.style.transition='opacity .45s ease, transform .45s ease';
            titleEl.style.transform='translateY(0)';
            titleEl.style.opacity='1';
          });
        }
      }else{
        titleEl.style.opacity='0';
        setTimeout(()=>{
          titleEl.textContent = next;
          titleEl.style.transition='opacity .45s ease';
          titleEl.style.opacity='1';
        }, 200);
      }
      idx = (idx+1) % TITLES.length;
    }
    function startCycle(){ if(timer) clearInterval(timer); showNextTitle(); timer=setInterval(showNextTitle, PERIOD); }
    function stopCycle(){ if(timer){ clearInterval(timer); timer=null; } }

    titleEl.textContent = TITLES[0];
    reserveTitleHeight();

    scrambleIn(FINAL_INTRO, introHeading, 1200).then(()=>{
      if (hasGSAP && fadeTargets.length) gsap.to(fadeTargets, { opacity: 1, duration:.5, stagger:.08, ease:'power2.out' });
      else fadeTargets.forEach(el => el.style.opacity = 1);
      startCycle();
    });

    let resizeTO=null;
    window.addEventListener('resize', ()=>{
      if(resizeTO) clearTimeout(resizeTO);
      resizeTO=setTimeout(reserveTitleHeight, 120);
    }, { passive:true });

    document.addEventListener('visibilitychange', ()=> document.hidden ? stopCycle() : startCycle());
  }

  function initVanta(){
    const el = document.getElementById('vanta-bg');
    if(!el) return;

    if(state.prefersReducedMotion || (state.isMobile && state.deviceMemory <= 2)){
      el.style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color') || '#0f0f1a';
      return;
    }

    let vanta = null;
    const mount = () => {
      if(vanta || !window.VANTA || !window.VANTA.FOG || !window.THREE) return;
      vanta = window.VANTA.FOG({
        el,
        THREE: window.THREE,
        mouseControls: !state.isMobile,
        touchControls: false,
        gyroControls: false,
        highlightColor: 0xbb86fc,
        midtoneColor:   0x0c0c18,
        lowlightColor:  0x02020a,
        baseColor:      0x0b0b14,
        blurFactor: state.isMobile ? 0.9 : 1.0,
        speed:      state.isMobile ? 0.6 : 0.8,
        zoom:       state.isMobile ? 0.25 : 0.22,
      });
    };

    const tryMount = () => {
      if(window.VANTA && window.VANTA.FOG && window.THREE){ mount(); return; }
      let attempts = 0;
      const id = setInterval(()=>{
        attempts++;
        if(window.VANTA && window.VANTA.FOG && window.THREE){ clearInterval(id); mount(); }
        if(attempts > 40){ clearInterval(id); }
      }, 100);
    };

    tryMount();

    document.addEventListener('visibilitychange', () => {
      if(document.hidden){
        if(vanta && vanta.destroy){ vanta.destroy(); vanta = null; }
      }else{
        tryMount();
      }
    });

    window.addEventListener('beforeunload', () => {
      if(vanta && vanta.destroy){ vanta.destroy(); vanta = null; }
    });
  }

  function initHamburger(){
    const hamburger=document.querySelector('.hamburger');
    const menu=document.querySelector('nav ul');
    if(!hamburger||!menu) return;
    hamburger.addEventListener('click',()=>{
      const active=menu.classList.toggle('active');
      hamburger.setAttribute('aria-expanded',active);
      hamburger.innerHTML = active? '<i class="fa-solid fa-times"></i>' : '<i class="fa-solid fa-bars"></i>';
      if(active) menu.querySelector('a')?.focus();
    });
  }

  function initActiveLinkObserver(){
    const sections=document.querySelectorAll('section[id], header[id]');
    const links=document.querySelectorAll('nav ul li a');
    const setActive=(id)=>{
      links.forEach(a=>{
        const match=a.getAttribute('href')?.slice(1)===id;
        a.classList.toggle('active-link',match);
        if(match) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current');
      });
    };
    const observer=new IntersectionObserver(
      entries=>entries.forEach(e=> e.isIntersecting && setActive(e.target.id)),
      {threshold: state.isMobile? .4:.55}
    );
    sections.forEach(s=>observer.observe(s));
  }

  function initAutoHideNav(){
    const nav=document.querySelector('nav');
    if(!nav) return;
    let last=window.scrollY;
    onScrollRAF(()=>{
      const y=window.scrollY;
      if(y>last && y>100) nav.classList.add('navbar-hidden');
      else nav.classList.remove('navbar-hidden');
      last=y;
    });
  }

  function initSwiper(){
    if(!window.Swiper) return;
    const el=document.querySelector('.about-swiper');
    if(!el) return;

    const useCube = !state.prefersReducedMotion;
    const opts = {
      initialSlide: 1,
      loop: true,
      speed: 700,
      effect: useCube ? 'cube' : 'slide',
      slidesPerView: 1,
      centeredSlides: true,
      spaceBetween: 16,
      grabCursor: true,
      keyboard: { enabled:true },
      mousewheel: { forceToAxis:true, releaseOnEdges:true },
      navigation: { nextEl: '.swiper-button-next.simple-swiper-btn', prevEl: '.swiper-button-prev.simple-swiper-btn' },
      pagination: { el: '.swiper-pagination', clickable: true },
      on: {
        slideChangeTransitionStart(swiper){
          const content = swiper.slides[swiper.activeIndex]?.querySelector('.about-slide-content');
          if(content && window.gsap){
            try{ gsap.fromTo(content,{y:30,opacity:0},{y:0,opacity:1,duration:.4,ease:'power2.out'}); }catch{}
          }
        },
      },
    };
    if(useCube){
      opts.cubeEffect = { shadow:true, slideShadows:true, shadowOffset:35, shadowScale:0.9 };
      opts.autoHeight = false;
    }else{
      opts.autoHeight = true;
    }
    new Swiper('.about-swiper', opts);
  }

  function drawExperienceConnectors(){
    const container=document.querySelector('.experience-timeline');
    if(!container) return;

    let svg=container.querySelector('svg.exp-wires');
    if(!svg){
      svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
      svg.classList.add('exp-wires');
      container.prepend(svg);
    }

    const cRect=container.getBoundingClientRect();
    const w=cRect.width, h=cRect.height;
    svg.setAttribute('width',w); svg.setAttribute('height',h); svg.setAttribute('viewBox',`0 0 ${w} ${h}`);
    while(svg.firstChild) svg.removeChild(svg.firstChild);

    const centerX=w/2;
    const spineWidth=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--exp-spine-width'))||6;
    const spineHalf=spineWidth/2;

    const items=[...container.querySelectorAll('.experience-item')];
    items.forEach((item)=>{
      const r=item.getBoundingClientRect();
      const y=r.top - cRect.top + 30;
      const isRight=item.classList.contains('right');
      const endX = isRight ? (r.left - cRect.left) + 8 : (r.left - cRect.left) + r.width - 8;
      const startX=centerX + (isRight ? -spineHalf : spineHalf);
      const c1x=startX + (isRight ? 60 : -60);
      const c2x=endX   + (isRight ? -60 : 60);
      const p=document.createElementNS('http://www.w3.org/2000/svg','path');
      p.setAttribute('d',`M ${startX} ${y} C ${c1x} ${y}, ${c2x} ${y}, ${endX} ${y}`);
      p.setAttribute('class','dashed');
      svg.appendChild(p);
    });
  }

  function initExperienceWires(){
    const container=document.querySelector('.experience-timeline');
    if(!container) return;
    const ro=new ResizeObserver(()=> requestAnimationFrame(drawExperienceConnectors));
    ro.observe(container);
    document.addEventListener('exp:toggle',()=> requestAnimationFrame(drawExperienceConnectors));
    setTimeout(()=> requestAnimationFrame(drawExperienceConnectors), 120);
  }

  function initExperienceAccordion(){
    const items=document.querySelectorAll('.experience-item');
    items.forEach((item,idx)=>{
      const header=item.querySelector('.experience-header');
      const panel=item.querySelector('.experience-panel');
      if(!header||!panel) return;
      item.classList.toggle('right', idx%2===0);
      item.classList.toggle('left',  idx%2===1);
      const id=panel.id || `exp-panel-${idx+1}`;
      panel.id=id; header.setAttribute('aria-controls',id);
      const toggle=()=>{
        const isOpen=item.classList.toggle('open');
        header.setAttribute('aria-expanded', String(isOpen));
        panel.hidden=!isOpen;
        document.dispatchEvent(new CustomEvent('exp:toggle'));
      };
      header.addEventListener('click',toggle);
      header.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); toggle(); } });
    });
    const first=items[0];
    if(first){
      first.classList.add('open');
      first.querySelector('.experience-header')?.setAttribute('aria-expanded','true');
      const p=first.querySelector('.experience-panel'); if(p) p.hidden=false;
      document.dispatchEvent(new CustomEvent('exp:toggle'));
    }
  }

  window.addEventListener('DOMContentLoaded', ()=>{
    initAOS();
    initSmoothScroll();
    initHero();                 
    initHamburger();
    initActiveLinkObserver();
    initAutoHideNav();
    initVanta();
    initSwiper();
    initExperienceAccordion();
    initExperienceWires();
  });
})();

