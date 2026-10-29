/**
 * VANTA AUTOMOTIVE — INTERACTIVE ENGINE
 * High-performance, modular JavaScript powering animations, physics telemetry, 
 * acoustic synthesis, bespoke configurator, and interactive hotspots.
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // =========================================================================
  // 1. CUSTOM CURSOR (Smooth Lerp Follower)
  // =========================================================================
  const CustomCursor = (() => {
    const dot = document.getElementById('cursorDot');
    const follower = document.getElementById('cursorFollower');

    if (!dot || !follower) return;

    // Disable on touch devices
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      dot.style.display = 'none';
      follower.style.display = 'none';
      return;
    }

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let followerX = mouseX;
    let followerY = mouseY;
    let isTicking = false;
    const DELTA_THRESHOLD = 0.15;

    function renderCursor() {
      // Direct dot tracks mouse position immediately
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;

      // Smooth lerp for circular follower
      const dx = mouseX - followerX;
      const dy = mouseY - followerY;
      followerX += dx * 0.18;
      followerY += dy * 0.18;
      follower.style.transform = `translate(${followerX}px, ${followerY}px)`;

      // Only continue loop while delta is above threshold
      if (Math.abs(dx) > DELTA_THRESHOLD || Math.abs(dy) > DELTA_THRESHOLD) {
        requestAnimationFrame(renderCursor);
      } else {
        // Snap to exact coordinates and sleep rAF loop to save CPU & battery
        followerX = mouseX;
        followerY = mouseY;
        follower.style.transform = `translate(${followerX}px, ${followerY}px)`;
        isTicking = false;
      }
    }

    // Wake up animation loop strictly on mouse movement
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isTicking) {
        isTicking = true;
        requestAnimationFrame(renderCursor);
      }
    }, { passive: true });

    // Handle cursor leaving / entering window
    document.addEventListener('mouseleave', () => {
      dot.style.opacity = '0';
      follower.style.opacity = '0';
    });

    document.addEventListener('mouseenter', () => {
      dot.style.opacity = '1';
      follower.style.opacity = '1';
    });

    // Hover detection for interactive targets
    const interactiveSelectors = 'a, button, [data-hover], input[type="range"], .swatch-btn, .hotspot-trigger';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(interactiveSelectors)) {
        follower.classList.add('hovering');
      }
    });

    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(interactiveSelectors)) {
        follower.classList.remove('hovering');
      }
    });

    document.addEventListener('mousedown', () => {
      follower.style.transform += ' scale(0.85)';
    });
  })();

  // =========================================================================
  // 2. NAVIGATION & SCROLL SYSTEM
  // =========================================================================
  const Navigation = (() => {
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('navHamburger');
    const mobileDrawer = document.getElementById('mobileDrawer');
    const drawerLinks = document.querySelectorAll('.drawer-link');

    // Scroll solid state
    function updateNavbar() {
      if (window.scrollY > 40) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
    window.addEventListener('scroll', updateNavbar, { passive: true });
    updateNavbar();

    // Mobile drawer toggle
    if (hamburger && mobileDrawer) {
      hamburger.addEventListener('click', () => {
        const isOpen = mobileDrawer.classList.contains('open');
        if (isOpen) {
          mobileDrawer.classList.remove('open');
          hamburger.classList.remove('active');
          hamburger.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        } else {
          mobileDrawer.classList.add('open');
          hamburger.classList.add('active');
          hamburger.setAttribute('aria-expanded', 'true');
          document.body.style.overflow = 'hidden';
        }
      });

      // Close on drawer link click
      drawerLinks.forEach((link) => {
        link.addEventListener('click', () => {
          mobileDrawer.classList.remove('open');
          hamburger.classList.remove('active');
          hamburger.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        });
      });
    }

    // Smooth scroll offset handling
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#' || !targetId.startsWith('#')) return;
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          const navHeight = navbar ? navbar.offsetHeight : 80;
          const targetPosition = targetEl.getBoundingClientRect().top + window.pageYOffset - (navHeight - 10);
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  })();

  // =========================================================================
  // 4. HERO SECTION ANIMATIONS & PARALLAX
  // =========================================================================
  const HeroEffects = (() => {
    const heroCarImg = document.getElementById('heroCarImg');
    const heroVisual = document.getElementById('heroVisual');

    // Mouse movement micro-parallax on hero image (desktop)
    if (heroVisual && window.innerWidth > 992) {
      window.addEventListener('mousemove', (e) => {
        const xPos = (e.clientX / window.innerWidth - 0.5) * 18;
        const yPos = (e.clientY / window.innerHeight - 0.5) * 12;
        heroVisual.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
      });
    }

    // GSAP Hero Entrance Sequence
    if (window.gsap) {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.from('.hero-badge-tag', { opacity: 0, y: -20, duration: 0.8, delay: 0.2 })
        .from('.hero-line', { opacity: 0, y: 40, stagger: 0.15, duration: 1 }, '-=0.5')
        .from('.hero-subheading', { opacity: 0, y: 20, duration: 0.8 }, '-=0.6')
        .from('.hero-cta-group', { opacity: 0, y: 20, duration: 0.8 }, '-=0.6')
        .from('#heroVisual', { opacity: 0, scale: 0.95, duration: 1.2 }, '-=1')
        .from('.scroll-indicator', { opacity: 0, duration: 0.8 }, '-=0.4');

      // ScrollTrigger Parallax
      if (window.ScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger);
        gsap.to('#heroCarImg', {
          y: 80,
          scale: 0.96,
          ease: 'none',
          scrollTrigger: {
            trigger: '#hero',
            start: 'top top',
            end: 'bottom top',
            scrub: true
          }
        });
      }
    }
  })();

  // =========================================================================
  // 5. INTRO BRAND STATEMENT (Scroll-based Word Reveal)
  // =========================================================================
  const IntroReveal = (() => {
    const words = document.querySelectorAll('.statement-word');
    if (!words.length) return;

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            words.forEach((word, index) => {
              setTimeout(() => {
                word.classList.add('in-view');
              }, index * 90);
            });
            observer.disconnect();
          }
        });
      }, { threshold: 0.25 });

      const introSection = document.getElementById('intro');
      if (introSection) observer.observe(introSection);
    } else {
      // Fallback
      words.forEach((w) => w.classList.add('in-view'));
    }
  })();

  // =========================================================================
  // 6. FEATURED MODEL: INTERACTIVE HOTSPOTS SYSTEM
  // =========================================================================
  const Hotspots = (() => {
    const hotspots = document.querySelectorAll('.hotspot');
    const pillButtons = document.querySelectorAll('.hotspot-pill-btn');

    function setActiveHotspot(id) {
      hotspots.forEach((h) => {
        const match = h.getAttribute('data-hotspot') === String(id);
        if (match) {
          h.classList.toggle('active');
          const trigger = h.querySelector('.hotspot-trigger');
          if (trigger) {
            trigger.setAttribute('aria-expanded', h.classList.contains('active') ? 'true' : 'false');
          }
        } else {
          h.classList.remove('active');
          const trigger = h.querySelector('.hotspot-trigger');
          if (trigger) trigger.setAttribute('aria-expanded', 'false');
        }
      });

      // Update pills
      pillButtons.forEach((pill) => {
        const match = pill.getAttribute('data-target') === String(id);
        const isActive = document.querySelector(`.hotspot[data-hotspot="${id}"]`)?.classList.contains('active');
        pill.classList.toggle('active', match && isActive);
      });
    }

    // Hotspot trigger clicks
    hotspots.forEach((spot) => {
      const trigger = spot.querySelector('.hotspot-trigger');
      const closeBtn = spot.querySelector('.card-close');
      const id = spot.getAttribute('data-hotspot');

      if (trigger) {
        trigger.addEventListener('click', (e) => {
          e.stopPropagation();
          setActiveHotspot(id);
        });
      }

      if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          spot.classList.remove('active');
          pillButtons.forEach((p) => p.classList.remove('active'));
        });
      }
    });

    // Pill clicks
    pillButtons.forEach((pill) => {
      pill.addEventListener('click', () => {
        const targetId = pill.getAttribute('data-target');
        setActiveHotspot(targetId);
      });
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.hotspot') && !e.target.closest('.hotspot-pill-btn')) {
        hotspots.forEach((h) => {
          h.classList.remove('active');
          const trigger = h.querySelector('.hotspot-trigger');
          if (trigger) trigger.setAttribute('aria-expanded', 'false');
        });
        pillButtons.forEach((p) => p.classList.remove('active'));
      }
    });
  })();

  // =========================================================================
  // 7. PERFORMANCE SECTION: ANIMATED TELEMETRY DASHBOARD
  // =========================================================================
  const TelemetryCounters = (() => {
    const dashboard = document.getElementById('telemetryDashboard');
    const counters = document.querySelectorAll('.counter');
    const barFills = document.querySelectorAll('.bar-fill');
    let hasAnimated = false;

    function animateValue(obj, start, end, duration, decimals) {
      let startTimestamp = null;
      const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        // Easing out cubic
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = start + (end - start) * easeOut;
        obj.textContent = decimals > 0 ? current.toFixed(decimals) : Math.floor(current);
        if (progress < 1) {
          window.requestAnimationFrame(step);
        } else {
          obj.textContent = decimals > 0 ? end.toFixed(decimals) : end;
        }
      };
      window.requestAnimationFrame(step);
    }

    function triggerCounters() {
      if (hasAnimated) return;
      hasAnimated = true;

      counters.forEach((counter) => {
        const target = parseFloat(counter.getAttribute('data-target')) || 0;
        const decimals = parseInt(counter.getAttribute('data-decimals'), 10) || 0;
        animateValue(counter, 0, target, 2000, decimals);
      });

      // Animate progress bars
      barFills.forEach((bar) => {
        const percent = getComputedStyle(bar).getPropertyValue('--percent') || '80%';
        bar.style.width = percent;
      });
    }

    if (dashboard && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            triggerCounters();
            observer.disconnect();
          }
        });
      }, { threshold: 0.3 });
      observer.observe(dashboard);
    }
  })();

  // =========================================================================
  // 8. PERFORMANCE INTERACTION: ACCELERATION SIMULATOR
  // =========================================================================
  const AccelerationSim = (() => {
    const slider = document.getElementById('accelSlider');
    const sliderFill = document.getElementById('sliderFill');
    const throttleTag = document.getElementById('throttlePercent');
    const liveSpeed = document.getElementById('liveSpeed');
    const liveTime = document.getElementById('liveTime');
    const liveGForce = document.getElementById('liveGForce');
    const livePower = document.getElementById('livePower');
    const graphHead = document.getElementById('graphHead');
    const graphGuideline = document.getElementById('graphGuideline');
    const launchBtn = document.getElementById('launchSimBtn');

    if (!slider) return;

    // Kinetic calculation formula
    // Input 0 - 100%
    function updateSimulation(val) {
      const percent = parseFloat(val);
      const ratio = percent / 100;

      // Update Slider fill bar & tag
      if (sliderFill) sliderFill.style.width = `${percent}%`;
      if (throttleTag) throttleTag.textContent = `THROTTLE: ${Math.round(percent)}%`;

      // Speed (km/h): Peak 320 with progressive power curve
      const speed = Math.round(320 * Math.pow(ratio, 0.85));

      // Elapsed Time (s): 0-100 km/h is 2.8s, full top speed 9.1s
      let time = 0;
      if (ratio > 0) {
        time = (2.8 * Math.pow(ratio * 3.2, 0.75)).toFixed(2);
      }

      // Longitudinal G-force: Peaks at 1.84G at initial torque hit, stabilizes at 0.52G
      let gforce = 0;
      if (ratio > 0) {
        gforce = (1.84 * (1 - ratio * 0.65)).toFixed(2);
      }

      // Motor Power Draw (kW): Up to 582 kW (780 HP equivalent)
      const power = Math.round(582 * Math.pow(ratio, 1.1));

      // DOM Updates
      if (liveSpeed) liveSpeed.textContent = speed;
      if (liveTime) liveTime.textContent = time;
      if (liveGForce) liveGForce.textContent = gforce;
      if (livePower) livePower.textContent = power;

      // Update SVG Kinetic curve point (Head Marker & Guide line)
      // ViewBox is 800 x 240. Curve start at X=40, Y=210; end at X=760, Y=30
      if (graphHead && graphGuideline) {
        const startX = 40;
        const endX = 760;
        const curX = startX + (endX - startX) * ratio;

        // Quadratic bezier approximation: Q 200,80
        const t = ratio;
        const curY = (1 - t) * (1 - t) * 210 + 2 * (1 - t) * t * 80 + t * t * 30;

        graphHead.setAttribute('cx', curX);
        graphHead.setAttribute('cy', curY);

        graphGuideline.setAttribute('x1', curX);
        graphGuideline.setAttribute('x2', curX);
        graphGuideline.setAttribute('y2', curY);
      }
    }

    slider.addEventListener('input', (e) => {
      updateSimulation(e.target.value);
    });

    // Launch Run Simulation Button
    let isLaunching = false;
    if (launchBtn) {
      launchBtn.addEventListener('click', () => {
        if (isLaunching) return;
        isLaunching = true;
        
        // Comprehensive accessibility state management
        launchBtn.disabled = true;
        launchBtn.setAttribute('aria-disabled', 'true');
        launchBtn.classList.add('disabled');
        if (slider) {
          slider.disabled = true;
          slider.setAttribute('aria-disabled', 'true');
        }

        let currentVal = 0;
        const duration = 3200; // 3.2 seconds launch sequence
        const startTime = performance.now();

        function launchStep(now) {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);

          // Exponential acceleration curve
          const val = Math.pow(progress, 1.2) * 100;
          slider.value = val;
          updateSimulation(val);

          if (progress < 1) {
            requestAnimationFrame(launchStep);
          } else {
            // Cool down back to 0 smoothly
            setTimeout(() => {
              let coolProgress = 0;
              const coolStart = performance.now();
              function coolStep(cNow) {
                coolProgress = Math.min((cNow - coolStart) / 1000, 1);
                const val = 100 * (1 - coolProgress);
                slider.value = val;
                updateSimulation(val);
                if (coolProgress < 1) {
                  requestAnimationFrame(coolStep);
                } else {
                  isLaunching = false;
                  // Re-enable interactive states for keyboard & screen reader accessibility
                  launchBtn.disabled = false;
                  launchBtn.removeAttribute('aria-disabled');
                  launchBtn.classList.remove('disabled');
                  if (slider) {
                    slider.disabled = false;
                    slider.removeAttribute('aria-disabled');
                  }
                }
              }
              requestAnimationFrame(coolStep);
            }, 800);
          }
        }
        requestAnimationFrame(launchStep);
      });
    }

    // Initial setup at 0%
    updateSimulation(0);
  })();

  // =========================================================================
  // 9. BESPOKE COLOR CONFIGURATOR
  // =========================================================================
  const Configurator = (() => {
    const configCarImg = document.getElementById('configCarImg');
    const carTintOverlay = document.getElementById('carTintOverlay');
    const carFinishGloss = document.getElementById('carFinishGloss');
    const selectedColorLabel = document.getElementById('selectedColorLabel');
    const selectedFinishLabel = document.getElementById('selectedFinishLabel');
    const selectedWheelLabel = document.getElementById('selectedWheelLabel');
    const watermarkColor = document.getElementById('watermarkColor');

    const configOptionsPrice = document.getElementById('configOptionsPrice');
    const configTotalPrice = document.getElementById('configTotalPrice');

    const swatches = document.querySelectorAll('.swatch-btn');
    const finishBtns = document.querySelectorAll('.finish-btn');
    const wheelBtns = document.querySelectorAll('.wheel-btn');

    // State
    const state = {
      basePrice: 185000,
      color: 'obsidian',
      colorName: 'OBSIDIAN',
      colorCost: 0,
      finish: 'gloss',
      finishName: 'METALLIC GLOSS',
      finishCost: 0,
      wheel: 'aeroblade',
      wheelName: '21" AERO-BLADE FORGED',
      wheelCost: 0
    };

    // Color Configurations & Styles
    const colorTreatments = {
      obsidian: {
        filterClass: 'color-filter-obsidian',
        tintBg: 'transparent',
        tintOpacity: 0,
        cost: 0
      },
      titanium: {
        filterClass: 'color-filter-titanium',
        tintBg: 'rgba(180, 195, 215, 0.25)',
        tintOpacity: 0.35,
        cost: 3500
      },
      arctic: {
        filterClass: 'color-filter-arctic',
        tintBg: 'rgba(235, 245, 255, 0.45)',
        tintOpacity: 0.5,
        cost: 4500
      },
      crimson: {
        filterClass: 'color-filter-crimson',
        tintBg: 'rgba(160, 20, 35, 0.45)',
        tintOpacity: 0.55,
        cost: 6000
      }
    };

    function updateView() {
      // 1. Color treatment
      const treat = colorTreatments[state.color];
      if (configCarImg) {
        configCarImg.className = `config-car-img ${treat.filterClass}`;
      }
      if (carTintOverlay) {
        carTintOverlay.style.backgroundColor = treat.tintBg;
        carTintOverlay.style.opacity = treat.tintOpacity;
      }

      // 2. Finish treatment
      if (carFinishGloss) {
        if (state.finish === 'gloss') {
          carFinishGloss.style.opacity = '0.22';
          carFinishGloss.style.mixBlendMode = 'overlay';
        } else if (state.finish === 'satin') {
          carFinishGloss.style.opacity = '0.08';
          carFinishGloss.style.mixBlendMode = 'hard-light';
        } else if (state.finish === 'carbon') {
          carFinishGloss.style.opacity = '0.35';
          carFinishGloss.style.mixBlendMode = 'color-burn';
        }
      }

      // 3. Labels
      if (selectedColorLabel) selectedColorLabel.textContent = state.colorName;
      if (selectedFinishLabel) selectedFinishLabel.textContent = state.finishName;
      if (selectedWheelLabel) selectedWheelLabel.textContent = state.wheelName;
      if (watermarkColor) watermarkColor.textContent = `${state.colorName} // ${state.finishName}`;

      // 4. Calculate Pricing
      const totalOptions = state.colorCost + state.finishCost + state.wheelCost;
      const total = state.basePrice + totalOptions;

      if (configOptionsPrice) {
        configOptionsPrice.textContent = totalOptions === 0 ? '+$0' : `+$${totalOptions.toLocaleString()}`;
      }
      if (configTotalPrice) {
        configTotalPrice.textContent = `$${total.toLocaleString()}`;
      }

      // Update reservation modal previews
      const reserveSummary = document.getElementById('reserveSummaryText');
      const reservePrice = document.getElementById('reserveModalPrice');
      if (reserveSummary) {
        reserveSummary.textContent = `Livery: ${state.colorName} &middot; Finish: ${state.finishName} &middot; Wheels: ${state.wheelName}`;
      }
      if (reservePrice) {
        reservePrice.textContent = `$${total.toLocaleString()}`;
      }
    }

    // Color Swatch Clicks
    swatches.forEach((swatch) => {
      swatch.addEventListener('click', () => {
        swatches.forEach((s) => {
          s.classList.remove('active');
          s.setAttribute('aria-checked', 'false');
        });
        swatch.classList.add('active');
        swatch.setAttribute('aria-checked', 'true');

        state.color = swatch.getAttribute('data-color');
        state.colorName = swatch.getAttribute('data-name');
        state.colorCost = colorTreatments[state.color]?.cost || 0;

        updateView();
      });
    });

    // Finish Clicks
    finishBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        finishBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        state.finish = btn.getAttribute('data-finish');
        state.finishName = btn.textContent.trim();
        state.finishCost = state.finish === 'carbon' ? 8500 : (state.finish === 'satin' ? 2500 : 0);

        updateView();
      });
    });

    // Wheel Clicks
    wheelBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        wheelBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        state.wheel = btn.getAttribute('data-wheel');
        state.wheelName = btn.textContent.trim();
        state.wheelCost = state.wheel === 'carbon-track' ? 4500 : 0;

        updateView();
      });
    });

    updateView();
  })();

  // =========================================================================
  // 9. COMMISSIONING & RESERVATION MODAL
  // =========================================================================
  const Modals = (() => {
    // Commissioning Modal elements
    const reserveModal = document.getElementById('reserveModal');
    const openReserveBtn = document.getElementById('openReserveModalBtn');
    const closeReserveBtn = document.getElementById('closeReserveBtn');
    const reserveBackdrop = document.getElementById('reserveModalBackdrop');
    const reserveForm = document.getElementById('reserveForm');

    // Reservation Modal Open / Close
    function openReserve() {
      if (!reserveModal) return;
      reserveModal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeReserve() {
      if (!reserveModal) return;
      reserveModal.classList.remove('open');
      document.body.style.overflow = '';
    }

    if (openReserveBtn) openReserveBtn.addEventListener('click', openReserve);
    if (closeReserveBtn) closeReserveBtn.addEventListener('click', closeReserve);
    if (reserveBackdrop) reserveBackdrop.addEventListener('click', closeReserve);

    // Reservation form submit
    if (reserveForm) {
      reserveForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const fName = document.getElementById('clientFirstName')?.value || 'Client';
        const region = document.getElementById('clientRegion')?.options[document.getElementById('clientRegion')?.selectedIndex]?.text || '';
        alert(`Commission request received for ${fName}.\nYour bespoke VANTA X1 has been allocated at our ${region}.\nOur concierge team will reach out within 24 hours.`);
        closeReserve();
      });
    }

    // Global Escape Key to close active modal
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeReserve();
      }
    });
  })();

  // =========================================================================
  // 10. INTELLIGENCE BRIEFING NEWSLETTER MODULE
  // Adheres to strict separation of concerns and Content Security Policy (CSP).
  // =========================================================================
  const Newsletter = (() => {
    const form = document.getElementById('newsletterForm');
    const input = form ? form.querySelector('.newsletter-input') : null;
    const status = document.getElementById('newsletterStatus');

    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = input ? input.value.trim() : '';

      if (!email) return;

      if (status) {
        status.textContent = 'ALLOCATION REGISTRY RECORDED // ACCESS DISPATCH CONFIRMED';
        status.classList.add('visible');
        setTimeout(() => {
          status.classList.remove('visible');
        }, 5000);
      }

      if (input) {
        input.value = '';
      }
    });
  })();

  // Remove loading class
  document.body.classList.remove('loading');
});
