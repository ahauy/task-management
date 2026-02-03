import mongoose, { Schema } from "mongoose";

const refeshTokenSchema = new mongoose.Schema(
  {
    // chủ sử hưu chuỗi refesh-token này
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // token
    token: {
      type: String,
      required: true,
    },
    // thời gian hết hạn
    expires: {
      type: Date,
      required: true,
    },
    // 4. Ngày tạo và IP người tạo (để Audit/Bảo mật)
    created: {
      type: Date,
      default: Date.now,
    },
    createdByIp: {
      type: String, // Lưu IP để biết user đăng nhập từ đâu
    },

    // 5. Xử lý thu hồi (Revoke)
    revoked: {
      type: Date,
      default: null, // Nếu có ngày giờ nghĩa là đã bị thu hồi
    },
    revokedByIp: {
      type: String,
    },

    // 6. Token Rotation (Quan trọng để chống trộm)
    // Khi xoay vòng, token cũ sẽ trỏ tới token mới thay thế nó
    replacedByToken: {
      type: String,
    },
  },
  {
    timestamps: true, // Tự động tạo 2 trường: createdAt và updatedAt
  }
);

const RefeshToken = mongoose.model(
  "RefeshToken",
  refeshTokenSchema,
  "refesh-tokens"
);

export default RefeshToken;
