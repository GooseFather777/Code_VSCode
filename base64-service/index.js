const express = require("express");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Serve the HTML form
app.use(express.static(path.join(__dirname, "public")));

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const ALLOWED_ENCODINGS = new Set(["utf8", "utf16le", "latin1", "ascii"]);
const ALLOWED_OUTPUTS = new Set(["base64", "base64url", "hex", "url"]);
const ALLOWED_HASHES = new Set(["sha256", "sha1", "md5"]);
const ALLOWED_CIPHERS = new Set(["aes-256-gcm"]);

// Expects JSON body:
// {
//   "login": "...",
//   "password": "...",
//   "encoding": "utf8",
//   "mode": "encode" | "hash" | "encrypt",
//   "output": "base64" | "base64url" | "hex" | "url",
//   "hash": "sha256" | "sha1" | "md5",
//   "cipher": "aes-256-gcm",
//   "passphrase": "...",
//   "salt": "base64",
//   "iv": "base64"
// }
app.post("/encode", (req, res) => {
  const {
    login,
    password,
    encoding,
    mode,
    output,
    hash,
    cipher,
    passphrase,
    salt,
    iv
  } = req.body || {};

  if (typeof login !== "string" || typeof password !== "string") {
    return res.status(400).json({
      error: "Both 'login' and 'password' must be strings."
    });
  }

  const enc = typeof encoding === "string" ? encoding : "utf8";
  if (!ALLOWED_ENCODINGS.has(enc)) {
    return res.status(400).json({
      error: `Unsupported encoding. Use one of: ${Array.from(ALLOWED_ENCODINGS).join(", ")}.`
    });
  }

  const raw = `${login}:${password}`;
  const selectedMode = typeof mode === "string" ? mode : "encode";

  if (selectedMode === "encode") {
    const out = typeof output === "string" ? output : "base64";
    if (!ALLOWED_OUTPUTS.has(out)) {
      return res.status(400).json({
        error: `Unsupported output. Use one of: ${Array.from(ALLOWED_OUTPUTS).join(", ")}.`
      });
    }

    let result;
    if (out === "url") {
      result = encodeURIComponent(raw);
    } else {
      result = Buffer.from(raw, enc).toString(out);
    }

    return res.json({ result, mode: "encode", output: out, encoding: enc });
  }

  if (selectedMode === "hash") {
    const algo = typeof hash === "string" ? hash : "sha256";
    if (!ALLOWED_HASHES.has(algo)) {
      return res.status(400).json({
        error: `Unsupported hash. Use one of: ${Array.from(ALLOWED_HASHES).join(", ")}.`
      });
    }

    const result = crypto.createHash(algo).update(raw, enc).digest("hex");
    return res.json({ result, mode: "hash", hash: algo, encoding: enc });
  }

  if (selectedMode === "encrypt") {
    const algo = typeof cipher === "string" ? cipher : "aes-256-gcm";
    if (!ALLOWED_CIPHERS.has(algo)) {
      return res.status(400).json({
        error: `Unsupported cipher. Use one of: ${Array.from(ALLOWED_CIPHERS).join(", ")}.`
      });
    }

    if (typeof passphrase !== "string" || passphrase.length < 4) {
      return res.status(400).json({
        error: "Passphrase is required for encryption (min 4 chars)."
      });
    }

    const saltBuf = salt ? Buffer.from(salt, "base64") : crypto.randomBytes(16);
    const ivBuf = iv ? Buffer.from(iv, "base64") : crypto.randomBytes(12);
    const key = crypto.scryptSync(passphrase, saltBuf, 32);

    const cipherInstance = crypto.createCipheriv(algo, key, ivBuf);
    const ciphertext = Buffer.concat([
      cipherInstance.update(raw, enc),
      cipherInstance.final()
    ]);
    const tag = cipherInstance.getAuthTag();

    return res.json({
      result: ciphertext.toString("base64"),
      mode: "encrypt",
      cipher: algo,
      encoding: enc,
      iv: ivBuf.toString("base64"),
      salt: saltBuf.toString("base64"),
      tag: tag.toString("base64")
    });
  }

  return res.status(400).json({
    error: "Unsupported mode. Use one of: encode, hash, encrypt."
  });
});

app.listen(PORT, () => {
  console.log(`Base64 service listening on port ${PORT}`);
});
