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
import './gantt-common';
import {getTextWidth} from './gantt-common';

//import './PropertyObserver';
//import { Observer } from './PropertyObserver';

@customElement('gantt-header')
export class GanttHeader extends LitElement {

  @property({type: String})
  locale = navigator.language;

  @property({type: Object})
  startDate: Date = new Date();

  @property({type: Object})
  endDate: Date = new Date();

  @property({type: Number})
  dayWidth = 10.0;

  @property({type: Boolean})
  alwaysDisplayDays = true;



  static styles = css`
    :host {
      display: block;

    }

    [hidden] {
      display:none;
    }

    .flexbox {
      display: flex;
    }

    .row {
      flex-direction: row;
    }

    .column {
      flex-direction: column;
    }

    .flex {
      flex: 1;
    }

    .text-center {
      text-align: center;
    }

    .year {
      overflow: hidden;
      text-overflow: ellipsis;
      border-bottom: 1px solid lightgray;
      border-left: 0px;
    }

    .year.year-0 {
      border-left: 0px;
    }

    .year:not(.year-0)>div {
      border-left: 1px solid lightgray;
    }

    .month {
      overflow: hidden;
      text-overflow: ellipsis;
      border-left: 1px solid lightgray;
      border-bottom: 1px solid lightgray;
    }
    
    .year-0 .month.month-0 {
      border-left: 1px solid transparent;
    }

    .day {
      overflow: hidden;
      text-overflow: ellipsis;
      border-left: 1px solid lightgray;
      box-sizing: border-box;
    }

    .year-0 .month-0 .day-0 {
      border-left: 1px solid transparent;
    }
  `;

  getYears() {
    let y = this.startDate.getFullYear();
    const years = [];
    let d = new Date(this.startDate);

    do {
      const year = {year: y, nbDays:0, months: this.getMonths(d)};
      year.nbDays = year.months.reduce( (acc, month) => acc + month.nbDays, 0);
      years.push(year);
      y++;
      d = new Date(y,0,1,0,0,0,0);
    } while( y <= this.endDate.getFullYear());



    const formats = [
      new Intl.DateTimeFormat(this.locale, { month: 'long' }),
      new Intl.DateTimeFormat(this.locale, { month: 'short' }),
      new Intl.DateTimeFormat(this.locale, { month: '2-digit' })];

    const font = window.getComputedStyle(this).font;
    let invalidLength: boolean;
    let i = 0;
    let format;
    do {
      format = formats[i++];
      
      invalidLength = years.reduce( (acc,year) => acc.concat(year.months), []).map( month => {
        const text = format.format(month.month);
        return { text: text, monthWidth: this.dayWidth * month.nbDays, width: getTextWidth(text,font)}
      }).some( elt => elt.monthWidth < elt.width);
    } while ( invalidLength && i < formats.length);
    years.reduce( (acc,year) => acc.concat(year.months), []).map( month => month.month = format.format(month.month));
    
    return years;
  }

  
  getMonths(d: Date) {
    //const SAFARI_OFFSET_FIX = 1;
    
    const months = [];

    const tmp = new Date(d);
    let endTmp = new Date(tmp.getFullYear()+1,0,1,0,0,0,0);
    endTmp = endTmp.getTime() < this.endDate.getTime() ? endTmp : this.endDate;
    while ( tmp.getTime() < endTmp.getTime() ) {
      const days = this.getDays(tmp, months.length == 0);
      months.push({month: new Date(tmp), days: days, nbDays: days.length});
      tmp.setMonth(tmp.getMonth() + 1);
    }

    return months;
  }

  

  getDays(date: Date, startFromDate: boolean) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const bissextile = year % 4 != 0 || year % 100 == 0 && year % 400 != 0;
    const nbDaysBissextile = [31, bissextile ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    const res = [];
    const lastDate = this.endDate.getFullYear() == date.getFullYear() && this.endDate.getMonth() == date.getMonth() ? this.endDate.getDate() +1 : nbDaysBissextile[month];
    for(let i = (startFromDate ? date.getDate() : 0); i < lastDate; i++) {
      res.push(i);
    }
    return res;
  }


  render() {
    const data = this.getYears();
    const font = window.getComputedStyle(this).font;
    const textFitDay = getTextWidth("30",font) < this.dayWidth;
    const mustRenderCells = this.alwaysDisplayDays  || textFitDay; 

    return html`
      <style>

        .day {
          width: ${this.dayWidth}px;
          min-width: ${this.dayWidth}px;
          max-width: ${this.dayWidth}px;
        }
      </style>
      <div class="flexbox row">
      ${data.map( (year, yIndex) => {
        return html `
          <div class="flexbox year-${yIndex} column flex">
            <div class="gridrow year year-${yIndex} text-center" style="width:${year.nbDays * this.dayWidth}px"><div>${year.year}</div></div>
            <div class="flexbox row">
              ${year.months.map( (month, index) => html`
                <div class="flex month-${index}" style="width:${month.nbDays * this.dayWidth}px">
                  <div class="flexbox column">
                    <div class="gridrow flex text-center"><div class="month month-${index}" >${month.month}</div></div>
                    ${mustRenderCells ? html`<div class="gridrow flexbox row flex">${ month.days.map( (v) => html`<div class="flex day day-${v} text-center">${v}</div>`)}</div>`
                    : ''}
                  </div>
                </div>`)}
            </div>
          </div>`
      })}
      </div>
    `;
  }

  

}




declare global {
  interface HTMLElementTagNameMap {
    'gantt-header': GanttHeader;
  }
}

