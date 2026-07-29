# Specification: Authentication — Refresh Token Rotation (`POST /auth/refresh`)

## Overview
Issues new access and refresh tokens using a valid refresh token cookie or JSON body fallback (for cross-origin/incognito resilience).

## Flow & Logic
1. **Input**: Extract `refresh_token` from JSON body (`req.body.refreshToken`) OR `httpOnly` cookie (`req.cookies.refresh_token`).
2. **Hash Lookup**: Calculate SHA-256 hash of token and query `refresh_tokens` table.
3. **Validation**: Must satisfy `revoked_at IS NULL` AND `expires_at > NOW()`.
4. **Token Rotation**:
   - Set `revoked_at = NOW()` on the old refresh token.
   - Issue a brand new 7-day refresh token and store its SHA-256 hash.
   - Issue a new 15-minute access token.
5. **Response**: `200 OK` with `{ accessToken, refreshToken }` in body AND updated `refresh_token` in `httpOnly` cookie.
6. **Failure**: If token is invalid, expired, or reused → return `401 Unauthorized`, clear cookie, and include debug info.
