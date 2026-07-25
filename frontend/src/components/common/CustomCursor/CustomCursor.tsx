import React, { useEffect, useState, useRef } from 'react';
import './CustomCursor.css';

const CustomCursor: React.FC = () => {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isClicked, setIsClicked] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  // Target positions
  const mousePos = useRef({ x: -100, y: -100 });
  // Lerp positions for ring trailing effect
  const ringPos = useRef({ x: -100, y: -100 });

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isVisible) setIsVisible(true);
      mousePos.current = { x: e.clientX, y: e.clientY };

      // Update inner dot position immediately
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
      }
    };

    const onMouseDown = () => setIsClicked(true);
    const onMouseUp = () => setIsClicked(false);

    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    // Detect hover over interactive elements
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const isInteractive = !!target.closest(
        'button, a, input, textarea, select, label, [role="button"], .clickable, .lp-card, .lp-metric'
      );
      setIsHovered(isInteractive);
    };

    window.addEventListener('mouseover', handleMouseOver);

    // Smooth animation loop for trailing ring cursor
    let rafId: number;
    const render = () => {
      const lerp = 0.18;
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * lerp;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * lerp;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0) translate(-50%, -50%)`;
      }

      rafId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      window.removeEventListener('mouseover', handleMouseOver);
      cancelAnimationFrame(rafId);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <>
      {/* Inner Glowing Center Dot */}
      <div
        ref={dotRef}
        className={`custom-cursor__dot ${isHovered ? 'custom-cursor__dot--hover' : ''}`}
      />

      {/* Outer Cyan Ring (Matching User Screenshot & Web Cyan Theme) */}
      <div
        ref={ringRef}
        className={`custom-cursor__ring ${isHovered ? 'custom-cursor__ring--hover' : ''} ${
          isClicked ? 'custom-cursor__ring--clicked' : ''
        }`}
      />
    </>
  );
};

export default CustomCursor;
