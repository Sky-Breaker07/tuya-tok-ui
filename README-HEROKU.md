# Deploying TikTok Integration UI to Heroku

This guide provides instructions for deploying the TikTok Integration UI to Heroku.

## Prerequisites

- Heroku CLI installed
- Git installed
- Heroku account

## Deployment Options

### Option 1: Standard Deployment (Recommended)

1. Login to Heroku CLI:
   ```
   heroku login
   ```

2. Create a new Heroku app:
   ```
   heroku create tiktok-integration-ui
   ```

3. Set buildpacks:
   ```
   heroku buildpacks:set heroku/nodejs
   ```

4. Configure environment variables:
   ```
   heroku config:set VITE_API_URL=https://your-backend-api-url.com
   heroku config:set NODE_ENV=production
   ```

5. Add Heroku remote:
   ```
   heroku git:remote -a tiktok-integration-ui
   ```

6. Push to Heroku:
   ```
   git push heroku main
   ```

### Option 2: Using Heroku Static Buildpack

1. Login to Heroku CLI:
   ```
   heroku login
   ```

2. Create a new Heroku app:
   ```
   heroku create tiktok-integration-ui
   ```

3. Set buildpacks:
   ```
   heroku buildpacks:set heroku/nodejs
   heroku buildpacks:add https://github.com/heroku/heroku-buildpack-static.git
   ```

4. Configure environment variables:
   ```
   heroku config:set VITE_API_URL=https://your-backend-api-url.com
   heroku config:set NODE_ENV=production
   ```

5. Add Heroku remote:
   ```
   heroku git:remote -a tiktok-integration-ui
   ```

6. Push to Heroku:
   ```
   git push heroku main
   ```

### Option 3: Using Docker Deployment

1. Login to Heroku CLI:
   ```
   heroku login
   ```

2. Create a new Heroku app:
   ```
   heroku create tiktok-integration-ui
   ```

3. Set the stack to container:
   ```
   heroku stack:set container
   ```

4. Configure environment variables:
   ```
   heroku config:set VITE_API_URL=https://your-backend-api-url.com
   heroku config:set NODE_ENV=production
   ```

5. Add Heroku remote:
   ```
   heroku git:remote -a tiktok-integration-ui
   ```

6. Push to Heroku:
   ```
   git push heroku main
   ```

## Important Notes

1. **WebSocket Connection**: Update your WebSocket connection code to use the same host as your API requests:

```javascript
import { io } from 'socket.io-client';

// Get the current URL to determine the WebSocket host
const getWebSocketUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    // In production, use the same host (for Heroku, etc.)
    return undefined; // Socket.IO will use the current host automatically
  } else {
    // In development, use localhost with the specific port
    return 'http://localhost:8800';
  }
};

const socket = io(getWebSocketUrl());
```

2. **CORS Settings**: Ensure your backend has proper CORS settings for your Heroku app domain.

3. **Environment Variables**: Make sure to set all required environment variables in Heroku.

4. **Scaling**: For better performance, consider upgrading from the free tier:
   ```
   heroku ps:scale web=1:standard-1x
   ```

5. **Logs**: Check application logs if you encounter issues:
   ```
   heroku logs --tail
   ```

6. **pnpm Support**: This deployment is configured to use pnpm. Heroku will automatically install pnpm during the build process. 