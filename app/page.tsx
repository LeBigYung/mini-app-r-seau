"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import homeBackgroundImage from "../public/img/wllpaper_nextjob-home.jpeg";

import AnimatedForm from "./components/AnimatedForm";
import JobList from "./components/JobList";
import NavBar from "./components/NavBar";
import { Job } from "@/lib/types/types";

export default function Mainpage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const hasResults = jobs.length > 0;

  // Réception des jobs de l'API
  const handleResults = (r: Job[]) => {
    setJobs(r);
    setSelectedJob(null);
  };

  // Réinitialiser quand on rouvre le formulaire
  const handleReopenForm = () => {
    setJobs([]); // efface les résultats
    setSelectedJob(null);
  };

  // Charger les favoris au montage
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/favorites");
      if (!res.ok) return;
      const { jobs: favJobs }: { jobs: Job[] } = await res.json();
      setFavorites(new Set(favJobs.map((j) => j.externalId)));
    })();
  }, []);

  // Toggle favoris
  const handleToggleFavorite = async (externalId: string, next: boolean) => {
    setFavorites((prev) => {
      const copy = new Set(prev);
      next ? copy.add(externalId) : copy.delete(externalId);
      return copy;
    });

    const j = jobs.find((x) => x.externalId === externalId);
    try {
      await fetch(`/api/favorites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          externalId,
          title: j?.intitule ?? "",
          company: j?.entreprise?.nom ?? null,
          location: j?.lieuTravail?.libelle ?? null,
          url: j?.url ?? null,
          experience: j?.experience ?? null,
          typeContrat: j?.typeContrat ?? null,
          description: j?.description ?? null,
          next,
        }),
      });
    } catch {
      setFavorites((prev) => {
        const copy = new Set(prev);
        next ? copy.delete(externalId) : copy.add(externalId);
        return copy;
      });
    }
  };

  return (
    <div
      className={`relative min-h-screen transition-colors duration-700 ${
        hasResults ? "text-black" : "text-white"
      }`}
    >
      {/* Calque image */}
      <div
        className={`fixed inset-0 -z-10 transition-opacity duration-1000 ${
          hasResults ? "opacity-0" : "opacity-100"
        }`}
        style={{
          backgroundImage: `url(${homeBackgroundImage.src})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* Calque fond uni */}
      <div
        className={`fixed inset-0 -z-10 bg-gray-100 transition-opacity duration-1000 ${
          hasResults ? "opacity-100" : "opacity-0"
        }`}
      />

      <NavBar hasResults={hasResults} />

      <main className="flex flex-col items-start justify-start px-10">
        {session && (
          <>
            <AnimatedForm
              onResults={handleResults}
              onReopen={handleReopenForm} // callback pour tout réinitialiser
              jobs={jobs}
            />

            {jobs.length > 0 && (
              <JobList
                jobs={jobs}
                favoritesSet={favorites}
                onToggleFavorite={handleToggleFavorite}
                onSelectJob={setSelectedJob}
                selectedJob={selectedJob}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
