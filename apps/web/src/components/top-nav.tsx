'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { clearSession, getSession } from '@/lib/auth';
import { SessionData } from '@/lib/types';

export function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<SessionData | null>(null);

  useEffect(() => {
    setSession(getSession());
  }, [pathname]);

  if (!session || pathname === '/login') {
    return null;
  }

  return (
    <header className="border-b border-black/10 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href="/restaurants" className="text-lg font-semibold tracking-tight">
            Slooz Food
          </Link>
          <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
            {session.user.country}
          </span>
          <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
            {session.user.role}
          </span>
        </div>

        <nav className="flex items-center gap-2 text-sm font-medium">
          <Link href="/restaurants" className="rounded-lg px-3 py-2 hover:bg-black/5">
            Restaurants
          </Link>
          <Link href="/orders" className="rounded-lg px-3 py-2 hover:bg-black/5">
            Orders
          </Link>
          {session.user.role === 'ADMIN' ? (
            <Link
              href="/admin/payment-methods"
              className="rounded-lg px-3 py-2 hover:bg-black/5"
            >
              Payment Methods
            </Link>
          ) : null}
          <button
            type="button"
            onClick={() => {
              clearSession();
              router.push('/login');
            }}
            className="rounded-lg bg-black px-3 py-2 text-white"
          >
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}
