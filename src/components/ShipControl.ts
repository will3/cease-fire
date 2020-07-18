import Component from "../core/Component";
import EngineParticles from "./EngineParticles";
import Turrent from "./Turrent";

export default class ShipControl extends Component {
  public leftEngine!: EngineParticles;
  public rightEngine!: EngineParticles;
  public shipId!: string;

  public turrent?: Turrent;

  public update() {
    const left = this.input.key("a")
      ? 1.0
      : 0.0 - (this.input.key("d") ? 1.0 : 0.0);
    let forward = this.input.key("w")
      ? 1.0
      : 0.0 - (this.input.key("s") ? 1.0 : 0.0);
    const fire = this.input.key("j");
    const boost = this.input.key("k");

    if (forward < 0) {
      forward = 0;
    }
    if (forward === 0 && left !== 0) {
      forward = 1.0;
    }

    if (boost) {
      forward = 1.0;
    }

    const command = {
      componentId: this.shipId,
      type: "ShipMovement",
      data: {
        boost,
        forward,
        left,
        fire,
      },
    };

    this.sendCommand(command);
  }
}
