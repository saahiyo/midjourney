# AI Image Generator

A modern React application for AI image generation using Supabase Edge Functions, featuring real-time progress tracking and Google OAuth authentication.

## Features

- 🤖 AI image generation with real-time progress tracking
- 🔐 Google OAuth authentication via Supabase
- 📱 Responsive design with Tailwind CSS
- 🎨 Modern dark theme interface
- ⚡ Fast Vite build tooling
- 🔄 Real-time status polling
- 📊 Generation history tracking

## Quick Start

### Prerequisites

- Node.js 18+
- npm
- Supabase account with Edge Functions enabled

### Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your values:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   VITE_MJ_API_URL=your_image_generation_service_url  # Used by Supabase Edge Function
   VITE_ADMIN_EMAIL=your_admin_email
   VITE_PUBLIC_SITE_URL=http://localhost:5173
   ```

3. **Set up Supabase Edge Function**
   Deploy the `mj-gen-images` Edge Function to your Supabase project. The function should handle the image generation API calls.

4. **Start development**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS 4
- **Backend**: Supabase (Database + Edge Functions)
- **Authentication**: Supabase Auth (Google OAuth)
- **Styling**: Tailwind CSS
- **Animation**: GSAP
- **Icons**: Lucide React
- **State Management**: React hooks (custom hooks pattern)

## Project Structure

```
src/
├── components/     # React components
├── hooks/         # Custom React hooks
├── pages/         # Route pages
├── lib/          # External library configs
├── utils/        # Utility functions
├── constants/    # App constants
└── assets/       # Static assets
```

## Key Features

- **AI Image Generation**: Uses Supabase Edge Functions to generate images
- **Real-time Progress**: Tracks generation progress with polling
- **User Authentication**: Google OAuth integration for secure access
- **Generation History**: Track and view past generations
- **Responsive Design**: Works seamlessly on desktop and mobile

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key | Yes |
| `VITE_MJ_API_URL` | Image generation service URL for Edge Function | Yes |
| `VITE_ADMIN_EMAIL` | Admin email for special permissions | Yes |
| `VITE_PUBLIC_SITE_URL` | Your site's public URL | Yes |

## License

MIT