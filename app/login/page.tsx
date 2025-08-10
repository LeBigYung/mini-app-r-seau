import prisma from '@/lib/prisma'
import { FormEvent } from 'react';

export default function LoginPage() {

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const response = await fetch('api/signup', {
      method: 'POST',
      body: formData,
    })

     
    // Handle response if necessary
    const data = await response.json()
    // ...code à imbriquer lorsque on a une réponse json

  }

  return (
    <main>
          <form>
            <input type="email" name="email" placeholder="Email" required />
            <input type="password" name="password" placeholder="Password" required />
            <button type="submit" className='cursor-pointer'>Login</button>

          </form>

            {/* <ol className="list-decimal list-inside font-[family-name:var(--font-geist-sans)]">
                  {users.map((user) => (
                  <li key={user.id} className="mb-2">{user.name} salam !!</li>
                  ))}
            </ol> */}
      </main>
  );
}
