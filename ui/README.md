# Welcome to React Router!

## Development

1. Run pnpm i
1. Copy env.json.example and rename to `env.json`
1. Open MS Entra ID and create a new app registration called 'Localhost Dev App on Port 5173'
1. Copy the Application (client) ID and Directory (tenant) ID
1. Edit ui\auth\msalInstance.ts and insert the above Client ID and Tenant ID.
1. Run `pnpm run dev`

## Deployment

First, build your app for production:

```sh
pnpm run build
```

Then run the app in production mode:

```sh
pnpm start
```

Now you'll need to pick a host to deploy it to.

### DIY

If you're familiar with deploying node applications, the built-in React Router app server is production-ready.

Make sure to deploy the output of `react-router build`

# ui

This folder contains the frontend application, built with React and Vite. It includes all client-side code, components, and assets.
