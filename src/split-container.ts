import {LitElement, html, customElement, property, css, query} from 'lit-element';
import { queryAssignedNode} from './QueryAssignedNode';
import {sharedStyles} from './sharedStyles';

export enum SplitContainerDirection {
    horizontal='horizontal',
    vertical='vertical'
}

@customElement('split-container')
export class SplitContainer extends LitElement {


    @property({ attribute: "orientation", reflect: true, converter: {
        fromAttribute: (value, _type) => {
            return SplitContainerDirection[new String(value).toLowerCase()];
        },
        toAttribute: (value: SplitContainerDirection, _type) => {
            return value.toString();
        }
    }})
    orientation: SplitContainerDirection = SplitContainerDirection.horizontal;

    static get styles() { return [sharedStyles, css`
        :host {
        display: flex;
        overflow: hidden !important;
        transform: translateZ(0);
      }

      :host([hidden]) {
        display: none !important;
      }

      :host([orientation="vertical"]) {
        flex-direction: column;
      }

      :host ::slotted(*) {
        flex: 1 1 auto;
        overflow: auto;
        -webkit-overflow-scrolling: touch;
      }

      [part="splitter"] {
        flex: none;
        position: relative;
        z-index: 1;
        overflow: visible;
        min-width: 8px;
        min-height: 8px;
      }

      :host(:not([orientation="vertical"])) > [part="splitter"] {
        cursor: ew-resize;
      }

      :host([orientation="vertical"]) > [part="splitter"] {
        cursor: ns-resize;
      }

      [part="handle"] {
        width: 40px;
        height: 40px;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate3d(-50%, -50%, 0);
      }
    `];
    }

    render() {
        return html`
            <slot id="primary" name="primary"></slot>
            <div part="splitter" id="splitter" @mousedown="${this.setPointerEventsNone}">
            <div part="handle"></div>
            </div>
            <slot id="secondary" name="secondary"></slot>

            <div hidden>
            <!-- Workaround to fix a Shady style scoping issue caused by dynamic slot naming of the child elements (primary/secondary) -->
            <slot></slot>
            </div>
        `;
    }

    connectedCallback() {
        super.connectedCallback();
    }

    previousPrimaryPointerEvents: string;
    previousSecondaryPointerEvents: string;

    @queryAssignedNode("primary")
    primaryChild: HTMLElement;

    @queryAssignedNode("secondary")
    secondaryChild: HTMLElement;


    startSize: { container: number; primary: number; secondary: number; coords: {x: number; y: number}};

    /** @private */
    private setPointerEventsNone(event: MouseEvent) {
        if (!this.primaryChild || !this.secondaryChild) {
            return;
        }
        this.previousPrimaryPointerEvents = this.primaryChild.style.pointerEvents;
        this.previousSecondaryPointerEvents = this.secondaryChild.style.pointerEvents;
        this.primaryChild.style.pointerEvents = 'none';
        this.secondaryChild.style.pointerEvents = 'none';

        event.preventDefault();

        const size = this.orientation === SplitContainerDirection.vertical ? 'height' : 'width';
        this.startSize = {
            container: this.getBoundingClientRect()[size] - this.splitter.getBoundingClientRect()[size],
            primary: this.primaryChild.getBoundingClientRect()[size],
            secondary: this.secondaryChild.getBoundingClientRect()[size],
            coords: {
                x: event.x,
                y: event.y
            }
            };
        this.onHandleTrack = this.onHandleTrack.bind(this);
        this.listenToMouseUp = this.listenToMouseUp.bind(this)
        window.addEventListener("mousemove", this.onHandleTrack);
        window.addEventListener("mouseup", this.listenToMouseUp);

        this.dispatchEvent(new CustomEvent('splitter-dragstart'));
    }

    // private listenToMouseMove(ev: MouseEvent) {


    // }

    private listenToMouseUp(ev: MouseEvent) {
        window.removeEventListener("mousemove", this.onHandleTrack);
        window.removeEventListener("mouseup", this.listenToMouseUp);
        this.restorePointerEvents();
        ev.preventDefault();
    }

    /** @private */
    private restorePointerEvents() {
        if (!this.primaryChild || !this.secondaryChild) {
            return;
        }
        this.primaryChild.style.pointerEvents = this.previousPrimaryPointerEvents;
        this.secondaryChild.style.pointerEvents = this.previousSecondaryPointerEvents;

        this.dispatchEvent(new CustomEvent('splitter-dragend'));

        this.startSize = undefined;
    }


    private setFlexBasis(element, flexBasis, containerSize) {
        flexBasis = Math.max(0, Math.min(flexBasis, containerSize));
        if (flexBasis === 0) {
            // Pure zero does not play well in Safari
            flexBasis = 0.000001;
        }
        element.style.flex = '1 1 ' + flexBasis + 'px';
    }

    @query("#splitter")
    splitter: HTMLElement;
    
    /** @private */
    private onHandleTrack(event: MouseEvent) {
        if ( event.buttons !== 1 ) return;
        if (!this.primaryChild || !this.secondaryChild) {
            return;
        }

        const distance = this.orientation === SplitContainerDirection.vertical ? event.y - this.startSize.coords.y : event.x - this.startSize.coords.x;
        const isRtl = this.orientation !== SplitContainerDirection.vertical && this.getAttribute('dir') === 'rtl';
        const dirDistance = isRtl ? -distance : distance;

        this.setFlexBasis(this.primaryChild, this.startSize.primary + dirDistance, this.startSize.container);
        this.setFlexBasis(this.secondaryChild, this.startSize.secondary - dirDistance, this.startSize.container);
        
        this.dispatchEvent(new CustomEvent('splitter-drag'));
    }
      
}

declare global {
    interface HTMLElementTagNameMap {
      'split-container': SplitContainer;
    }
  }
  