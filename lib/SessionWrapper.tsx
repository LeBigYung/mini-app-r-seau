"use client";

import { SessionProvider } from "next-auth/react";

// creation de l'instance SessionWrapper qui englobera les pages et permettra de vérifier si un utilisateur est connecté et si oui vérifier ses infos

// session wrapper englobe children qui lui est déclaré et attendu comme composant react
const SessionWrapper = ({children} : {children: React.ReactNode}) => {

// on englobe toutes les pages qui seront chargé à l'interieur du session wrapper
    return <SessionProvider>{children}</SessionProvider>
}

// exportation du wrapper qui sera inséré dans le layout
export default SessionWrapper;