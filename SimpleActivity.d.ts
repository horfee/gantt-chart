import { Activity, Predecessor, Resource } from './gantt-common';
declare class SimpleActivity implements Activity {
    start: Function | Date;
    duration: number;
    id: number;
    name?: string | Function;
    predecessors: Predecessor[];
    color: string | Function;
    selectedColor: string;
    isHeader?: boolean;
    progress?: number;
    readonly resources: Resource[];
    children?: number[];
    constructor();
}
export { SimpleActivity };
//# sourceMappingURL=SimpleActivity.d.ts.map