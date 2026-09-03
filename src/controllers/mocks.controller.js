import { faker } from '@faker-js/faker';
import { generateMockUsers } from '../mocks/users.mock.js';
import { generateMockOrders, generateMockOrder } from '../mocks/orders.mock.js';
import { generateMockStores } from '../mocks/stores.mock.js';
import { insertManyUsers } from '../repositories/users.repository.js';
import { insertManyStores } from '../repositories/stores.repository.js';
import { insertManyOrders } from '../repositories/orders.repository.js';

export const getMockOrders = (req, res) => {
    const fakeCustomerId = faker.database.mongodbObjectId();
    const fakeStoreId = faker.database.mongodbObjectId();
    const orders = generateMockOrders(fakeCustomerId, 10, fakeStoreId);
    res.status(200).json({ status: "success", payload: orders });
}

export const getMockUsers = (req, res) => {
    const users = generateMockUsers(10);
    res.status(200).json({ status: "success", payload: users });
}

export const createMockUsers = (req, res) => {
    const { users = 0 } = req.body;

    if(typeof users !== 'number') {
        return res.status(400).json({ status: "error", message: "Invalid input. 'users' and 'orders' must be numbers." });
    }

    const mockUsers = generateMockUsers(users);
    res.status(201).json({ status: "success", payload: mockUsers });
}

export const createMockOrders = (req, res) => {
    const { orders = 0 } = req.body;

    if(typeof orders !== 'number') {
        return res.status(400).json({ status: "error", message: "Invalid input. 'users' and 'orders' must be numbers." });
    }

    const fakeCustomerId = faker.database.mongodbObjectId();
    const fakeStoreId = faker.database.mongodbObjectId();
    const mockOrders = generateMockOrders(fakeCustomerId, orders, fakeStoreId);
    res.status(201).json({ status: "success", payload: mockOrders });
}

export const generateData = async (req, res) => {
    try {
        const MAX = 100;

        const { users = 0, orders = 0, stores = 0 } = req.body;

        if (typeof users !== "number" || typeof orders !== "number" || typeof stores !== "number") {
            return res.status(400).json({
                status: "error",
                message: "Invalid data"
            });
        }

        if (users > MAX || orders > MAX || stores > MAX) {
            return res.status(400).json({
                status: "error",
                message: "Maximum amount of users, orders or stores is 100"
            });
        }

        if (stores > 0 && users === 0) {
            return res.status(400).json({
                status: "error",
                message: "Generating stores requires at least 1 user to act as owner"
            });
        }

        if (orders > 0 && (users === 0 || stores === 0)) {
            return res.status(400).json({
                status: "error",
                message: "Generating orders requires at least 1 user and 1 store"
            });
        }

        const mockUsers = generateMockUsers(users);
        const generatedUsers = await insertManyUsers(mockUsers);

        const mockStores = generateMockStores(stores, generatedUsers);
        const generatedStores = await insertManyStores(mockStores);

        const mockOrders = Array.from({ length: orders }, () => {
            const randomUser = generatedUsers[Math.floor(Math.random() * generatedUsers.length)];
            const randomStore = generatedStores[Math.floor(Math.random() * generatedStores.length)];
            return generateMockOrder(randomUser._id, randomStore._id);
        });
        const generatedOrders = await insertManyOrders(mockOrders);

        return res.status(201).json({
            status: "success",
            message: "Data generated successfully",
            payload: {
                users: generatedUsers.length,
                orders: generatedOrders.length,
                stores: generatedStores.length
            }
        });

    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: error.message
        });
    }
}

