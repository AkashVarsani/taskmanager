# TaskFlow - Team Task Manager

A full-stack team task management application built with Next.js 16, PostgreSQL, Prisma, and NextAuth.

## Features

### 🔐 Authentication & Authorization
- Email/password authentication with NextAuth v5
- Email verification with OTP (6-digit codes)
- Password reset flow with email OTP
- Role-based access control (Admin/Member)
- Session management with JWT

### 📋 Project Management
- Create, edit, archive, and delete projects
- Project color customization
- Project status tracking (Active, Archived, Completed)
- Team member management per project
- Role-based permissions (Owner, Admin, Member)

### ✅ Task Management
- Kanban board view with drag-and-drop
- Task creation with rich details
- Task assignment to team members
- Priority levels (Low, Medium, High, Urgent)
- Status tracking (To Do, In Progress, In Review, Done)
- Due dates with overdue indicators
- Task labels/tags
- Task comments and discussions
- Task detail view with full history

### 👥 Team Collaboration
- Email invitations to projects
- Secure invitation links with expiration
- Member role management
- Real-time notifications
- Activity logging

### 📊 Dashboard & Analytics
- Personal dashboard with stats
- Task overview by status
- Overdue task tracking
- Completed tasks this week
- Upcoming tasks (due in 7 days)
- Recent activity feed

### 🔔 Notifications
- In-app notification center
- Email notifications for:
  - Task assignments
  - Project invitations
  - Task comments
  - Task updates
- Unread notification badges

### 👤 User Profile
- Profile editing
- Password change
- Avatar support
- Account information

### 🛡️ Admin Panel
- User management
- Role assignment
- User statistics
- Search and pagination

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** NextAuth v5
- **Email:** Resend
- **Styling:** Tailwind CSS v4
- **Validation:** Zod
- **UI Components:** Custom components with inline styles
- **Notifications:** Sonner (toast notifications)
- **TypeScript:** Full type safety

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Resend API key (for emails)

## Setup Instructions

### 1. Clone and Install

```bash
cd taskmanager
npm install
```

### 2. Database Setup

Create a PostgreSQL database (you can use [Neon](https://neon.tech), [Supabase](https://supabase.com), or local PostgreSQL).

### 3. Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"

# NextAuth
AUTH_SECRET="your-secret-key-generate-with-openssl-rand-base64-32"
AUTH_URL="http://localhost:3000"
AUTH_TRUST_HOST=true

# Resend (Email)
RESEND_API_KEY="re_your_resend_api_key"
RESEND_FROM="TaskFlow <noreply@yourdomain.com>"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

**Generate AUTH_SECRET:**
```bash
openssl rand -base64 32
```

**Get Resend API Key:**
1. Sign up at [resend.com](https://resend.com)
2. Verify your domain or use `onboarding@resend.dev` for testing
3. Create an API key

### 4. Database Migration

```bash
# Push schema to database
npm run db:push

# Or create a migration
npm run db:migrate
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Database Schema

The application uses the following main models:

- **User** - User accounts with authentication
- **OTP** - One-time passwords for verification
- **Project** - Projects with team collaboration
- **ProjectMember** - Project membership with roles
- **Task** - Tasks with assignments and tracking
- **Comment** - Task comments
- **Notification** - In-app notifications
- **ActivityLog** - Activity tracking
- **Invitation** - Project invitations

## Project Structure

```
taskmanager/
├── app/
│   ├── (app)/              # Protected app routes
│   │   ├── dashboard/      # Dashboard page
│   │   ├── projects/       # Projects and tasks
│   │   ├── my-tasks/       # User's tasks
│   │   ├── notifications/  # Notifications
│   │   ├── profile/        # User profile
│   │   ├── admin/          # Admin panel
│   │   ├── layout.tsx      # App shell with sidebar
│   │   └── AppShell.tsx    # Navigation component
│   ├── api/                # API routes
│   │   ├── auth/           # Auth endpoints
│   │   ├── projects/       # Project endpoints
│   │   ├── dashboard/      # Dashboard data
│   │   ├── notifications/  # Notifications
│   │   ├── user/           # User endpoints
│   │   ├── admin/          # Admin endpoints
│   │   └── invite/         # Invitation handling
│   ├── login/              # Login page
│   ├── register/           # Registration page
│   ├── verify/             # Email verification
│   ├── forgot-password/    # Password reset request
│   ├── reset-password/     # Password reset
│   ├── invite/             # Invitation acceptance
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Landing page
│   └── globals.css         # Global styles
├── lib/
│   ├── auth.ts             # NextAuth configuration
│   ├── db.ts               # Prisma client
│   ├── hash.ts             # Password hashing
│   ├── email/              # Email utilities
│   │   ├── send.ts         # Email sender
│   │   └── templates/      # Email templates
│   └── otp/                # OTP utilities
├── modules/
│   └── auth/               # Auth module
│       ├── auth.schema.ts      # Zod schemas
│       ├── auth.service.ts     # Business logic
│       ├── auth.repository.ts  # Database queries
│       └── auth.controller.ts  # Request handlers
├── prisma/
│   └── schema.prisma       # Database schema
├── middleware.ts           # Auth middleware
└── package.json
```

## API Routes

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify` - Verify email with OTP
- `POST /api/auth/resend-otp` - Resend verification OTP
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with OTP

### Projects
- `GET /api/projects` - List user's projects
- `POST /api/projects` - Create project
- `GET /api/projects/[id]` - Get project details
- `PATCH /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Delete project
- `POST /api/projects/[id]/invite` - Invite member
- `GET /api/projects/[id]/members` - List members
- `PATCH /api/projects/[id]/members` - Update member role
- `DELETE /api/projects/[id]/members` - Remove member

### Tasks
- `GET /api/projects/[id]/tasks` - List tasks
- `POST /api/projects/[id]/tasks` - Create task
- `GET /api/projects/[id]/tasks/[taskId]` - Get task
- `PATCH /api/projects/[id]/tasks/[taskId]` - Update task
- `DELETE /api/projects/[id]/tasks/[taskId]` - Delete task
- `POST /api/projects/[id]/tasks/[taskId]/comments` - Add comment
- `DELETE /api/projects/[id]/tasks/[taskId]/comments` - Delete comment

### Other
- `GET /api/dashboard` - Dashboard data
- `GET /api/notifications` - List notifications
- `PATCH /api/notifications` - Mark as read
- `GET /api/user/profile` - Get profile
- `PATCH /api/user/profile` - Update profile
- `POST /api/user/change-password` - Change password
- `GET /api/admin/users` - List users (admin only)
- `PATCH /api/admin/users` - Update user role (admin only)

## Deployment

### Railway (Recommended)

1. **Create Railway Account**
   - Sign up at [railway.app](https://railway.app)

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your repository

3. **Add PostgreSQL**
   - Click "New" → "Database" → "PostgreSQL"
   - Railway will automatically set `DATABASE_URL`

4. **Set Environment Variables**
   - Go to your service → Variables
   - Add all variables from `.env` (except `DATABASE_URL`)
   - Set `NODE_ENV=production`
   - Set `NEXT_PUBLIC_APP_URL` to your Railway domain

5. **Deploy**
   - Railway will automatically deploy on push
   - Run migrations: `npm run db:push` in Railway CLI

### Vercel + Neon

1. **Database (Neon)**
   - Create database at [neon.tech](https://neon.tech)
   - Copy connection string

2. **Deploy (Vercel)**
   - Push to GitHub
   - Import to Vercel
   - Add environment variables
   - Deploy

3. **Run Migrations**
   ```bash
   npx prisma db push
   ```

## Features Checklist

- ✅ Authentication (Signup/Login)
- ✅ Email verification with OTP
- ✅ Password reset flow
- ✅ Project & team management
- ✅ Task creation, assignment & status tracking
- ✅ Kanban board view
- ✅ Dashboard with stats
- ✅ Role-based access control (Admin/Member)
- ✅ Email notifications (Resend)
- ✅ In-app notifications
- ✅ Task comments
- ✅ Project invitations
- ✅ User profile management
- ✅ Admin panel
- ✅ Activity logging
- ✅ Overdue task tracking
- ✅ Task labels
- ✅ Priority levels
- ✅ Due dates

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
