// components/Topo.tsx

import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function Topo() {
  const { data: session } = useSession();

  return (
    <div className="flex justify-between items-center px-4 py-2">
      {/* Foto de perfil */}
      {session?.user?.image && (
        <Image
          src={session.user.image}
          alt="Foto do perfil"
          width={40}
          height={40}
          className="rounded-full border border-gray-300"
        />
      )}

      {/* Menu alinhado à direita */}
      <div className="flex-1 flex justify-end">
        <nav className="flex gap-6 text-sm font-light">
          <Link href="/">home</Link>
          <Link href="/sobre">sobre</Link>
          <Link href="/servicos">serviços</Link>
          <Link href="/contato">contato</Link>
          <Link href="/login">
            <span className="px-4 py-1 bg-[var(--foreground)] text-[var(--background)] rounded-full hover:opacity-80 transition">
              login
            </span>
          </Link>
        </nav>
      </div>
    </div>
  );
}
