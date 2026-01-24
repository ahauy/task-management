import mongoose from "mongoose"

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Vui lòng nhập tiêu đề công việc'], // Bắt buộc phải có
      trim: true, // Tự động cắt khoảng trắng thừa ở đầu/cuối
      maxLength: 255 // Giới hạn độ dài nếu cần
    },
    status: {
      type: String,
      enum: ['initial', 'doing', 'completed', 'pending', 'deleted'], // Chỉ cho phép các giá trị này
      default: 'initial' // Mặc định là 'initial' nếu không truyền vào
    },
    content: {
      type: String,
      trim: true
    },
    timeStart: {
      type: Date
    },
    timeFinish: {
      type: Date
    },
    deleted: {
      type: Boolean,
      default: false // Mặc định là chưa xóa
    }
    // Lưu ý: createdAt và updatedAt sẽ được tự động tạo nhờ option timestamps bên dưới
  },
  {
    timestamps: true, // Tự động tạo 2 trường: createdAt và updatedAt
  }
)

const Task = mongoose.model("Task", taskSchema, "tasks")

export default Task