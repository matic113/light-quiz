# Light Quiz Platform

A comprehensive online quiz management platform built with Angular 19, featuring role-based access control, AI-powered grading, analytics, and advanced quiz management capabilities.

![Light Quiz Platform](https://github.com/user-attachments/assets/0f3ef0c4-20d5-4d6e-9b87-c15d0acd53fc)

## 🚀 Features

### 👨‍🏫 **Teacher Features**
- **Quiz Creation**: Multiple choice, true/false, and short answer questions with image support
- **Analytics Dashboard**: Quiz statistics, grade distribution charts, and performance analysis
- **Group Management**: Create student groups and manage memberships
- **AI-Powered Grading**: Automatic grading with manual override capabilities
- **Push Notifications**: Send alerts and announcements to student groups

### 👨‍🎓 **Student Features**
- **Quiz Taking**: Intuitive interface with timer and auto-save progress
- **Results & Analytics**: Detailed score breakdown and performance history
- **Group Participation**: Join groups and view group-specific quizzes

### 🔐 **Core Features**
- JWT-based authentication with role-based access control
- Responsive design with TailwindCSS and Angular Material
- Environment-based API configuration
- Mobile-optimized interface

## 🛠️ Technology Stack

- **Frontend**: Angular 19 + TypeScript
- **Styling**: TailwindCSS 4.0 + Angular Material
- **Authentication**: JWT tokens
- **Backend API**: .NET Core (required dependency)

## 📋 Prerequisites

- **Node.js** (v18+) and **NPM** (v9+)
- **Angular CLI** (v19+)
- **Backend API**: [Light Quiz API](https://github.com/matic113/light-quiz-api) (required)

## 🚀 Quick Start

### 1. Clone and Install
```bash
git clone https://github.com/matic113/light-quiz.git
cd light-quiz
npm install
```

### 2. Configure Environment
```bash
# Switch to local development
npm run env:local

# Other options: staging, production
npm run env:staging
npm run env:production
```

### 3. Start Development
```bash
npm run start
# Application available at http://localhost:4200
```

## 🔧 Available Scripts

```bash
npm run start                     # Start development server
npm run build                 # Build for production

# Environment Management
npm run env:local             # Local API configuration
npm run env:staging           # Staging API configuration
npm run env:production        # Production API configuration
```

## 🌐 API Dependency

This frontend requires the Light Quiz .NET API to function:
- **Repository**: [https://github.com/matic113/light-quiz-api](https://github.com/matic113/light-quiz-api)
- **Required for**: Authentication, quiz data, analytics, file uploads, AI grading

## 📱 Mobile App

A Flutter mobile app for students is also available (repository link coming soon).

## 📁 Key Components

- **Quiz Creation Flow**: Multi-step wizard for creating and configuring quizzes
- **Grading System**: Automatic + AI-assisted grading with manual review
- **Analytics Dashboard**: Performance metrics with interactive charts
- **Group Management**: Student organization and quiz assignment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'Add feature'`
4. Push and submit a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

- Create GitHub issues for bugs/features
- Check [Environment Setup Guide](ENVIRONMENT_SETUP.md) for configuration help