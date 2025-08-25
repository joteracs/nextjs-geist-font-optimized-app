# Educational Platform - Deployment Guide

## Render.com Deployment

This educational platform is configured for easy deployment on Render.com with PostgreSQL database.

### Prerequisites

1. GitHub account with this repository
2. Render.com account (free tier available)

### Deployment Steps

#### 1. Database Setup
1. Go to [Render.com Dashboard](https://dashboard.render.com/)
2. Click "New +" → "PostgreSQL"
3. Configure:
   - Name: `educational-platform-db`
   - Database: `educational_platform`
   - User: `educational_platform_user`
   - Region: Choose closest to your users
   - Plan: Free (or paid for production)
4. Click "Create Database"
5. Copy the "External Database URL" for later use

#### 2. Web Service Setup
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - Name: `educational-platform`
   - Environment: `Node`
   - Region: Same as database
   - Branch: `main`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Plan: Free (or paid for production)

#### 3. Environment Variables
Add these environment variables in Render:

```
NODE_ENV=production
DATABASE_URL=[Your PostgreSQL External Database URL from step 1]
NEXTAUTH_URL=[Your Render app URL, e.g., https://educational-platform.onrender.com]
NEXTAUTH_SECRET=[Generate a random 32-character string]
```

#### 4. Deploy
1. Click "Create Web Service"
2. Render will automatically build and deploy your application
3. The build process will:
   - Install dependencies
   - Generate Prisma client
   - Push database schema
   - Build Next.js application
   - Start the server

### Post-Deployment

#### Seed the Database
After successful deployment, you can seed the database with initial data:

1. Go to your Render service dashboard
2. Open the "Shell" tab
3. Run: `npm run db:seed`

This will create:
- Admin user: `admin@example.com` / `admin123`
- Regular user: `user@example.com` / `user123`
- Sample questions for testing

### Features

✅ **Authentication System**
- Login with email/username and password
- Role-based access (Admin/Common User)
- Single device login restriction
- 10-minute session timeout

✅ **User Dashboard**
- Statistics tracking (questions answered, accuracy rate)
- Question solving interface
- Flashcard review system
- Welcome message for new users

✅ **Admin Features**
- User management (create, edit, delete users)
- Question management (CRUD operations)
- Role assignment
- User activity monitoring

✅ **Technical Features**
- Next.js 15 with App Router
- PostgreSQL database with Prisma ORM
- NextAuth.js authentication
- Responsive design with Tailwind CSS
- shadcn/ui components
- TypeScript for type safety

### Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `NEXTAUTH_URL` | Your app's URL | `https://your-app.onrender.com` |
| `NEXTAUTH_SECRET` | JWT signing secret | `your-32-char-secret-key` |

### Troubleshooting

#### Build Issues
- Ensure all dependencies are in `package.json`
- Check build logs for specific errors
- Verify Node.js version compatibility

#### Database Issues
- Verify `DATABASE_URL` is correct
- Check database connection in logs
- Ensure database is running and accessible

#### Authentication Issues
- Verify `NEXTAUTH_URL` matches your domain
- Ensure `NEXTAUTH_SECRET` is set
- Check session configuration

### Support

For issues or questions:
1. Check the build logs in Render dashboard
2. Review the application logs
3. Verify all environment variables are set correctly

### Local Development

To run locally:
```bash
npm install
npm run dev
```

The app will be available at `http://localhost:8000`
