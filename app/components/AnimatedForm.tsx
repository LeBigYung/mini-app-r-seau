"use client";

import { useState, FormEvent } from "react";
import { Job } from "@/lib/types/types";
import { UseRecentSearches } from "../hooks/useRecentSearches";
import ShowJobsForSearch from "./ShowJobsForSearch";

type AnimatedFormProps = {
  onResults: (results: Job[]) => void;
  onReopen?: () => void; // ← nouvelle prop optionnelle
  jobs?: Job[];
};

export default function AnimatedForm({ onResults, onReopen, jobs  }: AnimatedFormProps) {
  const [open, setOpen] = useState(true);

  const [domaine, setDomaine] = useState("");
  const [ville, setVille] = useState("");
  const [typeContrat, setTypeContrat] = useState("");
  const [experience, setExperience] = useState(""); // "0".."4" ou ""
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

 // ⬇️ on récupère les RECENTS depuis le hook
  const { items, add, clear } = UseRecentSearches();

  const [showRecents, setShowRecents] = useState(false);

  const fillFromRecent =(p: {
    motsCles?: string;
    departement?: string;
    typeContrat?: string;
    experience?: string;
  }) => {
    setDomaine(p.motsCles ?? "");
    setVille(p.departement ?? "");
    setTypeContrat(p.typeContrat ?? "");
    setExperience(p.experience ?? "");
  };


  const searchJobs = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setLoading(true);
      setErr(null);

      const qs = new URLSearchParams();
      if (domaine.trim()) qs.set("motsCles", domaine.trim());
      if (ville.trim()) qs.set("departement", ville.trim());
      if (typeContrat) qs.set("typeContrat", typeContrat);
      if (experience) qs.set("experience", experience);
      qs.set("range", "0-30");

      const res = await fetch(`/api/req_ft?${qs.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const results: Job[] = (data.resultats ?? []).map((r: any) => ({
        externalId: r.id,
        intitule: r.intitule,
        entreprise: { nom: r.entreprise?.nom },
        lieuTravail: { libelle: r.lieuTravail?.libelle },
        dateCreation: r.dateCreation,
        url: r.origineOffre?.urlOrigine,
        experience: r.experienceLibelle ?? undefined,
        typeContrat: r.typeContratLibelle ?? r.typeContrat ?? undefined,
        description: r.description ?? undefined,
      }));

      add({
        motsCles: domaine,
        departement: ville,
        typeContrat,
        experience,
      });

      onResults(results);

      // on ferme le formulaire après la recherche
      setOpen(false);
      setShowRecents(false);

    } catch (e: any) {
      setErr(e.message ?? "Erreur");
    } finally {
      setLoading(false);
    }
  };

  function handleRecentsSearch () {
    
    {items.map(s => (
      <ul>
        <li key={s.id} >{s.params.motsCles}</li>
      </ul>
    ))}
  }

  return (
    // ⚠️ conteneur TOUJOURS visible
    <div className="flex flex-col items-start gap-4 ml-50">
      {/* Bouton TOUJOURS rendu */}
      <button
        type="button"
        onClick={() => {
          if (!open) onReopen?.();
          setOpen((v) => !v)
        }}
        
        className="text-xl font-bold text-white bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-xl"
      >
        {open ? "Fermer le formulaire" : "Trouver un job"}
      </button>

      {/* Zone form avec collapse animé */}
      <div
        className={[
          "w-full max-w-4xl overflow-visible transition-[max-height,opacity] duration-500",
           "relative z-[100]",
          open ? "max-h-[550px] opacity-100" : "max-h-0 opacity-0",
        ].join(" ")}
      >
        <div className="rounded-2xl bg-white/15 backdrop-blur p-8">
          <h2 className="text-3xl font-black mb-6">Next Job</h2>

          <form onSubmit={searchJobs} className="space-y-6">
            <div className="flex flex-wrap gap-3">
              <div className="relative">

                  <input
                  value={domaine}
                    onChange={(e) => setDomaine(e.target.value)}
                    onClick={handleRecentsSearch}
                    // permet d'effectuer une action lorsqu'on est dans l'input
                    onFocus={() => setShowRecents(true)}
                    onBlur={() => setTimeout(() => setShowRecents(false), 150)} // petite tempo pour cliquer
                    type="text"
                    placeholder="Métier recherché"
                    className="p-4 border rounded-xl text-base w-70"
                  />

                  {showRecents && items.length > 0 && (
                  <ul className="absolute z-10 mt-2 w-70 max-h-150 overflow-auto rounded-xl border bg-white text-black shadow">
                    <li className="px-3 py-2 text-xs opacity-60">Recherches récentes</li>
                    {items.map((s) => (
                      <li
                        key={s.id}
                        className="px-3 py-5 cursor-pointer hover:bg-gray-100"
                        onMouseDown={() => fillFromRecent(s.params)} // onMouseDown évite le blur avant le click
                        title="Cliquer pour réutiliser ces critères"
                      >
                        {(s.params.motsCles ?? "—") +
                          " · " +
                          (s.params.departement ?? "—") +
                          (s.params.typeContrat ? " · " + s.params.typeContrat : "") +
                          (s.params.experience ? " · exp " + s.params.experience : "")}
                      </li>
                    ))}
                    <li className="px-3 py-2 text-right">
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          clear();
                        }}
                        className="text-xs underline opacity-70 hover:opacity-100"
                      >
                        Vider
                      </button>
                    </li>
                  </ul>
                )}

              </div>

                  <input
                    onChange={(e) => setVille(e.target.value)}
                    type="text"
                    placeholder="Département"
                    className="p-4 border rounded-xl text-base w-44"
                  />
                  <select
                    value={typeContrat}
                    onChange={(e) => setTypeContrat(e.target.value)}
                    className="p-4 border rounded-xl text-base w-56"
                  >
                    <option value="">— Type de contrat —</option>
                    <option value="CDI">CDI</option>
                    <option value="CDD">CDD</option>
                  </select>
                  <select
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="p-4 border rounded-xl text-base w-64"
                  >
                    <option value="">— Niveau d’expérience —</option>
                    <option value="0">Débutant accepté</option>
                    <option value="1">Moins de 1 an</option>
                    <option value="2">1 à 3 ans</option>
                    <option value="3">3 à 5 ans</option>
                    <option value="4">5 ans ou plus</option>
                  </select>
            </div>

            <div className="flex items-center gap-3">
              <button
                className="text-lg font-bold text-white bg-gray-700 hover:bg-gray-800 px-6 py-3 rounded-xl"
                type="submit"
                disabled={loading}
              >
                {loading ? "Recherche en cours…" : "Démarrer la recherche"}
              </button>
              {err && <span className="text-red-500 text-sm">{err}</span>}
            </div>
          </form>
        </div>
      </div>

      {(jobs?.length ?? 0) === 0 && (
        <ShowJobsForSearch/>
      )}

    </div>
  );
}


