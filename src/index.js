import express from "express"
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from "cookie-parser"
import { connectDB } from "./db/db.js"
import router from "./routes/auth.route.js"
import postRouter from "./routes/post.route.js"
// import postRouter from "./routes/post.route.js"

import { server, io, app } from "./lib/socket.js"

dotenv.config()


// configration
const PORT = process.env.PORT || 3001

app.use(cors({
       origin: process.env.CLIENT_URL,
    credentials:true
}))
app.use(express.json({ limit: '10mb' })); // Increase JSON payload limit
app.use(express.urlencoded({ limit: '10mb', extended: true }))
app.use(cookieParser())
app.use(express.json())

// routers
app.use("/api/v1", router)
app.use('/api/v1',postRouter)


server.listen(PORT, () => {
    console.log(`server running on Port ${PORT}`)
    connectDB()
})


