---
name: agri-sys-frontend
description: "Apply React architecture, API fetching rules, and authentication context standards for the Agri-Sys frontend."
---

# Agri-Sys Frontend Architecture & Patterns

This skill ensures consistent React architectural patterns, data-fetching rules, and context usage for the frontend (`/agri_sys`) of the Agricultural Intervention Distribution System.

## Core Stack

- React 19 + Vite 7 + React Router v7 + Tailwind CSS v4

## Component Architecture

- **Protected Routes:** Every authenticated page must be wrapped properly:
  ```jsx
  <ProtectedRoute>
    <Layout>
      <PageComponent />
    </Layout>
  </ProtectedRoute>
  ```
- **Styling:** Use Tailwind CSS utility classes exclusively. No separate CSS files for new components.

## Data Fetching & API

- **Axios Instance:** ALWAYS use the predefined `api` instance from `src/services/api.js` for all HTTP calls. This instance automatically injects the JWT token (`Authorization: Bearer <token>`) and handles 401 redirects.
- **NEVER** use the Native raw `fetch` API or instantiate a new separate Axios instance.

## Authentication State

- **Context:** Use the `useAuth()` hook from `AuthContext` to interact with global user state.
- **Available Props:** Hook returns `{ user, loading, login, register, logout }`.

## Notifications & Icons

- **Icons:** Solely import and use SVG icons from `lucide-react` (do not use emojis).
- **Toasts:** Use `import toast from 'react-hot-toast'` for flash notifications (e.g., `toast.success('...')`, `toast.error('...')`).

## When to Use

Invoke this skill whenever you are:

- Scaffolding a new React page or complex container component.
- Creating API interaction logic (e.g., getting/creating/updating Farmers, Orders, or Inventory).
- Debugging state or protective routing logic.
