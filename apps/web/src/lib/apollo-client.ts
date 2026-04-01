import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  from,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { getSession } from './auth';

export function createApolloClient() {
  const httpLink = new HttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_URL ?? '/api/graphql',
  });

  const authLink = setContext((_operation, previousContext) => {
    const session = getSession();

    return {
      headers: {
        ...previousContext.headers,
        authorization: session?.accessToken
          ? `Bearer ${session.accessToken}`
          : '',
      },
    };
  });

  return new ApolloClient({
    cache: new InMemoryCache(),
    link: from([authLink, httpLink]),
  });
}
