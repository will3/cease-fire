import Laser from "./components/Laser";
import Ship from "./components/Ship";
import ComponentFactory from "./core/ComponentFactory";

const componentFactory = {
    create(type: string) {
        switch (type) {
            case "Ship":
                return new Ship();
            case "Laser":
                return new Laser();
            default:
                throw new Error(`Unknown type ${type}`);
        }
    },
} as ComponentFactory;

export default componentFactory;
