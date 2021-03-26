import { Activity, Predecessor, Resource } from './gantt-common';

export class SimpleActivity implements Activity {
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

    constructor(params: Activity) {
        for(const prop in params) {
            this[prop] = params[prop];
        }
        this.resources = [];        
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;
        this.resources.push = function( ar ) {
            const items = ar instanceof Array ? ar : [ar];
            items.forEach( i => {
                
                i.start = function() {
                        return self.start};
                i.duration = function() {
                        return self.duration};
            });

            return items.length == 0 ? 0 : Array.prototype.push.apply(this,ar);
        };

        this.resources.push((params.resources||[]));
        //(params.resources||[]).forEach( resource => this.resources.push(resource));
    }
}