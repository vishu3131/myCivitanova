import React, { useEffect, useRef, useCallback, useMemo, useState } from 'react';
import './ProfileCard.css';
import SafeImage from './SafeImage';

interface ProfileCardProps {
  avatar: string;
  icon?: string;
  behindGradient?: string;
  innerGradient?: string;
  grain?: string;
  name: string;
  role: string;
  contact?: string;
  onContactClick?: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  avatar,
  icon,
  behindGradient,
  innerGradient,
  grain,
  name,
  role,
  contact,
  onContactClick
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const isPointerInside = useRef(false);
  const counter = useRef(0);
  const updateCall = useRef<number | null>(null);
  const lastUpdateTime = useRef(0);
  const [isTouching, setIsTouching] = useState(false);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [gestureState, setGestureState] = useState({
    isLongPress: false,
    isPinching: false,
    initialDistance: 0,
    scale: 1
  });
  
  // Throttle function for better performance
  const throttle = useCallback((func: Function, limit: number) => {
    return (...args: any[]) => {
      const now = Date.now();
      if (now - lastUpdateTime.current >= limit) {
        lastUpdateTime.current = now;
        func.apply(null, args);
      }
    };
  }, []);

  // Debounce function for resize/orientation events
  const debounce = useCallback((func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return function(this: any, ...args: any[]) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }, []);

  const update = useCallback((event?: PointerEvent | TouchEvent | DeviceOrientationEvent) => {
    if (!cardRef.current) return;

    const card = cardRef.current;
    const cardBounds = card.getBoundingClientRect();

    let clientX = cardBounds.left + cardBounds.width / 2;
    let clientY = cardBounds.top + cardBounds.height / 2;

    // Handle touch events
    if (event && 'touches' in event && event.touches.length > 0) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else if (event && 'clientX' in event && 'clientY' in event) {
      clientX = event.clientX;
      clientY = event.clientY;
    }

    const relativeX = clientX - cardBounds.left;
    const relativeY = clientY - cardBounds.top;
    const relativeXpercent = Math.round((relativeX / cardBounds.width) * 100);
    const relativeYpercent = Math.round((relativeY / cardBounds.height) * 100);

    const style = card.style;
    const updateStyles = () => {
      // Reduce rotation intensity for touch devices
      const rotationMultiplier = isTouching ? 0.4 : 0.8;
      const rotateX = ((relativeYpercent - 50) * rotationMultiplier).toFixed(2);
      const rotateY = ((relativeXpercent - 50) * -rotationMultiplier).toFixed(2);

      style.setProperty('--pointer-x', `${relativeXpercent}%`);
      style.setProperty('--pointer-y', `${relativeYpercent}%`);
      style.setProperty('--pointer-from-center', distanceFromCenter.toString());
      style.setProperty('--pointer-from-top', relativeYpercent / 100 + '');
      style.setProperty('--pointer-from-left', relativeXpercent / 100 + '');
      style.setProperty('--card-opacity', isPointerInside.current ? '1' : '0');
      style.setProperty('--rotate-x', `${rotateX}deg`);
      style.setProperty('--rotate-y', `${rotateY}deg`);
      style.setProperty('--background-x', `${relativeXpercent}%`);
      style.setProperty('--background-y', `${relativeYpercent}%`);
      style.setProperty('--is-touching', isTouching ? '1' : '0');
    };

    const distanceFromCenter = Math.sqrt(
      (relativeX - cardBounds.width / 2) ** 2 + (relativeY - cardBounds.height / 2) ** 2
    ) / Math.max(cardBounds.width / 2, cardBounds.height / 2);

    if (event && ('clientX' in event || 'touches' in event)) {
      updateStyles();
    } else {
      updateCall.current = requestAnimationFrame(updateStyles);
    }
  }, [isTouching]);

  const restyle = useCallback(() => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const style = card.style;
    style.setProperty('--pointer-x', '50%');
    style.setProperty('--pointer-y', '50%');
    style.setProperty('--pointer-from-center', '0');
    style.setProperty('--pointer-from-top', '0.5');
    style.setProperty('--pointer-from-left', '0.5');
    style.setProperty('--card-opacity', '0');
    style.setProperty('--rotate-x', '0deg');
    style.setProperty('--rotate-y', '0deg');
    style.setProperty('--background-x', '50%');
    style.setProperty('--background-y', '50%');
  }, []);

  // Throttled update functions for better performance
  const throttledUpdate = useMemo(() => throttle(update, 16), [throttle, update]); // ~60fps

  const onPointerMove = useCallback((event: PointerEvent) => {
    counter.current++;
    if (updateCall.current) {
      cancelAnimationFrame(updateCall.current);
    }
    throttledUpdate(event);
  }, [throttledUpdate]);

  const onPointerEnter = useCallback((event: PointerEvent) => {
    if (!cardRef.current) return;
    isPointerInside.current = true;
    cardRef.current.classList.add('active');
    update(event);
  }, [update]);

  const onPointerLeave = useCallback(() => {
    if (!cardRef.current) return;
    isPointerInside.current = false;
    cardRef.current.classList.remove('active');
    setIsTouching(false);
    restyle();
  }, [restyle]);

  // Calculate distance between two touch points
  const getTouchDistance = useCallback((touches: TouchList) => {
    if (touches.length < 2) return 0;
    const touch1 = touches[0];
    const touch2 = touches[1];
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) + 
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  }, []);

  // Handle long press
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  
  const handleLongPressStart = useCallback(() => {
    longPressTimer.current = setTimeout(() => {
      setGestureState(prev => ({ ...prev, isLongPress: true }));
      // Haptic feedback for long press
      if ('vibrate' in navigator) {
        navigator.vibrate(100);
      }
    }, 500);
  }, []);

  const handleLongPressEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    setGestureState(prev => ({ ...prev, isLongPress: false }));
  }, []);

  // Handle pinch gesture
  const handlePinchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2) {
      const distance = getTouchDistance(e.touches);
      setGestureState(prev => ({
        ...prev,
        isPinching: true,
        initialDistance: distance
      }));
    }
  }, [getTouchDistance]);

  const handlePinchMove = useCallback((e: TouchEvent) => {
    if (gestureState.isPinching && e.touches.length === 2) {
      const currentDistance = getTouchDistance(e.touches);
      const scale = currentDistance / gestureState.initialDistance;
      setGestureState(prev => ({ ...prev, scale: Math.max(0.5, Math.min(2, scale)) }));
      
      if (cardRef.current) {
        cardRef.current.style.setProperty('--pinch-scale', scale.toString());
      }
    }
  }, [gestureState.isPinching, gestureState.initialDistance, getTouchDistance]);

  const handlePinchEnd = useCallback(() => {
    setGestureState(prev => ({
      ...prev,
      isPinching: false,
      scale: 1
    }));
    
    if (cardRef.current) {
      cardRef.current.style.setProperty('--pinch-scale', '1');
    }
  }, []);

  // Touch event handlers
  const onTouchStart = useCallback((event: TouchEvent) => {
    if (!cardRef.current) return;
    setIsTouching(true);
    isPointerInside.current = true;
    cardRef.current.classList.add('active', 'touching');
    
    handleLongPressStart();
    
    if (event.touches.length === 2) {
      handlePinchStart(event);
    }
    
    // Haptic feedback for supported devices
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
    
    update(event);
  }, [update, handleLongPressStart, handlePinchStart]);

  const onTouchMove = useCallback((event: TouchEvent) => {
    event.preventDefault(); // Prevent scrolling
    counter.current++;
    if (updateCall.current) {
      cancelAnimationFrame(updateCall.current);
    }
    
    if (event.touches.length === 1 && !gestureState.isPinching) {
      throttledUpdate(event);
    } else if (event.touches.length === 2) {
      handlePinchMove(event);
    }
  }, [throttledUpdate, gestureState.isPinching, handlePinchMove]);

  const onTouchEnd = useCallback(() => {
    if (!cardRef.current) return;
    setIsTouching(false);
    isPointerInside.current = false;
    cardRef.current.classList.remove('active', 'touching');
    handleLongPressEnd();
    handlePinchEnd();
    restyle();
  }, [restyle, handleLongPressEnd, handlePinchEnd]);

  const onDeviceOrientation = useCallback((event: DeviceOrientationEvent) => {
    if (!isPointerInside.current || !cardRef.current) return;
    update(event);
  }, [update]);

  // Handle orientation change
  const handleOrientationChange = useCallback(() => {
    const newOrientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
    setOrientation(newOrientation);
  }, []);

  // Debounced handlers for performance
  const debouncedOrientationChange = useMemo(
    () => debounce(handleOrientationChange, 150),
    [debounce, handleOrientationChange]
  );

  const debouncedResize = useMemo(
    () => debounce(() => {
      handleOrientationChange();
      // Force re-render for responsive adjustments
      if (cardRef.current) {
        cardRef.current.style.setProperty('--viewport-width', `${window.innerWidth}px`);
        cardRef.current.style.setProperty('--viewport-height', `${window.innerHeight}px`);
      }
    }, 200),
    [debounce, handleOrientationChange]
  );



  // Intersection Observer for performance optimization
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    // Set initial orientation
    handleOrientationChange();

    // Intersection Observer for performance optimization
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
        
        // Preload images when card becomes visible
        if (entry.isIntersecting && cardRef.current) {
          const images = cardRef.current.querySelectorAll('img[data-src]');
          images.forEach((img: HTMLImageElement) => {
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
            }
          });
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '50px' // Start loading 50px before entering viewport
      }
    );
    observerRef.current.observe(card);

    // Add event listeners only if card is visible
    if (isVisible) {
      // Pointer events
      card.addEventListener('pointermove', onPointerMove, { passive: true });
      card.addEventListener('pointerenter', onPointerEnter);
      card.addEventListener('pointerleave', onPointerLeave);
      
      // Touch events
      card.addEventListener('touchstart', onTouchStart, { passive: false });
      card.addEventListener('touchmove', onTouchMove, { passive: false });
      card.addEventListener('touchend', onTouchEnd, { passive: true });
      card.addEventListener('touchcancel', onTouchEnd, { passive: true });
      
      // Device orientation
      window.addEventListener('deviceorientation', onDeviceOrientation, { passive: true });
      window.addEventListener('orientationchange', debouncedOrientationChange, { passive: true });
      window.addEventListener('resize', debouncedResize, { passive: true });
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      
      // Remove pointer events
      card.removeEventListener('pointermove', onPointerMove);
      card.removeEventListener('pointerenter', onPointerEnter);
      card.removeEventListener('pointerleave', onPointerLeave);
      
      // Remove touch events
      card.removeEventListener('touchstart', onTouchStart);
      card.removeEventListener('touchmove', onTouchMove);
      card.removeEventListener('touchend', onTouchEnd);
      card.removeEventListener('touchcancel', onTouchEnd);
      
      // Remove device orientation events
      window.removeEventListener('deviceorientation', onDeviceOrientation);
      window.removeEventListener('orientationchange', debouncedOrientationChange);
      window.removeEventListener('resize', debouncedResize);
      
      if (updateCall.current) {
        cancelAnimationFrame(updateCall.current);
      }
    };
  }, [onPointerMove, onPointerEnter, onPointerLeave, onTouchStart, onTouchMove, onTouchEnd, onDeviceOrientation, handleOrientationChange, debouncedOrientationChange, debouncedResize, isVisible]);

  const cardStyle = useMemo(() => ({
    '--grain': grain || 'none',
    '--icon': icon || 'none',
    '--behind-gradient': behindGradient || 'none',
    '--inner-gradient': innerGradient || 'none',
    '--is-touching': isTouching ? '1' : '0',
    '--orientation': orientation,
    '--is-visible': isVisible ? '1' : '0',
    '--is-long-press': gestureState.isLongPress ? '1' : '0',
    '--is-pinching': gestureState.isPinching ? '1' : '0',
    '--pinch-scale': gestureState.scale.toString(),
  } as React.CSSProperties), [grain, icon, behindGradient, innerGradient, isTouching, orientation, isVisible, gestureState]);

  return (
    <div 
        className="pc-card-wrapper"
        ref={cardRef}
        style={cardStyle}
        data-orientation={orientation}
        data-touching={isTouching}
        data-visible={isVisible}
        data-long-press={gestureState.isLongPress}
        data-pinching={gestureState.isPinching}
      >
      <div className="pc-card">
        <div className="pc-inside"></div>
        <div className="pc-shine"></div>
        <div className="pc-glare"></div>
        <div className="pc-avatar-content">
            <SafeImage 
              className="avatar"
              src={avatar}
              alt={name}
              width={100}
              height={100}
              placeholderSrc={"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23f0f0f0'/%3E%3C/svg%3E"}
            />
        </div>
        <div className="pc-content">
          <div className="pc-details">
            <h3>{name}</h3>
            <p>{role}</p>
          </div>
        </div>
        <div className="pc-user-info">
          <div className="pc-user-details">
            <div className="pc-mini-avatar">
                <SafeImage 
                  src={avatar}
                  alt={name}
                  width={40}
                  height={40}
                  placeholderSrc={"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' fill='%23f0f0f0'/%3E%3C/svg%3E"}
                />
            </div>
            <div className="pc-user-text">
              <div className="pc-handle">{name}</div>
              <div className="pc-status">{role}</div>
            </div>
          </div>
          {contact && (
            <button 
              className="pc-contact-btn" 
              onClick={onContactClick}
              aria-label={`Contatta ${name}`}
            >
              {contact}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
