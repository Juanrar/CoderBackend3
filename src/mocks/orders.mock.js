import { faker } from '@faker-js/faker';
import { ORDER_STATUS } from '../constants/order.constants.js';
import { DELIVERY_PRIORITY } from '../constants/delivery.constants.js';

export const generateMockOrder = (customerId) => {
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
        items: items,
        total: totalAmount,
        deliveryAddress: faker.location.streetAddress(),
        status: ORDER_STATUS.PENDING,
        deliveryPriority: DELIVERY_PRIORITY.STANDARD,
    }
}

export const generateMockOrders = (customerId, count = 10) => {
    return Array.from({ length: count }, () => generateMockOrder(customerId));
}