import _ from "lodash";
import Component from "../core/Component";
import Runner from "../core/Runner";
import { getComponentState, State } from "./common";

export interface Command {
    data: any;
    type: string;
}

export interface ClientOptions {
    runner: Runner;
    socket: SocketIOClient.Socket;
}

export default (options: ClientOptions) => {
    const runner = options.runner;
    const socket = options.socket;

    const sendCommand = (commands: Command[]) => {
        socket.emit("command", commands);
    };

    const spawn = (component: Component) => {
        if (component.type == null) {
            throw new Error("component must have type");
        }

        const state = getComponentState(component);

        sendCommand([{
            data: state,
            type: "spawn",
        }]);
    };

    const join = (playerId: string) => {
        socket.emit("join", {
            playerId,
        });
    };

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
        join,
        sendCommand,
        spawn,
    };
};
