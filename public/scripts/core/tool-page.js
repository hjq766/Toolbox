// 工具页外壳：从 body[data-tool-slug] 读取 slug，挂载统一的页面 header。
// 历史名 mountToolHeader 保留向后兼容，内部直接走 page-header.js。
import { mountPageHeader } from '../components/page-header.js';
import { findTool } from '../data/tools.js';

export function mountToolHeader() {
  const slug = document.body.dataset.toolSlug;
  if (!slug) return null;
  return mountPageHeader({ slug });
}

// 可选导出，便于外部直接取元数据
export { findTool };
