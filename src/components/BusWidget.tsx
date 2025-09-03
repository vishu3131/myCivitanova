"use client";

import React, {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
} from "react";
import gsap from "gsap";
import { Bus, Clock, Calendar, Sun } from 'lucide-react';

// Card component
export const Card = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { customClass?: string }>(
  ({ customClass, ...rest }, ref) => (
    <div
      ref={ref}
      {...rest}
      className={`card ${customClass ?? ""} ${rest.className ?? ""}`.trim()}
    />
  )
);
Card.displayName = "Card";

interface Slot {
  x: number;
  y: number;
  z: number;
  zIndex: number;
}

const makeSlot = (
  i: number,
  distX: number,
  distY: number,
  total: number
): Slot => ({
  x: i * distX,
  y: -i * distY,
  z: -i * distX * 1.5,
  zIndex: total - i,
});

const placeNow = (el: HTMLElement, slot: Slot, skew: number) =>
  gsap.set(el, {
    x: slot.x,
    y: slot.y,
    z: slot.z,
    xPercent: -50,
    yPercent: -50,
    skewY: skew,
    transformOrigin: "center center",
    zIndex: slot.zIndex,
    force3D: true,
  });

interface CardSwapProps {
  width?: number;
  height?: number;
  cardDistance?: number;
  verticalDistance?: number;
  delay?: number;
  pauseOnHover?: boolean;
  onCardClick?: (index: number) => void;
  skewAmount?: number;
  easing?: "elastic" | "smooth";
  children: React.ReactNode;
}

const CardSwap: React.FC<CardSwapProps> = ({
  width = 500,
  height = 400,
  cardDistance = 60,
  verticalDistance = 70,
  delay = 5000,
  pauseOnHover = false,
  onCardClick,
  skewAmount = 6,
  easing = "elastic",
  children,
}) => {
  const config =
    easing === "elastic"
      ? {
          ease: "elastic.out(0.6,0.9)",
          durDrop: 2,
          durMove: 2,
          durReturn: 2,
          promoteOverlap: 0.9,
          returnDelay: 0.05,
        }
      : {
          ease: "power1.inOut",
          durDrop: 0.8,
          durMove: 0.8,
          durReturn: 0.8,
          promoteOverlap: 0.45,
          returnDelay: 0.2,
        };

  const childArr = useMemo(
    () => Children.toArray(children),
    [children]
  );
  const refs = useMemo(
    () => childArr.map(() => React.createRef<HTMLDivElement>()),
    [childArr]
  );

  const order = useRef(
    Array.from({ length: childArr.length }, (_, i) => i)
  );

  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const intervalRef = useRef<number>();
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const total = refs.length;
    refs.forEach((r, i) => {
      if (r.current) {
        placeNow(
          r.current,
          makeSlot(i, cardDistance, verticalDistance, total),
          skewAmount
        );
      }
    });

    const swap = () => {
      if (order.current.length < 2) return;

      const [front, ...rest] = order.current;
      const elFront = refs[front].current;
      if (!elFront) return;
      
      const tl = gsap.timeline();
      tlRef.current = tl;

      tl.to(elFront, {
        y: "+=500",
        duration: config.durDrop,
        ease: config.ease,
      });

      tl.addLabel("promote", `-=${config.durDrop * config.promoteOverlap}`);
      rest.forEach((idx, i) => {
        const el = refs[idx].current;
        if (!el) return;
        
        const slot = makeSlot(i, cardDistance, verticalDistance, refs.length);
        tl.set(el, { zIndex: slot.zIndex }, "promote");
        tl.to(
          el,
          {
            x: slot.x,
            y: slot.y,
            z: slot.z,
            duration: config.durMove,
            ease: config.ease,
          },
          `promote+=${i * 0.15}`
        );
      });

      const backSlot = makeSlot(
        refs.length - 1,
        cardDistance,
        verticalDistance,
        refs.length
      );
      tl.addLabel("return", `promote+=${config.durMove * config.returnDelay}`);
      tl.call(
        () => {
          gsap.set(elFront, { zIndex: backSlot.zIndex });
        },
        undefined,
        "return"
      );
      tl.set(elFront, { x: backSlot.x, z: backSlot.z }, "return");
      tl.to(
        elFront,
        {
          y: backSlot.y,
          duration: config.durReturn,
          ease: config.ease,
        },
        "return"
      );

      tl.call(() => {
        order.current = [...rest, front];
      });
    };

    swap();
    intervalRef.current = window.setInterval(swap, delay);

    if (pauseOnHover) {
      const node = container.current;
      if (node) {
        const pause = () => {
          tlRef.current?.pause();
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
        };
        const resume = () => {
          tlRef.current?.play();
          intervalRef.current = window.setInterval(swap, delay);
        };
        node.addEventListener("mouseenter", pause);
        node.addEventListener("mouseleave", resume);
        return () => {
          node.removeEventListener("mouseenter", pause);
          node.removeEventListener("mouseleave", resume);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
        };
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [
    cardDistance,
    verticalDistance,
    delay,
    pauseOnHover,
    skewAmount,
    easing,
    config.durDrop,
    config.durMove,
    config.durReturn,
    config.ease,
    config.promoteOverlap,
    config.returnDelay,
    refs,
  ]);

  const rendered = childArr.map((child, i) =>
    isValidElement(child)
      ? cloneElement(child, {
          key: i,
          ref: refs[i],
          style: { width, height, ...(child.props.style ?? {}) },
          onClick: (e: React.MouseEvent) => {
            child.props.onClick?.(e);
            onCardClick?.(i);
          },
        })
      : child
  );

  return (
    <div
      ref={container}
      className="card-swap-container"
      style={{ width, height, position: 'relative', perspective: '900px', overflow: 'visible' }}
    >
      {rendered}
    </div>
  );
};

const BusWidget: React.FC = () => {
  const links = [
    { url: 'https://www.atmc.it/orari-e-percorsi/', label: 'Orari Bus', icon: Clock, color: 'text-blue-400' },
    { url: 'https://www.atmc.it/mappa-percorsi-feriale/', label: 'Percorsi Feriali', icon: Calendar, color: 'text-green-400' },
    { url: 'https://www.atmc.it/mappa-percorsi-festiva/', label: 'Percorsi Festivi', icon: Sun, color: 'text-orange-400' },
  ];

  const handleCardClick = (index: number) => {
    window.open(links[index].url, '_blank', 'noopener,noreferrer');
  };

  const handleLegendClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="w-full">
      {/* Layout principale con CardSwap e Legenda */}
      <div className="flex gap-4 items-start">
        {/* CardSwap ottimizzato */}
        <div className="flex-1">
          <CardSwap
            width={240}
            height={110}
            cardDistance={25}
            verticalDistance={30}
            delay={4000}
            pauseOnHover={true}
            onCardClick={handleCardClick}
            skewAmount={2}
            easing="smooth"
          >
            {links.map((link, index) => {
              const IconComponent = link.icon;
              return (
                <Card key={index} style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  background: 'rgba(255, 255, 255, 0.06)',
                  backdropFilter: 'blur(15px)',
                  WebkitBackdropFilter: 'blur(15px)',
                  transformStyle: 'preserve-3d',
                  willChange: 'transform',
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '12px',
                  textAlign: 'center'
                }}>
                  <div className="flex items-center gap-2 mb-1">
                    <IconComponent className={`w-4 h-4 ${link.color}`} />
                  </div>
                  <h3 style={{ color: 'white', fontSize: '13px', fontWeight: '600', margin: '0 0 4px 0' }}>{link.label}</h3>
                  <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '10px', margin: '0', lineHeight: '1.3' }}>
                    {index === 0 ? 'Consulta orari' : index === 1 ? 'Percorsi feriali' : 'Percorsi festivi'}
                  </p>
                </Card>
              );
            })}
          </CardSwap>
        </div>

        {/* Legenda a destra */}
        <div className="w-32 flex-shrink-0">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-3">
            <h4 className="text-white text-xs font-semibold mb-3 text-center">Collegamenti Rapidi <span style={{ textShadow: '0 0 8px #fff, 0 0 12px #0ff, 0 0 16px #0ff', textDecoration: 'underline' }}>Autobus</span></h4>
            <div className="space-y-2">
              {links.map((link, index) => {
                const IconComponent = link.icon;
                return (
                  <button
                    key={index}
                    onClick={() => handleLegendClick(link.url)}
                    className="w-full flex items-center gap-2 p-2 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-200 group"
                  >
                    <IconComponent className={`w-3 h-3 ${link.color} group-hover:scale-110 transition-transform`} />
                    <span className="text-white/80 text-xs font-medium group-hover:text-white transition-colors">
                      {link.label.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default BusWidget;
