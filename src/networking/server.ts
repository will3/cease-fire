import SocketIO from "socket.io";
import { Command } from "./Client";
import _ from "lodash";
import Runner from "../core/Runner";
import { State, getComponentState } from "./common";
import { ComponentFactory } from "../core/ComponentFactory";
import ComponentState from "../core/ComponentState";
import util from "util";

interface Connection {
    socket: SocketIO.Socket
};

export interface ServerOptions {
    io: SocketIO.Server;
    runner: Runner;
    componentFactory: ComponentFactory
};

export default (options: ServerOptions) => {
    const connections: { [id: string]: Connection } = {};
    const commandBuffer: Command[] = [];
    const { io, runner, componentFactory } = options;

    io.on("connection", socket => {
        connections[socket.id] = {
            socket
        };

        socket.on("command", (commands: Command[]) => {
            commands.forEach(c => {
                commandBuffer.push(c);
            });
        });
    });

    const update = () => {
        processCommands();

        runner.update();

        for (let id in connections) {
            const connection = connections[id];
            const clientState = getClientState(id);
            const socket = connection.socket;

            socket.emit("state", clientState);
        }
    };

    const getClientState = (id: string): State => {
        const components =
            _(runner.components)
                .filter(c => c.isRemote)
                .map(c => getComponentState(c))
                .value();

        const state = {
            components
        };

        return state;
    }

    const processCommands = () => {
        const commands = commandBuffer.splice(0);
        commands.forEach(c => {
            processCommand(c);
        });
    };

    const processCommand = (command: Command) => {
        if (command.type === "spawn") {
            runner.restoreComponent(command.data);
        }
    };

    return {
        update
    }
};