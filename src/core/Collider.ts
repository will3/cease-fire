import { Object3D, Vector3 } from "three";
import guid from "uuid/v4";
import { Contact } from "./Collisions";
import Component from "./Component";

type onContactCallback = (contact: Contact) => void;

export default class Collider extends Component {
    public type = "";
    public id = guid();
    public static = false;
    public radius = 0;
    public position = new Vector3();

    public onContact?: onContactCallback;

    public start() {
        this.collisions.add(this);
    }

    public onDestroy() {
        this.collisions.remove(this);
    }
}
