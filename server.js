import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { app as apiApp } from "./app.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 8080;
const server = express();

server.use("/api", apiApp);

server.use(express.static(path.join(__dirname, "calendarmeet-app/dist")));

server.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "calendarmeet-app/dist/index.html"));
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
