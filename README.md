Full Stack Todo App (Simple In-Memory Demo)

How to run backend:
1. cd login_page
2. npm install express cors jsonwebtoken (if not already installed)
3. node server.js

Endpoints:
- POST /signup {username, password} -> returns {token}
- POST /signin {username, password} -> returns {token}
- GET /todos (auth) -> list todos
- POST /todos {text} (auth) -> create
- PUT /todos/:id {completed} (auth) -> toggle complete
- DELETE /todos/:id (auth) -> delete

Auth:
Send header Authorization: Bearer <token>

Frontend:
Open login_page/login.html in a static server (recommended) or via live server extension. After login it redirects to todo_page/index.html.

Notes:
- Data is in-memory; server restart clears users & todos.
- JWT secret is hard-coded for simplicity.
- Not production ready; for learning only.
