import { useEffect, useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";
import { prefersReducedMotion } from "@/utils/performanceUtils.js";

const shouldUseInstantScroll = () => {
  if (prefersReducedMotion()) return true;
  if (typeof window === "undefined") return false;

  if (window.matchMedia?.("(pointer: coarse)").matches) {
    return true;
  }

  return typeof navigator !== "undefined" && navigator.maxTouchPoints > 0;
};

const applyScrollToTop = (behavior) => {
  let usedFallback = false;

  try {
    window.scrollTo({ top: 0, left: 0, behavior });
  } catch (_) {
    usedFallback = true;
    window.scrollTo(0, 0);
  }

  if (typeof document !== "undefined" && (usedFallback || behavior === "auto")) {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }
};

const ScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    if ("scrollRestoration" in window.history) {
      const previous = window.history.scrollRestoration;
      window.history.scrollRestoration = "manual";
      return () => {
        window.history.scrollRestoration = previous;
      };
    }

    return undefined;
  }, []);

  useLayoutEffect(() => {
    if (location.state?.fromHeaderWeatherBadge) {
      return;
    }
    if (location.hash && location.hash !== "#top") {
      return;
    }

    const behavior = shouldUseInstantScroll() ? "auto" : "smooth";
    const timers = [];
    let rafId = 0;

    const runScroll = () => applyScrollToTop(behavior);

    rafId = requestAnimationFrame(runScroll);
    timers.push(setTimeout(runScroll, 60));
    timers.push(setTimeout(runScroll, 200));

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      timers.forEach((timerId) => clearTimeout(timerId));
    };
  }, [location.pathname, location.search, location.hash]);

  return null;
};

export default ScrollToTop;
