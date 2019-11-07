import express from "express";
import http from "http";
import socketIo, { Socket } from "socket.io";
import Runner from "./Runner";
import { Scene } from "three";
import registry from "./registry";
import ComponentData from "./ComponentData";

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static("dist"));

interface Client {
    socket: Socket
};

const clients: { [id: string]: Client } = {};

interface Update {
    time: number;
    components: { [id: string]: any }
};

const scene = new Scene();
const runner = new Runner(true, scene, undefined, undefined);

function spawn(data: ComponentData) {
    const factory = registry[data.type];
    if (factory == null) {
        throw new Error(`factory not found for type ${data.type}`);
    }
    const component = factory();
    component.isServer = true;
    component.id = data.id;
    component.ownerId = data.ownerId;
    runner.addComponent(component);
    component.deserialize(data.data);
};

io.on("connection", (socket) => {
    if (clients[socket.id] == null) {
        clients[socket.id] = {
            socket
        };
    }
    console.log("connected");

    socket.on("spawn", (data: ComponentData[]) => {
        data.forEach(d => {
            spawn(d);
        });
    });

    socket.on("disconnect", () => {
        console.log("left");
        delete clients[socket.id];
    });
});

const dt = 1000 / 60;
let time = 0;
setInterval(() => {
    time += dt;
    for (let id in clients) {
        const client = clients[id];
        const socket = client.socket;
        const components = {};
        const update: Update = {
            time,
            components
        };
        socket.emit("update", update);
    }

    runner.update();
}, dt);

server.listen(3000, () => {
    console.log(":3000");
});