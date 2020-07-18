import Component from "../core/Component";
import ComponentState from "../core/ComponentState";

export interface ClientState {
  components: ComponentState[];
  serverTime: number;
}

export const getComponentState = (component: Component): ComponentState => {
  return {
    id: component.id,
    ownerId: component.ownerId,
    state: component.serialize(),
    type: component.type,
  };
};

export interface Command {
  componentId: string;
  data: any;
  type: string;
}
