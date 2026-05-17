const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cron = require("node-cron");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const usersRoutes = require("./routes/users.routes");
const sitesRoutes = require("./routes/sites.routes");
const roomsRoutes = require("./routes/rooms.routes");
const accessRoutes = require("./routes/access.routes");
const sensorsRoutes = require("./routes/sensors.routes");
const equipmentRoutes = require("./routes/equipment.routes");
const incidentsRoutes = require("./routes/incidents.routes");
const eolAlertRoutes = require("./routes/eolAlert.routes");
const chatbotRoutes = require("./routes/chatbot.route");
const dashboardRoutes = require("./routes/dashboard.routes");

const checkEndOfLife = require("./utils/eolChecker");

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.set("io", io);

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/sites", sitesRoutes);
app.use("/api/rooms", roomsRoutes);
app.use("/api/access", accessRoutes);
app.use("/api/sensors", sensorsRoutes);
app.use("/api/equipments", equipmentRoutes);
app.use("/api/incidents", incidentsRoutes);
app.use("/api/eol-alerts", eolAlertRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.get("/api/run-eol-check", async (req, res) => {
  await checkEndOfLife();
  res.json({ message: "✅ EOL check terminé" });
});

app.get("/", (req, res) => {
  res.send("Server Room API Running 🚀");
});

io.on("connection", (socket) => {
  console.log("🔌 Client connecté :", socket.id);
  socket.on("disconnect", () => {
    console.log("❌ Client déconnecté :", socket.id);
  });
});

cron.schedule("0 8 * * *", () => {
  console.log("⏰ Vérification EOL des équipements...");
  checkEndOfLife();
});

server.listen(5000, () => {
  console.log("✅ Server running on port 5000");
});