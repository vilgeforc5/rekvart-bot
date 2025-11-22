# Authentication Setup

This project now includes JWT-based authentication to protect the backend and frontend.

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
TELEGRAM_BOT_TOKEN="your_telegram_bot_token_here"

AUTH_LOGIN="admin"
AUTH_PASSWORD="your_secure_password_here"
JWT_SECRET="your_jwt_secret_key_change_this_in_production"
JWT_EXPIRES_IN="7d"

VITE_API_URL="http://localhost:3000"
```

### Required Variables for Auth

- `AUTH_LOGIN`: The login username for authentication (hardcoded)
- `AUTH_PASSWORD`: The password for login (hardcoded)
- `JWT_SECRET`: Secret key for signing JWT tokens (must be a long random string)
- `JWT_EXPIRES_IN`: Token expiration time (default: "7d")
- `VITE_API_URL`: Backend API URL for frontend (no fallback - must be set)

## How It Works

### Backend

1. **Auth Module**: Located in `apps/backend/src/auth/`

   - `auth.controller.ts`: Handles login endpoint at `/auth/login`
   - `auth.service.ts`: Validates credentials and generates JWT tokens
   - `jwt.strategy.ts`: Validates JWT tokens using Passport
   - `jwt-auth.guard.ts`: Global guard (inverted logic - public by default)
   - `protected.decorator.ts`: Decorator to mark routes as protected

2. **Protected Routes**: All routes are **public by default**. Only routes marked with `@Protected()` require authentication:

   - `/command/*` - Bot command management
   - `/api/start-content/*` - Start content management
   - `/portfolio/*` - Portfolio management
   - `/api/dizayn/*` - Design content management
   - `/zamer/*` - Zamer (measurement) configuration
   - `/calculate/*` - Calculate configuration
   - `/consultacya/*` - Consultation configuration

3. **Public Routes** (no authentication required):

   - `/auth/login` - Login endpoint
   - `/health` - Health check endpoint
   - Telegram webhooks - Bot communication
   - All other routes not explicitly marked with `@Protected()`

4. **Global Guard**: JWT authentication is applied globally via `APP_GUARD` in `app.module.ts`, but uses inverted logic (public by default)

### Frontend

1. **Auth Context**: `apps/frontend/src/lib/auth-context.tsx`

   - Manages authentication state
   - Stores JWT token in localStorage
   - Provides login/logout functions

2. **Login Page**: `apps/frontend/src/pages/Login.tsx`

   - Simple login/password form (Russian interface)
   - Redirects to home page on successful login

3. **Protected Routes**: All routes except `/login` require authentication

   - `ProtectedRoute` component wraps authenticated routes
   - Redirects to `/login` if not authenticated

4. **API Client**: `apps/frontend/src/lib/api.ts`
   - Automatically includes JWT token in Authorization header
   - Reads token from localStorage
   - No fallback URL - fails if `VITE_API_URL` is not set

## Usage

1. Create `.env` file with required variables
2. Start backend: `cd apps/backend && pnpm start:dev`
3. Start frontend: `cd apps/frontend && pnpm dev`
4. Navigate to frontend URL
5. You'll be redirected to login page
6. Enter credentials from `.env` file
7. Access protected routes after successful login

## Security Notes

- JWT tokens are stored in localStorage (consider httpOnly cookies for production)
- Tokens expire based on `JWT_EXPIRES_IN` setting
- All backend routes except `/health` and `/auth/login` require authentication
- Frontend automatically redirects to login when token is missing or invalid
