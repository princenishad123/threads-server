import { Server } from "socket.io"
import {config} from "dotenv"
config()

import { createServer } from "http";
import express from "express"

const app = express()

const server = createServer(app)

const io = new Server(server, {
    cors: {
        origin:process.env.CLIENT_URL,
    }
})

const userSocketMap = {};

export const getRecieverSocketId = (userId) => {

    return userSocketMap[userId]
}

io.on("connection", (socket) => {
   
    const userId = socket.handshake.query.userId;

      if (userId) userSocketMap[userId] = socket.id

 



    socket.on("disconnect", () => {
       
         delete userSocketMap[userId];
    })
})


export  {server,io,app}