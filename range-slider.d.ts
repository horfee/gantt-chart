import { LitElement } from 'lit-element';
export declare class RangeSlider extends LitElement {
    min: number | Date;
    max: number | Date;
    step: number;
    valueMin: number | Date;
    valueMax: number | Date;
    static styles: import("lit-element").CSSResult;
    resolveValueMin(): number;
    resolveValueMax(): number;
    render(): import("lit-element").TemplateResult;
    connectedCallback(): void;
    disconnectedCallback(): void;
    knobClicked: number;
    clickedCoords: {
        x: number;
        y: number;
        currentValue: any;
    };
    mouseUpOnKnob(_ev: MouseEvent): void;
    mouseDownOnKnob(ev: MouseEvent): void;
    mouseMoveOnKnob(ev: MouseEvent): void;
}
declare global {
    interface HTMLElementTagNameMap {
        'range-slider': RangeSlider;
    }
}
//# sourceMappingURL=range-slider.d.ts.map