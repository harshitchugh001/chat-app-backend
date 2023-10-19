const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');

require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);



// Connect to the database
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('DB Connected'))
.catch(err => console.error(`DB connection error: ${err.message}`));

// Import routes
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');

app.get('/', (req, res) => {
  res.send('Hello from Node API');
});

// Middlewares
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(
  cors({
    origin: 'http://localhost:3000', // Allow requests from your React app's origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Allow credentials (cookies, etc.) to be sent with requests
    transport: ['websocket'], // Allow WebSocket transport
    allowedHeaders: ['my-custom-header'], // Specify custom headers if needed
  })
);

// Middleware
app.use('/api', authRoutes);
app.use('/api/chat', chatRoutes);

// Set up Socket.io
const chatNamespace = io.of('/chat');
chatNamespace.on('connection', (socket) => {
  console.log('A user connected to /chat');

  socket.on('chatMessage', (data) => {
    // Handle the chat message and emit it to other connected clients
    chatNamespace.emit('chatMessages', data);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected from /chat');
  });
});


const port = process.env.PORT || 8000;

server.listen(port, () => {
  console.log(`API is running on port ${port}`);
});

module.exports = app;
