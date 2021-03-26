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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html, customElement, property, css } from 'lit-element';
import './gantt-common';
//import './PropertyObserver';
//import { Observer } from './PropertyObserver';
let GanttTable = class GanttTable extends LitElement {
    constructor() {
        super(...arguments);
        this.activities = [];
        this.columns = [];
        this.activityLineHeight = 24.0;
        this.showFilter = false;
        this.displayDays = true;
        this.displayWeeks = true;
        this.displayMonths = true;
        this.displayYears = true;
        this.resourceLineHeight = 24.0;
        this.indentSize = 12;
    }
    indentLevelOf(elt) {
        let originatorFound = false;
        let currentId = elt.id;
        let indentLevel = 0;
        do {
            const filtered = this.activities.filter((val) => (val.children || []).indexOf(currentId) != -1);
            originatorFound = filtered.length != 0;
            if (originatorFound) {
                indentLevel++;
                currentId = filtered[0].id;
            }
        } while (originatorFound);
        return indentLevel;
    }
    render() {
        let headerHeight = 0;
        headerHeight += this.displayDays ? this.activityLineHeight : 0;
        headerHeight += this.displayWeeks ? this.activityLineHeight : 0;
        headerHeight += this.displayMonths ? this.activityLineHeight : 0;
        headerHeight += this.displayYears ? this.activityLineHeight : 0;
        return html `
      <table>
        <thead><tr style="height:${headerHeight}px">
          ${this.columns.map(column => html `
            <th class="column">${column.label}</th>
          `)}
        </tr></thead>
        <tbody>
          ${this.activities.map(activity => html `<tr @mouseout="${this.triggerUnhighlightRow.bind(this, activity)}" @mouseover="${this.triggerHighlightRow.bind(this, activity)}" id="act-${activity.id}" style="height:${this.activityLineHeight}px">
              ${this.columns.map((column, colIndex) => {
            const formatter = column.formatter || ((v) => v);
            let val = typeof (column.field) === 'function' ? column.field(activity) : activity[column.field];
            if (typeof (val) === 'function')
                val = val();
            const indentLevel = this.indentLevelOf(activity);
            const hasChildren = (activity.children || []).length > 0;
            return html `
                  <td>
                    ${colIndex == 0 ? html `
                        <div class="cell">
                          ${Array(indentLevel).fill(0).map(() => html `<div class="indentation" style="min-width:${this.indentSize}px;"></div>`)}
                          ${hasChildren ? html `<img src="./expand.png" @click="${this.triggerToggleTreeRow.bind(this, activity)}"/>` : ''}
                          ${formatter(val)}
                        </div>
                      ` :
                html `${formatter(val)}`}
                  </td>`;
        })}
            </tr>`)}
        </tbody>
      </table>
     
    `;
    }
    triggerHighlightRow(activity) {
        this.dispatchEvent(new CustomEvent("highlight-row", { bubbles: true, composed: true, detail: activity.id }));
    }
    triggerUnhighlightRow(activity) {
        this.dispatchEvent(new CustomEvent("unhighlight-row", { bubbles: true, composed: true, detail: activity.id }));
    }
    triggerToggleTreeRow(activity) {
        this.dispatchEvent(new CustomEvent("toggle-row", { composed: true, bubbles: true, detail: activity.id }));
    }
    highlightRow(activityId) {
        const row = this.shadowRoot.querySelector("#act-" + activityId);
        if (row) {
            row.setAttribute("highlighted", "");
        }
    }
    unhighlightRow(activityId) {
        const row = this.shadowRoot.querySelector("#act-" + activityId);
        if (row) {
            row.removeAttribute("highlighted");
        }
    }
};
GanttTable.styles = css `
    :host {
      display: block;
      border-top: 1px solid lightgray;
      border-bottom: 1px solid lightgray;
    }

    .column {
      border-left: 1px solid lightgray;
      text-overflow: ellipsis;
      overflow: hidden;
    }

    .column:last-of-type {
      border-right: 1px solid lightgray;
    }

    table {
      min-width:100%;
      border-spacing: 0px;
      border-collapse: collapse;
    }

    table >thead > tr {
      border-bottom: 1px solid lightgray;
    }

    table > tbody > tr > td {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    table > tbody > tr[highlighted] {
      background: lightgray;
      transition: background-color 0.3s ease;
    }

    table > tbody > tr:hover {
      background: lightgray;
      transition: background-color 0.3s ease;
    }

    .indentation {
      min-height: 100%;
    }

    .cell {
      display: flex;
    }


  `;
__decorate([
    property({ type: Array })
], GanttTable.prototype, "activities", void 0);
__decorate([
    property({ type: Array })
], GanttTable.prototype, "columns", void 0);
__decorate([
    property({ type: Number })
], GanttTable.prototype, "activityLineHeight", void 0);
__decorate([
    property({ type: Boolean })
], GanttTable.prototype, "showFilter", void 0);
__decorate([
    property({ type: Boolean })
], GanttTable.prototype, "displayDays", void 0);
__decorate([
    property({ type: Boolean })
], GanttTable.prototype, "displayWeeks", void 0);
__decorate([
    property({ type: Boolean })
], GanttTable.prototype, "displayMonths", void 0);
__decorate([
    property({ type: Boolean })
], GanttTable.prototype, "displayYears", void 0);
__decorate([
    property({ type: Number })
], GanttTable.prototype, "resourceLineHeight", void 0);
__decorate([
    property({ type: Number })
], GanttTable.prototype, "indentSize", void 0);
GanttTable = __decorate([
    customElement('gantt-table')
], GanttTable);
export { GanttTable };
//# sourceMappingURL=gantt-table.js.map