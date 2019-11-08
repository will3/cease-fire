import Component from "../core/Component";
import ComponentState from "../core/ComponentState";

export interface State {
    components: ComponentState[];
}

export const getComponentState = (component: Component): ComponentState => {
    return {
        id: component.id,
        ownerId: component.ownerId,
        state: component.serialize(),
        type: component.type,
    };
};
