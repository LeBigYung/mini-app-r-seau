"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignUpForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    // validations simples côté client
    if (!email) return setErrorMsg("Email requis");
    if (!password) return setErrorMsg("Mot de passe requis");
    if (password.length < 8) return setErrorMsg("Au moins 8 caractères");
    if (password !== confirm) return setErrorMsg("Les mots de passe ne correspondent pas");

    setLoading(true);
    try {
      // 1) Création côté serveur
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data?.error || "Échec de l'inscription");
        setLoading(false);
        return;
      }

      // 2) Connexion auto après inscription
      const signInRes = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (signInRes?.error) {
        setErrorMsg("Compte créé, mais connexion impossible. Essaie de te connecter manuellement.");
        setLoading(false);
        return;
      }

      router.push("/"); // redirige où tu veux (dashboard, home, etc.)
    } catch (err) {
      setErrorMsg("Une erreur est survenue. Réessaie.");
      setLoading(false);
    }
  }
  return (
    <form onSubmit={onSubmit}>
      {errorMsg && (
        <p>
          {errorMsg}
        </p>
      )}

      <div>
        <label htmlFor="">Email</label>
        <input 
        type="text" 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="name@exemple.com"
        />
      </div>

      <div>
        <label htmlFor="">Nom (optionnel)</label>
        <input 
        type="text" 
        value = {name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Ton nom"
        />
      </div>

      <div>
        <label htmlFor="">Mot de passe</label>
        <input 
        type="password"
        value = {password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />
        <p className="text-xs text-gray-500">
          Au moins 8 caractères. Idéalement une majuscule, une minuscule, un chiffre.
        </p>
      </div>

      <button 
      className="cursor-pointer"
      type="submit"
      disabled={loading}
      >
         {loading ? "Création..." : "Créer mon compte"}
      </button>
    </form>
  );
}
