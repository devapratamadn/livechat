// server.js
const path = require("path");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
  console.log("user connected:", socket.id);

  socket.on("chat:message", (payload, ack) => {
    const msg = {
      id: cryptoRandom(),
      user: String(payload?.user || "Anon"),
      text: String(payload?.text || "").slice(0, 1000),
      at: new Date().toISOString(),
    };
    // KIRIM KE SEMUA KLIEN KECUALI PENGIRIM
    socket.broadcast.emit("chat:message", msg);

    // opsional kirim ACK ke pengirim (tanpa broadcast balik)
    if (typeof ack === "function") ack({ ok: true, id: msg.id, at: msg.at });
  });

  socket.on("chat:typing", (user) => {
    socket.broadcast.emit("chat:typing", user);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected:", socket.id);
  });
});

function cryptoRandom(len = 8) {
  return Math.random().toString(36).slice(2, 2 + len);
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
