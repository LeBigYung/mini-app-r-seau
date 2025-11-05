"use client";

import React, { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import JobList from "../components/JobList";
import type { Job } from "@/lib/types/types";

// icons
import { IoMail } from "react-icons/io5";

import NavBar from "../components/NavBar";

const ProfilePage = () => {
  const { data: session } = useSession();
  const router = useRouter();

  const [favJobs, setFavJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  // Charger la liste des favoris
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/favorites");
        if (!res.ok) {
          setFavJobs([]);
          return;
        }
        const { jobs }: { jobs: Job[] } = await res.json();
        setFavJobs(jobs);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Construire le set des favoris
  const favoritesSet = new Set(favJobs.map((j) => j.externalId));

  // Toggle pour retirer un favori
  const handleToggleFavorite = async (externalId: string, next: boolean) => {
    if (!next) setFavJobs((prev) => prev.filter((j) => j.externalId !== externalId));
    try {
      await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ externalId, next }), // n’envoie que le nécessaire
      });
    } catch {
      /* noop */
    }
  };

  if (loading) return <p className="text-center">Chargement…</p>;

  return (
    <>
      {session ? (
        <>
          <NavBar hasResults={false}/>

          <main className="max-w-[900px] mx-auto px-4 py-8">

            <div className=" w-180 mb-10">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-5xl font-bold mb-4">{session.user.name}</h2>
                <Image
                  src={session.user.image ?? "/default-avatar.png"}
                  alt="avatar"
                  width={100}
                  height={100}
                  style={{ objectFit: "cover" }}
                  className="cursor-pointer rounded-full"
                />
              </div>

              <a href="" className="flex items-center py-5 bg-gray-100 p-5 rounded-xl mb-2">
                <IoMail className="text-3xl mr-5"/>
                <p>{session.user.email}</p>
              </a>

              <a href="" className="flex items-center py-5 bg-gray-100 p-5 rounded-xl">
                <IoMail className="text-3xl mr-5"/>
                06 59 64 ** **
              </a>


            </div>

            <h1 className="text-2xl font-bold mb-4">Mes favoris</h1>

            <JobList
              jobs={favJobs}
              favoritesSet={favoritesSet}
              onToggleFavorite={handleToggleFavorite}
              selectedJob={selectedJob}
              onSelectJob={setSelectedJob}
            />

            {favJobs.length === 0 && (
              <p className="text-center opacity-70 mt-6">Aucun favori pour le moment.</p>
            )}
          </main>
        </>
      ) : (
        <main className="max-w-[900px] mx-auto px-4 py-8">
          <p className="mb-6">Veuillez vous connecter pour pouvoir accéder à votre compte.</p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => signIn("github")}
              className="bg-gray-300 hover:bg-gray-400 rounded-md p-5 text-2xl"
            >
              Se connecter avec Github
            </button>
            <button
              onClick={() => signIn("google")}
              className="bg-gray-300 hover:bg-gray-400 rounded-md p-5 text-2xl"
            >
              Se connecter avec Google
            </button>
          </div>
        </main>
      )}
    </>
  );
};

export default ProfilePage;
