import express from 'express'
import cors from 'cors'
import { Server as SocketServer } from 'socket.io'
import http from 'node:http'
import { PORT } from './config.js'

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const staticFolderPath = join(__dirname, 'dist');

const app = express()
app.use(cors({
  // origin: 'http://localhost:5173'
  origin: '*'
}))

const server = http.createServer(app)

const io = new SocketServer(server, {
  cors: {
    // origin: 'http://localhost:5173'
    origin: '*'
  }
})

io.on('connection', (socket) => {
  let userName = socket.id
  userName = userName.slice(0, 4)

  socket.on(`client:message`, (newMessage) => {
    let secret = newMessage[1] ?? 'password'
    socket.broadcast.emit(`server:message:${secret}`, {
      body: newMessage[0],
      from: userName
    })
  })
})

app.use('/', express.static(staticFolderPath));

app.use((req, res, next) => {
  res.status(404).send("<h1>NOT FOUND</h1>");
});

server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))