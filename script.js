$(document).ready(function () {
  // ============================================
  // SLIDESHOW CONFIGURATION
  // ============================================
  let currentPageIndex = 0;
  let isPlaying = true;
  let slideInterval = 5000; // 5 seconds per slide
  let intervalId = null;
  let isTransitioning = false;

  const slides = $('.video-slide');
  const totalSlides = slides.length;

  // ============================================
  // SLIDESHOW FUNCTIONS
  // ============================================
  function showSlide(index) {
    if (isTransitioning || index < 0 || index >= totalSlides) return;

    isTransitioning = true;

    // Stop any existing autoplay timer when changing pages
    stopAutoPlay();

    slides.removeClass('active animating');
    $(slides[index]).addClass('active');
    currentPageIndex = index;

    // Reset progress bar
    resetProgressBar();

    // Trigger page animations immediately (no transition delay)
    // No delay - trigger immediately
    triggerPageAnimations(index + 1);

    // Restart autoplay if playing (after a short delay to ensure page is ready)
    if (isPlaying) {
      setTimeout(function () {
        startAutoPlay();
      }, 100);
    }

    isTransitioning = false;
  }

  function nextPage() {
    if (isTransitioning) return;
    const nextIndex = (currentPageIndex + 1) % totalSlides;
    showSlide(nextIndex);
  }

  function previousPage() {
    if (isTransitioning) return;
    const prevIndex = (currentPageIndex - 1 + totalSlides) % totalSlides;
    showSlide(prevIndex);
  }

  function resetProgressBar() {
    const progressBar = $('#progressBar');
    // Stop any existing animation
    progressBar.css('animation', 'none');
    // Force reflow to ensure animation is reset
    void progressBar[0].offsetHeight;
    // Restart animation only if playing
    if (isPlaying) {
      setTimeout(function () {
        progressBar.css('animation', 'progressAnimation ' + slideInterval + 'ms linear forwards');
      }, 10);
    } else {
      // If paused, set progress to 0
      progressBar.css('width', '0%');
    }
  }

  function startAutoPlay() {
    // Clear any existing timer first
    stopAutoPlay();

    // Reset progress bar when starting autoplay
    resetProgressBar();

    function scheduleNext() {
      // Only proceed if still playing and not transitioning
      if (isPlaying && !isTransitioning) {
        nextPage();
      }
      // Schedule next only if still playing
      if (isPlaying) {
        intervalId = setTimeout(scheduleNext, slideInterval);
      }
    }

    // Start the timer for the current page
    intervalId = setTimeout(scheduleNext, slideInterval);
  }

  function stopAutoPlay() {
    if (intervalId) {
      clearTimeout(intervalId);
      intervalId = null;
    }
    // Stop progress bar animation when pausing
    const progressBar = $('#progressBar');
    if (progressBar.length) {
      progressBar.css('animation', 'none');
    }
  }

  // ============================================
  // ANIMATION FUNCTIONS
  // ============================================

  // Fade slide in animations
  function animateFadeSlideIn(element, type, delay, duration) {
    const $el = $(element);
    if (!$el.length) return;

    $el.css({
      opacity: '0',
      transition: 'none',
    });

    setTimeout(function () {
      $el.css({
        transition: 'opacity ' + duration + 'ms ease-out, transform ' + duration + 'ms ease-out',
      });

      let transform = '';
      switch (type) {
        case 'fade-slide-down':
          transform = 'translateY(-30px)';
          break;
        case 'fade-slide-up':
          transform = 'translateY(30px)';
          break;
        case 'fade-slide-left':
          transform = 'translateX(-30px)';
          break;
        case 'fade-slide-right':
          transform = 'translateX(30px)';
          break;
        case 'fade-scale':
          transform = 'scale(0.9)';
          break;
        default:
          transform = 'translateY(20px)';
      }

      $el.css('transform', transform);

      // Force reflow
      $el[0].offsetHeight;

      setTimeout(function () {
        $el.css({
          opacity: '1',
          transform: 'translate(0, 0) scale(1)',
        });
      }, 10);
    }, delay);
  }

  // Count up animation
  function animateCountUp(element, target, delay, duration, suffix) {
    const $el = $(element);
    if (!$el.length) return;

    setTimeout(function () {
      const start = 0;
      const increment = target / (duration / 16); // 60fps
      let current = start;

      const timer = setInterval(function () {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        $el.text(Math.round(current) + (suffix || ''));
      }, 16);
    }, delay);
  }

  // Trigger all animations on a page
  function triggerPageAnimations(pageNum) {
    const activeSlide = $('.video-slide.active');

    // Add animating class to trigger CSS animations
    activeSlide.addClass('animating');

    // Animate sections first (skip section-2 as it has its own diagram animations)
    activeSlide.find('section').each(function (index) {
      const $section = $(this);
      const sectionId = $section.attr('id');

      // Skip default animation for section-2 - it has its own diagram animations
      if (sectionId === 'section-2') {
        // Set section-2 to visible immediately without animation
        $section.css({
          opacity: '1',
          transform: 'translateY(0)',
          transition: 'none',
        });
        return;
      }

      $section.css({
        opacity: '0',
        transform: 'translateY(20px)',
        transition: 'none',
      });

      setTimeout(() => {
        $section.css({
          opacity: '1',
          transform: 'translateY(0)',
          transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
        });
      }, index * 100); // Stagger sections
    });

    // Animate elements with data-animate attribute (skip elements inside diagram-section and page 8)
    activeSlide.find('[data-animate]').each(function () {
      const $el = $(this);

      // Skip animations for elements inside diagram-section - they have their own animations
      if ($el.closest('.diagram-section').length > 0) {
        // Set to visible immediately without animation
        $el.css({
          opacity: '1',
          transform: 'translate(0, 0) scale(1)',
          transition: 'none',
        });
        return;
      }

      // Skip default animations for page 8 - it has its own custom animations
      if (pageNum === 8 && $el.closest('#section-8').length > 0) {
        return;
      }

      const animateType = $el.data('animate');
      const delay = parseInt($el.data('delay')) || 0;
      const duration = parseInt($el.data('duration')) || 1000;

      animateFadeSlideIn(this, animateType, delay, duration);
    });

    // Animate count-up elements
    activeSlide.find('[data-count-up]').each(function () {
      const $el = $(this);
      const target = parseInt($el.data('count-up')) || 0;
      const delay = parseInt($el.data('delay')) || 0;
      const duration = parseInt($el.data('duration')) || 2000;
      const suffix = $el.data('suffix') || '';

      animateCountUp(this, target, delay, duration, suffix);
    });

    // Page-specific animations
    if (pageNum === 2) {
      // Page 2 - Heart diagram animation
      const $diagramSection = activeSlide.find('.diagram-section');

      if ($diagramSection.length) {
        // Reset animation state
        $diagramSection.removeClass('animate-in');

        // Remove any inline styles that might interfere with CSS animations
        // Let CSS handle all initial states and animations
        $diagramSection.css({
          opacity: '',
          transform: '',
          transition: '',
        });

        // Remove inline styles from child elements
        $diagramSection.find('.heart-infographic-container').css({
          opacity: '',
          transform: '',
          transition: '',
        });

        $diagramSection.find('.section-label').css({
          opacity: '',
          transform: '',
          transition: '',
        });

        // Remove inline styles from circle background
        $diagramSection.find('.circle-background').css({
          opacity: '',
          transform: '',
          transition: '',
          visibility: '',
        });

        // Remove inline styles from GDMT labels
        $diagramSection.find('.gdmt-label').css({
          opacity: '',
          transform: '',
          transition: '',
        });

        // Remove inline styles from heart center circle
        $diagramSection.find('.heart-center-circle').css({
          opacity: '',
          transform: '',
          transition: '',
        });

        // Force reflow to ensure CSS initial states are applied
        void $diagramSection[0].offsetHeight;
        void $diagramSection.find('.heart-infographic-container')[0]?.offsetHeight;

        // Trigger animation after a short delay to ensure DOM is ready and CSS initial states are applied
        setTimeout(function () {
          $diagramSection.addClass('animate-in');
          console.log('Diagram section animation started');
        }, 200);
      }
    }

    if (pageNum === 3) {
      // Page 3 - Drug header and heart animations
      setTimeout(function () {
        // Trigger drug header animations
        const $drugsHeader = activeSlide.find('.drugs-header');
        if ($drugsHeader.length) {
          // Reset and trigger animations
          const $mainTitle = $drugsHeader.find('.main-title');
          const $drugItems = $drugsHeader.find('.drug-item');
          const $rxSymbols = $drugsHeader.find('.rx-symbol');
          const $drugNames = $drugsHeader.find('.drug-name');
          const $drugGenerics = $drugsHeader.find('.drug-generic');
          const $drugConnectors = $drugsHeader.find('.drug-connector');

          // Reset all animations
          $mainTitle.css({ animation: 'none' });
          $drugItems.css({ animation: 'none' });
          $rxSymbols.css({ animation: 'none' });
          $drugNames.css({ animation: 'none' });
          $drugGenerics.css({ animation: 'none' });
          $drugConnectors.css({ animation: 'none' });

          // Force reflow
          void $drugsHeader[0].offsetHeight;

          // Re-trigger animations
          setTimeout(function () {
            $mainTitle.css({ animation: '' });
            $drugItems.css({ animation: '' });
            $rxSymbols.css({ animation: '' });
            $drugNames.css({ animation: '' });
            $drugGenerics.css({ animation: '' });
            $drugConnectors.css({ animation: '' });
          }, 50);
        }

        const $heartIconContainer = activeSlide.find('.heart-icon-container');
        const heartContainer = activeSlide.find('.heart-svg-container');

        if ($heartIconContainer.length) {
          // Set heart to normal state (small, no animation)
          $heartIconContainer.css({
            position: 'relative',
            top: 'auto',
            left: 'auto',
            transform: 'translate(0, 0) scale(1)',
            width: '80px',
            height: '80px',
            background: 'transparent',
            borderRadius: '0',
            opacity: '1',
            zIndex: 'auto',
            boxShadow: 'none',
            animation: 'none',
            transition: 'none',
          });

          // Ensure heart image is visible
          const $heartImg = $heartIconContainer.find('img');
          $heartImg.css({
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            display: 'block',
            opacity: '1',
            visibility: 'visible',
          });
        }

        if (heartContainer.length) {
          heartContainer.css({
            opacity: '1',
            visibility: 'visible',
          });

          // Setup heartbeat sound
          setupHeartbeatSound();

          // Calculate target position for heart animation
          setupHeartAnimation(activeSlide);
        }

        // Animate pillars automatically
        const $pillars = activeSlide.find('.pillar');
        $pillars.each(function (index) {
          const $pillar = $(this);
          const $pillarBase = $pillar.find('.pillar-base');
          const $arrow = $pillar.find('.arrow');
          const $mechanism = $pillar.find('.mechanism');

          // Reset initial state
          $pillarBase.css({
            opacity: '0',
            transform: 'scale(0)',
          });
          $arrow.css({
            opacity: '0',
            visibility: 'hidden',
          });
          $mechanism.css({
            opacity: '0',
            visibility: 'hidden',
          });

          // Animate pillar base in sequence
          setTimeout(function () {
            $pillarBase.css({
              opacity: '1',
              transform: 'scale(1)',
              transition: 'opacity 0.6s ease-out, transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
            });

            // Show arrow and mechanism after pillar base animates
            setTimeout(function () {
              $arrow.css({
                opacity: '1',
                visibility: 'visible',
                transition: 'opacity 0.4s ease-out, visibility 0.4s ease-out',
              });
              $mechanism.css({
                opacity: '1',
                visibility: 'visible',
                transition: 'opacity 0.4s ease-out, visibility 0.4s ease-out',
              });
            }, 300);
          }, 400 + index * 400); // Start after heart animation, stagger pillars
        });
      }, 100);
    }

    // Page 1 - Person images animation and heartbeat
    if (pageNum === 1) {
      // Performance timing - start measurement
      const startTime = performance.now();
      performance.mark('page1-animations-start');

      // Ensure heartbeat animation is visible and centered immediately
      const $heartbeat = activeSlide.find('.heartbeat-animation');
      if ($heartbeat.length) {
        // Make sure it's visible immediately with higher opacity
        $heartbeat.css({
          opacity: '1', // Full opacity for visibility
          visibility: 'visible',
          display: 'block',
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: '1000', // Increased z-index
        });

        // Ensure heartbeat line is visible and animating
        const $heartbeatLine = $heartbeat.find('.heartbeat-line');
        const $heartbeatPath = $heartbeat.find('.heartbeat-path');

        if ($heartbeatLine.length && $heartbeatPath.length) {
          // Ensure SVG line is visible
          $heartbeatLine.css({
            opacity: '1',
            visibility: 'visible',
            display: 'block',
          });

          // Get the path element
          const pathElement = $heartbeatPath[0];

          // Wait for SVG to be rendered, then calculate path length
          setTimeout(() => {
            // Calculate the actual path length
            const pathLength = pathElement.getTotalLength();
            console.log('Path length:', pathLength);

            // Set stroke-dasharray and stroke-dashoffset based on actual length
            pathElement.style.strokeDasharray = pathLength;
            pathElement.style.strokeDashoffset = pathLength;

            // Create animation that draws the line
            const animation = pathElement.animate(
              [{ strokeDashoffset: pathLength }, { strokeDashoffset: 0 }],
              {
                duration: 3000,
                iterations: Infinity,
                easing: 'linear',
              }
            );

            console.log('Heartbeat line animation started, path length:', pathLength);
          }, 100);

          console.log('Heartbeat line found and made visible');
        } else {
          console.log('Heartbeat line elements NOT found inside heartbeat-animation!');
        }

        console.log('Heartbeat animation element found and made visible', $heartbeat);
        console.log('Heartbeat children:', $heartbeat.find('.heartbeat-pulse').length);
      } else {
        console.log('Heartbeat animation element NOT found!');
        // Try to find it in the document
        const $heartbeatGlobal = $('.heartbeat-animation');
        console.log('Global heartbeat elements found:', $heartbeatGlobal.length);
      }

      // Trigger people-collage-wrapper animation - slides in from top
      // Start immediately, no delay
      const $peopleWrapper = activeSlide.find('.people-collage-wrapper');
      if ($peopleWrapper.length) {
        // Reset and trigger animation from top
        $peopleWrapper.css({
          opacity: '0',
          transform: 'translateY(-100%)',
        });
        // Start immediately - no setTimeout delay
        const wrapperStartTime = performance.now();
        performance.mark('wrapper-animation-start');

        // Force reflow
        void $peopleWrapper[0].offsetHeight;

        $peopleWrapper.css({
          opacity: '1',
          transform: 'translateY(0)',
          transition: 'opacity 0.8s ease-out 0s, transform 0.8s ease-out 0s',
        });

        // Measure wrapper animation time
        setTimeout(function () {
          const wrapperEndTime = performance.now();
          const wrapperDuration = wrapperEndTime - wrapperStartTime;
          console.log('Wrapper animation duration:', wrapperDuration.toFixed(2), 'ms');
          performance.mark('wrapper-animation-end');
          performance.measure(
            'wrapper-animation',
            'wrapper-animation-start',
            'wrapper-animation-end'
          );
        }, 600); // Reduced from 800ms to 600ms
      }

      // Reset and trigger person image animations with proper alternating pattern
      // CSS will handle the alternating pattern via nth-child selectors
      // Start immediately, no delay
      const imageCount = activeSlide.find('.person-image').length;
      let imagesLoaded = 0;
      const imageStartTimes = {};

      activeSlide.find('.person-image').each(function (index) {
        const $img = $(this);
        const imageIndex = index + 1;

        // Mark when this image starts loading
        imageStartTimes[imageIndex] = performance.now();
        performance.mark(`image-${imageIndex}-start`);

        // Ensure visibility
        $img.css({
          visibility: 'visible',
          display: 'block',
        });

        // Reset animation
        $img.css('animation', 'none');

        // Force reflow
        void $img[0].offsetHeight;

        // Remove inline animation to let CSS animations take over immediately
        // Force reflow and remove animation inline style immediately
        void $img[0].offsetHeight;
        $img.css('animation', '');

        // Fallback: Ensure images are visible after all animations complete (max delay 0.4s + duration 0.6s = 1.0s)
        setTimeout(function () {
          $img.css({
            opacity: '1',
            transform: 'translateY(0)',
            visibility: 'visible',
            display: 'block',
          });
        }, 500); // Reduced from 1700ms to 1100ms (0.4s delay + 0.6s animation + 0.1s buffer)
      });
    }

    // Page 4 - Drug header and timeline animations
    if (pageNum === 4) {
      setTimeout(function () {
        // Trigger drug header animations (same as page 3)
        const $drugsHeader = activeSlide.find('.drugs-header');
        if ($drugsHeader.length) {
          // Reset and trigger animations
          const $mainTitle = $drugsHeader.find('.main-title');
          const $drugItems = $drugsHeader.find('.drug-item');
          const $rxSymbols = $drugsHeader.find('.rx-symbol');
          const $drugNames = $drugsHeader.find('.drug-name');
          const $drugGenerics = $drugsHeader.find('.drug-generic');
          const $drugConnectors = $drugsHeader.find('.drug-connector');

          // Reset all animations
          $mainTitle.css({ animation: 'none' });
          $drugItems.css({ animation: 'none' });
          $rxSymbols.css({ animation: 'none' });
          $drugNames.css({ animation: 'none' });
          $drugGenerics.css({ animation: 'none' });
          $drugConnectors.css({ animation: 'none' });

          // Force reflow
          void $drugsHeader[0].offsetHeight;

          // Re-trigger animations
          setTimeout(function () {
            $mainTitle.css({ animation: '' });
            $drugItems.css({ animation: '' });
            $rxSymbols.css({ animation: '' });
            $drugNames.css({ animation: '' });
            $drugGenerics.css({ animation: '' });
            $drugConnectors.css({ animation: '' });
          }, 50);
        }

        // Reset and trigger comparison-wrapper animations
        const $comparisonWrapper = activeSlide.find('.comparison-wrapper');
        if ($comparisonWrapper.length) {
          $comparisonWrapper.css({
            opacity: '0',
            transform: 'translateY(20px)',
            animation: 'none',
          });
          void $comparisonWrapper[0].offsetHeight;
          setTimeout(function () {
            $comparisonWrapper.css({ animation: '' });
          }, 50);
        }

        // Reset and trigger sequencing-panel animations
        const $sequencingPanels = activeSlide.find('.sequencing-panel');
        $sequencingPanels.each(function (index) {
          const $panel = $(this);
          $panel.css({
            opacity: '0',
            transform: 'translateY(30px)',
            animation: 'none',
          });
        });
        void $sequencingPanels[0]?.offsetHeight;
        setTimeout(function () {
          $sequencingPanels.css({ animation: '' });
        }, 50);

        // Reset and trigger panel-header animations
        const $panelHeaders = activeSlide.find('.panel-header');
        $panelHeaders.each(function (index) {
          const $header = $(this);
          $header.css({
            opacity: '0',
            transform: 'translateY(-20px) scale(0.95)',
            animation: 'none',
          });
        });
        void $panelHeaders[0]?.offsetHeight;
        setTimeout(function () {
          $panelHeaders.css({ animation: '' });
        }, 50);

        // Timeline step animations - using timelineStepAppear keyframe
        activeSlide.find('.timeline-step').each(function (index) {
          const $step = $(this);
          const $stepNumber = $step.find('.step-number');
          const delay = parseFloat($step.data('animate-delay')) || index * 0.2;

          // Remove animate-in class first to reset
          $step.removeClass('animate-in');

          // Clear all inline styles from timeline-step
          $step.css({
            opacity: '',
            transform: '',
            visibility: '',
            animation: 'none',
          });

          // Clear all inline styles from step-number
          $stepNumber.css({
            opacity: '',
            transform: '',
            visibility: '',
            animation: 'none',
          });

          // Set data-step-index for CSS delay selectors
          $step.attr('data-step-index', index);

          // Force reflow to ensure CSS initial states are applied
          void $step[0].offsetHeight;
          void $stepNumber[0].offsetHeight;

          // Trigger animation by adding animate-in class
          // This will trigger both timelineStepAppear and stepNumberPop via CSS
          setTimeout(function () {
            $step.addClass('animate-in');
            // stepNumberPop animation will be applied automatically via CSS
            // with proper delays based on data-step-index attribute
          }, delay * 1000);
        });
      }, 100);
    }

    // Page 5 - Drug header, trial circles, and other animations
    if (pageNum === 5) {
      setTimeout(function () {
        // Trigger drug header animations (same as page 3 and 4)
        const $drugsHeader = activeSlide.find('.drugs-header');
        if ($drugsHeader.length) {
          // Reset and trigger animations
          const $mainTitle = $drugsHeader.find('.main-title');
          const $drugItems = $drugsHeader.find('.drug-item');
          const $rxSymbols = $drugsHeader.find('.rx-symbol');
          const $drugNames = $drugsHeader.find('.drug-name');
          const $drugGenerics = $drugsHeader.find('.drug-generic');
          const $drugConnectors = $drugsHeader.find('.drug-connector');

          // Reset all animations
          $mainTitle.css({ animation: 'none' });
          $drugItems.css({ animation: 'none' });
          $rxSymbols.css({ animation: 'none' });
          $drugNames.css({ animation: 'none' });
          $drugGenerics.css({ animation: 'none' });
          $drugConnectors.css({ animation: 'none' });

          // Force reflow
          void $drugsHeader[0].offsetHeight;

          // Re-trigger animations
          setTimeout(function () {
            $mainTitle.css({ animation: '' });
            $drugItems.css({ animation: '' });
            $rxSymbols.css({ animation: '' });
            $drugNames.css({ animation: '' });
            $drugGenerics.css({ animation: '' });
            $drugConnectors.css({ animation: '' });
          }, 50);
        }

        // Reset and trigger trial circles animations
        const $paradigmCircle = activeSlide.find('.paradigm-circle');
        const $dapaCircle = activeSlide.find('.dapa-circle');

        // Remove any existing classes that might interfere
        $paradigmCircle.removeClass(
          'circle-center circle-apart circle-merge circle-merged pulse-effect circle-final'
        );
        $dapaCircle.removeClass(
          'circle-center circle-apart circle-merge circle-merged pulse-effect circle-final'
        );

        // Set initial state - both circles start at center, invisible
        $paradigmCircle.css({
          opacity: '0',
          left: '50%',
          transform: 'translate(-50%, -50%) scale(0.8)',
          animation: 'none',
          transition: 'none',
        });

        $dapaCircle.css({
          opacity: '0',
          left: '50%',
          transform: 'translate(-50%, -50%) scale(0.8)',
          animation: 'none',
          transition: 'none',
        });

        void $paradigmCircle[0]?.offsetHeight;
        void $dapaCircle[0]?.offsetHeight;

        // Step 1: Animate circles appearing at center
        setTimeout(function () {
          $paradigmCircle.css({
            opacity: '1',
            transform: 'translate(-50%, -50%) scale(1)',
            transition: 'opacity 0.8s ease-out, transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
          });

          setTimeout(function () {
            $dapaCircle.css({
              opacity: '1',
              transform: 'translate(-50%, -50%) scale(1)',
              transition: 'opacity 0.8s ease-out, transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
            });
          }, 200);
        }, 400);

        // Step 2: After appearing, move to final positions (left circle to left, right circle to right)
        setTimeout(function () {
          // Add circle-final class first
          $paradigmCircle.addClass('circle-final');
          $dapaCircle.addClass('circle-final');

          // Set transition for moving to final positions
          $paradigmCircle.css({
            transition:
              'left 0.9s cubic-bezier(0.4, 0, 0.2, 1), transform 0.9s cubic-bezier(0.4, 0, 0.2, 1)',
          });
          $dapaCircle.css({
            transition:
              'left 0.9s cubic-bezier(0.4, 0, 0.2, 1), transform 0.9s cubic-bezier(0.4, 0, 0.2, 1)',
          });

          // Force reflow to ensure classes are applied
          void $paradigmCircle[0]?.offsetHeight;
          void $dapaCircle[0]?.offsetHeight;

          // Set the left position explicitly - this will trigger the transition
          setTimeout(function () {
            $paradigmCircle.css({
              left: '20%',
            });
            $dapaCircle.css({
              left: '80%',
            });
          }, 20);

          // Add pulse animation after moving to final positions (after transition completes)
          setTimeout(function () {
            // Add pulse-active class to trigger CSS animation
            $paradigmCircle.addClass('pulse-active');
            $dapaCircle.addClass('pulse-active');
          }, 1000); // After transition completes (900ms + 100ms buffer)
        }, 2000); // After circles have appeared (400 + 800 + 200 + 200 buffer)

        // Reset and trigger central text animation - after circles have separated
        const $centralText = activeSlide.find('.central-text');
        if ($centralText.length) {
          $centralText.removeClass('zoom-out');
          $centralText.css({
            opacity: '0',
            transform: 'translate(-50%, -50%) scale(0.3)',
            transition: 'none',
            visibility: 'hidden',
          });
          void $centralText[0].offsetHeight;

          // Show central text after circles have moved to their final positions
          // Timing: 2000ms (initial delay) + 20ms (position set delay) + 900ms (transition) + 200ms buffer = ~3120ms
          setTimeout(function () {
            $centralText.css({
              visibility: 'visible',
            });
            $centralText.addClass('zoom-out');
            $centralText.css({
              opacity: '1',
              transform: 'translate(-50%, -50%) scale(1)',
              transition: 'opacity 0.8s ease-out, transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
            });
          }, 3120); // After circles have separated and transitioned to final positions
        }
      }, 100);
    }

    // Page 7 - Glyda banner and infographic animations
    if (pageNum === 7) {
      setTimeout(function () {
        // Animate glyda banner elements with enhanced effects
        const $glydaBanner = activeSlide.find('.glyda-banner');
        if ($glydaBanner.length) {
          const $bannerHeader = $glydaBanner.find('.banner-header');
          const $rxSymbol = $glydaBanner.find('.rx-symbol');
          const $drugName = $glydaBanner.find('.drug-name');
          const $dosageInfo = $glydaBanner.find('.dosage-info');
          const $bannerTagline = $glydaBanner.find('.banner-tagline');

          // Reset states with more dramatic initial positions
          $bannerHeader.css({
            opacity: '0',
            transform: 'translateY(-40px) scale(0.9)',
            animation: 'none',
            filter: 'blur(4px)',
          });
          $rxSymbol.css({
            opacity: '0',
            transform: 'scale(0) rotate(-360deg)',
            animation: 'none',
            filter: 'blur(2px)',
          });
          $drugName.css({
            opacity: '0',
            transform: 'translateX(-50px) scale(0.6)',
            animation: 'none',
            filter: 'blur(3px)',
          });
          $dosageInfo.css({
            opacity: '0',
            transform: 'translateY(30px) scale(0.9)',
            animation: 'none',
          });
          $bannerTagline.css({
            opacity: '0',
            transform: 'translateY(30px) scale(0.95)',
            animation: 'none',
          });

          void $glydaBanner[0].offsetHeight;

          // Animate in sequence with enhanced effects
          setTimeout(function () {
            $bannerHeader.css({
              opacity: '1',
              transform: 'translateY(0) scale(1)',
              filter: 'blur(0px)',
              transition:
                'opacity 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.8s ease-out',
            });
          }, 100);

          setTimeout(function () {
            $rxSymbol.css({
              opacity: '1',
              transform: 'scale(1.2) rotate(0deg)',
              filter: 'blur(0px)',
              transition:
                'opacity 0.7s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.7s ease-out',
            });
            // Scale back to normal after bounce
            setTimeout(function () {
              $rxSymbol.css({
                transform: 'scale(1) rotate(0deg)',
                transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              });
            }, 700);
          }, 500);

          setTimeout(function () {
            $drugName.css({
              opacity: '1',
              transform: 'translateX(0) scale(1.1)',
              filter: 'blur(0px)',
              transition:
                'opacity 1s cubic-bezier(0.34, 1.56, 0.64, 1), transform 1s cubic-bezier(0.34, 1.56, 0.64, 1), filter 1s ease-out',
            });
            // Scale back to normal after bounce
            setTimeout(function () {
              $drugName.css({
                transform: 'translateX(0) scale(1)',
                transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              });
            }, 1000);
          }, 900);

          setTimeout(function () {
            $dosageInfo.css({
              opacity: '1',
              transform: 'translateY(0) scale(1)',
              transition:
                'opacity 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)',
            });
          }, 1400);

          setTimeout(function () {
            $bannerTagline.css({
              opacity: '1',
              transform: 'translateY(0) scale(1)',
              transition:
                'opacity 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
            });
          }, 1800);
        }

        // Animate infographic box and metric items with enhanced effects
        const $infographicBox = activeSlide.find('.infographic-box');
        if ($infographicBox.length) {
          $infographicBox.css({
            opacity: '0',
            transform: 'translateY(50px) scale(0.9)',
            animation: 'none',
            filter: 'blur(5px)',
          });
          void $infographicBox[0].offsetHeight;

          setTimeout(function () {
            $infographicBox.css({
              opacity: '1',
              transform: 'translateY(0) scale(1)',
              filter: 'blur(0px)',
              transition:
                'opacity 1s cubic-bezier(0.34, 1.56, 0.64, 1), transform 1s cubic-bezier(0.34, 1.56, 0.64, 1), filter 1s ease-out',
            });
          }, 800);

          // Animate metric items with enhanced stagger and effects
          const $metricItems = $infographicBox.find('.metric-item');
          $metricItems.each(function (index) {
            const $item = $(this);
            $item.css({
              opacity: '0',
              transform: 'scale(0.5) translateY(40px) rotate(-10deg)',
              transition: 'none',
              filter: 'blur(3px)',
            });

            setTimeout(function () {
              $item.css({
                opacity: '1',
                transform: 'scale(1.1) translateY(0) rotate(0deg)',
                filter: 'blur(0px)',
                transition:
                  'opacity 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.8s ease-out',
              });
              // Scale back to normal after bounce
              setTimeout(function () {
                $item.css({
                  transform: 'scale(1) translateY(0) rotate(0deg)',
                  transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                });
              }, 800);
            }, 1500 + index * 250);
          });

          // Animate benefit boxes with enhanced slide effect and arrow animations
          const $benefitBoxes = $infographicBox.find('.benefit-box');
          $benefitBoxes.each(function (index) {
            const $box = $(this);
            const $arrowIcon = $box.find('.arrow-icon');
            const $arrowValueContainer = $box.find('.arrow-value-container');
            const $arrowValueNumber = $box.find('.arrow-value-number');
            const $arrowValueUnit = $box.find('.arrow-value-unit');
            const $benefitTitle = $box.find('.benefit-title');

            // Reset box state
            $box.css({
              opacity: '0',
              transform: 'translateX(-50px) scale(0.8)',
              transition: 'none',
              filter: 'blur(2px)',
            });

            // Reset arrow and value states
            $arrowIcon.removeClass('animate-in');
            // Reset arrow icon - keep visible for ::before and ::after to work
            $arrowIcon.css({
              opacity: '1',
              visibility: 'visible',
              transform: 'none',
              transition: 'none',
            });

            // Force reflow to ensure CSS initial state (height: 0) is applied
            void $arrowIcon[0].offsetHeight;
            $arrowValueContainer.css({
              opacity: '0',
              transform: 'translateX(-20px) scale(0.8)',
              transition: 'none',
            });
            $arrowValueNumber.css({
              opacity: '0',
              transform: 'scale(0)',
              transition: 'none',
            });
            $arrowValueUnit.css({
              opacity: '0',
              transform: 'scale(0)',
              transition: 'none',
            });
            $benefitTitle.css({
              opacity: '0',
              transform: 'translateY(-10px)',
              transition: 'none',
            });

            setTimeout(function () {
              // Animate box
              $box.css({
                opacity: '1',
                transform: 'translateX(0) scale(1.05)',
                filter: 'blur(0px)',
                transition:
                  'opacity 0.7s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.7s ease-out',
              });

              // Animate benefit title
              $benefitTitle.css({
                opacity: '1',
                transform: 'translateY(0)',
                transition:
                  'opacity 0.6s ease-out, transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
              });

              // Make arrow icon visible (no animation)
              setTimeout(function () {
                $arrowIcon.css({
                  opacity: '1',
                  visibility: 'visible',
                });
              }, 300);

              // Animate arrow value container
              setTimeout(function () {
                $arrowValueContainer.css({
                  opacity: '1',
                  transform: 'translateX(0) scale(1.1)',
                  transition:
                    'opacity 0.6s ease-out, transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                });
                // Scale back to normal
                setTimeout(function () {
                  $arrowValueContainer.css({
                    transform: 'translateX(0) scale(1)',
                    transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  });
                }, 600);
              }, 500);

              // Animate arrow value number and unit with stagger
              setTimeout(function () {
                $arrowValueNumber.css({
                  opacity: '1',
                  transform: 'scale(1.2)',
                  transition:
                    'opacity 0.5s ease-out, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                });
                setTimeout(function () {
                  $arrowValueNumber.css({
                    transform: 'scale(1)',
                    transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  });
                }, 500);
              }, 700);

              setTimeout(function () {
                $arrowValueUnit.css({
                  opacity: '1',
                  transform: 'scale(1)',
                  transition:
                    'opacity 0.5s ease-out, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                });
              }, 900);

              // Scale box back to normal after bounce
              setTimeout(function () {
                $box.css({
                  transform: 'translateX(0) scale(1)',
                  transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                });
              }, 700);
            }, 2200 + index * 200);
          });
        }

        // Animate slogan block with enhanced effect
        const $sloganBlock = activeSlide.find('.slogan-block');
        if ($sloganBlock.length) {
          $sloganBlock.css({
            opacity: '0',
            transform: 'translateY(50px) scale(0.9)',
            animation: 'none',
            filter: 'blur(3px)',
          });
          void $sloganBlock[0].offsetHeight;

          setTimeout(function () {
            $sloganBlock.css({
              opacity: '1',
              transform: 'translateY(0) scale(1)',
              filter: 'blur(0px)',
              transition:
                'opacity 1s cubic-bezier(0.34, 1.56, 0.64, 1), transform 1s cubic-bezier(0.34, 1.56, 0.64, 1), filter 1s ease-out',
            });
          }, 3000);
        }

        // Animate medical context block with enhanced effect
        const $medicalContext = activeSlide.find('.medical-context-block');
        if ($medicalContext.length) {
          $medicalContext.css({
            opacity: '0',
            transform: 'translateY(30px) scale(0.95)',
            animation: 'none',
            filter: 'blur(2px)',
          });
          void $medicalContext[0].offsetHeight;

          setTimeout(function () {
            $medicalContext.css({
              opacity: '1',
              transform: 'translateY(0) scale(1)',
              filter: 'blur(0px)',
              transition:
                'opacity 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.8s ease-out',
            });
          }, 3500);
        }
      }, 100);
    }

    if (pageNum === 8) {
      setTimeout(function () {
        // Reset all animations
        const $sloganBanner = activeSlide.find('#section-8 .slogan-banner');
        const $sacuvanColumn = activeSlide.find('#section-8 .sacuvan-column');
        const $glydaColumn = activeSlide.find('#section-8 .glyda-column');
        const $infoBoxes = activeSlide.find('#section-8 .info-box');
        const $dosageTableContainer = activeSlide.find('#section-8 .dosage-table-container');
        const $productImages = activeSlide.find('#section-8 .product-images');
        const $packshotPlaceholder = activeSlide.find('#section-8 .packshot-placeholder');

        // Debug: Check if elements are found
        if ($sloganBanner.length === 0) {
          console.warn('Page 8: slogan-banner not found');
        }
        if ($sacuvanColumn.length === 0) {
          console.warn('Page 8: sacuvan-column not found');
        }

        // Set initial states with no transition and clear any existing animations
        $sloganBanner.css({
          opacity: '0',
          transform: 'translateY(-30px) scale(0.9)',
          transition: 'none',
          animation: 'none',
        });
        $sacuvanColumn.css({
          opacity: '0',
          transform: 'translateX(-50px)',
          transition: 'none',
          animation: 'none',
        });
        $glydaColumn.css({
          opacity: '0',
          transform: 'translateX(50px)',
          transition: 'none',
          animation: 'none',
        });
        $infoBoxes.css({
          opacity: '0',
          transform: 'translateY(20px) scale(0.95)',
          transition: 'none',
          animation: 'none',
        });
        $dosageTableContainer.css({
          opacity: '0',
          transform: 'translateY(30px)',
          transition: 'none',
          animation: 'none',
        });
        $productImages.css({
          opacity: '0',
          transform: 'scale(0.9)',
          transition: 'none',
          animation: 'none',
        });
        $packshotPlaceholder.css({
          opacity: '0',
          transform: 'scale(0.9)',
          transition: 'none',
          animation: 'none',
        });

        // Force reflow
        void activeSlide[0].offsetHeight;

        // Animate slogan banner first
        setTimeout(function () {
          $sloganBanner.css({
            opacity: '1',
            transform: 'translateY(0) scale(1)',
            transition:
              'opacity 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
          });
        }, 50);

        // Animate columns
        setTimeout(function () {
          $sacuvanColumn.css({
            opacity: '1',
            transform: 'translateX(0)',
            transition:
              'opacity 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
          });
        }, 300);

        setTimeout(function () {
          $glydaColumn.css({
            opacity: '1',
            transform: 'translateX(0)',
            transition:
              'opacity 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
          });
        }, 500);

        // Animate info boxes with stagger
        setTimeout(function () {
          $infoBoxes.each(function (index) {
            const $box = $(this);
            setTimeout(function () {
              $box.css({
                opacity: '1',
                transform: 'translateY(0) scale(1)',
                transition:
                  'opacity 0.6s ease-out, transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
              });
            }, index * 150);
          });
        }, 900);

        // Animate dosage table
        setTimeout(function () {
          $dosageTableContainer.css({
            opacity: '1',
            transform: 'translateY(0)',
            transition: 'opacity 0.7s ease-out, transform 0.7s ease-out',
          });
        }, 1200);

        // Animate product images
        setTimeout(function () {
          $productImages.css({
            opacity: '1',
            transform: 'scale(1)',
            transition:
              'opacity 0.7s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)',
          });
        }, 1400);

        // Animate packshot placeholder
        setTimeout(function () {
          $packshotPlaceholder.css({
            opacity: '1',
            transform: 'scale(1)',
            transition:
              'opacity 0.7s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)',
          });
        }, 1400);
      }, 100);
    }

    if (pageNum === 9) {
      setTimeout(function () {
        // Trigger pixelated animation for background image
        const $bgImage = activeSlide.find('#section-9 .blurred-bg-image');
        if ($bgImage.length) {
          console.log('Page 9: Found background image, starting pixelated animation');

          // Remove animation class and reset to initial pixelated state (large visible pixels)
          $bgImage.removeClass('pixelated-animated').css({
            animation: 'none !important',
            imageRendering: 'pixelated',
            width: '5%',
            height: '5%',
            transform: 'scale(20)',
            filter: 'contrast(150%) brightness(0.6)',
            transition: 'none',
          });

          // Force reflow
          void $bgImage[0].offsetHeight;

          // Trigger pixelated animation by adding class - let CSS animation handle width/height
          setTimeout(function () {
            $bgImage.addClass('pixelated-animated');
            // Clear inline styles so CSS animation can take over
            $bgImage.css({
              width: '',
              height: '',
              transform: '',
              filter: '',
              imageRendering: '',
            });
            console.log('Page 9: Animation class added');
          }, 150);
        } else {
          console.warn('Page 9: Background image not found');
        }
      }, 100);
    }

    // Remove animating class after animations complete
    setTimeout(function () {
      activeSlide.removeClass('animating');
    }, 3000);
  }

  // ============================================
  // PAGE 3 SPECIFIC ANIMATIONS
  // ============================================

  function setupHeartbeatSound() {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      let isPlaying = false;

      function playHeartbeat() {
        if (isPlaying) return;
        isPlaying = true;

        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 60;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);

        setTimeout(function () {
          isPlaying = false;
        }, 100);
      }

      // Play heartbeat every 1.5 seconds
      const heartbeatInterval = setInterval(function () {
        if ($('.video-slide.active[data-page="3"]').length) {
          playHeartbeat();
        } else {
          clearInterval(heartbeatInterval);
        }
      }, 1500);
    } catch (e) {
      console.log('Audio not supported');
    }
  }

  function setupHeartAnimation(activeSlide) {
    const heartIconContainer = activeSlide.find('.heart-icon-container');
    const heartSvgContainer = activeSlide.find('.heart-svg-container');

    if (!heartIconContainer.length || !heartSvgContainer.length) return;

    // Wait for layout to be ready
    setTimeout(function () {
      // Get target position
      const iconRect = heartIconContainer[0].getBoundingClientRect();
      const svgRect = heartSvgContainer[0].getBoundingClientRect();

      const targetX = iconRect.left + iconRect.width / 2 - (svgRect.left + svgRect.width / 2);
      const targetY = iconRect.top + iconRect.height / 2 - (svgRect.top + svgRect.height / 2);
      const targetScale = iconRect.width / svgRect.width;

      // Set CSS custom properties
      heartSvgContainer[0].style.setProperty('--target-x', targetX + 'px');
      heartSvgContainer[0].style.setProperty('--target-y', targetY + 'px');
      heartSvgContainer[0].style.setProperty('--target-scale', targetScale);

      // The animation is already triggered by CSS when .video-slide.active is present
    }, 100);
  }

  // ============================================
  // PLAY/PAUSE FUNCTIONALITY
  // ============================================
  function togglePlayPause() {
    isPlaying = !isPlaying;
    const $btn = $('#playPauseBtn');
    const $pauseIcon = $btn.find('.pause-icon');
    const $playIcon = $btn.find('.play-icon');

    if (isPlaying) {
      // Resume: restart autoplay from current page
      startAutoPlay();
      $pauseIcon.show();
      $playIcon.hide();
      $btn.attr('aria-label', 'Pause slideshow');
    } else {
      // Pause: stop autoplay and progress bar
      stopAutoPlay();
      $pauseIcon.hide();
      $playIcon.show();
      $btn.attr('aria-label', 'Play slideshow');
    }
  }

  // ============================================
  // KEYBOARD NAVIGATION
  // ============================================
  $(document).keydown(function (e) {
    if (e.key === 'ArrowRight' || e.key === ' ') {
      e.preventDefault();
      nextPage();
      resetProgressBar();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      previousPage();
      resetProgressBar();
    } else if (e.key === 'Escape') {
      togglePlayPause();
    }
  });

  // ============================================
  // NAVIGATION PANEL - HIDE/SHOW
  // ============================================
  function hideNavigationPanel() {
    $('#navPanel').addClass('hidden');
    $('#showNavBtn').show();
  }

  function showNavigationPanel() {
    $('#navPanel').removeClass('hidden');
    $('#showNavBtn').hide();
    // Close settings panel when showing navigation
    $('#settingsPanel').removeClass('expanded');
  }

  // ============================================
  // SETTINGS PANEL
  // ============================================
  function toggleSettingsPanel() {
    const $settingsPanel = $('#settingsPanel');
    $settingsPanel.toggleClass('expanded');
  }

  function closeSettingsPanel() {
    $('#settingsPanel').removeClass('expanded');
  }

  function applySettings() {
    const intervalInput = parseInt($('#slideIntervalInput').val());
    if (intervalInput && intervalInput >= 1 && intervalInput <= 60) {
      // Update slideInterval
      slideInterval = intervalInput * 1000; // Convert to milliseconds

      // If currently playing, restart autoplay with new interval
      if (isPlaying) {
        stopAutoPlay();
        startAutoPlay();
      }

      // Update progress bar animation
      resetProgressBar();

      // Close settings panel
      closeSettingsPanel();

      // Show feedback (optional)
      console.log('Settings applied: Slide interval set to', intervalInput, 'seconds');
    } else {
      alert('Please enter a valid interval between 1 and 60 seconds');
    }
  }

  // Initialize settings input with current value
  $('#slideIntervalInput').val(slideInterval / 1000);

  // ============================================
  // CLICK HANDLERS
  // ============================================

  // Play/Pause button handler
  $('#playPauseBtn').on('click', togglePlayPause);

  // Navigation button handlers
  $('#nextBtn').on('click', function () {
    // Stop current timer and navigate
    stopAutoPlay();
    nextPage();
    // Progress bar and autoplay will be reset in showSlide()
  });

  $('#prevBtn').on('click', function () {
    // Stop current timer and navigate
    stopAutoPlay();
    previousPage();
    // Progress bar and autoplay will be reset in showSlide()
  });

  // Hide/Show navigation panel
  $('#hideNavBtn').on('click', function (e) {
    e.stopPropagation();
    hideNavigationPanel();
  });

  $('#showNavBtn').on('click', function (e) {
    e.stopPropagation();
    showNavigationPanel();
  });

  // Settings panel
  $('#settingsBtn').on('click', function (e) {
    e.stopPropagation();
    toggleSettingsPanel();
  });

  $('#closeSettingsBtn').on('click', function (e) {
    e.stopPropagation();
    closeSettingsPanel();
  });

  $('#applySettingsBtn').on('click', function (e) {
    e.stopPropagation();
    applySettings();
  });

  // Close settings panel when clicking outside
  $(document).on('click', function (e) {
    if (!$(e.target).closest('.settings-panel, .settings-btn').length) {
      closeSettingsPanel();
    }
  });

  // Pillar animations are now automatic on page 3 load (no click handlers)

  // Graph click handler for page 10
  $(document).on('click', '.graph-container[data-clickable="true"]', function () {
    const graphImage = $(this).find('.graph-image');
    if (graphImage.length) {
      const src = graphImage.attr('src');
      if (src) {
        window.open(src, '_blank');
      }
    }
  });

  // ============================================
  // INITIALIZATION
  // ============================================
  showSlide(0);
  startAutoPlay();

  // Initialize button state (showing pause icon since slideshow starts playing)
  $('#playPauseBtn').find('.pause-icon').show();
  $('#playPauseBtn').find('.play-icon').hide();

  // Initialize page 1 animations on load - start immediately
  if ($('.video-slide.active[data-page="1"]').length) {
    triggerPageAnimations(1);
  }

  // Handle window resize for page 3 heart animation
  $(window).on('resize', function () {
    if ($('.video-slide.active[data-page="3"]').length) {
      const activeSlide = $('.video-slide.active');
      setupHeartAnimation(activeSlide);
    }
  });
});
