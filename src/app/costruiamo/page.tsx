"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from 'next/image';

export default function CostruiamoPage() {
  // Trasparenza: progress bar stato locale (editabile)
  const goal = 500;
  const raised = 180; // aggiorna qui quando necessario
  const progress = useMemo(() => Math.min(100, Math.round((raised / goal) * 100)), [raised, goal]);

  // Parallax hero
  const [heroOffset, setHeroOffset] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || 0;
      // parallax molto leggero
      setHeroOffset(Math.min(60, y * 0.18));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll reveal
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>('[data-animate]');
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      { threshold: 0.15 }
    );
    elements.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  // Form: invio via mailto e piccolo feedback
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<null | "ok" | "error">(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const subject = encodeURIComponent("Proposta di collaborazione – MyCivitanova");
      const body = encodeURIComponent(
        `Nome: ${formData.name}\nEmail: ${formData.email}\nRuolo: ${formData.role}\n\nMessaggio:\n${formData.message}`
      );
      // Sostituisci l'email con la tua
      const mailto = `mailto:info@mycivitanova.it?subject=${subject}&body=${body}`;
      window.location.href = mailto;
      setSubmitted("ok");
    } catch (err) {
      console.error(err);
      setSubmitted("error");
    } finally {
      setSubmitting(false);
    }
  };

  // Condivisione
  const appUrl = typeof window !== "undefined" ? window.location.origin : "https://mycivitanova.it";
  const shareUrl = `${appUrl}/costruiamo`;
  const shareText = encodeURIComponent("Scopri e supporta MyCivitanova – un progetto per cittadini e turisti ✨");

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Clipboard non disponibile");
    }
  };
  const [copied, setCopied] = useState(false);

  const tryNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "MyCivitanova", text: "Unisciti al progetto!", url: shareUrl });
      } catch (e) {
        // utente ha annullato o share non riuscito
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background layers */}
      <div className="cos-gradient-bg" aria-hidden="true" />
      <div className="cos-grid-overlay" aria-hidden="true" />
      <div className="cos-orb cos-orb-1" aria-hidden="true" />
      <div className="cos-orb cos-orb-2" aria-hidden="true" />

      {/* Top bar / breadcrumb minimo */}
      <div className="sticky top-0 z-30 bg-black/60 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-white/70 hover:text-white transition-colors">← Home</Link>
          <div className="text-accent text-xs">Progetto</div>
        </div>
      </div>

      {/* Hero section */}
      <section className="relative overflow-hidden">
        <div
          className="h-[46vh] sm:h-[56vh] w-full bg-cover bg-center will-change-transform"
          style={{
            transform: `translateY(${heroOffset}px) scale(1.06)`,
            backgroundImage:
              "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1600&auto=format&fit=crop')",
          }}
        >
          <div className="w-full h-full bg-gradient-to-b from-black/20 via-black/55 to-black" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <div className="text-center" data-animate>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold futuristic-title">Costruiamo il Futuro di Civitanova, Insieme.</h1>
            <p className="mt-3 text-white/80 max-w-2xl mx-auto">
              Scopri la visione dietro MyCivitanova, la nostra missione di trasparenza e come il tuo contributo può fare la differenza.
            </p>
          </div>
        </div>
        <div className="cos-hero-shine" aria-hidden="true" />
      </section>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 relative z-10">
        {/* Blocco 1 – La storia */}
        <section className="grid md:grid-cols-2 gap-4 glass-card border border-white/10 rounded-2xl p-5 card-glow" data-animate>
          <div>
            <h2 className="h2 mb-3">📖 La Nostra Storia: Passione e Innovazione</h2>
            <p className="text-white/80 leading-relaxed">
              Dietro MyCivitanova c&apos;è una storia di passione e autodidattismo. Ho imparato a programmare da zero, spinto dall&apos;amore per la mia città e dal desiderio di renderla più connessa e accessibile a tutti. Ogni linea di codice, ogni funzionalità, è frutto di curiosità, sperimentazione e un impegno costante per migliorare la vita a Civitanova.
            </p>
            <p className="mt-3 text-white/70">– Il team di MyCivitanova</p>
          </div>
          <div className="rounded-xl overflow-hidden border border-white/10 relative" data-animate>
            <Image
              src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=1200&auto=format&fit=crop"
              alt="Laptop con sfondo Civitanova"
              layout="fill"
              objectFit="cover"
              className="w-full h-56 object-cover md:h-full hover:scale-[1.02] transition-transform duration-500"
            />
          </div>
        </section>

        {/* Blocco 2 – La missione */}
        <section className="glass-card border border-white/10 rounded-2xl p-5 card-glow" data-animate>
          <h2 className="h2 mb-4">🎯 La Nostra Missione: Connettere e Valorizzare</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="neo-card p-4" data-animate>
              <div className="text-2xl">🗺</div>
              <div className="font-semibold mt-2">Esplorare la Città</div>
              <p className="text-white/70 text-sm mt-1">Offrire strumenti intuitivi per scoprire Civitanova: mappe interattive, informazioni su parcheggi, eventi imperdibili e notizie locali aggiornate.</p>
            </div>
            <div className="neo-card p-4" data-animate>
              <div className="text-2xl">🏪</div>
              <div className="font-semibold mt-2">Promuovere le Attività</div>
              <p className="text-white/70 text-sm mt-1">Dare risalto ai commercianti e alle attività locali, creando un ponte digitale tra loro e la comunità di Civitanova.</p>
            </div>
            <div className="neo-card p-4" data-animate>
              <div className="text-2xl">🤝</div>
              <div className="font-semibold mt-2">Costruire una Comunità</div>
              <p className="text-white/70 text-sm mt-1">Fornire una piattaforma dove cittadini e turisti possano connettersi, condividere esperienze e contribuire attivamente alla vita della città.</p>
            </div>
          </div>
        </section>

        {/* Blocco 3 – Perché serve il tuo aiuto */}
        <section className="glass-card border border-white/10 rounded-2xl p-5 card-glow" data-animate>
          <h2 className="h2 mb-3">🚀 Il Tuo Ruolo è Fondamentale: Perché Abbiamo Bisogno di Te</h2>
          <p className="text-white/80 leading-relaxed mb-4">MyCivitanova è un progetto ambizioso che cresce grazie al supporto della sua comunità. Il tuo aiuto è cruciale per:</p>
          <ul className="list-disc list-inside space-y-2 text-white/80">
            <li><strong>Sostenere i Costi Operativi:</strong> Server, manutenzione e infrastruttura richiedono risorse. Ogni contributo economico ci permette di mantenere l&apos;app attiva e performante.</li>
            <li><strong>Espandere il Team:</strong> Cerchiamo talenti in programmazione, design, marketing e copywriting per accelerare lo sviluppo di nuove funzionalità e migliorare l&apos;esperienza utente.</li>
            <li><strong>Amplificare il Messaggio:</strong> Condividere MyCivitanova con amici, familiari e attività locali è un gesto semplice ma potente che ci aiuta a crescere e a raggiungere più persone.</li>
          </ul>
        </section>

        {/* Blocco 4 – Modalità di supporto (3 Card) */}
        <section className="grid md:grid-cols-3 gap-4" data-animate>
          {/* Card 1: Donazione */}
          <div className="glass-card border border-white/10 rounded-2xl p-5 card-glow flex flex-col">
            <div className="flex-1">
              <h3 className="h3">💖 Dona il Tuo Contributo</h3>
              <p className="mt-2 text-white/80 text-sm">Ogni piccolo gesto conta. Il tuo supporto economico è vitale per coprire i costi e finanziare nuove, entusiasmanti funzionalità.</p>
            </div>
            <a
              href="https://www.buymeacoffee.com/yourid"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center justify-center px-4 py-3 rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 transition-all action-button-float shine-btn"
            >
              Supporta su BuyMeACoffee
            </a>
          </div>

          {/* Card 2: Unisciti al progetto */}
          <div className="glass-card border border-white/10 rounded-2xl p-5 card-glow">
            <h3 className="h3">🤝 Unisciti al Nostro Team</h3>
            <p className="mt-2 text-white/80 text-sm">Se hai competenze in sviluppo, design, marketing o copywriting, la tua energia è ciò che ci serve per portare MyCivitanova al livello successivo.</p>
            <form className="mt-3 space-y-3" onSubmit={handleSubmit}>
              <input
                name="name"
                placeholder="Il tuo Nome"
                className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 focus:border-accent focus:outline-none"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="La tua Email"
                className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 focus:border-accent focus:outline-none"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <input
                name="role"
                placeholder="Il tuo Ruolo (es. Sviluppatore Frontend, UI Designer, Content Creator)"
                className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 focus:border-accent focus:outline-none"
                value={formData.role}
                onChange={handleChange}
              />
              <textarea
                name="message"
                placeholder="Parlaci di te e di come vorresti contribuire!"
                rows={4}
                className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 focus:border-accent focus:outline-none"
                value={formData.message}
                onChange={handleChange}
              />
              <button
                type="submit"
                disabled={submitting}
                className="w-full px-4 py-2 rounded-xl font-semibold bg-accent text-black hover:opacity-90 transition-all shine-btn"
              >
                {submitting ? "Invio..." : "Invia la tua Proposta"}
              </button>
              {submitted === "ok" && (
                <p className="text-green-400 text-xs">Bozza email aperta nell&apos;app di posta. Grazie per il tuo interesse!</p>
              )}
              {submitted === "error" && (
                <p className="text-red-400 text-xs">Si è verificato un errore durante la preparazione dell&apos;email. Riprova più tardi.</p>
              )}
            </form>
          </div>

          {/* Card 3: Diffondi */}
          <div className="glass-card border border-white/10 rounded-2xl p-5 card-glow flex flex-col">
            <div className="flex-1">
              <h3 className="h3">📢 Diffondi la Voce</h3>
              <p className="mt-2 text-white/80 text-sm">Aiutaci a far conoscere MyCivitanova! Ogni condivisione amplifica il nostro impatto e ci avvicina al nostro obiettivo di una città più connessa.</p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <a
                className="px-3 py-2 rounded-lg bg-green-600/90 hover:bg-green-600 text-white text-sm text-center shine-btn"
                href={`https://wa.me/?text=${shareText}%20${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp
              </a>
              <a
                className="px-3 py-2 rounded-lg bg-blue-600/90 hover:bg-blue-600 text-white text-sm text-center shine-btn"
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Facebook
              </a>
              <a
                className="px-3 py-2 rounded-lg bg-sky-500/90 hover:bg-sky-500 text-white text-sm text-center shine-btn"
                href={`https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                X / Twitter
              </a>
              <button
                onClick={tryNativeShare}
                className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm text-center shine-btn"
              >
                Condividi
              </button>
              <button
                onClick={copyToClipboard}
                className="col-span-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm text-center"
              >
                {copied ? "Link copiato!" : "Copia Link"}
              </button>
            </div>
          </div>
        </section>

        {/* Blocco 5 – Trasparenza */}
        <section className="glass-card border border-white/10 rounded-2xl p-5 card-glow" data-animate>
          <h2 className="h2 mb-3">Transparency Report: Il Tuo Supporto, il Nostro Impegno</h2>
          <p className="text-white/80">
            Ogni singolo euro donato a MyCivitanova viene interamente reinvestito nello sviluppo di nuove funzionalità, nel miglioramento dell&apos;esperienza utente e nel mantenimento dell&apos;infrastruttura. Questo è un progetto indipendente, nato per la città e senza fini di lucro personale. La tua fiducia è la nostra priorità.
          </p>
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-white/70 mb-2">
              <span>Obiettivo Attuale: Sviluppo della Nuova Sezione Parcheggi Intelligenti</span>
              <span>
                Raccolti <span className="text-white">€{raised}</span> di €{goal}
              </span>
            </div>
            <div className="h-3 bg-white/10 rounded-full overflow-hidden glossy-bar">
              <div
                className="h-full bg-accent"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-1 text-right text-xs text-white/70">{progress}% Completato</div>
          </div>
        </section>

        {/* Visione futura */}
        <section className="glass-card border border-white/10 rounded-2xl p-6 card-glow" data-animate>
          <h2 className="h2 mb-3">🌟 La Nostra Visione: Un Futuro Digitale per Civitanova</h2>
          <p className="text-white/80 leading-relaxed">
            Questo è solo l&apos;inizio di un viaggio entusiasmante. Immaginiamo MyCivitanova come il cuore pulsante digitale della città, un punto di riferimento indispensabile per residenti, visitatori e attività commerciali. Con il tuo prezioso supporto, possiamo trasformare questa visione in una realtà duratura, creando un impatto positivo che si estenderà per anni a venire.
          </p>
        </section>

        {/* Extra – Firma, foto, changelog */}
        <section className="grid md:grid-cols-3 gap-4" data-animate>
          <div className="glass-card border border-white/10 rounded-2xl p-5 card-glow">
            <h3 className="h3 mb-2">✍️ Il Team di MyCivitanova</h3>
            <p className="text-white/80">Un progetto nato dalla passione per la nostra città.</p>
          </div>
          <div className="glass-card border border-white/10 rounded-2xl p-5 card-glow overflow-hidden">
            <h3 className="h3 mb-2">📷 Uno sguardo</h3>
            <div className="relative h-40 mt-2">
              <Image
                src="https://images.unsplash.com/photo-1521295121783-8a321d551ad2?q=80&w=1200&auto=format&fit=crop"
                alt="Civitanova – mare e città"
                layout="fill"
                objectFit="cover"
                className="rounded-lg border border-white/10 hover:scale-[1.02] transition-transform duration-500"
              />
            </div>
          </div>
          <div className="glass-card border border-white/10 rounded-2xl p-5 card-glow">
            <h3 className="h3 mb-2">🗒️ Changelog</h3>
            <ul className="space-y-2 text-sm text-white/80">
              <li>🎉 Aggiunta la sezione Eventi</li>
              <li>🚗 In lavorazione la mappa parcheggi</li>
              <li>🗺 Migliorata la navigazione sulle mappe</li>
            </ul>
          </div>
        </section>

        {/* CTA finale sticky per mobile */}
        <div className="sticky bottom-3 z-20" data-animate>
          <div className="max-w-5xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 flex items-center gap-3 card-glow">
              <div className="hidden sm:block text-2xl">💚</div>
              <div className="flex-1">
                <div className="font-semibold">Sei entusiasta della nostra visione?</div>
                <div className="text-xs text-white/70">Unisciti a noi o supporta il progetto!</div>
              </div>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.querySelector("form");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-5 py-3 rounded-full bg-accent text-black font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-in-out shine-btn"
              >
                Unisciti a Noi!
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="h-24" />

      {/* Page-specific styles */}
      <style jsx global>{`
        /* Subtle gold gradient background + matrix grid */
        .cos-gradient-bg {
          position: fixed;
          inset: 0;
          pointer-events: none;
          background:
            radial-gradient(1200px 800px at 10% -10%, rgba(255, 215, 0, 0.06), transparent 60%),
            radial-gradient(1200px 800px at 90% 10%, rgba(198, 255, 0, 0.05), transparent 60%),
            linear-gradient(180deg, rgba(255, 230, 150, 0.035) 0%, rgba(255, 215, 0, 0.03) 35%, rgba(0,0,0,0) 75%);
          z-index: 0;
        }
        .cos-grid-overlay {
          position: fixed;
          inset: 0;
          pointer-events: none;
          background-image:
            repeating-linear-gradient(
              to right,
              rgba(255, 255, 255, 0.03) 0px,
              rgba(255, 255, 255, 0.03) 1px,
              transparent 1px,
              transparent 24px
            ),
            repeating-linear-gradient(
              to bottom,
              rgba(255, 255, 255, 0.03) 0px,
              rgba(255, 255, 255, 0.03) 1px,
              transparent 1px,
              transparent 24px
            );
          mask-image: radial-gradient(circle at center, rgba(0,0,0,0.6), rgba(0,0,0,1));
          z-index: 1;
        }
        .cos-orb {
          position: fixed;
          width: 520px;
          height: 520px;
          border-radius: 50%;
          filter: blur(60px);
          opacity: 0.08;
          pointer-events: none;
          z-index: 0;
        }
        .cos-orb-1 { left: -160px; top: 20%; background: radial-gradient(circle, #C6FF00, transparent 60%); animation: float-mild 12s ease-in-out infinite; }
        .cos-orb-2 { right: -180px; top: 60%; background: radial-gradient(circle, #FFD700, transparent 60%); animation: float-mild 14s ease-in-out infinite reverse; }

        .cos-hero-shine {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.06) 50%, transparent 70%);
          mix-blend-mode: screen;
          animation: shine-sweep 6s linear infinite;
        }

        @keyframes shine-sweep {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes float-mild {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }

        /* Glass + neon edge */
        .glass-card {
          background: rgba(255, 255, 255, 0.06);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          position: relative;
          overflow: hidden;
        }
        .glass-card::after {
          content: "";
          position: absolute; inset: 0; pointer-events: none; border-radius: inherit;
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(198, 255, 0, 0.08), transparent 70%);
          opacity: 0.25;
        }

        .neo-card {
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.02));
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 0.75rem;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .neo-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(255, 215, 0, 0.08), 0 6px 16px rgba(0, 0, 0, 0.35);
        }

        /* Shine effect for CTA */
        .shine-btn { position: relative; overflow: hidden; }
        .shine-btn::after {
          content: "";
          position: absolute; top: -120%; left: -40%; width: 40%; height: 300%;
          background: linear-gradient(120deg, rgba(255,255,255,0), rgba(255,255,255,0.4), rgba(255,255,255,0));
          transform: rotate(20deg);
          animation: shine-run 4s ease-in-out infinite;
        }
        @keyframes shine-run {
          0% { transform: translateX(-120%) rotate(20deg); }
          60% { transform: translateX(220%) rotate(20deg); }
          100% { transform: translateX(220%) rotate(20deg); }
        }

        /* Glossy progress bar */
        .glossy-bar { position: relative; }
        .glossy-bar::after {
          content: ""; position: absolute; inset: 0; pointer-events: none;
          background: linear-gradient(180deg, rgba(255,255,255,0.2), rgba(255,255,255,0));
        }

        /* Futuristic title accent underline */
        .futuristic-title { position: relative; display: inline-block; }
        .futuristic-title::after {
          content: ""; position: absolute; left: 50%; bottom: -10px; transform: translateX(-50%);
          width: 64%; height: 2px; border-radius: 9999px;
          background: linear-gradient(90deg, rgba(255,215,0,0), rgba(255,215,0,0.5), rgba(198,255,0,0.3), rgba(255,215,0,0));
          box-shadow: 0 0 12px rgba(198,255,0,0.25);
        }

        /* Scroll reveal */
        [data-animate] { opacity: 0; transform: translateY(18px) scale(0.99); transition: opacity .6s ease, transform .7s cubic-bezier(0.22, 1, 0.36, 1); }
        .is-visible { opacity: 1 !important; transform: translateY(0) scale(1) !important; }
      `}</style>
    </main>
  );
}
