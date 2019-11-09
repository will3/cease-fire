import Component from "./Component";
export default interface ComponentFactory {
    create: (id: string) => Component;
}
