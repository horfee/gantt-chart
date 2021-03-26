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

//import {LitElement, html, customElement, property, css} from 'lit-element';


export enum DisplayMode {
  Day= "Day", 
  Week="Week",
  Month="Month",
}

export const ONEDAY = 86400000; 

export const enum ZoomLevel {
  L1 = 1, L2, L3, L4, L5, L6, L7, L8, L9, L10, L11, L12, L13, L14, L15,
  
}


export declare interface GanttColumn {
  field: string|Function;
  label: string;
  formatter?: Function;
}

export enum PredecessorType {
  'SS','SF','FS','FF'
}

export declare interface Predecessor {
  type: PredecessorType;
  id: number;
  delay?: number;
}

export declare interface Resource {
  type: string;
  quantity: number;
  start?: Date|Function;
  duration?: number|Function;
}

export declare interface Activity {
  start: Date|Function;
  duration: number;
  id: number;
  name?: string|Function;
  predecessors: Array<Predecessor>;
  color: string|Function;
  selectedColor: string;
  isHeader?: boolean;
  progress?: number;
  resources: Array<Resource>;
  children?: Array<number>;
}

export const canvas: HTMLCanvasElement = document.createElement("canvas");
export function getTextWidth(text, font) {
    // re-use canvas object for better performance
    const context = canvas.getContext("2d");
    if ( font !== undefined ) context.font = font;
    return context.measureText(text).width;
}