var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html, customElement, property, css } from 'lit-element';
let RangeSlider = class RangeSlider extends LitElement {
    constructor() {
        super(...arguments);
        this.min = 0;
        this.max = 0;
        this.step = 2;
        this.valueMin = 0;
        this.valueMax = 0;
        this.knobClicked = 0;
    }
    resolveValueMin() {
        const vMin = typeof (this.valueMin) === 'number' ? this.valueMin : this.valueMin.getTime();
        const min = typeof (this.min) === 'number' ? this.min : this.min.getTime();
        const max = typeof (this.max) === 'number' ? this.max : this.max.getTime();
        return 100 * vMin / (max - min);
    }
    resolveValueMax() {
        const vMax = typeof (this.valueMax) === 'number' ? this.valueMax : this.valueMax.getTime();
        const min = typeof (this.min) === 'number' ? this.min : this.min.getTime();
        const max = typeof (this.max) === 'number' ? this.max : this.max.getTime();
        return 100 * (1 - (vMax / (max - min)));
    }
    render() {
        return html `
            <div class="bg">
                <div class="inactiveRange">
                </div>
            </div>
            <div class="flex">
                <div class="knob" @mousedown=${this.mouseDownOnKnob} id="leftKnob" style="margin-left:${this.resolveValueMin()}%">
                    <div class="inner">
                    </div>
                </div>
                <div class="activeRange"></div>
                <div class="knob" id="rightKnob" style="margin-right:${this.resolveValueMax()}%">
                    <div class="inner">
                    </div>
                </div>
            </div>
        `;
    }
    connectedCallback() {
        super.connectedCallback();
        window.addEventListener("mousemove", this.mouseMoveOnKnob.bind(this));
        window.addEventListener("mouseup", this.mouseUpOnKnob.bind(this));
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        window.removeEventListener("mousemove", this.mouseMoveOnKnob.bind(this));
        window.removeEventListener("mouseup", this.mouseUpOnKnob.bind(this));
    }
    mouseUpOnKnob(_ev) {
        this.knobClicked = 0;
    }
    mouseDownOnKnob(ev) {
        let tmp = ev.path[0];
        while (!tmp.classList.contains("knob") && tmp.parentElement)
            tmp = tmp.parentElement;
        if (tmp.id === 'leftKnob') {
            this.knobClicked = 1;
            this.clickedCoords = { x: ev.clientX, y: ev.clientY, currentValue: this.valueMin };
        }
        else if (tmp.id === 'rightKnob') {
            this.knobClicked = 2;
            this.clickedCoords = { x: ev.clientX, y: ev.clientY, currentValue: this.valueMax };
        }
        console.log(ev);
    }
    mouseMoveOnKnob(ev) {
        if (this.knobClicked == 1) {
            const valueMax = typeof (this.valueMax) === 'number' ? this.valueMax : this.valueMax.getTime();
            //let valueMin = this.clickedCoords.currentValue;
            const min = typeof (this.min) === 'number' ? this.min : this.min.getTime();
            const max = typeof (this.max) === 'number' ? this.max : this.max.getTime();
            const pixelsPerStep = this.offsetWidth / (max - min) / this.step;
            //console.log("Pixels per step : " + pixelsPerStep);
            const val = (ev.clientX - this.clickedCoords.x) / pixelsPerStep - this.clickedCoords.currentValue;
            this.valueMin = Math.min(Math.max(min, val), valueMax);
        }
    }
};
RangeSlider.styles = css `
        :host {
            display: block;
        }

        .flex {
            display: flex;
        }

        .knob {
            width: 32px;
            height: 32px;
            display: flex;
        }

        .knob .inner {
            border: 1px solid black;
            background: black;
            border-radius: 50%;
            margin: auto;
            width: 10px;
            height: 10px;
            transform: scale(1);
            transition: 0.1s;
        }

        .knob .inner:hover {
            transform: scale(1.3);
            transition: 0.1s;
            cursor: pointer;
        }

        .activeRange {
            flex:1;
            align-self: center;
            height: 2px;
            background: blue;
            margin-left: -10px;
            margin-right: -10px;
        }

        .bg {
            position:relative;
            left:0px;
            right: 0px;
            width:100%;
            height: 100%;
            top:0px;
            bottom: 0px;
            display: flex;
        }

        .bg .inactiveRange {
            height: 2px;
            background: lightgray;
            align-self: center;
        }
    `;
__decorate([
    property({ type: Object, reflect: true })
], RangeSlider.prototype, "min", void 0);
__decorate([
    property({ type: Object, reflect: true })
], RangeSlider.prototype, "max", void 0);
__decorate([
    property({ type: Number, reflect: true })
], RangeSlider.prototype, "step", void 0);
__decorate([
    property({ type: Object, attribute: "value-min", reflect: true })
], RangeSlider.prototype, "valueMin", void 0);
__decorate([
    property({ type: Object, attribute: "value-max", reflect: true })
], RangeSlider.prototype, "valueMax", void 0);
RangeSlider = __decorate([
    customElement('range-slider')
], RangeSlider);
export { RangeSlider };
//# sourceMappingURL=range-slider.js.map