/* global chrome */

// devtools.js

// 创建扩展面板
chrome.devtools.panels.create(
  "HttpExporter", // 面板名
  "logo.png", // 面板icon
  "index.html#/httpExporter", // 面板页面
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