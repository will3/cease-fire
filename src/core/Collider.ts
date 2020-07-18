import { Object3D, Vector3 } from "three";
import guid from "../guid";
import Component from "./Component";
import { Contact } from "./Physics";

type onContactCallback = (contact: Contact) => void;

export default class Collider extends Component {
  public type = "";
  public id = guid();
  public static = false;
  public radius = 0;
  public position = new Vector3();

  public onContact?: onContactCallback;

  public start() {
    this.physics.add(this);
  }

  public onDestroy() {
    this.physics.remove(this);
  }
}
