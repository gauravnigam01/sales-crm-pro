import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URI);

    console.log(`✅ MongoDB Connected : ${connection.connection.host}`);
    console.log("Database Name:", connection.connection.name);
  } catch (error) {
    console.log("❌ MongoDB Connection Failed");
    console.log(error.message);
    process.exit(1);
  }
};

export default connectDB;