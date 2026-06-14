# SoprAHR - E-Learning Platform

A comprehensive full-stack e-learning and HR management platform built with modern web technologies. This platform enables organizations to manage training programs, conduct assessments, facilitate collaboration, and track employee progress.

## 🎯 Overview

SoprAHR is a full-featured e-learning platform designed for HR departments and educational organizations. It provides comprehensive tools for:

- **Course & Training Management**: Create, manage, and track training programs
- **Assessment & Quizzes**: Conduct online assessments and quizzes with AI-powered question generation
- **Real-time Communication**: Video conferencing, chat, and messaging capabilities
- **Progress Tracking**: Monitor learner progress and performance
- **Content Management**: Manage articles, lessons, and learning materials
- **Certification**: Issue and manage certificates for completed courses
- **Social Features**: Follow other users, engage with content, and build professional networks

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library with modern hooks and features
- **Vite** - Fast build tool and dev server
- **Material-UI (MUI)** - Comprehensive component library
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Chart.js** - Data visualization
- **Face API.js** - Face detection and recognition
- **Axios** - HTTP client
- **i18next** - Internationalization support
- **React PDF Viewer** - PDF viewing capabilities
- **Lottie** - Animation library for interactive graphics

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **Socket.io** - Real-time bidirectional communication
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing
- **Cloudinary** - Image and file hosting
- **Daily.co** - Video conferencing API
- **Twilio** - SMS and communication services
- **Nodemailer** - Email service
- **Multer** - File upload handling
- **Node-Cron** - Job scheduling

## ✨ Features

### User Management
- User registration and authentication
- Profile management
- Role-based access control
- Follow/follower system

### Learning Management
- Course creation and management
- Lesson and article creation
- Progress tracking
- Certification system

### Assessment & Quizzes
- Quiz creation and management
- AI-powered question generation
- Real-time quiz evaluation
- Performance analytics

### Collaboration
- Real-time video conferencing (Daily.co)
- Chat and messaging system
- Discussion forums
- Event management and scheduling

### Content & Resources
- Article management and publishing
- Saved articles and bookmarks
- File uploads and management
- PDF content delivery

### Analytics & Reporting
- User performance dashboards
- Progress visualization
- Attendance tracking
- Quiz result analytics

### Additional Features
- Email notifications
- SMS alerts (via Twilio)
- Cloud file storage (Cloudinary)
- Real-time notifications
- Search functionality
- Multi-language support

## 📁 Project Structure

```
e-learning/
├── Client/                          # Frontend React application
│   ├── src/
│   │   ├── components/             # Reusable React components
│   │   ├── assets/                 # Images, fonts, and static files
│   │   ├── App.jsx                 # Main App component
│   │   └── main.jsx                # Entry point
│   ├── public/                     # Public assets
│   ├── index.html                  # HTML template
│   ├── vite.config.js              # Vite configuration
│   ├── eslint.config.js            # ESLint rules
│   └── package.json                # Frontend dependencies
│
└── Server/                          # Backend Node.js application
    ├── controllers/                # Route controllers
    ├── models/                     # MongoDB schemas and models
    ├── routes/                     # API routes
    ├── middleware/                 # Custom middleware
    ├── config/                     # Configuration files
    ├── IA_model/                   # AI/ML model files
    ├── utils/                      # Utility functions
    ├── scripts/                    # Database seeding scripts
    ├── public/                     # Public uploads directory
    ├── index.js                    # Server entry point
    └── package.json                # Backend dependencies
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v14.0.0 or higher)
- **npm** or **yarn** package manager
- **MongoDB** (local or Atlas cloud)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd e-learning
   ```

2. **Install Server Dependencies**
   ```bash
   cd Server
   npm install
   ```

3. **Install Client Dependencies**
   ```bash
   cd ../Client
   npm install
   ```

## ⚙️ Environment Variables

### Server Setup

Create a `.env` file in the `Server` directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/soprahr
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/soprahr

# JWT
JWT_SECRET=your_jwt_secret_key_here

# Email Service (Nodemailer)
EMAIL_HOST=your_email_host
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASSWORD=your_email_password

# Cloudinary (File Storage)
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Daily.co (Video Conferencing)
DAILY_API_KEY=your_daily_api_key

# Twilio (SMS Service)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Server Port
PORT=5000

# CORS Configuration
CLIENT_URL=http://localhost:5173
```

### Client Setup

Create a `.env` file in the `Client` directory:

```env
VITE_API_URL=http://localhost:5000
```

## ▶️ Running the Application

### Development Mode

1. **Start MongoDB** (if running locally)
   ```bash
   mongod
   ```

2. **Start the Backend Server**
   ```bash
   cd Server
   npm run dev
   ```
   The server will run on `http://localhost:5000`

3. **Start the Frontend Development Server** (in another terminal)
   ```bash
   cd Client
   npm run dev
   ```
   The client will run on `http://localhost:5173`

### Production Mode

1. **Build the Frontend**
   ```bash
   cd Client
   npm run build
   ```

2. **Start the Backend Server**
   ```bash
   cd Server
   npm start
   ```


## 💾 Database

### MongoDB Schema Overview

The application uses MongoDB with Mongoose ODM. Main collections include:

- **Users** - User accounts and authentication
- **Formations** - Courses and training programs
- **Lessons** - Lesson content
- **Quizzes** - Assessment and quiz data
- **Articles** - Educational articles
- **Progress** - User progress tracking
- **Certificates** - Issued certificates
- **Comments** - User comments and discussions
- **Notifications** - User notifications

### Database Connection

MongoDB connection is configured in `Server/config/db.js`. Update the connection string in your `.env` file.

## 📖 Scripts

### Server Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server with auto-reload
npm run seed:test  # Seed database with test data
npm test           # Run tests (configure as needed)
```

### Client Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build locally
npm run lint       # Run ESLint
```

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit your changes: `git commit -m 'Add your feature'`
3. Push to the branch: `git push origin feature/your-feature`
4. Submit a pull request

## 📝 License

This project is licensed under the ISC License. See the LICENSE file for details.

## 📧 Support

For issues, questions, or suggestions, please create an issue in the repository.

## 🎓 Additional Notes

- The application includes AI model integration in `Server/IA_model/` for intelligent question generation
- Real-time features use Socket.io for instant updates
- File uploads are handled through Cloudinary integration
- Video conferencing is powered by Daily.co
- The application supports internationalization (i18n) for multiple languages

---

**Last Updated**: 2026-06-14

**Version**: 1.0.0
