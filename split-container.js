var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html, customElement, property, css, query } from 'lit-element';
import { queryAssignedNode } from './QueryAssignedNode';
import { sharedStyles } from './sharedStyles';
export var SplitContainerDirection;
(function (SplitContainerDirection) {
    SplitContainerDirection["horizontal"] = "horizontal";
    SplitContainerDirection["vertical"] = "vertical";
})(SplitContainerDirection || (SplitContainerDirection = {}));
let SplitContainer = class SplitContainer extends LitElement {
    constructor() {
        super(...arguments);
        this.orientation = SplitContainerDirection.horizontal;
    }
    static get styles() {
        return [sharedStyles, css `
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
        return html `
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
    /** @private */
    setPointerEventsNone(event) {
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
        this.listenToMouseUp = this.listenToMouseUp.bind(this);
        window.addEventListener("mousemove", this.onHandleTrack);
        window.addEventListener("mouseup", this.listenToMouseUp);
        this.dispatchEvent(new CustomEvent('splitter-dragstart'));
    }
    // private listenToMouseMove(ev: MouseEvent) {
    // }
    listenToMouseUp(ev) {
        window.removeEventListener("mousemove", this.onHandleTrack);
        window.removeEventListener("mouseup", this.listenToMouseUp);
        this.restorePointerEvents();
        ev.preventDefault();
    }
    /** @private */
    restorePointerEvents() {
        if (!this.primaryChild || !this.secondaryChild) {
            return;
        }
        this.primaryChild.style.pointerEvents = this.previousPrimaryPointerEvents;
        this.secondaryChild.style.pointerEvents = this.previousSecondaryPointerEvents;
        this.dispatchEvent(new CustomEvent('splitter-dragend'));
        this.startSize = undefined;
    }
    setFlexBasis(element, flexBasis, containerSize) {
        flexBasis = Math.max(0, Math.min(flexBasis, containerSize));
        if (flexBasis === 0) {
            // Pure zero does not play well in Safari
            flexBasis = 0.000001;
        }
        element.style.flex = '1 1 ' + flexBasis + 'px';
    }
    /** @private */
    onHandleTrack(event) {
        if (event.buttons !== 1)
            return;
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
};
__decorate([
    property({ attribute: "orientation", reflect: true, converter: {
            fromAttribute: (value, _type) => {
                return SplitContainerDirection[new String(value).toLowerCase()];
            },
            toAttribute: (value, _type) => {
                return value.toString();
            }
        } })
], SplitContainer.prototype, "orientation", void 0);
__decorate([
    queryAssignedNode("primary")
], SplitContainer.prototype, "primaryChild", void 0);
__decorate([
    queryAssignedNode("secondary")
], SplitContainer.prototype, "secondaryChild", void 0);
__decorate([
    query("#splitter")
], SplitContainer.prototype, "splitter", void 0);
SplitContainer = __decorate([
    customElement('split-container')
], SplitContainer);
export { SplitContainer };
//# sourceMappingURL=split-container.js.map