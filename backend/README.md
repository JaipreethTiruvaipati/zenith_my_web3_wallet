# Zenith Wallet Backend API

This backend provides secure, RESTful endpoints for HD wallet operations supporting Solana (Ed25519) and Ethereum (secp256k1).

## Running the Backend

```
go run main.go
```

The server runs on `http://localhost:8081` by default.

---

## API Endpoints

### 1. Generate Mnemonic
- **GET** `/api/mnemonic`
- **Response:** `{ "mnemonic": "..." }`

### 2. Derive Solana Address
- **POST** `/api/solana/address`
- **Body:**
```json
{
  "mnemonic": "...",
  "index": 0
}
```
- **Response:** `{ "address": "..." }`

### 3. Derive Ethereum Address
- **POST** `/api/ethereum/address`
- **Body:**
```json
{
  "mnemonic": "...",
  "index": 0
}
```
- **Response:** `{ "address": "..." }`

### 4. Encrypt Wallet (Mnemonic)
- **POST** `/api/encrypt-wallet`
- **Body:**
```json
{
  "mnemonic": "...",
  "password": "..."
}
```
- **Response:** `{ "encrypted": "..." }`

### 5. Decrypt Wallet (Mnemonic)
- **POST** `/api/decrypt-wallet`
- **Body:**
```json
{
  "encrypted": "...",
  "password": "..."
}
```
- **Response:** `{ "mnemonic": "..." }`

### 6. Sign Message (Solana)
- **POST** `/api/solana/sign`
- **Body:**
```json
{
  "mnemonic": "...",
  "index": 0,
  "message": "..."
}
```
- **Response:** `{ "signature": "..." }` (base64)

### 7. Sign Message (Ethereum)
- **POST** `/api/ethereum/sign`
- **Body:**
```json
{
  "mnemonic": "...",
  "index": 0,
  "message": "..."
}
```
- **Response:** `{ "signature": "..." }` (base64)

---

## Notes
- All endpoints return errors in the form `{ "error": "..." }`.
- CORS is enabled for all origins (for development).
- Mnemonic validation and input checks are enforced on all endpoints.

---

## Example Usage (curl)

**Generate Mnemonic:**
```
curl http://localhost:8081/api/mnemonic
```

**Derive Solana Address:**
```
curl -X POST http://localhost:8081/api/solana/address \
  -H "Content-Type: application/json" \
  -d '{"mnemonic":"...","index":0}'
```

**Encrypt Wallet:**
```
curl -X POST http://localhost:8081/api/encrypt-wallet \
  -H "Content-Type: application/json" \
  -d '{"mnemonic":"...","password":"..."}'
``` 