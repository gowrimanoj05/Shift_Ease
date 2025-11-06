# ShiftEase - Smart Shift Calendar & Chatbot System

A full-stack web application for managing employee work shifts with an integrated chatbot assistant and intelligent shift swap system.

## 🚀 Features

- **Shift Calendar**: Interactive calendar view for employees to see their work schedules
- **AI Chatbot**: Dialogflow-powered assistant for shift queries and swap requests
- **Smart Shift Swapping**: Automated matching system for shift swap requests
- **Admin Dashboard**: Comprehensive management interface for HR/managers
- **Real-time Updates**: Dynamic calendar updates and notifications
- **Secure Authentication**: JWT-based authentication with role-based access

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- Google Cloud Platform account (for Dialogflow)
- npm or yarn

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd shiftease
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/shiftease
JWT_SECRET=your_super_secret_jwt_key
DIALOGFLOW_PROJECT_ID=your-dialogflow-project-id
DIALOGFLOW_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
DIALOGFLOW_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYourKey\n-----END PRIVATE KEY-----\n"
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create a `.env` file in the frontend directory:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 4. Dialogflow Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Dialogflow API
4. Create a service account and download the JSON key
5. Create intents in Dialogflow:
   - **GetNextShift**: Training phrases like "When is my next shift?", "What's my schedule?"
   - **RequestShiftSwap**: Training phrases like "I want to swap my shift", "Can I change shifts?"
6. Copy the project ID and service account credentials to your `.env` file

## 🚦 Running the Application

### Start Backend Server
```bash
cd backend
npm run dev
```

The backend will run on `http://localhost:5000`

### Start Frontend Application
```bash
cd frontend
npm start
```

The frontend will run on `http://localhost:3000`

## 👥 Default User Roles

### Admin Account
- Email: admin@shiftease.com
- Password: admin123
- Role: admin

### Employee Account
- Email: employee@shiftease.com
- Password: employee123
- Role: employee

*Note: Create these accounts through the registration page*

## 📱 Usage

### For Employees

1. **Login**: Sign in with your credentials
2. **View Calendar**: See all your assigned shifts in the calendar view
3. **Chat Assistant**: Click the chatbot icon to ask about shifts
4. **Request Swap**: Click on a shift and request a swap with reason
5. **Track Requests**: View status of your swap requests

### For Administrators

1. **Login**: Sign in with admin credentials
2. **Manage Shifts**: Add, edit, or delete employee shifts
3. **Approve Swaps**: Review and approve/reject shift swap requests
4. **View All Schedules**: See shifts for all employees

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Shifts
- `GET /api/shifts/my-shifts` - Get logged-in user's shifts
- `GET /api/shifts/all` - Get all shifts (admin)
- `GET /api/shifts/next-shift` - Get next upcoming shift
- `POST /api/shifts` - Create shift (admin)
- `PUT /api/shifts/:id` - Update shift (admin)
- `DELETE /api/shifts/:id` - Delete shift (admin)

### Swap Requests
- `GET /api/swap-requests` - Get swap requests
- `POST /api/swap-requests` - Create swap request
- `PUT /api/swap-requests/:id/approve` - Approve request (admin)
- `PUT /api/swap-requests/:id/reject` - Reject request (admin)

### Dialogflow
- `POST /api/dialogflow/detect-intent` - Process chatbot message
- `POST /api/dialogflow/webhook` - Dialogflow webhook

## 🎨 Technologies Used

### Frontend
- React.js
- React Router
- React Big Calendar
- Tailwind CSS
- Axios
- Lucide React (icons)

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs
- Dialogflow SDK

### DevOps
- CORS
- dotenv
- Nodemon

## 📦 Project Structure
```
shiftease/
├── backend/
│   ├── src/
│   │   ├── config/          # Database and Dialogflow config
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # API routes
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Auth middleware
│   │   └── server.js        # Entry point
│   ├── .env
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── context/         # React context
│   │   ├── services/        # API services
│   │   ├── App.jsx
│   │   └── index.js
│   ├── .env
│   └── package.json
└── README.md
```

## 🔐 Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Protected routes with middleware
- Role-based access control
- CORS configuration
- Environment variable protection

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Verify your MongoDB URI is correct
- Ensure your IP address is whitelisted in MongoDB Atlas
- Check if MongoDB Atlas cluster is running

### Dialogflow Issues
- Verify service account credentials
- Ensure Dialogflow API is enabled
- Check project ID matches
- Verify private key format (should include \n for newlines)

### CORS Errors
- Ensure backend CORS is configured correctly
- Check frontend API URL matches backend port
- Verify credentials are being sent with requests

## 🚀 Deployment

### Backend Deployment (Heroku/Railway)
```bash
# Add Procfile
echo "web: node src/server.js" > Procfile

# Deploy
git push heroku main
```

### Frontend Deployment (Vercel/Netlify)
```bash
# Build
npm run build

# Deploy build folder
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Future Enhancements

- [ ] Email notifications for shift assignments
- [ ] Mobile app (React Native)
- [ ] Push notifications for swap approvals
- [ ] Advanced analytics dashboard
- [ ] Recurring shift templates
- [ ] Export calendar to iCal/Google Calendar
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Shift conflict detection
- [ ] Employee availability management

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Your Name - [your-email@example.com](mailto:your-email@example.com)

## 🙏 Acknowledgments

- React Big Calendar for the calendar component
- Dialogflow for natural language processing
- MongoDB Atlas for database hosting
- Tailwind CSS for styling
- Lucide React for icons

## 📞 Support

For support, email support@shiftease.com or open an issue in the repository.

---

**Happy Shift Management! 🎉**