const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" },
});

app.use(express.static("public")); // Sirve los archivos de la carpeta "public"

let users = {};

io.on("connection", (socket) => {
    console.log("Un usuario se conectó");

    socket.on("join", (username) => {
        const color = "#" + Math.floor(Math.random() * 16777215).toString(16);
        users[socket.id] = { username, color };
        socket.emit("userColor", color);
        io.emit("message", { username: "Sistema", text: `${username} se unió al chat.`, color: "#888" });
    });

    socket.on("message", (text) => {
        if (users[socket.id]) {
            io.emit("message", {
                username: users[socket.id].username,
                text,
                color: users[socket.id].color,
            });
        }
    });

    socket.on("disconnect", () => {
        if (users[socket.id]) {
            io.emit("message", { username: "Sistema", text: `${users[socket.id].username} salió del chat.`, color: "#888" });
            delete users[socket.id];
        }
    });
});

server.listen(3000, () => {
    console.log("Servidor corriendo en el puerto 3000");
});
