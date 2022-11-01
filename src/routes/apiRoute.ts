import { Router } from 'express';
import { checkJwt } from 'src/middlewares/jwt';
import AuthRoute from 'src/routes/authRoute';
import CategoryRoute from 'src/routes/categoryRoute';
import PostRoute from 'src/routes/postRoute';

const router = Router();

router.use('/auth', AuthRoute);
router.use('/category', CategoryRoute);
router.use(checkJwt);
router.use('/post', PostRoute);

router.get('/', (req, res) => res.status(200).send('<h1>Sojo News App Api</h1>'));

router.get('*', (req, res) => {
  return res.status(404).send({ message: 'api not found.' });
});

export default router;
