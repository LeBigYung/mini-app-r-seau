"use client"

import React, { useRef } from 'react'
import { UseRecentSearches } from '../hooks/useRecentSearches';
import { useEffect, useState, type PropsWithChildren,  type RefObject } from 'react';
import { Job } from '@/lib/types/types';

function formatDateFR(iso?: string) {
  if (!iso) return "Date n/c";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(iso));
}

type FadeInProps = PropsWithChildren<{
  once?: boolean;
  rootRef?: RefObject<HTMLElement | null>;
  threshold?: number;     // fine-tuning
  rootMargin?: string;    // fine-tuning
  className?: string;
}>;

function FadeIn({
  children,
  once = true,
  rootRef,
  threshold = 0.2,
  rootMargin = "0px",
  className = "",
}: FadeInProps) {
  const [isVisible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target === el) {
            if (entry.isIntersecting) {
              setVisible(true);
              if (once) obs.unobserve(el);
            } else if (!once) {
              // ✅ Toggle en sortie de viewport
              setVisible(false);
            }
          }
        });
      },
      {
        // Ces trois valeurs permettent de configurer quand et comment l’observer va déclencher entry.isIntersecting.
        threshold,
        root: rootRef?.current ?? null,
        rootMargin,
      }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [once, rootRef, threshold, rootMargin]);
  
  return ( 
    <div
      ref={ref}
      className={[
        "transition-all duration-1500 ease-out will-change-transform",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
      ].join(" ")}
    >
         {children}
    </div>
  );
}

export default function ShowJobsForSearch () {

  

    // on récupères les items de recherche récentes
    const { items} = UseRecentSearches();
    // on récupère la dernière recherche effectuée
    const lastParams = items[0]?.params

     const [jobs, setJobs] = useState<Job[]>([]);
     const [loading, setLoading] = useState(false);
     const [err, setErr] = useState<string | null>(null);
     const [smsStatus, setSmsStatus] = useState<string | null>(null);

      const scrollRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
    if (!lastParams) return; // rien à faire tant qu'on n'a pas d'historique

    (async () => {
      try {
        setLoading(true);
        setErr(null);


        // on défini les elements présents dans la requete vers l'api france travail
        const qs = new URLSearchParams();
        if (lastParams.motsCles?.trim())
          qs.set("motsCles", lastParams.motsCles.trim());
        if (lastParams.departement?.trim())
          qs.set("departement", lastParams.departement.trim());
        if (lastParams.typeContrat)
          qs.set("typeContrat", lastParams.typeContrat);
        if (lastParams.experience)
          qs.set("experience", lastParams.experience);
        qs.set("range", "0-30");

        const res = await fetch(`/api/req_ft?${qs.toString()}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        // on créer le tableau qui stocke les résultats de la requete, en se basant sur le  type défini de Job []
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

       try {
        const r = await fetch('/api/sms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: '+33659649449',           // E.164 avec +33
            text: 'bonjour',
          }),
        });

        const j = await r.json();
          setSmsStatus(j.ok ? 'SMS envoyé ✅' : `SMS erreur ❌: ${j.error ?? r.status}`);
        } catch (e: any) {
          setSmsStatus(`SMS erreur ❌: ${e.message}`);
        }

        // on stocke les résultats
        setJobs(results);
      } catch (e: any) {
        setErr(e.message ?? "Erreur");
      } finally {
        setLoading(false);
      }
    })();
    // on re-fetch si un des critères de la dernière recherche change
    // si une nouvelles recherches est effectué avec des elements ci dessous différent on remet a jour la requete ?? (besoin de confirmation) 
  }, [
    lastParams?.motsCles,
    lastParams?.departement,
    lastParams?.typeContrat,
    lastParams?.experience,

  ]);

    return (
        <div className='my-10'>

            {loading && <p>Chargement des données en cours</p>}
            { err && <p className='text-red text-bolder'>{err}</p>}
            {!loading && !err && lastParams && (
                <p>
                    {jobs.length} annonces correspondants à votre recherche.
                </p>
            ) }

        <div ref={scrollRef} className='flex max-w-320 overflow-x-scroll overflow-y-hidden
        [&::-webkit-scrollbar]:w-2
        [&::-webkit-scrollbar-track]:rounded-full
        [&::-webkit-scrollbar-track]:bg-gray-100
        [&::-webkit-scrollbar-thumb]:rounded-full
        [&::-webkit-scrollbar-thumb]:bg-gray-300
        dark:[&::-webkit-scrollbar-track]:bg-neutral-700
        dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500"
        '>

        {jobs.map((j)=> (

          <FadeIn key={j.externalId} rootRef={scrollRef} once={false}>
           <div className='min-w-100 max-w-100 h-100 bg-gray-100/40 p-10 mr-5 my-5 rounded-xl'
           >
              <p className="text-lg opacity-70">{formatDateFR(j.dateCreation)}</p>
              <h3 className="text-2xl font-semibold pb-5">{j.intitule}</h3>
              <p className="text-base opacity-80">
                {j.entreprise?.nom ?? "Entreprise n/c"} — {j.lieuTravail?.libelle ?? "Lieu n/c"}
              </p>

              {j.experience && (
                <p className="text-sm mt-1">
                  Expérience requise : <span className="font-medium">{j.experience}</span>
                </p>
              )}

              {j.url && (
                <a
                  href={j.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-10 inline-block text-blue-400 hover:underline text-sm"
                  onClick={(e) => e.stopPropagation()} // ⬅️ évite de déclencher onSelect
                >
                  Voir l’annonce
                </a>
              )}
            </div>
          </FadeIn>
        ))}
        

        </div>

        </div>
    );
}