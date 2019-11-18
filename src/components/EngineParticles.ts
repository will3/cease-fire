import { Color, Object3D, Quaternion, SpriteMaterial, Vector3 } from "three";

import Component from "../core/Component";
import { getMaterial } from "../materials";
import { clamp } from "../math";
import ValueCurve from "../ValueCurve";
import { Particle } from "./Particle";

export default class EngineParticles extends Component {
    public object?: Object3D;
    public emitter: any;
    public amount = 0.0;
    public boost = false;

    public totalCount = 12;
    public age = {
        spread: new ValueCurve([0, 0.02]),
        value: 0.15,
    };
    public color = {
        value: new Color(1.0, 1.0, 1.0),
    };
    public size = {
        spread: [1.2, 0],
        value: [3, 0],
    };
    public velocity = new Vector3();

    private particles: Particle[] = [];
    private emitCount = 0;
    private particleIndex = 0;
    private group = new Object3D();
    private emitInterval = 0;
    private position = new Vector3();
    private sizeScale = 1;

    public start() {
        const material = getMaterial("engineParticle") as SpriteMaterial;
        this.scene.add(this.group);

        for (let i = 0; i < this.totalCount; i++) {
            const particle = new Particle();
            this.particles.push(particle);
            this.group.add(particle.object);
            particle.object.material = material;
        }

        this.emitInterval = this.age.value / this.totalCount;
    }

    public onDestroy() {
        this.scene.remove(...this.particles.map((p) => p.object));
    }

    public update() {
        this.sizeScale = this.boost ? 2 : 1;

        this.position = this.parent.getWorldPosition(new Vector3());
        const quat = this.parent.getWorldQuaternion(new Quaternion());
        this.velocity =
            new Vector3(0, 0, 1)
                .applyQuaternion(quat)
                .multiplyScalar(0.5);

        this.updateParticles();
    }

    get emitterEnabled() {
        return this.amount !== 0;
    }

    private updateParticles() {
        if (this.emitterEnabled) {
            this.emitCount += this.time.deltaTime;

            if (this.emitCount > this.emitInterval) {
                this.emit();
                this.emitCount -= this.emitInterval;
            }
        }

        for (const particle of this.particles) {
            this.updateParticle(particle);
        }
    }

    private emit() {
        const particle = this.particles[this.particleIndex];

        particle.born();
        particle.object.position.copy(this.position);
        particle.timeToLive = this.age.value + this.age.spread.get(Math.random());
        const scaleValues = this.size.value.map((v, index) => {
            return (v + this.size.spread[index] * Math.random()) * this.sizeScale;
        });
        particle.scale = new ValueCurve(scaleValues);

        this.particleIndex++;
        this.particleIndex %= this.totalCount;
    }

    private updateParticle(particle: Particle) {
        if (particle.dead) {
            return;
        }
        particle.object.position.add(this.velocity);
        particle.life += this.time.deltaTime;
        const r = clamp(particle.life / particle.timeToLive, 0, 1);
        const scale = particle.scale.get(r);
        particle.object.scale.set(scale, scale, scale);

        if (particle.life > particle.timeToLive) {
            particle.kill();
        }
    }
}
