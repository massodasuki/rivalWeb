# RivalWeb

## API Routing Contract

The frontend always calls API endpoints using the `/api` prefix.

In local development and production builds, `/api` is **not** a backend prefix. It is stripped by the proxy layer:

- Vite dev server rewrites `/api/*` to `/*` before forwarding to the backend.
- Nginx in production rewrites `/api/*` to `/*` before forwarding to the backend.

### Implications

- Backend controllers should **not** include the `/api` prefix (e.g. `@Controller('teams')`, not `@Controller('api/teams')`).
- Frontend services should call paths like `/api/teams`, `/api/matches`, etc.
- Socket.IO connects via `/socket.io` at the same origin (proxied in dev/prod).

### Environment Variables

- `VITE_BACKEND_URL`: Leave empty to use same-origin + proxy. Only set this if you are bypassing the proxy and hitting the backend directly.
- `VITE_API_URL`: Leave empty to use the proxy. Only set if you want a custom base URL for HTTP calls.
