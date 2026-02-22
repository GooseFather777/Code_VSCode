const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Serve the HTML form
app.use(express.static(path.join(__dirname, "public")));

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Expects JSON body: { "login": "...", "password": "..." }
app.post("/encode", (req, res) => {
  const { login, password } = req.body || {};

  if (typeof login !== "string" || typeof password !== "string") {
    return res.status(400).json({
      error: "Both 'login' and 'password' must be strings."
    });
  }

  const raw = `${login}:${password}`;
  const base64 = Buffer.from(raw, "utf8").toString("base64");

  res.json({ base64 });
});

app.listen(PORT, () => {
  console.log(`Base64 service listening on port ${PORT}`);
});
