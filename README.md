# MidJourney Image Generation App

A modern, responsive React application for generating AI images using the MidJourney API. Features a sleek dark theme interface, real-time progress tracking, and comprehensive error handling.

## ✨ Features

- **AI Image Generation**: Generate stunning images using MidJourney API
- **Real-time Progress**: Live progress tracking with polling mechanism
- **Responsive Design**: Optimized for desktop and mobile devices
- **Error Handling**: Comprehensive error boundaries and user-friendly messages
- **Accessibility**: Full ARIA support and keyboard navigation
- **Performance**: Optimized with React.memo, useMemo, and useCallback
- **Type Safety**: Input validation and sanitization
- **Database Integration**: Supabase for saving generation history

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (optional, for saving generations)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd midjourney
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   VITE_MJ_API_URL=your_midjourney_api_url
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ErrorBoundary.jsx
│   ├── ImageGallery.jsx
│   ├── ImagePreviewModal.jsx
│   ├── PromptForm.jsx
│   └── ...
├── hooks/              # Custom React hooks
│   ├── useImageGeneration.js
│   ├── usePromptForm.js
│   └── useImagePreview.js
├── utils/              # Utility functions
│   ├── constants.js
│   ├── errorHandler.js
│   └── validation.js
├── constants/          # Application constants
├── lib/               # External library configurations
```

## 🎨 Key Components

### Custom Hooks

- **`useImageGeneration`**: Manages image generation state and API calls
- **`usePromptForm`**: Handles form state and validation
- **`useImagePreview`**: Manages image preview modal state

### Components

- **`PromptForm`**: Input form with validation and aspect ratio selection
- **`ImageGallery`**: Displays generated images with responsive layout
- **`ErrorBoundary`**: Catches and handles React errors gracefully
- **`ImagePreviewModal`**: Full-screen image preview with keyboard support

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_MJ_API_URL` | MidJourney API endpoint | Yes |
| `VITE_SUPABASE_URL` | Supabase project URL | No |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | No |

### API Configuration

The app expects the MidJourney API to support:
- GET requests with `prompt` and `usePolling` parameters
- Polling mechanism for long-running generations
- JSON responses with `status`, `results`, and `pollingUrl` fields


## 🚀 Performance Optimizations

- **React.memo**: Prevents unnecessary re-renders
- **useMemo/useCallback**: Optimizes expensive calculations
- **Lazy loading**: Images load only when needed
- **Debounced inputs**: Reduces API calls
- **Error boundaries**: Prevents app crashes

## ♿ Accessibility Features

- **ARIA labels**: Screen reader support
- **Keyboard navigation**: Full keyboard accessibility
- **Focus management**: Proper focus handling in modals
- **Color contrast**: WCAG compliant color scheme
- **Semantic HTML**: Proper HTML structure

## 🔒 Security Features

- **Input sanitization**: Prevents XSS attacks
- **Validation**: Client-side input validation
- **Error handling**: Secure error messages
- **Environment validation**: Checks for required variables

## 📱 Responsive Design

- **Mobile-first**: Optimized for mobile devices
- **Flexible layouts**: Adapts to different screen sizes
- **Touch-friendly**: Large touch targets
- **Progressive enhancement**: Works without JavaScript

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Make sure your changes work correctly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Check your `VITE_MJ_API_URL` environment variable
   - Verify the API endpoint is accessible

2. **Supabase Connection Issues**
   - Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
   - Check your Supabase project settings

3. **Build Errors**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check for TypeScript errors: `npm run lint`

### Getting Help

- Check the [Issues](https://github.com/your-repo/issues) page
- Review the [Documentation](https://your-docs-url.com)
- Contact the maintainers

---

Built with ❤️ using React, Vite, and Tailwind CSS