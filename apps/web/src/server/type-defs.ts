export const typeDefs = `#graphql
  enum Role {
    ADMIN
    MANAGER
    MEMBER
  }

  enum Country {
    INDIA
    AMERICA
  }

  enum OrderStatus {
    PENDING
    CONFIRMED
    CANCELLED
    COMPLETED
  }

  enum PaymentStatus {
    PENDING
    PAID
    FAILED
  }

  type User {
    id: ID!
    email: String!
    name: String!
    role: Role!
    country: Country!
  }

  type AuthPayload {
    accessToken: String!
    permissions: [String!]!
    user: User!
  }

  type MenuItem {
    id: ID!
    name: String!
    description: String
    price: Float!
    isAvailable: Boolean!
  }

  type Restaurant {
    id: ID!
    name: String!
    description: String
    city: String!
    country: Country!
    menuItems: [MenuItem!]!
  }

  type OrderItem {
    id: ID!
    menuItemId: String!
    menuItemName: String!
    quantity: Int!
    unitPrice: Float!
    lineTotal: Float!
  }

  type Order {
    id: ID!
    userId: String!
    restaurantId: String!
    status: OrderStatus!
    paymentStatus: PaymentStatus!
    subtotal: Float!
    tax: Float!
    total: Float!
    notes: String
    createdAt: String!
    items: [OrderItem!]!
  }

  type Payment {
    id: ID!
    orderId: String!
    paymentMethodId: String
    amount: Float!
    status: PaymentStatus!
    processedAt: String
  }

  type PaymentMethod {
    id: ID!
    userId: String!
    type: String!
    provider: String!
    last4: String!
    isDefault: Boolean!
    isActive: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  input RegisterInput {
    email: String!
    password: String!
    name: String!
    country: Country!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input CreateOrderItemInput {
    menuItemId: String!
    quantity: Int!
  }

  input CreateOrderInput {
    restaurantId: String!
    items: [CreateOrderItemInput!]!
    notes: String
  }

  input AddPaymentMethodInput {
    userId: String!
    type: String!
    provider: String!
    last4: String!
    isDefault: Boolean
  }

  input UpdatePaymentMethodInput {
    paymentMethodId: String!
    type: String
    provider: String
    last4: String
    isDefault: Boolean
    isActive: Boolean
  }

  type Query {
    me: User
    restaurants: [Restaurant!]!
    restaurant(id: String!): Restaurant
    orders: [Order!]!
    paymentMethods(userId: String): [PaymentMethod!]!
  }

  type Mutation {
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    createOrder(input: CreateOrderInput!): Order!
    checkoutOrder(orderId: String!, paymentMethodId: String): Payment!
    cancelOrder(orderId: String!): Order!
    addPaymentMethod(input: AddPaymentMethodInput!): PaymentMethod!
    updatePaymentMethod(input: UpdatePaymentMethodInput!): PaymentMethod!
  }
`;
