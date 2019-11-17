import express from "express";
import http from "http";
import SocketIO from "socket.io";
import { Scene, Vector2, Vector3 } from "three";

import componentFactory from "./componentFactory";
import AsteroidField from "./components/AsteroidField";
import Runner from "./core/Runner";
import createServer from "./networking/Server";

const app = express();
const httpServer = http.createServer(app);
const io = SocketIO(httpServer);

app.use(express.static("dist"));

const scene = new Scene();
const runner = new Runner({ scene, componentFactory, isServer: true });

const numGrids = new Vector2(20, 20);
const gridSize = 10;

const asteroidField = new AsteroidField();
asteroidField.numGrids = numGrids;
asteroidField.gridSize = gridSize;
runner.addComponent(asteroidField);

const dt = 1000 / 60;
const server = createServer({
    componentFactory,
    io,
    runner,
});

setInterval(() => {
    scene.updateMatrixWorld();
    server.processCommands();
    runner.update(dt / 1000);
    server.emitClientStates();
}, dt);

httpServer.listen(3000, () => {
    console.log(":3000");
});
