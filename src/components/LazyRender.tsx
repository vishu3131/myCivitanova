"use client";

import React, { useEffect, useRef, useState } from "react";

export interface LazyRenderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  rootMargin?: string;
  threshold?: number | number[];
  once?: boolean;
}

/**
 * LazyRender mounts children only when they enter the viewport.
 * - Reduces initial JS execution work and network payload when paired with dynamic imports
 * - Configurable rootMargin and threshold
 * - Fallback content while waiting (e.g., a skeleton)
 */
const LazyRender: React.FC<LazyRenderProps> = ({
  children,
  fallback = null,
  rootMargin = "200px 0px",
  threshold = 0,
  once = true,
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Ensure we're on the client side to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    
    const node = ref.current;
    if (!node) return;
    if (visible && once) return;

    let observer: IntersectionObserver | null = null;

    if (typeof window !== "undefined" && "IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              setVisible(true);
              if (once && observer) {
                observer.disconnect();
                observer = null;
              }
            } else if (!once) {
              setVisible(false);
            }
          }
        },
        { root: null, rootMargin, threshold }
      );

      observer.observe(node);
    } else {
      const idle = (window as any)?.requestIdleCallback || ((cb: any) => setTimeout(cb, 200));
      idle(() => setVisible(true));
    }

    return () => {
      try {
        if (observer && node) observer.unobserve(node);
        if (observer) observer.disconnect();
      } catch {}
    };
  }, [isClient, rootMargin, threshold, once, visible]);

  return <div ref={ref}>{(isClient && visible) ? children : fallback}</div>;
};

export default LazyRender;
