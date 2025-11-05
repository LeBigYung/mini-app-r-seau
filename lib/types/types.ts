import { Key } from "react";

export type Job = {
  id: Key | null | undefined;
  externalId: string;           // id France Travail
  intitule: string;
  entreprise?: { nom?: string };
  lieuTravail?: { libelle?: string };
  dateCreation?: string;
  url?: string;                 // lien source si dispo
  experience? : string;
  formations?: string;
  permis?: string;
  competences?: {libelle?: string};
  salaire: string;
  typeContrat?: string;
  description?: string;
};