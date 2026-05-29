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

  // --- Testimonial Slider ---
  const testimonialTrack = document.querySelector('.testimonial-track');
  const testimonialSlides = Array.from(document.querySelectorAll('.testimonial-slide'));
  const testimonialDotsContainer = document.querySelector('.testimonial-dots');

  if (testimonialTrack && testimonialSlides.length > 0) {
    let currentTestimonialIndex = 0;
    let testimonialAutoplayInterval;
    const testimonialAutoplayDelay = 6000; // 6 seconds autoplay

    // Create dots dynamically
    testimonialSlides.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.classList.add('testimonial-dot');
      if (index === 0) dot.classList.add('active');
      dot.setAttribute('aria-label', `Feedback ${index + 1}`);
      testimonialDotsContainer.appendChild(dot);
    });

    const testimonialDots = Array.from(testimonialDotsContainer.querySelectorAll('.testimonial-dot'));

    const moveToTestimonial = (index) => {
      if (index < 0) index = testimonialSlides.length - 1;
      if (index >= testimonialSlides.length) index = 0;

      testimonialTrack.style.transform = `translateX(-${index * 100}%)`;

      testimonialDots.forEach(dot => dot.classList.remove('active'));
      testimonialDots[index].classList.add('active');

      currentTestimonialIndex = index;
    };

    const nextTestimonial = () => {
      moveToTestimonial(currentTestimonialIndex + 1);
    };

    testimonialDots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        moveToTestimonial(index);
        resetTestimonialAutoplay();
      });
    });

    const startTestimonialAutoplay = () => {
      testimonialAutoplayInterval = setInterval(nextTestimonial, testimonialAutoplayDelay);
    };

    const stopTestimonialAutoplay = () => {
      clearInterval(testimonialAutoplayInterval);
    };

    const resetTestimonialAutoplay = () => {
      stopTestimonialAutoplay();
      startTestimonialAutoplay();
    };

    const sliderContainer = document.querySelector('.testimonial-slider-container');
    if (sliderContainer) {
      sliderContainer.addEventListener('mouseenter', stopTestimonialAutoplay);
      sliderContainer.addEventListener('mouseleave', startTestimonialAutoplay);
    }

    startTestimonialAutoplay();

    // Swipe support
    let startX = 0;
    let isSwiping = false;

    testimonialTrack.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      isSwiping = true;
      stopTestimonialAutoplay();
    }, { passive: true });

    testimonialTrack.addEventListener('touchmove', (e) => {
      if (!isSwiping) return;
      const diffX = startX - e.touches[0].clientX;
      if (Math.abs(diffX) > 50) {
        if (diffX > 0) {
          moveToTestimonial(currentTestimonialIndex + 1);
        } else {
          moveToTestimonial(currentTestimonialIndex - 1);
        }
        isSwiping = false;
        resetTestimonialAutoplay();
      }
    }, { passive: true });

    testimonialTrack.addEventListener('touchend', () => {
      isSwiping = false;
      startTestimonialAutoplay();
    });
  }
});

// ==========================================
//  THREE.JS — 3D Architectural House Model
// ==========================================
(function initCity3D() {
  var canvas = document.getElementById('city3d-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  var wrap = canvas.parentElement;
  var w = wrap.clientWidth;
  var h = wrap.clientHeight || 480;

  // --- Renderer ---
  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(w, h);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  // --- Scene ---
  var scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0c1a2e);

  // --- Camera (isometric-like) ---
  var camera = new THREE.PerspectiveCamera(35, w / h, 0.1, 200);
  camera.position.set(12, 10, 12);
  camera.lookAt(0, 3, 0);

  // =============================
  //  Lighting
  // =============================
  scene.add(new THREE.AmbientLight(0x4466aa, 0.5));

  var sunLight = new THREE.DirectionalLight(0xffeedd, 0.8);
  sunLight.position.set(8, 15, 8);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.set(1024, 1024);
  sunLight.shadow.camera.near = 0.5;
  sunLight.shadow.camera.far = 50;
  sunLight.shadow.camera.left = -15;
  sunLight.shadow.camera.right = 15;
  sunLight.shadow.camera.top = 15;
  sunLight.shadow.camera.bottom = -15;
  scene.add(sunLight);

  var fillLight = new THREE.DirectionalLight(0xffcc88, 0.3);
  fillLight.position.set(-5, 8, 10);
  scene.add(fillLight);

  var rimLight = new THREE.DirectionalLight(0x4488cc, 0.25);
  rimLight.position.set(5, 3, -8);
  scene.add(rimLight);

  // =============================
  //  Materials
  // =============================
  var matWallExt = new THREE.MeshStandardMaterial({ color: 0xe8e0d4, roughness: 0.7, metalness: 0.05 });
  var matWallInt = new THREE.MeshStandardMaterial({ color: 0xf5f0e8, roughness: 0.8, metalness: 0.0 });
  var matFloor1 = new THREE.MeshStandardMaterial({ color: 0xc4a882, roughness: 0.5, metalness: 0.1 });
  var matFloor2 = new THREE.MeshStandardMaterial({ color: 0xd4c4a8, roughness: 0.4, metalness: 0.1 });
  var matConcrete = new THREE.MeshStandardMaterial({ color: 0x8a8a8a, roughness: 0.9, metalness: 0.05 });
  var matGlass = new THREE.MeshStandardMaterial({
    color: 0x88ccee, roughness: 0.05, metalness: 0.9,
    transparent: true, opacity: 0.35
  });
  var matGlassFrame = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.3, metalness: 0.8 });
  var matDoor = new THREE.MeshStandardMaterial({ color: 0x5a3a1a, roughness: 0.6, metalness: 0.1 });
  var matRoof = new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.4, metalness: 0.5 });
  var matGreen = new THREE.MeshStandardMaterial({ color: 0x3a8a3a, roughness: 0.8, metalness: 0.0 });
  var matGreenDark = new THREE.MeshStandardMaterial({ color: 0x2a6a2a, roughness: 0.8, metalness: 0.0 });
  var matFurniture = new THREE.MeshStandardMaterial({ color: 0x6a5a4a, roughness: 0.6, metalness: 0.1 });
  var matSofa = new THREE.MeshStandardMaterial({ color: 0x4a6080, roughness: 0.7, metalness: 0.0 });
  var matBed = new THREE.MeshStandardMaterial({ color: 0xe0d8d0, roughness: 0.8, metalness: 0.0 });
  var matKitchen = new THREE.MeshStandardMaterial({ color: 0xf0f0f0, roughness: 0.3, metalness: 0.4 });
  var matAccent = new THREE.MeshStandardMaterial({ color: 0xdd8833, roughness: 0.5, metalness: 0.2 });
  var matWood = new THREE.MeshStandardMaterial({ color: 0x8a6a4a, roughness: 0.6, metalness: 0.1 });
  var matTile = new THREE.MeshStandardMaterial({ color: 0xd0d0d0, roughness: 0.3, metalness: 0.15 });
  var matBalcony = new THREE.MeshStandardMaterial({ color: 0xc0b8a8, roughness: 0.5, metalness: 0.15 });

  // Building dimensions
  var BW = 5, BD = 8, FH = 2.8, wallT = 0.12;
  var house = new THREE.Group();

  // Helper
  function box(mat, bw, bh, bd, x, y, z) {
    var m = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bd), mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    return m;
  }

  // =============================
  //  GROUND FLOOR (Shop)
  // =============================
  house.add(box(matTile, BW, 0.15, BD, 0, 0.075, 0));
  house.add(box(matWallExt, BW, FH, wallT, 0, FH/2, -BD/2));
  house.add(box(matWallExt, wallT, FH, BD, -BW/2, FH/2, 0));
  house.add(box(matWallExt, wallT, FH, BD * 0.35, BW/2, FH/2, -BD/2 + BD * 0.175));

  // Glass facade
  for (var gi = 0; gi < 3; gi++) {
    var gx = -1.5 + gi * 1.5;
    house.add(box(matGlass, 1.2, FH - 0.4, 0.04, gx, FH/2, BD/2));
    house.add(box(matGlassFrame, 0.06, FH, 0.06, gx - 0.63, FH/2, BD/2));
    house.add(box(matGlassFrame, 0.06, FH, 0.06, gx + 0.63, FH/2, BD/2));
    house.add(box(matGlassFrame, 1.32, 0.06, 0.06, gx, FH - 0.1, BD/2));
  }

  // Shelves
  for (var si = 0; si < 3; si++) {
    house.add(box(matFurniture, 0.3, 1.2, 1.5, -1.5 + si * 1.5, 0.75, -0.5));
  }
  // Counter
  house.add(box(matKitchen, 2.5, 0.9, 0.5, 0, 0.45, 2.5));
  house.add(box(matAccent, 2.5, 0.05, 0.55, 0, 0.92, 2.5));

  // =============================
  //  2ND FLOOR (Living)
  // =============================
  var f2y = FH;
  house.add(box(matConcrete, BW, 0.15, BD, 0, f2y + 0.075, 0));
  house.add(box(matFloor1, BW - 0.3, 0.02, BD - 0.3, 0, f2y + 0.16, 0));
  house.add(box(matWallExt, BW, FH, wallT, 0, f2y + FH/2, -BD/2));
  house.add(box(matWallExt, wallT, FH, BD, -BW/2, f2y + FH/2, 0));
  house.add(box(matWallInt, wallT * 0.8, FH - 0.3, BD * 0.6, -0.5, f2y + FH/2, -BD/2 + BD * 0.3));

  // Balcony
  house.add(box(matBalcony, BW, 0.1, 1.2, 0, f2y + 0.05, BD/2 + 0.6));
  for (var bi = 0; bi < 6; bi++) {
    house.add(box(matGlassFrame, 0.04, 0.8, 0.04, -2 + bi * 0.8, f2y + 0.45, BD/2 + 1.15));
  }
  house.add(box(matGlassFrame, BW, 0.04, 0.04, 0, f2y + 0.85, BD/2 + 1.15));
  house.add(box(matGlass, BW - 0.2, 0.6, 0.03, 0, f2y + 0.5, BD/2 + 1.15));

  // Sofa
  house.add(box(matSofa, 2.0, 0.35, 0.8, 1.2, f2y + 0.33, 1.5));
  house.add(box(matSofa, 2.0, 0.55, 0.15, 1.2, f2y + 0.43, 1.1));
  // Coffee table
  house.add(box(matWood, 0.9, 0.25, 0.5, 1.2, f2y + 0.28, 2.5));

  // Kitchen
  house.add(box(matKitchen, 1.8, 0.85, 0.5, -1.5, f2y + 0.58, -3.2));
  house.add(box(matConcrete, 1.8, 0.03, 0.55, -1.5, f2y + 1.02, -3.2));

  // Dining table
  house.add(box(matWood, 1.2, 0.05, 0.7, -1.5, f2y + 0.72, -1.5));
  house.add(box(matWood, 0.06, 0.55, 0.06, -2.0, f2y + 0.44, -1.8));
  house.add(box(matWood, 0.06, 0.55, 0.06, -1.0, f2y + 0.44, -1.8));
  house.add(box(matWood, 0.06, 0.55, 0.06, -2.0, f2y + 0.44, -1.2));
  house.add(box(matWood, 0.06, 0.55, 0.06, -1.0, f2y + 0.44, -1.2));

  // Window
  house.add(box(matGlass, 0.03, 1.2, 1.5, -BW/2, f2y + FH/2 + 0.2, 1));

  // =============================
  //  3RD FLOOR (Bedrooms)
  // =============================
  var f3y = FH * 2;
  house.add(box(matConcrete, BW, 0.15, BD, 0, f3y + 0.075, 0));
  house.add(box(matFloor2, BW - 0.3, 0.02, BD - 0.3, 0, f3y + 0.16, 0));
  house.add(box(matWallExt, BW, FH, wallT, 0, f3y + FH/2, -BD/2));
  house.add(box(matWallExt, wallT, FH, BD, -BW/2, f3y + FH/2, 0));
  house.add(box(matWallInt, BW * 0.8, FH - 0.3, wallT * 0.8, 0.2, f3y + FH/2, -1));
  house.add(box(matWallInt, wallT * 0.8, FH - 0.3, BD * 0.35, 1, f3y + FH/2, -BD/2 + BD * 0.175));

  // Master bed
  house.add(box(matBed, 1.4, 0.25, 1.8, -1, f3y + 0.28, 2));
  house.add(box(matBed, 1.4, 0.45, 0.15, -1, f3y + 0.38, 1.1));
  house.add(box(matKitchen, 0.5, 0.1, 0.3, -1.2, f3y + 0.45, 1.25));
  house.add(box(matKitchen, 0.5, 0.1, 0.3, -0.8, f3y + 0.45, 1.25));

  // Second bed
  house.add(box(matBed, 1.2, 0.2, 1.6, 1.8, f3y + 0.26, 2.2));
  house.add(box(matBed, 1.2, 0.35, 0.12, 1.8, f3y + 0.33, 1.4));

  // Wardrobe
  house.add(box(matFurniture, 1.5, 1.8, 0.4, -1.5, f3y + 1.05, -3.0));

  // Front balcony
  house.add(box(matBalcony, BW, 0.1, 0.8, 0, f3y + 0.05, BD/2 + 0.4));
  house.add(box(matGlass, BW - 0.2, 0.7, 0.03, 0, f3y + 0.5, BD/2 + 0.75));
  house.add(box(matGlassFrame, BW, 0.04, 0.04, 0, f3y + 0.88, BD/2 + 0.75));

  // =============================
  //  ROOF / Rooftop Terrace
  // =============================
  var rfy = FH * 3;
  house.add(box(matRoof, BW + 0.3, 0.12, BD + 0.3, 0, rfy + 0.06, 0));
  house.add(box(matWallExt, BW + 0.3, 0.5, wallT, 0, rfy + 0.37, -BD/2 - 0.15));
  house.add(box(matWallExt, BW + 0.3, 0.5, wallT, 0, rfy + 0.37, BD/2 + 0.15));
  house.add(box(matWallExt, wallT, 0.5, BD + 0.3, -BW/2 - 0.15, rfy + 0.37, 0));

  // Plants
  function addPlant(px, py, pz, size) {
    house.add(box(matConcrete, size * 0.5, size * 0.35, size * 0.5, px, py + size * 0.175, pz));
    var leaf = new THREE.Mesh(new THREE.SphereGeometry(size * 0.4, 8, 6),
      Math.random() > 0.5 ? matGreen : matGreenDark);
    leaf.position.set(px, py + size * 0.6, pz);
    leaf.castShadow = true;
    house.add(leaf);
  }
  addPlant(-2, rfy + 0.12, 3, 0.7);
  addPlant(-1, rfy + 0.12, 3.2, 0.5);
  addPlant(1.5, rfy + 0.12, 3, 0.6);
  addPlant(2.2, rfy + 0.12, -3, 0.8);
  addPlant(-2, rfy + 0.12, -3.2, 0.5);

  // Tree
  var trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 1.2, 8), matWood);
  trunk.position.set(2, rfy + 0.72, 2);
  house.add(trunk);
  var canopy = new THREE.Mesh(new THREE.SphereGeometry(0.6, 8, 8), matGreen);
  canopy.position.set(2, rfy + 1.5, 2);
  canopy.castShadow = true;
  house.add(canopy);

  // AC unit
  house.add(box(matConcrete, 0.8, 0.5, 0.6, -1.8, rfy + 0.37, -2));

  // =============================
  //  Interior Lights
  // =============================
  var light1 = new THREE.PointLight(0xffcc66, 0.6, 6);
  light1.position.set(0, FH * 0.8, 1);
  scene.add(light1);
  var light2 = new THREE.PointLight(0xffdd88, 0.5, 6);
  light2.position.set(0, f2y + FH * 0.8, 0);
  scene.add(light2);
  var light3 = new THREE.PointLight(0xffeebb, 0.4, 6);
  light3.position.set(0, f3y + FH * 0.8, 1);
  scene.add(light3);

  // =============================
  //  Base Platform
  // =============================
  var base = new THREE.Mesh(new THREE.BoxGeometry(BW + 3, 0.2, BD + 3),
    new THREE.MeshStandardMaterial({ color: 0x1a2840, roughness: 0.4, metalness: 0.6 }));
  base.position.set(0, -0.1, 0);
  base.receiveShadow = true;
  scene.add(base);

  var grass = new THREE.Mesh(new THREE.BoxGeometry(BW + 2.5, 0.04, BD + 2.5),
    new THREE.MeshStandardMaterial({ color: 0x2a5a2a, roughness: 0.9 }));
  grass.position.set(0, 0.02, 0);
  grass.receiveShadow = true;
  scene.add(grass);

  house.add(box(matTile, BW + 1, 0.05, 1.5, 0, 0.025, BD/2 + 2));
  scene.add(house);

  // =============================
  //  Starfield
  // =============================
  var starCount = 400;
  var starGeo = new THREE.BufferGeometry();
  var starPos = new Float32Array(starCount * 3);
  for (var i = 0; i < starCount; i++) {
    var theta = Math.random() * Math.PI * 2;
    var phi = Math.acos(Math.random() * 0.6 + 0.4);
    var sr = 80;
    starPos[i * 3] = sr * Math.sin(phi) * Math.cos(theta);
    starPos[i * 3 + 1] = sr * Math.cos(phi);
    starPos[i * 3 + 2] = sr * Math.sin(phi) * Math.sin(theta);
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({
    color: 0xffffff, size: 0.15, transparent: true, opacity: 0.6, sizeAttenuation: true
  })));

  // =============================
  //  Animation
  // =============================
  var clock = new THREE.Clock();
  var isVisible = true;

  function animate() {
    requestAnimationFrame(animate);
    if (!isVisible) return;

    var t = clock.getElapsedTime();

    var radius = 16;
    var speed = 0.08;
    camera.position.x = Math.cos(t * speed) * radius;
    camera.position.z = Math.sin(t * speed) * radius;
    camera.position.y = 8 + Math.sin(t * 0.1) * 1.5;
    camera.lookAt(0, 3.5, 0);

    light1.intensity = 0.55 + Math.sin(t * 1.2) * 0.05;
    light2.intensity = 0.45 + Math.sin(t * 0.9 + 1) * 0.05;
    light3.intensity = 0.35 + Math.sin(t * 1.5 + 2) * 0.05;

    renderer.render(scene, camera);
  }

  animate();

  // --- Resize ---
  window.addEventListener('resize', function() {
    w = wrap.clientWidth;
    h = wrap.clientHeight || 480;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });

  // --- Visibility (performance) ---
  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function(entries) {
      isVisible = entries[0].isIntersecting;
    }, { threshold: 0.1 });
    obs.observe(wrap);
  }
})();
