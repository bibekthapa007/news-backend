import { Router } from 'express';
import postController from '../controllers/postContoller';

const router = Router();

router.route('/').get(postController.getPostList).post(postController.createPost);

router
  .route('/:post_id')
  .get(postController.getPostById)
  .put(postController.updatePost)
  .delete(postController.deletePost);

export default router;
