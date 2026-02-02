import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, "web-build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "web-build", "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("Web running on port", PORT);
});
