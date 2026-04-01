'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from '@/lib/auth';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (getSession()) {
      router.replace('/restaurants');
      return;
    }

    router.replace('/login');
  }, [router]);

  return (
    <section className="flex min-h-[60vh] items-center justify-center">
      <p className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">
        Loading Slooz dashboard...
      </p>
    </section>
  );
}
