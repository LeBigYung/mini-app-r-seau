import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { AuthOptions } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/authOptions";

export async function GET (req: Request) {
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({error: "Unauthrorized"}, {status: 401});

    const userId = session.user.id;

    const favs = await prisma.favorite.findMany ({
        where: {userId},
        orderBy: {createdAt: "desc"},
        include: {job:true},
    });

    const jobs = favs.map((f) => ({
        externalId: f.job.externalId,
        intitule: f.job.title,
        entreprise: {nom: f.job.company ?? undefined},
        lieuTravail: {libelle: f.job.location ?? undefined},
        url: f.job.url ?? undefined,
        experience: f.job.experience ?? "Aucune experience renseignée",
        typeContrat: f.job.typeContrat ?? "aucun contrat",
        description: f.job.description ?? "aucune description associée."
    }));

    return NextResponse.json({jobs});
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({error: "Unauthrorized"}, {status: 401});

    const userId = session.user.id;

    const { externalId, title, company, location, url, experience, typeContrat, description, next } = await req.json();

    // upsert du Job pour éviter les doublons
    const job = await prisma.job.upsert({
        where: {externalId},
        update: {},
        create: {externalId, title, company, location, url, experience, typeContrat, description},
        select: {id: true},
    });

    // toggle coté Favorite
    if (next) {
        //ajouter (idempotent grâce au unique composite)
        await prisma.favorite.upsert({
            where: {userId_jobId: {userId, jobId: job.id} },
            update:  {},
            create: {userId, jobId: job.id},
        });
    } else {
        await prisma.favorite.deleteMany ({
            where: {userId:session.user.id, jobId: job.id}
        });
    }

     return NextResponse.json({ ok: true });
}