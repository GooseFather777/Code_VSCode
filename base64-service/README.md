# Base64 Service

Small Node.js web service that returns base64 for a given login/password pair.

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
  { "login": "user", "password": "secret" }
  ```
  Response:
  ```json
  { "base64": "dXNlcjpzZWNyZXQ=" }
  ```

## Example

```bash
curl -X POST http://localhost:3000/encode \
  -H "Content-Type: application/json" \
  -d '{"login":"user","password":"secret"}'
```
