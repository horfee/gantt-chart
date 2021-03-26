import { LitElement } from 'lit-element';
export declare enum SplitContainerDirection {
    horizontal = "horizontal",
    vertical = "vertical"
}
export declare class SplitContainer extends LitElement {
    orientation: SplitContainerDirection;
    static get styles(): import("lit-element").CSSResult[];
    render(): import("lit-element").TemplateResult;
    connectedCallback(): void;
    previousPrimaryPointerEvents: string;
    previousSecondaryPointerEvents: string;
    primaryChild: HTMLElement;
    secondaryChild: HTMLElement;
    startSize: {
        container: number;
        primary: number;
        secondary: number;
        coords: {
            x: number;
            y: number;
        };
    };
    /** @private */
    private setPointerEventsNone;
    private listenToMouseUp;
    /** @private */
    private restorePointerEvents;
    private setFlexBasis;
    splitter: HTMLElement;
    /** @private */
    private onHandleTrack;
}
declare global {
    interface HTMLElementTagNameMap {
        'split-container': SplitContainer;
    }
}
//# sourceMappingURL=split-container.d.ts.map