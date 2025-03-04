# BEWD-CA4
## Authentication System with Refresh Token mechanism
### command to run file: `node server.js`
### 1. POST/auth:
- url: http://localhost:3000/auth
- body: {"username":" Rishitha", "password":"Rishi123"}
- If user does not exit, it will create a new user and hash the password
- If user exists, it will compare the existing password with the password entered
- Finally it will create accessToken with expiry of 15 minutes and refreshToken
- Both the tokens are sent in httpOnly cookies
- If successful, it sends the message: `Authenticated`

### 2. GET/refresh-token:
- url: http://localhost:3000/refresh-token
- It first checks if refreshToken is present
- If yes, then it creates a new accessToken with a httpOnly cookie and return the message: `Successful`

