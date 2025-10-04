# 🚀 Quick Start Guide

## Fix Common Errors

### 1. Environment Variables Error

If you see this error:
```
taskService.js:3 Uncaught ReferenceError: process is not defined
```

### Solution:

1. **Create `.env` file** in the root directory:
```bash
touch .env
```

2. **Add the following content** to `.env`:
```env
# API Configuration
VITE_API_URL=http://localhost:3000/api

# App Configuration
VITE_APP_NAME=Task Management System
VITE_APP_VERSION=1.0.0

# Development Configuration
VITE_DEV_MODE=true
```

3. **Restart the development server**:
```bash
npm run dev
```

### 2. Vue Component Error

If you see this error:
```
Uncaught (in promise) TypeError: Cannot read properties of null (reading 'emitsOptions')
```

**Solution**: This error has been fixed by adding `emits: []` to all components. The application should work correctly now.

### 3. Login/Register Navigation Error

If you experience issues with navigation after login/register:

**Solution**: The navigation logic has been improved with proper timing and error handling.

## 🎯 Ready to Use!

After creating the `.env` file, your application should work perfectly!

### Available Routes:
- **Dashboard**: `/dashboard` - Main dashboard with stats
- **Tasks**: `/tasks` - Task management page
- **Reports**: `/reports` - Reports listing
- **Create Report**: `/reports/create` - Create new report
- **Admin**: `/admin` - Admin panel (admin only)

### Features:
- ✅ Modern UI with gradients and animations
- ✅ Responsive design for all devices
- ✅ Task management with search and filtering
- ✅ Report creation with task linking
- ✅ Admin panel for task assignment
- ✅ Real-time statistics dashboard

## 🔧 Troubleshooting

### Common Issues:

1. **Environment Variables Not Working**
   - Make sure `.env` file is in the root directory
   - Use `VITE_` prefix for all environment variables
   - Restart the development server after changes

2. **API Connection Issues**
   - Check if backend server is running on port 3000
   - Verify API endpoints in browser network tab
   - Update `VITE_API_URL` in `.env` if needed

3. **Build Issues**
   - Run `npm install` to ensure all dependencies are installed
   - Clear node_modules and reinstall if needed
   - Check for TypeScript errors if using TypeScript

## 📞 Need Help?

Check the main README.md for detailed documentation and troubleshooting guides.
