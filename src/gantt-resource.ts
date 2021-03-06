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

import {LitElement, html, customElement, property, css} from 'lit-element';
import {Resource, ONEDAY} from './gantt-common';


interface AggregatedResource {
  start: Date|Function;
  end: Date;
  duration: number;
  quantity: number;
}

@customElement('gantt-resource')
export class GanttResource extends LitElement {

  @property({type: Array})
  capacities: Array<Resource> = [];

  @property({type: Array})
  loads: Array<Resource> = [];

  @property({type: Object})
  startDate: Date = new Date();

  @property({type: Object})
  endDate: Date = new Date();

  @property({type: Number})
  dayWidth = 10.0;
  
  @property({type: Number})
  lineHeight = 24.0;
  
  static styles = css`
    :host {
      display: block;
      position: relative;
      box-sizing: border-box;
      border-top: 1px solid lightgray;
    }

    .capacity {
      -webkit-print-color-adjust: exact;
      position: absolute;
      bottom: 0px;
      background-color: yellow;
    }

    .load {
      -webkit-print-color-adjust: exact;
      position: absolute;
      bottom: 0px;
      background-color: #0000FFAA;
    }

    .load.invalid {
      -webkit-print-color-adjust: exact;
      background-color: #FF0000AA;
    }

  `;


  private resolveDate(d: Date|Function): Date {
    return d instanceof Function ? d() : d;
  }

  private resolveDuration(d: number|Function): number {
    return d instanceof Function ? d() : d;
  }

  leftOf(res: Resource|AggregatedResource) {
    return this.dayWidth * (((this.resolveDate(res.start).getTime() - this.startDate.getTime()) / ONEDAY) - 1);
  }

  private get stackedLoads(): Array<AggregatedResource> {
    let dates = [];

    this.loads.forEach( load => {
      const d = this.resolveDate(load.start); 
      const duration = this.resolveDuration(load.duration);
      if (dates.indexOf(d.getTime()) == -1 ) dates.push(d.getTime());
      if (dates.indexOf(d.getTime() + duration * ONEDAY) == -1 ) dates.push(d.getTime() + duration * ONEDAY);      
    });
    dates = dates.sort();

    const res = [];
    for(let i = 0; i < dates.length - 1; i++) {
      res.push({
        start: new Date(dates[i]),
        end: new Date(dates[i+1]),
        duration: (dates[i+1] - dates[i]) / ONEDAY,
        quantity: 0
      })
    }

    for(const load of this.loads) {
      for(const r of res) {
        const start = this.resolveDate(load.start);
        const end = new Date(start.getTime() + this.resolveDuration(load.duration) * ONEDAY);
        if ( (start > r.start && start < r.endTmp) 
        || (end > r.start && end < r.end)
        || (start <= r.start && end >= r.end )) { 
          r.quantity += load.quantity;
        }
      }
    }

    return res;
  }

  render() {
    
    const stackedResources = this.stackedLoads;
    const maxQty = Math.max(
        this.capacities.reduce( (acc, val) => acc = Math.max(acc,val.quantity), 0),
        stackedResources.reduce( (acc, val) => acc = Math.max(acc,val.quantity), 0),
    );
    let nbItem = (this.endDate.getTime() - this.startDate.getTime()) / ONEDAY;
    nbItem = Math.floor(nbItem);

    const width = this.dayWidth * nbItem;

    const canBeCovered = (res: AggregatedResource) => {
      const filtered = this.capacities.filter( (resource) => resource.quantity >= res.quantity && resource.start <= res.start && new Date(this.resolveDate(resource.start).getTime() + this.resolveDuration(resource.duration) * ONEDAY) >= res.end);
      return filtered.length > 0;
    }
    console.log("Resource : nbItem = " + nbItem + " dayWidth = " + this.dayWidth + " total = " + width);
    return html`
      <div style="width:${width}px;max-width:${width}px;min-width:${width}px;height:${this.lineHeight}px">
        <div style="width: 100%; height: 100%;margin-top: 4px; position: relative;">
          ${this.capacities.map( res => html`
            <div class="capacity" title="${res.quantity}" style="left:${this.leftOf(res)}px; width:${this.resolveDuration(res.duration) * this.dayWidth}px; height:${res.quantity * 100 / maxQty}%"></div>
          `)}
          ${stackedResources.map( res => html`
          <div class="load ${!canBeCovered(res) ? "invalid" : ""}" title="${res.quantity}" style="left:${this.leftOf(res)}px; width:${res.duration * this.dayWidth}px; height:${res.quantity * 100 / maxQty}%"></div>
          `)}
        </div>
    </div>
    `;
  }

}




declare global {
  interface HTMLElementTagNameMap {
    'gantt-resource': GanttResource;
  }
}

