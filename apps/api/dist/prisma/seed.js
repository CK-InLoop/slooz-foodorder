"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function upsertUser(email, name, role, country, passwordHash) {
    return prisma.user.upsert({
        where: { email },
        update: {
            name,
            role,
            country,
            passwordHash,
        },
        create: {
            email,
            name,
            role,
            country,
            passwordHash,
        },
    });
}
async function upsertRestaurant(name, city, country, description) {
    return prisma.restaurant.upsert({
        where: {
            name_country: {
                name,
                country,
            },
        },
        update: {
            city,
            description,
        },
        create: {
            name,
            city,
            country,
            description,
        },
    });
}
async function seed() {
    const passwordHash = await bcrypt.hash('Password@123', 10);
    const users = await Promise.all([
        upsertUser('admin.india@slooz.dev', 'India Admin', client_1.Role.ADMIN, client_1.Country.INDIA, passwordHash),
        upsertUser('manager.india@slooz.dev', 'India Manager', client_1.Role.MANAGER, client_1.Country.INDIA, passwordHash),
        upsertUser('member.india@slooz.dev', 'India Member', client_1.Role.MEMBER, client_1.Country.INDIA, passwordHash),
        upsertUser('admin.america@slooz.dev', 'America Admin', client_1.Role.ADMIN, client_1.Country.AMERICA, passwordHash),
        upsertUser('manager.america@slooz.dev', 'America Manager', client_1.Role.MANAGER, client_1.Country.AMERICA, passwordHash),
        upsertUser('member.america@slooz.dev', 'America Member', client_1.Role.MEMBER, client_1.Country.AMERICA, passwordHash),
    ]);
    const [indiaRestaurantOne, indiaRestaurantTwo, usaRestaurantOne, usaRestaurantTwo] = await Promise.all([
        upsertRestaurant('Spice Route', 'Bengaluru', client_1.Country.INDIA, 'North and South Indian comfort food.'),
        upsertRestaurant('Coastal Curry House', 'Mumbai', client_1.Country.INDIA, 'Seafood and regional curries.'),
        upsertRestaurant('Big Sky Grill', 'Austin', client_1.Country.AMERICA, 'American grill and smokehouse classics.'),
        upsertRestaurant('Golden State Bowls', 'San Francisco', client_1.Country.AMERICA, 'Healthy bowls, wraps, and salads.'),
    ]);
    const menuPayload = [
        {
            restaurantId: indiaRestaurantOne.id,
            name: 'Paneer Butter Masala',
            description: 'Creamy tomato gravy with marinated paneer.',
            price: 320,
        },
        {
            restaurantId: indiaRestaurantOne.id,
            name: 'Masala Dosa',
            description: 'Crispy dosa with potato filling.',
            price: 180,
        },
        {
            restaurantId: indiaRestaurantTwo.id,
            name: 'Malabar Prawn Curry',
            description: 'Coconut-based spicy prawn curry.',
            price: 390,
        },
        {
            restaurantId: indiaRestaurantTwo.id,
            name: 'Appam',
            description: 'Soft fermented rice pancakes.',
            price: 120,
        },
        {
            restaurantId: usaRestaurantOne.id,
            name: 'Smoked Brisket Plate',
            description: 'Slow-smoked brisket with house sides.',
            price: 24,
        },
        {
            restaurantId: usaRestaurantOne.id,
            name: 'Classic Cheeseburger',
            description: 'Angus beef patty, cheddar, and fries.',
            price: 16,
        },
        {
            restaurantId: usaRestaurantTwo.id,
            name: 'Chipotle Chicken Bowl',
            description: 'Brown rice, chicken, avocado, and salsa.',
            price: 15,
        },
        {
            restaurantId: usaRestaurantTwo.id,
            name: 'Falafel Green Wrap',
            description: 'Herb falafel with tahini and fresh greens.',
            price: 13,
        },
    ];
    for (const item of menuPayload) {
        await prisma.menuItem.upsert({
            where: {
                restaurantId_name: {
                    restaurantId: item.restaurantId,
                    name: item.name,
                },
            },
            update: {
                description: item.description,
                price: item.price,
                isAvailable: true,
            },
            create: {
                restaurantId: item.restaurantId,
                name: item.name,
                description: item.description,
                price: item.price,
                isAvailable: true,
            },
        });
    }
    for (const user of users.filter((u) => u.role === client_1.Role.ADMIN)) {
        await prisma.paymentMethod.upsert({
            where: {
                userId_provider_last4: {
                    userId: user.id,
                    provider: 'VISA',
                    last4: '4242',
                },
            },
            update: {
                type: 'CARD',
                isDefault: true,
                isActive: true,
            },
            create: {
                userId: user.id,
                type: 'CARD',
                provider: 'VISA',
                last4: '4242',
                isDefault: true,
                isActive: true,
            },
        });
    }
    console.log('Seed complete. Demo password for all users: Password@123');
}
seed()
    .catch((error) => {
    console.error(error);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map