"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, Sparkles, TrendingUp, Timer, Users, ShieldCheck, MapPin, Zap, Coins, Star, Flame, Share2, CheckCircle2, BadgeCheck, Bell, MessageSquare, Video, Camera, Cpu, Bot, Lock, Building, Crown, Waves, Compass, Wrench, Blocks, DollarSign } from 'lucide-react';

export default function RaccoltaFondiPage() {
  const [showDonors, setShowDonors] = React.useState(false);
  const donors = [
    { name: "Mario", surname: "Rossi", nickname: "marior", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=marior", amount: 5 },
    { name: "Luca", surname: "Bianchi", nickname: "lucky", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=lucky", amount: 25 },
    { name: "Sara", surname: "Verdi", nickname: "sara.v", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=sarav", amount: 100 }
  ];
  const specialCardRef = React.useRef<HTMLDivElement | null>(null);
  const [modalTop, setModalTop] = React.useState<number>(24);
  const getDollarCount = (amount: number) => (amount >= 50 ? 3 : amount >= 10 ? 2 : amount >= 1 ? 1 : 0);
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-dark-300/40 backdrop-blur-md border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-white/70 hover:text-white">←</Link>
            <h1 className="text-lg sm:text-xl font-bold">CityaApp • Crowdfunding</h1>
          </div>
          <div className="text-[10px] px-2 py-1 rounded bg-white/10 text-white/80 border border-white/10">In arrivo</div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="md:col-span-2">
              <h2 className="text-2xl md:text-3xl font-bold leading-tight">Trasforma Civitanova Marche insieme a noi</h2>
              <p className="text-white/70 mt-2">Sostieni i progetti che rendono la nostra città più innovativa e vivibile. Piattaforma in fase beta, molte funzioni sono in arrivo.</p>
              <div className="mt-4 flex items-center gap-2">
                <button className="px-3 py-2 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-500 transition-colors shadow">Scopri i Progetti</button>
                <button className="px-3 py-2 rounded-lg text-sm font-semibold bg-white/10 border border-white/10 hover:bg-white/15 transition-colors">Proponi il tuo Progetto</button>
              </div>
            </div>
            <div className="md:col-span-1">
              <div className="rounded-2xl p-4 border border-white/10 bg-gradient-to-br from-blue-600/20 to-emerald-500/10">
                <div className="text-xs text-white/60">Fondi totali simulati</div>
                <div className="text-2xl font-bold text-emerald-300">€ 0</div>
                <div className="text-xs text-white/60 mt-2">Donatori</div>
                <div className="text-lg font-semibold">0</div>
              </div>
            </div>
          </div>
        </div>
        {/* Decorative waves */}
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-blue-500/10 to-transparent" />
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Filtri e Ricerca (in arrivo) */}
        <div className="bg-dark-300/40 backdrop-blur-sm rounded-xl border border-white/10 p-3">
          <div className="flex flex-wrap items-center gap-2">
            {['Cultura','Sport','Ambiente','Tecnologia','Sociale'].map(cat => (
              <div key={cat} className="text-[11px] px-2 py-1 rounded-full bg-white/5 border border-white/10 text-white/80">
                {cat}
              </div>
            ))}
            <div className="ml-auto text-[10px] px-2 py-1 rounded bg-white/10 text-white/80 border border-white/10">Ricerca avanzata • In arrivo</div>
          </div>
        </div>

        {/* Grid Progetti (placeholder + speciale MyCivitanova) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Card Speciale: MyCivitanova – Costruiamo */}
          <motion.div
            className="rounded-xl border border-yellow-400/30 bg-gradient-to-br from-yellow-500/10 via-emerald-400/5 to-transparent overflow-hidden relative sm:col-span-2 special-card"
            ref={specialCardRef}
            animate={{ boxShadow: ["0 0 0px rgba(255,215,0,0.0)", "0 0 24px rgba(255,215,0,0.25)", "0 0 0px rgba(255,215,0,0.0)"] }}
            transition={{ repeat: Infinity, duration: 4 }}
          >
            <div className="relative p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wide text-yellow-300/80">Special</div>
                  <div className="text-lg font-bold">MyCivitanova – Costruiamo</div>
                  <div className="text-[12px] text-white/70">Sostieni lo sviluppo dell'app. Ogni euro resta nel progetto.</div>
                </div>
                <div className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/15 text-yellow-300 border border-yellow-500/30">Progetto ufficiale</div>
              </div>
              <div className="mt-3">
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-1.5 rounded-full bg-gradient-to-r from-yellow-400 via-emerald-300 to-yellow-400" style={{ width: `0%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-white/70 mt-1">
                  <span>€0 di €0</span>
                  <span>0% • in arrivo</span>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Link href="/costruiamo" className="text-[11px] px-3 py-1.5 rounded-lg bg-yellow-500/90 hover:bg-yellow-400 text-black font-semibold transition-colors">Dona ora</Link>
                <button
                  onClick={() => {
                    const rect = specialCardRef.current?.getBoundingClientRect();
                    const top = rect ? Math.max(8, rect.top) : 24;
                    setModalTop(top);
                    setShowDonors(true);
                  }}
                  className="text-[11px] px-3 py-1.5 rounded-lg bg-white/10 border border-white/10 hover:bg-white/15 transition-colors"
                >
                  Lista Donatori
                </button>
              </div>
            </div>
            <div className="special-sparkles" aria-hidden="true" />
          </motion.div>

          {/* Progetti placeholder azzerati */}
          {[1,2,3,4].map(i => (
            <div key={i} className="rounded-xl border border-white/10 bg-white/5 overflow-hidden group">
              <div className="relative h-28 bg-gradient-to-br from-blue-600/30 to-emerald-500/20">
                <div className="absolute top-2 left-2 text-[10px] px-1.5 py-0.5 rounded bg-black/40 border border-white/10">#{100+i}</div>
                <div className="absolute top-2 right-2 text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/70 border border-white/10">In arrivo</div>
              </div>
              <div className="p-3">
                <div className="text-sm font-semibold">Titolo Progetto {i}</div>
                <div className="text-[11px] text-white/70">Breve descrizione del progetto civico.</div>
                <div className="mt-2">
                  <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-emerald-400" style={{ width: `0%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-white/60 mt-1">
                    <span>€0 di €0</span>
                    <span>0% • in arrivo</span>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="text-[10px] text-white/60">👤 Mario Rossi • 📍 Centro</div>
                  <div className="flex items-center gap-2">
                    <button className="text-[10px] px-2 py-1 rounded bg-blue-600 opacity-50 cursor-not-allowed">Dona Ora</button>
                    <button className="text-[10px] px-2 py-1 rounded bg-white/10 border border-white/10 opacity-50 cursor-not-allowed">Dettagli</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sezioni Funzionalità in arrivo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <h3 className="text-sm font-semibold">Matchmaking Intelligente</h3>
              <span className="text-[9px] px-1 py-0.5 rounded bg-white/10 border border-white/10">In arrivo</span>
            </div>
            <ul className="text-[11px] text-white/70 space-y-1 list-disc list-inside">
              <li>Progetti per te basati sugli interessi</li>
              <li>Geolocalizzazione e quartieri</li>
              <li>Impact scoring e collaborative filtering</li>
            </ul>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-center gap-2 mb-2">
              <BadgeCheck className="w-4 h-4 text-emerald-300" />
              <h3 className="text-sm font-semibold">Trasparenza e Trust</h3>
              <span className="text-[9px] px-1 py-0.5 rounded bg-white/10 border border-white/10">In arrivo</span>
            </div>
            <ul className="text-[11px] text-white/70 space-y-1 list-disc list-inside">
              <li>Notifiche real-time sui progetti supportati</li>
              <li>Impact tracking personale</li>
              <li>Verifica creatori e milestone reporting</li>
            </ul>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-4 h-4 text-yellow-300" />
              <h3 className="text-sm font-semibold">Gamification</h3>
              <span className="text-[9px] px-1 py-0.5 rounded bg-white/10 border border-white/10">In arrivo</span>
            </div>
            <ul className="text-[11px] text-white/70 space-y-1 list-disc list-inside">
              <li>Badge e leaderboard donatori</li>
              <li>Celebration quando si raggiungono milestone</li>
              <li>Social proof e community</li>
            </ul>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-center gap-2 mb-2">
              <Waves className="w-4 h-4 text-blue-300" />
              <h3 className="text-sm font-semibold">Identità Locale</h3>
              <span className="text-[9px] px-1 py-0.5 rounded bg-white/10 border border-white/10">In arrivo</span>
            </div>
            <ul className="text-[11px] text-white/70 space-y-1 list-disc list-inside">
              <li>Onde e pattern ispirati al mare Adriatico</li>
              <li>Colori e icone civitanovesi</li>
              <li>Progetti quartiere per quartiere</li>
            </ul>
          </div>
        </div>

        {/* Area Creatori e Donatori (in arrivo) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-emerald-300" />
                <h3 className="text-sm font-semibold">Area Creatori</h3>
              </div>
              <span className="text-[9px] px-1 py-0.5 rounded bg-white/10 border border-white/10">In arrivo</span>
            </div>
            <div className="text-[11px] text-white/80">Dashboard creatore con analytics, messaggi, update, e boost visibilità.</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-300" />
                <h3 className="text-sm font-semibold">Area Donatori</h3>
              </div>
              <span className="text-[9px] px-1 py-0.5 rounded bg-white/10 border border-white/10">In arrivo</span>
            </div>
            <div className="text-[11px] text-white/80">Profilo donatore, progetti preferiti, metodi di pagamento, impatto totale.</div>
          </div>
        </div>

        {/* Tecnologie future */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="w-4 h-4 text-purple-300" />
            <h3 className="text-sm font-semibold">Tecnologie in arrivo</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-white/80">
            <div className="rounded-lg border border-white/10 bg-white/5 p-2">AR Visualizzazione Progetti</div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-2">AI Smart Recommendations</div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-2">AI Fraud Detection</div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-2">Blockchain Trasparenza</div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-2">Smart Contracts</div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-2">NFT Rewards</div>
          </div>
        </div>

        {/* Compliance & Accessibilità */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="text-sm font-semibold mb-1">Performance</div>
            <ul className="text-[11px] text-white/70 space-y-1 list-disc list-inside">
              <li>Core Web Vitals ottimizzati</li>
              <li>Lazy-loading e caching</li>
            </ul>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="text-sm font-semibold mb-1">Accessibilità</div>
            <ul className="text-[11px] text-white/70 space-y-1 list-disc list-inside">
              <li>WCAG 2.1 AA</li>
              <li>Screen reader & keyboard navigation</li>
            </ul>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="text-sm font-semibold mb-1">Sicurezza e Privacy</div>
            <ul className="text-[11px] text-white/70 space-y-1 list-disc list-inside">
              <li>Compliant GDPR</li>
              <li>Encryption end-to-end</li>
              <li>2FA per account</li>
            </ul>
          </div>
        </div>

        {/* CTA finali */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button className="px-3 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 transition-colors shadow">Dona in 30 secondi (in arrivo)</button>
          <button className="px-3 py-3 rounded-xl text-sm font-semibold bg-white/10 border border-white/10 hover:bg-white/15">Lancia il tuo progetto gratis (in arrivo)</button>
        </div>

        {showDonors && (
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowDonors(false)} />
            <div
              className="fixed left-1/2 -translate-x-1/2 z-10 w-[92%] max-w-md rounded-2xl border border-white/15 bg-black/90 p-4"
              style={{ top: modalTop }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold">Donatori – MyCivitanova Costruiamo</div>
                <button onClick={() => setShowDonors(false)} className="text-white/60 hover:text-white text-sm">Chiudi</button>
              </div>
              <ul className="space-y-2">
                {donors.map((d, idx) => {
                  const count = getDollarCount(d.amount);
                  return (
                    <li key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/10">
                      <img src={d.avatar} alt={d.nickname} className="w-8 h-8 rounded-full border border-white/10" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{d.name} {d.surname} <span className="text-white/50">(@{d.nickname})</span></div>
                                              </div>
                      <div className="flex items-center gap-1">
                        {[0,1,2].map(i => (
                          <DollarSign key={i} className={`w-4 h-4 ${i < count ? 'text-emerald-300 drop-shadow-[0_0_6px_rgba(16,185,129,0.6)]' : 'text-white/25'}`} />
                        ))}
                      </div>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-3 text-[11px] text-white/60">
                Legenda: €1–€9 = 1 icona • €10–€49 = 2 icone • €50+ = 3 icone
              </div>
            </div>
          </div>
        )}
        <div className="h-10" />
        <style jsx>{`
          .special-card::before {
            content: "";
            position: absolute;
            inset: -2px;
            background: conic-gradient(from 0deg, rgba(255,215,0,0.0), rgba(255,215,0,0.45), rgba(198,255,0,0.3), rgba(255,215,0,0.0));
            filter: blur(18px);
            opacity: .7;
            animation: spin 8s linear infinite;
          }
          .special-card::after { content: ""; position: absolute; inset: 0; border-radius: 0.75rem; box-shadow: inset 0 0 40px rgba(255,215,0,0.08); pointer-events: none; }
          .special-sparkles { position: absolute; inset: 0; background-image: radial-gradient(circle at 20% 30%, rgba(255,215,0,0.15), transparent 25%), radial-gradient(circle at 80% 40%, rgba(198,255,0,0.15), transparent 25%), radial-gradient(circle at 60% 80%, rgba(255,215,0,0.1), transparent 25%); filter: blur(10px); opacity: .45; animation: float 6s ease-in-out infinite; pointer-events:none; }
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes float { 0%,100%{ transform: translateY(0);} 50%{ transform: translateY(-6px);} }
        `}</style>
      </div>
    </div>
  );
}
