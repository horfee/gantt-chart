function Observer(callback) {
    return function (target, propertyKey) {
        const defaultUpdatedCallback = target.updated;
        target.updated = function (changedProperties) {
            if (defaultUpdatedCallback)
                defaultUpdatedCallback.call(this, changedProperties);
            if (changedProperties.has(propertyKey)) {
                if (callback) {
                    callback && typeof callback === "string" ?
                        this[callback].bind(this)(this[propertyKey], changedProperties.get(propertyKey)) :
                        callback.bind(this)(this[propertyKey], changedProperties.get(propertyKey));
                }
            }
        };
    };
}
export { Observer };
//# sourceMappingURL=PropertyObserver.js.map