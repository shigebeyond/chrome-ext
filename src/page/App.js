import React, { Component } from 'react';
import { Routes, Route, Outlet, Link } from "react-router-dom";

// import './App.css';
import TabList from './TabList'
import OptionForm from './OptionForm'
import HttpExporter from './HttpExporter'

// 路由参考 https://github.com/remix-run/react-router/blob/dev/examples/basic/src/App.tsx
export default function App() {
  return (
    <Routes>
      <Route path="/tabList" element={<TabList />} />
      <Route path="/optionForm" element={<OptionForm />} />
      <Route path="/httpExporter" element={<HttpExporter />} />
      <Route path="*" element={<Index />} />
    </Routes>
  );
}


function Index() {
  return (
    <div>
      <h2>入口</h2>
      <p>
        <Link to="/tabList">备份标签页管理</Link>
      </p>
      <p>
        <Link to="/optionForm">选项配置</Link>
      </p>
      <p>
        <Link to="/httpExporter">测试模式下的devtools中httpExporter面板</Link>
      </p>
    </div>
  );
}