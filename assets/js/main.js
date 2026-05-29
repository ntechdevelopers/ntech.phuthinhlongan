document.addEventListener('DOMContentLoaded', () => {
  // --- Sticky Header on Scroll ---
  const header = document.querySelector('header');
  const handleScroll = () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', handleScroll);
  handleScroll(); // Initial check

  // --- Mobile Menu Toggle ---
  const menuToggle = document.querySelector('.mobile-nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('open');
    navMenu.classList.toggle('open');
    document.body.classList.toggle('no-scroll');
  });

  // Close mobile menu on link click
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      menuToggle.classList.remove('open');
      navMenu.classList.remove('open');
      document.body.classList.remove('no-scroll');
    });
  });

  // --- Smooth Scrolling for Navigation Links ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        const headerHeight = header.offsetHeight;
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // --- Scroll Spy: Active Link Highlight ---
  const sections = document.querySelectorAll('section, header');
  const spyOptions = {
    root: null,
    rootMargin: '-20% 0px -60% 0px', // Trigger when section is in the middle of viewport
    threshold: 0
  };

  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        let id = entry.target.getAttribute('id');
        // Handle case where hero is in view but has no id or is a header
        if (!id && entry.target.tagName === 'HEADER') id = 'trang-chu';
        
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }, spyOptions);

  sections.forEach(section => {
    if (section.id) {
      spyObserver.observe(section);
    }
  });

  // --- Stats Counter Animation ---
  const statsSection = document.querySelector('.stats-bar');
  const statNumbers = document.querySelectorAll('.stat-number');
  let animated = false;

  const animateCounters = () => {
    statNumbers.forEach(stat => {
      const target = parseInt(stat.getAttribute('data-target'), 10);
      const suffix = stat.getAttribute('data-suffix') || '';
      let count = 0;
      const duration = 2000; // 2 seconds animation
      const speed = duration / target;
      
      const updateCount = () => {
        // Calculate increment step to look smooth
        const increment = Math.ceil(target / 40); 
        if (count < target) {
          count += increment;
          if (count > target) count = target;
          stat.innerHTML = count + `<span>${suffix}</span>`;
          setTimeout(updateCount, 40);
        } else {
          stat.innerHTML = target + `<span>${suffix}</span>`;
        }
      };
      
      updateCount();
    });
  };

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animateCounters();
        animated = true; // Run only once
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  if (statsSection) {
    statsObserver.observe(statsSection);
  }

  // --- Interactive Projects Carousel ---
  const track = document.querySelector('.carousel-track');
  const slides = Array.from(document.querySelectorAll('.carousel-slide'));
  const nextButton = document.querySelector('.carousel-btn-next');
  const prevButton = document.querySelector('.carousel-btn-prev');
  const dotsContainer = document.querySelector('.carousel-dots');
  
  if (track && slides.length > 0) {
    let currentIndex = 0;
    let autoplayInterval;
    const autoplayDelay = 5000; // 5 seconds autoplay

    // Create dot indicators dynamically
    slides.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.classList.add('carousel-dot');
      if (index === 0) dot.classList.add('active');
      dot.setAttribute('aria-label', `Slide ${index + 1}`);
      dotsContainer.appendChild(dot);
    });

    const dots = Array.from(dotsContainer.querySelectorAll('.carousel-dot'));

    // Move to slide
    const moveToSlide = (index) => {
      if (index < 0) index = slides.length - 1;
      if (index >= slides.length) index = 0;

      track.style.transform = `translateX(-${index * 100}%)`;
      
      // Update active dot
      dots.forEach(dot => dot.classList.remove('active'));
      dots[index].classList.add('active');
      
      currentIndex = index;
    };

    // Next slide action
    const nextSlide = () => {
      moveToSlide(currentIndex + 1);
    };

    // Prev slide action
    const prevSlide = () => {
      moveToSlide(currentIndex - 1);
    };

    // Event listeners for controls
    nextButton.addEventListener('click', () => {
      nextSlide();
      resetAutoplay();
    });

    prevButton.addEventListener('click', () => {
      prevSlide();
      resetAutoplay();
    });

    // Dot indicators action
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        moveToSlide(index);
        resetAutoplay();
      });
    });

    // Autoplay implementation
    const startAutoplay = () => {
      autoplayInterval = setInterval(nextSlide, autoplayDelay);
    };

    const stopAutoplay = () => {
      clearInterval(autoplayInterval);
    };

    const resetAutoplay = () => {
      stopAutoplay();
      startAutoplay();
    };

    // Pause autoplay on mouse enter / resume on mouse leave
    const carouselContainer = document.querySelector('.carousel-container');
    carouselContainer.addEventListener('mouseenter', stopAutoplay);
    carouselContainer.addEventListener('mouseleave', startAutoplay);

    // Initial start
    startAutoplay();

    // Touch swipe support for mobile
    let startX = 0;
    let isSwiping = false;

    track.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      isSwiping = true;
      stopAutoplay();
    }, { passive: true });

    track.addEventListener('touchmove', (e) => {
      if (!isSwiping) return;
      const diffX = startX - e.touches[0].clientX;
      // If swiped significantly
      if (Math.abs(diffX) > 50) {
        if (diffX > 0) {
          nextSlide();
        } else {
          prevSlide();
        }
        isSwiping = false; // Trigger once per swipe gesture
      }
    }, { passive: true });

    track.addEventListener('touchend', () => {
      isSwiping = false;
      startAutoplay();
    });
  }
});
