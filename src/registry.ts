import Ship from "./Ship";
import Component from "./Component";

const registry: { [id: string]: () => Component } = {
    "Ship": () => new Ship()
};

export default registry;