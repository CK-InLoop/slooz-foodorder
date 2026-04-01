'use client';

import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getSession } from '@/lib/auth';
import { SessionData } from '@/lib/types';

const RESTAURANTS_QUERY = gql`
  query Restaurants {
    restaurants {
      id
      name
      city
      country
      description
      menuItems {
        id
        name
        price
      }
    }
  }
`;

interface Restaurant {
  id: string;
  name: string;
  city: string;
  country: string;
  description?: string | null;
  menuItems: Array<{
    id: string;
    name: string;
    price: number;
  }>;
}

export default function RestaurantsPage() {
  const router = useRouter();
  const [session, setSession] = useState<SessionData | null>(null);

  useEffect(() => {
    const activeSession = getSession();
    if (!activeSession) {
      router.replace('/login');
      return;
    }

    setSession(activeSession);
  }, [router]);

  const { data, loading, error } = useQuery<{ restaurants: Restaurant[] }>(
    RESTAURANTS_QUERY,
    {
      skip: !session,
      fetchPolicy: 'network-only',
    },
  );

  if (!session) {
    return null;
  }

  return (
    <section>
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Restaurants in {session.user.country}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Browse menus and place orders according to your role permissions.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-slate-600">Loading restaurants...</p>
      ) : null}

      {error ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {error.message}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {data?.restaurants.map((restaurant) => (
          <article
            key={restaurant.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  {restaurant.name}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  {restaurant.city}, {restaurant.country}
                </p>
              </div>
              <span className="rounded-full bg-indigo-100 px-2 py-1 text-xs font-semibold text-indigo-700">
                {restaurant.menuItems.length} items
              </span>
            </div>

            {restaurant.description ? (
              <p className="mt-3 text-sm text-slate-600">{restaurant.description}</p>
            ) : null}

            <div className="mt-3 space-y-1 text-xs text-slate-500">
              {restaurant.menuItems.slice(0, 3).map((item) => (
                <p key={item.id}>
                  {item.name} - {item.price}
                </p>
              ))}
            </div>

            <Link
              href={`/restaurants/${restaurant.id}`}
              className="mt-4 inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
            >
              View Menu
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
