/**
 * Bwenke Educational Website JavaScript Interactions
 * Author: AI Coding Agent
 * Description: Clean, lightweight vanilla JS for animations, stats counters, responsive menu, and smooth scrolling.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Active Link Highlighting
  highlightActiveLink();

  // 2. Mobile Hamburger Menu Toggle
  initMobileMenu();

  // 3. Scroll Reveal Animations (IntersectionObserver)
  initScrollReveal();

  // 4. Animated Statistics Counters
  initStatsCounters();

  // 5. Typing Animation in Hero Section (Optional feature)
  initHeroTypingEffect();

  // 6. Back to Top Button Actions
  initBackToTop();

  // 7. Interactive Accordions (Subject and Courses notes/revision)
  initAccordions();

  // 8. Smooth Scrolling for Internal Hash Anchors
  initSmoothScrollAnchors();
});

/**
 * Highlights the current active navigation item based on current URL path.
 */
function highlightActiveLink() {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    link.classList.remove('active');
    
    // Extract filename from href
    const href = link.getAttribute('href');
    
    if (href) {
      const isHome = currentPath === '/' || currentPath.endsWith('index.html');
      
      if (isHome && (href === 'index.html' || href === '/')) {
        link.classList.add('active');
      } else if (!isHome && currentPath.includes(href)) {
        link.classList.add('active');
      }
    }
  });
}

/**
 * Manages mobile drawer menu states and transitions.
 */
function initMobileMenu() {
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');
  
  if (!hamburger || !navMenu) return;

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navMenu.classList.toggle('open');
    
    // Prevent background scrolling when menu is open
    if (navMenu.classList.contains('open')) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  });

  // Close menu when clicking on nav link (for local anchor jumps if any)
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

/**
 * Sets up the scroll-reveal engine using browser IntersectionObserver.
 */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          // Once revealed, we don't need to observe it again
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null, // Viewport
      threshold: 0.12, // 12% visible
      rootMargin: '0px 0px -50px 0px' // Slightly trigger before entering viewport fully
    });

    revealElements.forEach(el => {
      revealObserver.observe(el);
    });
  } else {
    // Fallback if IntersectionObserver not supported
    revealElements.forEach(el => {
      el.classList.add('revealed');
    });
  }
}

/**
 * Animates numerical stats counters from 0 to target value when scrolled into view.
 */
function initStatsCounters() {
  const counterElements = document.querySelectorAll('.stat-number');
  
  if (counterElements.length === 0) return;

  if ('IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const targetElement = entry.target;
          animateCounter(targetElement);
          observer.unobserve(targetElement); // Animate once
        }
      });
    }, {
      threshold: 0.5
    });

    counterElements.forEach(el => {
      counterObserver.observe(el);
    });
  } else {
    // Fallback direct update
    counterElements.forEach(el => {
      const target = parseInt(el.getAttribute('data-target'), 10) || 0;
      el.textContent = formatStatNumber(target, el.getAttribute('data-suffix'));
    });
  }
}

/**
 * Animates a single counter element.
 */
function animateCounter(element) {
  const target = parseInt(element.getAttribute('data-target'), 10) || 0;
  const suffix = element.getAttribute('data-suffix') || '';
  const duration = 2000; // Animation duration in ms
  const frameRate = 1000 / 60; // 60fps
  const totalFrames = Math.round(duration / frameRate);
  
  let currentFrame = 0;
  
  const timer = setInterval(() => {
    currentFrame++;
    // Easing out function: quad out
    const progress = currentFrame / totalFrames;
    const easedProgress = progress * (2 - progress);
    const currentValue = Math.floor(easedProgress * target);
    
    element.textContent = currentValue + suffix;
    
    if (currentFrame >= totalFrames) {
      clearInterval(timer);
      element.textContent = target + suffix;
    }
  }, frameRate);
}

/**
 * Utility helper to format numbers for stats
 */
function formatStatNumber(num, suffix = '') {
  return num + suffix;
}

/**
 * Handles typing animation on index.html hero banner.
 */
function initHeroTypingEffect() {
  const typingElement = document.querySelector('.typing-animation');
  if (!typingElement) return;

  const stringsAttr = typingElement.getAttribute('data-strings');
  if (!stringsAttr) return;

  const strings = stringsAttr.split(',').map(s => s.trim());
  let stringIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 100;

  function type() {
    const currentString = strings[stringIndex];
    
    if (isDeleting) {
      // Deleting character
      typingElement.textContent = currentString.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 50; // Faster deleting
    } else {
      // Writing character
      typingElement.textContent = currentString.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 120; // Default writing speed
    }

    // Checking states
    if (!isDeleting && charIndex === currentString.length) {
      // Pause at full word
      typingSpeed = 2000;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      // Go to next string
      stringIndex = (stringIndex + 1) % strings.length;
      typingSpeed = 500; // Brief pause before typing next word
    }

    setTimeout(type, typingSpeed);
  }

  // Start typing
  setTimeout(type, 1000);
}

/**
 * Initializes scrolling triggers for Back to Top floating button.
 */
function initBackToTop() {
  const backToTopBtn = document.querySelector('.back-to-top');
  const header = document.querySelector('.header');
  
  if (!backToTopBtn) return;

  window.addEventListener('scroll', () => {
    const scrollPosition = window.scrollY;
    
    // Toggle Back to Top button visibility
    if (scrollPosition > 400) {
      backToTopBtn.classList.add('show');
    } else {
      backToTopBtn.classList.remove('show');
    }

    // Toggle Header size styling on scroll
    if (header) {
      if (scrollPosition > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
  });

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

/**
 * Custom clean accordion logic for Notes & Revision Materials
 */
function initAccordions() {
  const accordionHeaders = document.querySelectorAll('.accordion-header');
  
  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const content = header.nextElementSibling;
      const isOpen = item.classList.contains('open');
      
      // Close all other accordions (exclusive model)
      const siblingItems = item.parentElement.querySelectorAll('.accordion-item');
      siblingItems.forEach(sibling => {
        if (sibling !== item) {
          sibling.classList.remove('open');
          sibling.querySelector('.accordion-content').style.maxHeight = null;
        }
      });
      
      // Toggle current item
      if (isOpen) {
        item.classList.remove('open');
        content.style.maxHeight = null;
      } else {
        item.classList.add('open');
        content.style.maxHeight = content.scrollHeight + 'px';
      }
    });
  });
}

/**
 * Activates smooth-scrolling behavior for any local hash links (e.g., "#intro", "#objectives").
 */
function initSmoothScrollAnchors() {
  const localLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');
  
  localLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      const targetEl = document.querySelector(targetId);
      
      if (targetEl) {
        e.preventDefault();
        
        // Compensate for fixed header height
        const headerOffset = 80;
        const elementPosition = targetEl.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerOffset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}
