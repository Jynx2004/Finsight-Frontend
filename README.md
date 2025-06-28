# Financial Analytics Dashboard - Frontend

## Overview

This is the frontend application for the Financial Analytics Dashboard, built with React.js, TypeScript, Material-UI, and Recharts. It provides an interactive dashboard for financial analysts to visualize revenue vs. expenses, category breakdowns, and summary metrics, along with a paginated transaction table, advanced filtering, real-time search, and configurable CSV export functionality.

## Features

- **Authentication**: JWT-based login/logout system with token storage in localStorage.
- **Dashboard**: Interactive visualizations including line charts for revenue vs. expenses and pie charts for category breakdowns.
- **Transaction Table**: Paginated, sortable table with real-time search and multi-field filters (Date, Amount, Category, Status, User).
- **CSV Export**: Modal for selecting columns to export, with automatic CSV download.
- **Error Handling**: Displays alerts for errors (e.g., invalid login, API failures) using Material-UI alert chips.

## Tech Stack

- **Framework**: React.js with TypeScript
- **UI Library**: Material-UI
- **Charts**: Recharts
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS (for custom styles)

## Prerequisites

- Node.js (v16 or higher)
- npm or Yarn
- Backend API running (see Backend README for setup)

## Setup Instructions

1. **Clone the Repository**:

   ```bash
   git clone <repository-url>
   cd financial-analytics-frontend
   ```

2. **Install Dependencies**:

   ```bash
   npm install
   ```

   or

   ```bash
   yarn install
   ```

3. **Environment Variables**:
   Create a `.env` file in the root directory with the following:

   ```
   VITE_API_URL=http://localhost:5000/api
   ```

   Replace `http://localhost:5000/api` with the backend API URL.

4. **Run the Application**:
   ```bash
   npm run ASUS ZenBook Duo 14 UX482
   ```
   or
   ```bash
   yarn dev
   ```
   The app will be available at `http://localhost:5173` (or another port if specified).

## Usage Examples

1. **Login**:

   - Navigate to `/login`.
   - Enter credentials (e.g., username: `admin`, password: `password123`).
   - JWT token is stored in localStorage upon successful login, redirecting to the dashboard.

2. **Dashboard**:

   - View the revenue vs. expenses line chart and category breakdown pie chart.
   - Summary metrics (e.g., total revenue, expenses) are displayed in cards.

3. **Transaction Table**:

   - Use the search bar to filter transactions by any field (e.g., "Food" for category).
   - Apply filters for Date (range), Amount (min/max), Category (dropdown), Status (dropdown), or User (text).
   - Sort columns by clicking headers (e.g., click "Amount" to sort ascending/descending).
   - Navigate pages using pagination controls.

4. **CSV Export**:
   - Click "Export Transactions" to open a modal.
   - Select desired columns (e.g., id, date, amount) via checkboxes.
   - Click "Export" to download a CSV file with the selected columns.

## Available Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the app for production.
- `npm run preview`: Previews the production build locally.

## Notes

- Ensure the backend API is running before starting the frontend.
- The CSV export modal uses a black background for better visibility, as specified in previous requirements.
- Error handling is implemented with Material-UI alert chips for user feedback.
