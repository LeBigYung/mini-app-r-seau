import axios from "axios";
import { NextResponse } from "next/server";


// a appelé lors au début d'une recherche pour recevoir un token d'autorisation sur l'api de france travail
export async function reqAccesToken() {
  const response = await axios.post(
    "https://entreprise.pole-emploi.fr/connexion/oauth2/access_token?realm=/partenaire",
    new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.POLEEMPLOI_CLIENT_ID!,
      client_secret: process.env.POLEEMPLOI_CLIENT_SECRET!,
      scope: "api_offresdemploiv2 o2dsoffre",
    }),
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }
  );

  console.log("TOKEN OK:", response.data);
  return response.data.access_token as string;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const motsCles = searchParams.get("motsCles") ?? "développeur";
    const departement = searchParams.get("departement") ?? "69";
    const experience = searchParams.get("experience") ?? "";
    const typeContrat = searchParams.get("typeContrat") ?? "";
    const range = searchParams.get("range") ?? "0-10";
    
    const token = await reqAccesToken();

const jobs = await axios.get(
      "https://api.francetravail.io/partenaire/offresdemploi/v2/offres/search",
      {
        params: {
          motsCles,
          departement, 
          typeContrat,
          experience,
          range: "0-9",
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return NextResponse.json(jobs.data);
  } catch (error: any) {
    console.error("ERREUR API:", error.response?.data || error.message);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des offres" },
      { status: 500 }
    );
  }
}

