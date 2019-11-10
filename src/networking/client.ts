import Runner from "../core/Runner";
import Component from "../core/Component";
import { getComponentState, State } from "./common";
import _ from "lodash";

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

    const join = (playerId: string) => {
        socket.emit("join", {
            playerId
        });
    }

    socket.on("state", (state: State) => {
        state.components.forEach((componentState) => {
            runner.restoreComponent(componentState);
        });

        const ids = _(state.components).map((c) => c.id);
        _(runner.components)
            .filter((c) => c.isRemote)
            .filter((c) => !c.isOwn)
            .filter((c) => !ids.includes(c.id))
            .forEach((c) =>
                c.destroy());
    });

    return {
        spawn,
        sendCommand,
        join
    };
};