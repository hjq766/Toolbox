import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, on } from '../../public/scripts/utils/dom.js';
import { escapeHtml } from '../../public/scripts/utils/dom.js';
import { mountBrowseTabs } from '../_shared/browse-tabs.js';

mountToolHeader();

const searchEl = $('[data-search]');
const listEl = $('[data-list]');
const countEl = $('[data-count]');
let activeCat = 'all';

const TAB_ITEMS = [
  { id: 'all', label: '全部' },
  { id: '1', label: '1xx 信息' },
  { id: '2', label: '2xx 成功' },
  { id: '3', label: '3xx 重定向' },
  { id: '4', label: '4xx 客户端' },
  { id: '5', label: '5xx 服务器' },
];

const CODES = [
  { code: 100, name: 'Continue', desc: '服务器已收到请求头，客户端应继续发送请求体', zh: '继续' },
  { code: 101, name: 'Switching Protocols', desc: '服务器同意切换协议（如 WebSocket）', zh: '切换协议' },
  { code: 102, name: 'Processing', desc: '服务器已收到并正在处理请求（WebDAV）', zh: '处理中' },
  { code: 103, name: 'Early Hints', desc: '允许客户端预加载资源', zh: '早期提示' },
  { code: 200, name: 'OK', desc: '请求成功，返回所请求的数据', zh: '成功' },
  { code: 201, name: 'Created', desc: '请求成功并在服务器上创建了新资源', zh: '已创建' },
  { code: 202, name: 'Accepted', desc: '请求已接受，但尚未处理完成', zh: '已接受' },
  { code: 203, name: 'Non-Authoritative Information', desc: '请求成功但返回的是来自第三方的信息', zh: '非权威信息' },
  { code: 204, name: 'No Content', desc: '请求成功但无返回内容', zh: '无内容' },
  { code: 205, name: 'Reset Content', desc: '请求成功，客户端应重置文档视图', zh: '重置内容' },
  { code: 206, name: 'Partial Content', desc: '服务器返回部分资源（范围请求）', zh: '部分内容' },
  { code: 207, name: 'Multi-Status', desc: '返回多个状态（WebDAV）', zh: '多状态' },
  { code: 208, name: 'Already Reported', desc: '已列出的成员不再重复列出（WebDAV）', zh: '已报告' },
  { code: 226, name: 'IM Used', desc: '服务器已完成对资源的增量请求', zh: 'IM 已使用' },
  { code: 300, name: 'Multiple Choices', desc: '请求的资源有多种表示，客户端需选择', zh: '多种选择' },
  { code: 301, name: 'Moved Permanently', desc: '资源已永久迁移到新 URL（SEO 推荐）', zh: '永久重定向' },
  { code: 302, name: 'Found', desc: '资源临时迁移，客户端继续使用原 URL', zh: '临时重定向' },
  { code: 303, name: 'See Other', desc: '应使用 GET 方法请求另一个 URI', zh: '查看其他' },
  { code: 304, name: 'Not Modified', desc: '资源未修改，使用缓存版本', zh: '未修改（缓存）' },
  { code: 307, name: 'Temporary Redirect', desc: '临时重定向，保持请求方法不变', zh: '临时重定向' },
  { code: 308, name: 'Permanent Redirect', desc: '永久重定向，保持请求方法不变', zh: '永久重定向' },
  { code: 400, name: 'Bad Request', desc: '请求语法错误，服务器无法理解', zh: '错误请求' },
  { code: 401, name: 'Unauthorized', desc: '需要身份认证（未登录）', zh: '未授权' },
  { code: 402, name: 'Payment Required', desc: '保留状态码，通常用于付费接口', zh: '需要付费' },
  { code: 403, name: 'Forbidden', desc: '服务器拒绝执行该请求（无权限）', zh: '禁止访问' },
  { code: 404, name: 'Not Found', desc: '请求的资源不存在', zh: '未找到' },
  { code: 405, name: 'Method Not Allowed', desc: '请求方法不被允许', zh: '方法不允许' },
  { code: 406, name: 'Not Acceptable', desc: '服务器无法根据请求的内容特性完成请求', zh: '不可接受' },
  { code: 407, name: 'Proxy Authentication Required', desc: '需要代理身份认证', zh: '需要代理认证' },
  { code: 408, name: 'Request Timeout', desc: '请求超时', zh: '请求超时' },
  { code: 409, name: 'Conflict', desc: '请求与资源当前状态冲突', zh: '冲突' },
  { code: 410, name: 'Gone', desc: '资源已永久删除', zh: '已删除' },
  { code: 411, name: 'Length Required', desc: '缺少 Content-Length 头', zh: '需要内容长度' },
  { code: 412, name: 'Precondition Failed', desc: '请求头中的先决条件不满足', zh: '前提条件失败' },
  { code: 413, name: 'Payload Too Large', desc: '请求体过大', zh: '负载过大' },
  { code: 414, name: 'URI Too Long', desc: '请求 URI 过长', zh: 'URI 过长' },
  { code: 415, name: 'Unsupported Media Type', desc: '不支持的媒体类型', zh: '不支持的媒体类型' },
  { code: 416, name: 'Range Not Satisfiable', desc: '请求的范围无效', zh: '范围不满足' },
  { code: 418, name: "I'm a Teapot", desc: '我是茶壶（RFC 2324 愚人节彩蛋）', zh: '我是茶壶' },
  { code: 422, name: 'Unprocessable Entity', desc: '请求格式正确但语义错误（WebDAV）', zh: '不可处理的实体' },
  { code: 425, name: 'Too Early', desc: '服务器不愿冒险处理可能重放的请求', zh: '太早' },
  { code: 426, name: 'Upgrade Required', desc: '需要升级协议', zh: '需要升级' },
  { code: 429, name: 'Too Many Requests', desc: '请求频率超限（限流）', zh: '请求过多' },
  { code: 431, name: 'Request Header Fields Too Large', desc: '请求头字段过大', zh: '请求头过大' },
  { code: 451, name: 'Unavailable For Legal Reasons', desc: '因法律原因不可用', zh: '法律原因不可用' },
  { code: 500, name: 'Internal Server Error', desc: '服务器内部错误', zh: '服务器内部错误' },
  { code: 501, name: 'Not Implemented', desc: '服务器不支持该请求方法', zh: '未实现' },
  { code: 502, name: 'Bad Gateway', desc: '网关或代理从上游服务器收到无效响应', zh: '网关错误' },
  { code: 503, name: 'Service Unavailable', desc: '服务器暂时不可用（维护/过载）', zh: '服务不可用' },
  { code: 504, name: 'Gateway Timeout', desc: '网关或代理等待上游超时', zh: '网关超时' },
  { code: 505, name: 'HTTP Version Not Supported', desc: '不支持请求的 HTTP 版本', zh: '版本不支持' },
  { code: 507, name: 'Insufficient Storage', desc: '存储空间不足（WebDAV）', zh: '存储空间不足' },
  { code: 508, name: 'Loop Detected', desc: '检测到无限循环（WebDAV）', zh: '检测到循环' },
  { code: 511, name: 'Network Authentication Required', desc: '需要网络认证（如 Wi-Fi 登录页）', zh: '需要网络认证' },
];

mountBrowseTabs($('[data-tabs]'), {
  items: TAB_ITEMS,
  getActive: () => activeCat,
  onSelect: id => {
    activeCat = id;
    render();
  },
});

function render() {
  const keyword = searchEl.value.trim().toLowerCase();

  const filtered = CODES.filter(item => {
    if (activeCat !== 'all' && String(item.code)[0] !== activeCat) return false;
    if (keyword) {
      const haystack = `${item.code} ${item.name} ${item.desc} ${item.zh}`.toLowerCase();
      return haystack.includes(keyword);
    }
    return true;
  });

  countEl.textContent = `${filtered.length} 条`;

  listEl.innerHTML = filtered.map(item => `
    <div class="result-row" data-copy-val="${item.code} ${item.name}" style="cursor:pointer">
      <span class="u-mono u-strong" style="min-width:40px">${item.code}</span>
      <span class="u-strong">${escapeHtml(item.name)}</span>
      <span class="u-muted">${escapeHtml(item.zh)}</span>
      <span class="u-muted" style="margin-left:auto">${escapeHtml(item.desc)}</span>
    </div>
  `).join('');
}

render();

on(searchEl, 'input', render);
