class SvgEditor {
    constructor() {
        this.canvas = document.getElementById('svgCanvas');
        this.mainGroup = document.getElementById('mainGroup');
        this.currentTool = 'select';
        this.selectedElement = null;
        this.isDrawing = false;
        this.startPoint = { x: 0, y: 0 };
        this.undoStack = [];
        this.redoStack = [];
        this.clipboard = null;
        this.zoomLevel = 100;
        
        this.initializeTools();
        this.initializeEventListeners();
        this.initializeShortcuts();
        this.updateLayersList();
    }

    // 初始化工具
    initializeTools() {
        // 工具按钮点击事件
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.setCurrentTool(btn.dataset.tool);
            });
        });

        // 颜色和样式控制
        this.initializeStyleControls();
        
        // 画布控制
        this.initializeCanvasControls();
        
        // 操作按钮
        this.initializeActionButtons();
    }

    // 初始化样式控制
    initializeStyleControls() {
        // 颜色选择器
        document.getElementById('fillColor').addEventListener('change', (e) => {
            if (this.selectedElement) {
                this.selectedElement.setAttribute('fill', e.target.value);
                this.saveState();
            }
        });

        document.getElementById('strokeColor').addEventListener('change', (e) => {
            if (this.selectedElement) {
                this.selectedElement.setAttribute('stroke', e.target.value);
                this.saveState();
            }
        });

        // 描边宽度
        document.getElementById('strokeWidth').addEventListener('change', (e) => {
            if (this.selectedElement) {
                this.selectedElement.setAttribute('stroke-width', e.target.value);
                this.saveState();
            }
        });

        // 透明度
        document.getElementById('opacity').addEventListener('change', (e) => {
            if (this.selectedElement) {
                this.selectedElement.setAttribute('opacity', e.target.value);
                this.saveState();
            }
        });
    }

    // 初始化画布控制
    initializeCanvasControls() {
        // 缩放控制
        document.getElementById('zoomIn').addEventListener('click', () => this.zoom(1.2));
        document.getElementById('zoomOut').addEventListener('click', () => this.zoom(0.8));
        document.getElementById('zoomReset').addEventListener('click', () => this.resetZoom());
    }

    // 初始化操作按钮
    initializeActionButtons() {
        // 删除按钮
        document.getElementById('deleteBtn').addEventListener('click', () => {
            if (this.selectedElement) {
                this.deleteElement();
            }
        });

        // 清空按钮
        document.getElementById('clearBtn').addEventListener('click', () => {
            if (confirm('确定要清空画布吗？')) {
                this.clearCanvas();
            }
        });

        // 导出按钮
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportSvg();
        });
    }

    // 初始化事件监听
    initializeEventListeners() {
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', () => this.handleMouseUp());
        
        // 属性面板输入事件
        this.initializePropertyInputs();
    }

    // 初始化快捷键
    initializeShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key.toLowerCase()) {
                    case 'z': 
                        e.preventDefault();
                        if (e.shiftKey) this.redo();
                        else this.undo();
                        break;
                    case 'y':
                        e.preventDefault();
                        this.redo();
                        break;
                    case 'c':
                        e.preventDefault();
                        this.copy();
                        break;
                    case 'v':
                        e.preventDefault();
                        this.paste();
                        break;
                }
            } else {
                switch(e.key.toLowerCase()) {
                    case 'v': this.setCurrentTool('select'); break;
                    case 'r': this.setCurrentTool('rect'); break;
                    case 'c': this.setCurrentTool('circle'); break;
                    case 'e': this.setCurrentTool('ellipse'); break;
                    case 'l': this.setCurrentTool('line'); break;
                    case 'p': this.setCurrentTool('polyline'); break;
                    case 'a': this.setCurrentTool('path'); break;
                    case 't': this.setCurrentTool('text'); break;
                    case 'delete':
                        e.preventDefault();
                        this.deleteElement();
                        break;
                }
            }
        });
    }

    // 设置当前工具
    setCurrentTool(tool) {
        this.currentTool = tool;
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tool === tool);
        });
    }

    // 处理鼠标事件
    handleMouseDown(e) {
        const point = this.getMousePosition(e);
        this.startPoint = point;
        this.isDrawing = true;

        switch(this.currentTool) {
            case 'select':
                this.selectElementAtPoint(point);
                break;
            case 'rect':
                this.startDrawingRect(point);
                break;
            case 'circle':
                this.startDrawingCircle(point);
                break;
            case 'ellipse':
                this.startDrawingEllipse(point);
                break;
            case 'line':
                this.startDrawingLine(point);
                break;
            case 'polyline':
                this.addPolylinePoint(point);
                break;
            case 'path':
                this.startDrawingPath(point);
                break;
            case 'text':
                this.addText(point);
                break;
        }
    }

    // 其他方法实现...
    // (由于代码较长，这里省略了具体图形绘制、编辑、复制粘贴等方法的实现)
    // 需要我继续提供完整实现吗？
}

// 初始化编辑器
window.addEventListener('DOMContentLoaded', () => {
    new SvgEditor();
}); 