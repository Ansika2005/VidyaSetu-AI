# VidyaSetu-AI 🎓

VidyaSetu-AI is an innovative educational platform that leverages artificial intelligence to enhance the learning experience for students, teachers, and parents. Built for Hackofesta-AIspire 6.0, this platform integrates various AI-powered features to revolutionize traditional education methods.

## 🌟 Features

### For Students
- **Study Buddy AI** 🤖
  - 24/7 AI-powered learning assistant
  - Personalized homework help
  - Interactive practice problems
  - Instant doubt resolution

### For Teachers
- **AI Quiz Generator** 📝
  - Generate quizzes from PDF/text content
  - Multiple question types support
  - Adjustable difficulty levels
  - Instant quiz creation and customization
- **Class Management** 👥
  - Track student attendance
  - Monitor progress
  - Manage assignments

### For Parents
- **Progress Tracking** 📊
  - Real-time academic performance monitoring
  - Direct communication with teachers
  - Activity notifications

## 🛠️ Technology Stack

- **Frontend**
  - HTML5
  - CSS3
  - JavaScript
  - Bootstrap 5
  - Font Awesome

- **Backend**
  - Node.js
  - Express.js
  - PostgreSQL
  - JWT Authentication

- **AI Integration**
  - Google Gemini AI
  - PDF Parser
  - Natural Language Processing

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ansika2005/VidyaSetu-AI.git
   cd VidyaSetu-AI
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies (if using npm)
   cd ..
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the backend directory:
   ```env
   PORT=5000
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_HOST=localhost
   DB_NAME=vidyasetu
   DB_PORT=5432
   JWT_SECRET=your_jwt_secret
   GOOGLE_AI_KEY=your_gemini_api_key
   ```

4. **Set up the database**
   ```bash
   # Create database tables
   psql -U your_db_user -d vidyasetu -f data.sql
   psql -U your_db_user -d vidyasetu -f backend/migrations.sql
   ```

5. **Run the application**
   ```bash
   # Start backend server
   cd backend
   npm start

   # Open index.html in your browser
   ```

## 📱 Features in Detail

### Study Buddy AI
- Real-time AI tutoring
- Subject-specific assistance
- Interactive learning sessions
- Progress tracking

### AI Quiz Generator
- PDF/Text content analysis
- Multiple question types
- Difficulty level adjustment
- Answer key generation
- Quiz customization options

### Parent-Teacher Communication
- Real-time updates
- Progress reports
- Direct messaging
- Event notifications

## 👥 Contributing

We welcome contributions to VidyaSetu-AI! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


## 🙏 Acknowledgments

- Hackofesta-AIspire 6.0 for the platform
- Google Gemini AI for powering our AI features
- All contributors and supporters

## 📞 Contact

For any queries or suggestions, please reach out to us at [ansingh5824@gmail.com]

---
Made with ❤️ for Hackofesta-AIspire 6.0
contributers:Team Leader:Ansika Singh(ansingh5824@gmail.com)-backend API(javascript) Integration and frontend(html,css,javascript):(https://github.com/Ansika2005)
Team Members:
1.Nikita Jaiswal-frontend(html,css,javascript):(https://github.com/NikitaJaiswal13)
2.Anamika Sharma:email[anamikasharmamgahv@gmail.com](https://github.com/AnamikaSharma1509)



