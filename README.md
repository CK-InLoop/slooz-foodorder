# Slooz Food Order

Full-stack food ordering application with role-based access control and country-scoped relational access.

## Stack

- Backend: NestJS, GraphQL, Prisma, SQLite
- Frontend: Next.js (App Router), TypeScript, Tailwind CSS, Apollo Client
- Auth: JWT with RBAC permissions and country-scoped checks (India/America)

## Roles and Permissions

| Feature | Admin | Manager | Member |
|---|---|---|---|
| View restaurants and menu | Yes | Yes | Yes |
| Create order | Yes | Yes | Yes |
| Checkout and pay | Yes | Yes | No |
| Cancel order | Yes | Yes | No |
| Add or modify payment methods | Yes | No | No |

## Country Access Model

All users are assigned one country: INDIA or AMERICA.

- Restaurants and menu queries are filtered by authenticated user country.
- Order creation validates restaurant belongs to user country.
- Manager and Admin checkout or cancel only orders in their country.
- Admin payment method management is restricted to users in same country.

## Seeded Demo Users

All seeded users share password: `Password@123`

- admin.india@slooz.dev
- manager.india@slooz.dev
- member.india@slooz.dev
- admin.america@slooz.dev
- manager.america@slooz.dev
- member.america@slooz.dev

## Setup

1. Install dependencies at workspace root:

   npm install

2. Install API dependencies and generate schema data:

   npm install --workspace apps/api
   npm run prisma:generate --workspace apps/api
   npm run prisma:push --workspace apps/api
   npm run prisma:seed --workspace apps/api

3. Install Web dependencies:

   npm install --workspace apps/web

4. Run backend and frontend in separate terminals:

   npm run dev:api
   npm run dev:web

5. Open the app:

   http://localhost:3000

## GraphQL Endpoint

- API URL: http://localhost:4000/graphql

## Notes

- The backend uses a local SQLite database at apps/api/dev.db for quick setup.
- Authorization is enforced in both GraphQL guard layer and service layer.
