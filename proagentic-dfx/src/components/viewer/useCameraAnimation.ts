import { useEffect, useRef } from 'react';

/**
 * Custom hook for smooth camera animation using linear interpolation (lerp)
 */
export function useCameraAnimation(
  target: [number, number],
  onUpdate: (rotation: [number, number]) => void,
  duration: number = 500
) {
  const animationRef = useRef<number | null>(null);
  const startRotationRef = useRef<[number, number]>([0, 0]);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    // Cancel any ongoing animation
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
    }

    // Store the current time and start rotation
    startTimeRef.current = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out cubic)
      const eased = 1 - Math.pow(1 - progress, 3);

      // Interpolate rotation
      const newRotation: [number, number] = [
        startRotationRef.current[0] + (target[0] - startRotationRef.current[0]) * eased,
        startRotationRef.current[1] + (target[1] - startRotationRef.current[1]) * eased,
      ];

      onUpdate(newRotation);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        animationRef.current = null;
      }
    };

    // Start animation
    animationRef.current = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [target, onUpdate, duration]);

  return {
    setStartRotation: (rotation: [number, number]) => {
      startRotationRef.current = rotation;
    }
  };
}
