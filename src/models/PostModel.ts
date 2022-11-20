import { number } from 'joi';
import mongoose, { Schema, SchemaTypes } from 'mongoose';
import slugify from 'slugify';

export interface IPost extends Document {
  _id: string;
  title: string;
  description: string;
  slug: string;
  isPublished: boolean;
  isSensitive: boolean;
  imageLink?: string;
  author: string;
  categories: string[];
  tags: string[];
}

const PostSchema: Schema = new Schema(
  {
    title: { type: 'string', required: true },
    description: { type: 'string', required: true },
    slug: { type: 'string', slug: 'title', unique: true },
    isPublished: { type: 'boolean', default: false },
    isSensitive: { type: 'boolean', default: false },
    imageLink: { type: 'string', required: false },
    link: { type: 'string', required: false },
    linklabel: { type: 'string', required: false },
    views: { type: 'number', default: 0 },
    tags: [String],
    author: {
      type: SchemaTypes.ObjectId,
      ref: 'User',
      required: [true, 'Post must belong to this category.'],
    },
    categories: [
      {
        type: SchemaTypes.ObjectId,
        ref: 'Category',
        required: [true, 'At least one category must belong to post.'],
      },
    ],
  },
  {
    timestamps: true,
  },
);

PostSchema.index({ categories: 1 });
PostSchema.index({ title: 'text' });
PostSchema.index({ description: 'text' });

PostSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    delete ret.__v;
  },
});

PostSchema.pre('save', function (next) {
  if (!(this.isModified('title') || this.isNew)) return next();
  this.slug = `${slugify(this.title, { lower: true })}-${Date.now()}`;
  next();
});

export default mongoose.model<IPost>('Post', PostSchema);
