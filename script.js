document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  // ============================================================
  // 1. SIDEBAR TOGGLE (Mobile)
  // ============================================================
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');

  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      sidebar.classList.toggle('open');
      const icon = menuToggle.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-times');
      }
    });

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function (e) {
      if (window.innerWidth <= 992) {
        const isClickInsideSidebar = sidebar.contains(e.target);
        const isClickOnToggle = menuToggle.contains(e.target);
        if (!isClickInsideSidebar && !isClickOnToggle && sidebar.classList.contains('open')) {
          sidebar.classList.remove('open');
          const icon = menuToggle.querySelector('i');
          if (icon) {
            icon.classList.add('fa-bars');
            icon.classList.remove('fa-times');
          }
        }
      }
    });
  }

  // ============================================================
  // 2. ACTIVE NAV LINK ON SCROLL
  // ============================================================
  const navLinks = document.querySelectorAll('.sidebar-nav a');
  const sections = document.querySelectorAll('.section');

  function updateActiveLink() {
    let current = '';
    const scrollPos = window.scrollY + 120;

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', updateActiveLink);
  window.addEventListener('load', updateActiveLink);

  // ============================================================
  // 3. SMOOTH SCROLL FOR NAV LINKS
  // ============================================================
  navLinks.forEach((link) => {
    link.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(targetId);
        if (target) {
          // Close sidebar on mobile after click
          if (window.innerWidth <= 992 && sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
            const icon = menuToggle.querySelector('i');
            if (icon) {
              icon.classList.add('fa-bars');
              icon.classList.remove('fa-times');
            }
          }
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  // ============================================================
  // 4. STAT COUNTER ANIMATION (Intersection Observer)
  // ============================================================
  const statNumbers = document.querySelectorAll('.stat-number');

  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'), 10);
    if (isNaN(target)) return;
    let current = 0;
    const increment = Math.ceil(target / 60);
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        el.textContent = target;
        clearInterval(timer);
      } else {
        el.textContent = current;
      }
    }, 25);
  }

  const statObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          // Only animate if not already animated
          if (!el.dataset.animated) {
            el.dataset.animated = 'true';
            animateCounter(el);
          }
        }
      });
    },
    { threshold: 0.5 }
  );

  statNumbers.forEach((stat) => statObserver.observe(stat));

  // ============================================================
  // 5. TESTIMONIALS SLIDER
  // ============================================================
  const track = document.getElementById('testimonialTrack');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const dotsContainer = document.getElementById('dotsContainer');

  if (track && prevBtn && nextBtn && dotsContainer) {
    const cards = track.querySelectorAll('.testimonial-card');
    const totalCards = cards.length;
    let currentIndex = 0;
    let visibleCards = 3;
    let cardWidth = 0;

    function getVisibleCards() {
      if (window.innerWidth <= 768) return 1;
      if (window.innerWidth <= 1200) return 2;
      return 3;
    }

    function getCardWidth() {
      const containerWidth = track.parentElement.offsetWidth;
      const gap = 30; // gap from CSS
      const vis = getVisibleCards();
      return (containerWidth - gap * (vis - 1)) / vis;
    }

    function createDots() {
      dotsContainer.innerHTML = '';
      const totalDots = Math.ceil(totalCards / getVisibleCards());
      for (let i = 0; i < totalDots; i++) {
        const dot = document.createElement('span');
        if (i === 0) dot.classList.add('active');
        dot.dataset.index = i;
        dot.addEventListener('click', function () {
          const idx = parseInt(this.dataset.index, 10);
          goToSlide(idx);
        });
        dotsContainer.appendChild(dot);
      }
    }

    function goToSlide(index) {
      const vis = getVisibleCards();
      const maxIndex = Math.ceil(totalCards / vis) - 1;
      if (index < 0) index = 0;
      if (index > maxIndex) index = maxIndex;
      currentIndex = index;

      const width = getCardWidth();
      const gap = 30;
      const offset = index * (width + gap);
      track.style.transform = `translateX(-${offset}px)`;

      // Update dots
      const dots = dotsContainer.querySelectorAll('span');
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });
    }

    function nextSlide() {
      const vis = getVisibleCards();
      const maxIndex = Math.ceil(totalCards / vis) - 1;
      if (currentIndex < maxIndex) {
        goToSlide(currentIndex + 1);
      } else {
        goToSlide(0);
      }
    }

    function prevSlide() {
      const vis = getVisibleCards();
      const maxIndex = Math.ceil(totalCards / vis) - 1;
      if (currentIndex > 0) {
        goToSlide(currentIndex - 1);
      } else {
        goToSlide(maxIndex);
      }
    }

    // Initialize
    createDots();
    goToSlide(0);

    // Event listeners
    nextBtn.addEventListener('click', nextSlide);
    prevBtn.addEventListener('click', prevSlide);

    // Recalculate on resize
    let resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        createDots();
        goToSlide(currentIndex);
      }, 200);
    });

    // Keyboard navigation (optional)
    document.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    });
  }

  // ============================================================
  // 6. CONTACT FORM (simple validation & feedback)
  // ============================================================
  const contactForm = document.getElementById('contactForm');
  const formFeedback = document.getElementById('formFeedback');

  if (contactForm && formFeedback) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const eventType = document.getElementById('eventType').value;
      const message = document.getElementById('message').value.trim();

      // Basic validation
      if (!name || !email || !eventType || !message) {
        formFeedback.className = 'form-feedback error';
        formFeedback.textContent = 'Please fill in all fields.';
        formFeedback.style.display = 'block';
        return;
      }

      // Simple email check
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        formFeedback.className = 'form-feedback error';
        formFeedback.textContent = 'Please enter a valid email address.';
        formFeedback.style.display = 'block';
        return;
      }

      // Simulate success
      formFeedback.className = 'form-feedback success';
      formFeedback.textContent = `Thank you, ${name}! We'll get back to you shortly. ✨`;
      formFeedback.style.display = 'block';

      // Reset form (optional)
      contactForm.reset();

      // Hide feedback after 6 seconds
      setTimeout(() => {
        formFeedback.style.display = 'none';
      }, 6000);
    });
  }

  // ============================================================
  // 7. GALLERY ITEM CLICK (lightbox simulation – optional)
  // ============================================================
  const galleryItems = document.querySelectorAll('.gallery-item');
  galleryItems.forEach((item) => {
    item.addEventListener('click', function () {
      const img = this.querySelector('img');
      if (img) {
        const src = img.getAttribute('src');
        // Simple alert showing the image – you can replace with a real lightbox
        // For a better experience, you could integrate a lightbox library.
        // We'll just log it.
        console.log('Gallery image clicked:', src);
        // Optional: window.open(src, '_blank');
      }
    });
  });

  console.log('✨ LIYA Events website loaded successfully!');
});