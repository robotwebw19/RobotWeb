import { useEffect, useRef } from 'react'

const MAX_TILT_DEG = 7

/**
 * Mouse-tracked 3D tilt for a card-like element: pointer position over the element drives
 * `--tilt-x`/`--tilt-y` custom properties, which the element's own CSS `transform` consumes.
 * No-ops under `prefers-reduced-motion` or on a touch device (no hover to track), so the tilt
 * only engages where a "look at this from an angle" gesture actually makes sense.
 */
export function useTilt<T extends HTMLElement>() {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (window.matchMedia('(hover: none)').matches) return

    function handleMove(event: PointerEvent) {
      const rect = el!.getBoundingClientRect()
      const px = (event.clientX - rect.left) / rect.width - 0.5
      const py = (event.clientY - rect.top) / rect.height - 0.5
      el!.style.setProperty('--tilt-x', `${(-py * MAX_TILT_DEG).toFixed(2)}deg`)
      el!.style.setProperty('--tilt-y', `${(px * MAX_TILT_DEG).toFixed(2)}deg`)
    }

    function handleLeave() {
      el!.style.setProperty('--tilt-x', '0deg')
      el!.style.setProperty('--tilt-y', '0deg')
    }

    el.addEventListener('pointermove', handleMove)
    el.addEventListener('pointerleave', handleLeave)
    return () => {
      el.removeEventListener('pointermove', handleMove)
      el.removeEventListener('pointerleave', handleLeave)
    }
  }, [])

  return ref
}
