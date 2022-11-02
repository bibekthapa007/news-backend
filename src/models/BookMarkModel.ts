import mongoose, { Schema, SchemaTypes } from 'mongoose';

export interface IBookMark extends Document {
  _id: string;
  userId: string;
  postId: string;
}

const BookMarkSchema: Schema = new Schema({
  userId: {
    type: SchemaTypes.ObjectId,
    ref: 'User',
    required: [true, 'BookMark must belong to this user.'],
  },
  postId: {
    type: SchemaTypes.ObjectId,
    ref: 'Post',
    required: [true, 'Bookmark must belong to this post.'],
  },
});

export default mongoose.model<IBookMark>('BookMark', BookMarkSchema);
