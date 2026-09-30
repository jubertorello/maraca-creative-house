"use client";

import { useEffect, type RefObject } from "react";

/**
 * Some mobile browsers (seen on iOS/Chrome) evaluate a <video>'s
 * <source media="..."> children once, at initial parse, against a
 * not-yet-settled viewport on a cold first load — picking the desktop cut
 * and only correcting itself after a reload. Calling `.load()` once this
 * component has mounted (layout/viewport settled) forces the browser to
 * re-run source selection for real, without changing what's rendered.
 */
export function useVideoSourceFix(ref: RefObject<HTMLVideoElement | null>) {
  useEffect(() => {
    ref.current?.load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
