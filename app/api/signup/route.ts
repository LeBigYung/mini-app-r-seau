// app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";


export async function POST (req: Request) {
    
    const {email, password, name} = await req.json();

    if (!email || !password) {
        return NextResponse.json({error: "Email et mot de requis !"}, {status: 400} );   
    }

    const existing = await.prisma.user.FindUnique({where: {email} });
    if (existing) {
        return NextResponse.json({error: "Email deja utilisé"}, {status: 409});
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
        data: {
        email,
        name,
        passwordHash: passwordHash, // mapping explicite
        },
        select: {id: true, email: true, name: true},
    });

    return NextResponse.json({user});
}
