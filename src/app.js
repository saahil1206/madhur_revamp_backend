const express = require("express");
const cors = require("cors");
const { registerModuleRoutes } = require("./modules");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

registerModuleRoutes(app);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

module.exports = app;
