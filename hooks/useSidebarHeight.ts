"use client";

import { useEffect, type RefObject } from "react";

export function useSidebarHeight(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      document.documentElement.style.setProperty(
        "--sidebar-height",
        `${el.offsetHeight}px`
      );
    };

    update();

    const observer = new ResizeObserver(update);
    observer.observe(el);
    window.addEventListener("resize", update);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
      document.documentElement.style.removeProperty("--sidebar-height");
    };
  }, [ref]);
}
