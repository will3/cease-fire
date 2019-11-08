import Runner from "../core/Runner";
import Component from "../core/Component";
import { getComponentState, State } from "./common";
import SocketIOClient from "socket.io-client";

export interface Command {
    type: string;
    data: any;
};

export interface ClientOptions {
    runner: Runner;
    socket: SocketIOClient.Socket;
};

export default (options: ClientOptions) => {
    const runner = options.runner;
    const socket = options.socket;

    const sendCommand = (commands: Command[]) => {
        socket.emit("command", commands);
    }

    const spawn = (component: Component) => {
        if (component.type == null) {
            throw new Error("component must have type");
        }

        const state = getComponentState(component);

        sendCommand([{
            type: "spawn",
            data: state
        }]);
    }

    socket.on("state", (state: State) => {
        state.components.forEach((componentState) => {

        });
    });

    return {
        spawn,
        sendCommand
    };
};