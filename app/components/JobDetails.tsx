import React from 'react'
import { Job } from '@/lib/types/types';

function formatDateFR(iso?: string) {
  if (!iso) return "Date n/c";
  const d = new Date(iso);
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(d);
}

export default function JobDetails({
  job,
  onClose,
}: {
  job: Job;
  onClose: () => void;
}) {
  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-bold">{job.intitule}</h2>
        <button
          className="text-sm text-gray-600 hover:text-black"
          onClick={onClose}
        >
          Fermer
        </button>
      </div>

      <p className="text-sm text-gray-700 mt-1">{job.entreprise?.nom}</p>
      <p className="text-sm text-gray-500">{job.lieuTravail?.libelle}</p>

      {job.dateCreation && (
        <p className="text-xs text-gray-400 mt-2">
          Publiée le {formatDateFR(job.dateCreation)}
        </p>
      )}

      {job.description && (
        <div className="prose prose-sm mt-4 whitespace-pre-line">
          {job.description}
        </div>
      )}

      <div className="mt-4 flex gap-2 flex-wrap">
        {job.salaire && (
          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
            {job.salaire}
          </span>
        )}
        {job.typeContrat && (
          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
            {job.typeContrat}
          </span>
        )}
        {job.experience && (
          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
            {job.experience}
          </span>
        )}
      </div>

      {job.url && (
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-4 underline"
        >
          Voir l’offre complète
        </a>
      )}
    </div>
  )
}