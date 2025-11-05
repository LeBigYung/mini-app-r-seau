import React from 'react'
import { Job } from '@/lib/types/types';
import { useState } from 'react';
import JobCard from './JobCard';
import JobDetails from './JobDetails';


function formatDateFR(iso?: string) {
  if (!iso) return "Date n/c";
  const d = new Date(iso);
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(d);
}

function JobList ({
    jobs,
    favoritesSet, 
    onToggleFavorite,
    selectedJob,
    onSelectJob,
    defaultIndex = 0,        // <- 0 = premier, mets 1 pour le “deuxième”

}: {
  // destructuration des props declarer au dessus
  jobs: Job[];
  favoritesSet: Set<string>; 
  onToggleFavorite: (externalId: string, next: boolean) => void;
  // si un job est deja selectionné il est stocké ici
  selectedJob: Job | null;
  // déclare la valeur qui sera attendu a la sélection 
  onSelectJob: (job: Job | null ) => void;
  defaultIndex?: number; // optionnel, 0 par défaut

}) {
  if (jobs.length === 0) {
    return (
      <p className="text-center opacity-70 mt-4">
        Clique sur “Rechercher” pour lancer une recherche.
      </p>
    );
  }

  // Fallback local (ne change pas l’état parent)
  const effectiveSelected = selectedJob ?? jobs[defaultIndex] ?? null;

    return (
    <main className="mx-auto max-w-[1200px] px-4 py-6 grid grid-cols-1 md:grid-cols-[1fr_360px] gap-6">
      {/* Liste gauche */}
      <ul className="space-y-3">
        {jobs.map((j) => (
          <li key={j.externalId}>
            <JobCard
              job={j}
              isFavorite={favoritesSet.has(j.externalId)}
              onToggleFavorite={onToggleFavorite}
               onSelect={() => onSelectJob(j)}
              isSelected={effectiveSelected?.externalId === j.externalId}
            />
          </li>
        ))}
      </ul>

      {/* Panneau de droite*/}
      <aside className="md:sticky md:top-4 h-220 border rounded-xl p-10 overflow-scroll overflow-x-hidden w-150">
        {/* si un job est stocké donc séléctionner alors on l'affiche */}
        {effectiveSelected ? (
          <JobDetails job={effectiveSelected} onClose={() => onSelectJob(null)} />
        ) : (
          <div className="text-sm text-gray-500">Sélectionne une annonce…</div>
        )}
      </aside>
    </main>
  );
}

export default JobList