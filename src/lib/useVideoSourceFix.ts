"use client";

import { useEffect, type RefObject } from "react";

/**
 * Some mobile browsers (seen on iOS/Chrome) evaluate a <video>'s
 * <source media="..."> children once, at initial parse, against a
 * not-yet-settled viewport on a cold first load — picking the desktop cut
 * and only correcting itself after a reload. Once mounted (viewport
 * settled), check whether the source the browser actually picked is the
 * one this viewport should get; only if it's wrong, re-run source
 * selection with `.load()`. Calling it unconditionally aborts a download
 * that was already going fine and restarts it, delaying playback.
 */
export function useVideoSourceFix(ref: RefObject<HTMLVideoElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    const sources = Array.from(el.querySelectorAll("source"));
    const expected = sources.find((s) => {
      const media = s.getAttribute("media");
      return media ? isMobile : true;
    });
    if (!expected || !el.currentSrc || el.currentSrc === expected.src) return;
    el.load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
