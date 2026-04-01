'use client';

import { ApolloProvider } from '@apollo/client/react';
import { ReactNode, useMemo } from 'react';
import { createApolloClient } from '@/lib/apollo-client';

interface Props {
  children: ReactNode;
}

export function ApolloAppProvider({ children }: Props) {
  const client = useMemo(() => createApolloClient(), []);
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
