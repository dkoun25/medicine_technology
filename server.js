import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static("dist"));

app.get("*", (req, res) => {
  res.sendFile("dist/index.html", { root: process.cwd() });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("Web running on port", PORT);
});
