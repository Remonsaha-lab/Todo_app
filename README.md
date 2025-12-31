Full Stack Todo App (Simple In-Memory Demo)

## Deployment on Netlify

This project has been configured for deployment on Netlify using Serverless Functions.

1.  Connect this repository to Netlify.
2.  Deploy! (Configuration is handled by `netlify.toml`).

### Local Development (Serverless)
To run locally with `netlify-cli`:
```bash
npm install -g netlify-cli
netlify dev
```

### Legacy Node Server
To run the old backend (without serverless):
1.  `node server.js`
2.  Note: The frontend is now configured to call `/api/...`. You may need to revert frontend changes to point to `/` if you want to use the raw `server.js` or update `server.js` to handle `/api` routes.

## Endpoints (Netlify)
- POST `/api/signup`
- POST `/api/signin`
- GET `/api/todos`
- ...

## Notes
- Data is in-memory; server/function restart clears users & todos.
- JWT secret is hard-coded for simplicity.

