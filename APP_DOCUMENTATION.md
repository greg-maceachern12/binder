# Primer AI Application Documentation

## Overview

Primer AI is a web application built with Next.js designed to generate educational courses or lessons using AI. The main goal, as suggested by the title "Primer AI - Learn Anything" and description "AI Generated Courses", is to provide users with customized learning content.

## Technology Stack

*   **Framework:** Next.js (React framework)
*   **Styling:** Tailwind CSS, Global CSS (`src/app/globals.css`)
*   **Language:** TypeScript
*   **Fonts:** Instrument Serif, Inter

## Project Structure (`src` directory)

*   **`app/`:** Contains the core application logic, routing, and pages.
    *   `layout.tsx`: The root layout, setting up HTML structure, fonts, metadata, Google Analytics, `AuthProvider`, and the main `Header`.
    *   `page.tsx`: The landing page, featuring a `SyllabusForm` and a `FeedbackForm` over a blurred background.
    *   `globals.css`: Global styles for the application.
    *   `api/`: Likely contains API route handlers for backend logic (e.g., interacting with AI models, database).
    *   `components/`: Contains components specific to the `app` directory routes (e.g., `Header`, `SyllabusForm`, `FeedbackForm`).
    *   `context/`: Holds React context providers, like `AuthContext` for managing user authentication.
    *   `dashboard/`: Route/page(s) for the user dashboard.
    *   `lib/`: Utility functions or libraries specific to the `app` directory.
    *   `login/`: Route/page(s) for user login/authentication.
    *   `syllabus/`: Route/page(s) likely related to viewing or managing generated syllabi/courses.
    *   `types/`: TypeScript type definitions.
*   **`components/`:** Contains reusable UI components.
    *   `ui/`: Likely holds base UI elements (buttons, inputs, cards, etc.) potentially from a library like Shadcn/ui.
*   **`lib/`:** Contains general utility functions (`utils.ts`) shared across the application.

## Key Features & Components

*   **AI Course Generation:** The core premise seems to be generating learning materials based on user input, likely initiated via the `SyllabusForm`.
*   **User Authentication:** Handled by `AuthProvider` (`src/app/context/AuthContext`) and likely involves the `/login` route.
*   **Dashboard:** A dedicated section (`/dashboard`) for authenticated users.
*   **Syllabus Management:** Users can likely create syllabi via `SyllabusForm` (`src/app/components/SyllabusForm`) and view/manage them, potentially under the `/syllabus` route.
*   **Feedback Collection:** A `FeedbackForm` (`src/app/components/FeedbackForm`) is present on the landing page to gather user input.
*   **Routing:** Next.js App Router is used for defining pages and layouts.
*   **Styling:** Tailwind CSS is used for utility-first styling, along with global styles.

## How it Works (Inferred Flow)

1.  A user visits the landing page (`/`).
2.  They interact with the `SyllabusForm` to specify the topic or parameters for the AI-generated course.
3.  The application (likely via an API route in `src/app/api/`) processes this request, potentially interacting with an external AI service.
4.  Generated content (syllabus, course material) might be displayed, possibly requiring the user to log in (`/login`) or access their dashboard (`/dashboard`) or a specific syllabus page (`/syllabus`).
5.  User authentication state is managed globally via `AuthContext`.
6.  Users can provide feedback through the `FeedbackForm`. 