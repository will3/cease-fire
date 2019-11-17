import _ from "lodash";
import seedrandom from "seedrandom";
import { Vector2 } from "three";
import Component from "../core/Component";
import { clamp, randomAxis } from "../math";
import Noise from "../Noise";
import Asteroid from "./Asteroid";

export default class AsteroidField extends Component {
    public numGrids!: Vector2;
    public gridSize!: number;
    public seed = "1337";
    private asteroids: { [id: string]: Asteroid } = {};
    private random!: seedrandom.prng;

    public start() {
        this.random = seedrandom(this.seed);
        for (let i = 0; i < this.numGrids.x; i++) {
            for (let j = 0; j < this.numGrids.y; j++) {
                const n = new Noise({
                    frequency: 1.0,
                });

                const v = n.get(i, 0, j) - 0.5;

                if (v > 0) {
                    const asteroid = new Asteroid();
                    asteroid.seed = this.random().toString();
                    asteroid.gridCoord = new Vector2(i, j);
                    const offset = randomAxis(this.random)
                        .setY(0)
                        .multiplyScalar(this.gridSize / 2);
                    asteroid.startPosition
                        .set(i * this.gridSize, 0, j * this.gridSize)
                        .add(offset);
                    const scale = 2 + clamp(Math.pow(v, 1) * 20, 0, 6);
                    asteroid.startScale.set(scale, scale, scale);

                    const id = i + "," + j;
                    this.asteroids[id] = asteroid;
                }
            }
        }

        const getAsteroid = (coord: Vector2) => {
            const id = coord.x + "," + coord.y;
            return this.asteroids[id];
        };

        _(this.asteroids)
            .filter((a) => {
                const coords = [
                    new Vector2(-1, -1),
                    new Vector2(-1, 0),
                    new Vector2(-1, 1),
                    new Vector2(0, -1),
                    new Vector2(0, 1),
                    new Vector2(1, -1),
                    new Vector2(1, 0),
                    new Vector2(1, 1),
                ];

                const collided = _(coords)
                    .map((c) => c.add(a.gridCoord))
                    .map((c) => getAsteroid(c))
                    .filter((n) => n != null)
                    .find((n) => {
                        const dist = n.startPosition.clone().sub(a.startPosition).length();
                        return (a.radius + n.radius + 2) > dist;
                    });

                return collided == null;
            })
            .forEach((a) => {
                this.addComponent(a);
            });

    }
}
