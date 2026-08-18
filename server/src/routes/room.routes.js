import { Router } from 'express';
import { createRoom, getRoomByCode, joinRoom } from '../controllers/room.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createRoomSchema, joinRoomSchema } from '../validators/room.validator.js';

const router = Router();

router.post('/', authenticate, validate(createRoomSchema), createRoom);
router.get('/:code', authenticate, validate(joinRoomSchema, 'params'), getRoomByCode);
router.post('/:code/join', authenticate, validate(joinRoomSchema, 'params'), joinRoom);

export default router;
