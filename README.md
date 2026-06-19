# AI ChatBot

A modern, full-stack AI chatbot application built with React, Node.js, Express, MongoDB, and Groq API. Designed as a portfolio project showcasing full-stack development skills.

![Tech Stack](https://img.shields.io/badge/React-18-blue) ![Node.js](https://img.shields.io/badge/Node.js-18+-green) ![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green) ![Groq](https://img.shields.io/badge/Groq-OpenAI%20Compatible-111827)

## Features

- **ChatGPT-like UI** — Modern, responsive chat interface with user messages on the right and AI messages on the left
- **Groq AI** — Powered by Groq's OpenAI-compatible chat API
- **MongoDB Storage** — Persistent conversation and message storage
- **Conversation Management** — Create, search, delete, and switch between chats
- **Dark/Light Mode** — Theme toggle with system preference detection
- **Markdown Rendering** — AI responses rendered with full markdown support
- **Code Syntax Highlighting** — Syntax-highlighted code blocks in responses
- **Export Chat** — Download conversations as `.txt` files
- **Toast Notifications** — User feedback for actions
- **Typing Indicator** — Animated dots while AI is responding
- **Auto-scroll** — Automatically scrolls to the latest message

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18, Vite, Tailwind CSS        |
| Backend    | Node.js, Express.js                 |
| Database   | MongoDB Atlas                       |
| AI         | Groq API                            |
| Deployment | AWS EC2, S3, Nginx, PM2            |

## Project Structure

```
chatbot/
├── src/                          # Frontend (React)
│   ├── components/
│   │   ├── ChatSidebar.jsx       # Conversation list & search
│   │   ├── ChatWindow.jsx        # Main chat area
│   │   ├── MessageBubble.jsx     # Individual message
│   │   ├── MessageInput.jsx      # Text input & send
│   │   ├── MarkdownRenderer.jsx  # Markdown + code highlighting
│   │   ├── TypingIndicator.jsx   # AI typing animation
│   │   ├── ThemeToggle.jsx       # Dark/light mode switch
│   │   ├── ToastContainer.jsx    # Notification toasts
│   │   └── LoadingSpinner.jsx    # Loading animation
│   ├── pages/
│   │   └── ChatPage.jsx          # Main page layout
│   ├── services/
│   │   └── api.js                # Backend API client
│   ├── hooks/
│   │   ├── useChat.js            # Chat state management
│   │   ├── useTheme.js           # Theme persistence
│   │   └── useToast.js           # Toast notifications
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── server/                       # Backend (Express)
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── models/
│   │   ├── Conversation.js       # Conversation schema
│   │   └── Message.js            # Message schema
│   ├── controllers/
│   │   └── chatController.js     # Business logic + Grok
│   ├── routes/
│   │   └── chatRoutes.js         # API route definitions
│   ├── server.js                 # Entry point
│   ├── package.json
│   └── .env.example
├── package.json                  # Frontend dependencies
├── vite.config.js
├── tailwind.config.js
├── .env.example
└── README.md
```

## Database Schemas

### Conversations Collection

```javascript
{
  _id: ObjectId,
  title: String,        // Auto-generated from first message
  createdAt: Date,      // Auto (timestamps)
  updatedAt: Date       // Auto (timestamps)
}
```

### Messages Collection

```javascript
{
  _id: ObjectId,
  conversationId: ObjectId,  // References Conversation
  sender: "user" | "ai",
  content: String,
  timestamp: Date
}
```

## API Endpoints

| Method | Endpoint          | Description                          |
|--------|-------------------|--------------------------------------|
| POST   | `/api/chat`       | Send message, get AI response        |
| GET    | `/api/chats`      | List all conversations (with search) |
| GET    | `/api/chat/:id`   | Get conversation with messages       |
| DELETE | `/api/chat/:id`   | Delete conversation and messages     |
| GET    | `/health`         | Health check endpoint                |

### POST /api/chat

**Request:**
```json
{
  "message": "Hello, how are you?",
  "conversationId": "optional-existing-id"
}
```

**Response:**
```json
{
  "conversationId": "abc123",
  "title": "Greeting Conversation",
  "userMessage": { "_id": "...", "sender": "user", "content": "...", "timestamp": "..." },
  "aiMessage": { "_id": "...", "sender": "ai", "content": "...", "timestamp": "..." }
}
```

## Installation Guide

### Prerequisites

- **Node.js** 18+ ([download](https://nodejs.org/))
- **MongoDB Atlas** account ([sign up free](https://www.mongodb.com/atlas))
- **Groq API key** ([get key](https://console.groq.com/keys))

### Step 1: Clone the Repository

```bash
git clone <your-repo-url>
cd chatbot
```

### Step 2: Set Up MongoDB Atlas

1. Log in to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a free cluster (M0 Sandbox)
3. Go to **Database Access** → Add a database user with password
4. Go to **Network Access** → Add IP Address → Allow access from anywhere (`0.0.0.0/0`) for development
5. Go to **Database** → Connect → Choose "Connect your application"
6. Copy the connection string

### Step 3: Get Groq API Key

1. Visit [Groq Console](https://console.groq.com/keys)
2. Create a new API key
3. Copy the generated key

### Step 4: Configure Backend

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/ai-chatbot?retryWrites=true&w=majority
GROQ_API_KEY=your_actual_groq_api_key
GROQ_MODEL=llama-3.1-8b-instant
CLIENT_URL=http://localhost:5173
```

Install and start the backend:

```bash
npm install
npm run dev
```

The server will start at `http://localhost:5000`.

### Step 5: Configure Frontend

Open a new terminal:

```bash
cd chatbot
cp .env.example .env
```

Edit `.env` (optional — Vite proxy handles this in dev):

```env
VITE_API_URL=http://localhost:5000/api
```

Install and start the frontend:

```bash
npm install
npm run dev
```

The app will open at `http://localhost:5173`.

### Step 6: Verify

1. Open `http://localhost:5173` in your browser
2. Type a message and press Enter
3. You should see the AI response with markdown rendering
4. Check the sidebar for saved conversations

---

## Deployment Guide

### 1. MongoDB Atlas (Production)

1. Create a production cluster (or use the existing free tier)
2. **Network Access**: Add your EC2 instance's public IP (or `0.0.0.0/0` with strong credentials)
3. **Database Access**: Create a dedicated production user with a strong password
4. Note the connection string for the backend `.env`

### 2. AWS EC2 Backend Deployment

#### Launch EC2 Instance

1. Go to AWS Console → EC2 → Launch Instance
2. Choose **Ubuntu 22.04 LTS**, `t2.micro` (free tier)
3. Configure Security Group:
   - SSH (22) — Your IP
   - HTTP (80) — Anywhere
   - HTTPS (443) — Anywhere
   - Custom TCP (5000) — Anywhere (temporary, Nginx will proxy)
4. Launch and download the `.pem` key file

#### Connect and Set Up Server

```bash
# Connect to EC2
ssh -i your-key.pem ubuntu@<ec2-public-ip>

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install Git
sudo apt install -y git
```

#### Deploy Backend Code

```bash
# Clone your repository
git clone <your-repo-url> ~/chatbot
cd ~/chatbot/server

# Create production .env
nano .env
```

Production `.env`:

```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/ai-chatbot?retryWrites=true&w=majority
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.1-8b-instant
CLIENT_URL=https://your-s3-bucket-url.s3.amazonaws.com
```

```bash
# Install dependencies
npm install --production

# Start with PM2
pm2 start server.js --name "ai-chatbot"

# Save PM2 process list (auto-restart on reboot)
pm2 save
pm2 startup
# Run the command PM2 outputs
```

#### PM2 Useful Commands

```bash
pm2 status              # Check process status
pm2 logs ai-chatbot     # View logs
pm2 restart ai-chatbot  # Restart app
pm2 stop ai-chatbot     # Stop app
pm2 monit               # Real-time monitoring
```

### 3. Nginx Reverse Proxy

```bash
sudo nano /etc/nginx/sites-available/ai-chatbot
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;  # or EC2 public IP

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    location /health {
        proxy_pass http://localhost:5000;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/chatbot /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Optional: SSL with Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### 4. AWS S3 Frontend Deployment

#### Build the Frontend

On your local machine:

```bash
cd chatbot

# Set production API URL
echo "VITE_API_URL=https://your-domain.com/api" > .env.production

# Build
npm run build
```

This creates a `dist/` folder with static files.

#### Create S3 Bucket

1. AWS Console → S3 → Create Bucket
2. Bucket name: `your-chatbot-frontend` (must be globally unique)
3. Uncheck "Block all public access" (needed for static hosting)
4. Create bucket

#### Enable Static Website Hosting

1. Go to bucket → Properties → Static website hosting → Enable
2. Index document: `index.html`
3. Error document: `index.html` (for SPA routing)
4. Note the website endpoint URL

#### Upload Build Files

```bash
# Install AWS CLI if not already installed
# https://aws.amazon.com/cli/

aws configure
# Enter your AWS Access Key, Secret Key, and region

# Upload dist folder
aws s3 sync dist/ s3://chatbot2105 --delete
```

#### Set Bucket Policy

Go to bucket → Permissions → Bucket Policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-chatbot-frontend/*"
    }
  ]
}
```

#### Optional: CloudFront CDN

For better performance and HTTPS:

1. AWS Console → CloudFront → Create Distribution
2. Origin: Your S3 bucket website endpoint
3. Default root object: `index.html`
4. Create custom error response: 403 → `/index.html` (for SPA routing)
5. Use the CloudFront URL as your frontend URL
6. Update `CLIENT_URL` in backend `.env` to the CloudFront URL

### 5. Update CORS for Production

In `server/.env`, set `CLIENT_URL` to your S3/CloudFront URL:

```env
CLIENT_URL=https://your-chatbot-frontend.s3-website-us-east-1.amazonaws.com
```

Restart the backend:

```bash
pm2 restart ai-chatbot
```

---

## Environment Variables Reference

### Backend (`server/.env`)

| Variable       | Description                    | Example                                    |
|----------------|--------------------------------|--------------------------------------------|
| `PORT`         | Server port                    | `5000`                                     |
| `NODE_ENV`     | Environment                    | `development` or `production`              |
| `MONGODB_URI`  | MongoDB Atlas connection string| `mongodb+srv://user:pass@cluster...`       |
| `GROQ_API_KEY`  | Groq API key                   | `gsk_...`                                  |
| `GROQ_MODEL`    | Groq model name                | `llama-3.1-8b-instant`                     |
| `CLIENT_URL`   | Frontend URL for CORS          | `http://localhost:5173`                    |

### Frontend (`.env`)

| Variable        | Description          | Example                      |
|-----------------|----------------------|------------------------------|
| `VITE_API_URL`  | Backend API base URL | `http://localhost:5000/api`  |

---

## Scripts

### Frontend

```bash
npm run dev       # Start development server (port 5173)
npm run build     # Build for production
npm run preview   # Preview production build
```

### Backend

```bash
npm run dev       # Start with nodemon (auto-reload)
npm start         # Start production server
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `MongoDB connection error` | Check `MONGODB_URI`, ensure IP is whitelisted in Atlas |
| `Failed to process message` | Verify `GROQ_API_KEY` is valid and has quota |
| CORS errors in browser | Ensure `CLIENT_URL` in backend `.env` matches frontend URL |
| Blank page after S3 deploy | Set error document to `index.html` in S3 static hosting |
| PM2 app crashes | Run `pm2 logs ai-chatbot` to check error details |

---

## License

MIT License — free to use for portfolio and learning purposes.

## Author

Built as a student portfolio project demonstrating full-stack development with modern technologies.
