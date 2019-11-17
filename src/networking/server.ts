import _ from "lodash";
import SocketIO from "socket.io";
import ComponentFactory from "../core/ComponentFactory";
import Runner from "../core/Runner";
import { Command } from "./common";
import { getComponentState, ClientState } from "./common";

interface Connection {
    socket: SocketIO.Socket;
    playerId?: string;
}

export interface ServerOptions {
    io: SocketIO.Server;
    runner: Runner;
    componentFactory: ComponentFactory;
}

export default class Server {
    connections: { [id: string]: Connection } = {};
    commandBuffer: Command[] = [];
    io: SocketIO.Server;
    runner: Runner;

    constructor(options: ServerOptions) {
        this.io = options.io;
        this.runner = options.runner;
    }

    public start() {
        this.io.on("connection", (socket) => {
            const connection = {
                socket,
            } as Connection;
            this.connections[socket.id] = connection;

            console.log(`player connected socket ${connection.socket.id}`);

            socket.on("command", (commands: Command[]) => {
                commands.forEach((c) => {
                    this.commandBuffer.push(c);
                });
            });

            socket.on("join", (data) => {
                console.log(`player joined socket ${connection.socket.id} player ${data.playerId}`);
                connection.playerId = data.playerId;
            });

            socket.on("disconnect", () => {
                console.log(`player left socket ${connection.socket.id} player ${connection.playerId}`);
                _(this.runner.components)
                    .filter((c) => c.ownerId === connection.playerId)
                    .forEach((c) => {
                        c.destroy();
                    });
            });
        });
    }

    public emitClientStates() {
        _.forEach(this.connections, (connection, id) => {
            const clientState = this.getClientState(id);
            const socket = connection.socket;

            socket.emit("state", clientState);
        });
    }

    public processCommands() {
        const commands = this.commandBuffer.splice(0);
        commands.forEach((c) => {
            this.processCommand(c);
        });
    }

    private getClientState = (id: string): ClientState => {
        const components =
            _(this.runner.components)
                .filter((c) => c.isRemote)
                .map((c) => getComponentState(c))
                .value();

        const state = {
            components,
            serverTime: this.runner.time.elaspedTime,
        };

        return state;
    }

    private processCommand(command: Command) {
        if (command.type === "spawn") {
            this.runner.restoreComponent(command.data);
            return;
        }

        if (command.componentId != null) {
            const component = this.runner.getComponent(command.componentId);
            if (component != null && component.started) {
                component.onCommand(command);
            }
        }
    }
}
