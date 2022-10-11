import $ from "jquery";
import {copyTxt} from './copy';
import modal from '../lib/modal';

// 暴露方法给html调用, 要挂到window属性中, 否则在background.js(menu.js)中通过 `chrome.tabs.executeScript()` 是无法调用方法
window.$ = $;
window.copyTxt = copyTxt;
window.modal = modal;
