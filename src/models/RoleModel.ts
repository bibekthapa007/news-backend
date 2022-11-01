import mongoose, { Schema } from 'mongoose';

export interface IRole extends Document {
  _id: string;
  title: string;
}

const RoleSchema: Schema = new Schema({
  title: { type: 'string', unique: true, required: true },
});

export default mongoose.model<IRole>('Role', RoleSchema);
