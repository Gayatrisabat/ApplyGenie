# ApplyGenie - Quick Start Guide

## 30-Second Setup

```bash
# 1. Install dependencies (already done)
pnpm install

# 2. Start dev server
pnpm dev

# 3. Open browser
# Visit: http://localhost:5173
```

That's it! 🚀

## What You'll See

### Dashboard (Default)
- Three-column layout showing Profiles, Resumes, and Statistics
- Add your first profile by clicking the "+ Add" button
- Upload resumes for your profile
- Real-time statistics tracking

### Job Search
- Search for jobs with keyword, location, and result limit
- View detailed job descriptions
- Generate AI content (cover letters, outreach emails, interview prep)
- Tailor resumes and apply to jobs directly

### Applications
- Track all your job applications
- See ATS scores and application status
- Download tailored resumes
- Pagination for navigating through applications

### Console Logs
- Real-time logging from the backend
- Terminal-style interface
- Filter by log level
- Clear logs at any time

## Connecting to Backend

The frontend expects a FastAPI backend running on `http://127.0.0.1:8000`.

### Required Endpoints

**Stats**
```
GET /api/stats
→ { total_profiles, total_resumes, total_jobs_parsed, total_applications_sent }
```

**Profiles**
```
GET /api/profiles
POST /api/profiles { name, email, phone?, location? }
PUT /api/profiles/{id}
DELETE /api/profiles/{id}
```

**Resumes**
```
GET /api/profiles/{profile_id}/resumes
POST /api/profiles/{profile_id}/resumes (multipart file upload)
DELETE /api/resumes/{resume_id}
GET /api/resumes/{resume_id}/preview
```

**Job Search**
```
POST /api/jobs/search
{ keyword: string, location: string, limit: number }
→ List of jobs
```

**Applications**
```
POST /api/jobs/apply
{ profile_id, job_id, resume_id, job_title, company_name, source }

GET /api/applications
→ List of Application objects

DELETE /api/applications/{id}

GET /api/tailored-resumes/{application_id}/download
→ PDF blob
```

**AI Generation**
```
POST /api/ai/cover-letter
{ profile_id, job_id, resume_id, job_title, company_name }
→ { type: 'cover_letter', content: string, job_title, company_name }

POST /api/ai/cold-email
→ { type: 'cold_email', content: string, job_title, company_name }

POST /api/ai/interview-prep
→ { type: 'interview_prep', content: string, job_title, company_name }
```

**Logs (Server-Sent Events)**
```
GET /api/logs/stream
→ EventSource stream: { timestamp, level, message }

Log Levels: INFO, SUCCESS, WARNING, ERROR, DEBUG
```

## File Structure

```
src/
├── pages/              # Full pages (Dashboard, JobSearch, etc)
├── components/         # Reusable components
│   ├── layout/        # Sidebar, Navbar
│   ├── dashboard/     # Dashboard panels
│   ├── jobs/          # Job search components
│   ├── applications/  # Application table
│   ├── logs/          # Console logs
│   ├── dialogs/       # Modal dialogs
│   └── ui/            # Base UI components
├── hooks/             # Custom React hooks
├── services/          # API client (api.ts)
├── types/             # TypeScript types
└── utils/             # Helper functions
```

## Key Files to Know

| File | Purpose |
|------|---------|
| `src/App.tsx` | Root component with routing |
| `src/services/api.ts` | All API calls |
| `src/types/index.ts` | TypeScript interfaces |
| `src/index.css` | Design tokens and globals |
| `tailwind.config.ts` | Tailwind customization |

## Common Tasks

### Add a New Feature
1. Create component in `src/components/`
2. Create API function in `src/services/api.ts`
3. Use with `useQuery` or `useMutation` from `@tanstack/react-query`
4. Display data in component

### Customize Colors
Edit `src/index.css`:
```css
:root {
  --color-primary: 226 52% 50%;  /* Change primary color */
  /* ... other colors ... */
}
```

### Add a New Page
1. Create page file in `src/pages/`
2. Import in `src/App.tsx`
3. Add to page routing logic
4. Update sidebar navigation

### Style a Component
Use Tailwind CSS classes:
```tsx
<div className="p-6 rounded-lg border border-border bg-card">
  Premium card styling
</div>
```

## Debugging

### See Console Logs
```bash
# Open browser DevTools (F12)
# Look at Console tab for any errors
```

### Check API Calls
```bash
# In DevTools → Network tab
# Look for /api/* requests
# Check status codes and response bodies
```

### Performance
```bash
# In DevTools → Performance tab
# Record user interactions
# Check React component render times
```

## Build for Production

```bash
# Create optimized build
pnpm build

# Preview the production build
pnpm preview

# Deploy to Vercel
vercel deploy
```

## Deployment Checklist

- [ ] Backend running and all endpoints working
- [ ] Environment variables set correctly
- [ ] CORS configured in FastAPI backend
- [ ] SSL certificates valid (for production)
- [ ] Database backups configured
- [ ] Error logging set up
- [ ] Performance monitoring enabled

## Troubleshooting

### "Cannot GET /"
- Make sure `pnpm dev` is running
- Check you're using `http://localhost:5173` (not 3000)

### "Failed to connect to backend"
- Ensure FastAPI backend is running on port 8000
- Check CORS headers in FastAPI
- Verify endpoint paths are correct

### "No logs appearing"
- Check `/api/logs/stream` is returning EventSource data
- Check browser console for connection errors
- Verify log format matches expected schema

### Styles look wrong
- Hard refresh (Cmd+Shift+R or Ctrl+Shift+R)
- Clear browser cache
- Restart dev server

## What's Included

✅ **Complete UI**
- 4 full pages (Dashboard, Job Search, Applications, Logs)
- 20+ reusable components
- Premium dark theme

✅ **State Management**
- TanStack Query for server state
- React Context for logs
- React hooks for local state

✅ **API Integration**
- Complete API client
- Error handling
- Loading states

✅ **Animations**
- Framer Motion transitions
- Smooth hover effects
- Page transitions

✅ **Accessibility**
- ARIA labels
- Keyboard navigation
- Screen reader support

✅ **Responsive Design**
- Mobile-optimized
- Tablet layouts
- Desktop experience

## Next Steps

1. **Run the app**: `pnpm dev`
2. **Explore the UI**: Click around, try all pages
3. **Connect backend**: Implement the API endpoints
4. **Customize**: Adjust colors, fonts, components
5. **Deploy**: Push to production

## Resources

- [React Docs](https://react.dev)
- [Vite Docs](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Framer Motion](https://www.framer.com/motion)
- [TanStack Query](https://tanstack.com/query)

## Need Help?

1. Check `README.md` for full documentation
2. Review `IMPLEMENTATION.md` for architecture details
3. Look at component source code for examples
4. Check backend API response format

---

**Happy coding!** 🎉 Start with the Dashboard and explore from there.
