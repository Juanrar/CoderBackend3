import { Router } from 'express';
import { getMockUsers, getMockOrders, createMockUsers, createMockOrders, generateData } from '../controllers/mocks.controller.js';


const router = Router();

router.get('/mockingusers', getMockUsers);
router.get('/mockingorders', getMockOrders);
router.post('/generateMockUsers', createMockUsers);
router.post('/generateMockOrders', createMockOrders);
router.post('/generateData', generateData);

export default router;