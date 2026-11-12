# Organise Todo API

A small REST API that stores the Personal Organiser todo list in MongoDB.

## Run locally

1. Install Node.js 20 or newer.
2. Run `npm install`.
3. Copy `.env.example` to `.env` and set `MONGODB_URI` to a MongoDB connection string.
4. Set `CLIENT_ORIGIN` to the frontend origin (comma-separated if there is more than one).
5. Run `npm start`; the API listens on port `10000` by default.

## Endpoints

- `GET /health` reports service and MongoDB connection status.
- `GET /api/todos` returns `{ "todos": [...] }`.
- `POST /api/todos` creates a task. JSON fields: `title` (required), `priority` (`low`, `normal`, or `high`), `dueDate` (`YYYY-MM-DD` or `null`), and `completed`.
- `PATCH /api/todos/:id` updates one or more task fields.
- `DELETE /api/todos/:id` removes a task.

Tasks include MongoDB `_id`, `createdAt`, and `updatedAt` fields. The API validates user-provided fields and only allows the configured client origins.

## Access control

The API currently has no user authentication. CORS limits which browser origins can read responses, but it does not prevent direct API access. Do not put sensitive or private task data in a publicly reachable deployment until authentication is added.

## Deploy to Render

Create a Render Web Service from this repository and use the included `render.yaml` Blueprint settings. Set the prompted `MONGODB_URI` and `CLIENT_ORIGIN` environment variables in Render. For `CLIENT_ORIGIN`, use the exact deployed frontend origin (scheme and hostname, without a trailing slash). After deployment, set `REACT_APP_TODO_API_URL` in the frontend build environment to the API's Render URL and rebuild the frontend.
