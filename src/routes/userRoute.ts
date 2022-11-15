import { checkJwt } from 'src/middlewares/jwt';
import { Router } from 'express';
import userController from 'src/controllers/userController';

const router = Router();

router.route('/').put(checkJwt, userController.updateUser);

export default router;
