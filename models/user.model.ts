import mongoose, {Schema, Document} from "mongoose"

export interface IUser extends Document {
  fullName: string;
  email: String;
  password: string; // có thể để là optional nếu đăng nhập bằng fb hoặc gg nhưng trong dự án này chỉ cho đăng nhập bằng email và phải có mật khẩu
  token: string;
  deleted: boolean;
  deletedAt?: Date;
  createdAt?: Date; // auto nhờ có timestamps: true
  updatedAt?: Date // auto nhờ có timestamps: true
}

const userSchema = new mongoose.Schema<IUser> (
  {
    fullName: String,
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true,
      unique: true
    },
    deleted: {
      type: Boolean,
      default: false
    },
    deletedAt: Date
  }, 
  {
    timestamps: true
  }
)

const User = mongoose.model<IUser>("User", userSchema, "users")

export default User