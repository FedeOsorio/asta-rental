export const typeDefs = `#graphql
  enum PropertyType {
    apartment
    house
    commercial
  }

  enum PropertyStatus {
    available
    rented
    maintenance
  }

  enum ContractStatus {
    active
    expired
    terminated
  }

  enum PaymentStatus {
    pending
    paid
    overdue
    cancelled
  }

  type Property {
    id: ID!
    organizationId: ID!
    address: String!
    type: PropertyType!
    monthlyRent: Float!
    status: PropertyStatus!
    createdAt: String!
  }

  type Renter {
    id: ID!
    organizationId: ID!
    fullName: String!
    email: String!
    phone: String!
  }

  type Contract {
    id: ID!
    organizationId: ID!
    propertyId: ID!
    renterId: ID!
    startDate: String!
    endDate: String!
    monthlyRent: Float!
    status: ContractStatus!
    property: Property
    renter: Renter
    payments: [Payment!]!
  }

  type Payment {
    id: ID!
    organizationId: ID!
    contractId: ID!
    dueDate: String!
    paidDate: String
    amount: Float!
    status: PaymentStatus!
  }

  type PropertyCollectionMetrics {
    propertyId: ID!
    address: String!
    collected: Float!
    pending: Float!
    overdue: Float!
  }

  type CollectionDashboard {
    totalCollected: Float!
    totalPending: Float!
    totalOverdue: Float!
    byProperty: [PropertyCollectionMetrics!]!
  }

  type Query {
    properties(status: PropertyStatus): [Property!]!
    property(id: ID!): Property
    renters: [Renter!]!
    contract(id: ID!): Contract
    payments(status: PaymentStatus): [Payment!]!
    collectionDashboard: CollectionDashboard!
  }
`;
