# Primer AI Web Application

This is the codebase for the Primer AI web application, built using Next.js.

## Overview

Primer AI is designed to provide AI-generated courses and lessons to users. Key features and technologies include:

-   **Framework:** [Next.js](https://nextjs.org/) (App Router)
-   **Styling:** Tailwind CSS (implied by `globals.css` likely containing `@tailwind` directives)
-   **Authentication:** [Supabase](https://supabase.com/) (Email OTP - One-Time Password)
-   **Subscription Management:** Custom logic using Supabase tables (`users`) and a backend API (`/api/subscription/verify`) to handle trial, active, and inactive subscription states.
-   **UI Components:** The application uses various React components, notably `SyllabusForm` and `FeedbackForm` on the main page, and a global `Header`.
-   **Context Management:** React Context API is used for managing authentication state (`src/app/context/AuthContext.tsx`).
-   **Analytics:** Google Analytics is integrated.

## Project Structure

The codebase follows a standard Next.js App Router structure:

```
/
├── public/          # Static assets (images, fonts, etc.)
├── src/
│   ├── app/         # Application routes, layouts, pages, and components
│   │   ├── api/     # API routes (e.g., for subscription verification)
│   │   ├── components/ # Shared React components (e.g., Header, SyllabusForm)
│   │   ├── context/    # React Context providers (e.g., AuthContext)
│   │   ├── dashboard/  # Routes/components related to the user dashboard
│   │   ├── lib/        # Utility functions, Supabase client setup
│   │   ├── login/      # Routes/components related to login/authentication
│   │   ├── syllabus/   # Routes/components related to syllabus generation/display
│   │   ├── types/      # TypeScript type definitions
│   │   ├── globals.css # Global CSS styles (likely includes Tailwind)
│   │   ├── layout.tsx  # Root layout component
│   │   └── page.tsx    # Root page component (homepage)
│   └── ...
├── next.config.mjs  # Next.js configuration
├── package.json     # Project dependencies and scripts
├── tailwind.config.ts # Tailwind CSS configuration
├── tsconfig.json    # TypeScript configuration
└── README.md        # This file
```

## Key Files

-   `src/app/layout.tsx`: Defines the root HTML structure, includes global styles, fonts, analytics, and wraps the application in the `AuthProvider`.
-   `src/app/page.tsx`: The main landing page, featuring the `SyllabusForm` and `FeedbackForm`.
-   `src/app/context/AuthContext.tsx`: Manages user authentication state, interacts with Supabase Auth, and handles subscription status checks.
-   `src/app/lib/supabase/client.ts`: (Expected location) Initializes the Supabase client.
-   `src/app/api/`: Contains backend API routes used by the application (e.g., subscription verification).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Environment Variables

(List required environment variables, e.g., Supabase URL and Anon Key)

```bash
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
# Add any other required variables (e.g., for subscription API)
```

Create a `.env.local` file in the root directory and add these variables.
