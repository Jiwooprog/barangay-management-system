# Barangay Management System

A full-stack Barangay Management System (BMS) for managing residents, households, puroks, officials, committees, certificates, blotter cases, announcements, reports, user access, settings, and resident self-service workflows.

The application is built with React, TypeScript, Vite, Tailwind CSS, Supabase, and PostgreSQL, with role-based access control and database-level Row Level Security.

## Live Application

Production deployment:

https://barangay-management-system-chi.vercel.app

GitHub repository:

https://github.com/Jiwooprog/barangay-management-system

## Features

### Dashboard

- Barangay population and household statistics
- Purok totals
- Pending certificate request totals
- Active population metrics
- Charts and analytics
- Responsive desktop and mobile layout

### Residents

- Create, view, update, and manage resident records
- Resident numbers
- Personal and demographic information
- Address and purok assignment
- Household assignment
- Voter and precinct information
- PWD, senior citizen, solo parent, 4Ps, and indigenous people indicators
- Emergency contacts
- Resident photo upload
- Active/inactive status
- Search, filtering, and server-side pagination

### Households

- Household records
- Household number
- Purok and address assignment
- Household head
- Contact information
- Active/inactive status
- Search and server-side pagination

### Puroks

- Purok/zone management
- Optional code and description
- Active/inactive records

### Officials and SK

- Barangay officials
- Sangguniang Kabataan officials
- Position management
- Term dates
- Current/former status
- Display ordering

### Committees

- Committee management
- Chairperson assignment
- Committee member management
- Official-based membership

### Certificates

Supported certificate types include:

- Barangay Clearance
- Certificate of Residency
- Certificate of Indigency
- Business Clearance
- Good Moral Certificate

Certificate workflow:

1. Request
2. Review
3. Approve or reject
4. Issue
5. Generate printable PDF
6. Verify using QR code

Additional features:

- Request and certificate numbering
- Payment and official receipt information
- QR verification tokens
- Public verification page
- Server-side filtering and pagination

### Blotter / Peace and Order

- Blotter case creation
- Complainant and respondent information
- Incident information
- Case priority
- Mediation workflow
- Hearings and schedules
- Settlement, referral, dismissal, and closure
- Case history and updates
- Dashboard integration
- Server-side pagination

### Announcements

- Create and edit announcements
- Draft and published status
- Audience targeting
- Purok-specific announcements
- Pinning
- Publish and expiry dates
- Resident Portal visibility
- Search, filtering, and pagination

### Reports

- Barangay summary reports
- Detailed reports
- Filters and analytics
- Charts
- Excel export
- PDF export

### User Management

- Authentication account overview
- Role assignment
- Resident-account linking
- Duplicate resident-link protection
- Super Admin safeguards
- Search and server-side pagination

### Activity Logs

- Audit trail for system activity
- User/action tracking
- Server-side pagination

### Settings

- Barangay information
- Certificate-related information
- System configuration used by generated documents

### Resident Portal

Residents have a dedicated portal with access to:

- Resident dashboard
- Personal profile
- Certificate requests
- Certificate request history
- Announcements

## Role-Based Access Control

The system uses three roles.

| Role | Access |
| --- | --- |
| Super Admin | Full system access, including Users, Activity Logs, and Settings |
| Barangay Staff | Operational barangay modules without Super Admin-only administration |
| Resident | Resident Portal and resident-specific permitted data/actions |

Authorization is enforced at both the application and database layers.

The frontend protects routes and navigation based on the authenticated user's role. Supabase Row Level Security and role-aware database functions provide backend protection.

## Security

The application includes:

- Supabase Authentication
- Role-Based Access Control
- PostgreSQL Row Level Security
- Security-definer helper functions where required
- Least-privilege table/RPC access
- Protected Super Admin functionality
- Resident ownership restrictions
- Private resident-photo storage with signed URLs
- Activity/audit logging
- Environment variables kept outside source control
- Input validation and workflow validation

Never expose a Supabase secret/service-role key in the frontend. The Vite application should only use the Supabase publishable client key.

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- React Router
- Tailwind CSS
- shadcn/ui
- Lucide React
- TanStack Query
- React Hook Form
- Zod
- Recharts

### Backend / Database

- Supabase
- PostgreSQL
- Supabase Authentication
- Row Level Security
- Supabase Storage
- PostgreSQL functions/RPCs

### Export / Document Tools

- jsPDF
- QR Code
- ExcelJS

### Deployment

- Vercel
- Supabase

## Requirements

Install the following before running the project locally:

- Node.js
- npm
- Git
- A Supabase project

## Local Setup

Clone the repository:

```bash
git clone https://github.com/Jiwooprog/barangay-management-system.git
```

Enter the project directory:

```bash
cd barangay-management-system
```

Install dependencies:

```bash
npm install
```

Create a local environment file:

```text
.env.local
```

Use `.env.example` as the reference.

Example:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
VITE_APP_NAME=Barangay Management System
```

Do not commit `.env.local`.

Start the development server:

```bash
npm run dev
```

Open the URL printed by Vite, normally:

```text
http://localhost:5173
```

## Production Build

Create a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Supabase Setup

The application expects an existing Supabase backend containing the required database tables, policies, functions, triggers, storage configuration, and authentication roles.

Important backend areas include:

- `roles`
- `profiles`
- `user_roles`
- residents
- households
- puroks
- officials
- committees
- certificate requests
- blotter cases and hearings
- announcements
- barangay settings
- activity logs

The project also relies on role/auth helper functions and RPCs such as role checks, current resident resolution, paginated user management, and secure resident certificate-request creation.

> Note: If setting up a brand-new Supabase project, the corresponding database schema/migrations must also be applied. Do not assume the frontend repository alone creates the database automatically.

## Supabase Authentication URLs

For local development, an allowed redirect can include:

```text
http://localhost:5173/**
```

For the deployed application, configure the Supabase Site URL as:

```text
https://barangay-management-system-chi.vercel.app
```

Add the password recovery redirect:

```text
https://barangay-management-system-chi.vercel.app/reset-password
```

These settings are available under:

```text
Supabase Dashboard
→ Authentication
→ URL Configuration
```

## Email / Password Recovery

The application includes:

- Forgot Password page
- Password recovery email flow
- Reset Password page
- Production reset-password redirect support

Supabase's built-in Auth email service can be used for development/testing, subject to its email limits.

For a production deployment with higher sending volume and branded sender addresses, configure a custom SMTP provider and a domain that you own and can verify.

## Vercel Deployment

The application is deployed as a Vite single-page application.

Required Vercel environment variables:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
VITE_APP_NAME
```

A `vercel.json` rewrite is included so React Router routes work when opened or refreshed directly:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This is required for routes such as:

```text
/login
/forgot-password
/reset-password
/dashboard
/resident/dashboard
```

## Common Commands

Development:

```bash
npm run dev
```

Production build:

```bash
npm run build
```

Local production preview:

```bash
npm run preview
```

Git status:

```bash
git status
```

Push changes:

```bash
git add .
git commit -m "Describe your changes"
git push
```

## Project Structure

```text
src/
├── app/
│   ├── providers.tsx
│   ├── query-client.ts
│   └── router.tsx
├── components/
│   ├── layout/
│   └── ui/
├── features/
│   ├── activity-logs/
│   ├── announcements/
│   ├── auth/
│   ├── blotter/
│   ├── certificates/
│   ├── committees/
│   ├── dashboard/
│   ├── households/
│   ├── officials/
│   ├── puroks/
│   ├── reports/
│   ├── resident-portal/
│   ├── residents/
│   ├── settings/
│   └── users/
├── lib/
├── pages/
├── types/
└── main.tsx
```

Each major feature is organized using its own page/components, hooks, services, and types where appropriate.

## Validation and UX

The application includes:

- Required-field validation
- Conditional-field validation
- Philippine mobile-number validation where applicable
- Date/workflow validation
- Duplicate-link protection
- Accessible error messages
- Loading and pending states
- Empty states
- Responsive layouts
- Mobile navigation
- Horizontally scrollable tables on small screens
- Server-side pagination for high-volume records

## Testing

The application has been manually tested across:

- Super Admin access
- Barangay Staff access
- Resident access
- Role-protected routes
- CRUD workflows
- Certificate workflow
- Blotter workflow
- Reports/export
- Responsive/mobile views
- Production build
- Vercel deployment
- Forgot-password and reset-password flow

## Environment File Safety

The repository ignores local and production secret files, including:

```text
.env
.env.local
.env.development.local
.env.test.local
.env.production
.env.production.local
```

Only the safe example environment file should be committed:

```text
.env.example
```

## Future Improvements

Possible future enhancements include:

- Branded custom SMTP with a verified barangay domain
- Automated test coverage
- More granular staff permissions
- SMS notifications
- Document e-signatures
- Additional statistical reports
- Automated database backup procedures
- Performance-oriented route/code splitting
- Custom production domain

## License

No open-source license is currently declared for this repository. Unless a license is added, the source code should not be assumed to be available for unrestricted reuse.

## Author

Developed as a modern Barangay Management System using React, TypeScript, Supabase, and PostgreSQL.
