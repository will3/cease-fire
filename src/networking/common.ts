import Component from "../core/Component";

export interface State {
    components: ComponentState[];
}

export interface ComponentState {
    id: string,
    type: string,
    state: any
};

export const getComponentState = (component: Component): ComponentState => {
    return {
        id: component.id,
        type: component.type,
        state: component.serialize()
    };
};

export interface ComponentFactory {
    create: (id: string) => Component;
};