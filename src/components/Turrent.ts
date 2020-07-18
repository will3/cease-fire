import _ from "lodash";
import seedrandom from "seedrandom";
import { Euler, Vector3 } from "three";
import Component from "../core/Component";
import Laser from "./Laser";

export default class Turrent extends Component {
  public spots = [
    new Vector3(-1, 0, -1),
    new Vector3(0, 0, -1),
    new Vector3(1, 0, -1),
  ];
  public fire = false;
  public fireInterval = 0.1;
  public seed = "1337";
  private fireAmount = 0;
  private fireSpot = 0;
  private random!: seedrandom.prng;

  public start() {
    this.random = seedrandom(this.seed);
  }

  public update() {
    if (this.fire) {
      if (this.fireAmount > this.fireInterval) {
        const laser = new Laser();
        const rotationOffset = (this.random() - 0.5) * 2.0 * 0.01;
        const rotation = new Euler(0, this.parent.rotation.y, 0);
        const offset = this.spots[this.fireSpot];
        const dir = offset.clone().applyEuler(rotation);

        laser.startPosition.copy(
          this.parent.position.clone().add(dir.multiplyScalar(2))
        );
        laser.startRotation.copy(rotation);

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
}
