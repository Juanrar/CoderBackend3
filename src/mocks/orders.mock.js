import { faker } from '@faker-js/faker';
import { ORDER_STATUS } from '../constants/order.constants.js';

export const generateMockOrder = (customerId, storeId) => {
    const items= [
        {
            name: faker.commerce.productName(),
            quantity: faker.number.int({ min: 1, max: 10 }),
            price: faker.number.int({ min: 1000, max: 10000 })
        }
    ]

    const totalAmount = items.reduce((total, item) => total + (item.quantity * item.price), 0);

    return {
        customer: customerId,
        store: storeId,
        items: items,
        total: totalAmount,
        deliveryAddress: faker.location.streetAddress(),
        status: ORDER_STATUS.CREATED,
    }
}

export const generateMockOrders = (customerId, count = 10, storeId) => {
    return Array.from({ length: count }, () => generateMockOrder(customerId, storeId));
}