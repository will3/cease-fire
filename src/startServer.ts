import express from "express";
import http from "http";
import SocketIO, { Socket } from "socket.io";
import Runner from "./core/Runner";
import { Scene } from "three";
import createServer from "./networking/Server";
import componentFactory from "./componentFactory";

const app = express();
const httpServer = http.createServer(app);
const io = SocketIO(httpServer);

app.use(express.static("dist"));

const scene = new Scene();
const runner = new Runner(true, scene, undefined, undefined);

const dt = 1000 / 60;
const server = createServer({
    io,
    runner,
    componentFactory
});

setInterval(() => {
    server.update();
    runner.update();
}, dt);

httpServer.listen(3000, () => {
    console.log(":3000");
});