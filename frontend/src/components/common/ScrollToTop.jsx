import { useEffect } from "react";
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

const ScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash && location.hash !== "#top") {
      return;
    }

    const behavior = shouldUseInstantScroll() ? "auto" : "smooth";
    let rafId = 0;

    rafId = requestAnimationFrame(() => {
      try {
        window.scrollTo({ top: 0, left: 0, behavior });
      } catch (_) {
        window.scrollTo(0, 0);
      }
    });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [location.pathname, location.search, location.hash]);

  return null;
};

export default ScrollToTop;
