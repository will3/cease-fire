import _ from "lodash";
import { Euler, Vector3 } from "three";
import Component from "../core/Component";
import { Command } from "../networking/common";
import Laser from "./Laser";

export default class Turrent extends Component {
    public spots = [new Vector3(-1, 0, -1), new Vector3(0, 0, -1), new Vector3(1, 0, -1)];
    public fire = false;
    public fireInterval = 0.1;
    private fireAmount = 0;
    private fireSpot = 0;

    public update() {
        if (this.fire) {
            if (this.fireAmount > this.fireInterval) {
                const laser = new Laser();
                const rotation = new Euler(0, this.parent.rotation.y + (Math.random() - 0.5) * 2.0 * 0.01, 0);
                const offset = this.spots[this.fireSpot];
                const dir = offset.clone().applyEuler(rotation);
                laser.object.rotation.copy(rotation);
                laser.object.position.copy(this.parent.position.clone().add(dir.multiplyScalar(2)));
                if (this.parentComponent != null) {
                    laser.shipId = this.parentComponent.id;
                }
                this.addComponent(laser);
                this.fireAmount = 0;
                this.fireSpot = (this.fireSpot + 1) % this.spots.length;
            }
        }

        this.fireAmount += 1 / 60;
    }

    public updateCommand(command: Command) {
        this.fire = command.data.fire;
    }
}
