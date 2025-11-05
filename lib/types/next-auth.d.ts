import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;                 // 👈 on ajoute l'id
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
  }
}