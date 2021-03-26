import { Constructor } from 'lit-element/lib/decorators';
interface ClassElement {
    kind: 'field' | 'method';
    key: PropertyKey;
    placement: 'static' | 'prototype' | 'own';
    initializer?: Function;
    extras?: ClassElement[];
    finisher?: <T>(clazz: Constructor<T>) => undefined | Constructor<T>;
    descriptor?: PropertyDescriptor;
}
export declare function queryAssignedNode(slotName?: string, flatten?: boolean): (protoOrDescriptor: Record<string, any> | ClassElement, name?: string | number | symbol) => any;
export {};
//# sourceMappingURL=QueryAssignedNode.d.ts.map