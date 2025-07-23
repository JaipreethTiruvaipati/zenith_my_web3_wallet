package main

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"io"
	"net/http"

	"github.com/blocto/solana-go-sdk/types"
	"github.com/decred/dcrd/dcrec/secp256k1/v4"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/gin-gonic/gin"
	"github.com/tyler-smith/go-bip39"
	"golang.org/x/crypto/ed25519"
)

type DeriveRequest struct {
	Mnemonic string `json:"mnemonic" binding:"required"`
	Index    int    `json:"index"`
}

type EncryptRequest struct {
	Mnemonic string `json:"mnemonic" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type DecryptRequest struct {
	Encrypted string `json:"encrypted" binding:"required"`
	Password  string `json:"password" binding:"required"`
}

type SignRequest struct {
	Mnemonic string `json:"mnemonic" binding:"required"`
	Index    int    `json:"index"`
	Message  string `json:"message" binding:"required"`
}

func encryptAESGCM(plaintext, password string) (string, error) {
	key := sha256.Sum256([]byte(password))
	block, err := aes.NewCipher(key[:])
	if err != nil {
		return "", err
	}
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}
	nonce := make([]byte, gcm.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return "", err
	}
	ciphertext := gcm.Seal(nonce, nonce, []byte(plaintext), nil)
	return base64.StdEncoding.EncodeToString(ciphertext), nil
}

func decryptAESGCM(ciphertextB64, password string) (string, error) {
	key := sha256.Sum256([]byte(password))
	ciphertext, err := base64.StdEncoding.DecodeString(ciphertextB64)
	if err != nil {
		return "", err
	}
	block, err := aes.NewCipher(key[:])
	if err != nil {
		return "", err
	}
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}
	if len(ciphertext) < gcm.NonceSize() {
		return "", err
	}
	nonce := ciphertext[:gcm.NonceSize()]
	ciphertext = ciphertext[gcm.NonceSize():]
	plaintext, err := gcm.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return "", err
	}
	return string(plaintext), nil
}

func main() {
	r := gin.Default()

	// CORS middleware (allow all origins for development)
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE, PATCH")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	r.GET("/api/mnemonic", func(c *gin.Context) {
		entropy, err := bip39.NewEntropy(128)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate entropy: " + err.Error()})
			return
		}
		mnemonic, err := bip39.NewMnemonic(entropy)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate mnemonic: " + err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"mnemonic": mnemonic})
	})

	r.POST("/api/solana/address", func(c *gin.Context) {
		var req DeriveRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if req.Index < 0 {
			req.Index = 0
		}
		if req.Mnemonic == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Mnemonic cannot be empty"})
			return
		}
		if !bip39.IsMnemonicValid(req.Mnemonic) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid mnemonic"})
			return
		}
		seed := bip39.NewSeed(req.Mnemonic, "")
		// Derive using m/44'/501'/index'/0' for Solana
		path := []uint32{44 | 0x80000000, 501 | 0x80000000, uint32(req.Index) | 0x80000000, 0 | 0x80000000}
		key := seed
		for _, p := range path {
			h := sha256.New()
			h.Write(key)
			h.Write([]byte{byte(p >> 24), byte(p >> 16), byte(p >> 8), byte(p)})
			key = h.Sum(nil)
		}
		if len(key) < ed25519.SeedSize {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "derived key too short"})
			return
		}
		key = key[:ed25519.SeedSize]
		acc, _ := types.AccountFromSeed(key)
		c.JSON(http.StatusOK, gin.H{"address": acc.PublicKey.ToBase58()})
	})

	r.POST("/api/ethereum/address", func(c *gin.Context) {
		var req DeriveRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if req.Index < 0 {
			req.Index = 0
		}
		if req.Mnemonic == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Mnemonic cannot be empty"})
			return
		}
		if !bip39.IsMnemonicValid(req.Mnemonic) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid mnemonic"})
			return
		}
		seed := bip39.NewSeed(req.Mnemonic, "")
		// Derive using m/44'/60'/0'/0/index for Ethereum
		path := []uint32{44 | 0x80000000, 60 | 0x80000000, 0 | 0x80000000, 0, uint32(req.Index)}
		key := seed
		for _, p := range path {
			h := sha256.New()
			h.Write(key)
			h.Write([]byte{byte(p >> 24), byte(p >> 16), byte(p >> 8), byte(p)})
			key = h.Sum(nil)
		}
		priv := secp256k1.PrivKeyFromBytes(key)
		ecdsaPriv := priv.ToECDSA()
		address := crypto.PubkeyToAddress(ecdsaPriv.PublicKey).Hex()
		c.JSON(http.StatusOK, gin.H{"address": address})
	})

	r.POST("/api/encrypt-wallet", func(c *gin.Context) {
		var req EncryptRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if req.Mnemonic == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Mnemonic cannot be empty"})
			return
		}
		if !bip39.IsMnemonicValid(req.Mnemonic) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid mnemonic"})
			return
		}
		if req.Password == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Password cannot be empty"})
			return
		}
		encrypted, err := encryptAESGCM(req.Mnemonic, req.Password)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"encrypted": encrypted})
	})

	r.POST("/api/decrypt-wallet", func(c *gin.Context) {
		var req DecryptRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if req.Encrypted == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Encrypted data cannot be empty"})
			return
		}
		if req.Password == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Password cannot be empty"})
			return
		}
		mnemonic, err := decryptAESGCM(req.Encrypted, req.Password)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Decryption failed: " + err.Error()})
			return
		}
		if !bip39.IsMnemonicValid(mnemonic) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Decrypted value is not a valid mnemonic"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"mnemonic": mnemonic})
	})

	r.POST("/api/solana/sign", func(c *gin.Context) {
		var req SignRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if req.Index < 0 {
			req.Index = 0
		}
		if req.Mnemonic == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Mnemonic cannot be empty"})
			return
		}
		if !bip39.IsMnemonicValid(req.Mnemonic) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid mnemonic"})
			return
		}
		if req.Message == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Message cannot be empty"})
			return
		}
		seed := bip39.NewSeed(req.Mnemonic, "")
		path := []uint32{44 | 0x80000000, 501 | 0x80000000, uint32(req.Index) | 0x80000000, 0 | 0x80000000}
		key := seed
		for _, p := range path {
			h := sha256.New()
			h.Write(key)
			h.Write([]byte{byte(p >> 24), byte(p >> 16), byte(p >> 8), byte(p)})
			key = h.Sum(nil)
		}
		if len(key) < ed25519.SeedSize {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "derived key too short"})
			return
		}
		key = key[:ed25519.SeedSize]
		priv := ed25519.NewKeyFromSeed(key)
		sig := ed25519.Sign(priv, []byte(req.Message))
		c.JSON(http.StatusOK, gin.H{"signature": base64.StdEncoding.EncodeToString(sig)})
	})

	r.POST("/api/ethereum/sign", func(c *gin.Context) {
		var req SignRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if req.Index < 0 {
			req.Index = 0
		}
		if req.Mnemonic == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Mnemonic cannot be empty"})
			return
		}
		if !bip39.IsMnemonicValid(req.Mnemonic) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid mnemonic"})
			return
		}
		if req.Message == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Message cannot be empty"})
			return
		}
		seed := bip39.NewSeed(req.Mnemonic, "")
		path := []uint32{44 | 0x80000000, 60 | 0x80000000, 0 | 0x80000000, 0, uint32(req.Index)}
		key := seed
		for _, p := range path {
			h := sha256.New()
			h.Write(key)
			h.Write([]byte{byte(p >> 24), byte(p >> 16), byte(p >> 8), byte(p)})
			key = h.Sum(nil)
		}
		priv := secp256k1.PrivKeyFromBytes(key)
		ecdsaPriv := priv.ToECDSA()
		sig, err := crypto.Sign(crypto.Keccak256([]byte(req.Message)), ecdsaPriv)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"signature": base64.StdEncoding.EncodeToString(sig)})
	})

	r.Run(":8081") // Backend runs on 8081
}
