import mongoose, { Schema } from 'mongoose';
import slugify from 'slugify';

export interface ICategory extends Document {
  _id: string;
  title: string;
  description: string;
  slug: string;
  imageLink?: string;
}

const CategorySchema: Schema = new Schema({
  title: { type: 'string', required: true },
  description: { type: 'string', required: true },
  slug: { type: 'string', slug: 'title', unique: true },
  imageLink: { type: 'string', required: false },
});

CategorySchema.set('toJSON', {
  transform: function (doc, ret, options) {
    delete ret.__v;
  },
});

CategorySchema.pre('save', function (next) {
  if (!(this.isModified('title') || this.isNew)) return next();
  this.slug = `${slugify(this.title, { lower: true })}`;
  next();
});

export default mongoose.model<ICategory>('Category', CategorySchema);
