import React, { Component } from 'react';
import { Routes, Route, Outlet, Link } from "react-router-dom";

// import './App.css';
import TabList from './TabList'
import HttpPanel from './HttpPanel'

// 路由参考 https://github.com/remix-run/react-router/blob/dev/examples/basic/src/App.tsx
export default function App() {
  return (
    <Routes>
      <Route path="/tabList" element={<TabList />} />
      <Route path="/httpPanel" element={<HttpPanel />} />
      <Route path="*" element={<Index />} />
    </Routes>
  );
}


function Index() {
  return (
    <div>
      <h2>入口</h2>
      <p>
        <Link to="/tabList">跳转到: 备份标签页管理</Link>
      </p>
      <p>
        <Link to="/httpPanel">跳转到: 选项配置</Link>
      </p>
    </div>
  );
}