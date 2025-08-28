"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
// librairie permettant de faire des Animation (utilisé pour le form)
import autoAnimate from '@formkit/auto-animate'

// on créer le typage des offres que nous recevrons, ne sera récupérable que ce qui est déclaré ici
type Job = {
  id: string;
  dateCreation: string;
  intitule: string;
  entreprise?: { nom?: string };
  lieuTravail?: { libelle?: string };
};

// recoit la dat en paramètre
function formatDateFR(iso: string) {

// on utilise le parametre pour créer une nouvelle date
  const d = new Date(iso);

//   qu'on décide d'afficher en format FR
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(d);
}


export default function Mainpage() {

// on récupère l'id de connexion
  const { data: session } = useSession();
//   les offres recus grace a la requete get seront stockées ici
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const parentRef = useRef(null);

  useEffect(() => {
    if (parentRef.current) {
      autoAnimate(parentRef.current);
    }
  }, [parentRef]);  

  // 👉 Appelle TON endpoint serveur /api/req_ft
  const searchJobs = async () => {
    try {
      setLoading(true);
      setErr(null);

      const res = await fetch(
        "/api/req_ft?motsCles=dev&departement=75&range=0-9",
        { method: "GET" }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setJobs(data.resultats ?? []);
      console.log(data);
    } catch (e: any) {
      setErr(e.message ?? "Erreur");
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <nav className="p-5 mb-10">
        {session ? (
          <div className="flex justify-between text-center m-10 px-30">
            <p className="m-5">Bienvenue {session.user?.name}</p>
            <p className="m-5">Email : {session.user?.email}</p>

            <div className="flex items-center gap-4">
              <Image
                src={session.user?.image ?? "/default-avatar.png"}
                alt="avatar"
                width={64}
                height={64}
                style={{ objectFit: "cover" }}
              />
              <button
                onClick={() => signOut()}
                className="bg-gray-300 hover:bg-gray-400 rounded-md p-3 my-5"
              >
                Se déconnecter
              </button>
            </div>
          </div>
        ) : (
        <div className="flex items-center justify-center h-250">
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
        </div>
        )}
      </nav>

    {session ? (

      <main className="max-w-[900px] mx-auto px-4 py-20">
        <h1 className="text-4xl font-black text-center mb-15">Next Job</h1>

        <div className="flex justify-center mb-6">
        {/* appelle une fonction lors du click, se désactive en cours de loading */}
          <button
            onClick={searchJobs}
            disabled={loading}
            className="text-xl font-bold text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-60 px-6 py-3 rounded-xl"
          >
            {loading ? "Recherche..." : "Lancer une recherche"}
          </button>
        </div>

        {err && <p className="text-red-600 text-center mb-4">Erreur : {err}</p>}

        
        {/* affiche les offres récupérés depuis le GET */}
        <ul className="space-y-3">
        {/* parcours le [] des offres  */}
          {jobs.map((j) => (
            <li key={j.id} className="p-4 rounded-lg border">
               <p className="font-semibold">{formatDateFR(j.dateCreation)}</p>
              <p className="font-semibold">{j.intitule}</p>
              <p className="text-sm opacity-80">
                {j.entreprise?.nom ?? "Entreprise n/c"} —{" "}
                {j.lieuTravail?.libelle ?? "Lieu n/c"}
              </p>
            </li>
          ))}
        </ul>

        {!loading && !err && jobs.length === 0 && (
          <p className="text-center opacity-70 mt-4">
            Aucune offre correspondante — clique sur “Trouver un job”.
          </p>
        )}
      </main>
    ): null }
    </>
  );
}
