import _ from "lodash";
import SocketIO from "socket.io";
import ComponentFactory from "../core/ComponentFactory";
import Runner from "../core/Runner";
import { Command } from "./Client";
import { getComponentState, State } from "./common";

interface Connection {
    socket: SocketIO.Socket;
    playerId?: string;
}

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
        const connection = {
            socket
        } as Connection;
        connections[socket.id] = connection;

        console.log(`player connected socket ${connection.socket.id}`);

        socket.on("command", (commands: Command[]) => {
            commands.forEach(c => {
                commandBuffer.push(c);
            });
        });

        socket.on("join", (data) => {
            console.log(`player joined socket ${connection.socket.id} player ${data.playerId}`);
            connection.playerId = data.playerId;
        });

        socket.on("disconnect", () => {
            console.log(`player left socket ${connection.socket.id} player ${connection.playerId}`);
            _(runner.components)
                .filter((c) => c.ownerId === connection.playerId)
                .forEach((c) => {
                    c.destroy();
                });
        });
    });

    const emitClientStates = () => {
        _.forEach(connections, (connection, id) => {
            const clientState = getClientState(id);
            const socket = connection.socket;

            socket.emit("state", clientState);
        });
    };

    const getClientState = (id: string): State => {
        const components =
            _(runner.components)
                .filter((c) => c.isRemote)
                .map((c) => getComponentState(c))
                .value();

        const state = {
            components,
        };

        return state;
    };

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
        processCommands,
        emitClientStates,
    }
};