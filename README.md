# Task Board — Backend

RESTful API for a Trello-like task management app, built for the Software Engineer Intern technical assignment.

## Tech Stack
- **Runtime**: Node.js + Express.js
- **Database**: MongoDB with Mongoose ODM
- **Auth**: JWT (JSON Web Tokens) + bcrypt password hashing
- **Env management**: dotenv

## Why these choices
- Express is lightweight and well documented, good fit for a small REST API on a deadline.
- MongoDB/Mongoose keeps the Task/User schema flexible and pairs well with a free-tier Atlas cluster for deployment.
- JWT keeps the API stateless — no server-side session store needed, which simplifies deploying frontend and backend separately.

## Project Structure
```
backend/
  server.js                 # app entrypoint
  src/
    config/db.js            # MongoDB connection
    models/                 # User, Task Mongoose schemas
    middleware/auth.js       # JWT verification + admin guard
    controllers/            # route handlers / business logic
    routes/                 # Express routers
    seed/seedAdmin.js       # creates the admin account (admins are NOT registered via API)
```

## Environment Variables
Copy `.env.example` to `.env` and fill in real values:

| Variable | Description |
|---|---|
| `PORT` | Port the API listens on (default 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign JWTs — use a long random string |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `7d` |
| `CORS_ORIGIN` | URL of the deployed frontend, for CORS |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` | Used only by `npm run seed:admin` |

## Setup
```bash
npm install
cp .env.example .env   # then edit .env
npm run seed:admin     # creates the administrator account
npm run dev            # starts the server with nodemon
```

## API Overview

| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register a normal user |
| POST | `/api/auth/login` | Public | Log in, returns JWT |
| GET | `/api/auth/me` | Authenticated | Get current user |
| GET | `/api/tasks` | Authenticated | List tasks (scoped by role) |
| POST | `/api/tasks` | Authenticated | Create a task |
| PATCH | `/api/tasks/:id` | Creator or Admin | Edit title/description |
| PATCH | `/api/tasks/:id/status` | Creator, Assignee, or Admin | Move task between columns |
| PATCH | `/api/tasks/:id/assign` | Self (if unassigned) or Admin (any user) | Assign/reassign a task |
| DELETE | `/api/tasks/:id` | Creator or Admin | Delete a task |
| GET | `/api/users` | Admin only | List all users |

## Role Rules Enforced Server-Side
- Normal users can only assign **unassigned** tasks, and only **to themselves**.
- Admins can assign/reassign any task to any user, and view all tasks/users.
- Status updates are allowed for the task's creator, its assignee, or an admin.
- Editing/deleting a task is restricted to its creator or an admin.

## Deployment Notes
Deployed on [Render / Railway — fill in], with `MONGO_URI` pointed at a MongoDB Atlas cluster. Remember to set `CORS_ORIGIN` to the deployed frontend's URL.
