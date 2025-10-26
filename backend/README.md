# Backend — Auth + Tasks
## Env
- `DATABASE_URL=postgresql://user:password@db:5432/tasks`
- `JWT_SECRET=supersecret`
- `PORT=4000`

## Run (example)
- `npx prisma generate`
- `npm run build && node dist/main.js`

## API
### Auth
- `POST /auth/register` `{ email, password, name? }` → `{ token }`
- `POST /auth/login` `{ email, password }` → `{ token }`

### Tasks (Bearer token)
- `GET /tasks?page=1&pageSize=10&status=TODO&priority=HIGH&overdue=true`
- `POST /tasks` `{ title, description?, dueDate?, priority?, status? }`
- `GET /tasks/:id`
- `PUT /tasks/:id` (campos parciais)
- `DELETE /tasks/:id`

## cURL
```bash
# register
curl -sS http://localhost:4000/auth/register -H 'content-type: application/json' -d '{"email":"test@example.com","password":"password123"}'
# login
TOKEN=$(curl -sS http://localhost:4000/auth/login -H 'content-type: application/json' -d '{"email":"test@example.com","password":"password123"}' | jq -r .token)
# create task
curl -sS http://localhost:4000/tasks -H "authorization: Bearer $TOKEN" -H 'content-type: application/json' -d '{"title":"Primeira tarefa"}'
# list
curl -sS 'http://localhost:4000/tasks?page=1&pageSize=5' -H "authorization: Bearer $TOKEN"
```
