# Base64 Service

Small Node.js web service that returns different transformations for a given login/password pair.

## Run

1. Install deps:
   npm install

2. Start:
   npm start

## Endpoints

- GET /health
  Returns `{ "status": "ok" }`.

- POST /encode
  Body:
  ```json
  {
    "login": "user",
    "password": "secret",
    "encoding": "utf8",
    "mode": "encode",
    "output": "base64"
  }
  ```

  Modes:
  - `encode`: output in `base64`, `base64url`, `hex`, or `url`.
  - `hash`: `sha256`, `sha1`, `md5` (hex output).
  - `encrypt`: `aes-256-gcm` (base64 ciphertext + iv/salt/tag).

  Examples:
  ```json
  { "login": "user", "password": "secret", "mode": "hash", "hash": "sha256" }
  ```
  ```json
  { "login": "user", "password": "secret", "mode": "encrypt", "passphrase": "topsecret" }
  ```

## Example

```bash
curl -X POST http://localhost:3000/encode \
  -H "Content-Type: application/json" \
  -d '{"login":"user","password":"secret","mode":"encode","output":"base64"}'
```
