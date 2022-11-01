import mongoose, { Schema, ObjectId, SchemaTypes } from 'mongoose';
import slugify from 'slugify';

export interface IPost extends Document {
  _id: string;
  title: string;
  description: string;
  slug: string;
  isPublished: boolean;
  imageLink?: string;
  author: string;
  category: string;
  tags: string[];
}

const PostSchema: Schema = new Schema(
  {
    title: { type: 'string', required: true },
    description: { type: 'string', required: true },
    slug: { type: 'string', slug: 'title', unique: true },
    isPublished: { type: 'boolean', default: false },
    imageLink: { type: 'string', required: false },
    tags: [String],
    author: {
      type: SchemaTypes.ObjectId,
      ref: 'User',
      required: [true, 'Post must belong to this category.'],
    },
    category: {
      type: SchemaTypes.ObjectId,
      ref: 'Category',
      required: [true, 'Post must belong to this category.'],
    },
  },
  {
    timestamps: true,
  },
);

PostSchema.pre<IPost>('save', function (next) {
  this.slug = slugify(this.title, { lower: true });
  next();
});

export default mongoose.model<IPost>('Post', PostSchema);
