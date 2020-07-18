import seedrandom from "seedrandom";
import { Object3D, Sprite } from "three";
import Component from "../core/Component";
import { randomAxis } from "../math";
import Noise from "../Noise";

export default class StarField extends Component {
  public object = new Object3D();
  public number = 800;
  public seed = "1337";
  private prng!: seedrandom.prng;

  public start() {
    this.prng = seedrandom(this.seed);
    const noise = new Noise({
      frequency: 0.001,
    });
    this.parent.add(this.object);
    for (let i = 0; i < this.number; i++) {
      const position = randomAxis(this.prng).multiplyScalar(1000);
      const sprite = new Sprite();
      this.object.add(sprite);
      sprite.position.copy(position);
      const s = noise.get(position.x, position.y, position.z);
      sprite.scale.multiplyScalar(2 + 12 * Math.pow(s, 2));
    }
  }

  public beforeRender() {
    this.object.position.copy(this.camera.position);
  }
}
