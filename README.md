# Faktur - Modern Invoice Management System

A modern, full-stack invoice management application built with Next.js 16, featuring a beautiful UI powered by shadcn/ui and Tailwind CSS.

## 🚀 Tech Stack

### Frontend
- **Framework:** Next.js 16.0.3 (App Router)
- **UI Library:** React 19.2.0
- **Styling:** Tailwind CSS v4
- **Component Library:** shadcn/ui (New York style)
- **Icons:** Lucide React
- **Type Safety:** TypeScript (strict mode)

### Backend & Database
- **Database:** SQLite (file-based, ideal for small projects)
- **ORM:** Drizzle ORM (lightweight and type-safe)
- **API Layer:** tRPC (end-to-end type-safe APIs)
- **Authentication:** Better Auth (modern auth for Next.js)

### Development Tools
- **Package Manager:** pnpm
- **Code Quality:** TypeScript, ESLint
- **Version Control:** Git

## 📋 Features Roadmap

### Phase 1: Foundation (Week 1-2)
- [x] Project setup with Next.js 16 + Tailwind + shadcn/ui
- [x] Global theming system with dark mode support
- [x] Database setup (SQLite + Drizzle ORM)
- [x] tRPC integration for type-safe API
- [x] Authentication system (Better Auth)
- [x] Install required shadcn/ui components (button, input, label, card, form)
- [x] Create authentication pages (login/signup)
- [x] Dashboard layout with sidebar navigation
- [x] Additional UI components (dropdown-menu, separator, badge, avatar)
- [x] Route structure for dashboard sections

### Phase 2: Core Features (Week 3-4)
- [x] **Invoice Management**
  - [x] Create, edit, delete invoices
  - [x] Auto-generated invoice numbers
  - [x] Line items with quantities, rates, and totals
  - [x] Tax calculations (VAT/GST/Sales Tax)
  - [x] Discounts (percentage or fixed amount)
  - [x] Invoice status tracking (Draft, Sent, Paid, Overdue, Cancelled)
  - [x] Issue date and due date management
  - [x] Invoice list with filtering and actions
  - [x] Invoice detail/view page
  - [x] tRPC API integration

- [x] **Client Management**
  - [x] Client CRUD tRPC routers
  - [x] Client list page with table
  - [x] Client create/edit form
  - [x] Client detail page with invoice history
  - [x] Client billing addresses (full address fields)
  - [x] Quick client selection (in invoice form)
  - [x] Client invoice history and statistics

- [x] **Business Profile**
  - [x] Company information management
  - [x] Logo upload (stored as base64)
  - [x] Business address and tax ID
  - [x] Bank account details
  - [x] Integration with invoice PDFs

### Phase 3: Enhanced Features (Week 5-6)
- [x] **Dashboard & Analytics**
  - [x] Revenue overview (monthly, yearly)
  - [x] Outstanding invoices tracking
  - [x] Paid vs unpaid visualizations
  - [x] Recent activity feed
  - [x] Charts and trends (using recharts)

- [x] **PDF Generation**
  - [x] Professional invoice templates
  - [x] Download invoices as PDF
  - [x] Business profile integration in PDFs
  - [ ] Multiple template designs

- [x] **Payment Tracking**
  - [x] Mark invoices as paid (full or partial)
  - [x] Payment date and method recording
  - [x] Payment history display
  - [x] Automatic invoice status updates

### Phase 4: Advanced Features (Future)
- [ ] Recurring invoices (weekly, monthly, yearly)
- [ ] Estimates/Quotes with conversion to invoices
- [ ] Multi-currency support
- [ ] Expense tracking
- [ ] Payment gateway integration (Stripe, PayPal)
- [ ] Email notifications (using Resend)
- [ ] Client portal for invoice viewing
- [ ] Multi-user/team support with roles
- [ ] Advanced reporting (tax reports, P&L)
- [ ] Localization (multiple languages)

## 🏗️ Project Structure

```
faktur/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Protected dashboard routes
│   ├── api/               # API routes (tRPC)
│   ├── globals.css        # Global styles & theme
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── invoices/         # Invoice-related components
│   ├── clients/          # Client management components
│   └── dashboard/        # Dashboard components
├── lib/                  # Utility functions
│   ├── db/              # Database schema & client
│   ├── trpc/            # tRPC setup
│   └── utils.ts         # Helper functions
├── server/              # Server-side code
│   ├── routers/        # tRPC routers
│   └── auth.ts         # Better Auth configuration
├── public/             # Static assets
└── drizzle/           # Database migrations
```

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+ installed
- pnpm package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd faktur
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Run database migrations:
```bash
pnpm db:push
```

5. Start the development server:
```bash
pnpm dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📦 Key Dependencies

```json
{
  "dependencies": {
    "next": "16.0.3",
    "react": "19.2.0",
    "tailwindcss": "^4.0.0",
    "drizzle-orm": "Database ORM",
    "better-auth": "Authentication",
    "@trpc/server": "tRPC server",
    "@trpc/client": "tRPC client",
    "@trpc/react-query": "tRPC React integration",
    "@tanstack/react-query": "Data fetching",
    "react-hook-form": "Form handling",
    "zod": "Schema validation",
    "@react-pdf/renderer": "PDF generation",
    "recharts": "Charts & analytics",
    "date-fns": "Date utilities",
    "lucide-react": "Icons"
  }
}
```

## 🎨 Design System

The application uses a comprehensive design system with:
- **Color Scheme:** OKLCH color space for precise colors
- **Dark Mode:** Full dark mode support
- **Typography:** Geist Sans & Geist Mono fonts
- **Components:** shadcn/ui component library
- **Spacing:** Consistent spacing scale
- **Shadows:** Professional shadow system (2xs to 2xl)

## 📝 Development Workflow

### Database Commands
```bash
pnpm db:push         # Push schema changes
pnpm db:studio       # Open Drizzle Studio
pnpm db:generate     # Generate migrations
```

### Development
```bash
pnpm dev             # Start dev server
pnpm build           # Build for production
pnpm start           # Start production server
pnpm lint            # Run ESLint
```

## 🔐 Authentication

This project uses **Better Auth** for authentication, providing:
- Session management
- Social auth providers
- Email/password authentication
- Secure token handling
- Type-safe auth utilities

## 🗄️ Database Schema

### Core Models
- **Users:** Authentication and user profiles
- **Invoices:** Invoice records with status tracking
- **InvoiceItems:** Line items for each invoice
- **Clients:** Client/customer information
- **BusinessProfile:** Company information and settings
- **Payments:** Payment records linked to invoices

## 🚦 Implementation Steps

Follow these steps for consistent development:

1. **Week 1: Database & Auth Setup**
   - Install Drizzle ORM and SQLite
   - Create database schema
   - Set up tRPC with Next.js
   - Configure Better Auth
   - Create authentication pages

2. **Week 2: Component Foundation**
   - Install required shadcn/ui components
   - Create layout components
   - Build navigation and sidebar
   - Set up form components

3. **Week 3: Invoice CRUD**
   - Create invoice form
   - Implement invoice list with filtering
   - Add invoice detail view
   - Build invoice status management

4. **Week 4: Client Management** ✅
   - Client CRUD operations
   - Client selection components
   - Client history view

5. **Week 5: Dashboard & Analytics** ✅
   - Revenue dashboard with real-time data
   - Charts and visualizations (recharts)
   - Activity feed showing recent invoices
   - Statistics cards (revenue, outstanding, paid, overdue)
   - Monthly/yearly revenue trends
   - Invoice status distribution

6. **Week 6: Business Profile & PDF** ✅
   - Business profile management
   - Company logo upload
   - Professional PDF invoice templates
   - PDF generation with @react-pdf/renderer
   - Business info integration in PDFs

7. **Future: Payment Tracking & Polish**
   - Payment recording system
   - Email templates (future)
   - UI polish and testing

## 🤝 Contributing

This is a personal project, but suggestions and feedback are welcome!

## 📄 License

MIT License - feel free to use this project for learning or as a template.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org) - The React framework
- [shadcn/ui](https://ui.shadcn.com) - Beautiful component library
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS
- [Drizzle ORM](https://orm.drizzle.team) - TypeScript ORM
- [tRPC](https://trpc.io) - End-to-end type safety
- [Better Auth](https://better-auth.com) - Modern authentication

---

**Built with ❤️ using Next.js 16 and modern web technologies**
