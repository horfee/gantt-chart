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

import {LitElement, html, customElement, internalProperty, property, css} from 'lit-element';
import { Observer } from './PropertyObserver';
import {Activity, Predecessor, ZoomLevel, Resource, ONEDAY, PredecessorType} from './gantt-common';
import './gantt-header';
import './gantt-row';
import './gantt-constraint';
import './gantt-resource';
import { GanttRow } from './gantt-row';
import { GanttConstraint } from './gantt-constraint';

interface FlattenedConstraint {
  type: PredecessorType;
  delay: number;
  activity: number;
  predecessor: number;
}

@customElement('gantt-chart')
export class GanttChart extends LitElement {

  @property({type: String, reflect: true})
  title = 'Gantt Chart';

  @property({type: Array})
  activities: Array<Activity> = [];

  @property({type: Array})
  capacities: Array<Resource> = [];

  @property({type: String})
  locale = navigator.language;

  @property({type: Object})
  startDate: Date = new Date();

  @property({type: Object})
  endDate: Date = new Date();
  
  @property({type: Number, reflect: true, attribute:'activity-line-height'})
  activityLineHeight = 24;

  @property({type: Number, reflect: true, attribute:'resource-line-height'})
  resourceLineHeight = 48;

  @Observer("onSelectedActivityChanged")
  @internalProperty()
  selectedActivity: Activity | null = null;

  sizeObserver: ResizeObserver;

  @internalProperty()
  zoomLevel = null;
  
  @internalProperty()
  innerStartDate: Date = new Date();

  @internalProperty()
  innerEndDate: Date = new Date();
  
  @property({type: Boolean, attribute:'always-display-days', reflect: true})
  alwaysDisplayDays = true;

  @property({type: Boolean, attribute:'show-label-inside', reflect: true})
  displayLabelInside = false;

  @property({type: Boolean, attribute:'show-label', reflect: true})
  displayLabel = true;

  @property({type: String, attribute:'label-attribute', reflect:true})
  labelAttribute = 'name';


  resolveOffset(d: Date, startDate: Date): number {
    return (d?.getTime() - startDate?.getTime()) / 1000 / 60 / 60 / 24;
  }
  

  connectedCallback() {
    super.connectedCallback();
    this.sizeObserver = new ResizeObserver( () => this.requestUpdate());
    this.sizeObserver.observe(this);
    
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.sizeObserver.unobserve(this);
  }

  onSelectedActivityChanged(newValue: Activity|null|undefined, oldValue: Activity|null|undefined) {
    if ( oldValue ) {
      oldValue?.predecessors.map( (elt: Predecessor) => elt.id).forEach( (id: number) => {
        const line: HTMLElement | null | undefined = this.shadowRoot?.querySelector("#pred-" + oldValue.id + "-" + id);
        line?.classList.remove("highlighted");
      });
    }
    if ( newValue ) {
      newValue.predecessors.map( (elt: Predecessor) => elt.id).forEach( (id: number) => {
        const line: HTMLElement | null | undefined = this.shadowRoot?.querySelector("#pred-" + newValue.id + "-" + id);
        line?.classList.add("highlighted");
      });
    }
  }

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;

    }

    [hidden] {
      display:none;
    }

    #rowContainer {
      overflow:scroll;
      display: flex;
      flex-direction: column;
      justify-items: stretch;
      align-items: flex-start;
      border: 1px solid lightgray;
      box-sizing: border-box;
      position: relative;
    }


    .toolbar {
      height: 32px;
    }


    @media print {
      .toolbar {
        display: none;
      }
    }
    
    gantt-header {
      position: sticky;
      background-color: white;
      top: 0px;
      z-index:100;
    }
  `;


  update(changedProperties: Map<string | number | symbol, unknown>) {
    super.update(changedProperties);
    if ( changedProperties.has("startDate")) {
      this.innerStartDate = this.startDate;
    }

    if ( changedProperties.has("endDate")) {
      this.innerEndDate = this.endDate;
    }
  }

  private _roundDayWidth(val: number) {
    const intDaywidth = Math.floor(val);
    let v = Math.floor((val - intDaywidth) * 10);
    if ( v < 5 ) v = 0;
    else if ( v > 5 ) v = 10;
    return intDaywidth + Math.floor(v) / 10;
  }


  private get orderedActivities() {
    return this.activities.sort( (a1: Activity, a2: Activity) => {
      return a1.children && [...a1.children].indexOf(a2.id) > -1 ? -1 : a1.start < a2.start ? -1 : a1.start == a2.start ? 0 : 1;
    }).sort();
  }
  render() {
    const svgWidth = parseInt(window.getComputedStyle(this).width);
   
    let dayWidth = svgWidth / (Math.floor(( this.innerEndDate.getTime() - this.innerStartDate.getTime()) / ONEDAY));
    //dayWidth = dayWidth / this.zoom;
    if ( dayWidth === Infinity || isNaN(dayWidth) ) return html ``;
    if ( this.zoomLevel !== null ) {
      dayWidth *= this.zoomLevel;
    }
    if ( this.zoomLevel !== null && this.zoomLevel != ZoomLevel.L1 ) dayWidth = this._roundDayWidth(dayWidth);// Math.floor(dayWidth);
    
    const capacities = this.capacities.reduce ( (acc, capacity) => {
      if ( acc[capacity.type] === undefined ) acc[capacity.type] = [];
      acc[capacity.type].push(capacity);
      return acc;
    }, {});

    const loads = this.activities.reduce( (acc, activity) => acc.concat(activity.resources || []), []).reduce( (acc, load) => {
      if ( acc[load.type] === undefined ) acc[load.type] = [];
      acc[load.type].push(load);
      return acc;
    }, {});
    
    Object.keys(loads).forEach( load => {
      if ( capacities[load] === undefined ) {
        capacities[load] = [{
          quantity: 0,
          start: this.startDate,
          duration: 0
        }]
      }
    });

    const getChildren = (parent) => {
      return this.activities.filter( activity => (parent.children || []).indexOf(activity.id) > -1);
    };

    return html`
      <h1>${this.title}!</h1>
      <div class="toolbar">
        <button @click="${this.zoomIn}" label="Zoom in">Zoom In</button>
        <button @click="${this.zoomOut}" value="Zoom out">Zoom Out</button>
      </div>
      <div id="rowContainer">
        <gantt-header .locale="${this.locale}" .alwaysDisplayDays="${this.alwaysDisplayDays}" .startDate="${this.startDate}" .endDate="${this.endDate}" .lineHeight="${this.activityLineHeight}" .dayWidth="${dayWidth}"></gantt-header>
        ${this.orderedActivities.map( elt => 
          html`<gantt-row .getChildren="${getChildren}" @box-changed="${this.onBoxChanged}" .labelAttribute="${this.labelAttribute}" id="${elt.id}" ?show-label="${this.displayLabel}" ?show-label-inside="${this.displayLabelInside}" .alwaysDisplayDays="${this.alwaysDisplayDays}" @dblclick="${this.focusOnActivity}" .startDate="${this.startDate}" .endDate="${this.endDate}" .data="${elt}" .lineHeight="${this.activityLineHeight}" .dayWidth="${dayWidth}"></gantt-row>`
        )}
        ${this.constraints.map(constraint =>
          html`<gantt-constraint .activity="${constraint.activity}" type="${constraint.type}" .delay="${constraint.delay}" .predecessor="${constraint.predecessor}"></gantt-constraint>`
        )}
        ${Object.keys(capacities).map( key =>
          html`<gantt-resource .loads="${loads[key] || []}" .lineHeight="${this.resourceLineHeight}" .startDate="${this.startDate}" .dayWidth="${dayWidth}" .endDate="${this.endDate}" .capacities="${capacities[key]}"></gantt-resource>`
        )}
      </div>
    `;
  }

  private get constraints(): Array<FlattenedConstraint> {
    return this.activities.reduce( (acc, act) => acc.concat(act.predecessors.map( p => 
      new Object({ 
        type: p.type,
        delay: p.delay || 0,
        activity: act.id,
        predecessor: p.id
      }))), []);

  }

  onBoxChanged(ev: CustomEvent) {
    console.log(ev);
    const headerHeight = parseFloat(window.getComputedStyle(this.shadowRoot.querySelector("gantt-header")).height);
    const id = ev.detail.activity;
    const box = ev.detail.rect;
    box.height = this.activityLineHeight;
    box.y = this.activityLineHeight * (this.activities.findIndex( data => data.id == id)) + headerHeight;

    //const concernedConstraints = this.constraints.filter( (constraint) => constraint.activity == id || constraint.predecessor == id);
    const concernedConstraints = this.shadowRoot.querySelectorAll('gantt-constraint[activity="' + id + '"],gantt-constraint[predecessor="' + id + '"]') as NodeListOf<GanttConstraint>;
    concernedConstraints.forEach( constraint => constraint.handleBoxChanged(id, ev.detail.rect));
    //handleBoxChanged

  }


  focusOnActivity(ev: MouseEvent) {
    const clickedActivity = ev.target as GanttRow;
    const actOffset = clickedActivity.center;
    const width = parseInt(window.getComputedStyle(this.shadowRoot.querySelector("#rowContainer")).width);

    this.shadowRoot.querySelector("#rowContainer").scrollLeft =  actOffset - width / 2;

  }

  zoomIn(_ev: MouseEvent) {
    this.zoomLevel = Math.min(ZoomLevel.L15, this.zoomLevel === null ?  ZoomLevel.L1 + 2 : this.zoomLevel + 1);

  }

  zoomOut(_ev: MouseEvent) {
    this.zoomLevel = Math.max(ZoomLevel.L1, this.zoomLevel === null ?  1 : this.zoomLevel - 1);
  }

}




declare global {
  interface HTMLElementTagNameMap {
    'gantt-chart': GanttChart;
  }
}

