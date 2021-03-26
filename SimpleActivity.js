class SimpleActivity {
    constructor() {
        this.resources = [];
        const orig = this.resources.push;
        this.resources.push = function (item) {
            item.start = () => this.start;
            item.duration = () => this.duration;
            return orig(item);
        };
    }
}
export { SimpleActivity };
//# sourceMappingURL=SimpleActivity.js.map