// app/login/page.tsx (SERVER COMPONENT)
import prisma from '@/lib/prisma'

export default async function LoginPage() {
  const users = await prisma.user.findMany();

  return (
    <form>
      <input type="email" name="email" placeholder="Email" required />
      <input type="password" name="password" placeholder="Password" required />
      <button type="submit">Login</button>

      <ol className="list-decimal list-inside font-[family-name:var(--font-geist-sans)]">
            {users.map((user: { id: string; name: string }) => (
            <li key={user.id} className="mb-2">{user.name} salam !!</li>
            ))}
      </ol>
    </form>
  );
}
