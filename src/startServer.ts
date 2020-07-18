import express from "express";
import http from "http";
import SocketIO from "socket.io";
import { Color, Scene, Vector2 } from "three";
import Ship from "./components/Ship";

import componentFactory from "./componentFactory";
import AsteroidField from "./components/AsteroidField";
import Runner from "./core/Runner";
import Server from "./networking/server";

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

for (let i = 0; i < 4; i++) {
  for (let j = 0; j < 4; j++) {
    const s = new Ship();
    s.object.position.set(i * 15, 0, j * 15);
    s.object.rotation.y = Math.random() * 2 * Math.PI;
    s.color = new Color(0.8, 0.6, 0.2);
    runner.addComponent(s);
  }
}

const dt = 1000 / 60;
const server = new Server({
  io,
  runner,
  componentFactory,
});

server.start();

setInterval(() => {
  scene.updateMatrixWorld();
  server.processCommands();
  runner.update(dt / 1000);
  server.emitClientStates();
}, dt);

const port = process.env.PORT || 3000;

httpServer.listen(port, () => {
  console.log(`:${port}`);
});
