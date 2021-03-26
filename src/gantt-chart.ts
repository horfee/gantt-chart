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

import {LitElement, html, customElement, internalProperty, property, css, query, queryAsync} from 'lit-element';
import { Observer } from './PropertyObserver';
import {Activity, GanttColumn, ZoomLevel, Resource, ONEDAY, PredecessorType} from './gantt-common';
import './gantt-chart-header';
import './gantt-row';
import './gantt-constraint';
import './gantt-resource';
import './split-container';
import './gantt-table';
import { GanttRow } from './gantt-row';
import { GanttConstraint } from './gantt-constraint';
import { GanttChartHeader } from './gantt-chart-header';
import { GanttTable } from './gantt-table';



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
  startDate: Date;

  @property({type: Object})
  endDate: Date;
  
  @property({type: Number, reflect: true, attribute:'activity-line-height'})
  activityLineHeight = 24;

  @property({type: Number, reflect: true, attribute:'resource-line-height'})
  resourceLineHeight = 48;

  @property({type: Array})
  columns: Array<GanttColumn> = [];

  @Observer("onSelectedActivityChanged")
  @internalProperty()
  selectedActivity: Activity | null = null;

  sizeObserver: ResizeObserver;

  @internalProperty()
  zoomLevel = null;
  
  @internalProperty()
  innerStartDate: Date;

  @internalProperty()
  innerEndDate: Date;
  
  @property({type: Boolean, attribute:'display-days', reflect: true})
  displayDays = true;

  @property({type: Boolean, attribute:'display-weeks', reflect: true})
  displayWeeks = false;

  @property({type: Boolean, attribute:'display-months', reflect: true})
  displayMonths = true;

  @property({type: Boolean, attribute:'display-years', reflect: true})
  displayYears = true;

  @property({type: Boolean, attribute:'show-label-inside', reflect: true})
  displayLabelInside = false;

  @property({type: Boolean, attribute:'show-label', reflect: true})
  displayLabel = true;

  @property({type: String, attribute:'label-attribute', reflect:true})
  labelAttribute = 'name';


  resolveOffset(d: Date, startDate: Date): number {
    return (d?.getTime() - startDate?.getTime()) / 1000 / 60 / 60 / 24;
  }
  

  @queryAsync("#rowContainer")
  rowContainerAsync: Promise<HTMLElement>;

  @queryAsync("#splitter")
  splitter: Promise<HTMLElement>;

  @internalProperty()
  dayWidth = 1.0;

  private calculateDayWidth() {
    this.rowContainerAsync.then( rowContainer => {
      const containerWidth = parseInt(window.getComputedStyle(rowContainer || this).width);
    
      this.dayWidth = containerWidth / (Math.floor(( (this.innerEndDate?.getTime() || 0) - (this.innerStartDate?.getTime() || 0)) / ONEDAY));
    
      //dayWidth = dayWidth / this.zoom;
      if ( this.dayWidth === Infinity || isNaN(this.dayWidth) ) return;
      if ( this.zoomLevel !== null ) {
        this.dayWidth *= this.zoomLevel;
      }
      if ( this.zoomLevel !== null && this.zoomLevel != ZoomLevel.L1 ) this.dayWidth = this._roundDayWidth(this.dayWidth);// Math.floor(dayWidth);
    });
  }

  

  connectedCallback() {
    super.connectedCallback();
    this.sizeObserver = new ResizeObserver( (_entries) => {
      this.calculateDayWidth()
      console.log("hello");
    });// debounce(this.calculateDayWidth.bind(this),200) );
    this.rowContainerAsync.then( _rowContainer => {
      this.calculateDayWidth();  
    });
    this.sizeObserver.observe(this);
    

  }

  disconnectedCallback() {
    super.disconnectedCallback();
    //this.sizeObserver.unobserve(this);
  }

  onSelectedActivityChanged(newValue: Activity|null|undefined, oldValue: Activity|null|undefined) {
    if ( oldValue ) {
      //oldValue.highlighted = false;
    }
    if ( newValue ) {
      //newValue.highLighted = true;
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
    let alterDate = false;
    if ( changedProperties.has("startDate")) {
      this.innerStartDate = this.startDate;
      alterDate = true;
    }

    if ( changedProperties.has("endDate")) {
      this.innerEndDate = this.endDate;
      alterDate = true;
    }

    if ( changedProperties.has("zoomLevel") || (alterDate && this.innerStartDate && this.innerEndDate)) {
      this.calculateDayWidth();
    }
  }

  private _roundDayWidth(val: number) {
    const intDaywidth = Math.floor(val);
    let v = Math.floor((val - intDaywidth) * 10);
    if ( v < 5 ) v = 0;
    else if ( v > 5 ) v = 10;
    return intDaywidth + Math.floor(v) / 10;
  }

  render() {
    if ( this.dayWidth === undefined || this.dayWidth == 0 || isNaN(this.dayWidth) || this.dayWidth == Infinity ) return html``;

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
      <split-container id="splitter" @splitter-dragend="${this.calculateDayWidth}">
        <!-- Rendering tabular view -->
        <div slot="primary">
          <gantt-table id="table" @highlight-row="${this.highlightChartRow}" @unhighlight-row="${this.unhighlightChartRow}" @toggle-row="${this.toggleRow}" .capacities="${capacities}" .activities="${this.displayedActivities}" .activityLineHeight="${this.activityLineHeight}" .columns="${this.columns}"  .displayDays="${this.displayDays}" .displayWeeks="${this.displayWeeks}"  .displayMonths="${this.displayMonths}"  .displayYears="${this.displayYears}" ></gantt-table>
        </div>
        <!-- End of Rendering tabular view -->

        <!-- Rendering chart view -->
        <div slot="secondary" id="rowContainer">
          <gantt-chart-header id="chartHeader" .locale="${this.locale}" .displayDays="${this.displayDays}" .displayWeeks="${this.displayWeeks}"  .displayMonths="${this.displayMonths}"  .displayYears="${this.displayYears}" .startDate="${this.startDate}" .endDate="${this.endDate}" .lineHeight="${this.activityLineHeight}" .dayWidth="${this.dayWidth}"></gantt-chart-header>
          ${this.displayedActivities.map( elt => 
            html`<gantt-row @mouseover="${this.highlightTableRow}" @mouseout="${this.unhighlightTableRow}" .getChildren="${getChildren}" @box-changed="${this.onBoxChanged}" .labelAttribute="${this.labelAttribute}" id="act${elt.id}" .displayLabel="${this.displayLabel}" .displayLabelInside="${this.displayLabelInside}" .displayDays="${this.displayDays}" .displayWeeks="${this.displayWeeks}" .displayMonths="${this.displayMonths}" .displayYears="${this.displayYears}" @dblclick="${this.onRowDoubleClick}" .startDate="${this.startDate}" .endDate="${this.endDate}" .data="${elt}" .lineHeight="${this.activityLineHeight}" .dayWidth="${this.dayWidth}"></gantt-row>`
          )}
          ${this.constraints.map(constraint =>
            html`<gantt-constraint .activity="${constraint.activity}" type="${constraint.type}" .delay="${constraint.delay}" .predecessor="${constraint.predecessor}"></gantt-constraint>`
          )}
          ${Object.keys(capacities).map( key =>
            html`<gantt-resource .loads="${loads[key] || []}" .lineHeight="${this.resourceLineHeight}" .startDate="${this.startDate}" .dayWidth="${this.dayWidth}" .endDate="${this.endDate}" .capacities="${capacities[key]}"></gantt-resource>`
          )}
        </div>
        <!-- End of Rendering chart view -->
      </split-container>
    `;
  }


  @queryAsync("#table")
  ganttTable: GanttTable;

  private async highlightChartRow(highlightEvent: CustomEvent) {
    const chart = await this.rowContainerAsync;
    const row = chart.querySelector("#act" + highlightEvent.detail);
    if ( row ) row.setAttribute("highlighted", "");
  }

  private async unhighlightChartRow(highlightEvent: CustomEvent) {
    const chart = await this.rowContainerAsync;
    const row = chart.querySelector("#act" + highlightEvent.detail);
    if ( row ) row.removeAttribute("highlighted");
  }

  private async highlightTableRow(ev: MouseEvent){
    if ( ev.currentTarget && (ev.currentTarget as GanttRow).data ) {
      const table = await this.ganttTable;
      table.highlightRow((ev.currentTarget as GanttRow).data.id);
    }
  }

  private async unhighlightTableRow(ev: MouseEvent) {
    if ( ev.currentTarget && (ev.currentTarget as GanttRow).data ) {
      const table = await this.ganttTable;
      table.unhighlightRow((ev.currentTarget as GanttRow).data.id);
    }
  }


  @internalProperty()
  treeNodesToHide: Array<number> = [];

  private toggleRow(ev: CustomEvent) {
    const activity = this.activities.find( val => val.id == ev.detail);
    if ( !activity ) return;

    const containsAll = (arr, target) => target.every(v => arr.includes(v));

    const descendants = this.descendants(activity);
    if ( containsAll(this.treeNodesToHide, descendants)) {
      this.treeNodesToHide = this.treeNodesToHide.filter( val => (descendants).indexOf(val) == -1);
    } else {
      this.treeNodesToHide = this.treeNodesToHide.concat(descendants);
    }
   
  }

  private descendants(act: Activity): number[] {
    let res = [];
    res = res.concat(act.children||[]);
    [...res].forEach( child => res = res.concat(this.descendants(this.activities.find( (act) => act.id == child))));
    return res;
  }


  private get displayedActivities(): Array<Activity> {
    return this.activities.filter( val => this.treeNodesToHide.indexOf(val.id) == -1);
  }

  private get constraints(): Array<FlattenedConstraint> {
    return this.activities.reduce( (acc, act) => acc.concat((act.predecessors||[]).map( p => 
      new Object({ 
        type: p.type,
        delay: p.delay || 0,
        activity: act.id,
        predecessor: p.id
      }))), []);

  }

  @query("#chartHeader")
  header: GanttChartHeader;

  onBoxChanged(ev: CustomEvent) {
    const headerHeight = parseFloat(window.getComputedStyle(this.header).height);
    const id = ev.detail.activity;
    const box = ev.detail.rect;
    box.height = this.activityLineHeight;
    box.y = this.activityLineHeight * (this.activities.findIndex( data => data.id == id)) + headerHeight;

    //const concernedConstraints = this.constraints.filter( (constraint) => constraint.activity == id || constraint.predecessor == id);
    const concernedConstraints = this.shadowRoot.querySelectorAll('gantt-constraint[activity="' + id + '"],gantt-constraint[predecessor="' + id + '"]') as NodeListOf<GanttConstraint>;
    concernedConstraints.forEach( constraint => constraint.handleBoxChanged(id, ev.detail.rect));
    //handleBoxChanged

  }


  public async focusOnActivity(act?: Activity) {
    const row: GanttRow = this.shadowRoot.querySelector("#act" + act.id);
    if ( row && row.data && row.data.id === act.id) {
      const actOffset = row.center;

      const rowContainer = await this.rowContainerAsync;
      const width = parseInt(window.getComputedStyle(rowContainer).width);
      rowContainer.scrollLeft =  actOffset - width / 2;
      //.then( rowContainer => {
      
      // });
    }
  }

  private onRowDoubleClick(ev: MouseEvent) {
    const clickedActivity = ev.target as GanttRow;
    this.focusOnActivity(clickedActivity.data);
  }

  /*
  shouldUpdate(changedProperties) {
    return changedProperties.has("dayWidth") ||
    changedProperties.has("columns") ||
    changedProperties.has("activityes") ||
    changedProperties.has("activityLineHeight") ||
    changedProperties.has("endDate") ||
    changedProperties.has("locale") ||
    changedProperties.has("title") ||
    changedProperties.has("capacities");

  }
  */

  zoomIn(_ev: MouseEvent) {
    this.rowContainerAsync.then( rowContainer => {
      const width = parseInt(window.getComputedStyle(rowContainer.firstElementChild).width);
      const ratio = rowContainer.scrollLeft / width;
      //rowContainer.scrollLeft =  actOffset - width / 2;
      this.updateComplete.then( () => {
        const width = parseInt(window.getComputedStyle(rowContainer.firstElementChild).width);
        rowContainer.scrollLeft = width * ratio;
      });
    });
    this.zoomLevel = Math.min(ZoomLevel.L15, (this.zoomLevel || ZoomLevel.L1) + 1);

  }

  zoomOut(_ev: MouseEvent) {
    this.zoomLevel = Math.max(ZoomLevel.L1, (this.zoomLevel || ZoomLevel.L1) - 1);
  }

}




declare global {
  interface HTMLElementTagNameMap {
    'gantt-chart': GanttChart;
  }
}

