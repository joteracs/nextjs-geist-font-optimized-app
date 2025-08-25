# Educational Platform

A modern, responsive educational platform built with Next.js 15, featuring user authentication, question management, and interactive learning tools.

## 🚀 Features

### Authentication & User Management
- **Secure Login System**: Email/username and password authentication
- **Role-Based Access**: Admin and Common User roles with different permissions
- **Single Device Login**: Prevents simultaneous logins from multiple devices
- **Session Management**: 10-minute automatic timeout for security
- **User Administration**: Complete CRUD operations for user management

### Learning Features
- **Question Solving**: Interactive multiple-choice question interface
- **Flashcard System**: Review previously answered questions in flashcard format
- **Progress Tracking**: Statistics on questions answered and accuracy rates
- **Subject Organization**: Questions organized by topics/subjects
- **Welcome Onboarding**: Guided experience for new users

### Admin Dashboard
- **Question Management**: Create, edit, and delete questions with multiple alternatives
- **User Management**: Add, edit, and manage user accounts and permissions
- **Analytics**: Monitor user activity and platform usage
- **Content Control**: Full administrative control over platform content

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui with Radix UI primitives
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Notifications**: Sonner

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js 18+ 
- npm/yarn/pnpm/bun

### Local Development

1. **Clone the repository**
```bash
git clone <repository-url>
cd educational-platform
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env.local` file:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/educational_platform"
NEXTAUTH_URL="http://localhost:8000"
NEXTAUTH_SECRET="your-secret-key-here"
```

4. **Set up the database**
```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

5. **Start the development server**
```bash
npm run dev
```

Open [http://localhost:8000](http://localhost:8000) to view the application.

### Default Users (after seeding)
- **Admin**: `admin@example.com` / `admin123`
- **Student**: `user@example.com` / `user123`

## 🚀 Deployment

### Render.com (Recommended)
See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Other Platforms
The application can be deployed on any platform that supports Node.js and PostgreSQL:
- Vercel (with external PostgreSQL)
- Railway
- Heroku
- DigitalOcean App Platform

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── dashboard/         # Protected dashboard pages
│   ├── login/            # Authentication pages
│   └── globals.css       # Global styles
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   └── dashboard/        # Dashboard-specific components
├── lib/                  # Utility functions
├── hooks/                # Custom React hooks
└── types/                # TypeScript type definitions

prisma/
├── schema.prisma         # Database schema
└── seed.ts              # Database seeding script
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:seed` - Seed database with sample data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Check the [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment issues
- Review the application logs for debugging
- Open an issue in the repository

## 🎯 Roadmap

- [ ] Email notifications
- [ ] Advanced analytics dashboard
- [ ] Question categories and tags
- [ ] Bulk question import/export
- [ ] Mobile app development
- [ ] Multi-language support
