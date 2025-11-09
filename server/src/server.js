require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth.routes");
const logRoutes = require("./routes/log.routes");
const studentRoutes = require("./routes/student.routes");

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/log", logRoutes);

app.get("/", (req, res) =>
  res.send("College Gate Entry System API Running....")
);

const PORT = process.env.PORT;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
app.listen(PORT, "0.0.0.0", () =>
  console.log(`✅ Server running on http://0.0.0.0:${PORT}`)
);
