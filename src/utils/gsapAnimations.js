import { gsap } from 'gsap';

// Common GSAP animation presets
export const animations = {
  // Fade in from bottom
  fadeInUp: (element, delay = 0) => {
    return gsap.fromTo(element, 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, delay, ease: "power2.out" }
    );
  },

  // Fade in from left
  fadeInLeft: (element, delay = 0) => {
    return gsap.fromTo(element,
      { opacity: 0, x: -30 },
      { opacity: 1, x: 0, duration: 0.6, delay, ease: "power2.out" }
    );
  },

  // Fade in from right
  fadeInRight: (element, delay = 0) => {
    return gsap.fromTo(element,
      { opacity: 0, x: 30 },
      { opacity: 1, x: 0, duration: 0.6, delay, ease: "power2.out" }
    );
  },

  // Scale in with bounce
  scaleIn: (element, delay = 0) => {
    return gsap.fromTo(element,
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.5, delay, ease: "back.out(1.7)" }
    );
  },

  // Stagger animation for multiple elements
  staggerIn: (elements, delay = 0, staggerDelay = 0.1) => {
    return gsap.fromTo(elements,
      { opacity: 0, y: 20 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.5, 
        delay, 
        stagger: staggerDelay,
        ease: "power2.out" 
      }
    );
  },

  // Button click animation
  buttonClick: (element) => {
    return gsap.to(element, {
      scale: 0.95,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      ease: "power2.inOut"
    });
  },

  // Modal enter animation
  modalEnter: (modal, content) => {
    const tl = gsap.timeline();
    tl.fromTo(modal, 
      { opacity: 0 },
      { opacity: 1, duration: 0.3, ease: "power2.out" }
    )
    .fromTo(content,
      { scale: 0.8, opacity: 0, y: 50 },
      { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: "back.out(1.7)" },
      "-=0.1"
    );
    return tl;
  },

  // Modal exit animation
  modalExit: (modal, content, onComplete) => {
    const tl = gsap.timeline();
    tl.to(content, {
      scale: 0.8,
      opacity: 0,
      y: 50,
      duration: 0.2,
      ease: "power2.in"
    })
    .to(modal, {
      opacity: 0,
      duration: 0.2,
      ease: "power2.in",
      onComplete
    }, "-=0.1");
    return tl;
  },

  // Toast enter animation
  toastEnter: (element) => {
    return gsap.fromTo(element,
      { opacity: 0, x: 100, scale: 0.8 },
      { opacity: 1, x: 0, scale: 1, duration: 0.4, ease: "back.out(1.7)" }
    );
  },

  // Toast exit animation
  toastExit: (element, onComplete) => {
    return gsap.to(element, {
      opacity: 0,
      x: 100,
      scale: 0.8,
      duration: 0.3,
      ease: "power2.in",
      onComplete
    });
  },

  // Loading spinner animation
  spinnerRotate: (element) => {
    return gsap.to(element, {
      rotation: 360,
      duration: 1,
      ease: "none",
      repeat: -1
    });
  },

  // Progress bar animation
  progressBar: (element, progress) => {
    return gsap.to(element, {
      width: `${progress}%`,
      duration: 0.3,
      ease: "power2.out"
    });
  }
};

// Utility function to create hover animations
export const createHoverAnimation = (element, scale = 1.05) => {
  const hoverIn = () => {
    gsap.to(element, {
      scale: scale,
      duration: 0.2,
      ease: "power2.out"
    });
  };

  const hoverOut = () => {
    gsap.to(element, {
      scale: 1,
      duration: 0.2,
      ease: "power2.out"
    });
  };

  return { hoverIn, hoverOut };
};

// Utility function to create focus animations
export const createFocusAnimation = (element) => {
  const focusIn = () => {
    gsap.to(element, {
      scale: 1.02,
      duration: 0.2,
      ease: "power2.out"
    });
  };

  const focusOut = () => {
    gsap.to(element, {
      scale: 1,
      duration: 0.2,
      ease: "power2.out"
    });
  };

  return { focusIn, focusOut };
};
