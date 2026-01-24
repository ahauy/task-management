import mongoose from "mongoose";

export const connect = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGOOSE_URL!) // !: cam kết process.env.MONGOOSE_URL là có giá trị
    console.log("Success connect !!")
  } catch (e) {
    console.log("Error connect !!")
    console.log(e)
  }
}