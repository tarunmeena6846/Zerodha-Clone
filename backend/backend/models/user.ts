import mongoose, { Document, Schema } from "mongoose";

export interface user extends Document {
  username: string;
  password: string;
}

const userSchema = new Schema<user>({
  username: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const userModel = mongoose.model<user>("user", userSchema);

export default userModel;
