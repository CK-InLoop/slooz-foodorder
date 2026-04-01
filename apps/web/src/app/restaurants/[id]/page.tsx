'use client';

import { gql } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { AccessDenied } from '@/components/access-denied';
import { getSession } from '@/lib/auth';
import { APP_PERMISSIONS, can } from '@/lib/permissions';
import { SessionData } from '@/lib/types';

const RESTAURANT_QUERY = gql`
  query Restaurant($id: String!) {
    restaurant(id: $id) {
      id
      name
      city
      country
      description
      menuItems {
        id
        name
        description
        price
        isAvailable
      }
    }
  }
`;

const CREATE_ORDER_MUTATION = gql`
  mutation CreateOrder($input: CreateOrderInput!) {
    createOrder(input: $input) {
      id
      status
      total
    }
  }
`;

interface RestaurantItem {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  isAvailable: boolean;
}

interface Restaurant {
  id: string;
  name: string;
  city: string;
  country: string;
  description?: string | null;
  menuItems: RestaurantItem[];
}

export default function RestaurantDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [session, setSession] = useState<SessionData | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const activeSession = getSession();
    if (!activeSession) {
      router.replace('/login');
      return;
    }

    setSession(activeSession);
  }, [router]);

  const { data, loading, error } = useQuery<{ restaurant: Restaurant | null }>(
    RESTAURANT_QUERY,
    {
      variables: { id: params.id },
      skip: !session || !params.id,
    },
  );

  const [createOrder, { loading: creatingOrder }] = useMutation(CREATE_ORDER_MUTATION);

  const selectedItems = useMemo(
    () =>
      Object.entries(quantities)
        .filter(([, quantity]) => quantity > 0)
        .map(([menuItemId, quantity]) => ({ menuItemId, quantity })),
    [quantities],
  );

  const restaurant = data?.restaurant ?? null;

  const total = useMemo(() => {
    const menuItems = restaurant?.menuItems ?? [];
    const prices = new Map(menuItems.map((item) => [item.id, item.price]));

    return selectedItems.reduce(
      (sum, item) => sum + (prices.get(item.menuItemId) ?? 0) * item.quantity,
      0,
    );
  }, [restaurant?.menuItems, selectedItems]);

  if (!session) {
    return null;
  }

  const canCreateOrders = can(session, APP_PERMISSIONS.CREATE_ORDER);

  if (!canCreateOrders) {
    return (
      <AccessDenied message="Your role cannot create orders. Please use a different account." />
    );
  }

  return (
    <section className="space-y-5">
      <button
        type="button"
        onClick={() => router.push('/restaurants')}
        className="text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        Back to restaurants
      </button>

      {loading ? <p className="text-sm text-slate-600">Loading menu...</p> : null}
      {error ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {error.message}
        </p>
      ) : null}

      {restaurant ? (
        <>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h1 className="text-2xl font-semibold text-slate-900">
              {restaurant.name}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              {restaurant.city}, {restaurant.country}
            </p>
            {restaurant.description ? (
              <p className="mt-2 text-sm text-slate-600">{restaurant.description}</p>
            ) : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {restaurant.menuItems.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <h2 className="text-lg font-semibold text-slate-900">{item.name}</h2>
                {item.description ? (
                  <p className="mt-1 text-sm text-slate-600">{item.description}</p>
                ) : null}
                <p className="mt-2 text-sm font-medium text-slate-700">Price: {item.price}</p>

                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setQuantities((prev) => ({
                        ...prev,
                        [item.id]: Math.max(0, (prev[item.id] ?? 0) - 1),
                      }))
                    }
                    className="h-8 w-8 rounded-lg border border-slate-300"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-sm font-semibold">
                    {quantities[item.id] ?? 0}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setQuantities((prev) => ({
                        ...prev,
                        [item.id]: (prev[item.id] ?? 0) + 1,
                      }))
                    }
                    className="h-8 w-8 rounded-lg border border-slate-300"
                  >
                    +
                  </button>
                </div>
              </article>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Cart Summary</h3>
            <p className="mt-1 text-sm text-slate-600">
              Items selected: {selectedItems.length}
            </p>
            <p className="mt-1 text-sm text-slate-600">Subtotal estimate: {total}</p>

            {submitError ? (
              <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {submitError}
              </p>
            ) : null}

            <button
              type="button"
              disabled={selectedItems.length === 0 || creatingOrder}
              onClick={async () => {
                setSubmitError(null);

                try {
                  if (!restaurant) {
                    return;
                  }

                  await createOrder({
                    variables: {
                      input: {
                        restaurantId: restaurant.id,
                        items: selectedItems,
                      },
                    },
                  });

                  router.push('/orders');
                } catch (mutationError) {
                  setSubmitError(
                    mutationError instanceof Error
                      ? mutationError.message
                      : 'Unable to create order.',
                  );
                }
              }}
              className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
            >
              {creatingOrder ? 'Placing order...' : 'Create Order'}
            </button>
          </div>
        </>
      ) : null}
    </section>
  );
}
