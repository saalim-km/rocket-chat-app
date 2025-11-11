# 🚀 Conversa - Real-Time Chat App (React + Rocket.Chat)

A modern chat application built from scratch using **React (Vite)** and **Tailwind CSS**, powered by a **Rocket.Chat backend (via Docker)**.  
Conversa replicates popular chat tools like **Slack** or **Microsoft Teams**, supporting real-time group and private messaging.

---

## 📂 Directory Structure

```
saalim-km-conversa/
├── docker-compose.yml        # Rocket.Chat + MongoDB setup
├── .env.example               # Example environment variables
├── README.md                  # Project documentation
└── chat-app/                  # Frontend (React + Vite)
    ├── components.json
    ├── eslint.config.js
    ├── vite.config.js
    ├── jsconfig.json
    ├── index.html
    ├── package.json
    ├── public/
    ├── lib/
    │   └── utils.js
    ├── components/
    │   └── ui/
    │       ├── avatar.jsx
    │       ├── button.jsx
    │       ├── card.jsx
    │       ├── dropdown-menu.jsx
    │       ├── input.jsx
    │       ├── label.jsx
    │       └── textarea.jsx
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── index.css
        ├── assets/
        ├── contexts/
        │   └── AuthContext.jsx
        ├── services/
        │   └── rocketchat.js
        └── components/
            ├── AdminRoute.jsx
            ├── ChannelManagement.jsx
            ├── ChatLayout.jsx
            ├── Dashboard.jsx
            ├── Header.jsx
            ├── Login.jsx
            ├── Message.jsx
            ├── MessageInput.jsx
            ├── MessageList.jsx
            ├── Profile.jsx
            ├── ProtectedRoute.jsx
            ├── PublicRoute.jsx
            ├── RoomList.jsx
            ├── Sidebar.jsx
            └── Thread.jsx
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Docker & Docker Compose
- Node.js (v20.19+ or v22.12+)
- Git

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd saalim-km-conversa
```

### 2. Configure Environment Variables
```bash
cp .env.example .env
```
Then update `REG_TOKEN` and other values as needed.

### 3. Start Rocket.Chat Server
```bash
docker-compose up -d
```
Rocket.Chat will be available at: `http://localhost:3000`

### 4. Start the React App
```bash
cd chat-app
npm install
npm run dev
```
Visit `http://localhost:5173` to access the chat UI.

---

## 💬 Core Features

- 🔐 **User Authentication** (username/password)
- 💬 **Real-Time Messaging**
- 🧑‍🤝‍🧑 **Room & Channel Management**
- 🎨 **Responsive Tailwind UI**
- 🔄 **Message Auto-Refresh (3s polling)**
- ⚙️ **Admin/User Role Routing**
- 🧠 **Context-Based Auth State Management**

---

## 🔧 Configuration

### React Environment Variables (`chat-app/.env`)
```
VITE_ROCKETCHAT_URL=http://localhost:3000
```

### Docker Configuration (`docker-compose.yml`)
- **Rocket.Chat 7.7.9**
- **MongoDB 8.0**
- Persistent volumes for data storage

---

## 🧰 API Integration (Rocket.Chat REST API v1)

| Action | Endpoint | Method |
|--------|-----------|--------|
| Login | `/api/v1/login` | POST |
| Get Rooms | `/api/v1/rooms.get` | GET |
| Get Messages | `/api/v1/channels.history` | GET |
| Send Message | `/api/v1/chat.sendMessage` | POST |

---

## 🧱 Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Rocket.Chat (Dockerized)
- **Database**: MongoDB 8.0
- **Communication**: REST API (Axios)

---

## 🧪 Troubleshooting

**Common Issues:**
1. **Rocket.Chat not starting**
   ```bash
   docker logs rocketchat
   docker-compose restart
   ```
2. **CORS Error**
   Enable CORS in Rocket.Chat → Admin → Settings → REST API → Set `*`
3. **Login Fails**
   Check if user exists and Rocket.Chat is running
4. **No Channels Visible**
   Ensure user is added to at least one room

---

## 📦 Deployment

### Build Production App
```bash
cd chat-app
npm run build
```
Serve the generated `dist/` folder via any static server.

### Docker Production
- Update environment variables
- Use NGINX reverse proxy
- Configure SSL and restricted CORS origins

---

## 📝 License
MIT License - Free to use and modify.

---

## 🤝 Contributing
1. Fork this repo
2. Create a feature branch
3. Commit and push your changes
4. Submit a PR

---

**Happy Chatting with Conversa!**
