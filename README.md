# Task Management System - Frontend

A modern, responsive Vue.js application for managing tasks and reports with a beautiful UI/UX design.

## 🚀 Features

### ✨ Modern UI/UX
- **Gradient Design**: Beautiful gradient backgrounds and modern card layouts
- **Responsive Design**: Fully responsive across all devices (desktop, tablet, mobile)
- **Smooth Animations**: Hover effects, transitions, and micro-interactions
- **Dark/Light Theme**: Consistent color scheme with accessibility in mind

### 📋 Task Management
- **Task Creation**: Admins can create and assign tasks to users
- **Task Tracking**: Users can view, update status, and track their assigned tasks
- **Task Search**: Advanced search functionality for finding tasks
- **Priority Levels**: Low, Medium, High, and Urgent priority levels
- **Status Management**: Pending, In Progress, Completed, Cancelled
- **Due Date Tracking**: Visual indicators for overdue tasks

### 📊 Report System
- **Report Creation**: Create detailed reports with rich text content
- **Task Linking**: Link reports to specific tasks for better organization
- **Auto-fill Features**: Task titles auto-fill when linking to tasks
- **Tag System**: Organize reports with custom tags
- **Status Tracking**: Draft, Submitted, Approved, Rejected statuses

### 👥 User Management
- **Role-based Access**: Admin and User roles with different permissions
- **User Authentication**: Secure login and registration system
- **Profile Management**: User profile information and settings

### 📈 Dashboard Analytics
- **Statistics Cards**: Real-time stats for tasks and reports
- **Quick Actions**: Easy access to common functions
- **Recent Activity**: Latest reports and tasks at a glance
- **Progress Tracking**: Visual progress indicators

## 🛠️ Technology Stack

- **Frontend Framework**: Vue.js 3 with Composition API
- **State Management**: Vuex 4
- **Routing**: Vue Router 4
- **Styling**: CSS3 with modern features (Grid, Flexbox, Gradients)
- **Icons**: Font Awesome 6.4.0
- **Fonts**: Inter (Google Fonts)
- **Build Tool**: Vite
- **Package Manager**: npm

## 📁 Project Structure

```
src/
├── components/
│   ├── Layout/
│   │   └── AppHeader.vue          # Global navigation header
│   ├── Auth/
│   │   ├── LoginForm.vue          # User login form
│   │   └── RegisterForm.vue       # User registration form
│   ├── Dashboard/
│   │   ├── DashboardHeader.vue    # Dashboard header (legacy)
│   │   └── UserInfo.vue           # User information display
│   ├── Reports/
│   │   ├── ReportCard.vue         # Individual report card
│   │   ├── ReportForm.vue         # Create/Edit report form
│   │   ├── ReportFilters.vue      # Report filtering options
│   │   ├── ReportsList.vue        # List of reports
│   │   └── Pagination.vue         # Pagination component
│   └── Tasks/
│       └── TaskSearch.vue         # Task search component
├── views/
│   ├── DashboardView.vue          # Main dashboard
│   ├── TasksView.vue              # Task management page
│   ├── ReportsView.vue            # Reports listing page
│   ├── CreateReportView.vue       # Create new report
│   ├── EditReportView.vue         # Edit existing report
│   ├── ReportDetailView.vue       # View report details
│   ├── AdminView.vue              # Admin panel
│   ├── LoginView.vue              # Login page
│   ├── RegisterView.vue           # Registration page
│   └── NotFoundView.vue           # 404 error page
├── store/
│   ├── index.js                   # Vuex store configuration
│   ├── auth.js                    # Authentication state
│   ├── reports.js                 # Reports state management
│   └── tasks.js                   # Tasks state management
├── services/
│   ├── authService.js             # Authentication API calls
│   ├── reportService.js           # Reports API calls
│   └── taskService.js             # Tasks API calls
├── router/
│   └── index.js                   # Vue Router configuration
├── assets/
│   └── styles/
│       └── main.css               # Global styles and utilities
└── main.js                        # Application entry point
```

## 🎨 Design System

### Color Palette
- **Primary**: `#667eea` to `#764ba2` (Gradient)
- **Secondary**: `#6c757d` to `#495057` (Gradient)
- **Success**: `#28a745` to `#20c997` (Gradient)
- **Danger**: `#dc3545` to `#c82333` (Gradient)
- **Warning**: `#ffc107` to `#fd7e14` (Gradient)
- **Info**: `#17a2b8` to `#6f42c1` (Gradient)

### Typography
- **Font Family**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700, 800
- **Sizes**: Responsive scaling from 12px to 2.5rem

### Components
- **Cards**: Rounded corners (16px), subtle shadows, hover effects
- **Buttons**: Gradient backgrounds, hover animations, icon support
- **Forms**: Modern input styling, focus states, validation
- **Navigation**: Sticky header, responsive menu, active states

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm (v8 or higher)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd reportFE
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
# API Configuration
VITE_API_URL=http://localhost:3000/api

# App Configuration
VITE_APP_NAME=Task Management System
VITE_APP_VERSION=1.0.0

# Development Configuration
VITE_DEV_MODE=true
```

**Note**: In Vite, environment variables must be prefixed with `VITE_` to be accessible in the client-side code.

### API Integration
The application expects a backend API with the following endpoints:

- **Authentication**: `/api/auth/*`
- **Users**: `/api/users/*`
- **Tasks**: `/api/tasks/*`
- **Reports**: `/api/reports/*`

## 📱 Responsive Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🎯 Key Features Implementation

### Task Management Flow
1. **Admin creates task** → Assigns to user
2. **User receives task** → Views in dashboard
3. **User updates status** → Tracks progress
4. **User creates report** → Links to task
5. **Admin monitors** → Reviews progress

### Report Creation Flow
1. **Select task** (optional) → Auto-fills title
2. **Add content** → Rich text description
3. **Set category** → Daily, Weekly, Monthly
4. **Add tags** → Custom organization
5. **Submit report** → Status tracking

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Route Guards**: Protected routes based on user roles
- **Input Validation**: Client-side form validation
- **XSS Protection**: Sanitized user inputs

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Run all tests
npm run test:all
```

## 📦 Deployment

### Vercel
```bash
npm run build
# Deploy to Vercel
```

### Netlify
```bash
npm run build
# Deploy to Netlify
```

### Docker
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Vue.js Team** for the amazing framework
- **Font Awesome** for the beautiful icons
- **Google Fonts** for the Inter font family
- **Vite Team** for the fast build tool

## 📞 Support

For support, email support@taskmanagement.com or create an issue in the repository.

---

**Made with ❤️ and Vue.js**