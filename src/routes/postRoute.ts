import { checkJwt } from 'src/middlewares/jwt';
import { Router } from 'express';
import postController from '../controllers/postContoller';

const router = Router();

router.route('/').get(postController.getPostList).post(checkJwt, postController.createPost);

router
  .route('/:post_id')
  .get(postController.getPostById)
  .put(checkJwt, postController.updatePost)
  .delete(checkJwt, postController.deletePost);

export default router;
