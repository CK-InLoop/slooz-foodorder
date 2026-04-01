import { ApolloServer, HeaderMap } from '@apollo/server';
import { typeDefs } from '@/server/type-defs';
import { resolvers } from '@/server/resolvers';

const server = new ApolloServer({ typeDefs, resolvers });
const serverStartPromise = server.start();

async function handler(req: Request): Promise<Response> {
  await serverStartPromise;

  const body = await req.json();

  const headerMap = new HeaderMap();
  req.headers.forEach((value, key) => {
    headerMap.set(key, value);
  });

  const response = await server.executeHTTPGraphQLRequest({
    httpGraphQLRequest: {
      method: req.method,
      headers: headerMap,
      body,
      search: new URL(req.url).search,
    },
    context: async () => ({ req }),
  });

  const headers = new Headers();
  for (const [key, value] of response.headers) {
    headers.set(key, value);
  }

  let bodyStr: string;
  if (response.body.kind === 'complete') {
    bodyStr = response.body.string;
  } else {
    const chunks: string[] = [];
    for await (const chunk of response.body.asyncIterator) {
      chunks.push(chunk);
    }
    bodyStr = chunks.join('');
  }

  return new Response(bodyStr, {
    status: response.status || 200,
    headers,
  });
}

export { handler as GET, handler as POST };
