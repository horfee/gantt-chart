import { Activity, Predecessor, Resource } from './gantt-common';
export declare class SimpleActivity implements Activity {
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
    constructor(params: Activity);
}
//# sourceMappingURL=simple-activity.d.ts.map