# Organise Todo API

A small REST API that stores the Personal Organiser todo list in the MongoDB database `Todo`, collection `todos`.

## Run locally

1. Install Node.js 20 or newer.
2. Run `npm install`.
3. Set `MONGODB_URI` to a MongoDB connection string.
4. Create a Clerk application and set `CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`.
5. Sign in to the app once, then set `TODO_OWNER_USER_ID` to your Clerk user ID. Only this account can access the todo list.
6. Set `CLIENT_ORIGIN` to the frontend origin (comma-separated if there is more than one).
7. Run `npm start`; the API listens on port `10000` by default.

## Endpoints

- `GET /health` reports service and MongoDB connection status.
- `GET /api/todos` returns `{ "todos": [...] }`.
- `POST /api/todos` creates a task. JSON fields: `title` (required), `priority` (`low`, `normal`, or `high`), `dueDate` (`YYYY-MM-DD` or `null`), and `completed`.
- `PATCH /api/todos/:id` updates one or more task fields.
- `DELETE /api/todos/:id` removes a task.

All `/api/todos` routes require a valid Clerk session, and only the user configured by `TODO_OWNER_USER_ID` can access the shared list. Tasks include MongoDB `_id`, `createdAt`, and `updatedAt` fields. The API validates user-provided fields and only allows the configured client origins.

## Sign-in

Configure Google sign-in, passkeys, and email sign-in in the Clerk Dashboard. The Organise app uses Clerk's hosted sign-in UI, which supports mobile browsers and passkeys such as Face ID on compatible iPhones. CORS is an additional browser restriction, not a replacement for authentication.

## Deploy to Render

Create a Render Web Service from this repository and use the included `render.yaml` Blueprint settings. Set `MONGODB_URI`, `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `TODO_OWNER_USER_ID`, and `CLIENT_ORIGIN` in Render. For `CLIENT_ORIGIN`, use the exact deployed frontend origin (scheme and hostname, without a trailing slash). Set the API's Render URL as `REACT_APP_TODO_API_URL` and the Clerk publishable key as `REACT_APP_CLERK_PUBLISHABLE_KEY` in the Organise frontend build environment, then rebuild the app. No shared API token is needed.
