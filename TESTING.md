# Testing Guide for FindmyJam Messaging & Connect Flow

## Setup Instructions

### 1. Apply Database Migrations

Run these SQL migrations in your Supabase project (in order):

1. **`supabase/migrations/001_create_connections_table.sql`** - Creates connections table
2. **`supabase/migrations/002_create_messages_table.sql`** - Creates messages table  
3. **`supabase/migrations/003_create_conversations_view.sql`** - Creates conversation function
4. **`supabase/migrations/004_sample_profiles.sql`** - Adds sample profiles for testing

### 2. Start Development Server

```bash
npm install
npm run dev
```

App will be running at `http://localhost:5173`

## Testing Features

### A. Google OAuth Login

1. Go to `/auth`
2. Click **"Continue with Google"**
3. Complete OAuth flow with your Google account
4. First-time users will be redirected to `/profile-setup`
5. Fill out profile form (name, role, genres)
6. Get redirected to `/discover`

### B. Sample Profiles & Data

The sample data includes:
- **8 sample profiles** with different genres and roles
- **Pre-existing connections** between some profiles
- **Sample messages** between connected users

### C. Connection Flow

**Send Requests:**
1. Browse musicians on `/discover` 
2. Click **"Connect"** on any profile
3. Button changes to **"Request Sent"**

**Manage Requests:**
1. Go to `/connections`
2. View **"Requests"** tab for incoming requests
3. **Accept/Decline** requests
4. View **"Connected"** tab for accepted connections

### D. Messaging Flow

**Start Conversations:**
1. In `/connections` → **"Connected"** tab → Click **"Message"**
2. Or in `/discover` → Click **"Message"** on connected users

**Chat Interface:**
1. `/messages` shows conversation list on left
2. Click any conversation to open chat thread
3. Send messages in real-time
4. Messages show timestamps and read status

### E. Navigation Flow

- **`/`** - Landing page
- **`/discover`** - Browse musicians, send connections
- **`/connections`** - Manage friend requests  
- **`/messages`** - Chat with connected musicians
- **`/auth`** - Google OAuth + email/password login
- **`/profile-setup`** - Complete profile for new users

## Key Features Working

✅ **Google OAuth Integration** - One-click login with profile auto-creation  
✅ **Connection Requests** - Send, accept, decline friend requests  
✅ **Real-time Messaging** - Chat between connected users only  
✅ **Profile Management** - Complete musician profiles with genres/roles  
✅ **Sample Data** - Pre-populated profiles for immediate testing  
✅ **Security** - RLS policies protect user data  
✅ **Responsive UI** - Works on desktop and mobile  

## Test Scenarios

### 1. New Google User Journey
1. Google login → Profile setup → Discover → Send connection → Chat

### 2. Multi-User Testing  
1. Create 2+ Google accounts
2. Test connection requests between them
3. Test messaging back and forth

### 3. Sample Data Testing
1. Login with Google account
2. Browse the 8 sample profiles
3. Try connecting to sample profiles (will show as "Request Sent")
4. View existing sample conversations in `/messages`

## Troubleshooting

- **Google OAuth not working?** Check Supabase Auth settings
- **Profiles not loading?** Ensure migrations were applied
- **Messages not sending?** Check that users are connected first
- **Sample data missing?** Run migration 004_sample_profiles.sql

The messaging and connection system is now fully functional with Google OAuth integration!