export type Constructor<T> = {
    // tslint:disable-next-line:no-any
    new (...args: any[]): T;
  };
  
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

  
function Observer(callback: Function|string) {
    return function(target: Record<string, any>|ClassElement|any, propertyKey: PropertyKey) { 
        const defaultUpdatedCallback = target.updated;
        (target as any).updated = function(changedProperties: any) {
            if ( defaultUpdatedCallback ) defaultUpdatedCallback.call(this, changedProperties);
            if ( changedProperties.has(propertyKey) ) {
                if ( callback ) {
                    callback && typeof callback === "string" ? 
                        this[callback].bind(this)(this[propertyKey], changedProperties.get(propertyKey)):
                        (callback as Function).bind(this)( this[propertyKey], changedProperties.get(propertyKey));
                }
            }
        }
    }
  }
  

  export {Observer};