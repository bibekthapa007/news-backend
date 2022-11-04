import mongoose, { Schema } from 'mongoose';

export interface ICategory extends Document {
  _id: string;
  title: string;
  description: string;
  imageLink?: string;
}

const CategorySchema: Schema = new Schema({
  title: { type: 'string', required: true },
  description: { type: 'string', required: true },
  imageLink: { type: 'string', required: false },
});

export default mongoose.model<ICategory>('Category', CategorySchema);
