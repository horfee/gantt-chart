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

import {LitElement, html, customElement, property, css, internalProperty} from 'lit-element';
import {PredecessorType} from './gantt-common';
import { Observer } from './PropertyObserver';



@customElement('gantt-constraint')
export class GanttConstraint extends LitElement {

  @property({type: Number, attribute:"activity", reflect: true})
  activity = undefined;

  @property({type: Number, attribute:"predecessor", reflect: true})
  predecessor = undefined;

  @property({type: Number})
  delay = 0.0;

  @property({type: Number})
  dayWidth = 1.0;

  @Observer("onTypeChanged")
  @property({attribute:'type',converter: { 
    fromAttribute: (value: string, _type) => { 
      return PredecessorType[value];
    },
    toAttribute: (value: PredecessorType, _type) => { 
      return PredecessorType[value];
    }
  }})
  type = PredecessorType.FS;  

  @internalProperty()
  rect: DOMRect = new DOMRect();
    
  @internalProperty()
  points = [];

  static styles = css`
    :host {
      display: block;
      position: absolute;
      pointer-events: none;
    }

    .drawing {
      width: 100%;
      height: 100%;
    }
  `;


  render() {
    return html`
      <div style="box-sizing:border-box;position:absolute;left:${this.rect.left}px;top:${this.rect.top}px;width:${this.rect.width}px;height:${this.rect.height}px;">
        <svg class="drawing">
          <defs>
            <marker id="arrowhead" markerWidth="7" markerHeight="7" 
            refX="7" refY="3.5" orient="auto">
              <polygon points="0,0 7,3.5 0,7" />
            </marker>
          </defs>
          <polyline points="${ this.points.map( elt => elt.x +"," + elt.y).join( " " ) }" marker-end="url(#arrowhead)" fill="none" stroke="black"/>
        </svg>
      </div>
    `;

  }

  spacer = 5;
  private onTypeChanged() {
    if ( this.resolvedActivity === undefined || this.resolvedPredecessor === undefined ) return;
    if ( this.type === PredecessorType.FF ) this.calculatePointFF();
    if ( this.type === PredecessorType.FS ) this.calculatePointFS();
    if ( this.type === PredecessorType.SS ) this.calculatePointSS();
    if ( this.type === PredecessorType.SF ) this.calculatePointSF();
    //this["calculatePoint" + PredecessorType[this.type]]();  // this way is working, but trigger warnings in typescript
  }

  private get resolvedDelay() {
    return this.delay * this.dayWidth;
  }

  private calculatePointFS() {
    this.rect = new DOMRect();
    this.points = [];

    // calculation of the div boundaries
    if ( this.resolvedPredecessor.right + this.resolvedDelay + this.spacer * 2 <= this.resolvedActivity.x ) {
      this.rect.x = this.resolvedPredecessor.right;
      this.rect.width = this.resolvedActivity.left - this.resolvedPredecessor.right + this.spacer * 2;
    } else {
      this.rect.x = this.resolvedActivity.x;
      this.rect.width = this.resolvedPredecessor.right + this.resolvedDelay  + this.spacer * 2 - this.resolvedActivity.left;
    }

    if ( this.resolvedPredecessor.top < this.resolvedActivity.top ) {
      this.rect.y = this.resolvedPredecessor.y;
      this.rect.height = this.resolvedActivity.top - this.resolvedPredecessor.top;
      
    } else {
      this.rect.y = this.resolvedActivity.bottom;
      this.rect.height = this.resolvedPredecessor.bottom - this.resolvedActivity.bottom;
    }
    // end of boundaries calculation
    

    if ( this.resolvedPredecessor.right + this.resolvedDelay + this.spacer <= this.resolvedActivity.x ) {
      if ( this.resolvedPredecessor.top < this.resolvedActivity.top ) {
        const p1 = {x:0, y: this.resolvedPredecessor.height / 2};
        const p2 = {x:this.resolvedActivity.left + this.spacer - this.rect.x, y: this.resolvedActivity.top - this.rect.top};
        this.points.push(p1);
        this.points.push({x:p1.x + this.resolvedDelay, y: p1.y});
        this.points.push({x:p2.x, y: p1.y});
        this.points.push(p2);
      } else {
        const p1 = {x:0, y: this.rect.height - this.resolvedPredecessor.height / 2};
        const p2 = {x: this.resolvedActivity.left + this.spacer - this.rect.x, y: 0};
        this.points.push(p1);
        this.points.push({x:p1.x + this.resolvedDelay, y: p1.y});
        this.points.push({x:p2.x, y: p1.y});
        this.points.push({x:p2.x, y: p2.y});
      }
    } else {
      if ( this.resolvedPredecessor.top < this.resolvedActivity.top ) {
        const p1 = {x:this.resolvedPredecessor.right - this.rect.left, y: this.resolvedPredecessor.height / 2};
        const p2 = {x:this.resolvedActivity.left - this.rect.left + this.spacer, y: this.resolvedActivity.top - this.rect.top};
        const midY = (p2.y + p1.y ) / 2;
        this.points.push(p1);
        this.points.push({x:p1.x + this.resolvedDelay, y: p1.y});
        this.points.push({x:p1.x + this.resolvedDelay + this.spacer, y: p1.y});
        this.points.push({x:p1.x + this.resolvedDelay + this.spacer, y: midY});
        this.points.push({x:p2.x, y: midY});
        this.points.push(p2);
      } else {
        const p1 = {x:this.resolvedPredecessor.right - this.rect.left, y: this.rect.height - this.resolvedPredecessor.height / 2};
        const p2 = {x:this.resolvedActivity.left - this.rect.x + this.spacer, y: 0};
        const midY = p1.y / 2;
        this.points.push(p1);
        this.points.push({x:p1.x + this.resolvedDelay         , y: p1.y});
        this.points.push({x:p1.x + this.resolvedDelay + this.spacer, y: p1.y});
        this.points.push({x:p1.x + this.resolvedDelay + this.spacer, y: midY});
        this.points.push({x:p2.x                         , y: midY});
        this.points.push(p2);        
      }
    }
    this.requestUpdate("rect");
    this.requestUpdate("points");


  }

  private calculatePointSF() {
    this.rect = new DOMRect();
    this.points = [];

    // calculation of the div boundaries
    if ( this.resolvedPredecessor.left - this.spacer <= this.resolvedActivity.right) {
      this.rect.x = this.resolvedPredecessor.left - this.spacer * 2;
      this.rect.width = this.resolvedActivity.right - this.rect.left + this.spacer * 2;
    } else {
      this.rect.x = this.resolvedActivity.right - this.spacer * 2;
      this.rect.width = this.resolvedPredecessor.left - this.rect.x;
    }

    if ( this.resolvedPredecessor.top < this.resolvedActivity.top ) {
      this.rect.y = this.resolvedPredecessor.y;
      this.rect.height = this.resolvedActivity.top - this.resolvedPredecessor.top;
      
    } else {
      this.rect.y = this.resolvedActivity.bottom;
      this.rect.height = this.resolvedPredecessor.bottom - this.resolvedActivity.bottom;
    }
    // end of boundaries calculation

    if ( this.resolvedPredecessor.left - this.spacer <= this.resolvedActivity.right ) {
      if ( this.resolvedPredecessor.top < this.resolvedActivity.top ) {
        const p1 = {x:this.resolvedPredecessor.left - this.rect.left, y: this.resolvedPredecessor.height / 2};
        const p2 = {x:this.resolvedActivity.right - this.spacer - this.rect.x, y: this.resolvedActivity.top - this.rect.top};
        const midY = p1.y + (p2.y - p1.y) / 2;
        this.points.push(p1);
        this.points.push({x:p1.x - this.spacer, y: p1.y});
        
        this.points.push({x:p1.x - this.resolvedDelay - this.spacer, y: p1.y});
        this.points.push({x:p1.x - this.resolvedDelay - this.spacer, y: midY});
        this.points.push({x:p2.x, y: midY});
        this.points.push(p2);
      } else {
        const p1 = {x:this.resolvedPredecessor.left - this.rect.left, y: this.rect.height - this.resolvedPredecessor.height / 2};
        const p2 = {x: this.resolvedActivity.right - this.spacer - this.rect.x, y: 0};
        const midY = p1.y + (p2.y - p1.y) / 2;
        this.points.push(p1);
        this.points.push({x:p1.x - this.resolvedDelay, y: p1.y});
        this.points.push({x:p1.x - this.resolvedDelay - this.spacer, y: p1.y});
        this.points.push({x:p1.x - this.resolvedDelay - this.spacer, y: midY});
        this.points.push({x:p2.x, y: midY});
        this.points.push({x:p2.x, y: p2.y});
      }
    } else {
      if ( this.resolvedPredecessor.top < this.resolvedActivity.top ) {
        const p1 = {x:this.resolvedPredecessor.left - this.rect.x, y: this.resolvedPredecessor.height / 2};
        const p2 = {x:this.resolvedActivity.right - this.spacer - this.rect.left, y: this.resolvedActivity.top - this.rect.top};
        const midY = p1.y + (p2.y -  p1.y ) / 2;
        this.points.push(p1);
        this.points.push({x:p1.x - this.resolvedDelay, y: p1.y});
        this.points.push({x:p2.x, y: p1.y});
        this.points.push({x:p2.x, y: midY});
        this.points.push({x:p2.x, y: midY});
        this.points.push(p2);
      } else {
        const p1 = {x:this.resolvedPredecessor.left - this.rect.left, y: this.resolvedPredecessor.top + this.resolvedPredecessor.height / 2 - this.rect.top};
        const p2 = {x:this.resolvedActivity.right - this.spacer - this.rect.x, y: 0};
        const midY = p1.y / 2;
        this.points.push(p1);
        this.points.push({x:p1.x - this.resolvedDelay, y: p1.y});
        this.points.push({x:p1.x - this.resolvedDelay - this.spacer, y: p1.y});
        this.points.push({x:p2.x, y: p1.y});
        this.points.push({x:p2.x, y: midY});
        this.points.push(p2);        
      }
    }

  }

  private calculatePointFF() {
    this.rect = new DOMRect();
    this.points = [];

    // calculation of the div boundaries
    if ( this.resolvedPredecessor.right + this.resolvedDelay + this.spacer * 2 <= this.resolvedActivity.right ) {
      this.rect.x = this.resolvedPredecessor.right;
      this.rect.width = this.resolvedActivity.right - this.resolvedPredecessor.right;
    } else {
      this.rect.x = this.resolvedActivity.right - this.spacer * 2;
      this.rect.width = this.resolvedPredecessor.right - this.resolvedActivity.right + this.resolvedDelay + this.spacer * 4;
    }

    if ( this.resolvedPredecessor.top < this.resolvedActivity.top ) {
      this.rect.y = this.resolvedPredecessor.y;
      this.rect.height = this.resolvedActivity.top - this.resolvedPredecessor.top;
      
    } else {
      this.rect.y = this.resolvedActivity.bottom;
      this.rect.height = this.resolvedPredecessor.bottom - this.resolvedActivity.bottom;
    }
    // end of boundaries calculation
    if ( this.resolvedPredecessor.right + this.resolvedDelay + this.spacer <= this.resolvedActivity.right ) {
      if ( this.resolvedPredecessor.top < this.resolvedActivity.top ) {
        const p1 = {x:0, y: this.resolvedPredecessor.height / 2};
        const p2 = {x:this.resolvedActivity.right - this.rect.x - this.spacer, y: this.resolvedActivity.top - this.rect.top};
        this.points.push(p1);
        this.points.push({x:p1.x + this.resolvedDelay, y: p1.y});
        this.points.push({x:p2.x, y: p1.y});
        this.points.push(p2);
      } else {
        const p1 = {x:0, y: this.rect.height - this.resolvedPredecessor.height / 2};
        const p2 = {x: this.resolvedActivity.right - this.rect.x - this.spacer, y: 0};
        this.points.push(p1);
        this.points.push({x:p1.x + this.resolvedDelay, y: p1.y});
        this.points.push({x:p2.x, y: p1.y});
        this.points.push({x:p2.x, y: p2.y});
      }
    } else {
      if ( this.resolvedPredecessor.top < this.resolvedActivity.top ) {
        const p1 = {x:this.resolvedPredecessor.right - this.rect.left, y: this.resolvedPredecessor.height / 2};
        const p2 = {x:this.resolvedActivity.right - this.rect.left - this.spacer, y: this.resolvedActivity.top - this.rect.top};
        const midY = (p2.y + p1.y ) / 2;
        this.points.push(p1);
        this.points.push({x:p1.x + this.resolvedDelay, y: p1.y});
        this.points.push({x:p1.x + this.resolvedDelay + this.spacer, y: p1.y});
        this.points.push({x:p1.x + this.resolvedDelay + this.spacer, y: midY});
        this.points.push({x:p2.x, y: midY});
        this.points.push(p2);
      } else {
        const p1 = {x:this.resolvedPredecessor.right - this.rect.left, y: this.rect.height - this.resolvedPredecessor.height / 2};
        const p2 = {x:this.resolvedActivity.right - this.rect.x - this.spacer, y: 0};
        const midY = p1.y / 2;
        this.points.push(p1);
        this.points.push({x:p1.x + this.resolvedDelay         , y: p1.y});
        this.points.push({x:p1.x + this.resolvedDelay + this.spacer, y: p1.y});
        this.points.push({x:p1.x + this.resolvedDelay + this.spacer, y: midY});
        this.points.push({x:p2.x                         , y: midY});
        this.points.push(p2);        
      }
    }
    this.requestUpdate("rect");
    this.requestUpdate("points");

  }

  private calculatePointSS() {
    this.rect = new DOMRect();
    this.points = [];

    // calculation of the div boundaries
    if ( this.resolvedPredecessor.left - this.spacer <= this.resolvedActivity.x + this.resolvedDelay) {
      this.rect.x = this.resolvedPredecessor.left - this.spacer * 2;
      this.rect.width = this.resolvedActivity.left + this.resolvedDelay - this.rect.x + this.spacer * 2;
    } else {
      this.rect.x = this.resolvedActivity.x + this.resolvedDelay - this.spacer * 2;
      this.rect.width = this.resolvedPredecessor.left - this.rect.x;
    }

    if ( this.resolvedPredecessor.top < this.resolvedActivity.top ) {
      this.rect.y = this.resolvedPredecessor.y;
      this.rect.height = this.resolvedActivity.top - this.resolvedPredecessor.top;
      
    } else {
      this.rect.y = this.resolvedActivity.bottom;
      this.rect.height = this.resolvedPredecessor.bottom - this.resolvedActivity.bottom;
    }
    // end of boundaries calculation
    

    if ( this.resolvedPredecessor.left - this.spacer <= this.resolvedActivity.left ) {
      if ( this.resolvedPredecessor.top < this.resolvedActivity.top ) {
        const p1 = {x:this.resolvedPredecessor.left - this.rect.x, y: this.resolvedPredecessor.height / 2};
        const p2 = {x:this.resolvedActivity.left + this.spacer - this.rect.x, y: this.resolvedActivity.top - this.rect.top};
        const midY = p1.y + (p2.y - p1.y) / 2;
        this.points.push(p1);
        this.points.push({x:p1.x - this.spacer, y: p1.y});
        
        this.points.push({x:p1.x - this.resolvedDelay - this.spacer, y: p1.y});
        this.points.push({x:p1.x - this.resolvedDelay - this.spacer, y: midY});
        this.points.push({x:p2.x, y: midY});
        this.points.push(p2);
      } else {
        const p1 = {x:this.resolvedPredecessor.left - this.rect.left, y: this.rect.height - this.resolvedPredecessor.height / 2};
        const p2 = {x: this.resolvedActivity.left + this.spacer - this.rect.x, y: 0};
        const midY = p1.y + (p2.y - p1.y) / 2;
        this.points.push(p1);
        this.points.push({x:p1.x - this.resolvedDelay, y: p1.y});
        this.points.push({x:p1.x - this.resolvedDelay - this.spacer, y: p1.y});
        this.points.push({x:p1.x - this.resolvedDelay - this.spacer, y: midY});
        this.points.push({x:p2.x, y: midY});
        this.points.push({x:p2.x, y: p2.y});
      }
    } else {
      if ( this.resolvedPredecessor.top < this.resolvedActivity.top ) {
        const p1 = {x:this.resolvedPredecessor.left - this.rect.x, y: this.resolvedPredecessor.height / 2};
        const p2 = {x:this.resolvedActivity.left + this.spacer - this.rect.left, y: this.resolvedActivity.top - this.rect.top};
        const midY = p1.y + (p2.y -  p1.y ) / 2;
        this.points.push(p1);
        this.points.push({x:p1.x - this.resolvedDelay, y: p1.y});
        this.points.push({x:p2.x, y: p1.y});
        this.points.push({x:p2.x, y: midY});
        this.points.push({x:p2.x, y: midY});
        this.points.push(p2);
      } else {
        const p1 = {x:this.resolvedPredecessor.left - this.rect.left, y: this.resolvedPredecessor.top + this.resolvedPredecessor.height / 2 - this.rect.top};
        const p2 = {x:this.resolvedActivity.left - this.rect.x + this.spacer, y: 0};
        const midY = p1.y / 2;
        this.points.push(p1);
        this.points.push({x:p1.x - this.resolvedDelay, y: p1.y});
        this.points.push({x:p1.x - this.resolvedDelay - this.spacer, y: p1.y});
        this.points.push({x:p2.x, y: p1.y});
        this.points.push({x:p2.x, y: midY});
        this.points.push(p2);        
      }
    }
    this.requestUpdate("rect");
    this.requestUpdate("points");
  }

  onChange(_newVal: DOMRect, _oldVal: DOMRect) {
    // consol
  }


  connectedCallback() {
    super.connectedCallback();
  }


  resolvedActivity: DOMRect = undefined;
  resolvedPredecessor: DOMRect = undefined;

  handleBoxChanged(id: number, rect: DOMRect) {
    if ( id == this.activity ) this.resolvedActivity = rect;
    else if ( id == this.predecessor ) this.resolvedPredecessor = rect;
    if ( id == this.activity || id == this.predecessor) this.onTypeChanged();
  }

  // private onActivityChanged(_ev) {   
  //   //const container = this.activityContainer.shadowRoot.getElementById("rowContainer");
  //   const activity = this.resolvedActivity;
  //   const predecessor = this.resolvedPredecessor;
  //   //const delay = (this.delay || 0) * this.dayWidth;
  //   const points = [];
  //   const spacing = 12;

  //   const containerRec = container.getBoundingClientRect();

  //   const actRect = {
  //     left : activity.left,
  //     right: activity.right,
  //     top: activity.getBoundingClientRect().top - containerRec.top,
  //     bottom: activity.getBoundingClientRect().bottom,
  //     height: activity.getBoundingClientRect().height,
  //     midY: activity.getBoundingClientRect().top + activity.getBoundingClientRect().height / 2
  //   };
  //   const predRect = {
  //     left : predecessor.left,
  //     right: predecessor.right,
  //     top: predecessor.getBoundingClientRect().top - containerRec.top,
  //     bottom: predecessor.getBoundingClientRect().bottom,
  //     height: predecessor.getBoundingClientRect().height,
  //     midY: predecessor.getBoundingClientRect().top + predecessor.getBoundingClientRect().height / 2
  //   };
  //   if (this.type == PredecessorType.FS ) {
  //     points.push({
  //       x:predRect.right, 
  //       y:predRect.midY});
  //     if (predRect.right < actRect.left && (actRect.left - predRect.right) > (2 * spacing)) {
  //         points.push({
  //           x:predRect.right + Math.abs(predRect.right - actRect.left) / 2 + 1,
  //           y:predRect.midY});
  //     }
  //     else if (predRect.right + spacing > actRect.left - spacing) {
  //         points.push({
  //           x:predRect.right + spacing,
  //           y:predRect.midY});
  //         points.push({
  //           x:predRect.right + spacing,
  //           y:predRect.bottom + (actRect.top - predRect.bottom) / 2 + 1});
  //     }
  //     else if (predRect.right > actRect.left) {
  //         points.push({
  //           x:predRect.right + spacing,
  //           y:predRect.midY});
  //     }
  //     if (predRect.right < actRect.left && (actRect.left - predRect.right) > (2 * spacing)) {
  //         points.push({
  //           x:actRect.left - Math.abs(predRect.right - actRect.left) / 2 + 1,
  //           y:actRect.midY});
  //     }
  //     else if (predRect.right + spacing > actRect.left - spacing) {
  //         points.push({
  //           x:actRect.left - spacing,
  //           y:predRect.bottom + (actRect.top - predRect.bottom) / 2 + 1});
  //         points.push({
  //           x:actRect.left - spacing,
  //           y:actRect.midY});
  //     }
  //     else if (predRect.right > actRect.left) {
  //         points.push({
  //           x:actRect.left - spacing,
  //           y:actRect.midY});
  //     }
  //     points.push({
  //       x:actRect.left,
  //       y:actRect.midY});
  // }
  // else if (this.type == PredecessorType.FF ) {
  //     points.push({
  //       x:predRect.right,
  //       y:predRect.midY});
  //     if (predRect.right < actRect.right + spacing) {
  //         points.push({
  //           x:actRect.right + spacing,
  //           y:predRect.midY});
  //     }
  //     else if (predRect.right + spacing > actRect.right + spacing) {
  //         points.push({
  //           x:predRect.right + spacing,
  //           y:predRect.midY});
  //         points.push({
  //           x:predRect.right + spacing,
  //           y:actRect.midY});
  //     }
  //     else if (predRect.right > actRect.left) {
  //         points.push({
  //           x:predRect.right + spacing,
  //           y:predRect.midY});
  //     }
  //     points.push({
  //       x:actRect.right + spacing,
  //       y:actRect.midY});
  //     points.push({
  //       x:actRect.right,
  //       y:actRect.midY});
  // }
  // else if (this.type == PredecessorType.SS ) {
  //     points.push(predRect.left);
  //     points.push(predRect.midY);
  //     if (predRect.left > actRect.left - spacing) {
  //         points.push(actRect.left - spacing);
  //         points.push(predRect.midY);
  //         points.push(actRect.left - spacing);
  //         points.push(actRect.midY);
  //     }
  //     else {
  //         points.push(predRect.left - spacing);
  //         points.push(predRect.midY);
  //         points.push(predRect.left - spacing);
  //         points.push(actRect.midY);
  //     }
  //     points.push(actRect.left);
  //     points.push(actRect.midY);
  // }
  // else if (this.type == PredecessorType.SF) {
  //     points.push(predRect.left);
  //     points.push(predRect.midY);
  //     if (predRect.left - spacing > actRect.right + spacing) {
  //         points.push(predRect.left - (predRect.left - actRect.right) / 2 + 1);
  //         points.push(predRect.midY);
  //         points.push(predRect.left - (predRect.left - actRect.right) / 2 + 1);
  //         points.push(actRect.midY);
  //     }
  //     else {
  //         points.push(predRect.left - spacing);
  //         points.push(predRect.midY);
  //         points.push(predRect.left - spacing);
  //         points.push(predRect.top - (predRect.top - actRect.bottom) / 2 + 1);
  //         points.push(actRect.right + spacing);
  //         points.push(predRect.top - (predRect.top - actRect.bottom) / 2 + 1);
  //         points.push(actRect.right + spacing);
  //         points.push(actRect.midY);
  //     }
  //     points.push(actRect.right);
  //     points.push(actRect.midY);
  // }

  //   const min = points.reduce( (acc,val) => new Object({ x: Math.min(acc.x, val.x), y: Math.min(acc.y, val.y)}), {x:Infinity,y:Infinity});
  //   const max = points.reduce( (acc,val) => new Object({ x: Math.max(acc.x, val.x), y: Math.max(acc.y, val.y)}), {x:0,y:0});
  //   //points = points.map( elt => new Object({x: elt.x - points[0].x, y: elt.y - points[0].y}));
    
  //   /*
  //   if ( this.type == PredecessorType.FS ) {
  //     points.push({ x : predecessor.right, y : predRect.top + (predRect.height / 2)});
  //     points.push({ x : predecessor.right + delay, y : predRect.top + (predRect.height / 2)});

  //     if ( predecessor.right + delay + degagement < activity.left ) {
  //       min = {x: predecessor.right};
  //     } else {
  //       min = {x: activity.right};
  //     }
  //     points.push({ x : predecessor.right + delay + degagement, y : predRect.top + (predRect.height / 2)});

  //     points.push({ x : activity.left - degagement, y : actRect.top + (actRect.height / 2)});
  //     points.push({ x : activity.left, y : actRect.top + (actRect.height / 2)});
    
      
  //   }*/

    
  //   this.style.setProperty("left", (min.x - 1) + "px");
  //   this.style.setProperty("top", (Math.min(predRect.top, actRect.top)) + "px");
  //   this.style.setProperty("width", (max.x - min.x) + "px");
  //   this.style.setProperty("height", (max.y - min.y + actRect.height) + "px");

  //   this.points = points.map( elt => new Object({x : elt.x - min.x, y : elt.y - min.y + actRect.height / 2}));
  // }

}

declare global {
  interface HTMLElementTagNameMap {
    'gantt-constraint': GanttConstraint;
  }
}
