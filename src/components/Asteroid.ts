import seedrandom from "seedrandom";
import {
    Color,
    DodecahedronGeometry,
    Intersection,
    Material,
    Mesh,
    MeshLambertMaterial,
    Object3D,
    Quaternion,
    Vector2,
    Vector3,
} from "three";
import Collider from "../core/Collider";
import Component from "../core/Component";
import { Hitable } from "../Hitable";
import { randomAxis, randomQuaternion } from "../math";
import Noise from "../Noise";

interface AsteroidData {
    seed: string;
    startPosition: Vector3;
    startScale: Vector3;
    quaternion: number[];
}

export default class Asteroid extends Component implements Hitable {
    private static material: Material;

    public type = "Asteroid";
    public isRemote = true;
    public gridCoord = new Vector2();
    public mesh = new Mesh();
    public seed = "1337";
    public startPosition = new Vector3();
    public startScale = new Vector3();

    private random!: seedrandom.prng;
    private quatVelocity = new Quaternion();
    private noise = new Noise({
        frequency: 0.5,
        octaves: 2,
    });
    private object = new Object3D();

    public start() {
        this.object.position.copy(this.startPosition);
        this.object.scale.copy(this.startScale);

        this.random = seedrandom(this.seed);
        this.parent.add(this.object);
        this.mesh.userData.componentId = this.id;

        if (Asteroid.material == null) {
            Asteroid.material = new MeshLambertMaterial({
                color: new Color(1.0, 1.0, 1.0),
            });
        }

        this.mesh.geometry = new DodecahedronGeometry();

        for (const vertice of this.mesh.geometry.vertices) {
            const v = this.noise.get(vertice.x, vertice.y, vertice.z);
            vertice.multiplyScalar(1.0 + v * 0.5);
            vertice.x *= 1 + this.random() * 0.61803398875;
        }

        this.mesh.material = Asteroid.material;

        this.mesh.quaternion.copy(randomQuaternion(1, this.random));

        this.object.add(this.mesh);

        const mass = Math.pow(this.object.scale.x * this.object.scale.y * this.object.scale.z, 0.5);
        this.quatVelocity = new Quaternion().setFromAxisAngle(randomAxis(this.random), 0.05 / mass * this.random());

        const collider = new Collider();
        collider.static = true;
        this.mesh.geometry.computeBoundingSphere();
        const sphere = this.mesh.geometry.boundingSphere;
        collider.radius = sphere.radius;
        collider.position.copy(this.object.position);
        this.addComponent(collider, true);
    }

    public update() {
        this.object.quaternion.multiply(this.quatVelocity);
    }

    public onDestroy() {
        this.parent.remove(this.object);
        this.mesh.geometry.dispose();
    }

    get radius() {
        return Math.max(this.object.scale.x, this.object.scale.y, this.object.scale.z);
    }

    public onHit(_: Intersection) {
        // do nothing
    }

    public serialize(): AsteroidData {
        return {
            seed: this.seed,
            startPosition: this.startPosition,
            startScale: this.startScale,
            quaternion: this.object.quaternion.toArray(),
        };
    }

    public deserialize(data: AsteroidData) {
        this.seed = data.seed;
        this.startPosition.copy(data.startPosition);
        this.startScale.copy(data.startScale);
        this.object.quaternion.fromArray(data.quaternion);
    }
}
