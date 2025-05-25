# Environment Configuration Setup

This document explains how to use the new environment configuration system to manage different API hosts for development and production.

## Overview

The environment configuration system allows you to:
- Use different API endpoints for development and production
- Easily switch between local and remote APIs
- Centralize environment-specific settings

## Files Created

### 1. Environment Files

- `src/environments/environment.ts` - Development configuration
- `src/environments/environment.prod.ts` - Production configuration

### 2. Services

- `src/app/services/api.service.ts` - Centralized API service

## Configuration

### Development Environment (`src/environments/environment.ts`)

```typescript
export const environment = {
  production: false,
  apiUrl: 'https://localhost:5001', // Change this to your local API URL
  apiHost: 'https://localhost:5001/api'
};
```

### Production Environment (`src/environments/environment.prod.ts`)

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.theknight.tech',
  apiHost: 'https://api.theknight.tech/api'
};
```

## Usage

### 1. Using Environment Variables Directly

```typescript
import { environment } from '../../environments/environment';

// In your component or service
const apiUrl = environment.apiUrl;
const apiHost = environment.apiHost;
```

### 2. Using the Centralized API Service

```typescript
import { ApiService } from '../services/api.service';

// In your component
constructor(private apiService: ApiService) {}

// GET request
this.apiService.get<any[]>('/quiz/all').subscribe(data => {
  console.log(data);
});

// POST request
this.apiService.post<any>('/quiz', quizData).subscribe(response => {
  console.log(response);
});

// DELETE request
this.apiService.delete<void>(`/quiz/${quizId}`).subscribe(() => {
  console.log('Quiz deleted');
});
```

## Building and Running

### Development Mode

```bash
# Uses environment.ts (development configuration)
ng serve
```

### Production Mode

```bash
# Uses environment.prod.ts (production configuration)
ng build --configuration=production
```

## Quick Environment Switching

Use the provided npm scripts to quickly switch between environments:

```bash
# Switch to local development (localhost:3000)
npm run env:local

# Switch to staging environment
npm run env:staging

# Switch to production environment
npm run env:production

# Show available environments
npm run env:help
```

## Updating Your Local Development

To test against your local API:

### Option 1: Use the Environment Switcher (Recommended)

1. Run the local environment command:
   ```bash
   npm run env:local
   ```

2. If your local API runs on a different port, edit `scripts/switch-env.js` and update the local configuration:
   ```javascript
   local: {
     production: false,
     apiUrl: 'http://localhost:YOUR_PORT',
     apiHost: 'http://localhost:YOUR_PORT/api'
   }
   ```

3. Start your local API server

4. Run the Angular development server:
   ```bash
   ng serve
   ```

### Option 2: Manual Configuration

1. Update `src/environments/environment.ts`:
   ```typescript
   export const environment = {
     production: false,
     apiUrl: 'http://localhost:YOUR_PORT', // Replace with your local API port
     apiHost: 'http://localhost:YOUR_PORT/api'
   };
   ```

2. Start your local API server

3. Run the Angular development server:
   ```bash
   ng serve
   ```

## Migration Guide

### Before (Hardcoded URLs)

```typescript
// Old way - hardcoded URLs
this.http.get('https://api.theknight.tech/api/quiz/all')
```

### After (Environment Configuration)

```typescript
// New way - using environment
import { environment } from '../../environments/environment';

this.http.get(`${environment.apiHost}/quiz/all`)

// Or using the API service
this.apiService.get('/quiz/all')
```

## Updated Services

The following services have been updated to use environment configuration:

- `AuthService` - Authentication endpoints
- `QuizzesService` - Quiz-related endpoints  
- `ImageUploadService` - Image upload endpoints
- `QuizzesComponent` - Component using API calls

## NPM Scripts Added

The following npm scripts have been added to `package.json`:

- `npm run env:local` - Switch to local development environment
- `npm run env:staging` - Switch to staging environment  
- `npm run env:production` - Switch to production environment
- `npm run env:help` - Show available environments

## Benefits

1. **Environment Separation**: Clear separation between dev and prod configurations
2. **Easy Testing**: Switch to local API for development and testing
3. **Centralized Configuration**: All environment settings in one place
4. **Type Safety**: TypeScript support for environment variables
5. **Build-time Configuration**: Different builds use appropriate configurations

## Troubleshooting

### CORS Issues with Local API

If you encounter CORS issues when connecting to your local API, make sure your local API server has CORS enabled for your Angular development server (usually `http://localhost:4200`).

### Port Configuration

Make sure the ports in your environment configuration match your actual local API server ports.

### Build Issues

If you encounter build issues, ensure that:
1. Both environment files exist
2. The file replacement configuration in `angular.json` is correct
3. All imports use the correct path to the environment file 