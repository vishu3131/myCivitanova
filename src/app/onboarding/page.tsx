"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion, Variants } from "framer-motion";
import { Bell, Map, ShieldCheck, Sparkles, Trophy } from "lucide-react";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";

// Onboarding super-moderno potenziato per mobile:
// - Transizioni direzionali slide+blur tra step con easing morbidi
// - Animazioni per-parola (stagger) con entry neon trail per parole chiave
// - Gesture di swipe con haptic feedback su mobile (light mentre superi la soglia, medium sul cambio slide)
// - Ottimizzazioni mobile: blur ridotto, meno particelle, soglie swipe tarate
// - Rispetto di prefers-reduced-motion

const steps = [
  {
    id: "welcome",
    title: "Benvenuto a Civitanova",
    description:
      "Un'esperienza urbana immersiva: esplora quartieri, spiagge, arte, eventi e servizi con un design neon e interazioni fluide.",
    Icon: Sparkles,
    accent: "from-fuchsia-500 via-purple-500 to-blue-500",
  },
  {
    id: "map",
    title: "Mappa Interattiva",
    description:
      "Scopri luoghi, parcheggi e punti d'interesse con filtri smart e percorsi a misura di città.",
    Icon: Map,
    accent: "from-blue-500 via-cyan-500 to-emerald-400",
  },
  {
    id: "play",
    title: "Gioca e Vinci Badge",
    description:
      "Completa sfide leggere, colleziona badge e scala la leaderboard della community.",
    Icon: Trophy,
    accent: "from-amber-500 via-orange-500 to-rose-500",
  },
  {
    id: "privacy",
    title: "Privacy e Controllo",
    description:
      "Imposti tu le regole: preferenze, notifiche e dati sono sempre sotto il tuo controllo.",
    Icon: ShieldCheck,
    accent: "from-emerald-500 via-teal-500 to-sky-500",
  },
  {
    id: "notify",
    title: "Resta Aggiornato",
    description:
      "Vuoi ricevere aggiornamenti su eventi e novità? Puoi abilitarli adesso o farlo più tardi nelle impostazioni.",
    Icon: Bell,
    accent: "from-pink-500 via-fuchsia-500 to-indigo-500",
  },
] as const;

type Step = (typeof steps)[number];

// Parole chiave per applicare il neon trail all'ingresso
const KEYWORDS = new Set([
  "civitanova",
  "mappa",
  "badge",
  "privacy",
  "aggiornato",
]);

export default function OnboardingPage() {
  const router = useRouter();
  const search = useSearchParams();
  const replay = search?.get("replay") === "1";
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1); // 1 = avanti, -1 = indietro
  const [mounted, setMounted] = useState(false);
  const [notifStatus, setNotifStatus] = useState<"default" | "granted" | "denied">("default");
  const prefersReduced = usePrefersReducedMotion();
  const isMobile = useIsMobile();
  const activeStep: Step = steps[index];
  const { triggerHaptic } = useHapticFeedback();
  const swipeHapticFired = useRef(false);

  // Se l'utente ha già completato l'onboarding e non è in modalità "replay", salta.
  useEffect(() => {
    setMounted(true);
    try {
      const done = localStorage.getItem("onboardingComplete") === "1";
      if (done && !replay) {
        router.replace("/");
      }
    } catch {}
  }, [replay, router]);

  // Notifiche: stato iniziale
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window)) return;
    setNotifStatus(Notification.permission as any);
  }, []);

  const goNext = () => {
    setDir(1);
    triggerHaptic("light");
    setIndex((i) => Math.min(i + 1, steps.length - 1));
  };

  const goBack = () => {
    setDir(-1);
    triggerHaptic("light");
    setIndex((i) => Math.max(i - 1, 0));
  };

  const skipAll = () => {
    completeAndGoHome();
  };

  const completeAndGoHome = () => {
    try {
      localStorage.setItem("onboardingComplete", "1");
    } catch {}
    router.replace("/");
  };

  const askNotifications = async () => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window)) {
      setNotifStatus("denied");
      return;
    }
    try {
      const perm = await Notification.requestPermission();
      setNotifStatus(perm as any);
      try {
        localStorage.setItem("notifPref", perm);
      } catch {}
    } catch {
      setNotifStatus("denied");
    }
  };

  const isLast = index === steps.length - 1;

  // Evita flash in SSR/idratazione
  if (!mounted) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-black text-white">
        <div className="animate-pulse opacity-60">Caricamento…</div>
      </div>
    );
  }

  // swipe config tarato per mobile
  const swipeThreshold = prefersReduced ? Infinity : isMobile ? 60 : 90;
  const velocityThreshold = isMobile ? 550 : 600;

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-black text-white">
      {/* Glow background dinamico */}
      <GradientOrbs step={activeStep} />

      {/* Top bar: progress + skip */}
      <div className="relative z-10 max-w-[1100px] mx-auto px-6 pt-6">
        <div className="flex items-center justify-between">
          <ProgressBar total={steps.length} index={index} />
          <button
            onClick={skipAll}
            className="ml-4 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 px-3 py-1.5 text-xs text-white/90 backdrop-blur-sm transition"
            aria-label="Salta onboarding"
          >
            Salta
          </button>
        </div>
      </div>

      {/* Contenuto centrale con gesture drag per cambiare slide */}
      <div className="relative z-10 max-w-[1100px] mx-auto px-6 py-8 md:py-14">
        <motion.div
          drag={prefersReduced ? false : "x"}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.12}
          onDrag={(e, info) => {
            if (prefersReduced) return;
            // Haptic leggero quando superi la soglia su mobile
            const crossed = Math.abs(info.offset.x) > swipeThreshold;
            if (isMobile && crossed && !swipeHapticFired.current) {
              triggerHaptic("light");
              swipeHapticFired.current = true;
            }
          }}
          onDragEnd={(e, info) => {
            if (prefersReduced) return;
            const goForward = info.offset.x < -swipeThreshold || info.velocity.x < -velocityThreshold;
            const goBackward = info.offset.x > swipeThreshold || info.velocity.x > velocityThreshold;
            if (goForward) {
              setDir(1);
              if (isMobile) triggerHaptic("medium");
              setIndex((i) => Math.min(i + 1, steps.length - 1));
            } else if (goBackward) {
              setDir(-1);
              if (isMobile) triggerHaptic("medium");
              setIndex((i) => Math.max(i - 1, 0));
            }
            swipeHapticFired.current = false;
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-center">
            {/* Step visuals */}
            <div className="order-2 md:order-1">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={activeStep.id}
                  variants={visualVariants}
                  custom={dir}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={softSpring}
                  className="relative rounded-2xl border border-white/15 bg-white/[0.04] backdrop-blur-xl p-6 md:p-10 shadow-[0_0_60px_-12px_rgba(99,102,241,0.35)]"
                >
                  <StepVisual Icon={activeStep.Icon} accent={activeStep.accent} prefersReduced={prefersReduced} isMobile={isMobile} />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Step copy + CTA con animazioni per-parola e neon trail */}
            <div className="order-1 md:order-2">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={activeStep.title}
                  variants={copyContainerVariants}
                  custom={dir}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.6, ease: easeEmphasized }}
                  className="space-y-5"
                >
                  <motion.div
                    variants={chipVariants}
                    custom={dir}
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] text-white/80"
                  >
                    <span className="h-2 w-2 rounded-full bg-fuchsia-400" />
                    Onboarding
                  </motion.div>

                  <AnimatedTitle text={activeStep.title} dir={dir} accent={activeStep.accent} />
                  <AnimatedParagraph text={activeStep.description} dir={dir} />

                  {/* Azioni contestuali per lo step delle notifiche */}
                  {activeStep.id === "notify" && (
                    <motion.div
                      variants={notifyVariants}
                      custom={dir}
                      className="pt-2"
                    >
                      <div className="text-sm text-white/70 mb-3">
                        Stato notifiche: {notifStatus === "default" ? "non impostato" : notifStatus}
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={askNotifications}
                          className="rounded-xl border border-white/15 bg-white/10 hover:bg-white/15 px-4 py-2 text-sm transition"
                        >
                          Abilita notifiche
                        </button>
                        <button
                          onClick={() => {
                            setDir(1);
                            setIndex((i) => Math.min(i + 1, steps.length - 1));
                          }}
                          className="rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-4 py-2 text-sm transition"
                        >
                          Più tardi
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Navigazione */}
                  <div className="pt-4 flex items-center gap-3">
                    <button
                      onClick={goBack}
                      disabled={index === 0}
                      className="rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 disabled:opacity-40 px-5 py-3 text-sm transition"
                    >
                      Indietro
                    </button>

                    {!isLast ? (
                      <button
                        onClick={goNext}
                        className="group relative rounded-xl px-6 py-3 text-sm font-semibold transition border border-white/15 bg-gradient-to-r from-fuchsia-600/70 to-indigo-600/70 hover:from-fuchsia-500/80 hover:to-indigo-500/80"
                      >
                        Avanti
                        <span className="absolute inset-0 -z-10 blur-xl opacity-40 bg-gradient-to-r from-fuchsia-500 to-indigo-500" />
                      </button>
                    ) : (
                      <button
                        onClick={completeAndGoHome}
                        className="group relative rounded-xl px-6 py-3 text-sm font-semibold transition border border-white/15 bg-gradient-to-r from-emerald-600/70 to-cyan-600/70 hover:from-emerald-500/80 hover:to-cyan-500/80"
                      >
                        Inizia ora
                        <span className="absolute inset-0 -z-10 blur-xl opacity-40 bg-gradient-to-r from-emerald-500 to-cyan-500" />
                      </button>
                    )}
                  </div>

                  {/* Dots */}
                  <div className="pt-4 flex items-center gap-2">
                    {steps.map((s, i) => (
                      <button
                        key={s.id}
                        aria-label={`Vai allo step ${i + 1}`}
                        onClick={() => {
                          setDir(i > index ? 1 : -1);
                          setIndex(i);
                          if (isMobile) triggerHaptic("light");
                        }}
                        className={`h-2.5 rounded-full transition-all ${
                          i === index ? "w-8 bg-white" : "w-2.5 bg-white/30 hover:bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom safe area gradient */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black to-transparent" />
    </div>
  );
}

// Variants & transitions
const easeEmphasized = [0.16, 1, 0.3, 1];
const softSpring = { type: "spring", stiffness: 120, damping: 18, mass: 0.7 } as const;

const visualVariants: Variants = {
  initial: (dir: 1 | -1) => ({
    opacity: 0,
    x: 24 * dir,
    y: 8,
    filter: "blur(6px)", // blur leggermente ridotto per mobile
    scale: 0.98,
  }),
  animate: {
    opacity: 1,
    x: 0,
    y: 0,
    filter: "blur(0px)",
    scale: 1,
    transition: { ...softSpring, opacity: { duration: 0.5 } },
  },
  exit: (dir: 1 | -1) => ({
    opacity: 0,
    x: -24 * dir,
    y: -6,
    filter: "blur(6px)",
    scale: 0.985,
    transition: { duration: 0.4, ease: easeEmphasized },
  }),
};

const copyContainerVariants: Variants = {
  initial: (dir: 1 | -1) => ({ opacity: 0, x: 36 * dir, filter: "blur(8px)" }),
  animate: { opacity: 1, x: 0, filter: "blur(0px)", transition: { staggerChildren: 0.02 } },
  exit: (dir: 1 | -1) => ({ opacity: 0, x: -28 * dir, filter: "blur(8px)" }),
};

const chipVariants: Variants = {
  initial: (dir: 1 | -1) => ({ opacity: 0, x: 10 * dir, filter: "blur(4px)" }),
  animate: { opacity: 1, x: 0, filter: "blur(0px)", transition: { duration: 0.5, ease: easeEmphasized } },
  exit: (dir: 1 | -1) => ({ opacity: 0, x: -10 * dir, filter: "blur(4px)" }),
};

const notifyVariants: Variants = {
  initial: (dir: 1 | -1) => ({ opacity: 0, y: 10, x: 10 * dir, filter: "blur(6px)" }),
  animate: { opacity: 1, y: 0, x: 0, filter: "blur(0px)", transition: { duration: 0.5, ease: easeEmphasized } },
  exit: (dir: 1 | -1) => ({ opacity: 0, y: -6, x: -10 * dir, filter: "blur(6px)" }),
};

// Componenti testo animato con neon trail sulle keywords
function AnimatedTitle({ text, dir, accent }: { text: string; dir: 1 | -1; accent: string }) {
  const prefersReduced = usePrefersReducedMotion();
  if (prefersReduced) {
    return <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">{text}</h1>;
  }
  return (
    <motion.h1
      className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight"
      variants={titleContainerVariants}
      custom={dir}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <AnimatedWords text={text} dir={dir} size="title" accent={accent} />
      {/* underline glow morbido */}
      <motion.span
        className="block h-[3px] mt-2 rounded bg-gradient-to-r from-fuchsia-500/70 to-indigo-500/70"
        variants={underlineVariants}
        custom={dir}
      />
    </motion.h1>
  );
}

function AnimatedParagraph({ text, dir }: { text: string; dir: 1 | -1 }) {
  const prefersReduced = usePrefersReducedMotion();
  if (prefersReduced) {
    return <p className="text-white/80 md:text-lg leading-relaxed">{text}</p>;
  }
  return (
    <motion.p
      className="text-white/80 md:text-lg leading-relaxed"
      variants={paragraphContainerVariants}
      custom={dir}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <AnimatedWords text={text} dir={dir} size="paragraph" />
    </motion.p>
  );
}

const titleContainerVariants: Variants = {
  initial: (dir: 1 | -1) => ({ opacity: 0, x: 36 * dir, filter: "blur(10px)", letterSpacing: "0.02em" }),
  animate: { opacity: 1, x: 0, filter: "blur(0px)", letterSpacing: "0em", transition: { staggerChildren: 0.02 } },
  exit: (dir: 1 | -1) => ({ opacity: 0, x: -28 * dir, filter: "blur(10px)" }),
};

const underlineVariants: Variants = {
  initial: (dir: 1 | -1) => ({ opacity: 0, x: 36 * dir, scaleX: 0.8 }),
  animate: { opacity: 1, x: 0, scaleX: 1, transition: { duration: 0.6, ease: easeEmphasized } },
  exit: (dir: 1 | -1) => ({ opacity: 0, x: -28 * dir, scaleX: 0.9 }),
};

const paragraphContainerVariants: Variants = {
  initial: (dir: 1 | -1) => ({ opacity: 0, x: 30 * dir, filter: "blur(8px)" }),
  animate: { opacity: 1, x: 0, filter: "blur(0px)", transition: { staggerChildren: 0.01 } },
  exit: (dir: 1 | -1) => ({ opacity: 0, x: -22 * dir, filter: "blur(8px)" }),
};

function AnimatedWords({ text, dir, size = "paragraph" as const, accent }: { text: string; dir: 1 | -1; size?: "title" | "paragraph"; accent?: string }) {
  const words = useMemo(() => text.split(" "), [text]);
  return (
    <span className="inline-block">
      {words.map((raw, i) => {
        const clean = raw.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
        const isKeyword = KEYWORDS.has(clean);
        const content = (
          <motion.span
            key={`${raw}-${i}`}
            className="inline-block will-change-transform"
            variants={size === "title" ? wordTitleVariants : wordParagraphVariants}
            custom={dir}
            transition={{ duration: 0.6, ease: easeEmphasized }}
          >
            {isKeyword && size === "title" ? (
              <NeonWord accent={accent}>{raw}</NeonWord>
            ) : (
              <span>{raw}</span>
            )}
            {i < words.length - 1 ? <span>&nbsp;</span> : null}
          </motion.span>
        );
        return content;
      })}
    </span>
  );
}

function NeonWord({ children, accent = "from-fuchsia-500 to-indigo-500" }: { children: React.ReactNode; accent?: string }) {
  // Doppio strato: testo normale + layer sottostante con gradiente e blur che scorre per simulare trail
  return (
    <span className="relative inline-block">
      <span className="relative z-10">{children}</span>
      <motion.span
        aria-hidden
        className={`absolute inset-0 z-0 pointer-events-none bg-gradient-to-r ${accent} bg-clip-text text-transparent`}
        initial={{ opacity: 0, filter: "blur(10px)", x: -8 }}
        animate={{ opacity: [0, 0.7, 0], x: [-8, 0, 8] }}
        transition={{ duration: 0.9, ease: easeEmphasized }}
        style={{ textShadow: "0 0 16px rgba(255,255,255,0.35)" }}
      >
        {children}
      </motion.span>
    </span>
  );
}

const wordTitleVariants: Variants = {
  initial: (dir: 1 | -1) => ({
    opacity: 0,
    y: 16,
    x: 6 * dir,
    filter: "blur(8px)",
    rotate: 0.15 * dir,
  }),
  animate: {
    opacity: 1,
    y: 0,
    x: 0,
    filter: "blur(0px)",
    rotate: 0,
  },
  exit: (dir: 1 | -1) => ({ opacity: 0, y: -10, x: -4 * dir, filter: "blur(8px)", rotate: -0.15 * dir }),
};

const wordParagraphVariants: Variants = {
  initial: (dir: 1 | -1) => ({ opacity: 0, y: 10, x: 4 * dir, filter: "blur(6px)" }),
  animate: { opacity: 1, y: 0, x: 0, filter: "blur(0px)" },
  exit: (dir: 1 | -1) => ({ opacity: 0, y: -8, x: -3 * dir, filter: "blur(6px)" }),
};

function ProgressBar({ total, index }: { total: number; index: number }) {
  const pct = ((index + 1) / total) * 100;
  return (
    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
      <motion.div
        className="h-full bg-gradient-to-r from-fuchsia-500 to-indigo-500"
        style={{ width: `${pct}%` }}
        initial={false}
        animate={{ width: `${pct}%` }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
      />
    </div>
  );
}

function StepVisual({
  Icon,
  accent,
  prefersReduced,
  isMobile,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  accent: string;
  prefersReduced: boolean;
  isMobile: boolean;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [xy, setXy] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReduced) return;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
      const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
      setXy({ x, y });
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", () => setXy({ x: 0, y: 0 }));
    return () => {
      el.removeEventListener("mousemove", onMove);
    };
  }, [prefersReduced]);

  const tiltIntensity = isMobile ? 5 : 8;
  const tilt = prefersReduced ? { rotateX: 0, rotateY: 0 } : { rotateX: -xy.y * tiltIntensity, rotateY: xy.x * tiltIntensity };

  return (
    <motion.div
      ref={ref}
      className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.02]"
      style={{ transformStyle: "preserve-3d" as any }}
      animate={tilt as any}
      transition={{ type: "spring", stiffness: 120, damping: 14, mass: 0.5 }}
    >
      {/* Glow gradient */}
      <div className={`absolute -inset-20 blur-3xl opacity-50 bg-gradient-to-r ${accent}`} />

      {/* Icona centrale con neon e parallax */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ transform: "translateZ(30px)" }}
      >
        <motion.div
          className="relative p-8 md:p-10"
          initial={{ scale: 0.96, opacity: 0.9 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={softSpring}
        >
          <div className={`absolute inset-0 -m-6 md:-m-8 blur-2xl opacity-40 bg-gradient-to-r ${accent}`} />
          <Icon className="relative size-20 md:size-28 text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.35)]" />
        </motion.div>
      </div>

      {/* Particelle decorative morbide (ridotte su mobile) */}
      <SoftParticles count={isMobile ? 6 : 10} amplitude={isMobile ? 4 : 6} />

      {/* Griglia decorativa */}
      <DecorGrid />
    </motion.div>
  );
}

function SoftParticles({ count = 10, amplitude = 6 }: { count?: number; amplitude?: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute h-1.5 w-1.5 rounded-full bg-white/40"
          style={{ top: `${(i * 13) % 90 + 5}%`, left: `${(i * 29) % 90 + 5}%` }}
          initial={{ opacity: 0.35, y: 0 }}
          animate={{ opacity: [0.2, 0.6, 0.2], y: [0, -amplitude, 0] }}
          transition={{ duration: 3 + (i % 5), repeat: Infinity, ease: "easeInOut", delay: i * 0.1 }}
        />
      ))}
    </div>
  );
}

function DecorGrid() {
  return (
    <svg className="absolute inset-0 opacity-[0.08]" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
      <defs>
        <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M 24 0 L 0 0 0 24" fill="none" stroke="white" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  );
}

function GradientOrbs({ step }: { step: Step }) {
  return (
    <>
      <motion.div
        key={`orb-a-${step.id}`}
        className="pointer-events-none absolute -top-24 -left-24 h-[380px] w-[380px] rounded-full blur-3xl"
        style={{ background: "radial-gradient(closest-side, rgba(217,70,239,0.35), transparent)" }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8, ease: easeEmphasized }}
      />
      <motion.div
        key={`orb-b-${step.id}`}
        className="pointer-events-none absolute -bottom-24 -right-24 h-[420px] w-[420px] rounded-full blur-3xl"
        style={{ background: "radial-gradient(closest-side, rgba(99,102,241,0.35), transparent)" }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8, ease: easeEmphasized }}
      />
    </>
  );
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);
  return reduced;
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}