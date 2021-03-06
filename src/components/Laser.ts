import {
  Euler,
  Object3D,
  Raycaster,
  Sprite,
  SpriteMaterial,
  Vector3,
} from "three";

import _ from "lodash";
import Component from "../core/Component";
import { Hitable } from "../Hitable";
import { getMaterial } from "../materials";
import Asteroid from "./Asteroid";
import ChunkMesh from "./ChunkMesh";
import Explosion from "./Explosion";

interface LaserState {
  startPosition: number[];
  startRotation: number[];
  shipId: string;
}

export default class Laser extends Component {
  private static material: SpriteMaterial;
  public type = "Laser";
  public isRemote = true;
  public destroyByClient = true;
  public object = new Object3D();
  public velocity = 6;
  public scale: number[] = [2.0, 1, 0.8, 0.4];
  public offset: number[] = [0, 1.2, 2.4, 3.6];
  public baseScale = 1.5;
  public timeToLive = 3;
  public shipId?: string;
  public startPosition = new Vector3();
  public startRotation = new Euler();

  private life = 0;
  private sprites: Object3D[] = [];

  public start() {
    if (Laser.material == null) {
      Laser.material = getMaterial("laser") as SpriteMaterial;
    }

    const length = this.scale.length;

    this.sprites = [];
    for (let i = 0; i < length; i++) {
      const s = new Sprite(Laser.material);
      s.scale.set(this.scale[i], this.scale[i], this.scale[i]);
      s.position.set(0, 0, this.offset[i]);
      this.sprites.push(s);
      this.object.add(s);
    }

    this.object.scale.multiplyScalar(this.baseScale);
    this.parent.add(this.object);

    this.object.position.copy(this.startPosition);
    this.object.rotation.copy(this.startRotation);
  }

  public serialize() {
    return {
      startPosition: this.startPosition.toArray(),
      startRotation: this.startRotation.toArray(),
      shipId: this.shipId,
    };
  }

  public deserialize(state: LaserState) {
    this.startPosition.fromArray(state.startPosition);
    this.startRotation.fromArray(state.startRotation);
    this.shipId = state.shipId;
  }

  public update() {
    this.life += this.time.deltaTime;
    if (this.life > this.timeToLive) {
      this.destroy();
      return;
    }

    const result = this.updateCollision();

    if (result != null) {
      if (!this.isServer) {
        const explosion = new Explosion();
        explosion.object.position.copy(result.result.point);
        this.addComponent(explosion);
      }

      this.destroy();
      return;
    }

    const forwardVector = new Vector3(0, 0, -1).applyEuler(
      this.object.rotation
    );
    this.object.position.add(forwardVector.multiplyScalar(this.velocity));
  }

  public onDestroy() {
    this.parent.remove(this.object);
  }

  private getCollidableObjects() {
    const chunkMeshes = _(this.runner.getComponents("ChunkMesh") as ChunkMesh[])
      .map((c) => c.mesh)
      .value();
    const asteroids = _(this.runner.getComponents("Asteroid") as Asteroid[])
      .map((c) => c.mesh)
      .value();

    return chunkMeshes
      .concat(asteroids)
      .filter((o) => o != null)
      .filter((o) => {
        return o.userData.shipId !== this.shipId;
      });
  }

  private updateCollision() {
    const objects = this.getCollidableObjects();
    const dir = new Vector3(0, 0, -1).applyEuler(this.object.rotation);
    const up = new Vector3(0, 1, 0);
    const right = dir.clone().cross(up);
    const result =
      this.raycast(dir, objects, new Vector3()) ||
      this.raycast(dir, objects, right.clone().multiplyScalar(0.5)) ||
      this.raycast(dir, objects, right.clone().multiplyScalar(-0.5));

    if (result != null) {
      const component = (result.component as unknown) as Hitable;
      component.onHit(result.result);
    }

    return result;
  }

  private raycast(dir: Vector3, objects: Object3D[], offset = new Vector3()) {
    const raycaster = new Raycaster(
      this.object.position.clone().add(offset),
      dir,
      0,
      this.velocity
    );
    if (objects.length === 0) {
      return undefined;
    }
    const results = raycaster.intersectObjects(objects);
    if (results.length === 0) {
      return undefined;
    }

    const result = results[0];
    const componentId = result.object.userData.componentId;
    const component = this.runner.getComponent(componentId);

    if (component == null) {
      return undefined;
    }

    return {
      component,
      result,
    };
  }
}
