"use client";

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getFilteredProjects, getStatus, formatCurrency, FilterType } from '@/data/crowdfunding';

const filters: { key: FilterType; label: string }[] = [
  { key: 'popolari', label: 'Più popolari' },
  { key: 'recenti', label: 'Più recenti' },
  { key: 'quasi-completati', label: 'Quasi completati' },
];

function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden" aria-label="Avanzamento progetto">
      <div
        className="h-2 bg-green-500 transition-all duration-700 ease-out"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

function ProjectCard({ project }: { project: any }) {
  const status = useMemo(() => getStatus(project), [project]);
  const href = `/crowdfunding/${project.slug}`;

  return (
    <div className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-100">
      <div className="relative w-full aspect-[16/9]">
        <Image src={project.coverImage} alt={project.title} fill className="object-cover" />
        {status.completed ? (
          <span className="absolute top-3 left-3 text-xs font-semibold bg-emerald-600 text-white px-2 py-1 rounded-full shadow">
            Completato
          </span>
        ) : (
          <span className="absolute top-3 left-3 text-xs font-semibold bg-black/70 text-white px-2 py-1 rounded-full">
            {status.daysRemaining} giorni rimasti
          </span>
        )}
      </div>

      <div className="p-4 space-y-3">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{project.title}</h3>
        <p className="text-sm text-gray-600 line-clamp-2">{project.shortDescription}</p>

        <div className="flex items-center justify-between text-sm mt-2">
          <span className="font-medium text-gray-900">{formatCurrency(project.raised)}</span>
          <span className="text-gray-500">/ {formatCurrency(project.goal)}</span>
        </div>

        <ProgressBar percent={status.progressPercent} />

        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-500">{status.progressPercent}%</span>
          <Link
            href={href}
            className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
            aria-label={`Vai al progetto ${project.title}`}
          >
            Sostieni →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CrowdfundingHomePage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('popolari');
  const projects = useMemo(() => getFilteredProjects(activeFilter), [activeFilter]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Crowdfunding Cittadino</h1>
            <p className="text-sm text-gray-600 mt-1">Sostieni progetti locali promossi da cittadini e associazioni.</p>
          </div>
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-800">Torna alla Home</Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6 overflow-x-auto py-1">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                activeFilter === f.key ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
              }`}
              aria-pressed={activeFilter === f.key}
            >
              {f.label}
            </button>
          ))}
        </div>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map(p => (
            <ProjectCard key={p.id} project={p} />)
          )}
        </section>
      </main>
    </div>
  );
}
