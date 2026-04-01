'use client';

import { gql, useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getSession } from '@/lib/auth';
import { APP_PERMISSIONS, can } from '@/lib/permissions';
import { SessionData } from '@/lib/types';

const ORDERS_QUERY = gql`
  query Orders {
    orders {
      id
      status
      paymentStatus
      total
      createdAt
      items {
        id
        menuItemName
        quantity
        unitPrice
      }
    }
  }
`;

const CHECKOUT_ORDER_MUTATION = gql`
  mutation CheckoutOrder($orderId: String!) {
    checkoutOrder(orderId: $orderId) {
      id
      status
      amount
      orderId
      paymentMethodId
      processedAt
    }
  }
`;

const CANCEL_ORDER_MUTATION = gql`
  mutation CancelOrder($orderId: String!) {
    cancelOrder(orderId: $orderId) {
      id
      status
      paymentStatus
    }
  }
`;

interface Order {
  id: string;
  status: string;
  paymentStatus: string;
  total: number;
  createdAt: string;
  items: Array<{
    id: string;
    menuItemName: string;
    quantity: number;
    unitPrice: number;
  }>;
}

export default function OrdersPage() {
  const router = useRouter();
  const [session, setSession] = useState<SessionData | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    const activeSession = getSession();
    if (!activeSession) {
      router.replace('/login');
      return;
    }

    setSession(activeSession);
  }, [router]);

  const { data, loading, error, refetch } = useQuery<{ orders: Order[] }>(
    ORDERS_QUERY,
    {
      skip: !session,
      fetchPolicy: 'network-only',
    },
  );

  const [checkoutOrder, { loading: checkingOut }] = useMutation(
    CHECKOUT_ORDER_MUTATION,
  );
  const [cancelOrder, { loading: canceling }] = useMutation(CANCEL_ORDER_MUTATION);

  if (!session) {
    return null;
  }

  const canCheckout = can(session, APP_PERMISSIONS.CHECKOUT_ORDER);
  const canCancel = can(session, APP_PERMISSIONS.CANCEL_ORDER);

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Orders</h1>
        <p className="mt-1 text-sm text-slate-600">
          Your role: {session.user.role}. Country scope: {session.user.country}.
        </p>
      </div>

      {!canCheckout && !canCancel ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
          Members can view and create orders, but cannot checkout or cancel.
        </p>
      ) : null}

      {actionError ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {actionError}
        </p>
      ) : null}

      {loading ? <p className="text-sm text-slate-600">Loading orders...</p> : null}
      {error ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {error.message}
        </p>
      ) : null}

      <div className="space-y-4">
        {data?.orders.map((order) => (
          <article
            key={order.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Order {order.id}</h2>
                <p className="text-xs text-slate-500">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-indigo-100 px-2 py-1 text-xs font-semibold text-indigo-700">
                  {order.status}
                </span>
                <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                  {order.paymentStatus}
                </span>
              </div>
            </div>

            <ul className="mt-3 space-y-1 text-sm text-slate-600">
              {order.items.map((item) => (
                <li key={item.id}>
                  {item.menuItemName} x {item.quantity} @ {item.unitPrice}
                </li>
              ))}
            </ul>

            <p className="mt-3 text-sm font-semibold text-slate-800">Total: {order.total}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              {canCheckout ? (
                <button
                  type="button"
                  disabled={checkingOut || order.paymentStatus === 'PAID'}
                  onClick={async () => {
                    setActionError(null);
                    try {
                      await checkoutOrder({ variables: { orderId: order.id } });
                      await refetch();
                    } catch (mutationError) {
                      setActionError(
                        mutationError instanceof Error
                          ? mutationError.message
                          : 'Checkout failed.',
                      );
                    }
                  }}
                  className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
                >
                  {checkingOut ? 'Processing...' : 'Checkout and Pay'}
                </button>
              ) : null}

              {canCancel ? (
                <button
                  type="button"
                  disabled={canceling || order.status === 'CANCELLED'}
                  onClick={async () => {
                    setActionError(null);
                    try {
                      await cancelOrder({ variables: { orderId: order.id } });
                      await refetch();
                    } catch (mutationError) {
                      setActionError(
                        mutationError instanceof Error
                          ? mutationError.message
                          : 'Cancel failed.',
                      );
                    }
                  }}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                >
                  {canceling ? 'Canceling...' : 'Cancel Order'}
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
