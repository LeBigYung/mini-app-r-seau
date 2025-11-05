// /components/JobCard.tsx
"use client";

import { Job } from "@/lib/types/types";

function formatDateFR(iso?: string) {
  if (!iso) return "Date n/c";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(iso));
}

function bonjour () {
  console.log("ca marche")
}

export default function JobCard({
  job,
  isFavorite,
  onToggleFavorite,
  onSelect,
  isSelected,
}: {
  job: Job;
  isFavorite: boolean;
  onToggleFavorite: (externalId: string, next: boolean) => void;
  onSelect: () => void;
  isSelected?: boolean;
}) {
  return (
    <article
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(); } }}
      className={[
        "cursor-pointer mb-5 p-6 rounded-xl border flex items-start justify-between gap-4",
        "hover:shadow-md transition",
        isSelected ? "border-blue-500 ring-1 ring-blue-300" : "border-gray-200",
        "w-full",
      ].join(" ")}
      aria-selected={!!isSelected}
    >
      <div>
        <p className="text-lg opacity-70">{formatDateFR(job.dateCreation)}</p>
        <h3 className="text-2xl font-semibold pb-5">{job.intitule}</h3>
        <p className="text-base opacity-80">
          {job.entreprise?.nom ?? "Entreprise n/c"} — {job.lieuTravail?.libelle ?? "Lieu n/c"}
        </p>

        {job.experience && (
          <p className="text-sm mt-1">
            Expérience requise : <span className="font-medium">{job.experience}</span>
          </p>
        )}

        {job.url && (
          <a
            href={job.url}
            target="_blank"
            rel="noreferrer"
            className="mt-10 inline-block text-blue-400 hover:underline text-sm"
            onClick={(e) => e.stopPropagation()} // ⬅️ évite de déclencher onSelect
          >
            Voir l’annonce
          </a>
        )}
      </div>

      <button
        aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
        title={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
        className="text-2xl shrink-0"
        onClick={(e) => {
          e.stopPropagation(); // ⬅️ évite de déclencher onSelect
          onToggleFavorite(job.externalId, !isFavorite);
        }}
      >
        {isFavorite ? "⭐" : "☆"}
      </button>
     </article>
  );
}
