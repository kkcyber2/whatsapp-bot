<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1Ll-VAih-h04J3Tuyhk6vHj5rPLuvWy9-

## Security Implementation

**⚠️ IMPORTANT:** Your Gemini API key is NOT exposed in the client bundle. It is securely handled by a backend proxy server:

- **Frontend**: Makes requests to a local proxy server (no API key needed)
- **Backend Proxy** (`server/proxy.js`): Holds the API key via `GEMINI_API_KEY` environment variable
- **API Handling**: All Gemini API calls are proxied through the backend

### Architecture:
```
Frontend (Vite + React)
    ↓ (fetch/WebSocket)
Backend Proxy (Express + Node.js) ← API_KEY loaded from .env
    ↓ (uses API key)
Google Gemini API
```

## Supabase Setup (Authentication & Database)

This app uses **Supabase** for user authentication and persistent data storage.

### Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project" and create a project
3. Once created, go to **Settings → API** and copy:
   - **Project URL** (e.g., `https://your-project.supabase.co`)
   - **Anon Public Key** (starts with `eyJ...`)

### Add to Your Environment

1. Edit your `.env` file and add:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

2. **NEVER commit your `.env` file** – it's already in `.gitignore`

### Create Database Tables (Optional)

For basic message and usage tracking, create these tables in Supabase SQL Editor:

```sql
-- Messages table
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id text NOT NULL,
  sender_name text NOT NULL,
  platform text NOT NULL,
  content text NOT NULL,
  sentiment text DEFAULT 'neutral',
  timestamp timestamp DEFAULT now(),
  created_at timestamp DEFAULT now()
);

-- Customer profiles table
CREATE TABLE customer_profiles (
  id text PRIMARY KEY,
  name text NOT NULL,
  email text,
  platform text,
  updated_at timestamp DEFAULT now()
);

-- User usage tracking table
CREATE TABLE user_usage (
  user_id text PRIMARY KEY,
  conversation_count integer DEFAULT 0,
  image_count integer DEFAULT 0,
  video_count integer DEFAULT 0,
  updated_at timestamp DEFAULT now()
);
```

### How It Works

- **Authentication**: Users sign up/login with email & password (Supabase Auth)
- **Protected Routes**: The app shows a login form if no user is authenticated
- **Database Services**: Use `src/services/dbService.ts` to save/retrieve data
  - `saveMessage()`: Store messages
  - `getMessagesForCustomer()`: Retrieve customer messages
  - `updateUsage()`: Track API usage (conversations, images, videos)

## Dark Mode Implementation

This app has **full dark mode support** with automatic persistence and system preference detection.

### Features
- ✅ **Persistent Theme**: User preference saved in localStorage
- ✅ **System Preference Detection**: Respects OS dark mode setting on first visit
- ✅ **Smooth Transitions**: CSS transitions between light and dark modes
- ✅ **Complete Coverage**: All UI components, charts, and pages styled
- ✅ **Accessibility**: WCAG AA compliant color contrast in both modes

### Using Dark Mode

1. **Toggle Theme**: Click the sun/moon icon in the top-right header
2. **Automatic Persistence**: Theme preference saves across sessions
3. **No Flash**: Page load detection prevents white flash in dark mode

### Dark Mode Structure

Theme files are organized under `src/`:
- **`hooks/useTheme.ts`**: React hook for theme state management
- **`components/ThemeToggle.tsx`**: Sun/Moon toggle button component
- **`theme/darkMode.ts`**: Color schemes and Recharts configuration

### For Developers

#### Using the Theme Hook in Components

```typescript
import { useTheme } from './src/hooks/useTheme';

function MyComponent() {
  const { theme, toggleTheme, mounted } = useTheme();
  
  return (
    <>
      <div className="bg-white dark:bg-slate-800">
        Current theme: {theme}
      </div>
      <button onClick={toggleTheme}>Toggle</button>
    </>
  );
}
```

#### Tailwind Dark Classes

All Tailwind utilities support the `dark:` prefix:

```jsx
<div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
  Content changes based on theme
</div>
```

#### Charts with Dark Mode

```typescript
import { getChartTheme } from './src/theme/darkMode';
import { useTheme } from './src/hooks/useTheme';

function MyChart() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const chartTheme = getChartTheme(isDark);
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid {...chartTheme.cartesianGridStyles} />
        <Tooltip contentStyle={chartTheme.tooltipStyle} />
        <Line dataKey="value" stroke={chartTheme.colors[0]} />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

### Documentation

For comprehensive guides on implementing dark mode components, see:
- **[DARK_MODE_GUIDE.md](./DARK_MODE_GUIDE.md)** - User and developer guide
- **[DARK_MODE_REFACTORING_CHECKLIST.md](./DARK_MODE_REFACTORING_CHECKLIST.md)** - Component patterns and best practices

### Testing Dark Mode

1. Toggle theme using the header button
2. Reload the page to verify persistence
3. Check browser DevTools → Application → localStorage for `theme` key
4. Use browser DevTools color-blind simulator to test accessibility

## Run Locally

**Prerequisites:**  Node.js

### Setup Steps:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create a `.env` file with your API keys:**
   ```bash
   cp .env.example .env
   # Edit .env and add:
   # - GEMINI_API_KEY (from Google Cloud)
   # - VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (from Supabase)
   ```
   
   **IMPORTANT:** Never commit `.env` to version control. It's already in `.gitignore`.

3. **Start the backend proxy server** (this must run first):
   ```bash
   npm run proxy
   ```
   
   You should see:
   ```
   Gemini proxy running on http://localhost:3001
     REST: http://localhost:3001/api/gemini
     WebSocket: ws://localhost:3001/ws/gemini-live
   ```
   
   **Keep this terminal open while developing.**

4. **In a new terminal, start the frontend development server:**
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:3000`

5. **Sign up or log in** with your email and password

## What's Proxied

- **REST Endpoint** (`/api/gemini`): For text generation, image generation, video generation
- **WebSocket** (`/ws/gemini-live`): For live audio conversations (real-time bidirectional)

## Available Services

### Auth Service (`src/services/authService.ts`)
- `signInWithEmail(email, password)` - Sign in with credentials
- `signUp(email, password)` - Create new account
- `signOut()` - Logout
- `getCurrentUser()` - Get current authenticated user
- `onAuthStateChange()` - Listen to auth changes
- `getSession()` - Get current session

### Database Service (`src/services/dbService.ts`)
- `saveMessage(message)` - Store a message
- `getMessagesForCustomer(customerId)` - Retrieve messages
- `updateUsage(userId, type)` - Track usage (conversation/image/video)
- `saveCustomerProfile(profile)` - Save or update customer
- `getCustomerProfile(customerId)` - Retrieve customer profile

### AI Service (`src/services/geminiService.ts`)
- `analyzeBusinessPriority(content)` - Classify message priority
- `generateAgentResponse(message, ...)` - Generate AI response
- `generateImage(prompt)` - Generate images
- `textToSpeech(text)` - Convert text to speech (disabled for now)
- `generateVideo(prompt)` - Generate videos (disabled for MVP)

## Production Deployment

Before deploying to production:

### Environment Variables
- Keep `.env` in your deployment environment (never commit to repo)
- Use environment variables from your hosting provider (Vercel, Netlify, etc.)
- Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set

### Proxy Server
- Run the proxy on the same server or private network
- Use the `GEMINI_API_KEY` environment variable
- Optionally add authentication/rate-limiting to proxy endpoints

### Supabase Security
- Enable Row Level Security (RLS) on all tables
- Set up appropriate policies for user data access
- Enable Supabase backups

## Troubleshooting

**"Supabase environment variables not set"**
- Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are in your `.env` file

**"Auth state not updating"**
- Check that Supabase project is active and credentials are correct
- Check browser console for API errors

**Proxy not connecting**
- Ensure `npm run proxy` is running on port 3001
- Check that `http://localhost:3001/api/gemini` is reachable
