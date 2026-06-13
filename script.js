/* ============================================================
   Sandesh Giri — Cybersecurity Portfolio · Main Script
   Vanilla JS · ES6+
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  /* ----------------------------------------------------------
     0. GLOBAL CONSTANTS & HELPERS
  ---------------------------------------------------------- */
  const NAVBAR_HEIGHT = 80;
  const SCROLL_THRESHOLD = 50;
  const BACK_TO_TOP_THRESHOLD = 500;

  /** Utility: querySelector shorthand */
  const qs = (sel, ctx = document) => ctx.querySelector(sel);
  const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ==========================================================
     0.5. EMAILJS CONFIGURATION
  ========================================================== */
  const EMAILJS_SERVICE_ID = 'service_5t8df1j';
  const EMAILJS_TEMPLATE_ID = 'template_7djjb7h';
  const EMAILJS_USER_ID = 'IraKUIfFfz2Croa4Y';

  const EMAILJS_CDN = 'https://cdn.emailjs.com/sdk/3.2.0/email.min.js';

  const loadEmailJSScript = () => new Promise((resolve, reject) => {
    if (window.emailjs && typeof window.emailjs.init === 'function') {
      try { window.emailjs.init(EMAILJS_USER_ID); } catch (e) {}
      return resolve();
    }

    const existing = Array.from(document.getElementsByTagName('script')).find(s => s.src && s.src.includes('cdn.emailjs.com'));
    if (existing) {
      const handleLoaded = () => {
        try { window.emailjs.init(EMAILJS_USER_ID); } catch (e) {}
        if (window.emailjs && typeof window.emailjs.init === 'function') {
          resolve();
        } else {
          reject(new Error('EmailJS script loaded but emailjs global is not available'));
        }
      };

      if (existing.readyState === 'complete' || existing.readyState === 'loaded' || existing.complete) {
        handleLoaded();
        return;
      }

      const timer = setTimeout(() => reject(new Error('EmailJS script load timeout')), 5000);
      existing.addEventListener('load', () => { clearTimeout(timer); handleLoaded(); });
      existing.addEventListener('error', () => { clearTimeout(timer); reject(new Error('EmailJS script failed to load')); });
      return;
    }

    const timer = setTimeout(() => reject(new Error('EmailJS script load timeout')), 5000);
    const s = document.createElement('script');
    s.src = EMAILJS_CDN;
    s.async = true;
    s.onload = () => {
      clearTimeout(timer);
      try { window.emailjs.init(EMAILJS_USER_ID); } catch (e) {}
      resolve();
    };
    s.onerror = () => {
      clearTimeout(timer);
      reject(new Error('EmailJS script failed to load'));
    };
    document.head.appendChild(s);
  });

  /* ==========================================================
     1. SMOOTH SCROLL NAVIGATION
  ========================================================== */
  const navLinks = qsa('a[href^="#"]');

  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId === '#') return;

      const target = qs(targetId);
      if (!target) return;

      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - NAVBAR_HEIGHT;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* --- Active nav link via Intersection Observer --- */
  const sections = qsa('section[id]');
  const navItems = qsa('.nav-links a, .nav-menu a');

  const activateNavLink = (id) => {
    navItems.forEach((link) => {
      link.classList.toggle(
        'active',
        link.getAttribute('href') === `#${id}`
      );
    });
  };

  if (sections.length) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            activateNavLink(entry.target.id);
          }
        });
      },
      {
        rootMargin: `-${NAVBAR_HEIGHT}px 0px -40% 0px`,
        threshold: 0.1,
      }
    );

    sections.forEach((sec) => sectionObserver.observe(sec));
  }

  /* ==========================================================
     2. NAVBAR BEHAVIOR
  ========================================================== */
  const nav = qs('nav') || qs('.navbar');
  const hamburger = qs('.hamburger, .menu-toggle, .nav-toggle');
  const mobileMenu = qs('.nav-links, .nav-menu, .mobile-menu');

  // --- Scrolled class ---
  const handleNavScroll = () => {
    if (!nav) return;
    if (window.scrollY > SCROLL_THRESHOLD) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll(); // initial check

  // --- Hamburger toggle ---
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      mobileMenu.classList.toggle('active');
      document.body.classList.toggle('menu-open');
    });

    // Close mobile menu when a link is clicked
    qsa('a', mobileMenu).forEach((link) => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.classList.remove('menu-open');
      });
    });
  }

  /* ==========================================================
     3a. HERO TYPING EFFECT
  ========================================================== */
  const typingElement = qs('.typing-text, .typed-text, #typed-text');

  if (typingElement) {
    const titles = [
      'Cybersecurity Professional',
      'Penetration Tester',
      'Full-Stack Developer',
      'AI Security Researcher',
    ];

    const TYPING_SPEED = 100;   // ms per character
    const DELETING_SPEED = 50;  // ms per character
    const PAUSE_DURATION = 2000; // ms to hold completed word

    let titleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    const type = () => {
      const currentTitle = titles[titleIndex];

      if (!isDeleting) {
        // Typing forward
        charIndex++;
        typingElement.textContent = currentTitle.substring(0, charIndex);

        if (charIndex === currentTitle.length) {
          // Finished typing — pause, then start deleting
          isDeleting = true;
          setTimeout(type, PAUSE_DURATION);
          return;
        }
        setTimeout(type, TYPING_SPEED);
      } else {
        // Deleting
        charIndex--;
        typingElement.textContent = currentTitle.substring(0, charIndex);

        if (charIndex === 0) {
          isDeleting = false;
          titleIndex = (titleIndex + 1) % titles.length;
          setTimeout(type, TYPING_SPEED);
          return;
        }
        setTimeout(type, DELETING_SPEED);
      }
    };

    type();
  }

  /* ==========================================================
     3b. ANIMATED PARTICLE / NODE BACKGROUND (Canvas)
  ========================================================== */
  const heroSection = qs('#hero, .hero, .hero-section');

  if (heroSection) {
    // Create & inject canvas
    const canvas = document.createElement('canvas');
    canvas.id = 'particle-canvas';
    canvas.style.cssText =
      'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;';
    heroSection.style.position = heroSection.style.position || 'relative';
    heroSection.prepend(canvas);

    const ctx = canvas.getContext('2d');
    const PARTICLE_COUNT = 80;
    const CONNECTION_DISTANCE = 150;
    const PARTICLE_COLOR = { r: 0, g: 212, b: 255 }; // #00d4ff
    let particles = [];
    let animId;

    const resizeCanvas = () => {
      canvas.width = heroSection.offsetWidth;
      canvas.height = heroSection.offsetHeight;
    };

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1; // 1–3 px
        this.vx = (Math.random() - 0.5) * 0.8;
        this.vy = (Math.random() - 0.5) * 0.8;
        this.opacity = Math.random() * 0.5 + 0.3;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Wrap around edges
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
      }

      draw() {
        const { r, g, b } = PARTICLE_COLOR;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${this.opacity})`;
        ctx.fill();
      }
    }

    const initParticles = () => {
      particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());
    };

    const drawConnections = () => {
      const { r, g, b } = PARTICLE_COLOR;

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONNECTION_DISTANCE) {
            const opacity = (1 - dist / CONNECTION_DISTANCE) * 0.25;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(${r},${g},${b},${opacity})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
    };

    const animateParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      drawConnections();
      animId = requestAnimationFrame(animateParticles);
    };

    resizeCanvas();
    initParticles();
    animateParticles();

    window.addEventListener('resize', () => {
      resizeCanvas();
      // Re-scatter particles so they don't bunch after resize
      particles.forEach((p) => p.reset());
    });
  }

  /* ==========================================================
     4. SCROLL ANIMATIONS (animate-on-scroll)
  ========================================================== */
  const animatedElements = qsa('.animate-on-scroll');

  if (animatedElements.length) {
    const scrollAnimObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animated');
            // Optionally stop observing after animation fires once
            scrollAnimObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    animatedElements.forEach((el) => scrollAnimObserver.observe(el));
  }

  /* ==========================================================
     5. PROJECT FILTERING
  ========================================================== */
  const filterButtons = qsa('.filter-btn, .project-filter-btn, [data-filter]');
  const projectCards = qsa('.project-card, .portfolio-card');

  if (filterButtons.length && projectCards.length) {
    filterButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        // Update active state
        filterButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.filter || btn.textContent.trim().toLowerCase();

        projectCards.forEach((card) => {
          const category = (card.dataset.category || '').toLowerCase();
          const shouldShow = filter === 'all' || category === filter;

          if (shouldShow) {
            card.style.display = '';
            // Trigger reflow, then fade in
            requestAnimationFrame(() => {
              card.style.opacity = '1';
              card.style.transform = 'scale(1)';
            });
          } else {
            card.style.opacity = '0';
            card.style.transform = 'scale(0.8)';
            // Hide after transition
            setTimeout(() => {
              card.style.display = 'none';
            }, 350);
          }
        });
      });
    });

    // Ensure project cards have transition styles for smooth filtering
    projectCards.forEach((card) => {
      card.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
    });
  }

  /* ==========================================================
     6. TESTIMONIALS CAROUSEL
  ========================================================== */
  const carousel = qs('.testimonial-carousel, .testimonials-carousel, .carousel');
  const slides = qsa(
    '.testimonial-slide, .testimonial-card, .carousel-slide',
    carousel || document
  );
  const prevBtn = qs('.carousel-prev, .prev-btn, .testimonial-prev');
  const nextBtn = qs('.carousel-next, .next-btn, .testimonial-next');
  const dotsContainer = qs('.carousel-dots, .testimonial-dots');

  if (carousel && slides.length) {
    let currentSlide = 0;
    let autoRotateInterval = null;
    const AUTO_ROTATE_DELAY = 5000;

    // Build dot indicators if container exists
    const dots = [];
    if (dotsContainer) {
      slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.classList.add('carousel-dot');
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
        dots.push(dot);
      });
    }

    const goToSlide = (index) => {
      slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
        slide.style.opacity = i === index ? '1' : '0';
        slide.style.position = i === index ? 'relative' : 'absolute';
        slide.style.visibility = i === index ? 'visible' : 'hidden';
      });
      dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
      currentSlide = index;
    };

    const nextSlide = () => goToSlide((currentSlide + 1) % slides.length);
    const prevSlide = () => goToSlide((currentSlide - 1 + slides.length) % slides.length);

    // Initialize
    slides.forEach((s) => {
      s.style.transition = 'opacity 0.5s ease, visibility 0.5s ease';
    });
    goToSlide(0);

    // Auto-rotate
    const startAutoRotate = () => {
      stopAutoRotate();
      autoRotateInterval = setInterval(nextSlide, AUTO_ROTATE_DELAY);
    };

    const stopAutoRotate = () => {
      if (autoRotateInterval) clearInterval(autoRotateInterval);
    };

    startAutoRotate();

    // Pause on hover, resume on leave
    carousel.addEventListener('mouseenter', stopAutoRotate);
    carousel.addEventListener('mouseleave', startAutoRotate);

    // Manual controls
    if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); startAutoRotate(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); startAutoRotate(); });
  }

  /* ==========================================================
     7. CONTACT FORM VALIDATION
  ========================================================== */
  const contactForm = qs('#contact-form, .contact-form, form[name="contact"]');

  if (contactForm) {
    const fields = {
      name: {
        el: qs('input[name="name"], #form-name', contactForm),
        rules: [
          { test: (v) => v.trim().length > 0, msg: 'Name is required.' },
          { test: (v) => v.trim().length >= 2, msg: 'Name must be at least 2 characters.' },
        ],
      },
      email: {
        el: qs('input[name="email"], #form-email', contactForm),
        rules: [
          { test: (v) => v.trim().length > 0, msg: 'Email is required.' },
          {
            test: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
            msg: 'Please enter a valid email address.',
          },
        ],
      },
      message: {
        el: qs('textarea[name="message"], #form-message', contactForm),
        rules: [
          { test: (v) => v.trim().length > 0, msg: 'Message is required.' },
          { test: (v) => v.trim().length >= 10, msg: 'Message must be at least 10 characters.' },
        ],
      },
    };

    /** Show / clear inline error for a field */
    const showError = (input, message) => {
      let errorEl = input.parentElement.querySelector('.error-message');
      if (!errorEl) {
        errorEl = document.createElement('span');
        errorEl.className = 'error-message';
        errorEl.style.cssText = 'color:#ff4d4d;font-size:0.85rem;margin-top:4px;display:block;';
        input.parentElement.appendChild(errorEl);
      }
      errorEl.textContent = message;
      input.classList.add('input-error');
      input.classList.remove('input-valid');
    };

    const clearError = (input) => {
      const errorEl = input.parentElement.querySelector('.error-message');
      if (errorEl) errorEl.textContent = '';
      input.classList.remove('input-error');
    };

    /** Validate a single field, return true if valid */
    const validateField = (key) => {
      const { el, rules } = fields[key];
      if (!el) return true;
      const value = el.value;
      for (const rule of rules) {
        if (!rule.test(value)) {
          showError(el, rule.msg);
          return false;
        }
      }
      clearError(el);
      el.classList.add('input-valid');
      return true;
    };

    // Visual feedback on focus / blur
    Object.values(fields).forEach(({ el }) => {
      if (!el) return;
      el.addEventListener('focus', () => el.classList.add('input-focus'));
      el.addEventListener('blur', () => {
        el.classList.remove('input-focus');
        // Validate on blur for immediate feedback
        const key = Object.keys(fields).find((k) => fields[k].el === el);
        if (key) validateField(key);
      });
    });

    // Submit handler
    const submitButton = qs('#submit-btn', contactForm);
    const submitButtonText = submitButton ? submitButton.querySelector('.btn-text') : null;

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      let isValid = true;
      Object.keys(fields).forEach((key) => {
        if (!validateField(key)) isValid = false;
      });

      if (!isValid) return;

      if (submitButton) {
        submitButton.disabled = true;
        if (submitButtonText) submitButtonText.textContent = 'Sending...';
      }

      try {
        if (!window.emailjs || typeof window.emailjs.sendForm !== 'function') {
          try {
            await loadEmailJSScript();
          } catch (loadErr) {
            console.error('EmailJS load error:', loadErr);
            showToast('Unable to send message. Email service unavailable — please email sandeshgiri736@gmail.com', 7000);
            return;
          }
        }

        await window.emailjs.sendForm(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ID,
          contactForm
        );

        showToast('Message sent successfully! I\'ll get back to you soon. 🚀');
        contactForm.reset();
        Object.values(fields).forEach(({ el }) => {
          if (el) {
            el.classList.remove('input-valid', 'input-error');
            clearError(el);
          }
        });
      } catch (error) {
        console.error('EmailJS error:', error);
        showToast('Unable to send message. Please try again later.', 5000);
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          if (submitButtonText) submitButtonText.textContent = 'Send Message';
        }
      }
    });
  }

  /** Toast notification */
  const showToast = (message, duration = 3000) => {
    // Remove any existing toast
    const existing = qs('.toast-notification');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 30px;
      right: 30px;
      background: linear-gradient(135deg, #00d4ff, #0a84ff);
      color: #fff;
      padding: 16px 28px;
      border-radius: 10px;
      font-size: 0.95rem;
      font-weight: 500;
      box-shadow: 0 8px 30px rgba(0, 212, 255, 0.35);
      z-index: 10000;
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 0.4s ease, transform 0.4s ease;
    `;
    document.body.appendChild(toast);

    // Trigger entrance
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    });

    // Auto-dismiss
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(20px)';
      toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    }, duration);
  };

  /* ==========================================================
     8. COUNTER ANIMATION (Stat Numbers)
  ========================================================== */
  const statNumbers = qsa('.stat-number, .counter, [data-count]');

  if (statNumbers.length) {
    const COUNTER_DURATION = 2000; // ms

    const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

    const animateCounter = (el) => {
      const target = parseInt(el.dataset.count || el.textContent, 10);
      if (isNaN(target)) return;

      // Preserve any suffix like '+' or '%'
      const rawText = el.textContent.trim();
      const suffix = rawText.replace(/[\d,]+/, '');

      const startTime = performance.now();
      el.textContent = '0' + suffix;

      const tick = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / COUNTER_DURATION, 1);
        const value = Math.round(easeOutQuart(progress) * target);

        el.textContent = value.toLocaleString() + suffix;

        if (progress < 1) {
          requestAnimationFrame(tick);
        }
      };

      requestAnimationFrame(tick);
    };

    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    statNumbers.forEach((el) => counterObserver.observe(el));
  }

  /* ==========================================================
     9. BACK TO TOP BUTTON
  ========================================================== */
  // Create button dynamically
  const backToTopBtn = document.createElement('button');
  backToTopBtn.id = 'back-to-top';
  backToTopBtn.setAttribute('aria-label', 'Back to top');
  backToTopBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
         fill="none" stroke="currentColor" stroke-width="2.5"
         stroke-linecap="round" stroke-linejoin="round">
      <polyline points="18 15 12 9 6 15"></polyline>
    </svg>`;
  backToTopBtn.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    border: none;
    background: linear-gradient(135deg, #00d4ff, #0a84ff);
    color: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 20px rgba(0, 212, 255, 0.4);
    opacity: 0;
    visibility: hidden;
    transform: translateY(10px);
    transition: opacity 0.35s ease, visibility 0.35s ease, transform 0.35s ease, background 0.3s ease;
    z-index: 9999;
  `;
  document.body.appendChild(backToTopBtn);

  const toggleBackToTop = () => {
    if (window.scrollY > BACK_TO_TOP_THRESHOLD) {
      backToTopBtn.style.opacity = '1';
      backToTopBtn.style.visibility = 'visible';
      backToTopBtn.style.transform = 'translateY(0)';
    } else {
      backToTopBtn.style.opacity = '0';
      backToTopBtn.style.visibility = 'hidden';
      backToTopBtn.style.transform = 'translateY(10px)';
    }
  };

  window.addEventListener('scroll', toggleBackToTop, { passive: true });
  toggleBackToTop();

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ==========================================================
     10. SKILL CARD 3D TILT EFFECT
  ========================================================== */
  const skillCards = qsa('.skill-card, .skills-card');

  skillCards.forEach((card) => {
    const MAX_TILT = 12; // degrees

    card.style.transition = 'transform 0.15s ease-out';
    card.style.transformStyle = 'preserve-3d';

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left; // cursor x within card
      const y = e.clientY - rect.top;  // cursor y within card
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Normalise to -1 … 1
      const rotateY = ((x - centerX) / centerX) * MAX_TILT;
      const rotateX = ((centerY - y) / centerY) * MAX_TILT;

      card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(600px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    });
  });

  /* ==========================================================
     CONSOLE GREETING  🛡️
  ========================================================== */
  console.log(
    '%c🛡️ Sandesh Giri — Cybersecurity Portfolio',
    'color:#00d4ff;font-size:16px;font-weight:bold;'
  );
  console.log(
    '%cBuilt with passion & vanilla JS.',
    'color:#888;font-size:12px;'
  );
});
