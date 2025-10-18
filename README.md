# React Chat App with Rocket.Chat

A modern React chat application that connects to a local Rocket.Chat server. Built with Vite, React, and styled with CSS.

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 20.19+ or 22.12+ (for the React app)
- Git

### Clone and Setup

```bash
git clone <your-repo-url>
cd rocketchat-example
```

### Get Registration Token for Rocketchat
Signup on https://cloud.rocket.chat/home

Click on `Register Self Managed`  - copy token 

### Update env vars 
Copy .env.example to `.env`
Update value for `REG_TOKEN`


### Start Rocket.Chat Server

```bash
# Start MongoDB and Rocket.Chat
docker-compose up -d

```

### 4. Start React Example Chat App

```bash
cd chat-app
npm install
npm run dev
```

The React app will be available at `http://localhost:5173` (or another port if 5173 is busy).

## 🔐 Creating Users in Rocket.Chat

### Method 1: Through Admin Panel (Recommended)

1. **Login as Admin**: Go to `http://localhost:3000` and login with your admin credentials
2. **Navigate to Users**: Go to **Administration** → **Users**
3. **Create New User**: Click **+ New** button
4. **Fill User Details**:
   - **Name**: Full name (e.g., "Test User")
   - **Username**: Login username (e.g., "testuser")
   - **Email**: Email address (e.g., "test@example.com")
   - **Password**: Set a password
   - **Roles**: Leave as "user" (default)
5. **Save**: Click **Save** to create the user

### Method 2: Using API (Advanced)

```bash
# Install axios if not already installed
npm install axios

# Run the user creation script
node create-user-script.js
```

## 🎯 Features

- 🔐 **Authentication**: Login with username/password
- 💬 **Real-time Chat**: Send and receive messages in real-time
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🎨 **Modern UI**: Clean, intuitive interface
- 🔄 **Auto-refresh**: Messages update every 3 seconds
- 📋 **Room Management**: Browse and select different channels/rooms

## 🏗️ Project Structure

```
rocketchat-example/
├── chat-app/                    # React application
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── Login.jsx       # Login form
│   │   │   ├── ChatLayout.jsx  # Main chat container
│   │   │   ├── RoomList.jsx    # Sidebar with rooms
│   │   │   ├── MessageList.jsx # Message display
│   │   │   ├── MessageInput.jsx# Message input form
│   │   │   └── Message.jsx     # Individual message
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx # Authentication state
│   │   ├── services/
│   │   │   └── rocketchat.js   # API integration
│   │   └── App.jsx             # Main app component
│   ├── .env                    # Environment variables
│   └── package.json
├── docker-compose.yml          # Rocket.Chat + MongoDB setup
├── create-user-script.js       # User creation helper
└── README.md                   # This file
```

## ⚙️ Configuration

### Environment Variables

The React app uses these environment variables (in `chat-app/.env`):

```env
VITE_ROCKETCHAT_URL=http://localhost:3000
```

### Docker Compose Configuration

The `docker-compose.yml` file sets up:
- **MongoDB 8.0**: Database with replica set
- **Rocket.Chat 7.7.9**: Chat server
- **Persistent volumes**: Data persistence across restarts

## 🔧 Troubleshooting

### Common Issues

1. **Rocket.Chat not starting**:
   ```bash
   # Check logs
   docker logs rocketchat
   
   # Restart services
   docker-compose down && docker-compose up -d
   ```

2. **CORS errors in React app**:
   - Make sure CORS is enabled in Rocket.Chat admin settings
   - Go to `http://localhost:3000/admin/settings/General` → **REST API** → **CORS** → Enable and set to `*`

3. **Login failed**:
   - Verify Rocket.Chat is running: `curl http://localhost:3000`
   - Check if user exists in Rocket.Chat admin panel
   - Ensure CORS is properly configured

4. **No rooms/channels**:
   - Make sure you're logged in with a user that has access to channels
   - Check if the user is added to channels in Rocket.Chat admin panel

5. **Messages not loading**:
   - Check browser console for API errors
   - Verify authentication token is valid
   - Ensure you've selected a room/channel

### Development

- **Hot Reload**: The React app supports hot module replacement
- **API Errors**: Check browser console for detailed error messages
- **Rocket.Chat Logs**: Use `docker logs rocketchat -f` to follow logs

## 🚀 Deployment

### Production Setup

1. **Update Environment Variables**:
   ```env
   VITE_ROCKETCHAT_URL=https://your-rocketchat-domain.com
   ```

2. **Build React App**:
   ```bash
   cd chat-app
   npm run build
   ```

3. **Deploy**: Serve the `dist` folder with any static file server

### Docker Production

For production, consider:
- Using environment-specific Docker Compose files
- Setting up proper SSL certificates
- Configuring proper CORS origins instead of `*`
- Using a reverse proxy (nginx)

## 📚 API Integration

The app uses Rocket.Chat's REST API v1:

- **Authentication**: `POST /api/v1/login`
- **Get Rooms**: `GET /api/v1/rooms.get`
- **Get Messages**: `GET /api/v1/channels.history`
- **Send Message**: `POST /api/v1/chat.sendMessage`

## 🛠️ Technologies Used

- **React 18**: UI framework
- **Vite**: Build tool and dev server
- **Axios**: HTTP client for API calls
- **CSS3**: Modern styling with flexbox/grid
- **Rocket.Chat 7.7.9**: Backend chat server
- **MongoDB 8.0**: Database
- **Docker**: Containerization

## 📝 License

MIT License - feel free to use this project for learning and development.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review Rocket.Chat logs: `docker logs rocketchat`
3. Check browser console for errors
4. Ensure all prerequisites are met

---

**Happy Chatting! 🎉**

