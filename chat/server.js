const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

app.use(express.static(__dirname));

io.on('connection', (socket) => {
  socket.on('set_nickname', (nickname) => {
    socket.nickname = nickname;
    io.emit('message', `${nickname} 加入了聊天室！`);
  });

  socket.on('chat_message', (msg) => {
    io.emit('message', `${socket.nickname}：${msg}`);
  });

  socket.on('disconnect', () => {
    if (socket.nickname) io.emit('message', `${socket.nickname} 离开了聊天室！`);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`服务运行在 http://localhost:${PORT}`);
});