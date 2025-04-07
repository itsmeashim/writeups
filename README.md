# Writeups

<div align="center">
  <img src="public/logo.png" alt="Writeups Logo" width="200" height="200" />
</div>


A modern web application for managing and organizing security writeups, built with the T3 Stack.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fitsmeashim%2Fwriteups&env=DATABASE_URL,BETTER_AUTH_SECRET,BETTER_AUTH_URL,ALLOW_REGISTRATION&envDescription=DATABASE_URL%3A%20PostgreSQL%20connection%20string%20(e.g.%2C%20from%20Supabase%20or%20Neon).%20%20%20%20%20BETTER_AUTH_SECRET%3A%20Random%20key%20like%20X7K9P2M4Q8R5T1J3%20or%20generate%20via%20%60npx%20%40better-auth%2Fcli%40latest%20secret%60.%20%20%20%20%20BETTER_AUTH_URL%3A%20Your%20site%20URL%20(e.g.%2C%20https%3A%2F%2Fyourdomain.com).%20%20%20%20%20ALLOW_REGISTRATION%3A%20Set%20%60true%60%20for%20multi-user%2C%20%60false%60%20for%20single-user.%20%20%20%20%20&envLink=https%3A%2F%2Fgithub.com%2Fitsmeashim%2Fwriteups%2Fblob%2Fmain%2F.env.example)

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/itsmeashim/writeups)

## Features

- 📝 Import and manage security writeups
- 🔄 Fetch Latest Writeups with single click
- 🔍 Advanced search and filtering capabilities
- 👥 Track authors, programs, and bug types
- 📊 Track bounties and publication dates
- 📌 Add personal notes to writeups
- ✅ Mark writeups as read
- 📝 User-friendly markdown editor for writing personalized note
- 🌐 Responsive design for all devices
- 📤 Export notes in markdown along with the writeups details
- 🔄 Sync across devices
- 🌙 Default dark mode support
- 📱 PWA (Progressive Web App) support
- 🔐 Secure authentication with BetterAuth
- 🚀 Built with modern technologies

## Tech Stack

- [T3 Stack](https://create.t3.gg/) - Full-stack, typesafe Next.js app
- [Next.js](https://nextjs.org) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Drizzle ORM](https://orm.drizzle.team) - Database ORM
- [PostgreSQL](https://www.postgresql.org/) - Database
- [tRPC](https://trpc.io) - End-to-end type-safe APIs
- [BetterAuth](https://better-auth.dev) - Authentication
- [Shadcn UI](https://ui.shadcn.com) - UI components
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [Serwist](https://serwist.pages.dev) - PWA support

## Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database (You can create one from supabase, or neon or other providers)

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/itsmeashim/writeups.git
   cd writeups
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

4. Update the environment variables in `.env`:
   ```
   DATABASE_URL="postgresql://postgres@localhost:5432/writeups"
   BETTER_AUTH_SECRET=your_generated_secret # Generate using: npx @better-auth/cli@latest secret
   BETTER_AUTH_URL=http://localhost:3000
   ALLOW_REGISTRATION=true
   ```

5. Initialize the database:
   ```bash
   pnpm db:push
   ```

6. Start the development server:
   ```bash
   pnpm dev
   ```

Visit `http://localhost:3000` to see your application.

## Database Schema

The application uses the following main tables:
- `writeup` - Stores writeup details (title, link, publication date, bounty)
- `writeup_author` - Manages authors
- `writeup_program` - Tracks bug bounty programs
- `writeup_bug` - Catalogs bug types
- `writeup_note` - Stores user notes for writeups
- `writeup_read` - Tracks read status of writeups

## Deployment

### Vercel

1. Click the "Deploy with Vercel" button above
2. Set up the required environment variables
3. Deploy!

### Netlify

1. Click the "Deploy to Netlify" button above
2. Set up the required environment variables
3. Deploy!

### Docker

Coming soon!

## Environment Variables

| Variable | Description | Required |
|----------|-------------|-----------|
| `DATABASE_URL` | PostgreSQL connection URL | Yes |
| `BETTER_AUTH_SECRET` | Secret key for authentication | Yes |
| `BETTER_AUTH_URL` | Your application's URL | Yes |
| `ALLOW_REGISTRATION` | Enable/disable user registration | No |

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License

Copyright (c) 2024 Ashim

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
