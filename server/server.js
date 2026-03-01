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
import atsRoutes from "./routes/atsRoutes.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

/* ==============================
   CORS CONFIG (FIXED)
============================== */

const allowedOrigins = [
  "http://localhost:5173",
  "https://placify-jade.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

/* ==============================
   SOCKET.IO SETUP (FIXED)
============================== */

export const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
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
app.use("/api/ats", atsRoutes);

/* ==============================
   HEALTH CHECK
============================== */

app.get("/", (req, res) => {
  res.send("Placify backend is running 🚀");
});

/* ==============================
   START SERVER
============================== */

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});
