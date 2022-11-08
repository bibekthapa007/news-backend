import { checkJwt } from 'src/middlewares/jwt';
import { Router } from 'express';
import postController from '../controllers/postContoller';

const router = Router();

router.route('/').get(postController.getPostList).post(checkJwt, postController.createPost);

router.route('/relevent').get(postController.getRelaventPostList);
router.route('/user/relevent').get(checkJwt, postController.getRelaventPostList);

router
  .route('/:postId')
  .get(postController.getPostById)
  .put(checkJwt, postController.updatePost)
  .delete(checkJwt, postController.deletePost);

router.route('/category/:categoryId').get(postController.getPostListByCategory);

export default router;
