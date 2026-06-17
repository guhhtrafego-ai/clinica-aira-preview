(function () {
  'use strict';

  const header = document.getElementById('header');
  const menuToggle = document.getElementById('menuToggle');
  const nav = document.getElementById('nav');
  const navLinks = document.querySelectorAll('.nav-link');

  /* Header scroll effect */
  function handleScroll() {
    if (window.scrollY > 60) {
      header.classList.add('header--scrolled');
    } else {
      header.classList.remove('header--scrolled');
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  /* Dropdown nav */
  const dropdownTrigger = document.querySelector('.nav-dropdown__trigger');
  const dropdownMenu = document.querySelector('.nav-dropdown__menu');

  if (dropdownTrigger && dropdownMenu) {
    dropdownTrigger.addEventListener('click', function (e) {
      e.stopPropagation();
      const isOpen = dropdownMenu.classList.toggle('open');
      dropdownTrigger.setAttribute('aria-expanded', isOpen);
    });

    document.addEventListener('click', function () {
      dropdownMenu.classList.remove('open');
      dropdownTrigger.setAttribute('aria-expanded', 'false');
    });

    dropdownMenu.querySelectorAll('.nav-dropdown__item:not(.nav-dropdown__item--soon)').forEach(function (item) {
      item.addEventListener('click', function () {
        dropdownMenu.classList.remove('open');
        dropdownTrigger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* Mobile menu */
  if (menuToggle && nav) {
    menuToggle.addEventListener('click', function () {
      const isOpen = nav.classList.toggle('open');
      menuToggle.classList.toggle('active');
      menuToggle.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    navLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('open');
        menuToggle.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  /* Active nav link on scroll */
  const sections = document.querySelectorAll('section[id]');

  function setActiveLink() {
    const scrollPos = window.scrollY + 120;

    sections.forEach(function (section) {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(function (link) {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + id) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', setActiveLink, { passive: true });

  /* Reveal on scroll */
  const revealElements = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    revealElements.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    revealElements.forEach(function (el) {
      el.classList.add('visible');
    });
  }

  /* Before / After Sliders */
  document.querySelectorAll('[data-slider]').forEach(function (slider) {
    const after = slider.querySelector('.ba-slider__after');
    const handle = slider.querySelector('.ba-slider__handle');
    let active = false;
    let introduced = false;

    function setPos(pct) {
      after.style.clipPath = 'inset(0 ' + (100 - pct).toFixed(2) + '% 0 0)';
      handle.style.left = pct.toFixed(2) + '%';
    }

    function setPosFromClientX(clientX) {
      const rect = slider.getBoundingClientRect();
      const pct = Math.max(5, Math.min(95, ((clientX - rect.left) / rect.width) * 100));
      setPos(pct);
    }

    function animateTo(pct, duration) {
      return new Promise(function (resolve) {
        after.style.transition = 'clip-path ' + duration + 'ms ease-in-out';
        handle.style.transition = 'left ' + duration + 'ms ease-in-out';
        setPos(pct);
        setTimeout(function () {
          after.style.transition = '';
          handle.style.transition = '';
          resolve();
        }, duration);
      });
    }

    function introAnimation() {
      if (introduced) return;
      introduced = true;
      setPos(50);
      /* Varre: centro → antes → depois, para em 70% */
      setTimeout(function () {
        animateTo(15, 800).then(function () {
          setTimeout(function () {
            animateTo(70, 900);
          }, 300);
        });
      }, 500);
    }

    function markInteracted() {
      slider.classList.add('interacted');
    }

    slider.addEventListener('mousedown', function (e) {
      active = true;
      markInteracted();
      setPosFromClientX(e.clientX);
      e.preventDefault();
    });
    window.addEventListener('mousemove', function (e) { if (active) setPosFromClientX(e.clientX); });
    window.addEventListener('mouseup', function () { active = false; });

    slider.addEventListener('touchstart', function (e) {
      active = true;
      markInteracted();
      setPosFromClientX(e.touches[0].clientX);
    }, { passive: true });
    window.addEventListener('touchmove', function (e) { if (active) setPosFromClientX(e.touches[0].clientX); }, { passive: true });
    window.addEventListener('touchend', function () { active = false; });

    /* Animação de entrada quando o card entra na tela */
    if ('IntersectionObserver' in window) {
      var introObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            introAnimation();
            introObserver.unobserve(slider);
          }
        });
      }, { threshold: 0.45 });
      introObserver.observe(slider);
    }
  });

  /* Smooth anchor scroll — respeita header fixo */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const headerHeight = header ? header.offsetHeight : 80;
        const top = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });
})();
