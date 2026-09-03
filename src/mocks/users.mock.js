import { USER_ROLES } from '../constants/user.constants.js'
import { faker } from '@faker-js/faker'

export const generateMockUser = (role = USER_ROLES.CUSTOMER) => {
    return{
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        role: role
    }
}

export const generateMockUsers = (count = 10, role = USER_ROLES.CUSTOMER) => {
    return Array.from({ length: count }, () => generateMockUser(role));
}

