import { useEffect, useState, useRef, useCallback } from 'react';

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  const followerRef = useRef({ x: 0, y: 0 });
  const followerElementRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();

  const updateFollower = useCallback(() => {
    const follower = followerRef.current;
    follower.x += (position.x - follower.x) * 0.15;
    follower.y += (position.y - follower.y) * 0.15;
    
    if (followerElementRef.current) {
      followerElementRef.current.style.left = `${follower.x}px`;
      followerElementRef.current.style.top = `${follower.y}px`;
    }
    
    animationFrameRef.current = requestAnimationFrame(updateFollower);
  }, [position.x, position.y]);

  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(updateFollower);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [updateFollower]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.body.addEventListener('mouseleave', handleMouseLeave);
    document.body.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
      document.body.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, []);

  useEffect(() => {
    const hoverables = document.querySelectorAll('a, button, input, [data-hover]');
    
    const handleHoverStart = () => setIsHovering(true);
    const handleHoverEnd = () => setIsHovering(false);

    hoverables.forEach((el) => {
      el.addEventListener('mouseenter', handleHoverStart);
      el.addEventListener('mouseleave', handleHoverEnd);
    });

    return () => {
      hoverables.forEach((el) => {
        el.removeEventListener('mouseenter', handleHoverStart);
        el.removeEventListener('mouseleave', handleHoverEnd);
      });
    };
  }, []);

  if (!isVisible) return null;

  return (
    <>
      <div
        className="cursor"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      />
      <div
        ref={followerElementRef}
        className={`cursor-follower ${isHovering ? 'hover' : ''}`}
        style={{
          left: `${followerRef.current.x}px`,
          top: `${followerRef.current.y}px`,
        }}
      />
    </>
  );
};

export default CustomCursor;
