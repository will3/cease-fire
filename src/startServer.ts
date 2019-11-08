import express from "express";
import http from "http";
import SocketIO from "socket.io";
import { Scene } from "three";

import componentFactory from "./componentFactory";
import Runner from "./core/Runner";
import createServer from "./networking/Server";

const app = express();
const httpServer = http.createServer(app);
const io = SocketIO(httpServer);

app.use(express.static("dist"));

const scene = new Scene();
const runner = new Runner(scene, undefined, undefined);

const dt = 1000 / 60;
const server = createServer({
    componentFactory,
    io,
    runner,
});

setInterval(() => {
    server.update();
    runner.update();
}, dt);

httpServer.listen(3000, () => {
    console.log(":3000");
});
