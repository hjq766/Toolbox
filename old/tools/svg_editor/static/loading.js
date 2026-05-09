(function () {
    // 只加载主题设置，不自动加载上次的画布内容
    const isDark = localStorage.getItem("md-darkmode");
    if (!isDark && isDark !== null) document.body.classList.add("inverted");
    
    // 注释掉自动加载画布内容的功能
    // const canvasContent = localStorage.getItem("md-canvasContent");
    // if (!canvasContent) return;
    // const parser = new DOMParser();
    // const doc = parser.parseFromString(canvasContent, "image/svg+xml");
    // const workarea = document.getElementById("workarea");
    // workarea.appendChild(doc.documentElement);
    // const svgCanvas = document.getElementById("svgcanvas");
    // const canvasTitle = localStorage.getItem("md-canvasTitle");
    // svgCanvas.setAttribute("title", canvasTitle ? "Loading " + canvasTitle : "Loading Drawing");
})();