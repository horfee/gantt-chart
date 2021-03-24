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

import {LitElement, html, customElement, property, css, query, internalProperty} from 'lit-element';
import {DisplayMode, getTextWidth, ONEDAY} from './gantt-common';
import {Activity} from './gantt-common';
import { Observer } from './PropertyObserver';



@customElement('gantt-row')
export class GanttRow extends LitElement {

  @property({type: Object,
    hasChanged: function(newVal?: Activity, oldVal?: Activity) {
      return (newVal !== undefined && oldVal === undefined) || 
      (newVal === undefined && oldVal !== undefined) ||
      newVal.progress != oldVal.progress || 
      newVal.duration != oldVal.duration ||
      newVal.start != oldVal.start ||
      newVal.color != oldVal.color;
    }})
  data: Activity;

  @property({type: Boolean})
  alwaysDisplayDays = true;

  @property({type: Number})
  dayWidth = 1.0;

  @property({type: Object})
  startDate: Date = new Date();

  @property({type: Object})
  endDate: Date = new Date();

  @property({type: Boolean, attribute: 'show-label-inside', reflect: true})
  displayLabelInside = false;

  @property({type: Boolean, attribute: 'show-label', reflect: true})
  displayLabel = false;

  @property({type: Number})
  lineHeight = 24;

  @property({})
  displayMode = DisplayMode.Day;

  @property({type: String})
  labelAttribute = 'name';

  @property({attribute: false})
  getChildren: Function|undefined = undefined;

  static styles = css`
    :host {
      display: block;
      position: relative;
    }

    .grid {
      display: flex;
      height: 100%;
      border-color: lightgray;
      border-top: 1px solid lightgray;
      border-bottom: 0px;
      box-sizing: border-box;
      user-select: none;
    }

    .grid:hover .cell {
      background: lightgray;
      transition: background-color 0.3s ease;
    }

    .cell {
      border-color: lightgray;
      border-left:1px solid lightgray;
      display: inline-block;
      height: 100%;
      box-sizing: border-box;
      user-select: none;
      
    }

    .cell:first-of-type {
      border-left: 0px;
    }
    /*
    .cell:last-of-type {
      / * border-right: 1px solid lightgray; * /
    }
    */

    .weekend {
      background: #EAEAEA;
    }


    .activity-label {
      margin-left: 5px;
      margin-top: auto;
      margin-bottom: auto;
      pointer-events: painted;
    }

    :host(:hover) {
      --gantt-activity-border: 1px solid red;
      --gantt-activity-stroke-color: red;
    }
    
    .placeholder {
      min-height: 100%;
      min-width: 100%;
    }
  `;

  render() {
    return html`<div style="height:${this.lineHeight}px">
      ${this.renderGrid()}
      ${this.renderActivity()}
    </div>`;
  }


  @query("gantt-header-activity, gantt-milestone-activity, gantt-task-activity")
  @internalProperty()
  activityDecorator: GanttBaseActivity;

  get left() {
    return this.activityDecorator.left;
  }

  get center() {
    return this.activityDecorator.center;
  }

  get right() {
    return this.activityDecorator.right;
  }

  get width() {
    return this.activityDecorator.width;
  }

  private isHeader(): boolean {
    return this.data.isHeader !== undefined ? 
      this.data.isHeader : this.getChildren !== undefined 
        ? this.getChildren(this.data).length != 0 : false;
  }

  renderActivity() {
    return html`
      
        ${this.isHeader() ? html`<gantt-header-activity .labelAttribute="${this.labelAttribute}" ?show-label="${this.displayLabel}" ?show-label-inside="${this.displayLabelInside}" .data="${this.data}" .startDate="${this.startDate}" .endDate="${this.endDate}" .dayWidth="${this.dayWidth}"></gantt-header-activity>`:
        this.data.duration == 0 ? html`<gantt-milestone-activity .labelAttribute="${this.labelAttribute}" ?show-label="${this.displayLabel}" ?show-label-inside="${this.displayLabelInside}" .data="${this.data}" .startDate="${this.startDate}" .endDate="${this.endDate}" .dayWidth="${this.dayWidth}"></gantt-milestone-activity>`:
        html`<gantt-task-activity .labelAttribute="${this.labelAttribute}" ?show-label="${this.displayLabel}" ?show-label-inside="${this.displayLabelInside}" .data="${this.data}" .startDate="${this.startDate}" .endDate="${this.endDate}" .dayWidth="${this.dayWidth}"></gantt-task-activity>`
        }

    `;
  }


  dateIsWeekEnd(d: number) {
    const day = new Date(d).getDay();
    return day == 0 || day == 1;
  }

  renderGrid() {
    let nbItem = (this.endDate.getTime() - this.startDate.getTime()) / ONEDAY;
    const font = window.getComputedStyle(this).font;
    const mustRenderCells = this.alwaysDisplayDays || getTextWidth("30",font) < this.dayWidth; 
    if ( this.displayMode == DisplayMode.Week ) {
      nbItem = nbItem / 7;
    } else if ( this.displayMode == DisplayMode.Month ) {
      nbItem = (this.endDate.getFullYear() - this.startDate.getFullYear()) * 12;
      nbItem -= this.startDate.getMonth();
      nbItem += this.endDate.getMonth();
      return nbItem <= 0 ? 0 : nbItem;
    }
    nbItem = Math.floor(nbItem);

    return html`
      <style>
        .cell {
          width: ${this.dayWidth}px !important;
          min-width: ${this.dayWidth}px !important;
          max-width: ${this.dayWidth}px !important;
        }
      </style>
      
      <div class="grid">${mustRenderCells ? Array(nbItem).fill(0).map( (_i, index) =>
        html`<div class="cell ${this.dateIsWeekEnd(this.startDate.getTime() + (index*ONEDAY)) ? 'weekend' : ''}"></div>`
    ): html`<div class="placeholder" style="width:${nbItem*this.dayWidth}px">&nbsp;</div>`}</div>`;

  }


}



class GanttBaseActivity extends LitElement {
  
  @Observer("triggerBoxModification")
  @property({type: Object,
    hasChanged: function(newVal?: Activity, oldVal?: Activity) {
      return (newVal !== undefined && oldVal === undefined) || 
      (newVal === undefined && oldVal !== undefined) ||
      newVal.progress != oldVal.progress || 
      newVal.duration != oldVal.duration ||
      newVal.start != oldVal.start ||
      newVal.color != oldVal.color;
    }})
  data: Activity;

  @property({type: Boolean, attribute:'show-label', reflect: true})
  displayLabel = false;

  @property({type: Boolean, attribute:'show-label-inside', reflect: true})
  displayLabelInside = false;

  @Observer("updateOffset")
  @property({type: Number})
  dayWidth = 1.0;

  @Observer("updateOffset")
  @property({type: Object})
  startDate: Date = new Date();

  @property({type: Object})
  endDate: Date = new Date();

  @property({type: String})
  labelAttribute = 'name';

  @property({type: String})
  color = 'lightgray';

  get left() {
    return this.dayWidth * (((this.data.start.getTime() - this.startDate.getTime()) / ONEDAY) - 1);
  }

  get center() {
    return this.left + (this.dayWidth * this.data.duration) / 2;
  }

  get right() {
    return this.left + this.dayWidth * this.data.duration;
  }

  get activityColor() {
    return this.data.color ? typeof(this.data.color) === 'function' ? this.data.color() : this.data.color : this.color;
  }

  get label() {
    return this.data[this.labelAttribute] ? typeof(this.data[this.labelAttribute]) === 'function' ? this.data[this.labelAttribute]() : this.data[this.labelAttribute] : '';
  }

  get width() {
    return this.dayWidth * (this.data.duration);
  }

  static get styles() {
    return [css`
      .activity {
        -webkit-print-color-adjust: exact;
        border-radius: 2px;
        border: var(--gantt-activity-border, 1px solid transparent);
        margin-top: 2px;
        margin-bottom:1px;
        overflow: visible;
        vertical-align: bottom;
        white-space: nowrap;
        box-sizing: border-box;
        transition: width 0.5s;
        pointer-events: all;
      }

      :host {
        top: 0px;
        position: absolute;
        display: inline-flex;
        height: 100%;
        pointer-events: none;
      }

      .activity .label {
        padding-left: 2px;
        padding-right: 2px;
      }

      .activity-label {
        align-self: center;
        margin-left: 5px;
      }
    `];
  }

  connectedCallback() {
    super.connectedCallback();
    this.updateOffset();
  }

  private triggerBoxModification() {
    const box = new DOMRect();
    box.x = this.left;
    box.width = this.width;
    box.y = 0;//parseFloat(window.getComputedStyle(this.shadowRoot.querySelector(".activity")).marginTop);
    this.dispatchEvent(new CustomEvent("box-changed", {bubbles: true, composed: true, detail: {activity: this.data.id, rect:box}}));
  }

  private updateOffset() {
    this.style.setProperty("left", this.left + "px");
    this.triggerBoxModification();
  }

  renderActivity() {
    return html``;
  }

  renderLabelOutside() {
    return html`${this.displayLabel && !this.displayLabelInside ? html`<div class="activity-label">${this.label}</div>` : ''}`;
  }

  render() {
    return html`
        ${this.renderActivity()}
        ${this.renderLabelOutside()}
    `;
  }
}

@customElement("gantt-task-activity")
class GanttTaskActivity extends GanttBaseActivity {
  static get styles() {
    return [...
      super.styles,
      css`

      .activity {
        position: relative;
        z-index: 0;
      }

      .progress {
        height: calc(100% - 8px);
        margin-top: 4px;
        filter:brightness(50%);
        position: absolute;
        top: 0px;
        z-index: -1;
      }
      
    `];
  } 

  renderActivity() {
    return html`
        <div title="${this.label}" class="activity" style="width:${this.width}px;${this.activityColor !== null ? "background-color:" + this.activityColor : ''}">
        ${this.data.progress ?  html`<div class="progress" style="background-color:${this.activityColor};width:${this.data.progress*100}%"></div>`: ''}
        ${this.displayLabel && this.displayLabelInside && this.label !== undefined && this.label !== '' ? html`<div class="label">${this.label}</div>` : ''}
        </div>
      `;
  }
}

@customElement("gantt-header-activity")
class GanttHeaderActivity extends GanttBaseActivity {

  static get styles() {
    return [...
      super.styles,
      css`

      .activity {
        border: 0px;
        position: relative;
        z-index: 0;
      }

      .progress {
        height: calc(100% - 8px);
        margin-top: 4px;
        filter:brightness(50%);
        position: absolute;
        top: 0px;
        z-index: -1;
      }

      .drawing {
        position: absolute;
        top: 0px;
        left: 0px;
        width: 100%;
        height: 100%;
        z-index: -1;
        stroke: var(--gantt-activity-stroke-color, transparent);
      }
      
    `];
  } 

  renderActivity() {
    //${this.color !== null ? "background-color:" + this.color : ''}
    const top = 0;
    const left = 0;
    const margin = 3;
    const bottom = this.parentElement.getBoundingClientRect().height - margin;
    const right = this.width;

    return html`
        <div title="${this.label}" class="activity" style="width:${this.width}px;">
          <svg class="drawing">
            <path d="M ${left + 5} ${bottom} H ${left} V ${top} H ${right} V ${bottom} H ${right - 5} L ${right - 10} ${bottom - 10} H ${left + 10} Z" fill="${this.activityColor !== undefined ? this.activityColor : ''}"/>
          </svg>
        ${this.data.progress ?  html`<div class="progress" style="background-color:${this.activityColor};width:${this.data.progress*100}%"></div>`: ''}
        ${this.displayLabel && this.displayLabelInside && this.label !== undefined && this.label !== '' ? html`<div class="label">${this.label}</div>` : ''}
        </div>
      `;
  }
}

@customElement("gantt-milestone-activity")
class GanttMilestoneActivity extends GanttBaseActivity {

  static get styles() {
    return [... 
      super.styles,
      css`
        .milestone {
          transform:rotate(45deg) scale(0.6);
        }

        .label {
          align-self: center;
          padding-left: 5px;
        }
      `
    ];
  }

  renderActivity() {
    const width = this.parentElement.getBoundingClientRect().height;
    return html`
      <div title="${this.label}" class="milestone" style="width:${width}px;${this.activityColor !== null ? "background-color:" + this.activityColor : ''}"></div>
      ${this.displayLabel && this.displayLabelInside && this.label !== undefined && this.label !== '' ? html`<div class="label">${this.label}</div>` : ''}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gantt-row': GanttRow;
    'gantt-header-activity': GanttHeaderActivity;
    'gantt-milestone-activity': GanttMilestoneActivity;
    'gantt-task-activity': GanttTaskActivity;
  }
}
