import { Router } from 'express';
import multer from 'multer';
import categoryController from 'src/controllers/categoryController';

const router = Router();

router.route('/').get(categoryController.getCategoryList).post(categoryController.createCategory);
router.post('/create', categoryController.createCategory);

router
  .route('/:category_id')
  .get(categoryController.getCategoryById)
  .put(categoryController.updateCategory)
  .delete(categoryController.deleteCategory);

export default router;
