"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function registerGsap() {
  gsap.registerPlugin(ScrollTrigger);
}

export function revealOnScroll(
  targets: string | Element | Element[],
  options: {
    y?: number;
    stagger?: number;
    delay?: number;
    duration?: number;
    start?: string;
  } = {}
) {
  const {
    y = 32,
    stagger = 0.08,
    delay = 0,
    duration = 0.7,
    start = "top 88%",
  } = options;

  return gsap.fromTo(
    targets,
    { opacity: 0, y },
    {
      opacity: 1,
      y: 0,
      duration,
      stagger,
      delay,
      ease: "power3.out",
      scrollTrigger: {
        trigger: Array.isArray(targets)
          ? (targets[0] as Element)
          : typeof targets === "string"
            ? targets
            : targets,
        start,
        once: true,
      },
    }
  );
}

export function counterAnim(
  el: Element,
  endVal: number,
  duration = 1.6,
  prefix = "",
  suffix = ""
) {
  const obj = { val: 0 };
  return gsap.to(obj, {
    val: endVal,
    duration,
    ease: "power2.out",
    onUpdate() {
      el.textContent = prefix + Math.round(obj.val).toString() + suffix;
    },
    scrollTrigger: {
      trigger: el,
      start: "top 90%",
      once: true,
    },
  });
}

export function parallaxEl(
  el: Element,
  strength = 60,
  trigger?: Element | string
) {
  return gsap.fromTo(
    el,
    { y: 0 },
    {
      y: strength,
      ease: "none",
      scrollTrigger: {
        trigger: trigger ?? el,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    }
  );
}

export function slideInLeft(el: Element, delay = 0) {
  return gsap.fromTo(
    el,
    { opacity: 0, x: -40 },
    {
      opacity: 1,
      x: 0,
      duration: 0.8,
      delay,
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start: "top 88%",
        once: true,
      },
    }
  );
}

export function fadeIn(el: Element | string, delay = 0, duration = 0.6) {
  return gsap.fromTo(
    el,
    { opacity: 0 },
    {
      opacity: 1,
      duration,
      delay,
      ease: "power2.out",
    }
  );
}
