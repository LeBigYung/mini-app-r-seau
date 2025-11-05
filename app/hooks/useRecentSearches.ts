import { useCallback, useEffect, useState } from "react";


// les types attendus dnas les requetes
export type SearchParams = {
    motsCles?: string;
    departement?: string;
    typeContrat?: string;
    experience?: string;
};

// les données qui seront comprises dans la table
type RecentSearch = {
    id: string; 
    params: SearchParams;
    ts: number;
}

//key qui sera affiché dans le localstorage
const KEY = "recent_searches";
// le nombre de requetes récentes qui sera stocké au maximum
const MAX = 10;
const TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function UseRecentSearches() {


    const [items, setItems] = useState<RecentSearch[]>([]);

  useEffect(() => {
    try {
        // on lie la ligne dans le localStorage
         const raw = localStorage.getItem(KEY);

      const arr: RecentSearch[] = raw ? JSON.parse(raw) : [];
    //   on recupère l'heure actuelle
      const now = Date.now();
    //   on filtre tout ce qui a plus de 7 jours (on garde les “non expirés”).
      const cleaned = arr.filter(s => now - s.ts < TTL_MS);
      setItems(cleaned);
      if (cleaned.length !== arr.length)
        localStorage.setItem(KEY, JSON.stringify(cleaned));
    } catch {}
  }, []);

const add = useCallback((params: SearchParams) => {
  const now = Date.now();
  setItems(prev => {
    // on “détermine l'identité” d’une recherche par son JSON
    const key = JSON.stringify(params);

    // dé-duplication : on enlève une éventuelle entrée identique déjà présente
    const filtered = prev.filter(s => JSON.stringify(s.params) !== key);

    // on crée la nouvelle entrée en tête du tableau
    const next = [
      { id: crypto.randomUUID(), params, ts: now },
      ...filtered
    ].slice(0, MAX); // on coupe à MAX éléments

    // on persiste dans localStorage
    localStorage.setItem(KEY, JSON.stringify(next));

    return next;
  });
}, []);

  const clear = useCallback(() => {
    localStorage.removeItem(KEY);
    setItems([]);
  }, []);

  return { items, add, clear };
}