'use client';

import { gql, useMutation, useQuery } from '@apollo/client';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AccessDenied } from '@/components/access-denied';
import { getSession } from '@/lib/auth';
import { APP_PERMISSIONS, can, isAdmin } from '@/lib/permissions';
import { SessionData } from '@/lib/types';

const PAYMENT_METHODS_QUERY = gql`
  query PaymentMethods($userId: String) {
    paymentMethods(userId: $userId) {
      id
      userId
      type
      provider
      last4
      isDefault
      isActive
      createdAt
      updatedAt
    }
  }
`;

const ADD_PAYMENT_METHOD_MUTATION = gql`
  mutation AddPaymentMethod($input: AddPaymentMethodInput!) {
    addPaymentMethod(input: $input) {
      id
      userId
      type
      provider
      last4
      isDefault
      isActive
    }
  }
`;

const UPDATE_PAYMENT_METHOD_MUTATION = gql`
  mutation UpdatePaymentMethod($input: UpdatePaymentMethodInput!) {
    updatePaymentMethod(input: $input) {
      id
      userId
      type
      provider
      last4
      isDefault
      isActive
      updatedAt
    }
  }
`;

interface PaymentMethod {
  id: string;
  userId: string;
  type: string;
  provider: string;
  last4: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function PaymentMethodsAdminPage() {
  const router = useRouter();
  const [session, setSession] = useState<SessionData | null>(null);
  const [targetUserId, setTargetUserId] = useState('');
  const [type, setType] = useState('CARD');
  const [provider, setProvider] = useState('VISA');
  const [last4, setLast4] = useState('1111');
  const [isDefault, setIsDefault] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    const activeSession = getSession();
    if (!activeSession) {
      router.replace('/login');
      return;
    }

    setSession(activeSession);
    setTargetUserId(activeSession.user.id);
  }, [router]);

  const canManageMethods = useMemo(
    () => can(session, APP_PERMISSIONS.MANAGE_PAYMENT_METHODS) && isAdmin(session),
    [session],
  );

  const { data, loading, error, refetch } = useQuery<{
    paymentMethods: PaymentMethod[];
  }>(PAYMENT_METHODS_QUERY, {
    variables: {
      userId: targetUserId || undefined,
    },
    skip: !session || !canManageMethods || !targetUserId,
    fetchPolicy: 'network-only',
  });

  const [addPaymentMethod, { loading: adding }] = useMutation(
    ADD_PAYMENT_METHOD_MUTATION,
  );
  const [updatePaymentMethod, { loading: updating }] = useMutation(
    UPDATE_PAYMENT_METHOD_MUTATION,
  );

  if (!session) {
    return null;
  }

  if (!canManageMethods) {
    return (
      <AccessDenied message="Only Admin users can add or modify payment methods." />
    );
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActionError(null);

    try {
      await addPaymentMethod({
        variables: {
          input: {
            userId: targetUserId,
            type,
            provider,
            last4,
            isDefault,
          },
        },
      });

      setLast4('1111');
      setIsDefault(false);
      await refetch();
    } catch (mutationError) {
      setActionError(
        mutationError instanceof Error
          ? mutationError.message
          : 'Unable to add payment method.',
      );
    }
  }

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Admin Payment Methods
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Manage payment methods for users in your assigned country.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2"
      >
        <label className="text-sm font-medium text-slate-700">
          User ID
          <input
            value={targetUserId}
            onChange={(event) => setTargetUserId(event.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="text-sm font-medium text-slate-700">
          Type
          <input
            value={type}
            onChange={(event) => setType(event.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="text-sm font-medium text-slate-700">
          Provider
          <input
            value={provider}
            onChange={(event) => setProvider(event.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="text-sm font-medium text-slate-700">
          Last 4 Digits
          <input
            value={last4}
            onChange={(event) => setLast4(event.target.value)}
            required
            maxLength={4}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="col-span-full flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={isDefault}
            onChange={(event) => setIsDefault(event.target.checked)}
          />
          Set as default
        </label>

        <button
          type="submit"
          disabled={adding || !targetUserId}
          className="col-span-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {adding ? 'Adding...' : 'Add Payment Method'}
        </button>
      </form>

      {actionError ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {actionError}
        </p>
      ) : null}

      {loading ? <p className="text-sm text-slate-600">Loading methods...</p> : null}
      {error ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {error.message}
        </p>
      ) : null}

      <div className="space-y-3">
        {data?.paymentMethods.map((method) => (
          <article
            key={method.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {method.provider} ({method.last4})
                </h2>
                <p className="text-xs text-slate-500">User: {method.userId}</p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="rounded-full bg-indigo-100 px-2 py-1 font-semibold text-indigo-700">
                  {method.type}
                </span>
                <span
                  className={`rounded-full px-2 py-1 font-semibold ${
                    method.isActive
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {method.isActive ? 'Active' : 'Inactive'}
                </span>
                {method.isDefault ? (
                  <span className="rounded-full bg-orange-100 px-2 py-1 font-semibold text-orange-700">
                    Default
                  </span>
                ) : null}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={updating}
                onClick={async () => {
                  setActionError(null);
                  try {
                    await updatePaymentMethod({
                      variables: {
                        input: {
                          paymentMethodId: method.id,
                          isActive: !method.isActive,
                        },
                      },
                    });
                    await refetch();
                  } catch (mutationError) {
                    setActionError(
                      mutationError instanceof Error
                        ? mutationError.message
                        : 'Failed to update method.',
                    );
                  }
                }}
                className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Toggle Active
              </button>

              <button
                type="button"
                disabled={updating || method.isDefault}
                onClick={async () => {
                  setActionError(null);
                  try {
                    await updatePaymentMethod({
                      variables: {
                        input: {
                          paymentMethodId: method.id,
                          isDefault: true,
                        },
                      },
                    });
                    await refetch();
                  } catch (mutationError) {
                    setActionError(
                      mutationError instanceof Error
                        ? mutationError.message
                        : 'Failed to update method.',
                    );
                  }
                }}
                className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
              >
                Make Default
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
