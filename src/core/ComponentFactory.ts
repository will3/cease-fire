import Component from "./Component";
export interface ComponentFactory {
    create: (id: string) => Component;
}
