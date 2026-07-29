# Specification: Authentication — Login (`POST /auth/login`)

## Overview
Handles user authentication, password verification, rate limiting, and token issuance.

## Flow & Logic
1. **Input**: `{ email, password }` parsed and validated via Zod schema (`loginSchema`).
2. **Rate Limiting**: Check Redis for key `login:attempts:{email}`. If attempts >= 5 in 15 minutes, return `429 Too Many Requests`.
3. **User Search & Verification**: Search user by email in `users` table. Verify password hash using `bcrypt`.
4. **Failure**: Increment Redis failed attempt counter. Return `401 Unauthorized` ("Invalid email or password").
5. **Success**: Clear Redis attempt counter.
6. **Token Issuance**:
   - Issue 15-minute Access Token (JWT) with payload `{ sub: userId, org: organizationId, role, jti }`.
   - Issue 7-day Refresh Token (opaque crypto 256-bit string), store SHA-256 hash in `refresh_tokens` table.
7. **Response**:
   - `200 OK` body: `{ user: { id, email, role, organizationId }, accessToken, refreshToken }`.
   - Cookie: `refresh_token` set as `httpOnly`, `Secure=false` (in dev), `SameSite=Lax`, path `/`.
