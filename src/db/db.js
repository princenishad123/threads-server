import mongoose from "mongoose"

export const connectDB = async() => {
 try {
     const conn = await mongoose.connect(process.env.DATABASE_URL);
     console.log(`database connected ${conn.connection.host}`)
 } catch (error) {
    console.log(`fail to connect database ${error.message}`)
 }

    
} 