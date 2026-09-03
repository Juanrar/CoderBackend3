import { faker } from '@faker-js/faker';

export const generateMockStore = (ownerId) => {
    return {
        name: faker.company.name(),
        address: faker.location.streetAddress(),
        owner: ownerId
    }
}

export const generateMockStores = (count = 10, users = []) => {
    return Array.from({ length: count }, () => {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        return generateMockStore(randomUser._id);
    });
}
