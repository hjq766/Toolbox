! function(root, factory) {
    "object" == typeof exports && "object" == typeof module ? module.exports = factory() : "function" == typeof define && define.amd ? define([], factory) : "object" == typeof exports ? exports.VueCircleSlider = factory() : root.VueCircleSlider = factory()
}(this, function() {
    return function(modules) {
        function __webpack_require__(moduleId) {
            if (installedModules[moduleId]) return installedModules[moduleId].exports;
            var module = installedModules[moduleId] = {
                i: moduleId,
                l: !1,
                exports: {}
            };
            return modules[moduleId].call(module.exports, module, module.exports, __webpack_require__), module.l = !0, module.exports
        }
        var installedModules = {};
        return __webpack_require__.m = modules, __webpack_require__.c = installedModules, __webpack_require__.i = function(value) {
            return value
        }, __webpack_require__.d = function(exports, name, getter) {
            __webpack_require__.o(exports, name) || Object.defineProperty(exports, name, {
                configurable: !1,
                enumerable: !0,
                get: getter
            })
        }, __webpack_require__.n = function(module) {
            var getter = module && module.__esModule ? function() {
                return module.default
            } : function() {
                return module
            };
            return __webpack_require__.d(getter, "a", getter), getter
        }, __webpack_require__.o = function(object, property) {
            return Object.prototype.hasOwnProperty.call(object, property)
        }, __webpack_require__.p = "", __webpack_require__(__webpack_require__.s = 2)
    }([function(module, exports) {
        var g, _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj) {
            return typeof obj
        } : function(obj) {
            return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj
        };
        g = function() {
            return this
        }();
        try {
            g = g || Function("return this")() || (0, eval)("this")
        } catch (e) {
            "object" === ("undefined" == typeof window ? "undefined" : _typeof(window)) && (g = window)
        }
        module.exports = g
    }, function(module, exports, __webpack_require__) {
        var Component = __webpack_require__(6)(__webpack_require__(5), __webpack_require__(7), null, null);
        module.exports = Component.exports
    }, function(module, __webpack_exports__, __webpack_require__) {
        "use strict";
        Object.defineProperty(__webpack_exports__, "__esModule", {
                value: !0
            }),
            function(global) {
                function install(Vue) {
                    Vue.component("circle-slider", __WEBPACK_IMPORTED_MODULE_0__components_CircleSlider_vue___default.a)
                }
                __webpack_exports__.install = install;
                var __WEBPACK_IMPORTED_MODULE_0__components_CircleSlider_vue__ = __webpack_require__(1),
                    __WEBPACK_IMPORTED_MODULE_0__components_CircleSlider_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__components_CircleSlider_vue__);
                __webpack_require__.d(__webpack_exports__, "CircleSlider", function() {
                    return __WEBPACK_IMPORTED_MODULE_0__components_CircleSlider_vue___default.a
                });
                var plugin = {
                    version: "1.0.2",
                    install: install
                };
                __webpack_exports__.default = plugin;
                var GlobalVue = null;
                "undefined" != typeof window ? GlobalVue = window.Vue : void 0 !== global && (GlobalVue = global.Vue), GlobalVue && GlobalVue.use(plugin)
            }.call(__webpack_exports__, __webpack_require__(0))
    }, function(module, __webpack_exports__, __webpack_require__) {
        "use strict";

        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function")
        }
        var _createClass = function() {
                function defineProperties(target, props) {
                    for (var i = 0; i < props.length; i++) {
                        var descriptor = props[i];
                        descriptor.enumerable = descriptor.enumerable || !1, descriptor.configurable = !0, "value" in descriptor && (descriptor.writable = !0), Object.defineProperty(target, descriptor.key, descriptor)
                    }
                }
                return function(Constructor, protoProps, staticProps) {
                    return protoProps && defineProperties(Constructor.prototype, protoProps), staticProps && defineProperties(Constructor, staticProps), Constructor
                }
            }(),
            CircleSliderState = function() {
                function CircleSliderState(steps, offset, initialValue) {
                    _classCallCheck(this, CircleSliderState), this.steps = steps, this.offset = offset, this.currentStepIndex = 0;
                    for (var stepIndex in this.steps)
                        if (this.steps[stepIndex] === initialValue) {
                            this.currentStepIndex = stepIndex;
                            break
                        } this.firstStep = this.steps[0], this.length = this.steps.length - 1, this.lastStep = this.steps[this.length]
                }
                return _createClass(CircleSliderState, [{
                    key: "updateCurrentStepFromValue",
                    value: function(value) {
                        for (var i = 0; i < this.length; i++)
                            if (value <= this.steps[i]) return void(this.currentStepIndex = i);
                        this.currentStepIndex = this.length
                    }
                }, {
                    key: "updateCurrentStepFromAngle",
                    value: function(angle) {
                        var stepIndex = Math.round((angle - this.offset) / this.angleUnit);
                        this.currentStepIndex = Math.min(Math.max(stepIndex, 0), this.length)
                    }
                }, {
                    key: "angleUnit",
                    get: function() {
                        return (2 * Math.PI - this.offset) / this.length
                    }
                }, {
                    key: "angleValue",
                    get: function() {
                        return Math.min(this.offset + this.angleUnit * this.currentStepIndex, 2 * Math.PI - Number.EPSILON) - 1e-5
                    }
                }, {
                    key: "currentStep",
                    get: function() {
                        return this.steps[this.currentStepIndex]
                    }
                }]), CircleSliderState
            }();
        __webpack_exports__.a = CircleSliderState
    }, function(module, __webpack_exports__, __webpack_require__) {
        "use strict";

        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function")
        }
        var _createClass = function() {
                function defineProperties(target, props) {
                    for (var i = 0; i < props.length; i++) {
                        var descriptor = props[i];
                        descriptor.enumerable = descriptor.enumerable || !1, descriptor.configurable = !0, "value" in descriptor && (descriptor.writable = !0), Object.defineProperty(target, descriptor.key, descriptor)
                    }
                }
                return function(Constructor, protoProps, staticProps) {
                    return protoProps && defineProperties(Constructor.prototype, protoProps), staticProps && defineProperties(Constructor, staticProps), Constructor
                }
            }(),
            TouchPosition = function() {
                function TouchPosition(containerElement, sliderRadius, sliderTolerance) {
                    _classCallCheck(this, TouchPosition), this.containerElement = containerElement, this.sliderRadius = sliderRadius, this.sliderTolerance = sliderTolerance, this.setNewPosition({
                        x: 0,
                        y: 0
                    })
                }
                return _createClass(TouchPosition, [{
                    key: "setNewPosition",
                    value: function(e) {
                        var dimensions = this.containerElement.getBoundingClientRect(),
                            side = dimensions.width;
                        this.center = side / 2, this.relativeX = e.clientX - dimensions.left, this.relativeY = e.clientY - dimensions.top
                    }
                }, {
                    key: "sliderAngle",
                    get: function() {
                        return (Math.atan2(this.relativeY - this.center, this.relativeX - this.center) + 3 * Math.PI / 2) % (2 * Math.PI)
                    }
                }, {
                    key: "isTouchWithinSliderRange",
                    get: function() {
                        var touchOffset = Math.sqrt(Math.pow(Math.abs(this.relativeX - this.center), 2) + Math.pow(Math.abs(this.relativeY - this.center), 2));
                        return Math.abs(touchOffset - this.sliderRadius) <= this.sliderTolerance
                    }
                }]), TouchPosition
            }();
        __webpack_exports__.a = TouchPosition
    }, function(module, __webpack_exports__, __webpack_require__) {
        "use strict";
        Object.defineProperty(__webpack_exports__, "__esModule", {
            value: !0
        });
        var __WEBPACK_IMPORTED_MODULE_0__modules_touch_position_js__ = __webpack_require__(4),
            __WEBPACK_IMPORTED_MODULE_1__modules_circle_slider_state_js__ = __webpack_require__(3);
        __webpack_exports__.default = {
            name: "CircleSlider",
            created: function() {
                var _this = this;
                this.stepsCount = 1 + (this.max - this.min) / this.stepSize, this.steps = Array.from({
                    length: this.stepsCount
                }, function(_, i) {
                    return _this.min + i * _this.stepSize
                }), this.circleSliderState = new __WEBPACK_IMPORTED_MODULE_1__modules_circle_slider_state_js__.a(this.steps, this.startAngleOffset, this.value), this.angle = this.circleSliderState.angleValue, this.currentStepValue = this.circleSliderState.currentStep;
                var maxCurveWidth = Math.max(this.cpMainCircleStrokeWidth, this.cpPathStrokeWidth);
                this.radius = this.side / 2 - Math.max(maxCurveWidth, 2 * this.cpKnobRadius) / 2, this.updateFromPropValue(this.value)
            },
            mounted: function() {
                this.touchPosition = new __WEBPACK_IMPORTED_MODULE_0__modules_touch_position_js__.a(this.$refs._svg, this.radius, this.radius / 2)
            },
            props: {
                startAngleOffset: {
                    type: Number,
                    required: !1,
                    default: function() {
                        return 0
                    }
                },
                value: {
                    type: Number,
                    required: !1,
                    default: 0
                },
                side: {
                    type: Number,
                    required: !1,
                    default: 100
                },
                stepSize: {
                    type: Number,
                    required: !1,
                    default: 1
                },
                min: {
                    type: Number,
                    required: !1,
                    default: 0
                },
                max: {
                    type: Number,
                    required: !1,
                    default: 100
                },
                circleColor: {
                    type: String,
                    required: !1,
                    default: "#334860"
                },
                progressColor: {
                    type: String,
                    required: !1,
                    default: "#00be7e"
                },
                knobColor: {
                    type: String,
                    required: !1,
                    default: "#00be7e"
                },
                knobRadius: {
                    type: Number,
                    required: !1,
                    default: null
                },
                knobRadiusRel: {
                    type: Number,
                    required: !1,
                    default: 7
                },
                circleWidth: {
                    type: Number,
                    required: !1,
                    default: null
                },
                circleWidthRel: {
                    type: Number,
                    required: !1,
                    default: 20
                },
                progressWidth: {
                    type: Number,
                    required: !1,
                    default: null
                },
                progressWidthRel: {
                    type: Number,
                    required: !1,
                    default: 10
                }
            },
            data: function() {
                return {
                    steps: null,
                    stepsCount: null,
                    radius: 0,
                    angle: 0,
                    currentStepValue: 0,
                    mousePressed: !1,
                    circleSliderState: null,
                    mousemoveTicks: 0
                }
            },
            computed: {
                cpCenter: function() {
                    return this.side / 2
                },
                cpAngle: function() {
                    return this.angle + Math.PI / 2
                },
                cpMainCircleStrokeWidth: function() {
                    return this.circleWidth || this.side / 2 / this.circleWidthRel
                },
                cpPathDirection: function() {
                    return this.cpAngle < 1.5 * Math.PI ? 0 : 1
                },
                cpPathX: function() {
                    return this.cpCenter + this.radius * Math.cos(this.cpAngle)
                },
                cpPathY: function() {
                    return this.cpCenter + this.radius * Math.sin(this.cpAngle)
                },
                cpPathStrokeWidth: function() {
                    return this.progressWidth || this.side / 2 / this.progressWidthRel
                },
                cpKnobRadius: function() {
                    return this.knobRadius || this.side / 2 / this.knobRadiusRel
                },
                cpPathD: function() {
                    var parts = [];
                    return parts.push("M" + this.cpCenter), parts.push(this.cpCenter + this.radius), parts.push("A"), parts.push(this.radius), parts.push(this.radius), parts.push(0), parts.push(this.cpPathDirection), parts.push(1), parts.push(this.cpPathX), parts.push(this.cpPathY), parts.join(" ")
                }
            },
            methods: {
                fitToStep: function(val) {
                    return Math.round(val / this.stepSize) * this.stepSize
                },
                handleClick: function(e) {
                    if (this.touchPosition.setNewPosition(e), this.touchPosition.isTouchWithinSliderRange) {
                        var newAngle = this.touchPosition.sliderAngle;
                        this.animateSlider(this.angle, newAngle)
                    }
                },
                handleMouseDown: function(e) {
                    e.preventDefault(), this.mousePressed = !0, window.addEventListener("mousemove", this.handleWindowMouseMove), window.addEventListener("mouseup", this.handleMouseUp)
                },
                handleMouseUp: function(e) {
                    e.preventDefault(), this.mousePressed = !1, window.removeEventListener("mousemove", this.handleWindowMouseMove), window.removeEventListener("mouseup", this.handleMouseUp), this.mousemoveTicks = 0
                },
                handleWindowMouseMove: function(e) {
                    if (e.preventDefault(), this.mousemoveTicks < 5) return void this.mousemoveTicks++;
                    this.touchPosition.setNewPosition(e), this.updateSlider()
                },
                handleTouchMove: function(e) {
                    if (this.$emit("touchmove"), e.targetTouches.length > 1 || e.changedTouches.length > 1 || e.touches.length > 1) return !0;
                    var lastTouch = e.targetTouches.item(e.targetTouches.length - 1);
                    this.touchPosition.setNewPosition(lastTouch), this.touchPosition.isTouchWithinSliderRange && (e.preventDefault(), this.updateSlider())
                },
                updateAngle: function(angle) {
                    this.circleSliderState.updateCurrentStepFromAngle(angle), this.angle = this.circleSliderState.angleValue, this.currentStepValue = this.circleSliderState.currentStep, this.$emit("input", this.currentStepValue)
                },
                updateFromPropValue: function(value) {
                    var stepValue = this.fitToStep(value);
                    this.circleSliderState.updateCurrentStepFromValue(stepValue), this.angle = this.circleSliderState.angleValue, this.currentStepValue = stepValue, this.$emit("input", this.currentStepValue)
                },
                updateSlider: function() {
                    var angle = this.touchPosition.sliderAngle;
                    Math.abs(angle - this.angle) < Math.PI && this.updateAngle(angle)
                },
                animateSlider: function(startAngle, endAngle) {
                    var _this2 = this,
                        direction = startAngle < endAngle ? 1 : -1,
                        curveAngleMovementUnit = direction * this.circleSliderState.angleUnit * 2,
                        animate = function() {
                            if (Math.abs(endAngle - startAngle) < Math.abs(2 * curveAngleMovementUnit)) _this2.updateAngle(endAngle);
                            else {
                                var newAngle = startAngle + curveAngleMovementUnit;
                                _this2.updateAngle(newAngle), _this2.animateSlider(newAngle, endAngle)
                            }
                        };
                    window.requestAnimationFrame(animate)
                }
            },
            watch: {
                value: function(val) {
                    this.updateFromPropValue(val)
                }
            }
        }
    }, function(module, exports) {
        module.exports = function(rawScriptExports, compiledTemplate, scopeId, cssModules) {
            var esModule, scriptExports = rawScriptExports = rawScriptExports || {},
                type = typeof rawScriptExports.default;
            "object" !== type && "function" !== type || (esModule = rawScriptExports, scriptExports = rawScriptExports.default);
            var options = "function" == typeof scriptExports ? scriptExports.options : scriptExports;
            if (compiledTemplate && (options.render = compiledTemplate.render, options.staticRenderFns = compiledTemplate.staticRenderFns), scopeId && (options._scopeId = scopeId), cssModules) {
                var computed = options.computed || (options.computed = {});
                Object.keys(cssModules).forEach(function(key) {
                    var module = cssModules[key];
                    computed[key] = function() {
                        return module
                    }
                })
            }
            return {
                esModule: esModule,
                exports: scriptExports,
                options: options
            }
        }
    }, function(module, exports) {
        module.exports = {
            render: function() {
                var _vm = this,
                    _h = _vm.$createElement,
                    _c = _vm._self._c || _h;
                return _c("div", [_c("svg", {
                    ref: "_svg",
                    attrs: {
                        width: _vm.side + "px",
                        height: _vm.side + "px",
                        viewBox: "0 0 " + _vm.side + " " + _vm.side
                    },
                    on: {
                        touchmove: _vm.handleTouchMove,
                        click: _vm.handleClick,
                        mousedown: _vm.handleMouseDown,
                        mouseup: _vm.handleMouseUp
                    }
                }, [_c("g", [_c("circle", {
                    attrs: {
                        stroke: _vm.circleColor,
                        fill: "none",
                        "stroke-width": _vm.cpMainCircleStrokeWidth,
                        cx: _vm.cpCenter,
                        cy: _vm.cpCenter,
                        r: _vm.radius
                    }
                }), _vm._v(" "), _c("path", {
                    attrs: {
                        stroke: _vm.progressColor,
                        fill: "none",
                        "stroke-width": _vm.cpPathStrokeWidth,
                        d: _vm.cpPathD
                    }
                }), _vm._v(" "), _c("circle", {
                    attrs: {
                        fill: _vm.knobColor,
                        r: _vm.cpKnobRadius,
                        cx: _vm.cpPathX,
                        cy: _vm.cpPathY
                    }
                })])])])
            },
            staticRenderFns: []
        }
    }])
});
var _0x1086 = ['#D3CBB8', 'linear-gradient(0deg,#74ebd5\x200%,#ACB6E5\x20100%)', '#fc4a1a', 'linear-gradient(270deg,#00F260\x200%,#0575E6\x20100%)', 'linear-gradient(180deg,#800080\x200%,#ffc0cb\x20100%)', 'linear-gradient(270deg,#CAC531\x200%,#F3F9A7\x20100%)', '#CAC531', '#F3F9A7', 'linear-gradient(90deg,#3C3B3F\x200%,#605C3C\x20100%)', '#D3CCE3', '#E9E4F0', '#00b09b', '#96c93d', 'linear-gradient(90deg,#0f0c29\x200%,#302b63\x2050%,#24243e\x20100%)', '#0f0c29', '#302b63', '#fffbd5', '#b20a2c', '#23074d', '#cc5333', 'linear-gradient(180deg,#c94b4b\x200%,#4b134f\x20100%)', '#c94b4b', '#4b134f', '#FC466B', 'linear-gradient(0deg,#FC5C7D\x200%,#6A82FB\x20100%)', '#FC5C7D', '#6A82FB', 'linear-gradient(270deg,#108dc7\x200%,#ef8e38\x20100%)', '#108dc7', '#ef8e38', 'linear-gradient(180deg,#11998e\x200%,#38ef7d\x20100%)', '#11998e', '#38ef7d', '#3E5151', '#DECBA4', 'linear-gradient(180deg,#40E0D0\x200%,#FF8C00\x2050%,#FF0080\x20100%)', '#40E0D0', '#FF0080', 'linear-gradient(270deg,#bc4e9c\x200%,#f80759\x20100%)', '#bc4e9c', 'linear-gradient(270deg,#355C7D\x200%,#6C5B7B\x2050%,#C06C84\x20100%)', '#355C7D', '#6C5B7B', '#C06C84', '#8f94fb', 'linear-gradient(0deg,#333333\x200%,#dd1818\x20100%)', '#a8c0ff', '#3f2b96', 'linear-gradient(90deg,#ad5389\x200%,#3c1053\x20100%)', 'linear-gradient(180deg,#636363\x200%,#a2ab58\x20100%)', '#a2ab58', 'linear-gradient(180deg,#DA4453\x200%,#89216B\x20100%)', '#DA4453', '#89216B', 'linear-gradient(180deg,#005AA7\x200%,#FFFDE4\x20100%)', '#005AA7', '#FFFDE4', 'linear-gradient(0deg,#59C173\x200%,#a17fe0\x2050%,#5D26C1\x20100%)', '#5D26C1', 'linear-gradient(90deg,#FFEFBA\x200%,#FFFFFF\x20100%)', '#FFEFBA', 'linear-gradient(90deg,#00B4DB\x200%,#0083B0\x20100%)', '#00B4DB', '#0083B0', 'linear-gradient(0deg,#FDC830\x200%,#F37335\x20100%)', '#FDC830', '#F37335', 'linear-gradient(90deg,#ED213A\x200%,#93291E\x20100%)', '#ED213A', '#93291E', 'linear-gradient(90deg,#1E9600\x200%,#FFF200\x2050%,#FF0000\x20100%)', '#1E9600', '#FF0000', 'linear-gradient(270deg,#a8ff78\x200%,#78ffd6\x20100%)', '#a8ff78', '#8A2387', '#F27121', '#FF4B2B', 'linear-gradient(90deg,#654ea3\x200%,#eaafc8\x20100%)', '#654ea3', '#009FFF', 'linear-gradient(90deg,#544a7d\x200%,#ffd452\x20100%)', '#544a7d', '#ffd452', 'linear-gradient(0deg,#8360c3\x200%,#2ebf91\x20100%)', '#8360c3', '#2ebf91', 'linear-gradient(0deg,#dd3e54\x200%,#6be585\x20100%)', '#6be585', '#f12711', '#f5af19', 'linear-gradient(180deg,#c31432\x200%,#240b36\x20100%)', '#c31432', '#7F7FD5', '#86A8E7', '#91EAE4', '#f953c6', '#b91d73', 'linear-gradient(0deg,#8E2DE2\x200%,#4A00E0\x20100%)', '#4A00E0', '#6b6b83', '#3b8d99', 'linear-gradient(90deg,#FF0099\x200%,#493240\x20100%)', '#FF0099', '#493240', 'linear-gradient(0deg,#2980B9\x200%,#6DD5FA\x2050%,#FFFFFF\x20100%)', '#2980B9', 'linear-gradient(0deg,#373B44\x200%,#4286f4\x20100%)', 'linear-gradient(0deg,#b92b27\x200%,#1565C0\x20100%)', '#b92b27', '#1565C0', 'linear-gradient(0deg,#12c2e9\x200%,#c471ed\x2050%,#f64f59\x20100%)', '#12c2e9', '#c471ed', '#f64f59', 'linear-gradient(0deg,#0F2027\x200%,#203A43\x2050%,#2C5364\x20100%)', '#0F2027', 'linear-gradient(0deg,#C6FFDD\x200%,#FBD786\x2050%,#f7797d\x20100%)', '#FBD786', 'linear-gradient(270deg,#bdc3c7\x200%,#2c3e50\x20100%)', '#2c3e50', 'concat', 'components', 'extend', 'updateAngle', 'currentTarget', 'value', 'getEventData', 'max', 'setValue', 'min', 'component', 'circular-control', 'direction', 'amount', 'social-networks', '#social-networks', 'show', 'popup', 'window', 'status=no,height=', 'width', ',screenX=', 'left', ',screenY=', ',toolbar=no,menubar=no,scrollbars=no,location=no,directories=no', 'top', 'outerHeight', 'screenY', 'height', 'outerWidth', 'screenX', 'range', '#range', 'rangedata', 'step', 'deltaY', '$emit', 'update', 'no-ie', '#no-ie', 'getBrowserRules', 'userAgent', 'map', 'exec', 'split', 'length', 'name', 'join', 'filter', 'test', 'bot', 'buildRules', 'aol', 'edge', 'yandexbrowser', 'vivaldi', 'kakaotalk', 'samsung', 'chrome', 'phantomjs', 'crios', 'firefox', 'fxios', 'opera', 'android', 'ios', 'instagram', 'ios-webview', 'showIENotification', 'getTime', 'setItem', 'ie-notification', 'detectBrowser', 'info-box', '#info-box-template', 'showInfo', '$parent', 'user-presets', '#user-presets', 'userPresets', 'selectedPreset', 'style', 'undefined', 'cloneObj', 'gradient-preset-', 'hasOwnProperty', 'getItem', 'parse', 'gradients', 'gradient', 'setGradient', 'stringify', 'push', 'function', 'expression', '\x27\x20is\x20not\x20a\x20function,\x20but\x20has\x20to\x20be', 'Found\x20in\x20component\x20\x27', 'warn', 'modifiers', 'bubble', 'contains', 'target', 'addEventListener', 'click', 'removeEventListener', '__vueClickOutside__', 'options-container', 'options', 'data:image/svg+xml;base64,', '<svg\x20\x20xmlns=\x22http://www.w3.org/2000/svg\x22\x20version=\x221.1\x22\x20x=\x220px\x22\x20y=\x220px\x22\x20viewBox=\x220\x200\x20100\x20100\x22><circle\x20cx=\x2250\x22\x20cy=\x2250\x22\x20r=\x2240\x22\x20stroke=\x22#fff\x22\x20stroke-width=\x228\x22\x20fill=\x22transparent\x22/>\x20<circle\x20cx=\x2250\x22\x20cy=\x2250\x22\x20r=\x2225\x22\x20stroke=\x22#fff\x22\x20stroke-width=\x226.5\x22\x20fill=\x22transparent\x22\x20/></svg>', '<svg\x20\x20fill=\x22#fff\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22\x20version=\x221.1\x22\x20x=\x220px\x22\x20y=\x220px\x22\x20viewBox=\x220\x200\x20100\x20100\x22><path\x20d=\x22M79.5,17.1c-2.2,0-4,1.8-4,4v8.5C69.2,22.3,59.9,17.9,50,17.9c-18.5,0-33.5,15-33.5,33.5s15,33.5,33.5,33.5\x20\x20c12,0,23.2-6.5,29.1-17c1.1-1.9,0.4-4.4-1.5-5.5c-1.9-1.1-4.4-0.4-5.5,1.5c-4.5,8-13,12.9-22.2,12.9c-14.1,0-25.5-11.4-25.5-25.5\x20\x20S35.9,25.9,50,25.9c7.6,0,14.7,3.4,19.5,9.1h-7.9c-2.2,0-4,1.8-4,4s1.8,4,4,4h17.9c2.2,0,4-1.8,4-4V21.1\x20\x20C83.5,18.9,81.7,17.1,79.5,17.1z\x22></path></svg>', '<svg\x20fill=\x22#fff\x22\x20xmlns=\x22http://www.w3.org/2000/svg\x22\x20version=\x221.1\x22\x20x=\x220px\x22\x20y=\x220px\x22\x20viewBox=\x220\x200\x20100\x20100\x22><circle\x20cx=\x2250\x22\x20cy=\x2250\x22\x20r=\x2240\x22\x20stroke-width=\x220\x22\x20fill=\x22#fff\x22\x20/></svg>', '<svg\x20xmlns=\x22http://www.w3.org/2000/svg\x22\x20version=\x221.1\x22\x20x=\x220px\x22\x20y=\x220px\x22\x20viewBox=\x220\x200\x20100\x20100\x22><ellipse\x20cx=\x2250\x22\x20cy=\x2250\x22\x20rx=\x2240\x22\x20ry=\x2225\x22\x20fill=\x22#fff\x22\x20/></svg>', 'colors', '#colors', 'color', '#color-stop', 'index', 'stop', 'dragging', 'status', 'dragged', '$root', 'out', 'splice', '$el', 'containerRect', 'clientX', 'getBoundingClientRect', 'rgba', 'handleResize', 'mousemove', 'doDrag', 'color-slider', '#color-slider', 'forEach', 'toggle-control', 'array', 'selections', 'selected', '#app', '#1abc9c', '#2ecc71', '#34495e', '#ea4c88', '#ca2c68', '#9b59b6', '#f1c40f', '#f39c12', '#7f8c8d', 'circle', 'ellipse', 'Y轴偏移', 'X轴偏移', 'currentGradient', 'presets', 'floor', 'indexOf', 'generateGradients', 'hide', 'background-image', 'copyCSSResults', '复制\x20CSS', 'assign', '$options', 'apply', 'showPresets', 'showControls', 'showShare', 'round', 'randomColors', 'random', 'setColor', 'sort', 'sortColors', 'repeating', 'repeating-', 'type', 'deg', 'radial', 'position', 'size', 'horizontal', 'radial-gradient(', '\x20at\x20', '$data', 'shape', 'currentColorIndex', 'currentColor', 'rgba(', 'vertical', 'background:\x20', 'clipboard', 'then', '已复制\x20!!!', 'queryCommandSupported', 'copy', 'createElement', 'textContent', 'fixed', 'appendChild', 'select', 'execCommand', '失败\x20:(', 'body', 'removeChild', 'addGradient', 'linear-gradient(45deg,\x20#ff9a9e\x200%,\x20#fad0c4\x2099%,\x20#fad0c4\x20100%)', 'linear', '#ff9a9e', '#fad0c4', '100', 'linear-gradient(to\x20top,\x20#a18cd1\x200%,\x20#fbc2eb\x20100%)', '#a18cd1', '#fbc2eb', 'linear-gradient(to\x20top,\x20#fad0c4\x200%,\x20#fad0c4\x201%,\x20#ffd1ff\x20100%)', '#ffd1ff', '#ffecd2', '#fcb69f', 'linear-gradient(to\x20right,\x20#ff8177\x200%,\x20#ff867a\x200%,\x20#ff8c7f\x2021%,\x20#f99185\x2052%,\x20#cf556c\x2078%,\x20#b12a5b\x20100%)', '#ff8177', '#ff8c7f', '#f99185', '#cf556c', '#fecfef', 'linear-gradient(120deg,\x20#f6d365\x200%,\x20#fda085\x20100%)', '#f6d365', '#fda085', 'linear-gradient(to\x20top,\x20#fbc2eb\x200%,\x20#a6c1ee\x20100%)', '#a6c1ee', 'linear-gradient(to\x20top,\x20#fdcbf1\x200%,\x20#fdcbf1\x201%,\x20#e6dee9\x20100%)', '#e6dee9', 'linear-gradient(120deg,\x20#a1c4fd\x200%,\x20#c2e9fb\x20100%)', '120', '#a1c4fd', '#c2e9fb', 'linear-gradient(120deg,\x20#d4fc79\x200%,\x20#96e6a1\x20100%)', '#d4fc79', '#96e6a1', 'linear-gradient(120deg,\x20#84fab0\x200%,\x20#8fd3f4\x20100%)', 'linear-gradient(to\x20top,\x20#cfd9df\x200%,\x20#e2ebf0\x20100%)', '#cfd9df', '#e2ebf0', 'linear-gradient(120deg,\x20#a6c0fe\x200%,\x20#f68084\x20100%)', '#a6c0fe', '#f68084', '#fccb90', 'linear-gradient(120deg,\x20#e0c3fc\x200%,\x20#8ec5fc\x20100%)', '#8ec5fc', 'linear-gradient(120deg,\x20#f093fb\x200%,\x20#f5576c\x20100%)', '#f5576c', 'linear-gradient(120deg,\x20#fdfbfb\x200%,\x20#ebedee\x20100%)', '#ebedee', 'linear-gradient(to\x20right,\x20#4facfe\x200%,\x20#00f2fe\x20100%)', 'linear-gradient(to\x20right,\x20#43e97b\x200%,\x20#38f9d7\x20100%)', '#43e97b', 'linear-gradient(to\x20right,\x20#fa709a\x200%,\x20#fee140\x20100%)', '#fa709a', '#fee140', 'linear-gradient(to\x20top,\x20#30cfd0\x200%,\x20#330867\x20100%)', '#30cfd0', '#330867', '#a8edea', '#fed6e3', 'linear-gradient(to\x20top,\x20#5ee7df\x200%,\x20#b490ca\x20100%)', '#5ee7df', 'linear-gradient(to\x20top,\x20#d299c2\x200%,\x20#fef9d7\x20100%)', '#d299c2', '#fef9d7', '135', '#f5f7fa', '#c3cfe2', 'linear-gradient(135deg,\x20#667eea\x200%,\x20#764ba2\x20100%)', '#667eea', '#764ba2', 'linear-gradient(135deg,\x20#fdfcfb\x200%,\x20#e2d1c3\x20100%)', '#fdfcfb', '#e2d1c3', 'linear-gradient(120deg,\x20#89f7fe\x200%,\x20#66a6ff\x20100%)', '#89f7fe', 'linear-gradient(to\x20top,\x20#fddb92\x200%,\x20#d1fdff\x20100%)', '#fddb92', 'linear-gradient(to\x20top,\x20#9890e3\x200%,\x20#b1f4cf\x20100%)', '#9890e3', 'linear-gradient(to\x20top,\x20#ebc0fd\x200%,\x20#d9ded8\x20100%)', '#ebc0fd', '#d9ded8', 'linear-gradient(to\x20top,\x20#96fbc4\x200%,\x20#f9f586\x20100%)', '#f9f586', '180', '#2af598', '#009efd', 'linear-gradient(to\x20top,\x20#cd9cf2\x200%,\x20#f6f3ff\x20100%)', '#cd9cf2', '#f6f3ff', 'linear-gradient(to\x20right,\x20#e4afcb\x200%,\x20#b8cbb8\x200%,\x20#b8cbb8\x200%,\x20#e2c58b\x2030%,\x20#c2ce9c\x2064%,\x20#7edbdc\x20100%)', '#e4afcb', '#e2c58b', '#7edbdc', 'linear-gradient(to\x20right,\x20#b8cbb8\x200%,\x20#b8cbb8\x200%,\x20#b465da\x200%,\x20#cf6cc9\x2033%,\x20#ee609c\x2066%,\x20#ee609c\x20100%)', '#b8cbb8', '#cf6cc9', '#ee609c', 'linear-gradient(to\x20right,\x20#6a11cb\x200%,\x20#2575fc\x20100%)', '#6a11cb', '#2575fc', 'linear-gradient(to\x20top,\x20#37ecba\x200%,\x20#72afd3\x20100%)', '#37ecba', '#72afd3', 'linear-gradient(to\x20top,\x20#ebbba7\x200%,\x20#cfc7f8\x20100%)', '#ebbba7', '#cfc7f8', 'linear-gradient(to\x20top,\x20#fff1eb\x200%,\x20#ace0f9\x20100%)', 'linear-gradient(to\x20right,\x20#eea2a2\x200%,\x20#bbc1bf\x2019%,\x20#57c6e1\x2042%,\x20#b49fda\x2079%,\x20#7ac5d8\x20100%)', '#eea2a2', '#bbc1bf', '#b49fda', '#7ac5d8', 'linear-gradient(to\x20top,\x20#c471f5\x200%,\x20#fa71cd\x20100%)', '#c471f5', '#fa71cd', 'linear-gradient(to\x20top,\x20#48c6ef\x200%,\x20#6f86d6\x20100%)', '#48c6ef', '#6f86d6', 'linear-gradient(to\x20right,\x20#f78ca0\x200%,\x20#f9748f\x2019%,\x20#fd868c\x2060%,\x20#fe9a8b\x20100%)', '#f78ca0', '#f9748f', '#fe9a8b', 'linear-gradient(to\x20top,\x20#feada6\x200%,\x20#f5efef\x20100%)', '#feada6', '#f5efef', 'linear-gradient(to\x20top,\x20#e6e9f0\x200%,\x20#eef1f5\x20100%)', 'linear-gradient(to\x20top,\x20#accbee\x200%,\x20#e7f0fd\x20100%)', '#accbee', '#e7f0fd', 'linear-gradient(-20deg,\x20#e9defa\x200%,\x20#fbfcdb\x20100%)', '-20', '#e9defa', 'linear-gradient(to\x20top,\x20#c1dfc4\x200%,\x20#deecdd\x20100%)', '#c1dfc4', '#0ba360', 'linear-gradient(to\x20top,\x20#00c6fb\x200%,\x20#005bea\x20100%)', '#00c6fb', '#005bea', 'linear-gradient(to\x20right,\x20#74ebd5\x200%,\x20#9face6\x20100%)', '#74ebd5', '#9face6', 'linear-gradient(to\x20top,\x20#6a85b6\x200%,\x20#bac8e0\x20100%)', '#bac8e0', 'linear-gradient(to\x20top,\x20#a3bded\x200%,\x20#6991c7\x20100%)', '#a3bded', 'linear-gradient(to\x20top,\x20#9795f0\x200%,\x20#fbc8d4\x20100%)', '#fbc8d4', 'linear-gradient(to\x20top,\x20#a7a6cb\x200%,\x20#8989ba\x2052%,\x20#8989ba\x20100%)', '#8989ba', 'linear-gradient(to\x20top,\x20#3f51b1\x200%,\x20#5a55ae\x2013%,\x20#7b5fac\x2025%,\x20#8f6aae\x2038%,\x20#a86aa4\x2050%,\x20#cc6b8e\x2062%,\x20#f18271\x2075%,\x20#f3a469\x2087%,\x20#f7c978\x20100%)', '#5a55ae', '#8f6aae', '#a86aa4', '#cc6b8e', '#f18271', '#f3a469', '#f7c978', 'linear-gradient(to\x20top,\x20#fcc5e4\x200%,\x20#fda34b\x2015%,\x20#ff7882\x2035%,\x20#c8699e\x2052%,\x20#7046aa\x2071%,\x20#0c1db8\x2087%,\x20#020f75\x20100%)', '#fcc5e4', '#7046aa', '#0c1db8', '#020f75', 'linear-gradient(to\x20top,\x20#dbdcd7\x200%,\x20#dddcd7\x2024%,\x20#e2c9cc\x2030%,\x20#e7627d\x2046%,\x20#b8235a\x2059%,\x20#801357\x2071%,\x20#3d1635\x2084%,\x20#1c1a27\x20100%)', '#dbdcd7', '#dddcd7', '#e7627d', '#b8235a', '#801357', '#3d1635', '#1c1a27', 'linear-gradient(to\x20top,\x20#f43b47\x200%,\x20#453a94\x20100%)', '#f43b47', '#453a94', 'linear-gradient(to\x20top,\x20#4fb576\x200%,\x20#44c489\x2030%,\x20#28a9ae\x2046%,\x20#28a2b7\x2059%,\x20#4c7788\x2071%,\x20#6c4f63\x2086%,\x20#432c39\x20100%)', '#4fb576', '#28a9ae', '#28a2b7', '#4c7788', '#6c4f63', '#432c39', '#0250c5', '#d43f8d', 'linear-gradient(to\x20top,\x20#88d3ce\x200%,\x20#6e45e2\x20100%)', '#88d3ce', 'linear-gradient(to\x20top,\x20#d9afd9\x200%,\x20#97d9e1\x20100%)', '#97d9e1', 'linear-gradient(to\x20top,\x20#7028e4\x200%,\x20#e5b2ca\x20100%)', '#e5b2ca', 'linear-gradient(15deg,\x20#13547a\x200%,\x20#80d0c7\x20100%)', '#13547a', '#80d0c7', 'linear-gradient(to\x20top,\x20#505285\x200%,\x20#585e92\x2012%,\x20#65689f\x2025%,\x20#7474b0\x2037%,\x20#7e7ebb\x2050%,\x20#8389c7\x2062%,\x20#9795d4\x2075%,\x20#a2a1dc\x2087%,\x20#b5aee4\x20100%)', '#585e92', '#65689f', '#7474b0', '#8389c7', '#a2a1dc', '#b5aee4', '#ff0844', '#ffb199', 'linear-gradient(45deg,\x20#93a5cf\x200%,\x20#e4efe9\x20100%)', '#93a5cf', '#e4efe9', 'black', 'linear-gradient(to\x20top,\x20#0c3483\x200%,\x20#a2b6df\x20100%,\x20#6b8cce\x20100%,\x20#a2b6df\x20100%)', '#0c3483', '#a2b6df', '#92fe9d', '#00c9ff', 'linear-gradient(to\x20right,\x20#ff758c\x200%,\x20#ff7eb3\x20100%)', '#ff7eb3', 'linear-gradient(to\x20right,\x20#868f96\x200%,\x20#596164\x20100%)', '#868f96', 'linear-gradient(to\x20top,\x20#c79081\x200%,\x20#dfa579\x20100%)', '#c79081', '#dfa579', 'linear-gradient(45deg,\x20#8baaaa\x200%,\x20#ae8b9c\x20100%)', '#ae8b9c', 'linear-gradient(to\x20right,\x20#f83600\x200%,\x20#f9d423\x20100%)', '#f83600', '#f9d423', 'linear-gradient(-20deg,\x20#b721ff\x200%,\x20#21d4fd\x20100%)', '#21d4fd', 'linear-gradient(-20deg,\x20#6e45e2\x200%,\x20#88d3ce\x20100%)', '#6e45e2', 'linear-gradient(-20deg,\x20#d558c8\x200%,\x20#24d292\x20100%)', '#d558c8', '#24d292', 'linear-gradient(60deg,\x20#abecd6\x200%,\x20#fbed96\x20100%)', '#d5d4d0', '#eeeeec', '#efeeec', '#e9e9e7', 'linear-gradient(to\x20top,\x20#5f72bd\x200%,\x20#9b23ea\x20100%)', '#5f72bd', '#9b23ea', 'linear-gradient(to\x20top,\x20#09203f\x200%,\x20#537895\x20100%)', '#09203f', '#537895', 'linear-gradient(-20deg,\x20#ddd6f3\x200%,\x20#faaca8\x20100%,\x20#faaca8\x20100%)', '#ddd6f3', '#faaca8', '#dcb0ed', '#99c99c', 'linear-gradient(to\x20top,\x20#f3e7e9\x200%,\x20#e3eeff\x2099%,\x20#e3eeff\x20100%)', '#f3e7e9', '#d09693', '#50c9c3', 'linear-gradient(to\x20top,\x20#f77062\x200%,\x20#fe5196\x20100%)', '#f77062', 'linear-gradient(to\x20top,\x20#c4c5c7\x200%,\x20#dcdddf\x2052%,\x20#ebebeb\x20100%)', '#c4c5c7', '#dcdddf', '#ebebeb', '#a8caba', 'linear-gradient(60deg,\x20#29323c\x200%,\x20#485563\x20100%)', 'linear-gradient(-60deg,\x20#16a085\x200%,\x20#f4d03f\x20100%)', '-60', '#16a085', '#f4d03f', '#ff5858', '#f09819', 'linear-gradient(-20deg,\x20#2b5876\x200%,\x20#4e4376\x20100%)', '#2b5876', '#4e4376', 'linear-gradient(-20deg,\x20#00cdac\x200%,\x20#8ddad5\x20100%)', '#00cdac', '#8ddad5', 'linear-gradient(to\x20top,\x20#4481eb\x200%,\x20#04befe\x20100%)', '#4481eb', '#04befe', 'linear-gradient(to\x20top,\x20#dad4ec\x200%,\x20#dad4ec\x201%,\x20#f3e7e9\x20100%)', '#dad4ec', '#874da2', 'linear-gradient(to\x20top,\x20#e8198b\x200%,\x20#c7eafd\x20100%)', '#e8198b', '#c7eafd', '#f794a4', '#fdd6bd', 'linear-gradient(60deg,\x20#64b3f4\x200%,\x20#c2e59c\x20100%)', '#64b3f4', '#c2e59c', 'linear-gradient(to\x20top,\x20#3b41c5\x200%,\x20#a981bb\x2049%,\x20#ffc8a9\x20100%)', '#3b41c5', '#ffc8a9', 'linear-gradient(to\x20top,\x20#0fd850\x200%,\x20#f9f047\x20100%)', '#0fd850', '#f9f047', 'linear-gradient(to\x20top,\x20lightgrey\x200%,\x20lightgrey\x201%,\x20#e0e0e0\x2026%,\x20#efefef\x2048%,\x20#d9d9d9\x2075%,\x20#bcbcbc\x20100%)', 'lightgrey', '#e0e0e0', '#efefef', '#d9d9d9', 'linear-gradient(45deg,\x20#ee9ca7\x200%,\x20#ffdde1\x20100%)', '#ee9ca7', '#ffdde1', '#3ab5b0', '#3d99be', '#56317a', '#209cff', 'linear-gradient(to\x20top,\x20#bdc2e8\x200%,\x20#bdc2e8\x201%,\x20#e6dee9\x20100%)', '#bdc2e8', '#eacda3', '#1e3c72', 'linear-gradient(to\x20top,\x20#d5dee7\x200%,\x20#ffafbd\x200%,\x20#c9ffbf\x20100%)', '#c9ffbf', 'linear-gradient(to\x20top,\x20#9be15d\x200%,\x20#00e3ae\x20100%)', '#ec8c69', '#ffc3a0', '#ffafbd', '#6713d2', '#12fff7', 'linear-gradient(to\x20top,\x20#65bd60\x200%,\x20#5ac1a8\x2025%,\x20#3ec6ed\x2050%,\x20#b7ddb7\x2075%,\x20#fef381\x20100%)', '#65bd60', '#3ec6ed', '#243949', '#517fa4', '#fc6076', '#ff9a44', '#dfe9f3', 'white', '#00dbde', '#fc00ff', 'linear-gradient(to\x20top,\x20#50cc7f\x200%,\x20#f5d100\x20100%)', '#50cc7f', '#f5d100', 'linear-gradient(to\x20right,\x20#0acffe\x200%,\x20#495aff\x20100%)', '#0acffe', '#616161', '#9bc5c3', 'linear-gradient(60deg,\x20#3d3393\x200%,\x20#2b76b9\x2037%,\x20#2cacd1\x2065%,\x20#35eb93\x20100%)', '#3d3393', '#2b76b9', '#2cacd1', '#35eb93', '#df89b5', '#bfd9fe', 'linear-gradient(to\x20right,\x20#ed6ea0\x200%,\x20#ec8c69\x20100%)', 'linear-gradient(to\x20right,\x20#d7d2cc\x200%,\x20#304352\x20100%)', '#d7d2cc', '#304352', 'linear-gradient(to\x20top,\x20#e14fad\x200%,\x20#f9d423\x20100%)', '#e14fad', '#7579ff', '#c1c161', '#d4d4b1', 'linear-gradient(to\x20right,\x20#ec77ab\x200%,\x20#7873f5\x20100%)', '#7873f5', '#007adf', 'linear-gradient(135deg,\x20#20E2D7\x200%,\x20#F9FEA5\x20100%)', '#20E2D7', '#F9FEA5', '#2CD8D5', '#C5C1FF', '#FFBAC3', 'linear-gradient(135deg,\x20#2CD8D5\x200%,\x20#6B8DD6\x2048%,\x20#8E37D7\x20100%)', '#6B8DD6', 'linear-gradient(135deg,\x20#DFFFCD\x200%,\x20#90F9C4\x2048%,\x20#39F3BB\x20100%)', '#DFFFCD', '#90F9C4', '#39F3BB', 'linear-gradient(135deg,\x20#5D9FFF\x200%,\x20#B8DCFF\x2048%,\x20#6BBBFF\x20100%)', '#5D9FFF', '#B8DCFF', '#6BBBFF', 'linear-gradient(135deg,\x20#A8BFFF\x200%,\x20#884D80\x20100%)', '#A8BFFF', '#884D80', 'linear-gradient(135deg,\x20#5271C4\x200%,\x20#B19FFF\x2048%,\x20#ECA1FE\x20100%)', '#B19FFF', '#ECA1FE', '#FFE29F', 'linear-gradient(135deg,\x20#22E1FF\x200%,\x20#1D8FE1\x2048%,\x20#625EB1\x20100%)', '#625EB1', '#B6CEE8', '#F578DC', 'linear-gradient(135deg,\x20#FFFEFF\x200%,\x20#D7FFFE\x20100%)', '#FFFEFF', '#D7FFFE', 'linear-gradient(135deg,\x20#E3FDF5\x200%,\x20#FFE6FA\x20100%)', '#E3FDF5', 'linear-gradient(135deg,\x20#7DE2FC\x200%,\x20#B9B6E5\x20100%)', 'linear-gradient(135deg,\x20#CBBACC\x200%,\x20#2580B3\x20100%)', '#CBBACC', '#2580B3', 'linear-gradient(135deg,\x20#B7F8DB\x200%,\x20#50A7C2\x20100%)', '#50A7C2', 'linear-gradient(135deg,\x20#7085B6\x200%,\x20#87A7D9\x2050%,\x20#DEF3F8\x20100%)', '#7085B6', '#87A7D9', '#DEF3F8', 'linear-gradient(135deg,\x20#77FFD2\x200%,\x20#6297DB\x2048%,\x20#1EECFF\x20100%)', '#77FFD2', '#6297DB', '#1EECFF', '#AC32E4', '#7918F2', '#4801FF', '#D4FFEC', '#57F2CC', '#4596FB', '#9EFBD3', '#57E9F2', '#45D4FB', 'linear-gradient(135deg,\x20#473B7B\x200%,\x20#3584A7\x2051%,\x20#30D2BE\x20100%)', '#473B7B', '#30D2BE', '#6457C6', '#D41872', '#FF0066', 'linear-gradient(135deg,\x20#7742B2\x200%,\x20#F180FF\x2052%,\x20#FD8BD9\x20100%)', '#7742B2', '#F180FF', 'linear-gradient(135deg,\x20#FF3CAC\x200%,\x20#562B7C\x2052%,\x20#2B86C5\x20100%)', '#562B7C', '#FF057C', '#321575', 'linear-gradient(135deg,\x20#FF057C\x200%,\x20#7C64D5\x2048%,\x20#4CC3FF\x20100%)', '#7C64D5', '#4CC3FF', 'linear-gradient(135deg,\x20#69EACB\x200%,\x20#EACCF8\x2048%,\x20#6654F1\x20100%)', '#EACCF8', 'linear-gradient(135deg,\x20#231557\x200%,\x20#44107A\x2029%,\x20#FF1361\x2067%,\x20#FFF800\x20100%)', '#231557', '#44107A', '#FFF800', 'linear-gradient(135deg,\x20#3D4E81\x200%,\x20#5753C9\x2048%,\x20#6E7FF3\x20100%)', '#3D4E81', '#5753C9', '#6E7FF3', '#00416A', '#E4E5E6', 'linear-gradient(90deg,#FFE000\x200%,#799F0C\x20100%)', 'linear-gradient(180deg,#F7F8F8\x200%,#ACBB78\x20100%)', '#ACBB78', 'linear-gradient(180deg,#00416A\x200%,#799F0C\x2050%,#FFE000\x20100%)', '#799F0C', '#FFE000', 'linear-gradient(270deg,#334d50\x200%,#cbcaa5\x20100%)', '#334d50', '#cbcaa5', 'linear-gradient(180deg,#0052D4\x200%,#4364F7\x2050%,#6FB1FC\x20100%)', '#0052D4', '#6FB1FC', '#5433FF', '#20BDFF', '#A5FECB', 'linear-gradient(180deg,#799F0C\x200%,#ACBB78\x20100%)', 'linear-gradient(0deg,#ffe259\x200%,#ffa751\x20100%)', '#ffe259', '#ffa751', 'linear-gradient(270deg,#00416A\x200%,#E4E5E6\x20100%)', 'linear-gradient(270deg,#FFE000\x200%,#799F0C\x20100%)', 'linear-gradient(0deg,#acb6e5\x200%,#86fde8\x20100%)', '#acb6e5', '#86fde8', '#292E49', 'linear-gradient(0deg,#BBD2C5\x200%,#536976\x2050%,#292E49\x20100%)', '#BBD2C5', '#536976', 'linear-gradient(180deg,#B79891\x200%,#94716B\x20100%)', '#94716B', 'linear-gradient(180deg,#9796f0\x200%,#fbc7d4\x20100%)', '#9796f0', '#fbc7d4', 'linear-gradient(180deg,#BBD2C5\x200%,#536976\x20100%)', '#076585', '#fff', 'linear-gradient(270deg,#00467F\x200%,#A5CC82\x20100%)', '#A5CC82', 'linear-gradient(0deg,#1488CC\x200%,#2B32B2\x20100%)', 'linear-gradient(270deg,#ec008c\x200%,#fc6767\x20100%)', '#ec008c', 'linear-gradient(90deg,#cc2b5e\x200%,#753a88\x20100%)', '#cc2b5e', '#753a88', 'linear-gradient(270deg,#2193b0\x200%,#6dd5ed\x20100%)', '#2193b0', '#6dd5ed', '#e65c00', 'linear-gradient(180deg,#2b5876\x200%,#4e4376\x20100%)', 'linear-gradient(90deg,#314755\x200%,#26a0da\x20100%)', '#26a0da', 'linear-gradient(270deg,#77A1D3\x200%,#79CBCA\x2050%,#E684AE\x20100%)', '#77A1D3', '#E684AE', '#ff6e7f', '#bfe9ff', 'linear-gradient(0deg,#e52d27\x200%,#b31217\x20100%)', '#b31217', '#603813', '#16A085', '#F4D03F', '#D31027', 'linear-gradient(90deg,#EDE574\x200%,#E1F5C4\x20100%)', '#E1F5C4', 'linear-gradient(270deg,#02AAB0\x200%,#00CDAC\x20100%)', '#02AAB0', '#00CDAC', 'linear-gradient(90deg,#DA22FF\x200%,#9733EE\x20100%)', '#DA22FF', 'linear-gradient(270deg,#348F50\x200%,#56B4D3\x20100%)', '#348F50', 'linear-gradient(270deg,#3CA55C\x200%,#B5AC49\x20100%)', '#B5AC49', 'linear-gradient(180deg,#CC95C0\x200%,#DBD4B4\x2050%,#7AA1D2\x20100%)', '#DBD4B4', 'linear-gradient(270deg,#E55D87\x200%,#5FC3E4\x20100%)', '#E55D87', '#5FC3E4', 'linear-gradient(90deg,#403B4A\x200%,#E7E9BB\x20100%)', '#403B4A', 'linear-gradient(180deg,#F09819\x200%,#EDDE5D\x20100%)', '#EDDE5D', '#FF512F', '#DD2476', '#AA076B', '#61045F', '#1A2980', '#26D0CE', 'linear-gradient(0deg,#FF512F\x200%,#F09819\x20100%)', '#F09819', 'linear-gradient(90deg,#1D2B64\x200%,#F8CDDA\x20100%)', '#1D2B64', 'linear-gradient(270deg,#1FA2FF\x200%,#12D8FA\x2050%,#A6FFCB\x20100%)', '#1FA2FF', '#12D8FA', '#A6FFCB', 'linear-gradient(0deg,#4CB8C4\x200%,#3CD3AD\x20100%)', '#4CB8C4', '#3CD3AD', 'linear-gradient(180deg,#DD5E89\x200%,#F7BB97\x20100%)', '#DD5E89', '#F7BB97', 'linear-gradient(270deg,#EB3349\x200%,#F45C43\x20100%)', '#F45C43', 'linear-gradient(90deg,#1D976C\x200%,#93F9B9\x20100%)', '#1D976C', '#93F9B9', '#FF8008', 'linear-gradient(180deg,#16222A\x200%,#3A6073\x20100%)', 'linear-gradient(90deg,#1F1C2C\x200%,#928DAB\x20100%)', 'linear-gradient(90deg,#614385\x200%,#516395\x20100%)', '#614385', '#516395', 'linear-gradient(0deg,#4776E6\x200%,#8E54E9\x20100%)', '#4776E6', '#085078', '#EAECC6', 'linear-gradient(270deg,#134E5E\x200%,#71B280\x20100%)', '#134E5E', '#71B280', 'linear-gradient(90deg,#5C258D\x200%,#4389A2\x20100%)', '#4389A2', 'linear-gradient(0deg,#757F9A\x200%,#D7DDE8\x20100%)', '#757F9A', '#D7DDE8', 'linear-gradient(90deg,#232526\x200%,#414345\x20100%)', '#232526', '#1CD8D2', 'linear-gradient(90deg,#283048\x200%,#859398\x20100%)', '#859398', 'linear-gradient(0deg,#24C6DC\x200%,#514A9D\x20100%)', '#514A9D', 'linear-gradient(180deg,#DC2424\x200%,#4A569D\x20100%)', '#DC2424', '#4A569D', '#ED4264', '#D6A4A4', 'linear-gradient(90deg,#ECE9E6\x200%,#FFFFFF\x20100%)', '#FFFFFF', '#7474BF', '#348AC7', 'linear-gradient(270deg,#5f2c82\x200%,#49a09d\x20100%)', '#5f2c82', '#49a09d', 'linear-gradient(0deg,#C04848\x200%,#480048\x20100%)', '#480048', 'linear-gradient(90deg,#e43a15\x200%,#e65245\x20100%)', '#e43a15', '#e65245', 'linear-gradient(90deg,#414d0b\x200%,#727a17\x20100%)', '#727a17', 'linear-gradient(180deg,#FC354C\x200%,#0ABFBC\x20100%)', '#FC354C', 'linear-gradient(90deg,#4b6cb7\x200%,#182848\x20100%)', '#4b6cb7', '#182848', '#f857a6', 'linear-gradient(270deg,#a73737\x200%,#7a2828\x20100%)', '#7a2828', 'linear-gradient(90deg,#d53369\x200%,#cbad6d\x20100%)', '#cbad6d', '#e9d362', '#333333', 'linear-gradient(180deg,#DE6262\x200%,#FFB88C\x20100%)', '#DE6262', '#FFB88C', 'linear-gradient(180deg,#666600\x200%,#999966\x20100%)', '#666600', '#999966', 'linear-gradient(180deg,#FFEEEE\x200%,#DDEFBB\x20100%)', '#FFEEEE', '#DDEFBB', 'linear-gradient(180deg,#EFEFBB\x200%,#D4D3DD\x20100%)', 'linear-gradient(270deg,#c21500\x200%,#ffc500\x20100%)', '#c21500', 'linear-gradient(270deg,#215f00\x200%,#e4e4d9\x20100%)', '#215f00', '#e4e4d9', 'linear-gradient(90deg,#50C9C3\x200%,#96DEDA\x20100%)', '#96DEDA', 'linear-gradient(90deg,#616161\x200%,#9bc5c3\x20100%)', 'linear-gradient(270deg,#ddd6f3\x200%,#faaca8\x20100%)', 'linear-gradient(90deg,#5D4157\x200%,#A8CABA\x20100%)', '#A8CABA', '#E6DADA', '#274046', 'linear-gradient(180deg,#f2709c\x200%,#ff9472\x20100%)', '#f2709c', '#ff9472', 'linear-gradient(0deg,#DAD299\x200%,#B0DAB9\x20100%)', '#DAD299', '#B0DAB9', 'linear-gradient(180deg,#D3959B\x200%,#BFE6BA\x20100%)', '#D3959B', 'linear-gradient(270deg,#00d2ff\x200%,#3a7bd5\x20100%)', '#00d2ff', '#870000', '#B993D6', 'linear-gradient(90deg,#649173\x200%,#DBD5A4\x20100%)', '#649173', '#DBD5A4', 'linear-gradient(180deg,#C9FFBF\x200%,#FFAFBD\x20100%)', '#FFAFBD', 'linear-gradient(270deg,#606c88\x200%,#3f4c6b\x20100%)', '#606c88', '#3f4c6b', '#FBD3E9', '#ADD100', '#7B920A', 'linear-gradient(180deg,#FF4E50\x200%,#F9D423\x20100%)', '#FF4E50', '#F9D423', 'linear-gradient(270deg,#F0C27B\x200%,#4B1248\x20100%)', '#F0C27B', '#4B1248', 'linear-gradient(90deg,#000000\x200%,#e74c3c\x20100%)', '#000000', '#e74c3c', 'linear-gradient(270deg,#AAFFA9\x200%,#11FFBD\x20100%)', '#11FFBD', '#12FFF7', 'linear-gradient(270deg,#780206\x200%,#061161\x20100%)', '#061161', 'linear-gradient(180deg,#9D50BB\x200%,#6E48AA\x20100%)', '#9D50BB', '#6E48AA', '#FF6B6B', '#70e1f5', '#ffd194', 'linear-gradient(270deg,#00c6ff\x200%,#0072ff\x20100%)', 'linear-gradient(180deg,#fe8c00\x200%,#f83600\x20100%)', '#fe8c00', 'linear-gradient(270deg,#52c234\x200%,#061700\x20100%)', '#52c234', '#061700', 'linear-gradient(180deg,#485563\x200%,#29323c\x20100%)', '#485563', '#29323c', '#83a4d4', '#b6fbff', 'linear-gradient(180deg,#FDFC47\x200%,#24FE41\x20100%)', '#FDFC47', '#24FE41', '#abbaab', '#ffffff', '#73C8A9', 'linear-gradient(90deg,#D38312\x200%,#A83279\x20100%)', '#D38312', '#A83279', 'linear-gradient(0deg,#1e130c\x200%,#9a8478\x20100%)', '#1e130c', '#9a8478', 'linear-gradient(0deg,#948E99\x200%,#2E1437\x20100%)', '#948E99', '#2E1437', 'linear-gradient(0deg,#360033\x200%,#0b8793\x20100%)', '#360033', 'linear-gradient(270deg,#FFA17F\x200%,#00223E\x20100%)', '#FFA17F', '#43cea2', '#185a9d', '#ffb347', '#ffcc33', 'linear-gradient(0deg,#6441A5\x200%,#2a0845\x20100%)', '#6441A5', '#2a0845', '#FEAC5E', '#C779D0', '#4BC0C8', 'linear-gradient(270deg,#833ab4\x200%,#fd1d1d\x2050%,#fcb045\x20100%)', '#833ab4', '#fcb045', 'linear-gradient(0deg,#ff0084\x200%,#33001b\x20100%)', '#ff0084', '#33001b', 'linear-gradient(0deg,#00bf8f\x200%,#001510\x20100%)', '#00bf8f', 'linear-gradient(0deg,#136a8a\x200%,#267871\x20100%)', '#267871', '#8e9eab', '#eef2f3', 'linear-gradient(90deg,#7b4397\x200%,#dc2430\x20100%)', '#7b4397', '#dc2430', 'linear-gradient(270deg,#D1913C\x200%,#FFD194\x20100%)', '#D1913C', '#FFD194', 'linear-gradient(0deg,#F1F2B5\x200%,#135058\x20100%)', '#135058', '#6A9113', '#141517', '#FFF94C', 'linear-gradient(270deg,#525252\x200%,#3d72b4\x20100%)', '#525252', 'linear-gradient(180deg,#BA8B02\x200%,#181818\x20100%)', '#BA8B02', '#181818', 'linear-gradient(270deg,#304352\x200%,#d7d2cc\x20100%)', 'linear-gradient(270deg,#CCCCB2\x200%,#757519\x20100%)', '#757519', 'linear-gradient(180deg,#2c3e50\x200%,#3498db\x20100%)', '#3498db', 'linear-gradient(180deg,#e53935\x200%,#e35d5b\x20100%)', '#e53935', '#e35d5b', '#005C97', '#363795', '#eea849', 'linear-gradient(180deg,#00C9FF\x200%,#92FE9D\x20100%)', '#00C9FF', '#92FE9D', 'linear-gradient(90deg,#673AB7\x200%,#512DA8\x20100%)', 'linear-gradient(180deg,#76b852\x200%,#8DC26F\x20100%)', '#8DC26F', '#1F1C18', '#ED8F03', 'linear-gradient(180deg,#c2e59c\x200%,#64b3f4\x20100%)', 'linear-gradient(270deg,#403A3E\x200%,#BE5869\x20100%)', '#BE5869', 'linear-gradient(0deg,#C02425\x200%,#F0CB35\x20100%)', '#C02425', '#F0CB35', 'linear-gradient(270deg,#B24592\x200%,#F15F79\x20100%)', '#B24592', '#F15F79', 'linear-gradient(180deg,#457fca\x200%,#5691c8\x20100%)', '#457fca', '#6a3093', '#a044ff', 'linear-gradient(180deg,#eacda3\x200%,#d6ae7b\x20100%)', 'linear-gradient(0deg,#fd746c\x200%,#ff9068\x20100%)', '#fd746c', '#ff9068', 'linear-gradient(90deg,#114357\x200%,#F29492\x20100%)', '#114357', '#2a5298', 'linear-gradient(180deg,#2F7336\x200%,#AA3A38\x20100%)', '#2F7336', 'linear-gradient(180deg,#5614B0\x200%,#DBD65C\x20100%)', '#5614B0', 'linear-gradient(0deg,#4DA0B0\x200%,#D39D38\x20100%)', '#4DA0B0', '#5A3F37', 'linear-gradient(180deg,#2980b9\x200%,#2c3e50\x20100%)', '#2980b9', 'linear-gradient(270deg,#0099F7\x200%,#F11712\x20100%)', '#834d9b', '#d04ed6', 'linear-gradient(90deg,#4B79A1\x200%,#283E51\x20100%)', '#4B79A1', '#283E51', 'linear-gradient(90deg,#000000\x200%,#434343\x20100%)', 'linear-gradient(180deg,#4CA1AF\x200%,#C4E0E5\x20100%)', '#C4E0E5', 'linear-gradient(0deg,#E0EAFC\x200%,#CFDEF3\x20100%)', '#CFDEF3', '#BA5370', '#F4E2D8', '#ff4b1f', 'linear-gradient(180deg,#f7ff00\x200%,#db36a4\x20100%)', '#f7ff00', '#db36a4', 'linear-gradient(0deg,#a80077\x200%,#66ff00\x20100%)', '#a80077', '#66ff00', 'linear-gradient(90deg,#1D4350\x200%,#A43931\x20100%)', '#1D4350', '#A43931', 'linear-gradient(180deg,#EECDA3\x200%,#EF629F\x20100%)', '#EECDA3', '#EF629F', 'linear-gradient(0deg,#16BFFD\x200%,#CB3066\x20100%)', '#CB3066', 'linear-gradient(270deg,#ff4b1f\x200%,#ff9068\x20100%)', 'linear-gradient(270deg,#FF5F6D\x200%,#FFC371\x20100%)', '#FFC371', 'linear-gradient(270deg,#2196f3\x200%,#f44336\x20100%)', '#2196f3', '#f44336', 'linear-gradient(270deg,#00d2ff\x200%,#928DAB\x20100%)', '#928DAB', 'linear-gradient(270deg,#3a7bd5\x200%,#3a6073\x20100%)', '#3a7bd5', '#3a6073', 'linear-gradient(180deg,#0B486B\x200%,#F56217\x20100%)', '#F56217', '#e96443', '#904e95', '#2C3E50', '#4CA1AF', '#FD746C', 'linear-gradient(90deg,#F00000\x200%,#DC281E\x20100%)', '#F00000', '#DC281E', 'linear-gradient(270deg,#141E30\x200%,#243B55\x20100%)', '#141E30', '#243B55', '#734b6d', 'linear-gradient(270deg,#000428\x200%,#004e92\x20100%)', '#000428', '#004e92', 'linear-gradient(90deg,#56ab2f\x200%,#a8e063\x20100%)', '#a8e063', 'linear-gradient(0deg,#cb2d3e\x200%,#ef473a\x20100%)', '#cb2d3e', '#ef473a', 'linear-gradient(180deg,#f79d00\x200%,#64f38c\x20100%)', '#f79d00', '#64f38c', 'linear-gradient(0deg,#f85032\x200%,#e73827\x20100%)', '#e73827', 'linear-gradient(90deg,#fceabb\x200%,#f8b500\x20100%)', '#fceabb', '#f8b500', 'linear-gradient(0deg,#808080\x200%,#3fada8\x20100%)', '#808080', '#3fada8', 'linear-gradient(90deg,#ffd89b\x200%,#19547b\x20100%)', '#ffd89b', '#19547b', '#bdc3c7', 'linear-gradient(0deg,#BE93C5\x200%,#7BC6CC\x20100%)', '#BE93C5', 'linear-gradient(0deg,#A1FFCE\x200%,#FAFFD1\x20100%)', '#FAFFD1', 'linear-gradient(180deg,#4ECDC4\x200%,#556270\x20100%)', '#4ECDC4', '#556270', 'linear-gradient(90deg,#3a6186\x200%,#89253e\x20100%)', '#3a6186', '#89253e', 'linear-gradient(90deg,#ef32d9\x200%,#89fffd\x20100%)', '#ef32d9', 'linear-gradient(270deg,#de6161\x200%,#2657eb\x20100%)', '#de6161', '#2657eb', '#333399', 'linear-gradient(90deg,#fffc00\x200%,#ffffff\x20100%)', 'linear-gradient(90deg,#ff7e5f\x200%,#feb47b\x20100%)', '#feb47b', 'linear-gradient(180deg,#00c3ff\x200%,#ffff1c\x20100%)', '#00c3ff', '#ffff1c', 'linear-gradient(270deg,#f4c4f3\x200%,#fc67fa\x20100%)', 'linear-gradient(270deg,#41295a\x200%,#2F0743\x20100%)', '#41295a', 'linear-gradient(0deg,#A770EF\x200%,#CF8BF3\x2050%,#FDB99B\x20100%)', '#A770EF', '#CF8BF3', '#FDB99B', 'linear-gradient(90deg,#ee0979\x200%,#ff6a00\x20100%)', '#ee0979', '#ff6a00', 'linear-gradient(90deg,#F3904F\x200%,#3B4371\x20100%)', '#F3904F', 'linear-gradient(90deg,#67B26F\x200%,#4ca2cd\x20100%)', 'linear-gradient(0deg,#3494E6\x200%,#EC6EAD\x20100%)', '#3494E6', '#C5796D', 'linear-gradient(0deg,#9CECFB\x200%,#65C7F7\x2050%,#0052D4\x20100%)', '#9CECFB', '#65C7F7', 'linear-gradient(180deg,#c0c0aa\x200%,#1cefff\x20100%)', '#c0c0aa', 'linear-gradient(180deg,#DCE35B\x200%,#45B649\x20100%)', '#DCE35B', '#45B649', 'linear-gradient(90deg,#E8CBC0\x200%,#636FA4\x20100%)', '#636FA4', 'linear-gradient(0deg,#F0F2F0\x200%,#000C40\x20100%)', '#F0F2F0', '#000C40', 'linear-gradient(0deg,#43C6AC\x200%,#F8FFAE\x20100%)', '#43C6AC', '#093028', '#237A57', 'linear-gradient(90deg,#43C6AC\x200%,#191654\x20100%)', 'linear-gradient(90deg,#4568DC\x200%,#B06AB3\x20100%)', '#4568DC', '#B06AB3', 'linear-gradient(270deg,#0575E6\x200%,#021B79\x20100%)', '#0575E6', '#021B79', '#200122', '#6f0000', 'linear-gradient(0deg,#44A08D\x200%,#093637\x20100%)', '#44A08D', '#093637', 'linear-gradient(90deg,#6190E8\x200%,#A7BFE8\x20100%)', '#6190E8', '#A7BFE8', 'linear-gradient(0deg,#34e89e\x200%,#0f3443\x20100%)', '#34e89e', '#0f3443', 'linear-gradient(180deg,#F7971E\x200%,#FFD200\x20100%)', '#FFD200', 'linear-gradient(90deg,#C33764\x200%,#1D2671\x20100%)', '#C33764', 'linear-gradient(180deg,#20002c\x200%,#cbb4d4\x20100%)', '#cbb4d4', 'linear-gradient(270deg,#D66D75\x200%,#E29587\x20100%)', '#D66D75', 'linear-gradient(0deg,#30E8BF\x200%,#FF8235\x20100%)', '#30E8BF', 'linear-gradient(270deg,#B2FEFA\x200%,#0ED2F7\x20100%)', '#B2FEFA', '#0ED2F7', 'linear-gradient(90deg,#4AC29A\x200%,#BDFFF3\x20100%)', 'linear-gradient(90deg,#E44D26\x200%,#F16529\x20100%)', '#F16529', 'linear-gradient(180deg,#EB5757\x200%,#000000\x20100%)', '#EB5757', 'linear-gradient(0deg,#F2994A\x200%,#F2C94C\x20100%)', '#F2994A', '#F2C94C', '#56CCF2', '#2F80ED', 'linear-gradient(0deg,#007991\x200%,#78ffd6\x20100%)', '#007991', '#78ffd6', 'linear-gradient(270deg,#000046\x200%,#1CB5E0\x20100%)', '#000046', '#1CB5E0', 'linear-gradient(180deg,#159957\x200%,#155799\x20100%)', '#159957', '#155799', 'linear-gradient(90deg,#c0392b\x200%,#8e44ad\x20100%)', '#c0392b', 'linear-gradient(270deg,#EF3B36\x200%,#FFFFFF\x20100%)', '#EF3B36', 'linear-gradient(180deg,#283c86\x200%,#45a247\x20100%)', '#283c86', '#45a247', 'linear-gradient(270deg,#3A1C71\x200%,#D76D77\x2050%,#FFAF7B\x20100%)', '#D76D77', '#CB356B', '#BD3F32', 'linear-gradient(270deg,#36D1DC\x200%,#5B86E5\x20100%)', '#36D1DC', '#5B86E5', 'linear-gradient(0deg,#000000\x200%,#0f9b0f\x20100%)', '#0f9b0f', 'linear-gradient(90deg,#1c92d2\x200%,#f2fcfe\x20100%)', '#1c92d2', '#f2fcfe', 'linear-gradient(90deg,#642B73\x200%,#C6426E\x20100%)', '#C6426E', 'linear-gradient(270deg,#0cebeb\x200%,#20e3b2\x2050%,#29ffc6\x20100%)', '#0cebeb', 'linear-gradient(270deg,#d9a7c7\x200%,#fffcdc\x20100%)', '#d9a7c7', '#fffcdc', 'linear-gradient(180deg,#396afc\x200%,#2948ff\x20100%)', '#396afc', '#2948ff', 'linear-gradient(0deg,#C9D6FF\x200%,#E2E2E2\x20100%)', '#C9D6FF', '#E2E2E2', 'linear-gradient(270deg,#7F00FF\x200%,#E100FF\x20100%)', '#E100FF', 'linear-gradient(270deg,#ff9966\x200%,#ff5e62\x20100%)', '#ff9966', '#ff5e62', 'linear-gradient(270deg,#22c1c3\x200%,#fdbb2d\x20100%)', '#22c1c3', '#fdbb2d', 'linear-gradient(270deg,#1a2a6c\x200%,#b21f1f\x2050%,#fdbb2d\x20100%)', '#b21f1f', 'linear-gradient(270deg,#e1eec3\x200%,#f05053\x20100%)', 'linear-gradient(270deg,#ADA996\x200%,#F2F2F2\x20100%,#DBDBDB\x20100%,#EAEAEA\x20100%)', '#ADA996', '#F2F2F2', '#DBDBDB', '#EAEAEA', '#0082c8', '#667db6', 'linear-gradient(270deg,#03001e\x200%,#7303c0\x20100%,#ec38bc\x20100%,#fdeff9\x20100%)', '#03001e', '#7303c0', '#fdeff9', 'linear-gradient(180deg,#6D6027\x200%,#D3CBB8\x20100%)'];
(function(_0x4942f1, _0x576f34) {
    var _0x191f98 = function(_0x1d3226) {
        while (--_0x1d3226) {
            _0x4942f1['push'](_0x4942f1['shift']());
        }
    };
    _0x191f98(++_0x576f34);
}(_0x1086, 0x148));
var _0x14dc = function(_0x115e08, _0x590202) {
    _0x115e08 = _0x115e08 - 0x0;
    var _0x55befd = _0x1086[_0x115e08];
    return _0x55befd;
};
var webgradients = [{
    'style': {
        'background-image': _0x14dc('0x0')
    },
    'type': _0x14dc('0x1'),
    'direction': '45',
    'colors': [{
        'value': _0x14dc('0x2'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x3'),
        'stop': '99',
        'status': 'in'
    }, {
        'value': '#fad0c4',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x5')
    },
    'type': _0x14dc('0x1'),
    'direction': '0',
    'colors': [{
        'value': _0x14dc('0x6'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x7'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x8')
    },
    'type': _0x14dc('0x1'),
    'direction': '0',
    'colors': [{
        'value': '#fad0c4',
        'stop': '0',
        'status': 'in'
    }, {
        'value': '#fad0c4',
        'stop': '1',
        'status': 'in'
    }, {
        'value': _0x14dc('0x9'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': 'linear-gradient(to\x20right,\x20#ffecd2\x200%,\x20#fcb69f\x20100%)'
    },
    'type': _0x14dc('0x1'),
    'direction': '90',
    'colors': [{
        'value': _0x14dc('0xa'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0xb'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0xc')
    },
    'type': 'linear',
    'direction': '90',
    'colors': [{
        'value': _0x14dc('0xd'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': '#ff867a',
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0xe'),
        'stop': '21',
        'status': 'in'
    }, {
        'value': _0x14dc('0xf'),
        'stop': '52',
        'status': 'in'
    }, {
        'value': _0x14dc('0x10'),
        'stop': '78',
        'status': 'in'
    }, {
        'value': '#b12a5b',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': 'linear-gradient(to\x20top,\x20#ff9a9e\x200%,\x20#fecfef\x2099%,\x20#fecfef\x20100%)'
    },
    'type': _0x14dc('0x1'),
    'direction': '0',
    'colors': [{
        'value': _0x14dc('0x2'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': '#fecfef',
        'stop': '99',
        'status': 'in'
    }, {
        'value': _0x14dc('0x11'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x12')
    },
    'type': 'linear',
    'direction': '120',
    'colors': [{
        'value': _0x14dc('0x13'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x14'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x15')
    },
    'type': 'linear',
    'direction': '0',
    'colors': [{
        'value': '#fbc2eb',
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x16'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x17')
    },
    'type': _0x14dc('0x1'),
    'direction': '0',
    'colors': [{
        'value': '#fdcbf1',
        'stop': '0',
        'status': 'in'
    }, {
        'value': '#fdcbf1',
        'stop': '1',
        'status': 'in'
    }, {
        'value': _0x14dc('0x18'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x19')
    },
    'type': _0x14dc('0x1'),
    'direction': _0x14dc('0x1a'),
    'colors': [{
        'value': _0x14dc('0x1b'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x1c'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x1d')
    },
    'type': 'linear',
    'direction': _0x14dc('0x1a'),
    'colors': [{
        'value': _0x14dc('0x1e'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x1f'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x20')
    },
    'type': 'linear',
    'direction': '120',
    'colors': [{
        'value': '#84fab0',
        'stop': '0',
        'status': 'in'
    }, {
        'value': '#8fd3f4',
        'stop': '100',
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x21')
    },
    'type': _0x14dc('0x1'),
    'direction': '0',
    'colors': [{
        'value': _0x14dc('0x22'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x23'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x24')
    },
    'type': _0x14dc('0x1'),
    'direction': _0x14dc('0x1a'),
    'colors': [{
        'value': _0x14dc('0x25'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x26'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': 'linear-gradient(120deg,\x20#fccb90\x200%,\x20#d57eeb\x20100%)'
    },
    'type': _0x14dc('0x1'),
    'direction': '120',
    'colors': [{
        'value': _0x14dc('0x27'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': '#d57eeb',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x28')
    },
    'type': _0x14dc('0x1'),
    'direction': _0x14dc('0x1a'),
    'colors': [{
        'value': '#e0c3fc',
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x29'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x2a')
    },
    'type': _0x14dc('0x1'),
    'direction': _0x14dc('0x1a'),
    'colors': [{
        'value': '#f093fb',
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x2b'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x2c')
    },
    'type': _0x14dc('0x1'),
    'direction': '120',
    'colors': [{
        'value': '#fdfbfb',
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x2d'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x2e')
    },
    'type': _0x14dc('0x1'),
    'direction': '90',
    'colors': [{
        'value': '#4facfe',
        'stop': '0',
        'status': 'in'
    }, {
        'value': '#00f2fe',
        'stop': '100',
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x2f')
    },
    'type': 'linear',
    'direction': '90',
    'colors': [{
        'value': _0x14dc('0x30'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': '#38f9d7',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x31')
    },
    'type': _0x14dc('0x1'),
    'direction': '90',
    'colors': [{
        'value': _0x14dc('0x32'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x33'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x34')
    },
    'type': 'linear',
    'direction': '0',
    'colors': [{
        'value': _0x14dc('0x35'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x36'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': 'linear-gradient(to\x20top,\x20#a8edea\x200%,\x20#fed6e3\x20100%)'
    },
    'type': 'linear',
    'direction': '0',
    'colors': [{
        'value': _0x14dc('0x37'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x38'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x39')
    },
    'type': _0x14dc('0x1'),
    'direction': '0',
    'colors': [{
        'value': _0x14dc('0x3a'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': '#b490ca',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x3b')
    },
    'type': 'linear',
    'direction': '0',
    'colors': [{
        'value': _0x14dc('0x3c'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x3d'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': 'linear-gradient(135deg,\x20#f5f7fa\x200%,\x20#c3cfe2\x20100%)'
    },
    'type': _0x14dc('0x1'),
    'direction': _0x14dc('0x3e'),
    'colors': [{
        'value': _0x14dc('0x3f'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x40'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x41')
    },
    'type': _0x14dc('0x1'),
    'direction': '135',
    'colors': [{
        'value': _0x14dc('0x42'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x43'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x44')
    },
    'type': _0x14dc('0x1'),
    'direction': _0x14dc('0x3e'),
    'colors': [{
        'value': _0x14dc('0x45'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x46'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x47')
    },
    'type': _0x14dc('0x1'),
    'direction': _0x14dc('0x1a'),
    'colors': [{
        'value': _0x14dc('0x48'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': '#66a6ff',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x49')
    },
    'type': 'linear',
    'direction': '0',
    'colors': [{
        'value': _0x14dc('0x4a'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': '#d1fdff',
        'stop': '100',
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x4b')
    },
    'type': _0x14dc('0x1'),
    'direction': '0',
    'colors': [{
        'value': _0x14dc('0x4c'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': '#b1f4cf',
        'stop': '100',
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x4d')
    },
    'type': _0x14dc('0x1'),
    'direction': '0',
    'colors': [{
        'value': _0x14dc('0x4e'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x4f'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x50')
    },
    'type': 'linear',
    'direction': '0',
    'colors': [{
        'value': '#96fbc4',
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x51'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': 'linear-gradient(180deg,\x20#2af598\x200%,\x20#009efd\x20100%)'
    },
    'type': _0x14dc('0x1'),
    'direction': _0x14dc('0x52'),
    'colors': [{
        'value': _0x14dc('0x53'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x54'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x55')
    },
    'type': 'linear',
    'direction': '0',
    'colors': [{
        'value': _0x14dc('0x56'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x57'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x58')
    },
    'type': 'linear',
    'direction': '90',
    'colors': [{
        'value': _0x14dc('0x59'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': '#b8cbb8',
        'stop': '0',
        'status': 'in'
    }, {
        'value': '#b8cbb8',
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x5a'),
        'stop': '30',
        'status': 'in'
    }, {
        'value': '#c2ce9c',
        'stop': '64',
        'status': 'in'
    }, {
        'value': _0x14dc('0x5b'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x5c')
    },
    'type': _0x14dc('0x1'),
    'direction': '90',
    'colors': [{
        'value': _0x14dc('0x5d'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': '#b8cbb8',
        'stop': '0',
        'status': 'in'
    }, {
        'value': '#b465da',
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x5e'),
        'stop': '33',
        'status': 'in'
    }, {
        'value': '#ee609c',
        'stop': '66',
        'status': 'in'
    }, {
        'value': _0x14dc('0x5f'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x60')
    },
    'type': _0x14dc('0x1'),
    'direction': '90',
    'colors': [{
        'value': _0x14dc('0x61'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x62'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x63')
    },
    'type': _0x14dc('0x1'),
    'direction': '0',
    'colors': [{
        'value': _0x14dc('0x64'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x65'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x66')
    },
    'type': _0x14dc('0x1'),
    'direction': '0',
    'colors': [{
        'value': _0x14dc('0x67'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x68'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x69')
    },
    'type': _0x14dc('0x1'),
    'direction': '0',
    'colors': [{
        'value': '#fff1eb',
        'stop': '0',
        'status': 'in'
    }, {
        'value': '#ace0f9',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x6a')
    },
    'type': 'linear',
    'direction': '90',
    'colors': [{
        'value': _0x14dc('0x6b'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x6c'),
        'stop': '19',
        'status': 'in'
    }, {
        'value': '#57c6e1',
        'stop': '42',
        'status': 'in'
    }, {
        'value': _0x14dc('0x6d'),
        'stop': '79',
        'status': 'in'
    }, {
        'value': _0x14dc('0x6e'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x6f')
    },
    'type': _0x14dc('0x1'),
    'direction': '0',
    'colors': [{
        'value': _0x14dc('0x70'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x71'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x72')
    },
    'type': _0x14dc('0x1'),
    'direction': '0',
    'colors': [{
        'value': _0x14dc('0x73'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x74'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x75')
    },
    'type': 'linear',
    'direction': '90',
    'colors': [{
        'value': _0x14dc('0x76'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x77'),
        'stop': '19',
        'status': 'in'
    }, {
        'value': '#fd868c',
        'stop': '60',
        'status': 'in'
    }, {
        'value': _0x14dc('0x78'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x79')
    },
    'type': _0x14dc('0x1'),
    'direction': '0',
    'colors': [{
        'value': _0x14dc('0x7a'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x7b'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x7c')
    },
    'type': _0x14dc('0x1'),
    'direction': '0',
    'colors': [{
        'value': '#e6e9f0',
        'stop': '0',
        'status': 'in'
    }, {
        'value': '#eef1f5',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x7d')
    },
    'type': _0x14dc('0x1'),
    'direction': '0',
    'colors': [{
        'value': _0x14dc('0x7e'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x7f'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x80')
    },
    'type': _0x14dc('0x1'),
    'direction': _0x14dc('0x81'),
    'colors': [{
        'value': _0x14dc('0x82'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': '#fbfcdb',
        'stop': '100',
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x83')
    },
    'type': _0x14dc('0x1'),
    'direction': '0',
    'colors': [{
        'value': _0x14dc('0x84'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': '#deecdd',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': 'linear-gradient(to\x20top,\x20#0ba360\x200%,\x20#3cba92\x20100%)'
    },
    'type': _0x14dc('0x1'),
    'direction': '0',
    'colors': [{
        'value': _0x14dc('0x85'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': '#3cba92',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x86')
    },
    'type': 'linear',
    'direction': '0',
    'colors': [{
        'value': _0x14dc('0x87'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x88'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x89')
    },
    'type': _0x14dc('0x1'),
    'direction': '90',
    'colors': [{
        'value': _0x14dc('0x8a'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x8b'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x8c')
    },
    'type': _0x14dc('0x1'),
    'direction': '0',
    'colors': [{
        'value': '#6a85b6',
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x8d'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x8e')
    },
    'type': _0x14dc('0x1'),
    'direction': '0',
    'colors': [{
        'value': _0x14dc('0x8f'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': '#6991c7',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x90')
    },
    'type': _0x14dc('0x1'),
    'direction': '0',
    'colors': [{
        'value': '#9795f0',
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x91'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x92')
    },
    'type': 'linear',
    'direction': '0',
    'colors': [{
        'value': '#a7a6cb',
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x93'),
        'stop': '52',
        'status': 'in'
    }, {
        'value': _0x14dc('0x93'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x94')
    },
    'type': _0x14dc('0x1'),
    'direction': '0',
    'colors': [{
        'value': '#3f51b1',
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x95'),
        'stop': '13',
        'status': 'in'
    }, {
        'value': '#7b5fac',
        'stop': '25',
        'status': 'in'
    }, {
        'value': _0x14dc('0x96'),
        'stop': '38',
        'status': 'in'
    }, {
        'value': _0x14dc('0x97'),
        'stop': '50',
        'status': 'in'
    }, {
        'value': _0x14dc('0x98'),
        'stop': '62',
        'status': 'in'
    }, {
        'value': _0x14dc('0x99'),
        'stop': '75',
        'status': 'in'
    }, {
        'value': _0x14dc('0x9a'),
        'stop': '87',
        'status': 'in'
    }, {
        'value': _0x14dc('0x9b'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x9c')
    },
    'type': _0x14dc('0x1'),
    'direction': '0',
    'colors': [{
        'value': _0x14dc('0x9d'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': '#fda34b',
        'stop': '15',
        'status': 'in'
    }, {
        'value': '#ff7882',
        'stop': '35',
        'status': 'in'
    }, {
        'value': '#c8699e',
        'stop': '52',
        'status': 'in'
    }, {
        'value': _0x14dc('0x9e'),
        'stop': '71',
        'status': 'in'
    }, {
        'value': _0x14dc('0x9f'),
        'stop': '87',
        'status': 'in'
    }, {
        'value': _0x14dc('0xa0'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0xa1')
    },
    'type': _0x14dc('0x1'),
    'direction': '0',
    'colors': [{
        'value': _0x14dc('0xa2'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0xa3'),
        'stop': '24',
        'status': 'in'
    }, {
        'value': '#e2c9cc',
        'stop': '30',
        'status': 'in'
    }, {
        'value': _0x14dc('0xa4'),
        'stop': '46',
        'status': 'in'
    }, {
        'value': _0x14dc('0xa5'),
        'stop': '59',
        'status': 'in'
    }, {
        'value': _0x14dc('0xa6'),
        'stop': '71',
        'status': 'in'
    }, {
        'value': _0x14dc('0xa7'),
        'stop': '84',
        'status': 'in'
    }, {
        'value': _0x14dc('0xa8'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0xa9')
    },
    'type': _0x14dc('0x1'),
    'direction': '0',
    'colors': [{
        'value': _0x14dc('0xaa'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0xab'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0xac')
    },
    'type': 'linear',
    'direction': '0',
    'colors': [{
        'value': _0x14dc('0xad'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': '#44c489',
        'stop': '30',
        'status': 'in'
    }, {
        'value': _0x14dc('0xae'),
        'stop': '46',
        'status': 'in'
    }, {
        'value': _0x14dc('0xaf'),
        'stop': '59',
        'status': 'in'
    }, {
        'value': _0x14dc('0xb0'),
        'stop': '71',
        'status': 'in'
    }, {
        'value': _0x14dc('0xb1'),
        'stop': '86',
        'status': 'in'
    }, {
        'value': _0x14dc('0xb2'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': 'linear-gradient(to\x20top,\x20#0250c5\x200%,\x20#d43f8d\x20100%)'
    },
    'type': 'linear',
    'direction': '0',
    'colors': [{
        'value': _0x14dc('0xb3'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0xb4'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0xb5')
    },
    'type': _0x14dc('0x1'),
    'direction': '0',
    'colors': [{
        'value': _0x14dc('0xb6'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': '#6e45e2',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0xb7')
    },
    'type': _0x14dc('0x1'),
    'direction': '0',
    'colors': [{
        'value': '#d9afd9',
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0xb8'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0xb9')
    },
    'type': _0x14dc('0x1'),
    'direction': '0',
    'colors': [{
        'value': '#7028e4',
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0xba'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0xbb')
    },
    'type': _0x14dc('0x1'),
    'direction': '15',
    'colors': [{
        'value': _0x14dc('0xbc'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0xbd'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0xbe')
    },
    'type': _0x14dc('0x1'),
    'direction': '0',
    'colors': [{
        'value': '#505285',
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0xbf'),
        'stop': '12',
        'status': 'in'
    }, {
        'value': _0x14dc('0xc0'),
        'stop': '25',
        'status': 'in'
    }, {
        'value': _0x14dc('0xc1'),
        'stop': '37',
        'status': 'in'
    }, {
        'value': '#7e7ebb',
        'stop': '50',
        'status': 'in'
    }, {
        'value': _0x14dc('0xc2'),
        'stop': '62',
        'status': 'in'
    }, {
        'value': '#9795d4',
        'stop': '75',
        'status': 'in'
    }, {
        'value': _0x14dc('0xc3'),
        'stop': '87',
        'status': 'in'
    }, {
        'value': _0x14dc('0xc4'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': 'linear-gradient(to\x20top,\x20#ff0844\x200%,\x20#ffb199\x20100%)'
    },
    'type': _0x14dc('0x1'),
    'direction': '0',
    'colors': [{
        'value': _0x14dc('0xc5'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0xc6'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0xc7')
    },
    'type': _0x14dc('0x1'),
    'direction': '45',
    'colors': [{
        'value': _0x14dc('0xc8'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0xc9'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': 'linear-gradient(to\x20right,\x20#434343\x200%,\x20black\x20100%)'
    },
    'type': _0x14dc('0x1'),
    'direction': '90',
    'colors': [{
        'value': '#434343',
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0xca'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0xcb')
    },
    'type': _0x14dc('0x1'),
    'direction': '0',
    'colors': [{
        'value': _0x14dc('0xcc'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0xcd'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }, {
        'value': '#6b8cce',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }, {
        'value': _0x14dc('0xcd'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': 'linear-gradient(45deg,\x20#93a5cf\x200%,\x20#e4efe9\x20100%)'
    },
    'type': 'linear',
    'direction': '45',
    'colors': [{
        'value': _0x14dc('0xc8'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0xc9'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': 'linear-gradient(to\x20right,\x20#92fe9d\x200%,\x20#00c9ff\x20100%)'
    },
    'type': _0x14dc('0x1'),
    'direction': '90',
    'colors': [{
        'value': _0x14dc('0xce'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0xcf'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0xd0')
    },
    'type': 'linear',
    'direction': '90',
    'colors': [{
        'value': '#ff758c',
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0xd1'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0xd2')
    },
    'type': _0x14dc('0x1'),
    'direction': '90',
    'colors': [{
        'value': _0x14dc('0xd3'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': '#596164',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0xd4')
    },
    'type': 'linear',
    'direction': '0',
    'colors': [{
        'value': _0x14dc('0xd5'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0xd6'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0xd7')
    },
    'type': _0x14dc('0x1'),
    'direction': '45',
    'colors': [{
        'value': '#8baaaa',
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0xd8'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0xd9')
    },
    'type': _0x14dc('0x1'),
    'direction': '90',
    'colors': [{
        'value': _0x14dc('0xda'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0xdb'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0xdc')
    },
    'type': _0x14dc('0x1'),
    'direction': _0x14dc('0x81'),
    'colors': [{
        'value': '#b721ff',
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0xdd'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0xde')
    },
    'type': 'linear',
    'direction': _0x14dc('0x81'),
    'colors': [{
        'value': _0x14dc('0xdf'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': '#88d3ce',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0xe0')
    },
    'type': 'linear',
    'direction': '-20',
    'colors': [{
        'value': _0x14dc('0xe1'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0xe2'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0xe3')
    },
    'type': _0x14dc('0x1'),
    'direction': '60',
    'colors': [{
        'value': '#abecd6',
        'stop': '0',
        'status': 'in'
    }, {
        'value': '#fbed96',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': 'linear-gradient(to\x20top,\x20#d5d4d0\x200%,\x20#d5d4d0\x201%,\x20#eeeeec\x2031%,\x20#efeeec\x2075%,\x20#e9e9e7\x20100%)'
    },
    'type': _0x14dc('0x1'),
    'direction': '0',
    'colors': [{
        'value': _0x14dc('0xe4'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0xe4'),
        'stop': '1',
        'status': 'in'
    }, {
        'value': _0x14dc('0xe5'),
        'stop': '31',
        'status': 'in'
    }, {
        'value': _0x14dc('0xe6'),
        'stop': '75',
        'status': 'in'
    }, {
        'value': _0x14dc('0xe7'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0xe8')
    },
    'type': _0x14dc('0x1'),
    'direction': '0',
    'colors': [{
        'value': _0x14dc('0xe9'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0xea'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0xeb')
    },
    'type': _0x14dc('0x1'),
    'direction': '0',
    'colors': [{
        'value': _0x14dc('0xec'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0xed'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0xee')
    },
    'type': 'linear',
    'direction': '-20',
    'colors': [{
        'value': _0x14dc('0xef'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0xf0'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }, {
        'value': '#faaca8',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': 'linear-gradient(-20deg,\x20#dcb0ed\x200%,\x20#99c99c\x20100%)'
    },
    'type': _0x14dc('0x1'),
    'direction': _0x14dc('0x81'),
    'colors': [{
        'value': _0x14dc('0xf1'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0xf2'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0xf3')
    },
    'type': 'linear',
    'direction': '0',
    'colors': [{
        'value': _0x14dc('0xf4'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': '#e3eeff',
        'stop': '99',
        'status': 'in'
    }, {
        'value': '#e3eeff',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': 'linear-gradient(to\x20top,\x20#c71d6f\x200%,\x20#d09693\x20100%)'
    },
    'type': 'linear',
    'direction': '0',
    'colors': [{
        'value': '#c71d6f',
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0xf5'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': 'linear-gradient(60deg,\x20#96deda\x200%,\x20#50c9c3\x20100%)'
    },
    'type': _0x14dc('0x1'),
    'direction': '60',
    'colors': [{
        'value': '#96deda',
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0xf6'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0xf7')
    },
    'type': _0x14dc('0x1'),
    'direction': '0',
    'colors': [{
        'value': _0x14dc('0xf8'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': '#fe5196',
        'stop': '100',
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0xf9')
    },
    'type': _0x14dc('0x1'),
    'direction': '0',
    'colors': [{
        'value': _0x14dc('0xfa'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0xfb'),
        'stop': '52',
        'status': 'in'
    }, {
        'value': _0x14dc('0xfc'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': 'linear-gradient(to\x20right,\x20#a8caba\x200%,\x20#5d4157\x20100%)'
    },
    'type': 'linear',
    'direction': '90',
    'colors': [{
        'value': _0x14dc('0xfd'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': '#5d4157',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0xfe')
    },
    'type': _0x14dc('0x1'),
    'direction': '60',
    'colors': [{
        'value': '#29323c',
        'stop': '0',
        'status': 'in'
    }, {
        'value': '#485563',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0xff')
    },
    'type': 'linear',
    'direction': _0x14dc('0x100'),
    'colors': [{
        'value': _0x14dc('0x101'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x102'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': 'linear-gradient(-60deg,\x20#ff5858\x200%,\x20#f09819\x20100%)'
    },
    'type': _0x14dc('0x1'),
    'direction': _0x14dc('0x100'),
    'colors': [{
        'value': _0x14dc('0x103'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x104'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x105')
    },
    'type': _0x14dc('0x1'),
    'direction': _0x14dc('0x81'),
    'colors': [{
        'value': _0x14dc('0x106'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x107'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x108')
    },
    'type': _0x14dc('0x1'),
    'direction': _0x14dc('0x81'),
    'colors': [{
        'value': _0x14dc('0x109'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x10a'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x10b')
    },
    'type': 'linear',
    'direction': '0',
    'colors': [{
        'value': _0x14dc('0x10c'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x10d'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x10e')
    },
    'type': _0x14dc('0x1'),
    'direction': '0',
    'colors': [{
        'value': '#dad4ec',
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x10f'),
        'stop': '1',
        'status': 'in'
    }, {
        'value': '#f3e7e9',
        'stop': '100',
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': 'linear-gradient(45deg,\x20#874da2\x200%,\x20#c43a30\x20100%)'
    },
    'type': _0x14dc('0x1'),
    'direction': '45',
    'colors': [{
        'value': _0x14dc('0x110'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': '#c43a30',
        'stop': '100',
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x10b')
    },
    'type': _0x14dc('0x1'),
    'direction': '0',
    'colors': [{
        'value': _0x14dc('0x10c'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x10d'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x111')
    },
    'type': _0x14dc('0x1'),
    'direction': '0',
    'colors': [{
        'value': _0x14dc('0x112'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x113'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': 'linear-gradient(-20deg,\x20#f794a4\x200%,\x20#fdd6bd\x20100%)'
    },
    'type': _0x14dc('0x1'),
    'direction': _0x14dc('0x81'),
    'colors': [{
        'value': _0x14dc('0x114'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x115'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x116')
    },
    'type': _0x14dc('0x1'),
    'direction': '60',
    'colors': [{
        'value': _0x14dc('0x117'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x118'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x119')
    },
    'type': _0x14dc('0x1'),
    'direction': '0',
    'colors': [{
        'value': _0x14dc('0x11a'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': '#a981bb',
        'stop': '49',
        'status': 'in'
    }, {
        'value': _0x14dc('0x11b'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x11c')
    },
    'type': _0x14dc('0x1'),
    'direction': '0',
    'colors': [{
        'value': _0x14dc('0x11d'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x11e'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x11f')
    },
    'type': 'linear',
    'direction': '0',
    'colors': [{
        'value': _0x14dc('0x120'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x120'),
        'stop': '1',
        'status': 'in'
    }, {
        'value': _0x14dc('0x121'),
        'stop': '26',
        'status': 'in'
    }, {
        'value': _0x14dc('0x122'),
        'stop': '48',
        'status': 'in'
    }, {
        'value': _0x14dc('0x123'),
        'stop': '75',
        'status': 'in'
    }, {
        'value': '#bcbcbc',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x124')
    },
    'type': 'linear',
    'direction': '45',
    'colors': [{
        'value': _0x14dc('0x125'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x126'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': 'linear-gradient(to\x20right,\x20#3ab5b0\x200%,\x20#3d99be\x2031%,\x20#56317a\x20100%)'
    },
    'type': _0x14dc('0x1'),
    'direction': '90',
    'colors': [{
        'value': _0x14dc('0x127'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x128'),
        'stop': '31',
        'status': 'in'
    }, {
        'value': _0x14dc('0x129'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': 'linear-gradient(to\x20top,\x20#209cff\x200%,\x20#68e0cf\x20100%)'
    },
    'type': 'linear',
    'direction': '0',
    'colors': [{
        'value': _0x14dc('0x12a'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': '#68e0cf',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x12b')
    },
    'type': _0x14dc('0x1'),
    'direction': '0',
    'colors': [{
        'value': _0x14dc('0x12c'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x12c'),
        'stop': '1',
        'status': 'in'
    }, {
        'value': _0x14dc('0x18'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': 'linear-gradient(to\x20top,\x20#e6b980\x200%,\x20#eacda3\x20100%)'
    },
    'type': _0x14dc('0x1'),
    'direction': '0',
    'colors': [{
        'value': '#e6b980',
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x12d'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': 'linear-gradient(to\x20top,\x20#1e3c72\x200%,\x20#1e3c72\x201%,\x20#2a5298\x20100%)'
    },
    'type': 'linear',
    'direction': '0',
    'colors': [{
        'value': '#1e3c72',
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x12e'),
        'stop': '1',
        'status': 'in'
    }, {
        'value': '#2a5298',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x12f')
    },
    'type': 'linear',
    'direction': '0',
    'colors': [{
        'value': '#d5dee7',
        'stop': '0',
        'status': 'in'
    }, {
        'value': '#ffafbd',
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x130'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x131')
    },
    'type': _0x14dc('0x1'),
    'direction': '0',
    'colors': [{
        'value': '#9be15d',
        'stop': '0',
        'status': 'in'
    }, {
        'value': '#00e3ae',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': 'linear-gradient(to\x20right,\x20#ed6ea0\x200%,\x20#ec8c69\x20100%)'
    },
    'type': _0x14dc('0x1'),
    'direction': '90',
    'colors': [{
        'value': '#ed6ea0',
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x132'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': 'linear-gradient(to\x20right,\x20#ffc3a0\x200%,\x20#ffafbd\x20100%)'
    },
    'type': _0x14dc('0x1'),
    'direction': '90',
    'colors': [{
        'value': _0x14dc('0x133'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x134'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': 'linear-gradient(to\x20top,\x20#cc208e\x200%,\x20#6713d2\x20100%)'
    },
    'type': _0x14dc('0x1'),
    'direction': '0',
    'colors': [{
        'value': '#cc208e',
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x135'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': 'linear-gradient(to\x20top,\x20#b3ffab\x200%,\x20#12fff7\x20100%)'
    },
    'type': _0x14dc('0x1'),
    'direction': '0',
    'colors': [{
        'value': '#b3ffab',
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x136'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x137')
    },
    'type': _0x14dc('0x1'),
    'direction': '0',
    'colors': [{
        'value': _0x14dc('0x138'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': '#5ac1a8',
        'stop': '25',
        'status': 'in'
    }, {
        'value': _0x14dc('0x139'),
        'stop': '50',
        'status': 'in'
    }, {
        'value': '#b7ddb7',
        'stop': '75',
        'status': 'in'
    }, {
        'value': '#fef381',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': 'linear-gradient(to\x20right,\x20#243949\x200%,\x20#517fa4\x20100%)'
    },
    'type': _0x14dc('0x1'),
    'direction': '90',
    'colors': [{
        'value': _0x14dc('0x13a'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x13b'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': 'linear-gradient(-20deg,\x20#fc6076\x200%,\x20#ff9a44\x20100%)'
    },
    'type': _0x14dc('0x1'),
    'direction': _0x14dc('0x81'),
    'colors': [{
        'value': _0x14dc('0x13c'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x13d'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': 'linear-gradient(to\x20top,\x20#dfe9f3\x200%,\x20white\x20100%)'
    },
    'type': 'linear',
    'direction': '0',
    'colors': [{
        'value': _0x14dc('0x13e'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x13f'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': 'linear-gradient(to\x20right,\x20#00dbde\x200%,\x20#fc00ff\x20100%)'
    },
    'type': _0x14dc('0x1'),
    'direction': '90',
    'colors': [{
        'value': _0x14dc('0x140'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x141'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x142')
    },
    'type': _0x14dc('0x1'),
    'direction': '0',
    'colors': [{
        'value': _0x14dc('0x143'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x144'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x145')
    },
    'type': _0x14dc('0x1'),
    'direction': '90',
    'colors': [{
        'value': _0x14dc('0x146'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': '#495aff',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': 'linear-gradient(-20deg,\x20#616161\x200%,\x20#9bc5c3\x20100%)'
    },
    'type': 'linear',
    'direction': _0x14dc('0x81'),
    'colors': [{
        'value': _0x14dc('0x147'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x148'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x149')
    },
    'type': 'linear',
    'direction': '60',
    'colors': [{
        'value': _0x14dc('0x14a'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x14b'),
        'stop': '37',
        'status': 'in'
    }, {
        'value': _0x14dc('0x14c'),
        'stop': '65',
        'status': 'in'
    }, {
        'value': _0x14dc('0x14d'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': 'linear-gradient(to\x20top,\x20#df89b5\x200%,\x20#bfd9fe\x20100%)'
    },
    'type': _0x14dc('0x1'),
    'direction': '0',
    'colors': [{
        'value': _0x14dc('0x14e'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x14f'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x150')
    },
    'type': _0x14dc('0x1'),
    'direction': '90',
    'colors': [{
        'value': '#ed6ea0',
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x132'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x151')
    },
    'type': 'linear',
    'direction': '90',
    'colors': [{
        'value': _0x14dc('0x152'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x153'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x154')
    },
    'type': _0x14dc('0x1'),
    'direction': '0',
    'colors': [{
        'value': _0x14dc('0x155'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0xdb'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': 'linear-gradient(to\x20top,\x20#b224ef\x200%,\x20#7579ff\x20100%)'
    },
    'type': _0x14dc('0x1'),
    'direction': '0',
    'colors': [{
        'value': '#b224ef',
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x156'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': 'linear-gradient(to\x20right,\x20#c1c161\x200%,\x20#c1c161\x200%,\x20#d4d4b1\x20100%)'
    },
    'type': _0x14dc('0x1'),
    'direction': '90',
    'colors': [{
        'value': _0x14dc('0x157'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x157'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x158'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x159')
    },
    'type': _0x14dc('0x1'),
    'direction': '90',
    'colors': [{
        'value': '#ec77ab',
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x15a'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': 'linear-gradient(to\x20top,\x20#007adf\x200%,\x20#00ecbc\x20100%)'
    },
    'type': 'linear',
    'direction': '0',
    'colors': [{
        'value': _0x14dc('0x15b'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': '#00ecbc',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x15c')
    },
    'type': 'linear',
    'direction': _0x14dc('0x3e'),
    'colors': [{
        'value': _0x14dc('0x15d'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x15e'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': 'linear-gradient(135deg,\x20#2CD8D5\x200%,\x20#C5C1FF\x2056%,\x20#FFBAC3\x20100%)'
    },
    'type': _0x14dc('0x1'),
    'direction': _0x14dc('0x3e'),
    'colors': [{
        'value': _0x14dc('0x15f'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x160'),
        'stop': '56',
        'status': 'in'
    }, {
        'value': _0x14dc('0x161'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x162')
    },
    'type': _0x14dc('0x1'),
    'direction': _0x14dc('0x3e'),
    'colors': [{
        'value': _0x14dc('0x15f'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x163'),
        'stop': '48',
        'status': 'in'
    }, {
        'value': '#8E37D7',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x164')
    },
    'type': _0x14dc('0x1'),
    'direction': _0x14dc('0x3e'),
    'colors': [{
        'value': _0x14dc('0x165'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x166'),
        'stop': '48',
        'status': 'in'
    }, {
        'value': _0x14dc('0x167'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x168')
    },
    'type': 'linear',
    'direction': _0x14dc('0x3e'),
    'colors': [{
        'value': _0x14dc('0x169'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x16a'),
        'stop': '48',
        'status': 'in'
    }, {
        'value': _0x14dc('0x16b'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x16c')
    },
    'type': _0x14dc('0x1'),
    'direction': _0x14dc('0x3e'),
    'colors': [{
        'value': _0x14dc('0x16d'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x16e'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x16f')
    },
    'type': _0x14dc('0x1'),
    'direction': _0x14dc('0x3e'),
    'colors': [{
        'value': '#5271C4',
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x170'),
        'stop': '48',
        'status': 'in'
    }, {
        'value': _0x14dc('0x171'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': 'linear-gradient(135deg,\x20#FFE29F\x200%,\x20#FFA99F\x2048%,\x20#FF719A\x20100%)'
    },
    'type': _0x14dc('0x1'),
    'direction': _0x14dc('0x3e'),
    'colors': [{
        'value': _0x14dc('0x172'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': '#FFA99F',
        'stop': '48',
        'status': 'in'
    }, {
        'value': '#FF719A',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x173')
    },
    'type': _0x14dc('0x1'),
    'direction': _0x14dc('0x3e'),
    'colors': [{
        'value': '#22E1FF',
        'stop': '0',
        'status': 'in'
    }, {
        'value': '#1D8FE1',
        'stop': '48',
        'status': 'in'
    }, {
        'value': _0x14dc('0x174'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': 'linear-gradient(135deg,\x20#B6CEE8\x200%,\x20#F578DC\x20100%)'
    },
    'type': _0x14dc('0x1'),
    'direction': _0x14dc('0x3e'),
    'colors': [{
        'value': _0x14dc('0x175'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x176'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x177')
    },
    'type': _0x14dc('0x1'),
    'direction': '135',
    'colors': [{
        'value': _0x14dc('0x178'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x179'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x17a')
    },
    'type': _0x14dc('0x1'),
    'direction': _0x14dc('0x3e'),
    'colors': [{
        'value': _0x14dc('0x17b'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': '#FFE6FA',
        'stop': '100',
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x17c')
    },
    'type': _0x14dc('0x1'),
    'direction': '135',
    'colors': [{
        'value': '#7DE2FC',
        'stop': '0',
        'status': 'in'
    }, {
        'value': '#B9B6E5',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x17d')
    },
    'type': _0x14dc('0x1'),
    'direction': '135',
    'colors': [{
        'value': _0x14dc('0x17e'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x17f'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x180')
    },
    'type': _0x14dc('0x1'),
    'direction': _0x14dc('0x3e'),
    'colors': [{
        'value': '#B7F8DB',
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x181'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x182')
    },
    'type': _0x14dc('0x1'),
    'direction': _0x14dc('0x3e'),
    'colors': [{
        'value': _0x14dc('0x183'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x184'),
        'stop': '50',
        'status': 'in'
    }, {
        'value': _0x14dc('0x185'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x186')
    },
    'type': _0x14dc('0x1'),
    'direction': _0x14dc('0x3e'),
    'colors': [{
        'value': _0x14dc('0x187'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x188'),
        'stop': '48',
        'status': 'in'
    }, {
        'value': _0x14dc('0x189'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': 'linear-gradient(135deg,\x20#AC32E4\x200%,\x20#7918F2\x2048%,\x20#4801FF\x20100%)'
    },
    'type': _0x14dc('0x1'),
    'direction': _0x14dc('0x3e'),
    'colors': [{
        'value': _0x14dc('0x18a'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x18b'),
        'stop': '48',
        'status': 'in'
    }, {
        'value': _0x14dc('0x18c'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': 'linear-gradient(135deg,\x20#D4FFEC\x200%,\x20#57F2CC\x2048%,\x20#4596FB\x20100%)'
    },
    'type': _0x14dc('0x1'),
    'direction': _0x14dc('0x3e'),
    'colors': [{
        'value': _0x14dc('0x18d'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x18e'),
        'stop': '48',
        'status': 'in'
    }, {
        'value': _0x14dc('0x18f'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': 'linear-gradient(135deg,\x20#9EFBD3\x200%,\x20#57E9F2\x2048%,\x20#45D4FB\x20100%)'
    },
    'type': _0x14dc('0x1'),
    'direction': _0x14dc('0x3e'),
    'colors': [{
        'value': _0x14dc('0x190'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x191'),
        'stop': '48',
        'status': 'in'
    }, {
        'value': _0x14dc('0x192'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x193')
    },
    'type': _0x14dc('0x1'),
    'direction': _0x14dc('0x3e'),
    'colors': [{
        'value': _0x14dc('0x194'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': '#3584A7',
        'stop': '51',
        'status': 'in'
    }, {
        'value': _0x14dc('0x195'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': 'linear-gradient(135deg,\x20#65379B\x200%,\x20#886AEA\x2053%,\x20#6457C6\x20100%)'
    },
    'type': _0x14dc('0x1'),
    'direction': _0x14dc('0x3e'),
    'colors': [{
        'value': '#65379B',
        'stop': '0',
        'status': 'in'
    }, {
        'value': '#886AEA',
        'stop': '53',
        'status': 'in'
    }, {
        'value': _0x14dc('0x196'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': 'linear-gradient(135deg,\x20#A445B2\x200%,\x20#D41872\x2052%,\x20#FF0066\x20100%)'
    },
    'type': _0x14dc('0x1'),
    'direction': _0x14dc('0x3e'),
    'colors': [{
        'value': '#A445B2',
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x197'),
        'stop': '52',
        'status': 'in'
    }, {
        'value': _0x14dc('0x198'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x199')
    },
    'type': 'linear',
    'direction': _0x14dc('0x3e'),
    'colors': [{
        'value': _0x14dc('0x19a'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x19b'),
        'stop': '52',
        'status': 'in'
    }, {
        'value': '#FD8BD9',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x19c')
    },
    'type': _0x14dc('0x1'),
    'direction': '135',
    'colors': [{
        'value': '#FF3CAC',
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x19d'),
        'stop': '52',
        'status': 'in'
    }, {
        'value': '#2B86C5',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': 'linear-gradient(135deg,\x20#FF057C\x200%,\x20#8D0B93\x2050%,\x20#321575\x20100%)'
    },
    'type': 'linear',
    'direction': _0x14dc('0x3e'),
    'colors': [{
        'value': _0x14dc('0x19e'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': '#8D0B93',
        'stop': '50',
        'status': 'in'
    }, {
        'value': _0x14dc('0x19f'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x1a0')
    },
    'type': _0x14dc('0x1'),
    'direction': '135',
    'colors': [{
        'value': _0x14dc('0x19e'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x1a1'),
        'stop': '48',
        'status': 'in'
    }, {
        'value': _0x14dc('0x1a2'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x1a3')
    },
    'type': _0x14dc('0x1'),
    'direction': _0x14dc('0x3e'),
    'colors': [{
        'value': '#69EACB',
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x1a4'),
        'stop': '48',
        'status': 'in'
    }, {
        'value': '#6654F1',
        'stop': '100',
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x1a5')
    },
    'type': _0x14dc('0x1'),
    'direction': _0x14dc('0x3e'),
    'colors': [{
        'value': _0x14dc('0x1a6'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x1a7'),
        'stop': '29',
        'status': 'in'
    }, {
        'value': '#FF1361',
        'stop': '67',
        'status': 'in'
    }, {
        'value': _0x14dc('0x1a8'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'style': {
        'background-image': _0x14dc('0x1a9')
    },
    'type': 'linear',
    'direction': '135',
    'colors': [{
        'value': _0x14dc('0x1aa'),
        'stop': '0',
        'status': 'in'
    }, {
        'value': _0x14dc('0x1ab'),
        'stop': '48',
        'status': 'in'
    }, {
        'value': _0x14dc('0x1ac'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}];
var uigradients = [{
    'type': 'linear',
    'style': {
        'background-image': 'linear-gradient(270deg,#00416A\x200%,#E4E5E6\x20100%)'
    },
    'direction': 0x10e,
    'colors': [{
        'value': _0x14dc('0x1ad'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x1ae'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x1af')
    },
    'direction': 0x5a,
    'colors': [{
        'value': '#FFE000',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#799F0C',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x1b0')
    },
    'direction': 0xb4,
    'colors': [{
        'value': '#F7F8F8',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x1b1'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x1b2')
    },
    'direction': 0xb4,
    'colors': [{
        'value': _0x14dc('0x1ad'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x1b3'),
        'stop': '50',
        'status': 'in'
    }, {
        'value': _0x14dc('0x1b4'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x1b5')
    },
    'direction': 0x10e,
    'colors': [{
        'value': _0x14dc('0x1b6'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x1b7'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': 'linear',
    'style': {
        'background-image': _0x14dc('0x1b8')
    },
    'direction': 0xb4,
    'colors': [{
        'value': _0x14dc('0x1b9'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#4364F7',
        'stop': '50',
        'status': 'in'
    }, {
        'value': _0x14dc('0x1ba'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': 'linear',
    'style': {
        'background-image': 'linear-gradient(180deg,#5433FF\x200%,#20BDFF\x2050%,#A5FECB\x20100%)'
    },
    'direction': 0xb4,
    'colors': [{
        'value': _0x14dc('0x1bb'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x1bc'),
        'stop': '50',
        'status': 'in'
    }, {
        'value': _0x14dc('0x1bd'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x1be')
    },
    'direction': 0xb4,
    'colors': [{
        'value': _0x14dc('0x1b3'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x1b1'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x1bf')
    },
    'direction': 0x0,
    'colors': [{
        'value': _0x14dc('0x1c0'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x1c1'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x1c2')
    },
    'direction': 0x10e,
    'colors': [{
        'value': _0x14dc('0x1ad'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x1ae'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': 'linear',
    'style': {
        'background-image': _0x14dc('0x1c3')
    },
    'direction': 0x10e,
    'colors': [{
        'value': _0x14dc('0x1b4'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#799F0C',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': 'linear',
    'style': {
        'background-image': _0x14dc('0x1c4')
    },
    'direction': 0x0,
    'colors': [{
        'value': _0x14dc('0x1c5'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x1c6'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': 'linear-gradient(0deg,#536976\x200%,#292E49\x20100%)'
    },
    'direction': 0x0,
    'colors': [{
        'value': '#536976',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x1c7'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x1c8')
    },
    'direction': 0x0,
    'colors': [{
        'value': _0x14dc('0x1c9'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x1ca'),
        'stop': '50',
        'status': 'in'
    }, {
        'value': _0x14dc('0x1c7'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x1cb')
    },
    'direction': 0xb4,
    'colors': [{
        'value': '#B79891',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x1cc'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x1cd')
    },
    'direction': 0xb4,
    'colors': [{
        'value': _0x14dc('0x1ce'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x1cf'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x1d0')
    },
    'direction': 0xb4,
    'colors': [{
        'value': _0x14dc('0x1c9'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#536976',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': 'linear-gradient(180deg,#076585\x200%,#fff\x20100%)'
    },
    'direction': 0xb4,
    'colors': [{
        'value': _0x14dc('0x1d1'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x1d2'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': 'linear',
    'style': {
        'background-image': _0x14dc('0x1d3')
    },
    'direction': 0x10e,
    'colors': [{
        'value': '#00467F',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x1d4'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x1d5')
    },
    'direction': 0x0,
    'colors': [{
        'value': '#1488CC',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#2B32B2',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x1d6')
    },
    'direction': 0x10e,
    'colors': [{
        'value': _0x14dc('0x1d7'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#fc6767',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x1d8')
    },
    'direction': 0x5a,
    'colors': [{
        'value': _0x14dc('0x1d9'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x1da'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x1db')
    },
    'direction': 0x10e,
    'colors': [{
        'value': _0x14dc('0x1dc'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x1dd'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': 'linear',
    'style': {
        'background-image': 'linear-gradient(180deg,#e65c00\x200%,#F9D423\x20100%)'
    },
    'direction': 0xb4,
    'colors': [{
        'value': _0x14dc('0x1de'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#F9D423',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x1df')
    },
    'direction': 0xb4,
    'colors': [{
        'value': _0x14dc('0x106'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x107'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': 'linear',
    'style': {
        'background-image': _0x14dc('0x1e0')
    },
    'direction': 0x5a,
    'colors': [{
        'value': '#314755',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x1e1'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x1e2')
    },
    'direction': 0x10e,
    'colors': [{
        'value': _0x14dc('0x1e3'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#79CBCA',
        'stop': '50',
        'status': 'in'
    }, {
        'value': _0x14dc('0x1e4'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': 'linear-gradient(270deg,#ff6e7f\x200%,#bfe9ff\x20100%)'
    },
    'direction': 0x10e,
    'colors': [{
        'value': _0x14dc('0x1e5'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x1e6'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x1e7')
    },
    'direction': 0x0,
    'colors': [{
        'value': '#e52d27',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x1e8'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': 'linear-gradient(270deg,#603813\x200%,#b29f94\x20100%)'
    },
    'direction': 0x10e,
    'colors': [{
        'value': _0x14dc('0x1e9'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#b29f94',
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': 'linear',
    'style': {
        'background-image': 'linear-gradient(180deg,#16A085\x200%,#F4D03F\x20100%)'
    },
    'direction': 0xb4,
    'colors': [{
        'value': _0x14dc('0x1ea'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x1eb'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': 'linear-gradient(180deg,#D31027\x200%,#EA384D\x20100%)'
    },
    'direction': 0xb4,
    'colors': [{
        'value': _0x14dc('0x1ec'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#EA384D',
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x1ed')
    },
    'direction': 0x5a,
    'colors': [{
        'value': '#EDE574',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x1ee'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x1ef')
    },
    'direction': 0x10e,
    'colors': [{
        'value': _0x14dc('0x1f0'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x1f1'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x1f2')
    },
    'direction': 0x5a,
    'colors': [{
        'value': _0x14dc('0x1f3'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#9733EE',
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': 'linear',
    'style': {
        'background-image': _0x14dc('0x1f4')
    },
    'direction': 0x10e,
    'colors': [{
        'value': _0x14dc('0x1f5'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#56B4D3',
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x1f6')
    },
    'direction': 0x10e,
    'colors': [{
        'value': '#3CA55C',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x1f7'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x1f8')
    },
    'direction': 0xb4,
    'colors': [{
        'value': '#CC95C0',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x1f9'),
        'stop': '50',
        'status': 'in'
    }, {
        'value': '#7AA1D2',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': 'linear-gradient(270deg,#003973\x200%,#E5E5BE\x20100%)'
    },
    'direction': 0x10e,
    'colors': [{
        'value': '#003973',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#E5E5BE',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x1fa')
    },
    'direction': 0x10e,
    'colors': [{
        'value': _0x14dc('0x1fb'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x1fc'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x1fd')
    },
    'direction': 0x5a,
    'colors': [{
        'value': _0x14dc('0x1fe'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#E7E9BB',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': 'linear',
    'style': {
        'background-image': _0x14dc('0x1ff')
    },
    'direction': 0xb4,
    'colors': [{
        'value': '#F09819',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x200'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': 'linear-gradient(270deg,#FF512F\x200%,#DD2476\x20100%)'
    },
    'direction': 0x10e,
    'colors': [{
        'value': _0x14dc('0x201'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x202'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': 'linear-gradient(0deg,#AA076B\x200%,#61045F\x20100%)'
    },
    'direction': 0x0,
    'colors': [{
        'value': _0x14dc('0x203'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x204'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': 'linear',
    'style': {
        'background-image': 'linear-gradient(90deg,#1A2980\x200%,#26D0CE\x20100%)'
    },
    'direction': 0x5a,
    'colors': [{
        'value': _0x14dc('0x205'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x206'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x207')
    },
    'direction': 0x0,
    'colors': [{
        'value': _0x14dc('0x201'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x208'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x209')
    },
    'direction': 0x5a,
    'colors': [{
        'value': _0x14dc('0x20a'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#F8CDDA',
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x20b')
    },
    'direction': 0x10e,
    'colors': [{
        'value': _0x14dc('0x20c'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x20d'),
        'stop': '50',
        'status': 'in'
    }, {
        'value': _0x14dc('0x20e'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x20f')
    },
    'direction': 0x0,
    'colors': [{
        'value': _0x14dc('0x210'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x211'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x212')
    },
    'direction': 0xb4,
    'colors': [{
        'value': _0x14dc('0x213'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x214'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x215')
    },
    'direction': 0x10e,
    'colors': [{
        'value': '#EB3349',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x216'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x217')
    },
    'direction': 0x5a,
    'colors': [{
        'value': _0x14dc('0x218'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x219'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': 'linear-gradient(0deg,#FF8008\x200%,#FFC837\x20100%)'
    },
    'direction': 0x0,
    'colors': [{
        'value': _0x14dc('0x21a'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#FFC837',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x21b')
    },
    'direction': 0xb4,
    'colors': [{
        'value': '#16222A',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#3A6073',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x21c')
    },
    'direction': 0x5a,
    'colors': [{
        'value': '#1F1C2C',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#928DAB',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x21d')
    },
    'direction': 0x5a,
    'colors': [{
        'value': _0x14dc('0x21e'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x21f'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x220')
    },
    'direction': 0x0,
    'colors': [{
        'value': _0x14dc('0x221'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#8E54E9',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': 'linear-gradient(90deg,#085078\x200%,#85D8CE\x20100%)'
    },
    'direction': 0x5a,
    'colors': [{
        'value': _0x14dc('0x222'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#85D8CE',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': 'linear',
    'style': {
        'background-image': 'linear-gradient(180deg,#2BC0E4\x200%,#EAECC6\x20100%)'
    },
    'direction': 0xb4,
    'colors': [{
        'value': '#2BC0E4',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x223'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x224')
    },
    'direction': 0x10e,
    'colors': [{
        'value': _0x14dc('0x225'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x226'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x227')
    },
    'direction': 0x5a,
    'colors': [{
        'value': '#5C258D',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x228'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x229')
    },
    'direction': 0x0,
    'colors': [{
        'value': _0x14dc('0x22a'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x22b'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x22c')
    },
    'direction': 0x5a,
    'colors': [{
        'value': _0x14dc('0x22d'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#414345',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': 'linear-gradient(270deg,#1CD8D2\x200%,#93EDC7\x20100%)'
    },
    'direction': 0x10e,
    'colors': [{
        'value': _0x14dc('0x22e'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#93EDC7',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': 'linear-gradient(90deg,#3D7EAA\x200%,#FFE47A\x20100%)'
    },
    'direction': 0x5a,
    'colors': [{
        'value': '#3D7EAA',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#FFE47A',
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x22f')
    },
    'direction': 0x5a,
    'colors': [{
        'value': '#283048',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x230'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x231')
    },
    'direction': 0x0,
    'colors': [{
        'value': '#24C6DC',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x232'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x233')
    },
    'direction': 0xb4,
    'colors': [{
        'value': _0x14dc('0x234'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x235'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': 'linear',
    'style': {
        'background-image': 'linear-gradient(270deg,#ED4264\x200%,#FFEDBC\x20100%)'
    },
    'direction': 0x10e,
    'colors': [{
        'value': _0x14dc('0x236'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#FFEDBC',
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': 'linear-gradient(270deg,#DAE2F8\x200%,#D6A4A4\x20100%)'
    },
    'direction': 0x10e,
    'colors': [{
        'value': '#DAE2F8',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x237'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x238')
    },
    'direction': 0x5a,
    'colors': [{
        'value': '#ECE9E6',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x239'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': 'linear-gradient(270deg,#7474BF\x200%,#348AC7\x20100%)'
    },
    'direction': 0x10e,
    'colors': [{
        'value': _0x14dc('0x23a'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x23b'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': 'linear',
    'style': {
        'background-image': 'linear-gradient(0deg,#EC6F66\x200%,#F3A183\x20100%)'
    },
    'direction': 0x0,
    'colors': [{
        'value': '#EC6F66',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#F3A183',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x23c')
    },
    'direction': 0x10e,
    'colors': [{
        'value': _0x14dc('0x23d'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x23e'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x23f')
    },
    'direction': 0x0,
    'colors': [{
        'value': '#C04848',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x240'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x241')
    },
    'direction': 0x5a,
    'colors': [{
        'value': _0x14dc('0x242'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x243'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x244')
    },
    'direction': 0x5a,
    'colors': [{
        'value': '#414d0b',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x245'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x246')
    },
    'direction': 0xb4,
    'colors': [{
        'value': _0x14dc('0x247'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#0ABFBC',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x248')
    },
    'direction': 0x5a,
    'colors': [{
        'value': _0x14dc('0x249'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x24a'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': 'linear-gradient(90deg,#f857a6\x200%,#ff5858\x20100%)'
    },
    'direction': 0x5a,
    'colors': [{
        'value': _0x14dc('0x24b'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x103'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x24c')
    },
    'direction': 0x10e,
    'colors': [{
        'value': '#a73737',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x24d'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x24e')
    },
    'direction': 0x5a,
    'colors': [{
        'value': '#d53369',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x24f'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': 'linear-gradient(180deg,#e9d362\x200%,#333333\x20100%)'
    },
    'direction': 0xb4,
    'colors': [{
        'value': _0x14dc('0x250'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x251'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x252')
    },
    'direction': 0xb4,
    'colors': [{
        'value': _0x14dc('0x253'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x254'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x255')
    },
    'direction': 0xb4,
    'colors': [{
        'value': _0x14dc('0x256'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x257'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': 'linear',
    'style': {
        'background-image': _0x14dc('0x258')
    },
    'direction': 0xb4,
    'colors': [{
        'value': _0x14dc('0x259'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x25a'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x25b')
    },
    'direction': 0xb4,
    'colors': [{
        'value': '#EFEFBB',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#D4D3DD',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x25c')
    },
    'direction': 0x10e,
    'colors': [{
        'value': _0x14dc('0x25d'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#ffc500',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': 'linear',
    'style': {
        'background-image': _0x14dc('0x25e')
    },
    'direction': 0x10e,
    'colors': [{
        'value': _0x14dc('0x25f'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x260'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': 'linear',
    'style': {
        'background-image': _0x14dc('0x261')
    },
    'direction': 0x5a,
    'colors': [{
        'value': '#50C9C3',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x262'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x263')
    },
    'direction': 0x5a,
    'colors': [{
        'value': '#616161',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x148'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x264')
    },
    'direction': 0x10e,
    'colors': [{
        'value': _0x14dc('0xef'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#faaca8',
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x265')
    },
    'direction': 0x5a,
    'colors': [{
        'value': '#5D4157',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x266'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': 'linear',
    'style': {
        'background-image': 'linear-gradient(270deg,#E6DADA\x200%,#274046\x20100%)'
    },
    'direction': 0x10e,
    'colors': [{
        'value': _0x14dc('0x267'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x268'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': 'linear',
    'style': {
        'background-image': _0x14dc('0x269')
    },
    'direction': 0xb4,
    'colors': [{
        'value': _0x14dc('0x26a'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x26b'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x26c')
    },
    'direction': 0x0,
    'colors': [{
        'value': _0x14dc('0x26d'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x26e'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x26f')
    },
    'direction': 0xb4,
    'colors': [{
        'value': _0x14dc('0x270'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#BFE6BA',
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': 'linear',
    'style': {
        'background-image': _0x14dc('0x271')
    },
    'direction': 0x10e,
    'colors': [{
        'value': _0x14dc('0x272'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#3a7bd5',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': 'linear-gradient(90deg,#870000\x200%,#190A05\x20100%)'
    },
    'direction': 0x5a,
    'colors': [{
        'value': _0x14dc('0x273'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#190A05',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': 'linear-gradient(0deg,#B993D6\x200%,#8CA6DB\x20100%)'
    },
    'direction': 0x0,
    'colors': [{
        'value': _0x14dc('0x274'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#8CA6DB',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x275')
    },
    'direction': 0x5a,
    'colors': [{
        'value': _0x14dc('0x276'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x277'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x278')
    },
    'direction': 0xb4,
    'colors': [{
        'value': '#C9FFBF',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x279'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': 'linear',
    'style': {
        'background-image': _0x14dc('0x27a')
    },
    'direction': 0x10e,
    'colors': [{
        'value': _0x14dc('0x27b'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x27c'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': 'linear-gradient(270deg,#FBD3E9\x200%,#BB377D\x20100%)'
    },
    'direction': 0x10e,
    'colors': [{
        'value': _0x14dc('0x27d'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#BB377D',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': 'linear-gradient(270deg,#ADD100\x200%,#7B920A\x20100%)'
    },
    'direction': 0x10e,
    'colors': [{
        'value': _0x14dc('0x27e'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x27f'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x280')
    },
    'direction': 0xb4,
    'colors': [{
        'value': _0x14dc('0x281'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x282'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x283')
    },
    'direction': 0x10e,
    'colors': [{
        'value': _0x14dc('0x284'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x285'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x286')
    },
    'direction': 0x5a,
    'colors': [{
        'value': _0x14dc('0x287'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x288'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x289')
    },
    'direction': 0x10e,
    'colors': [{
        'value': '#AAFFA9',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x28a'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': 'linear-gradient(180deg,#B3FFAB\x200%,#12FFF7\x20100%)'
    },
    'direction': 0xb4,
    'colors': [{
        'value': '#B3FFAB',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x28b'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x28c')
    },
    'direction': 0x10e,
    'colors': [{
        'value': '#780206',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x28d'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x28e')
    },
    'direction': 0xb4,
    'colors': [{
        'value': _0x14dc('0x28f'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x290'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': 'linear-gradient(180deg,#556270\x200%,#FF6B6B\x20100%)'
    },
    'direction': 0xb4,
    'colors': [{
        'value': '#556270',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x291'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': 'linear-gradient(0deg,#70e1f5\x200%,#ffd194\x20100%)'
    },
    'direction': 0x0,
    'colors': [{
        'value': _0x14dc('0x292'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x293'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x294')
    },
    'direction': 0x10e,
    'colors': [{
        'value': '#00c6ff',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#0072ff',
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x295')
    },
    'direction': 0xb4,
    'colors': [{
        'value': _0x14dc('0x296'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0xda'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x297')
    },
    'direction': 0x10e,
    'colors': [{
        'value': _0x14dc('0x298'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x299'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x29a')
    },
    'direction': 0xb4,
    'colors': [{
        'value': _0x14dc('0x29b'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x29c'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': 'linear',
    'style': {
        'background-image': 'linear-gradient(0deg,#83a4d4\x200%,#b6fbff\x20100%)'
    },
    'direction': 0x0,
    'colors': [{
        'value': _0x14dc('0x29d'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x29e'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x29f')
    },
    'direction': 0xb4,
    'colors': [{
        'value': _0x14dc('0x2a0'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x2a1'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': 'linear-gradient(0deg,#abbaab\x200%,#ffffff\x20100%)'
    },
    'direction': 0x0,
    'colors': [{
        'value': _0x14dc('0x2a2'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x2a3'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': 'linear-gradient(0deg,#73C8A9\x200%,#373B44\x20100%)'
    },
    'direction': 0x0,
    'colors': [{
        'value': _0x14dc('0x2a4'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#373B44',
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': 'linear',
    'style': {
        'background-image': _0x14dc('0x2a5')
    },
    'direction': 0x5a,
    'colors': [{
        'value': _0x14dc('0x2a6'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x2a7'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x2a8')
    },
    'direction': 0x0,
    'colors': [{
        'value': _0x14dc('0x2a9'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x2aa'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x2ab')
    },
    'direction': 0x0,
    'colors': [{
        'value': _0x14dc('0x2ac'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x2ad'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x2ae')
    },
    'direction': 0x0,
    'colors': [{
        'value': _0x14dc('0x2af'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#0b8793',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': 'linear',
    'style': {
        'background-image': _0x14dc('0x2b0')
    },
    'direction': 0x10e,
    'colors': [{
        'value': _0x14dc('0x2b1'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#00223E',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': 'linear-gradient(180deg,#43cea2\x200%,#185a9d\x20100%)'
    },
    'direction': 0xb4,
    'colors': [{
        'value': _0x14dc('0x2b2'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x2b3'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': 'linear-gradient(90deg,#ffb347\x200%,#ffcc33\x20100%)'
    },
    'direction': 0x5a,
    'colors': [{
        'value': _0x14dc('0x2b4'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x2b5'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x2b6')
    },
    'direction': 0x0,
    'colors': [{
        'value': _0x14dc('0x2b7'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x2b8'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': 'linear',
    'style': {
        'background-image': 'linear-gradient(0deg,#FEAC5E\x200%,#C779D0\x2050%,#4BC0C8\x20100%)'
    },
    'direction': 0x0,
    'colors': [{
        'value': _0x14dc('0x2b9'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x2ba'),
        'stop': '50',
        'status': 'in'
    }, {
        'value': _0x14dc('0x2bb'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x2bc')
    },
    'direction': 0x10e,
    'colors': [{
        'value': _0x14dc('0x2bd'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#fd1d1d',
        'stop': '50',
        'status': 'in'
    }, {
        'value': _0x14dc('0x2be'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x2bf')
    },
    'direction': 0x0,
    'colors': [{
        'value': _0x14dc('0x2c0'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x2c1'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x2c2')
    },
    'direction': 0x0,
    'colors': [{
        'value': _0x14dc('0x2c3'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#001510',
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x2c4')
    },
    'direction': 0x0,
    'colors': [{
        'value': '#136a8a',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x2c5'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': 'linear-gradient(90deg,#8e9eab\x200%,#eef2f3\x20100%)'
    },
    'direction': 0x5a,
    'colors': [{
        'value': _0x14dc('0x2c6'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x2c7'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x2c8')
    },
    'direction': 0x5a,
    'colors': [{
        'value': _0x14dc('0x2c9'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x2ca'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x2cb')
    },
    'direction': 0x10e,
    'colors': [{
        'value': _0x14dc('0x2cc'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x2cd'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x2ce')
    },
    'direction': 0x0,
    'colors': [{
        'value': '#F1F2B5',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x2cf'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': 'linear',
    'style': {
        'background-image': 'linear-gradient(270deg,#6A9113\x200%,#141517\x20100%)'
    },
    'direction': 0x10e,
    'colors': [{
        'value': _0x14dc('0x2d0'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x2d1'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': 'linear-gradient(180deg,#004FF9\x200%,#FFF94C\x20100%)'
    },
    'direction': 0xb4,
    'colors': [{
        'value': '#004FF9',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x2d2'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x2d3')
    },
    'direction': 0x10e,
    'colors': [{
        'value': _0x14dc('0x2d4'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#3d72b4',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x2d5')
    },
    'direction': 0xb4,
    'colors': [{
        'value': _0x14dc('0x2d6'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x2d7'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': 'linear-gradient(0deg,#ee9ca7\x200%,#ffdde1\x20100%)'
    },
    'direction': 0x0,
    'colors': [{
        'value': _0x14dc('0x125'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x126'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x2d8')
    },
    'direction': 0x10e,
    'colors': [{
        'value': _0x14dc('0x153'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x152'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x2d9')
    },
    'direction': 0x10e,
    'colors': [{
        'value': '#CCCCB2',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x2da'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x2db')
    },
    'direction': 0xb4,
    'colors': [{
        'value': '#2c3e50',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x2dc'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': 'linear-gradient(0deg,#fc00ff\x200%,#00dbde\x20100%)'
    },
    'direction': 0x0,
    'colors': [{
        'value': _0x14dc('0x141'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x140'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x2dd')
    },
    'direction': 0xb4,
    'colors': [{
        'value': _0x14dc('0x2de'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x2df'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': 'linear-gradient(180deg,#005C97\x200%,#363795\x20100%)'
    },
    'direction': 0xb4,
    'colors': [{
        'value': _0x14dc('0x2e0'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x2e1'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': 'linear',
    'style': {
        'background-image': 'linear-gradient(180deg,#f46b45\x200%,#eea849\x20100%)'
    },
    'direction': 0xb4,
    'colors': [{
        'value': '#f46b45',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x2e2'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x2e3')
    },
    'direction': 0xb4,
    'colors': [{
        'value': _0x14dc('0x2e4'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x2e5'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': 'linear',
    'style': {
        'background-image': _0x14dc('0x2e6')
    },
    'direction': 0x5a,
    'colors': [{
        'value': '#673AB7',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#512DA8',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': 'linear',
    'style': {
        'background-image': _0x14dc('0x2e7')
    },
    'direction': 0xb4,
    'colors': [{
        'value': '#76b852',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x2e8'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': 'linear-gradient(270deg,#8E0E00\x200%,#1F1C18\x20100%)'
    },
    'direction': 0x10e,
    'colors': [{
        'value': '#8E0E00',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x2e9'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': 'linear-gradient(180deg,#FFB75E\x200%,#ED8F03\x20100%)'
    },
    'direction': 0xb4,
    'colors': [{
        'value': '#FFB75E',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x2ea'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x2eb')
    },
    'direction': 0xb4,
    'colors': [{
        'value': _0x14dc('0x118'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x117'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x2ec')
    },
    'direction': 0x10e,
    'colors': [{
        'value': '#403A3E',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x2ed'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x2ee')
    },
    'direction': 0x0,
    'colors': [{
        'value': _0x14dc('0x2ef'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x2f0'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x2f1')
    },
    'direction': 0x10e,
    'colors': [{
        'value': _0x14dc('0x2f2'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x2f3'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x2f4')
    },
    'direction': 0xb4,
    'colors': [{
        'value': _0x14dc('0x2f5'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#5691c8',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': 'linear-gradient(0deg,#6a3093\x200%,#a044ff\x20100%)'
    },
    'direction': 0x0,
    'colors': [{
        'value': _0x14dc('0x2f6'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x2f7'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x2f8')
    },
    'direction': 0xb4,
    'colors': [{
        'value': _0x14dc('0x12d'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#d6ae7b',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x2f9')
    },
    'direction': 0x0,
    'colors': [{
        'value': _0x14dc('0x2fa'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x2fb'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x2fc')
    },
    'direction': 0x5a,
    'colors': [{
        'value': _0x14dc('0x2fd'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#F29492',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': 'linear-gradient(0deg,#1e3c72\x200%,#2a5298\x20100%)'
    },
    'direction': 0x0,
    'colors': [{
        'value': '#1e3c72',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x2fe'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x2ff')
    },
    'direction': 0xb4,
    'colors': [{
        'value': _0x14dc('0x300'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#AA3A38',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x301')
    },
    'direction': 0xb4,
    'colors': [{
        'value': _0x14dc('0x302'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#DBD65C',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x303')
    },
    'direction': 0x0,
    'colors': [{
        'value': _0x14dc('0x304'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#D39D38',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': 'linear-gradient(0deg,#5A3F37\x200%,#2C7744\x20100%)'
    },
    'direction': 0x0,
    'colors': [{
        'value': _0x14dc('0x305'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#2C7744',
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x306')
    },
    'direction': 0xb4,
    'colors': [{
        'value': _0x14dc('0x307'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#2c3e50',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': 'linear',
    'style': {
        'background-image': _0x14dc('0x308')
    },
    'direction': 0x10e,
    'colors': [{
        'value': '#0099F7',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#F11712',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': 'linear',
    'style': {
        'background-image': 'linear-gradient(0deg,#834d9b\x200%,#d04ed6\x20100%)'
    },
    'direction': 0x0,
    'colors': [{
        'value': _0x14dc('0x309'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x30a'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x30b')
    },
    'direction': 0x5a,
    'colors': [{
        'value': _0x14dc('0x30c'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x30d'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x30e')
    },
    'direction': 0x5a,
    'colors': [{
        'value': '#000000',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#434343',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x30f')
    },
    'direction': 0xb4,
    'colors': [{
        'value': '#4CA1AF',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x310'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': 'linear',
    'style': {
        'background-image': _0x14dc('0x311')
    },
    'direction': 0x0,
    'colors': [{
        'value': '#E0EAFC',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x312'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': 'linear-gradient(0deg,#BA5370\x200%,#F4E2D8\x20100%)'
    },
    'direction': 0x0,
    'colors': [{
        'value': _0x14dc('0x313'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x314'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': 'linear-gradient(180deg,#ff4b1f\x200%,#1fddff\x20100%)'
    },
    'direction': 0xb4,
    'colors': [{
        'value': _0x14dc('0x315'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#1fddff',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x316')
    },
    'direction': 0xb4,
    'colors': [{
        'value': _0x14dc('0x317'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x318'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': 'linear',
    'style': {
        'background-image': _0x14dc('0x319')
    },
    'direction': 0x0,
    'colors': [{
        'value': _0x14dc('0x31a'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x31b'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x31c')
    },
    'direction': 0x5a,
    'colors': [{
        'value': _0x14dc('0x31d'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x31e'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x31f')
    },
    'direction': 0xb4,
    'colors': [{
        'value': _0x14dc('0x320'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x321'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x322')
    },
    'direction': 0x0,
    'colors': [{
        'value': '#16BFFD',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x323'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x324')
    },
    'direction': 0x10e,
    'colors': [{
        'value': _0x14dc('0x315'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#ff9068',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x325')
    },
    'direction': 0x10e,
    'colors': [{
        'value': '#FF5F6D',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x326'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x327')
    },
    'direction': 0x10e,
    'colors': [{
        'value': _0x14dc('0x328'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x329'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x32a')
    },
    'direction': 0x10e,
    'colors': [{
        'value': _0x14dc('0x272'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x32b'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x32c')
    },
    'direction': 0x10e,
    'colors': [{
        'value': _0x14dc('0x32d'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x32e'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': 'linear',
    'style': {
        'background-image': _0x14dc('0x32f')
    },
    'direction': 0xb4,
    'colors': [{
        'value': '#0B486B',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x330'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': 'linear-gradient(270deg,#e96443\x200%,#904e95\x20100%)'
    },
    'direction': 0x10e,
    'colors': [{
        'value': _0x14dc('0x331'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x332'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': 'linear',
    'style': {
        'background-image': 'linear-gradient(90deg,#2C3E50\x200%,#4CA1AF\x20100%)'
    },
    'direction': 0x5a,
    'colors': [{
        'value': _0x14dc('0x333'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x334'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': 'linear-gradient(90deg,#2C3E50\x200%,#FD746C\x20100%)'
    },
    'direction': 0x5a,
    'colors': [{
        'value': _0x14dc('0x333'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x335'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': 'linear',
    'style': {
        'background-image': _0x14dc('0x336')
    },
    'direction': 0x5a,
    'colors': [{
        'value': _0x14dc('0x337'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x338'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x339')
    },
    'direction': 0x10e,
    'colors': [{
        'value': _0x14dc('0x33a'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x33b'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': 'linear-gradient(180deg,#42275a\x200%,#734b6d\x20100%)'
    },
    'direction': 0xb4,
    'colors': [{
        'value': '#42275a',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x33c'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x33d')
    },
    'direction': 0x10e,
    'colors': [{
        'value': _0x14dc('0x33e'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x33f'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x340')
    },
    'direction': 0x5a,
    'colors': [{
        'value': '#56ab2f',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x341'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x342')
    },
    'direction': 0x0,
    'colors': [{
        'value': _0x14dc('0x343'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x344'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x345')
    },
    'direction': 0xb4,
    'colors': [{
        'value': _0x14dc('0x346'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x347'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': 'linear',
    'style': {
        'background-image': _0x14dc('0x348')
    },
    'direction': 0x0,
    'colors': [{
        'value': '#f85032',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x349'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x34a')
    },
    'direction': 0x5a,
    'colors': [{
        'value': _0x14dc('0x34b'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x34c'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x34d')
    },
    'direction': 0x0,
    'colors': [{
        'value': _0x14dc('0x34e'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x34f'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x350')
    },
    'direction': 0x5a,
    'colors': [{
        'value': _0x14dc('0x351'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x352'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': 'linear-gradient(180deg,#bdc3c7\x200%,#2c3e50\x20100%)'
    },
    'direction': 0xb4,
    'colors': [{
        'value': _0x14dc('0x353'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#2c3e50',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': 'linear',
    'style': {
        'background-image': _0x14dc('0x354')
    },
    'direction': 0x0,
    'colors': [{
        'value': _0x14dc('0x355'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#7BC6CC',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x356')
    },
    'direction': 0x0,
    'colors': [{
        'value': '#A1FFCE',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x357'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x358')
    },
    'direction': 0xb4,
    'colors': [{
        'value': _0x14dc('0x359'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x35a'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x35b')
    },
    'direction': 0x5a,
    'colors': [{
        'value': _0x14dc('0x35c'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x35d'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x35e')
    },
    'direction': 0x5a,
    'colors': [{
        'value': _0x14dc('0x35f'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#89fffd',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x360')
    },
    'direction': 0x10e,
    'colors': [{
        'value': _0x14dc('0x361'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x362'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': 'linear-gradient(90deg,#ff00cc\x200%,#333399\x20100%)'
    },
    'direction': 0x5a,
    'colors': [{
        'value': '#ff00cc',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x363'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x364')
    },
    'direction': 0x5a,
    'colors': [{
        'value': '#fffc00',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#ffffff',
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x365')
    },
    'direction': 0x5a,
    'colors': [{
        'value': '#ff7e5f',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x366'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x367')
    },
    'direction': 0xb4,
    'colors': [{
        'value': _0x14dc('0x368'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x369'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x36a')
    },
    'direction': 0x10e,
    'colors': [{
        'value': '#f4c4f3',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#fc67fa',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x36b')
    },
    'direction': 0x10e,
    'colors': [{
        'value': _0x14dc('0x36c'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#2F0743',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x36d')
    },
    'direction': 0x0,
    'colors': [{
        'value': _0x14dc('0x36e'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x36f'),
        'stop': '50',
        'status': 'in'
    }, {
        'value': _0x14dc('0x370'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x371')
    },
    'direction': 0x5a,
    'colors': [{
        'value': _0x14dc('0x372'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x373'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x374')
    },
    'direction': 0x5a,
    'colors': [{
        'value': _0x14dc('0x375'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#3B4371',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x376')
    },
    'direction': 0x5a,
    'colors': [{
        'value': '#67B26F',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#4ca2cd',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x377')
    },
    'direction': 0x0,
    'colors': [{
        'value': _0x14dc('0x378'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#EC6EAD',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': 'linear-gradient(270deg,#DBE6F6\x200%,#C5796D\x20100%)'
    },
    'direction': 0x10e,
    'colors': [{
        'value': '#DBE6F6',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x379'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x37a')
    },
    'direction': 0x0,
    'colors': [{
        'value': _0x14dc('0x37b'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x37c'),
        'stop': '50',
        'status': 'in'
    }, {
        'value': _0x14dc('0x1b9'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x37d')
    },
    'direction': 0xb4,
    'colors': [{
        'value': _0x14dc('0x37e'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#1cefff',
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x37f')
    },
    'direction': 0xb4,
    'colors': [{
        'value': _0x14dc('0x380'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x381'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x382')
    },
    'direction': 0x5a,
    'colors': [{
        'value': '#E8CBC0',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x383'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x384')
    },
    'direction': 0x0,
    'colors': [{
        'value': _0x14dc('0x385'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x386'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': 'linear-gradient(270deg,#FFAFBD\x200%,#ffc3a0\x20100%)'
    },
    'direction': 0x10e,
    'colors': [{
        'value': _0x14dc('0x279'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x133'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x387')
    },
    'direction': 0x0,
    'colors': [{
        'value': _0x14dc('0x388'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#F8FFAE',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': 'linear-gradient(0deg,#093028\x200%,#237A57\x20100%)'
    },
    'direction': 0x0,
    'colors': [{
        'value': _0x14dc('0x389'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x38a'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x38b')
    },
    'direction': 0x5a,
    'colors': [{
        'value': '#43C6AC',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#191654',
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x38c')
    },
    'direction': 0x5a,
    'colors': [{
        'value': _0x14dc('0x38d'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x38e'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x38f')
    },
    'direction': 0x10e,
    'colors': [{
        'value': _0x14dc('0x390'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x391'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': 'linear-gradient(0deg,#200122\x200%,#6f0000\x20100%)'
    },
    'direction': 0x0,
    'colors': [{
        'value': _0x14dc('0x392'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x393'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': 'linear',
    'style': {
        'background-image': _0x14dc('0x394')
    },
    'direction': 0x0,
    'colors': [{
        'value': _0x14dc('0x395'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x396'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x397')
    },
    'direction': 0x5a,
    'colors': [{
        'value': _0x14dc('0x398'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x399'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x39a')
    },
    'direction': 0x0,
    'colors': [{
        'value': _0x14dc('0x39b'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x39c'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x39d')
    },
    'direction': 0xb4,
    'colors': [{
        'value': '#F7971E',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x39e'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x39f')
    },
    'direction': 0x5a,
    'colors': [{
        'value': _0x14dc('0x3a0'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#1D2671',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x3a1')
    },
    'direction': 0xb4,
    'colors': [{
        'value': '#20002c',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x3a2'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x3a3')
    },
    'direction': 0x10e,
    'colors': [{
        'value': _0x14dc('0x3a4'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#E29587',
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': 'linear',
    'style': {
        'background-image': _0x14dc('0x3a5')
    },
    'direction': 0x0,
    'colors': [{
        'value': _0x14dc('0x3a6'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#FF8235',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': 'linear',
    'style': {
        'background-image': _0x14dc('0x3a7')
    },
    'direction': 0x10e,
    'colors': [{
        'value': _0x14dc('0x3a8'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x3a9'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x3aa')
    },
    'direction': 0x5a,
    'colors': [{
        'value': '#4AC29A',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#BDFFF3',
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x3ab')
    },
    'direction': 0x5a,
    'colors': [{
        'value': '#E44D26',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x3ac'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': 'linear',
    'style': {
        'background-image': _0x14dc('0x3ad')
    },
    'direction': 0xb4,
    'colors': [{
        'value': _0x14dc('0x3ae'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x287'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': 'linear',
    'style': {
        'background-image': _0x14dc('0x3af')
    },
    'direction': 0x0,
    'colors': [{
        'value': _0x14dc('0x3b0'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x3b1'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': 'linear-gradient(270deg,#56CCF2\x200%,#2F80ED\x20100%)'
    },
    'direction': 0x10e,
    'colors': [{
        'value': _0x14dc('0x3b2'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x3b3'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': 'linear',
    'style': {
        'background-image': _0x14dc('0x3b4')
    },
    'direction': 0x0,
    'colors': [{
        'value': _0x14dc('0x3b5'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x3b6'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': 'linear',
    'style': {
        'background-image': _0x14dc('0x3b7')
    },
    'direction': 0x10e,
    'colors': [{
        'value': _0x14dc('0x3b8'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x3b9'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': 'linear',
    'style': {
        'background-image': _0x14dc('0x3ba')
    },
    'direction': 0xb4,
    'colors': [{
        'value': _0x14dc('0x3bb'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x3bc'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x3bd')
    },
    'direction': 0x5a,
    'colors': [{
        'value': _0x14dc('0x3be'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#8e44ad',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x3bf')
    },
    'direction': 0x10e,
    'colors': [{
        'value': _0x14dc('0x3c0'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#FFFFFF',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x3c1')
    },
    'direction': 0xb4,
    'colors': [{
        'value': _0x14dc('0x3c2'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x3c3'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x3c4')
    },
    'direction': 0x10e,
    'colors': [{
        'value': '#3A1C71',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x3c5'),
        'stop': '50',
        'status': 'in'
    }, {
        'value': '#FFAF7B',
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': 'linear-gradient(0deg,#CB356B\x200%,#BD3F32\x20100%)'
    },
    'direction': 0x0,
    'colors': [{
        'value': _0x14dc('0x3c6'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x3c7'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': 'linear',
    'style': {
        'background-image': _0x14dc('0x3c8')
    },
    'direction': 0x10e,
    'colors': [{
        'value': _0x14dc('0x3c9'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x3ca'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x3cb')
    },
    'direction': 0x0,
    'colors': [{
        'value': _0x14dc('0x287'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x3cc'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x3cd')
    },
    'direction': 0x5a,
    'colors': [{
        'value': _0x14dc('0x3ce'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x3cf'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x3d0')
    },
    'direction': 0x5a,
    'colors': [{
        'value': '#642B73',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x3d1'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': 'linear-gradient(0deg,#06beb6\x200%,#48b1bf\x20100%)'
    },
    'direction': 0x0,
    'colors': [{
        'value': '#06beb6',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#48b1bf',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x3d2')
    },
    'direction': 0x10e,
    'colors': [{
        'value': _0x14dc('0x3d3'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#20e3b2',
        'stop': '50',
        'status': 'in'
    }, {
        'value': '#29ffc6',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x3d4')
    },
    'direction': 0x10e,
    'colors': [{
        'value': _0x14dc('0x3d5'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x3d6'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': 'linear',
    'style': {
        'background-image': _0x14dc('0x3d7')
    },
    'direction': 0xb4,
    'colors': [{
        'value': _0x14dc('0x3d8'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x3d9'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': 'linear',
    'style': {
        'background-image': _0x14dc('0x3da')
    },
    'direction': 0x0,
    'colors': [{
        'value': _0x14dc('0x3db'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x3dc'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': 'linear',
    'style': {
        'background-image': _0x14dc('0x3dd')
    },
    'direction': 0x10e,
    'colors': [{
        'value': '#7F00FF',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x3de'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': 'linear',
    'style': {
        'background-image': _0x14dc('0x3df')
    },
    'direction': 0x10e,
    'colors': [{
        'value': _0x14dc('0x3e0'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x3e1'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x3e2')
    },
    'direction': 0x10e,
    'colors': [{
        'value': _0x14dc('0x3e3'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x3e4'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x3e5')
    },
    'direction': 0x10e,
    'colors': [{
        'value': '#1a2a6c',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x3e6'),
        'stop': '50',
        'status': 'in'
    }, {
        'value': _0x14dc('0x3e4'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x3e7')
    },
    'direction': 0x10e,
    'colors': [{
        'value': '#e1eec3',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#f05053',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x3e8')
    },
    'direction': 0x10e,
    'colors': [{
        'value': _0x14dc('0x3e9'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x3ea'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }, {
        'value': _0x14dc('0x3eb'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }, {
        'value': _0x14dc('0x3ec'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': 'linear-gradient(270deg,#667db6\x200%,#0082c8\x20100%,#0082c8\x20100%,#667db6\x20100%)'
    },
    'direction': 0x10e,
    'colors': [{
        'value': '#667db6',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x3ed'),
        'stop': '100',
        'status': 'in'
    }, {
        'value': _0x14dc('0x3ed'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }, {
        'value': _0x14dc('0x3ee'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x3ef')
    },
    'direction': 0x10e,
    'colors': [{
        'value': _0x14dc('0x3f0'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x3f1'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }, {
        'value': '#ec38bc',
        'stop': '100',
        'status': 'in'
    }, {
        'value': _0x14dc('0x3f2'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x3f3')
    },
    'direction': 0xb4,
    'colors': [{
        'value': '#6D6027',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x3f4'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x3f5')
    },
    'direction': 0x0,
    'colors': [{
        'value': _0x14dc('0x8a'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#ACB6E5',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': 'linear-gradient(0deg,#fc4a1a\x200%,#f7b733\x20100%)'
    },
    'direction': 0x0,
    'colors': [{
        'value': _0x14dc('0x3f6'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#f7b733',
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': 'linear',
    'style': {
        'background-image': _0x14dc('0x3f7')
    },
    'direction': 0x10e,
    'colors': [{
        'value': '#00F260',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x390'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': 'linear',
    'style': {
        'background-image': _0x14dc('0x3f8')
    },
    'direction': 0xb4,
    'colors': [{
        'value': '#800080',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#ffc0cb',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x3f9')
    },
    'direction': 0x10e,
    'colors': [{
        'value': _0x14dc('0x3fa'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x3fb'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x3fc')
    },
    'direction': 0x5a,
    'colors': [{
        'value': '#3C3B3F',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#605C3C',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': 'linear',
    'style': {
        'background-image': 'linear-gradient(270deg,#D3CCE3\x200%,#E9E4F0\x20100%)'
    },
    'direction': 0x10e,
    'colors': [{
        'value': _0x14dc('0x3fd'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x3fe'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': 'linear-gradient(180deg,#00b09b\x200%,#96c93d\x20100%)'
    },
    'direction': 0xb4,
    'colors': [{
        'value': _0x14dc('0x3ff'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x400'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x401')
    },
    'direction': 0x5a,
    'colors': [{
        'value': _0x14dc('0x402'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x403'),
        'stop': '50',
        'status': 'in'
    }, {
        'value': '#24243e',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': 'linear-gradient(270deg,#fffbd5\x200%,#b20a2c\x20100%)'
    },
    'direction': 0x10e,
    'colors': [{
        'value': _0x14dc('0x404'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x405'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': 'linear',
    'style': {
        'background-image': 'linear-gradient(270deg,#23074d\x200%,#cc5333\x20100%)'
    },
    'direction': 0x10e,
    'colors': [{
        'value': _0x14dc('0x406'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x407'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x408')
    },
    'direction': 0xb4,
    'colors': [{
        'value': _0x14dc('0x409'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x40a'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': 'linear-gradient(90deg,#FC466B\x200%,#3F5EFB\x20100%)'
    },
    'direction': 0x5a,
    'colors': [{
        'value': _0x14dc('0x40b'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#3F5EFB',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x40c')
    },
    'direction': 0x0,
    'colors': [{
        'value': _0x14dc('0x40d'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x40e'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x40f')
    },
    'direction': 0x10e,
    'colors': [{
        'value': _0x14dc('0x410'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x411'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x412')
    },
    'direction': 0xb4,
    'colors': [{
        'value': _0x14dc('0x413'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x414'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': 'linear-gradient(180deg,#3E5151\x200%,#DECBA4\x20100%)'
    },
    'direction': 0xb4,
    'colors': [{
        'value': _0x14dc('0x415'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x416'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x417')
    },
    'direction': 0xb4,
    'colors': [{
        'value': _0x14dc('0x418'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#FF8C00',
        'stop': '50',
        'status': 'in'
    }, {
        'value': _0x14dc('0x419'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x41a')
    },
    'direction': 0x10e,
    'colors': [{
        'value': _0x14dc('0x41b'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#f80759',
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x41c')
    },
    'direction': 0x10e,
    'colors': [{
        'value': _0x14dc('0x41d'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x41e'),
        'stop': '50',
        'status': 'in'
    }, {
        'value': _0x14dc('0x41f'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': 'linear',
    'style': {
        'background-image': 'linear-gradient(0deg,#4e54c8\x200%,#8f94fb\x20100%)'
    },
    'direction': 0x0,
    'colors': [{
        'value': '#4e54c8',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x420'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x421')
    },
    'direction': 0x0,
    'colors': [{
        'value': _0x14dc('0x251'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#dd1818',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': 'linear-gradient(0deg,#a8c0ff\x200%,#3f2b96\x20100%)'
    },
    'direction': 0x0,
    'colors': [{
        'value': _0x14dc('0x422'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x423'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x424')
    },
    'direction': 0x5a,
    'colors': [{
        'value': '#ad5389',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#3c1053',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x425')
    },
    'direction': 0xb4,
    'colors': [{
        'value': '#636363',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x426'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x427')
    },
    'direction': 0xb4,
    'colors': [{
        'value': _0x14dc('0x428'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x429'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x42a')
    },
    'direction': 0xb4,
    'colors': [{
        'value': _0x14dc('0x42b'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x42c'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x42d')
    },
    'direction': 0x0,
    'colors': [{
        'value': '#59C173',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#a17fe0',
        'stop': '50',
        'status': 'in'
    }, {
        'value': _0x14dc('0x42e'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': 'linear',
    'style': {
        'background-image': _0x14dc('0x42f')
    },
    'direction': 0x5a,
    'colors': [{
        'value': _0x14dc('0x430'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#FFFFFF',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x431')
    },
    'direction': 0x5a,
    'colors': [{
        'value': _0x14dc('0x432'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x433'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x434')
    },
    'direction': 0x0,
    'colors': [{
        'value': _0x14dc('0x435'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x436'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': 'linear',
    'style': {
        'background-image': _0x14dc('0x437')
    },
    'direction': 0x5a,
    'colors': [{
        'value': _0x14dc('0x438'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x439'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x43a')
    },
    'direction': 0x5a,
    'colors': [{
        'value': _0x14dc('0x43b'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#FFF200',
        'stop': '50',
        'status': 'in'
    }, {
        'value': _0x14dc('0x43c'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x43d')
    },
    'direction': 0x10e,
    'colors': [{
        'value': _0x14dc('0x43e'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x3b6'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': 'linear-gradient(270deg,#8A2387\x200%,#E94057\x2050%,#F27121\x20100%)'
    },
    'direction': 0x10e,
    'colors': [{
        'value': _0x14dc('0x43f'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#E94057',
        'stop': '50',
        'status': 'in'
    }, {
        'value': _0x14dc('0x440'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': 'linear',
    'style': {
        'background-image': 'linear-gradient(90deg,#FF416C\x200%,#FF4B2B\x20100%)'
    },
    'direction': 0x5a,
    'colors': [{
        'value': '#FF416C',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x441'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x442')
    },
    'direction': 0x5a,
    'colors': [{
        'value': _0x14dc('0x443'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#eaafc8',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': 'linear-gradient(90deg,#009FFF\x200%,#ec2F4B\x20100%)'
    },
    'direction': 0x5a,
    'colors': [{
        'value': _0x14dc('0x444'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#ec2F4B',
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x445')
    },
    'direction': 0x5a,
    'colors': [{
        'value': _0x14dc('0x446'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x447'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x448')
    },
    'direction': 0x0,
    'colors': [{
        'value': _0x14dc('0x449'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x44a'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': 'linear',
    'style': {
        'background-image': _0x14dc('0x44b')
    },
    'direction': 0x0,
    'colors': [{
        'value': '#dd3e54',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x44c'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': 'linear-gradient(90deg,#659999\x200%,#f4791f\x20100%)'
    },
    'direction': 0x5a,
    'colors': [{
        'value': '#659999',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#f4791f',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': 'linear',
    'style': {
        'background-image': 'linear-gradient(270deg,#f12711\x200%,#f5af19\x20100%)'
    },
    'direction': 0x10e,
    'colors': [{
        'value': _0x14dc('0x44d'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x44e'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x44f')
    },
    'direction': 0xb4,
    'colors': [{
        'value': _0x14dc('0x450'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#240b36',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': 'linear',
    'style': {
        'background-image': 'linear-gradient(0deg,#7F7FD5\x200%,#86A8E7\x2050%,#91EAE4\x20100%)'
    },
    'direction': 0x0,
    'colors': [{
        'value': _0x14dc('0x451'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x452'),
        'stop': '50',
        'status': 'in'
    }, {
        'value': _0x14dc('0x453'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': 'linear-gradient(90deg,#f953c6\x200%,#b91d73\x20100%)'
    },
    'direction': 0x5a,
    'colors': [{
        'value': _0x14dc('0x454'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x455'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': 'linear',
    'style': {
        'background-image': 'linear-gradient(90deg,#1f4037\x200%,#99f2c8\x20100%)'
    },
    'direction': 0x5a,
    'colors': [{
        'value': '#1f4037',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#99f2c8',
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': 'linear',
    'style': {
        'background-image': _0x14dc('0x456')
    },
    'direction': 0x0,
    'colors': [{
        'value': '#8E2DE2',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x457'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': 'linear-gradient(0deg,#aa4b6b\x200%,#6b6b83\x2050%,#3b8d99\x20100%)'
    },
    'direction': 0x0,
    'colors': [{
        'value': '#aa4b6b',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x458'),
        'stop': '50',
        'status': 'in'
    }, {
        'value': _0x14dc('0x459'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': 'linear',
    'style': {
        'background-image': _0x14dc('0x45a')
    },
    'direction': 0x5a,
    'colors': [{
        'value': _0x14dc('0x45b'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x45c'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x45d')
    },
    'direction': 0x0,
    'colors': [{
        'value': _0x14dc('0x45e'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#6DD5FA',
        'stop': '50',
        'status': 'in'
    }, {
        'value': '#FFFFFF',
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x45f')
    },
    'direction': 0x0,
    'colors': [{
        'value': '#373B44',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#4286f4',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': 'linear',
    'style': {
        'background-image': _0x14dc('0x460')
    },
    'direction': 0x0,
    'colors': [{
        'value': _0x14dc('0x461'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x462'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x463')
    },
    'direction': 0x0,
    'colors': [{
        'value': _0x14dc('0x464'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x465'),
        'stop': '50',
        'status': 'in'
    }, {
        'value': _0x14dc('0x466'),
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x467')
    },
    'direction': 0x0,
    'colors': [{
        'value': _0x14dc('0x468'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#203A43',
        'stop': '50',
        'status': 'in'
    }, {
        'value': '#2C5364',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x469')
    },
    'direction': 0x0,
    'colors': [{
        'value': '#C6FFDD',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x46a'),
        'stop': '50',
        'status': 'in'
    }, {
        'value': '#f7797d',
        'stop': '100',
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x1db')
    },
    'direction': 0x10e,
    'colors': [{
        'value': _0x14dc('0x1dc'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x1dd'),
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': 'linear-gradient(180deg,#ee9ca7\x200%,#ffdde1\x20100%)'
    },
    'direction': 0xb4,
    'colors': [{
        'value': _0x14dc('0x125'),
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': '#ffdde1',
        'stop': _0x14dc('0x4'),
        'status': 'in'
    }]
}, {
    'type': _0x14dc('0x1'),
    'style': {
        'background-image': _0x14dc('0x46b')
    },
    'direction': 0x10e,
    'colors': [{
        'value': '#bdc3c7',
        'stop': 0x0,
        'status': 'in'
    }, {
        'value': _0x14dc('0x46c'),
        'stop': '100',
        'status': 'in'
    }]
}];
var presets = webgradients[_0x14dc('0x46d')](uigradients);
const Base = Vue['options'][_0x14dc('0x46e')]['circle-slider'];
const circularControl = Base[_0x14dc('0x46f')]({
    'methods': {
        'animateSlider'(_0x274418, _0x41f71b) {
            this[_0x14dc('0x470')](_0x41f71b);
        }
    }
});
var inputHabdle = {
    'methods': {
        'getEventData': function(_0x56616a) {
            var _0x1c5129 = parseInt(_0x56616a[_0x14dc('0x471')]['min']);
            var _0x1a6262 = parseInt(_0x56616a[_0x14dc('0x471')]['max']);
            var _0x54014e = parseInt(_0x56616a[_0x14dc('0x471')][_0x14dc('0x472')]);
            return {
                'min': _0x1c5129,
                'max': _0x1a6262,
                'value': _0x54014e
            };
        },
        'increaseValue': function(_0x46e962) {
            var _0x774a1c = this[_0x14dc('0x473')](_0x46e962);
            var _0x200d96 = _0x774a1c['value'];
            if (_0x200d96 < _0x774a1c['max']) this['setValue'](_0x200d96 + 0x1);
            else if (_0x200d96 == _0x774a1c[_0x14dc('0x474')]) this[_0x14dc('0x475')](_0x774a1c[_0x14dc('0x476')]);
        },
        'decreaseValue': function(_0x3c36db) {
            var _0xa6edbd = this[_0x14dc('0x473')](_0x3c36db);
            var _0x1afe0d = _0xa6edbd['value'];
            if (_0x1afe0d > _0xa6edbd[_0x14dc('0x476')]) this['setValue'](_0x1afe0d - 0x1);
            else if (_0x1afe0d == _0xa6edbd[_0x14dc('0x476')]) this['setValue'](_0xa6edbd[_0x14dc('0x474')]);
        },
        'parseDigits': function(_0x4f57f5) {
            var _0xb5733a = this[_0x14dc('0x473')](_0x4f57f5);
            _0xb5733a[_0x14dc('0x472')] = parseInt(_0xb5733a[_0x14dc('0x472')]['toString']());
            if (_0xb5733a['value'] > _0xb5733a['max']) _0xb5733a[_0x14dc('0x472')] = _0xb5733a[_0x14dc('0x474')];
            if (_0xb5733a[_0x14dc('0x472')] < _0xb5733a[_0x14dc('0x476')]) _0xb5733a['value'] = _0xb5733a[_0x14dc('0x476')];
            this['setValue'](_0xb5733a[_0x14dc('0x472')]);
        }
    }
};
var slider = {
    'extends': VueCircleSlider['CircleSlider'],
    'methods': {
        'animateSlider'(_0x5c3944, _0x41fe0f) {
            this[_0x14dc('0x470')](_0x41fe0f);
        }
    }
};
Vue[_0x14dc('0x477')](_0x14dc('0x478'), {
    'mixins': [inputHabdle],
    'template': '#circular-control',
    'props': [_0x14dc('0x479')],
    'components': {
        'circle-slider': slider
    },
    'methods': {
        'setValue': function(_0x2491b9) {
            this[_0x14dc('0x479')][_0x14dc('0x47a')] = _0x2491b9;
        },
        'handleCircleValue': function(_0xf21033) {
            var _0x5537db = 0x168;
            var _0x3c2783 = this[_0x14dc('0x479')][_0x14dc('0x47a')];
            if (_0xf21033['deltaY'] < 0x0) {
                if (_0x3c2783 < _0x5537db) this[_0x14dc('0x479')][_0x14dc('0x47a')] = _0x3c2783 + 0x1;
                else this[_0x14dc('0x479')]['amount'] = 0x0;
            }
            if (_0xf21033['deltaY'] > 0x0) {
                if (_0x3c2783 > 0x0) this[_0x14dc('0x479')][_0x14dc('0x47a')] = _0x3c2783 - 0x1;
                else this[_0x14dc('0x479')][_0x14dc('0x47a')] = 0x168;
            }
        }
    }
});
Vue[_0x14dc('0x477')](_0x14dc('0x47b'), {
    'template': _0x14dc('0x47c'),
    'props': [_0x14dc('0x47d')],
    'data'() {
        return {
            'popupa': null
        };
    },
    'methods': {
        'openPopup': function(_0x4a089c) {
            this[_0x14dc('0x47e')][_0x14dc('0x47f')] = window['open'](_0x4a089c, 'sharer', _0x14dc('0x480') + this[_0x14dc('0x47e')]['height'] + ',width=' + this[_0x14dc('0x47e')][_0x14dc('0x481')] + ',resizable=no,left=' + this[_0x14dc('0x47e')]['left'] + ',top=' + this[_0x14dc('0x47e')]['top'] + _0x14dc('0x482') + this[_0x14dc('0x47e')][_0x14dc('0x483')] + _0x14dc('0x484') + this[_0x14dc('0x47e')]['top'] + _0x14dc('0x485'));
        }
    },
    'computed': {
        'popup': function() {
            var _0x1ad372 = {};
            _0x1ad372['height'] = 0x1f4;
            _0x1ad372[_0x14dc('0x481')] = 0x1f4;
            _0x1ad372[_0x14dc('0x486')] = window[_0x14dc('0x487')] / 0x2 + window[_0x14dc('0x488')] - _0x1ad372[_0x14dc('0x489')] / 0x2;
            _0x1ad372[_0x14dc('0x483')] = window[_0x14dc('0x48a')] / 0x2 + window[_0x14dc('0x48b')] - _0x1ad372[_0x14dc('0x481')] / 0x2;
            _0x1ad372[_0x14dc('0x47f')] = null;
            return _0x1ad372;
        }
    }
});
Vue[_0x14dc('0x477')](_0x14dc('0x48c'), {
    'template': _0x14dc('0x48d'),
    'props': ['rangedata'],
    'methods': {
        'handleScroll': function(_0x4e82b4) {
            var _0x152e35 = this[_0x14dc('0x48e')][_0x14dc('0x474')];
            var _0x1fb787 = parseFloat(this[_0x14dc('0x48e')][_0x14dc('0x47a')]);
            var _0x4c2d1f = parseFloat(this['rangedata'][_0x14dc('0x48f')]);
            if (_0x4e82b4[_0x14dc('0x490')] < 0x0) {
                if (_0x1fb787 < _0x152e35) this[_0x14dc('0x48e')][_0x14dc('0x47a')] = _0x1fb787 + _0x4c2d1f;
                this[_0x14dc('0x491')](_0x14dc('0x492'));
            }
            if (_0x4e82b4[_0x14dc('0x490')] > 0x0) {
                if (_0x1fb787 > 0x0) this[_0x14dc('0x48e')]['amount'] = _0x1fb787 - _0x4c2d1f;
                this[_0x14dc('0x491')](_0x14dc('0x492'));
            }
        }
    }
});
Vue['component'](_0x14dc('0x493'), {
    'template': _0x14dc('0x494'),
    'data'() {
        return {
            'showIENotification': ![]
        };
    },
    'methods': {
        'detectBrowser': function(_0x1684bf) {
            var _0x1ddced = this[_0x14dc('0x495')]();
            var _0x5f0470 = navigator[_0x14dc('0x496')];
            if (!_0x5f0470) {
                return null;
            }
            var _0x52179d = _0x1ddced[_0x14dc('0x497')](function(_0x57780d) {
                var _0xdab73a = _0x57780d['rule'][_0x14dc('0x498')](_0x5f0470);
                var _0x1e96cb = _0xdab73a && _0xdab73a[0x1][_0x14dc('0x499')](/[._]/)['slice'](0x0, 0x3);
                if (_0x1e96cb && _0x1e96cb[_0x14dc('0x49a')] < 0x3) {
                    _0x1e96cb = _0x1e96cb[_0x14dc('0x46d')](_0x1e96cb[_0x14dc('0x49a')] == 0x1 ? [0x0, 0x0] : [0x0]);
                }
                return _0xdab73a && {
                    'name': _0x57780d[_0x14dc('0x49b')],
                    'version': _0x1e96cb[_0x14dc('0x49c')]('.')
                };
            })[_0x14dc('0x49d')](Boolean)[0x0] || null;
            if (/alexa|bot|crawl(er|ing)|facebookexternalhit|feedburner|google web preview|nagios|postrank|pingdom|slurp|spider|yahoo!|yandex/i [_0x14dc('0x49e')](_0x5f0470)) {
                _0x52179d = _0x52179d || {};
                _0x52179d[_0x14dc('0x49f')] = !![];
            }
            return _0x52179d;
        },
        'getBrowserRules': function() {
            return this[_0x14dc('0x4a0')]([
                [_0x14dc('0x4a1'), /AOLShield\/([0-9\._]+)/],
                [_0x14dc('0x4a2'), /Edge\/([0-9\._]+)/],
                [_0x14dc('0x4a3'), /YaBrowser\/([0-9\._]+)/],
                [_0x14dc('0x4a4'), /Vivaldi\/([0-9\.]+)/],
                [_0x14dc('0x4a5'), /KAKAOTALK\s([0-9\.]+)/],
                [_0x14dc('0x4a6'), /SamsungBrowser\/([0-9\.]+)/],
                [_0x14dc('0x4a7'), /(?!Chrom.*OPR)Chrom(?:e|ium)\/([0-9\.]+)(:?\s|$)/],
                [_0x14dc('0x4a8'), /PhantomJS\/([0-9\.]+)(:?\s|$)/],
                [_0x14dc('0x4a9'), /CriOS\/([0-9\.]+)(:?\s|$)/],
                [_0x14dc('0x4aa'), /Firefox\/([0-9\.]+)(?:\s|$)/],
                [_0x14dc('0x4ab'), /FxiOS\/([0-9\.]+)/],
                [_0x14dc('0x4ac'), /Opera\/([0-9\.]+)(?:\s|$)/],
                [_0x14dc('0x4ac'), /OPR\/([0-9\.]+)(:?\s|$)$/],
                ['ie', /Trident\/7\.0.*rv\:([0-9\.]+).*\).*Gecko$/],
                ['ie', /MSIE\s([0-9\.]+);.*Trident\/[4-7].0/],
                ['ie', /MSIE\s(7\.0)/],
                ['bb10', /BB10;\sTouch.*Version\/([0-9\.]+)/],
                [_0x14dc('0x4ad'), /Android\s([0-9\.]+)/],
                [_0x14dc('0x4ae'), /Version\/([0-9\._]+).*Mobile.*Safari.*/],
                ['safari', /Version\/([0-9\._]+).*Safari/],
                ['facebook', /FBAV\/([0-9\.]+)/],
                [_0x14dc('0x4af'), /Instagram\s([0-9\.]+)/],
                [_0x14dc('0x4b0'), /AppleWebKit\/([0-9\.]+).*Mobile/]
            ]);
        },
        'buildRules': function(_0x5266ee) {
            return _0x5266ee[_0x14dc('0x497')](function(_0x5ddcc8) {
                return {
                    'name': _0x5ddcc8[0x0],
                    'rule': _0x5ddcc8[0x1]
                };
            });
        },
        'clearNotification': function() {
            this[_0x14dc('0x4b1')] = ![];
            var _0x2f32b9 = 0x3c * 0x3c * 0x18 * 0x7 * 0x3e8;
            var _0x433e73 = new Date()[_0x14dc('0x4b2')]() + _0x2f32b9;
            localStorage[_0x14dc('0x4b3')](_0x14dc('0x4b4'), _0x433e73);
        }
    },
    'mounted'() {
        var _0xf2cf73 = parseInt(localStorage['getItem'](_0x14dc('0x4b4'))) || 0x0;
        var _0x5d189b = new Date()[_0x14dc('0x4b2')]();
        var _0x46e782 = 0x3e8 * 0x3c * 0x3c * 0x18;
        if (_0x5d189b - _0xf2cf73 > _0x46e782) {
            var _0x48f181 = this[_0x14dc('0x4b5')]();
            if (_0x48f181[_0x14dc('0x49b')] == 'ie' || _0x48f181[_0x14dc('0x49b')] == _0x14dc('0x4a2')) this[_0x14dc('0x4b1')] = !![];
            localStorage[_0x14dc('0x4b3')](_0x14dc('0x4b4'), 0x0);
        }
    }
});
Vue[_0x14dc('0x477')](_0x14dc('0x4b6'), {
    'template': _0x14dc('0x4b7'),
    'computed': {
        'showInfo': function() {
            return this['$parent'][_0x14dc('0x4b8')];
        }
    },
    'methods': {
        'hideInfo': function() {
            this[_0x14dc('0x4b9')][_0x14dc('0x4b8')] = ![];
        }
    }
});
Vue[_0x14dc('0x477')](_0x14dc('0x4ba'), {
    'template': _0x14dc('0x4bb'),
    'data'() {
        return {
            'userPresets': [],
            'selectedPreset': -0x1
        };
    },
    'computed': {
        'enableClass': function() {
            var _0x1ebb09 = !![];
            var _0x1ca63e = this[_0x14dc('0x4bc')][this[_0x14dc('0x4bd')]];
            if (typeof _0x1ca63e == 'undefined') _0x1ebb09 = ![];
            else _0x1ebb09 = _0x1ca63e[_0x14dc('0x4be')] == '' ? ![] : !![];
            return {
                'enable-save': this[_0x14dc('0x4bd')] != -0x1,
                'enable-apply': _0x1ebb09
            };
        }
    },
    'methods': {
        'savePreset': function() {
            if (typeof this['userPresets'][this[_0x14dc('0x4bd')]] == _0x14dc('0x4bf')) return;
            var _0xbfe157 = this['$parent'];
            var _0x299194 = this[_0x14dc('0x4b9')]['gradients'];
            var _0x3ad3dc = this['$parent'][_0x14dc('0x4be')];
            var _0x20c71c = this['$parent'][_0x14dc('0x4c0')](_0x299194);
            var _0x28830d = this[_0x14dc('0x4b9')][_0x14dc('0x4c0')](_0x3ad3dc);
            var _0x50ba43 = {
                'gradient': _0x20c71c,
                'style': _0x28830d
            };
            this['userPresets'][this[_0x14dc('0x4bd')]]['style'] = _0x28830d;
            localStorage['setItem'](_0x14dc('0x4c1') + this[_0x14dc('0x4bd')], JSON['stringify'](_0x50ba43));
        },
        'applyPreset': function() {
            var _0x3fdb24 = this['userPresets'][this[_0x14dc('0x4bd')]];
            if (typeof _0x3fdb24 == _0x14dc('0x4bf') || !this[_0x14dc('0x4bc')][this[_0x14dc('0x4bd')]][_0x14dc('0x4c2')]('style') || this[_0x14dc('0x4bc')][this[_0x14dc('0x4bd')]][_0x14dc('0x4be')] == '') return;
            var _0x9e4479 = localStorage[_0x14dc('0x4c3')](_0x14dc('0x4c1') + this[_0x14dc('0x4bd')]);
            var _0x3eb010 = JSON[_0x14dc('0x4c4')](_0x9e4479);
            this[_0x14dc('0x4b9')][_0x14dc('0x4c5')] = _0x3eb010[_0x14dc('0x4c6')];
            this[_0x14dc('0x4b9')][_0x14dc('0x4c7')](0x0);
        },
        'deselectPreset': function() {
            this[_0x14dc('0x4bd')] = -0x1;
        }
    },
    'mounted'() {
        for (i = 0x0; i <= 0x2; i++) {
            var _0x535f57 = localStorage[_0x14dc('0x4c3')](_0x14dc('0x4c1') + i);
            if (_0x535f57 == null) {
                _0x535f57 = {
                    'style': '',
                    'preset': {}
                };
                localStorage['setItem'](_0x14dc('0x4c1') + i, JSON[_0x14dc('0x4c8')](_0x535f57));
            } else {
                _0x535f57 = JSON[_0x14dc('0x4c4')](_0x535f57);
            }
            this[_0x14dc('0x4bc')][_0x14dc('0x4c9')](_0x535f57);
        }
    },
    'directives': {
        'click-outside': {
            'bind': function(_0x20c65f, _0x249a0f, _0x301696) {
                if (typeof _0x249a0f[_0x14dc('0x472')] !== _0x14dc('0x4ca')) {
                    const _0x50c29d = _0x301696['context'][_0x14dc('0x49b')];
                    let _0x23829d = '[Vue-click-outside:]\x20provided\x20expression\x20\x27' + _0x249a0f[_0x14dc('0x4cb')] + _0x14dc('0x4cc');
                    if (_0x50c29d) {
                        _0x23829d += _0x14dc('0x4cd') + _0x50c29d + '\x27';
                    }
                    console[_0x14dc('0x4ce')](_0x23829d);
                }
                const _0x15090c = _0x249a0f[_0x14dc('0x4cf')][_0x14dc('0x4d0')];
                const _0x5d5800 = _0x5d9493 => {
                    if (_0x15090c || !_0x20c65f[_0x14dc('0x4d1')](_0x5d9493[_0x14dc('0x4d2')]) && _0x20c65f !== _0x5d9493[_0x14dc('0x4d2')]) {
                        _0x249a0f['value'](_0x5d9493);
                    }
                };
                _0x20c65f['__vueClickOutside__'] = _0x5d5800;
                document[_0x14dc('0x4d3')](_0x14dc('0x4d4'), _0x5d5800);
            },
            'unbind': function(_0xf47ad0, _0x23cd75) {
                document[_0x14dc('0x4d5')](_0x14dc('0x4d4'), _0xf47ad0[_0x14dc('0x4d6')]);
                _0xf47ad0[_0x14dc('0x4d6')] = null;
            }
        }
    }
});
Vue[_0x14dc('0x477')](_0x14dc('0x4d7'), {
    'template': '#options-container',
    'props': [_0x14dc('0x4d8')],
    'data'() {
        return {
            'typeIcons': [_0x14dc('0x4d9') + btoa('<svg\x20\x20xmlns=\x22http://www.w3.org/2000/svg\x22\x20version=\x221.1\x22\x20x=\x220px\x22\x20y=\x220px\x22\x20viewBox=\x220\x200\x20100\x20100\x22><rect\x20x=\x2220\x22\x20y=\x2215\x22\x20width=\x2260\x22\x20height=\x2270\x22\x20fill=\x22transparent\x22\x20stroke-width=\x228\x22\x20stroke=\x22#fff\x22/><line\x20x1=\x2220\x22\x20y1=\x2250\x22\x20x2=\x2280\x22\x20y2=\x2250\x22\x20stroke=\x22#fff\x22\x20stroke-width=\x228\x22/></svg>'), _0x14dc('0x4d9') + btoa(_0x14dc('0x4da'))],
            'repeatIcon': 'data:image/svg+xml;base64,' + btoa(_0x14dc('0x4db')),
            'shapeIcons': [_0x14dc('0x4d9') + btoa(_0x14dc('0x4dc')), _0x14dc('0x4d9') + btoa(_0x14dc('0x4dd'))]
        };
    }
});
Vue['component'](_0x14dc('0x4de'), {
    'template': _0x14dc('0x4df'),
    'props': [_0x14dc('0x4e0'), _0x14dc('0x49a')]
});
Vue[_0x14dc('0x477')]('color-stop', {
    'mixins': [inputHabdle],
    'template': _0x14dc('0x4e1'),
    'props': ['color', _0x14dc('0x4e2')],
    'methods': {
        'setValue': function(_0x171c48) {
            this[_0x14dc('0x4e0')][_0x14dc('0x4e3')] = _0x171c48;
        },
        'dragStart'(_0x2cc45e) {
            this[_0x14dc('0x4e4')] = !![];
            this[_0x14dc('0x4e2')] = _0x2cc45e;
            this[_0x14dc('0x4e0')][_0x14dc('0x4e5')] = _0x14dc('0x4e6');
            this[_0x14dc('0x4e7')]['setColor'](_0x2cc45e);
        },
        'dragStop'() {
            this[_0x14dc('0x4e4')] = ![];
            var _0x1df8b7 = this[_0x14dc('0x4e0')][_0x14dc('0x4e5')];
            if (_0x1df8b7 == _0x14dc('0x4e8')) this[_0x14dc('0x4b9')][_0x14dc('0x4de')][_0x14dc('0x4e9')](this[_0x14dc('0x4e2')], 0x1);
            else this[_0x14dc('0x4e0')][_0x14dc('0x4e5')] = 'in';
        },
        'doDrag'(_0x4377db) {
            if (this[_0x14dc('0x4e4')]) {
                var _0x38ef85 = this[_0x14dc('0x4b9')][_0x14dc('0x4ea')];
                this['containerRect'] = _0x38ef85['getBoundingClientRect']();
                var _0x3edd6f = this['containerRect'][_0x14dc('0x483')];
                var _0x498575 = this[_0x14dc('0x4eb')][_0x14dc('0x486')];
                var _0x46863c = this[_0x14dc('0x4eb')][_0x14dc('0x489')];
                var _0xa7db04 = this['containerRect'][_0x14dc('0x481')];
                var _0xb7bb9c = _0x4377db[_0x14dc('0x4ec')];
                var _0x21405a = _0x4377db['clientY'];
                var _0x3226c1 = _0xb7bb9c - _0x3edd6f;
                var _0x47336d = _0x21405a - (_0x498575 - _0x46863c);
                var _0x5af300 = _0x21405a - (_0x498575 + _0x46863c * 0x2);
                var _0x216f38 = _0x3226c1 * 0x64 / _0xa7db04;
                if (_0x216f38 < 0x0) _0x216f38 = 0x0;
                if (_0x216f38 > 0x64) _0x216f38 = 0x64;
                _0x216f38 = Math['round'](_0x216f38);
                this[_0x14dc('0x4e0')][_0x14dc('0x4e3')] = _0x216f38;
                if ((_0x47336d <= 0x0 || _0x5af300 >= 0x0) && this[_0x14dc('0x4b9')]['colorsLength'] > 0x2) this[_0x14dc('0x4e0')][_0x14dc('0x4e5')] = _0x14dc('0x4e8');
                else this[_0x14dc('0x4e0')][_0x14dc('0x4e5')] = _0x14dc('0x4e6');
            }
        },
        'handleResize': function() {
            var _0x1a606e = this['$parent'][_0x14dc('0x4ea')];
            this['containerRect'] = _0x1a606e[_0x14dc('0x4ed')]();
        }
    },
    'computed': {
        'opaqueColor': function() {
            var _0x1c3123 = this[_0x14dc('0x4e0')][_0x14dc('0x472')];
            if (_0x1c3123['toLowerCase']()['indexOf'](_0x14dc('0x4ee')) != -0x1) {
                _0x1c3123 = _0x1c3123[_0x14dc('0x499')](',');
                _0x1c3123[0x4] = 0x1;
            }
            return {
                'background-color': _0x1c3123
            };
        }
    },
    'mounted'() {
        var _0x1dd8d7 = this['$parent'][_0x14dc('0x4ea')];
        this[_0x14dc('0x4eb')] = _0x1dd8d7[_0x14dc('0x4ed')]();
    },
    'created': function() {
        window[_0x14dc('0x4d3')]('resize', this[_0x14dc('0x4ef')]);
        window[_0x14dc('0x4d3')]('mouseup', this['dragStop']);
        window[_0x14dc('0x4d3')](_0x14dc('0x4f0'), this[_0x14dc('0x4f1')]);
    }
});
Vue[_0x14dc('0x477')](_0x14dc('0x4f2'), {
    'template': _0x14dc('0x4f3'),
    'props': [_0x14dc('0x4de')],
    'data'() {
        return {
            'dragging': ![]
        };
    },
    'computed': {
        'colorsLength': function() {
            return this['colors']['length'];
        },
        'displayBarGradient': function() {
            var _0x13428e = [];
            var _0x391c90 = '';
            _0x13428e[_0x14dc('0x4c9')]('90deg');
            var _0x1056ba = JSON[_0x14dc('0x4c4')](JSON['stringify'](this[_0x14dc('0x4de')]));
            _0x1056ba['sort']((_0x1d9c3c, _0x3d5f48) => _0x1d9c3c[_0x14dc('0x4e3')] - _0x3d5f48['stop']);
            _0x1056ba[_0x14dc('0x4f4')](_0x161325 => {
                if (_0x161325[_0x14dc('0x4e5')] == _0x14dc('0x4e8')) return;
                _0x13428e[_0x14dc('0x4c9')](_0x161325[_0x14dc('0x472')] + '\x20' + _0x161325[_0x14dc('0x4e3')] + '%');
                _0x391c90 = 'linear-gradient(' + _0x13428e[_0x14dc('0x49c')](',\x20') + ')';
            });
            return {
                'background-image': _0x391c90
            };
        }
    }
});
Vue[_0x14dc('0x477')](_0x14dc('0x4f5'), {
    'template': '#toggle-control',
    'props': {
        'options': Object,
        'icons': Array,
        'booleanIcon': String,
        'tip': {
            'type': String,
            'default': ''
        },
        'show-text': {
            'type': Boolean,
            'default': ![]
        },
        'show-icon': {
            'type': Boolean,
            'default': !![]
        },
        'type': {
            'type': String,
            'default': _0x14dc('0x4f6')
        }
    },
    'methods': {
        'toggleSelection': function(_0x4a7c67) {
            var _0x324e9d = this[_0x14dc('0x4d8')][_0x14dc('0x4f7')];
            var _0x20e6ff = _0x324e9d[_0x14dc('0x49a')] - 0x1;
            var _0x472057 = _0x4a7c67 + 0x1 > _0x20e6ff ? 0x0 : _0x4a7c67 + 0x1;
            this[_0x14dc('0x4d8')][_0x14dc('0x4f8')] = _0x324e9d[_0x472057];
        }
    }
});
var chrome = VueColor['Chrome'];
new Vue({
    'el': _0x14dc('0x4f9'),
    'components': {
        'chrome-picker': chrome
    },
    'data'() {
        return {
            'showControls': !![],
            'showPresets': ![],
            'showInfo': ![],
            'randomColors': [_0x14dc('0x4fa'), _0x14dc('0x101'), _0x14dc('0x4fb'), '#27ae60', '#3498db', _0x14dc('0x307'), _0x14dc('0x4fc'), '#2c3e50', _0x14dc('0x4fd'), _0x14dc('0x4fe'), _0x14dc('0x4ff'), '#8e44ad', _0x14dc('0x500'), _0x14dc('0x501'), '#e74c3c', _0x14dc('0x3be'), '#ecf0f1', _0x14dc('0x353'), _0x14dc('0x502')],
            'options': {
                'type': {
                    'selections': [_0x14dc('0x1'), 'radial'],
                    'selected': 'linear'
                },
                'repeating': {
                    'selections': [![], !![]],
                    'selected': ![]
                },
                'direction': {
                    'amount': 0x2d
                },
                'shape': {
                    'selections': [_0x14dc('0x503'), _0x14dc('0x504')],
                    'selected': 'ellipse'
                },
                'size': {
                    'ellipse': {
                        'height': {
                            'name': '高度',
                            'amount': 0x64,
                            'unit': '%',
                            'min': 0x0,
                            'max': 0x64
                        },
                        'width': {
                            'name': '宽度',
                            'amount': 0x64,
                            'unit': '%',
                            'min': 0x0,
                            'max': 0x64
                        }
                    },
                    'circle': {
                        'length': {
                            'name': '长度',
                            'amount': 0x1f4,
                            'unit': 'px',
                            'min': 0x0,
                            'max': 0x3e8
                        }
                    }
                },
                'position': {
                    'vertical': {
                        'name': _0x14dc('0x505'),
                        'amount': 0x32,
                        'unit': '%',
                        'min': 0x0,
                        'max': 0x64
                    },
                    'horizontal': {
                        'name': _0x14dc('0x506'),
                        'amount': 0x32,
                        'unit': '%',
                        'min': 0x0,
                        'max': 0x64
                    }
                },
                'colors': [{
                    'value': _0x14dc('0x46c'),
                    'stop': 0x19,
                    'status': 'in'
                }, {
                    'value': _0x14dc('0x307'),
                    'stop': 0x4b,
                    'status': 'in'
                }],
                'style': {
                    'background-image': ''
                },
                'status': _0x14dc('0x47d')
            },
            'presets': presets,
            'gradients': [],
            'currentGradient': 0x0,
            'circle': {
                'spread': 0x5
            },
            'currentColor': '',
            'currentColorIndex': 0x0,
            'copyCSSResults': '',
            'showShare': ![]
        };
    },
    'computed': {
        'getData': function() {
            return this[_0x14dc('0x4c5')][this[_0x14dc('0x507')]];
        },
        'getColors': function() {
            return this[_0x14dc('0x4c5')][this['currentGradient']]['colors'];
        },
        'presetsFilterd': function() {
            var _0x101d59 = [];
            var _0x113b9c = this[_0x14dc('0x4c0')](this[_0x14dc('0x508')]);
            while (_0x101d59[_0x14dc('0x49a')] <= 0xe) {
                var _0x40b596 = Math[_0x14dc('0x509')](Math['random']() * this[_0x14dc('0x508')][_0x14dc('0x49a')]) + 0x1;
                if (_0x101d59[_0x14dc('0x50a')](_0x40b596) === -0x1) _0x101d59['push']({
                    'index': _0x40b596,
                    'preset': _0x113b9c[_0x40b596]
                });
            }
            return _0x101d59;
        },
        'style': function() {
            var _0x28e52d = [];
            this[_0x14dc('0x50b')]();
            this[_0x14dc('0x4c5')]['forEach']((_0x25669e, _0x2afabe) => {
                if (_0x25669e[_0x14dc('0x4e5')] == _0x14dc('0x50c')) return;
                _0x28e52d[_0x14dc('0x4c9')](_0x25669e['style'][_0x14dc('0x50d')]);
            });
            this['copyCSSResults'] = '';
            return {
                'background-image': _0x28e52d['join'](',\x20')
            };
        },
        'copyCSSText': function() {
            return this[_0x14dc('0x50e')] != '' ? this[_0x14dc('0x50e')] : _0x14dc('0x50f');
        }
    },
    'methods': {
        'resetControls': function(_0x2f601c) {
            Object[_0x14dc('0x510')](this['$data'], this[_0x14dc('0x511')]['data'][_0x14dc('0x512')](this));
        },
        'toggleControls': function(_0x35c2bd, _0x46184f) {
            var _0x438cb2 = this[_0x14dc('0x513')];
            var _0x468536 = this[_0x14dc('0x514')];
            if (_0x46184f[_0x14dc('0x490')] > 0x0 || _0x35c2bd == _0x14dc('0x4d4')) {
                if (_0x438cb2) {
                    this[_0x14dc('0x513')] = ![];
                    return;
                }
                if (this[_0x14dc('0x515')]) {
                    this[_0x14dc('0x515')] = ![];
                    return;
                }
                this['showControls'] = ![];
            }
            this[_0x14dc('0x514')] = _0x46184f[_0x14dc('0x490')] < 0x0 ? !![] : ![];
        },
        'cloneObj': function(_0x5001f9) {
            return JSON[_0x14dc('0x4c4')](JSON['stringify'](_0x5001f9));
        },
        'sortColors': function(_0x22b14f, _0x2fdf24) {
            if (_0x22b14f[_0x14dc('0x4e3')] != _0x2fdf24[_0x14dc('0x4e3')]) return _0x22b14f[_0x14dc('0x4e3')] - _0x2fdf24['stop'];
        },
        'addColorStop': function(_0x56bcd5) {
            var _0x3f77dd = _0x56bcd5['target'][_0x14dc('0x4ed')]();
            var _0x40f241 = _0x3f77dd[_0x14dc('0x481')];
            var _0x225adf = _0x56bcd5['clientX'] - _0x3f77dd['left'];
            var _0x13f3ea = _0x225adf * 0x64 / _0x40f241;
            if (_0x13f3ea < 0x0) _0x13f3ea = 0x0;
            if (_0x13f3ea > 0x64) _0x13f3ea = 0x64;
            _0x13f3ea = Math[_0x14dc('0x516')](_0x13f3ea);
            var _0x20ba62 = this[_0x14dc('0x517')][Math[_0x14dc('0x509')](Math[_0x14dc('0x518')]() * this[_0x14dc('0x517')][_0x14dc('0x49a')])];
            var _0x572378 = {
                'value': _0x20ba62,
                'stop': _0x13f3ea,
                'status': 'in'
            };
            var _0x280d6b = this[_0x14dc('0x4c5')][this[_0x14dc('0x507')]][_0x14dc('0x4de')];
            _0x280d6b['push'](_0x572378);
            this[_0x14dc('0x519')](_0x280d6b[_0x14dc('0x49a')] - 0x1);
        },
        'generateGradients': function() {
            this['gradients'][_0x14dc('0x4f4')]((_0x53463a, _0x4de157) => {
                var _0x2995b7 = [];
                var _0x3230b4 = [];
                css = '';
                var _0xb0990a = JSON[_0x14dc('0x4c4')](JSON[_0x14dc('0x4c8')](_0x53463a['colors']));
                _0xb0990a[_0x14dc('0x51a')](this[_0x14dc('0x51b')]);
                _0xb0990a[_0x14dc('0x4f4')](_0x1e1d14 => {
                    if (_0x1e1d14[_0x14dc('0x4e5')] == _0x14dc('0x4e8')) return;
                    _0x3230b4[_0x14dc('0x4c9')](_0x1e1d14[_0x14dc('0x472')] + '\x20' + _0x1e1d14['stop'] + '%');
                });
                if (_0x53463a[_0x14dc('0x51c')][_0x14dc('0x4f8')] == !![]) css = _0x14dc('0x51d');
                if (_0x53463a[_0x14dc('0x51e')][_0x14dc('0x4f8')] == _0x14dc('0x1')) {
                    _0x2995b7['push'](_0x53463a['direction'][_0x14dc('0x47a')] + _0x14dc('0x51f'));
                    _0x2995b7[_0x14dc('0x4c9')](_0x3230b4);
                    css += 'linear-gradient(' + _0x2995b7[_0x14dc('0x49c')](',\x20') + ')';
                    this['gradients'][_0x4de157][_0x14dc('0x4be')][_0x14dc('0x50d')] = css;
                }
                if (_0x53463a[_0x14dc('0x51e')][_0x14dc('0x4f8')] == _0x14dc('0x520')) {
                    var _0x359a6d = _0x53463a[_0x14dc('0x521')];
                    var _0x300807 = '';
                    var _0x2c6f77 = '';
                    if (_0x53463a['shape'][_0x14dc('0x4f8')] == _0x14dc('0x504')) {
                        _0x2c6f77 = _0x53463a[_0x14dc('0x522')][_0x14dc('0x504')];
                        _0x300807 = _0x2c6f77[_0x14dc('0x481')][_0x14dc('0x47a')] + '%\x20' + _0x2c6f77[_0x14dc('0x489')]['amount'] + '%';
                    } else {
                        _0x2c6f77 = _0x53463a[_0x14dc('0x522')]['circle'];
                        _0x300807 = _0x2c6f77[_0x14dc('0x49a')][_0x14dc('0x47a')] + 'px';
                    }
                    var _0x214752 = _0x359a6d[_0x14dc('0x523')][_0x14dc('0x47a')] + '%\x20' + _0x359a6d['vertical'][_0x14dc('0x47a')] + '%';
                    _0x2995b7[_0x14dc('0x4c9')](_0x3230b4);
                    css += _0x14dc('0x524') + _0x53463a['shape']['selected'] + '\x20' + _0x300807 + _0x14dc('0x525') + _0x214752 + ',\x20' + _0x2995b7[_0x14dc('0x49c')](',\x20') + ')';
                    this['gradients'][_0x4de157][_0x14dc('0x4be')][_0x14dc('0x50d')] = css;
                }
            });
        },
        'addGradient': function() {
            var _0x1f5a69 = this[_0x14dc('0x4c0')](this[_0x14dc('0x4d8')]);
            this[_0x14dc('0x4c5')]['push'](_0x1f5a69);
            this[_0x14dc('0x4c7')](this[_0x14dc('0x4c5')][_0x14dc('0x49a')] - 0x1);
        },
        'resetGradient': function() {
            var _0x472703 = this[_0x14dc('0x4c0')](this[_0x14dc('0x4d8')]);
            Object[_0x14dc('0x510')](this[_0x14dc('0x526')][_0x14dc('0x4c5')][this[_0x14dc('0x507')]], _0x472703);
        },
        'deleteColorStop': function(_0x30ef02) {
            this[_0x14dc('0x4c5')][this['currentGradient']][_0x14dc('0x4de')][_0x14dc('0x4e9')](_0x30ef02, 0x1);
        },
        'setGradient': function(_0x5e4d32) {
            this['currentGradient'] = _0x5e4d32;
            this['setColor'](0x0);
        },
        'showGradient': function(_0x15c5e2) {
            var _0x40f9ee = this[_0x14dc('0x4c5')][_0x15c5e2];
            var _0x2cb873 = _0x40f9ee[_0x14dc('0x51e')][_0x14dc('0x4f8')];
            var _0x11110a = _0x40f9ee[_0x14dc('0x527')][_0x14dc('0x4f8')];
            var _0x22eb61 = _0x40f9ee[_0x14dc('0x4be')][_0x14dc('0x50d')];
            if (_0x2cb873 == _0x14dc('0x520') && _0x11110a == _0x14dc('0x503')) {
                var _0x2e44d9 = _0x40f9ee[_0x14dc('0x522')][_0x14dc('0x503')][_0x14dc('0x49a')][_0x14dc('0x47a')];
                var _0x56caf8 = _0x2e44d9 * 0x32 / 0x3e8;
                var _0x22eb61 = _0x22eb61['replace'](_0x2e44d9 + 'px', _0x56caf8 + 'px');
            }
            return {
                'background-image': _0x22eb61
            };
        },
        'toggleGradient': function(_0x3f9983) {
            var _0x15f032 = this[_0x14dc('0x4c5')][_0x3f9983]['status'];
            this['gradients'][_0x3f9983][_0x14dc('0x4e5')] = _0x15f032 == 'show' ? 'hide' : _0x14dc('0x47d');
        },
        'deleteGradient': function(_0x424853) {
            var _0x1fb8a1 = this[_0x14dc('0x4c5')][_0x14dc('0x49a')];
            if (_0x1fb8a1 < 0x2) return;
            this[_0x14dc('0x4c5')][_0x14dc('0x4e9')](_0x424853, 0x1);
            _0x1fb8a1 = this['gradients'][_0x14dc('0x49a')];
            this['setGradient'](_0x1fb8a1 - 0x1);
            if (_0x1fb8a1 == 0x1) this['gradients'][this[_0x14dc('0x507')]][_0x14dc('0x4e5')] = 'show';
        },
        'setColor': function(_0x6839a2) {
            this[_0x14dc('0x528')] = _0x6839a2;
            this['currentColor'] = this['gradients'][this[_0x14dc('0x507')]][_0x14dc('0x4de')][_0x6839a2];
        },
        'updatePicker': function(_0x59237c) {
            if (_0x59237c[_0x14dc('0x4ee')]['a'] == 0x1) {
                this[_0x14dc('0x529')]['value'] = _0x59237c['hex'];
            } else {
                this[_0x14dc('0x529')]['value'] = _0x14dc('0x52a') + _0x59237c['rgba']['r'] + ',\x20' + _0x59237c[_0x14dc('0x4ee')]['g'] + ',\x20' + _0x59237c[_0x14dc('0x4ee')]['b'] + ',\x20' + _0x59237c[_0x14dc('0x4ee')]['a'] + ')';
            }
        },
        'applyGradient': function(_0x3f3b70) {
            var _0x5cd5bd = this[_0x14dc('0x4c5')][this[_0x14dc('0x507')]];
            var _0xfa88d8 = this[_0x14dc('0x4c0')](this['presets'][_0x3f3b70]);
            var _0x2e6ad5 = _0xfa88d8[_0x14dc('0x51e')];
            if (_0x2e6ad5 == 'linear') _0x5cd5bd[_0x14dc('0x479')]['amount'] = _0xfa88d8[_0x14dc('0x479')];
            if (_0x2e6ad5 == 'radial') {
                _0x5cd5bd['position'][_0x14dc('0x52b')][_0x14dc('0x47a')] = _0xfa88d8['vertical'];
                _0x5cd5bd[_0x14dc('0x521')][_0x14dc('0x523')][_0x14dc('0x47a')] = _0xfa88d8[_0x14dc('0x523')];
                _0x5cd5bd['shape'][_0x14dc('0x4f8')] = _0xfa88d8[_0x14dc('0x527')];
            }
            _0x5cd5bd[_0x14dc('0x51e')][_0x14dc('0x4f8')] = _0x2e6ad5;
            _0x5cd5bd[_0x14dc('0x4de')] = _0xfa88d8['colors'];
            this[_0x14dc('0x519')](0x0);
        },
        'copyCSS': function() {
            var _0x5d1a5e = _0x14dc('0x52c') + this[_0x14dc('0x4be')][_0x14dc('0x50d')] + ';';
            var _0x78e569 = this;
            if (navigator[_0x14dc('0x52d')] != undefined) {
                navigator[_0x14dc('0x52d')]['writeText'](_0x5d1a5e)[_0x14dc('0x52e')](function() {
                    _0x78e569[_0x14dc('0x50e')] = _0x14dc('0x52f');
                }, function(_0x1d2643) {
                    _0x78e569[_0x14dc('0x50e')] = '失败\x20:(';
                });
            } else if (document['queryCommandSupported'] && document[_0x14dc('0x530')](_0x14dc('0x531'))) {
                var _0x3150ab = document[_0x14dc('0x532')]('textarea');
                _0x3150ab[_0x14dc('0x533')] = _0x5d1a5e;
                _0x3150ab[_0x14dc('0x4be')][_0x14dc('0x521')] = _0x14dc('0x534');
                document['body'][_0x14dc('0x535')](_0x3150ab);
                _0x3150ab[_0x14dc('0x536')]();
                try {
                    _0x78e569[_0x14dc('0x50e')] = _0x14dc('0x52f');
                    return document[_0x14dc('0x537')]('copy');
                } catch (_0x1c949c) {
                    _0x78e569[_0x14dc('0x50e')] = _0x14dc('0x538');
                    return ![];
                } finally {
                    document[_0x14dc('0x539')][_0x14dc('0x53a')](_0x3150ab);
                }
            }
        }
    },
    'created'() {
        this[_0x14dc('0x53b')]();
        this['setColor'](0x0);
    }
});