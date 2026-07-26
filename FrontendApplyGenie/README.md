# ApplyGenie - AI-Powered Job Application Assistant

A premium, production-quality React + Vite frontend for an AI-powered job application SaaS platform. Designed with a modern aesthetic inspired by Vercel AI, Linear, and OpenAI.

## 🎯 Features

### Dashboard
- **Profile Management**: Create, edit, and manage job application profiles
- **Resume Management**: Upload, preview, and manage multiple resumes per profile
- **Real-time Statistics**: Track profiles, resumes, parsed jobs, and applications sent

### Job Search
- **Advanced Search**: Search jobs by keyword, location, and result limit
- **Job Details**: View detailed job descriptions with external links
- **AI-Powered Actions**:
  - Tailor resume and auto-apply to jobs
  - Generate cover letters
  - Generate outreach/cold email messages
  - Generate interview preparation materials

### Applications
- **Application Tracking**: View all submitted applications in a responsive data table
- **Status Tracking**: Monitor application status with visual badges
- **ATS Score**: Display ATS score with progress bars
- **Resume Download**: Download tailored resumes for each application
- **Pagination**: Navigate through applications with pagination controls

### Console Logs
- **Real-time Logs**: Stream logs via SSE connection
- **Terminal UI**: macOS terminal-inspired interface with traffic lights
- **Log Filtering**: View logs by level (INFO, SUCCESS, WARNING, ERROR, DEBUG)
- **Auto-scroll**: Automatically scroll to latest logs
- **Clear Function**: Clear all logs with one click

## 🏗️ Architecture

### Tech Stack
- **React 18**: UI framework
- **Vite**: Fast build tool and dev server
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Premium accessible UI components
- **Framer Motion**: Smooth animations and transitions
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form state management
- **Sonner**: Toast notifications
- **Lucide React**: Icon library

### Design System
- **Dark Theme Only**: Premium dark aesthetic
- **Color Palette**:
  - Primary: Indigo (#6366F1)
  - Background: Deep black (#0D0D0D)
  - Card: Dark gray (#1A1A2E)
  - Neutrals: Various grays and off-whites

- **Typography**:
  - Sans: Inter font family
  - Mono: JetBrains Mono for terminal

- **Components**:
  - Large rounded cards (12-16px radius)
  - Subtle borders and soft shadows
  - Glass morphism overlays
  - Smooth transitions and animations

### Directory Structure
```
src/
├── components/
│   ├── layout/          # Layout components (Sidebar, Navbar)
│   ├── dashboard/       # Dashboard-specific components
│   ├── jobs/           # Job search components
│   ├── applications/   # Applications table component
│   ├── logs/           # Console logs component
│   ├── dialogs/        # Modal dialogs
│   ├── shared/         # Shared components (LoadingOverlay)
│   └── ui/             # shadcn UI components
├── pages/              # Full page components
├── hooks/              # Custom React hooks
├── services/           # API integration layer
├── types/              # TypeScript types
├── utils/              # Utility functions
├── App.tsx             # Root component
├── main.tsx            # Entry point
└── index.css           # Global styles
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- pnpm (recommended) or npm/yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/applygenie.git
cd applygenie
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Start development server**
```bash
pnpm dev
```

The app will be available at `http://localhost:5173`

4. **Build for production**
```bash
pnpm build
```

### Environment Configuration

The frontend automatically detects the API endpoint:
- Development: `http://127.0.0.1:8000` (FastAPI backend)
- Production: Uses same origin (relative URLs)

## 🔌 API Integration

The frontend integrates with a FastAPI backend with the following endpoints:

### Stats
- `GET /api/stats` - Fetch application statistics

### Profiles
- `GET /api/profiles` - List all profiles
- `POST /api/profiles` - Create new profile
- `PUT /api/profiles/:id` - Update profile
- `DELETE /api/profiles/:id` - Delete profile

### Resumes
- `GET /api/profiles/:id/resumes` - List profile resumes
- `POST /api/profiles/:id/resumes` - Upload resume
- `DELETE /api/resumes/:id` - Delete resume
- `GET /api/resumes/:id/preview` - Preview resume

### Jobs
- `POST /api/jobs/search` - Search for jobs
- `POST /api/jobs/apply` - Apply to a job

### Applications
- `GET /api/applications` - List applications
- `DELETE /api/applications/:id` - Delete application
- `GET /api/tailored-resumes/:id/download` - Download tailored resume

### AI Features
- `POST /api/ai/cover-letter` - Generate cover letter
- `POST /api/ai/cold-email` - Generate outreach email
- `POST /api/ai/interview-prep` - Generate interview prep

### Server-Sent Events
- `GET /api/logs/stream` - Stream console logs in real-time

## 📱 Responsive Design

The frontend is fully responsive with:
- **Desktop-first** layout approach
- **Mobile-optimized** components
- **Drawer navigation** on mobile (<1024px)
- **Responsive tables** that become cards on mobile
- **Touch-friendly** interactive elements

## 🎨 Customization

### Colors
Edit the CSS variables in `src/index.css`:
```css
:root {
  --color-background: 0 0% 5%;
  --color-primary: 226 52% 50%;
  /* ... */
}
```

### Fonts
Modify font imports in `index.html`:
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono..." rel="stylesheet">
```

### Tailwind Theme
Customize in `tailwind.config.ts`:
```typescript
theme: {
  extend: {
    colors: { /* ... */ },
    borderRadius: { /* ... */ },
  }
}
```

## 🔒 Security

- Type-safe with TypeScript
- Parameterized API requests (no SQL injection)
- Input validation via React Hook Form
- ARIA labels and semantic HTML
- Secure token handling in localStorage (production should use httpOnly cookies)

## ♿ Accessibility

- Semantic HTML elements
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus states on all interactive elements
- Screen reader friendly
- High contrast dark theme
- Accessible dialogs and modals

## 🧪 Testing

Run type checking:
```bash
pnpm build  # Type checks via TypeScript
```

## 📦 Deployment

### Vercel (Recommended)
```bash
vercel deploy
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN pnpm install
RUN pnpm build
CMD ["pnpm", "preview"]
```

### Static Hosting
```bash
pnpm build
# Serve the dist/ folder
```

## 🔄 State Management

- **TanStack Query**: Server state and API caching
- **React Context**: Global logs stream
- **React Hooks**: Local component state
- **localStorage**: Selected profile/resume (for MVP)

## 🚀 Performance Optimizations

- Code splitting with Vite
- Lazy loading of components
- Image optimization
- CSS minification
- JavaScript bundling and tree-shaking
- Caching with TanStack Query

## 📝 UX Features

- **Auto-selection**: First profile and primary resume auto-selected
- **Loading States**: Premium loading overlay with animated spinner
- **Empty States**: Beautiful empty state illustrations
- **Toast Notifications**: Sonner toast for success/error feedback
- **Loading Skeletons**: Placeholder animations while loading
- **Smooth Transitions**: Framer Motion animations on all interactions
- **Keyboard Support**: Full keyboard navigation
- **Error Handling**: Graceful error messages and recovery

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test locally
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙋 Support

For issues or questions:
- Open an issue on GitHub
- Check existing documentation
- Review component examples in the codebase

## 🌟 Credits

Designed and built as a premium AI SaaS frontend inspired by:
- Vercel AI Dashboard
- Linear Issue Tracker
- OpenAI Platform

---

**ApplyGenie v1.2.0** - Making job applications intelligent and effortless.
