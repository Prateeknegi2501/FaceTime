import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import { createServer } from "node:http";

import { Server } from "socket.io";

import cors from "cors";

import { connectToSocket } from "./controllers/SocketManager.js";

import userRoutes from "./routes/users.routes.js";

const url = process.env.MONGO_URL;
const app = express();
const server = createServer(app);
const io = connectToSocket(server);

app.set("port", process.env.PORT || 8000);

app.use(cors());
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ extended: true, limit: "40kb" }));

app.use("/api/v1/users",userRoutes)

const start = async () => {
  const connectionDB = await mongoose.connect(url);
  console.log(`MONGO connected DB HOST ${connectionDB.connection.host}`);

  server.listen(app.get("port"), () => {
    console.log(`App is listening to port 8000`);
  });
};
start();
