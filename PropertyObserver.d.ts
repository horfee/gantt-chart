export declare type Constructor<T> = {
    new (...args: any[]): T;
};
declare function Observer(callback: Function | string): (target: any, propertyKey: string | number | symbol) => void;
export { Observer };
//# sourceMappingURL=PropertyObserver.d.ts.map