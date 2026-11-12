# Organise Todo API

A small REST API that stores the Personal Organiser todo list in the MongoDB database `Todo`, collection `todos`.

## Run locally

1. Install Node.js 20 or newer.
2. Run `npm install`.
3. Copy `.env.example` to `.env` and set `MONGODB_URI` to a MongoDB connection string.
4. Generate a strong token with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` and set it as `TODO_API_TOKEN`.
5. Set `CLIENT_ORIGIN` to the frontend origin (comma-separated if there is more than one).
6. Run `npm start`; the API listens on port `10000` by default.

## Endpoints

- `GET /health` reports service and MongoDB connection status.
- `GET /api/todos` returns `{ "todos": [...] }`.
- `POST /api/todos` creates a task. JSON fields: `title` (required), `priority` (`low`, `normal`, or `high`), `dueDate` (`YYYY-MM-DD` or `null`), and `completed`.
- `PATCH /api/todos/:id` updates one or more task fields.
- `DELETE /api/todos/:id` removes a task.

All `/api/todos` routes require `Authorization: Bearer <TODO_API_TOKEN>`. Tasks include MongoDB `_id`, `createdAt`, and `updatedAt` fields. The API validates user-provided fields and only allows the configured client origins.

## Access control

The API requires a random token of at least 32 characters for every todo operation. Keep it private: enter the same token into the todo page when unlocking your list. CORS is an additional browser restriction, not a replacement for the token.

## Deploy to Render

Create a Render Web Service from this repository and use the included `render.yaml` Blueprint settings. Set the prompted `MONGODB_URI`, `TODO_API_TOKEN`, and `CLIENT_ORIGIN` environment variables in Render. For `CLIENT_ORIGIN`, use the exact deployed frontend origin (scheme and hostname, without a trailing slash). Set the API's Render URL as `REACT_APP_TODO_API_URL` in the frontend build environment and rebuild the frontend. Enter the `TODO_API_TOKEN` in the todo page to unlock the list; it is kept only in the current page session.
