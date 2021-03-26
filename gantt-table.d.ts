/**
 * @license
 * Copyright (c) 2019 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
import { LitElement } from 'lit-element';
import './gantt-common';
import { Activity, GanttColumn } from './gantt-common';
export declare class GanttTable extends LitElement {
    activities: Array<Activity>;
    columns: Array<GanttColumn>;
    activityLineHeight: number;
    showFilter: boolean;
    displayDays: boolean;
    displayWeeks: boolean;
    displayMonths: boolean;
    displayYears: boolean;
    resourceLineHeight: number;
    indentSize: number;
    static styles: import("lit-element").CSSResult;
    private indentLevelOf;
    render(): import("lit-element").TemplateResult;
    private triggerHighlightRow;
    private triggerUnhighlightRow;
    private triggerToggleTreeRow;
    highlightRow(activityId: number): void;
    unhighlightRow(activityId: number): void;
}
declare global {
    interface HTMLElementTagNameMap {
        'gantt-table': GanttTable;
    }
}
//# sourceMappingURL=gantt-table.d.ts.map