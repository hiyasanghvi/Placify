import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

// ROUTES
import authRoutes from "./routes/auth.js";
import placementRoutes from "./routes/placement.js";
import referralRoutes from "./routes/referrals.js";
import oaRoutes from "./routes/oa.js";
import opportunityRoutes from "./routes/opportunities.js";
import messageRoutes from "./routes/messages.js";
import atsRoutes from "./routes/atsRoutes.js"; // ✅ FIXED IMPORT

dotenv.config();

const app = express(); // ✅ DEFINE FIRST
const server = http.createServer(app);

/* ==============================
   SOCKET.IO SETUP
============================== */
export const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinRoom", (userId) => {
    socket.join(userId);
    console.log("User joined room:", userId);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

/* ==============================
   MIDDLEWARE
============================== */
app.use(cors());
app.use(express.json());

/* ==============================
   DATABASE
============================== */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected ✅"))
  .catch((err) => console.log("MongoDB error ❌", err));

/* ==============================
   ROUTES
============================== */
app.use("/api/auth", authRoutes);
app.use("/api/oa", oaRoutes);
app.use("/api/placements", placementRoutes);
app.use("/api/referrals", referralRoutes);
app.use("/api/opportunities", opportunityRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/ats", atsRoutes); // ✅ CORRECT PLACE

/* ==============================
   HEALTH CHECK
============================== */
app.get("/", (req, res) => {
  res.send("Placify backend is running 🚀");
});

/* ==============================
   START SERVER
============================== */
server.listen(5000, () => {
  console.log("Server running on port 5000 🚀");
});