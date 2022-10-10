// devtools.js
// 创建扩展面板
chrome.devtools.panels.create(
  // 扩展面板显示名称
  "HttpBoot",
  // 扩展面板icon，并不展示
  "logo.png",
  // 扩展面板页面
  "index.html#/httpPanel",
  function (panel) {
    console.log("自定义HttpBoot面板创建成功！");
  }
);

// 创建自定义侧边栏
/*chrome.devtools.panels.elements.createSidebarPane(
  "Sidebar",
  function (sidebar) {
    sidebar.setPage("sidebar.html");
  }
);*/