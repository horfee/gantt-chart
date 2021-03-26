import { LitElement } from "lit-element";
import { Constructor} from 'lit-element/lib/decorators';

// From the TC39 Decorators proposal
interface ClassElement {
    kind: 'field'|'method';
    key: PropertyKey;
    placement: 'static'|'prototype'|'own';
    initializer?: Function;
    extras?: ClassElement[];
    finisher?: <T>(clazz: Constructor<T>) => undefined | Constructor<T>;
    descriptor?: PropertyDescriptor;
  }

const legacyQuery =
    (descriptor: PropertyDescriptor, proto: Record<string, any>, name: PropertyKey) => {
      Object.defineProperty(proto, name, descriptor);
    };

const standardQuery = (descriptor: PropertyDescriptor, element: ClassElement) =>
    ({
      kind: 'method',
      placement: 'prototype',
      key: element.key,
      descriptor,
    });

export function queryAssignedNode(
    slotName = '', flatten = false) {
  return (protoOrDescriptor: Record<string, any>|ClassElement,
          // tslint:disable-next-line:no-any decorator
          name?: PropertyKey): any => {
    const descriptor = {
      get(this: LitElement) {
        const selector = `slot${slotName ? `[name=${slotName}]` : ''}`;
        const slot = this.renderRoot.querySelector(selector);
        return slot && (slot as HTMLSlotElement).assignedNodes({flatten})[0];
      },
      enumerable: true,
      configurable: true,
    };
    return (name !== undefined) ?
        legacyQuery(descriptor, protoOrDescriptor as Record<string, any>, name) :
        standardQuery(descriptor, protoOrDescriptor as ClassElement);
  };
}
