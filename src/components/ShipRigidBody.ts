import { Object3D, Vector3 } from "three";
import Collider from "../core/Collider";
import Component from "../core/Component";

export default class ShipRigidBody extends Component {
    public object!: Object3D;

    public maxRoll = Math.PI / 5;
    public rotationVelocity = new Vector3();
    public velocity = new Vector3();
    public rotationAcc = new Vector3(0, 0, 2);
    public acc = 0.04;
    public moveFriction = 0.9;
    public restFriction = 0.95;
    public maxSpeed = 0.2;
    public engineRunning = false;
    public boost = false;
    public turnSpeed = 0.05;

    public update() {
        this.updateRigidBody();
    }

    private updateRigidBody() {
        const friction = this.engineRunning ? this.moveFriction : this.restFriction;
        this.velocity.multiplyScalar(friction);

        this.object.rotation.z += this.rotationVelocity.z;

        this.object.rotation.y += Math.sin(this.object.rotation.z) * this.turnSpeed;

        this.object.position.add(this.velocity);

        this.object.position.y = 0;
        this.object.rotation.x = 0;
    }
}
