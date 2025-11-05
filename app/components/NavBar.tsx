"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function NavBar({ hasResults }: { hasResults: boolean }) {
  const { data: session } = useSession();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null); // conteneur avatar + menu

  // Fermer au clic extérieur
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  // Fermer avec Échap
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (!session) {
    return (
      <main className="max-w-[900px] mx-auto px-4 py-8">
        <p className="mb-6">Veuillez vous connecter pour pouvoir accéder à votre compte.</p>
        <div className="flex justify-center gap-3">
          <button onClick={() => signIn("github")} className="bg-gray-300 hover:bg-gray-400 rounded-md p-5 text-2xl">
            Se connecter avec Github
          </button>
          <button onClick={() => signIn("google")} className="bg-gray-300 hover:bg-gray-400 rounded-md p-5 text-2xl">
            Se connecter avec Google
          </button>
        </div>
      </main>
    );
  }

  return (
    <nav className="p-2 mb-20 bg-white/10">
      <div className="flex justify-between items-center m-5 px-30">
        <button className="text-4xl font-black text-center cursor-pointer" onClick={() => router.push("/")}>
          Accueil
        </button>

        <div className="flex items-center gap-4">
          {/* Avatar + menu */}
          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={open}
              className="m-5 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
            >
              <Image
                src={session.user?.image ?? "/default-avatar.png"}
                alt="Ouvrir le menu utilisateur"
                width={100}
                height={100}
                className="h-15 w-15 rounded-full object-cover"
              />
            </button>

            {/* Menu déroulant contrôlé par `open` */}
            <div
              role="menu"
              aria-label="Menu utilisateur"
              className={[
                "absolute right-0 top-full mt-2 min-w-40 rounded-xl bg-white text-gray-900 shadow-lg ring-1 ring-black/5 z-50",
                "transition-all duration-150 origin-top-right",
                open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none",
              ].join(" ")}
            >
              <ul className="py-2">
                <li>
                  <a
                    href="/profil"
                    className="block px-4 py-2 hover:bg-gray-50 rounded-lg"
                    role="menuitem"
                    onClick={() => setOpen(false)}
                  >
                    Profil
                  </a>
                </li>
                <li>
                  <a
                    href="/"
                    className="block px-4 py-2 hover:bg-gray-50 rounded-lg"
                    role="menuitem"
                    onClick={() => setOpen(false)}
                  >
                    Accueil
                  </a>
                </li>
                <li className="px-2">
                  <button
                    onClick={() => { setOpen(false); signOut(); }}
                    className="w-full text-left block px-2 py-2 rounded-lg hover:bg-gray-50"
                    role="menuitem"
                  >
                    Se déconnecter
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Bouton déconnexion (optionnel si déjà dans le menu) */}
          <button
            onClick={() => signOut()}
            className={`rounded-md p-3 my-5 transition-colors duration-300 ${
              hasResults
                ? "bg-gray-500/20 text-black hover:bg-gray-800 hover:text-white"
                : "bg-gray-500/80 text-white hover:bg-white hover:text-black"
            }`}
          >
            Se déconnecter
          </button>
        </div>
      </div>
    </nav>
  );
}
