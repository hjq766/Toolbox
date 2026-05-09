(function(){
  // 独立运行不要登录设置（手机端）
  if (window.top === window) return;
  var SAVE_BTN_CHECK_LIST = [
    function (content) {
        return /另存为|导出|存檔為|轉存為/g.test(content);
    },
    function (content) {
      return [
        'png', 'jpg', 'svg', 'gif', 'pdf', 'emf',
        'webp', 'bmp', 'ppm', 'tiff', 'ico', 'dds'
      ].some(function(type) {
        return content.indexOf(type) !== -1;
      });
    },
  ];

  function userClick(event) {
    // 判断用法是否已经登录 && 点击按钮触发源头是否在保存按钮的目录下
    var target = event.target;
    var saveBtnsContainer = document.querySelector('.cmanager');
    var htmlContent = target.innerHTML;
    if (window.__GAODING_USER_LOGIN || !saveBtnsContainer || !saveBtnsContainer.contains(target)) {
      return;
    }

    // 匹配指定按钮关键关键字
    var isTarget = SAVE_BTN_CHECK_LIST.some(function check(checkFn) {
      return checkFn(htmlContent.toLocaleLowerCase());
    });

    if (isTarget) {
      event.preventDefault();
      event.stopPropagation();
      window.top.postMessage('login', '*');
    }
  };

  document.body.addEventListener('click', userClick, true);

  // data 要求是字符串哟~，和 photopea 监听的 data 类型就是 string 的不然会报错！！！
  function handlerParentMessage({ data }) {
    if (data === 'user-init') {
      window.__GAODING_USER_LOGIN = true;
      document.body.removeEventListener('click', userClick, true);
      window.removeEventListener('message', handlerParentMessage, false);
    }
  }

  window.addEventListener('message', handlerParentMessage, false);


  
}());


setTimeout( function(){
	var topbar = document.getElementsByClassName("topbar")[0];

	// 第一个按钮：返回工具箱
	var node1 = document.createElement("button");
	node1.innerText = "返回工具箱";
	node1.addEventListener("click", function () {
		window.open("https://tools.jqnest.top", "_blank");
	});
	topbar.appendChild(node1);

	// 第二个按钮：示例按钮
	var node2 = document.createElement("button");
	node2.innerText = "极趣导航";
	node2.addEventListener("click", function () {
		window.open("https://jqnav.top", "_blank");
	});
	topbar.appendChild(node2);

}, 2 * 1000 );
