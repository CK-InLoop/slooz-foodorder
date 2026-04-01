'use client';

import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { getSession, saveSession } from '@/lib/auth';
import { SessionData } from '@/lib/types';

const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      permissions
      user {
        id
        email
        name
        role
        country
      }
    }
  }
`;

const DEMO_ACCOUNTS = [
  'admin.india@slooz.dev',
  'manager.india@slooz.dev',
  'member.india@slooz.dev',
  'admin.america@slooz.dev',
  'manager.america@slooz.dev',
  'member.america@slooz.dev',
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('member.india@slooz.dev');
  const [password, setPassword] = useState('Password@123');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [login, { loading }] = useMutation<{
    login: SessionData;
  }>(LOGIN_MUTATION);

  useEffect(() => {
    if (getSession()) {
      router.replace('/restaurants');
    }
  }, [router]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);

    try {
      const result = await login({
        variables: {
          input: {
            email,
            password,
          },
        },
      });

      if (!result.data?.login) {
        setSubmitError('Invalid response from server.');
        return;
      }

      saveSession(result.data.login);
      router.replace('/restaurants');
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Unable to login right now.',
      );
    }
  }

  return (
    <section className="mx-auto max-w-3xl py-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-600">
          Role Based Ordering
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
          Sign in to Slooz
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Use seeded credentials to test Admin, Manager, and Member workflows.
        </p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <label className="block text-sm font-medium text-slate-700">
            Email
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              required
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-orange-200 focus:ring-2"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Password
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              required
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-orange-200 focus:ring-2"
            />
          </label>

          {submitError ? (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {submitError}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
            Seeded Accounts
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Password for all demo users: Password@123
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {DEMO_ACCOUNTS.map((accountEmail) => (
              <button
                key={accountEmail}
                type="button"
                onClick={() => setEmail(accountEmail)}
                className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs text-slate-700 hover:bg-slate-100"
              >
                {accountEmail}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
