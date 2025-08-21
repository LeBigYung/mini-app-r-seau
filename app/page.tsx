"use client";

// import des fonctions natives de next-auth permettant la connexion, deconnexion et la gestion des données user
import {signIn, signOut,  useSession} from "next-auth/react";

const Mainpage = () => {


    // on stocke la session si il y en a une
    const {data:session} =useSession();

    // si il y a une session on fait
    if (session) {
        console.log(session);

    // sinon
    } else { 
        console.log("veuillez vous connecter")
    }

  return (
    <>

    <nav className="p-5 mb-10">
        {session && 
    <div className="flex justify-between text-center m-10 px-30">
            <p className="text-center m-5">Bienvenue {session.user?.name}</p>
        <p className="text-center m-5">Voici votre email de connexion : {session.user?.email}</p>
        {/* bouton qui permet de se déconnecter quand un user est connecté */}
        <button onClick={()=> signOut()} className="bg-gray-300 hover:bg-gray-400 rounded-md p-3">Se déconnecter</button>
    </div>
    }
    </nav>
    
    <div className="max-w-[1000px] mx-auto flex justify-center items-center flex-column gap-2">
        <h1 className="text-8xl uppercase font-black text-center mb-4">Next Job</h1>
    </div>

    <div className="flex items-center justify-center my-15">
            {/* bouton qui permet d'accéder au provider github */}

            {!session && 
            <button onClick={() => signIn('github')} className="bg-gray-300 hover:bg-gray-400 rounded-md p-3">Se connecter avec Github</button>
            }
    </div>
    </>
  )
}

export default Mainpage