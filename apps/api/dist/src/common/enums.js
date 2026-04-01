"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const graphql_1 = require("@nestjs/graphql");
(0, graphql_1.registerEnumType)(client_1.Role, { name: 'Role' });
(0, graphql_1.registerEnumType)(client_1.Country, { name: 'Country' });
(0, graphql_1.registerEnumType)(client_1.OrderStatus, { name: 'OrderStatus' });
(0, graphql_1.registerEnumType)(client_1.PaymentStatus, { name: 'PaymentStatus' });
//# sourceMappingURL=enums.js.map