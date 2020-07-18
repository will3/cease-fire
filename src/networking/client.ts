import _ from "lodash";
import Component from "../core/Component";
import Runner from "../core/Runner";
import { ClientState, getComponentState } from "./common";
import { Command } from "./common";

export interface ClientOptions {
  runner: Runner;
  socket: SocketIOClient.Socket;
}

export default class Client {
  runner: Runner;
  socket: SocketIOClient.Socket;

  constructor(options: ClientOptions) {
    this.runner = options.runner;
    this.socket = options.socket;
  }

  public start() {
    this.socket.on("state", (state: ClientState) => {
      state.components.forEach((componentState) => {
        this.runner.restoreComponent(componentState);
      });

      const ids = _(state.components).map((c) => c.id);
      _(this.runner.components)
        .filter((c) => c.isRemote)
        .filter((c) => !ids.includes(c.id))
        .filter((c) => !c.isShadow)
        .forEach((c) => {
          delete this.runner.clientDestroyed[c.id];
          c.destroy();
        });
    });
  }

  sendCommand(commands: Command[]) {
    this.socket.emit("command", commands);
  }

  spawn(component: Component) {
    if (component.type == null) {
      throw new Error("component must have type");
    }

    const state = getComponentState(component);

    this.sendCommand([
      {
        componentId: this.runner.id,
        data: state,
        type: "spawn",
      },
    ]);
  }

  join(playerId: string) {
    this.socket.emit("join", {
      playerId,
    });
  }
}
