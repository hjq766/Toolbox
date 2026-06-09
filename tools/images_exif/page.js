import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, on } from '../../public/scripts/utils/dom.js';
import { copyText } from '../../public/scripts/utils/clipboard.js';
import { showToast } from '../../public/scripts/components/toast.js';
import { escapeHtml } from '../../public/scripts/utils/dom.js';
import { downloadBlob } from '../../public/scripts/utils/download.js';
import { initUploadZone } from '../_shared/upload-zone.js';
import exifr from 'https://cdn.jsdelivr.net/npm/exifr@7.1.2/dist/full.esm.mjs';

mountToolHeader();

/* ======== DOM ======== */
const dropEl      = $('[data-drop]');
const resultEl    = $('[data-result]');
const imgPreview  = $('[data-img-preview]');
const fileInfo    = $('[data-file-info]');
const basicPanel  = $('[data-basic-panel]');
const cameraPanel = $('[data-camera-panel]');
const cameraStats = $('[data-camera-stats]');
const cameraDetail = $('[data-camera-detail]');
const gpsPanel    = $('[data-gps-panel]');
const allPanel    = $('[data-all-panel]');
const emptyPanel  = $('[data-empty-panel]');
const emptyTitle  = $('[data-empty-title]');
const emptyDesc   = $('[data-empty-desc]');
const basicEl     = $('[data-basic]');
const gpsEl       = $('[data-gps]');
const allEl       = $('[data-all]');
const tagCountEl  = $('[data-tag-count]');
const summaryPanel = $('[data-summary-panel]');
const summaryEl   = $('[data-summary]');
const copyGpsBtn  = $('[data-action="copy-gps"]');
const openMapLink = $('[data-action="open-map"]');
const privacyHint = $('[data-privacy-hint]');

let allExifText = '';
let previewUrl = '';
let currentFile = null;
let currentTags = null;
let currentGps = null;

// exifr 字段名 → 中文名称映射（尽量全覆盖）
const TAG_CN = {
  // 基本
  Make: '相机品牌', Model: '相机型号', Software: '软件', ModifyDate: '修改时间',
  DateTime: '修改时间', DateTimeOriginal: '拍摄时间', DateTimeDigitized: '数字化时间',
  CreateDate: '创建时间', OffsetTime: '时区偏移', OffsetTimeOriginal: '拍摄时区',
  ImageWidth: '图片宽度', ImageHeight: '图片高度',
  ExifImageWidth: '图片宽度', ExifImageHeight: '图片高度',
  Orientation: '方向', ColorSpace: '色彩空间',
  Artist: '作者', Copyright: '版权', ImageDescription: '描述',
  // 镜头 & 相机
  FocalLength: '焦距', FocalLengthIn35mmFormat: '等效焦距', FocalLengthIn35mmFilm: '等效焦距',
  FNumber: '光圈', ApertureValue: '光圈值', MaxApertureValue: '最大光圈',
  ExposureTime: '快门速度', ShutterSpeedValue: '快门速度值',
  ISO: 'ISO', ISOSpeedRatings: 'ISO',
  ExposureBiasValue: '曝光补偿', ExposureMode: '曝光模式', ExposureProgram: '曝光程序',
  MeteringMode: '测光模式', WhiteBalance: '白平衡', Flash: '闪光灯',
  LensModel: '镜头型号', LensMake: '镜头品牌', LensSerialNumber: '镜头序列号',
  LensInfo: '镜头信息', Lens: '镜头',
  BodySerialNumber: '机身序列号', CameraSerialNumber: '相机序列号',
  // 场景 & 图像
  SceneCaptureType: '场景类型', SceneType: '场景模式', SensingMethod: '传感方式',
  FileSource: '文件来源', CustomRendered: '自定义渲染',
  Contrast: '对比度', Saturation: '饱和度', Sharpness: '锐度',
  DigitalZoomRatio: '数码变焦', SubjectDistance: '对焦距离',
  SubjectDistanceRange: '对焦距离范围', FocusMode: '对焦模式',
  BrightnessValue: '亮度值', LightSource: '光源',
  // 分辨率 & 格式
  XResolution: 'X分辨率', YResolution: 'Y分辨率', ResolutionUnit: '分辨率单位',
  BitsPerSample: '位深度', Compression: '压缩方式', PhotometricInterpretation: '色彩模式',
  SamplesPerPixel: '每像素采样', PlanarConfiguration: '平面配置',
  YCbCrSubSampling: '色度子采样', YCbCrPositioning: 'YCbCr定位',
  ComponentsConfiguration: '分量配置', CompressedBitsPerPixel: '压缩位/像素',
  // GPS
  latitude: '纬度', longitude: '经度',
  GPSAltitude: '海拔', GPSLatitude: 'GPS纬度', GPSLongitude: 'GPS经度',
  GPSLatitudeRef: '纬度方向', GPSLongitudeRef: '经度方向',
  GPSAltitudeRef: '海拔参考', GPSTimeStamp: 'GPS时间', GPSDateStamp: 'GPS日期',
  GPSVersionID: 'GPS版本', GPSMapDatum: '地图基准', GPSImgDirection: '图像方向',
  GPSImgDirectionRef: '方向参考', GPSSpeed: 'GPS速度', GPSSpeedRef: '速度单位',
  // XMP / IPTC
  Rating: '评分', Label: '标签', Title: '标题', Subject: '主题',
  Description: '描述', Creator: '创作者', Rights: '权利',
  // 其他常见
  ExifVersion: 'EXIF版本', FlashpixVersion: 'Flashpix版本',
  InteropIndex: '互操作索引', InteropVersion: '互操作版本',
  RelatedImageWidth: '关联图宽', RelatedImageHeight: '关联图高',
  ThumbnailOffset: '缩略图偏移', ThumbnailLength: '缩略图大小',
  CFAPattern: 'CFA图案', GainControl: '增益控制',
  FocalPlaneXResolution: '焦平面X分辨率', FocalPlaneYResolution: '焦平面Y分辨率',
  FocalPlaneResolutionUnit: '焦平面分辨率单位',
  ImageUniqueID: '图像唯一ID', SerialNumber: '序列号',
  OwnerName: '所有者', UserComment: '用户备注',
};

/* ======== 上传 ======== */
initUploadZone({
  dropEl,
  fileEl: $('[data-file]'),
  onFiles(files) { processFile(files[0]); },
  onDelete: clearImage,
});

async function processFile(file) {
  currentFile = file;
  currentTags = null;
  currentGps = null;
  allExifText = '';
  fileInfo.textContent = `${file.name} · ${formatSize(file.size)}`;
  resetPanels();
  renderSummary(file, null, null);

  // 切换视图：隐藏上传区，显示结果区
  dropEl.hidden = true;
  resultEl.hidden = false;

  // 图片预览：先尝试原始文件，失败则提取内嵌缩略图（适用于 RAW/HEIC 等浏览器不支持的格式）
  const objUrl = URL.createObjectURL(file);
  setPreviewUrl(objUrl);
  imgPreview.hidden = false;
  imgPreview.onerror = async () => {
    try {
      const thumbUrl = await exifr.thumbnailUrl(file);
      if (thumbUrl) setPreviewUrl(thumbUrl);
      else imgPreview.hidden = true;
    } catch { imgPreview.hidden = true; }
  };
  imgPreview.onload = () => { imgPreview.hidden = false; };

  try {
    const tags = await exifr.parse(file, { tiff: true, exif: true, gps: true, xmp: true, icc: false, iptc: true });
    currentTags = tags || {};
    currentGps = getGps(tags || {});
    renderSummary(file, tags || {}, currentGps);
    updateGpsActions(currentGps);

    if (!tags || Object.keys(tags).length === 0) {
      showToast('未找到 EXIF 信息', { type: 'warn' });
      showEmpty('未找到 EXIF 信息', '这张图片可能已经被压缩、截图或平台处理过，元数据已被移除。');
      return;
    }

    renderBasic(tags, file);
    renderCamera(tags);
    renderGPS(tags);
    renderAll(tags);
    if (window.refreshIcons) window.refreshIcons(resultEl);
  } catch (e) {
    showToast('EXIF 解析失败: ' + e.message, { type: 'error' });
    showEmpty('EXIF 解析失败', '可以换一张原图再试，部分平台下载图会丢失或破坏元数据。');
  }
}

function clearImage() {
  revokePreviewUrl();
  allExifText = '';
  currentFile = null;
  currentTags = null;
  currentGps = null;
  imgPreview.removeAttribute('src');
  fileInfo.textContent = '';
  dropEl.hidden = false;
  resultEl.hidden = true;
  resetPanels();
}

function resetPanels() {
  basicPanel.hidden = true;
  cameraPanel.hidden = true;
  gpsPanel.hidden = true;
  allPanel.hidden = true;
  emptyPanel.hidden = true;
  summaryPanel.hidden = true;
  updateGpsActions(null);
}

function setPreviewUrl(url) {
  revokePreviewUrl();
  previewUrl = url;
  imgPreview.src = url;
}

function revokePreviewUrl() {
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  previewUrl = '';
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function row(label, value) {
  if (value == null || value === '') return '';
  return `<div class="result-row"><span class="u-muted">${label}</span><span>${escapeHtml(String(value))}</span></div>`;
}

function stat(label, value) {
  const display = (value != null && value !== '') ? escapeHtml(String(value)) : '—';
  return `<div class="stat"><div class="stat-label">${label}</div><div class="stat-value">${display}</div></div>`;
}

function showEmpty(title, desc) {
  emptyTitle.textContent = title;
  emptyDesc.textContent = desc;
  emptyPanel.hidden = false;
}

function renderSummary(file, tags, gps) {
  summaryPanel.hidden = false;
  const count = tags ? Object.keys(tags).filter(key => tags[key] != null && tags[key] !== '').length : 0;
  const w = tags && (tags.ImageWidth || tags.ExifImageWidth || tags.PixelXDimension);
  const h = tags && (tags.ImageHeight || tags.ExifImageHeight || tags.PixelYDimension);
  const dim = w && h ? `${w} × ${h}` : '—';
  summaryEl.innerHTML = [
    ['文件大小', formatSize(file.size)],
    ['图片尺寸', dim],
    ['标签数量', `${count} 项`],
    ['GPS', gps ? '包含位置' : '未检测到'],
  ].map(([label, value]) => `<div><span>${label}</span><strong>${escapeHtml(value)}</strong></div>`).join('');
  privacyHint.textContent = gps
    ? '检测到 GPS 位置信息。分享图片前建议重新导出一份去除位置信息的副本，避免暴露拍摄地点。'
    : '未检测到 GPS 坐标。仍建议分享前检查作者、设备型号、软件等元数据。';
}

/* ======== 渲染区域 ======== */
function renderBasic(t, file) {
  basicPanel.hidden = false;
  const w = t.ImageWidth || t.ExifImageWidth || t.PixelXDimension;
  const h = t.ImageHeight || t.ExifImageHeight || t.PixelYDimension;
  const dim = w && h ? `${w} × ${h}` : '';
  basicEl.innerHTML = [
    row('文件名', file.name),
    row('文件大小', formatSize(file.size)),
    row('图片尺寸', dim),
    row('日期时间', t.DateTimeOriginal || t.CreateDate || t.DateTime),
    row('色彩空间', t.ColorSpace === 1 ? 'sRGB' : t.ColorSpace === 65535 ? 'Uncalibrated' : t.ColorSpace),
    row('方向', orientationText(t.Orientation)),
    row('软件', t.Software),
    row('描述', t.ImageDescription),
    row('作者', t.Artist),
    row('版权', t.Copyright),
  ].filter(Boolean).join('');
}

function renderCamera(t) {
  const iso = t.ISO || t.ISOSpeedRatings;
  const hasData = t.Make || t.Model || t.FocalLength || t.FNumber || t.ExposureTime || iso;
  cameraPanel.hidden = !hasData;
  if (!hasData) return;

  // 顶部核心参数卡片（始终显示 4 个，缺失显示 —）
  cameraStats.innerHTML = [
    stat('焦距', t.FocalLength ? `${t.FocalLength}mm` : null),
    stat('光圈', t.FNumber ? `f/${t.FNumber}` : null),
    stat('快门', formatShutter(t.ExposureTime) || null),
    stat('ISO', iso),
  ].join('');

  const eqFL = t.FocalLengthIn35mmFormat || t.FocalLengthIn35mmFilm;
  // 下方详细信息
  cameraDetail.innerHTML = [
    row('相机品牌', t.Make),
    row('相机型号', t.Model),
    row('镜头', t.LensModel || t.LensMake),
    row('等效焦距', eqFL ? `${eqFL} mm` : ''),
    row('曝光补偿', t.ExposureBiasValue != null ? `${t.ExposureBiasValue} EV` : ''),
    row('曝光模式', exposureModeText(t.ExposureMode)),
    row('测光模式', meteringText(t.MeteringMode)),
    row('白平衡', t.WhiteBalance === 0 ? '自动' : t.WhiteBalance === 1 ? '手动' : t.WhiteBalance),
    row('闪光灯', t.Flash != null ? (t.Flash & 1 ? '已闪光' : '未闪光') : ''),
  ].filter(Boolean).join('');
}

function renderGPS(t) {
  // exifr returns latitude/longitude as decimal degrees directly
  const gps = getGps(t);
  const lat = gps?.lat;
  const lng = gps?.lng;
  if (lat == null || lng == null) { gpsPanel.hidden = true; return; }
  gpsPanel.hidden = false;
  gpsEl.innerHTML = [
    row('纬度', `${lat.toFixed(6)}°`),
    row('经度', `${lng.toFixed(6)}°`),
    row('海拔', t.GPSAltitude != null ? `${Number(t.GPSAltitude).toFixed(1)} m` : ''),
  ].filter(Boolean).join('');
}

function renderAll(t) {
  allPanel.hidden = false;
  const entries = Object.entries(t).filter(([, v]) => v != null && v !== '');
  tagCountEl.textContent = `${entries.length} 项`;
  allEl.innerHTML = entries.map(([k, v]) => {
    const cn = TAG_CN[k];
    const label = cn ? `${cn}` : k;
    const display = v instanceof Date ? v.toLocaleString('zh-CN') : (typeof v === 'object' ? JSON.stringify(v) : v);
    return row(label, display);
  }).join('');
  allExifText = entries.map(([k, v]) => {
    const cn = TAG_CN[k];
    const label = cn ? `${cn} (${k})` : k;
    const display = v instanceof Date ? v.toLocaleString('zh-CN') : (typeof v === 'object' ? JSON.stringify(v) : v);
    return `${label}: ${display}`;
  }).join('\n');
}

/* ======== 辅助 ======== */
function orientationText(v) {
  const map = { 1: '正常', 2: '水平翻转', 3: '旋转180°', 4: '垂直翻转', 5: '旋转90°+水平翻转', 6: '旋转90°', 7: '旋转270°+水平翻转', 8: '旋转270°' };
  return map[v] || v;
}
function exposureModeText(v) { return v === 0 ? '自动' : v === 1 ? '手动' : v === 2 ? '包围曝光' : v; }
function meteringText(v) {
  const map = { 1: '平均', 2: '中央重点', 3: '点测光', 4: '多区域', 5: '多模式', 6: '局部' };
  return map[v] || v;
}
function formatShutter(v) {
  if (!v) return '';
  if (v >= 1) return `${v} s`;
  return `1/${Math.round(1 / v)} s`;
}
function dmsToDecimal(dms, ref) {
  if (!Array.isArray(dms) || dms.length < 3) return 0;
  let val = dms[0] + dms[1] / 60 + dms[2] / 3600;
  if (ref === 'S' || ref === 'W') val = -val;
  return val;
}

function getGps(t) {
  const lat = t.latitude ?? (t.GPSLatitude ? dmsToDecimal(t.GPSLatitude, t.GPSLatitudeRef) : null);
  const lng = t.longitude ?? (t.GPSLongitude ? dmsToDecimal(t.GPSLongitude, t.GPSLongitudeRef) : null);
  return lat == null || lng == null ? null : { lat, lng };
}

function updateGpsActions(gps) {
  const hasGps = Boolean(gps);
  copyGpsBtn.hidden = !hasGps;
  openMapLink.hidden = !hasGps;
  if (hasGps) openMapLink.href = `https://www.google.com/maps?q=${gps.lat},${gps.lng}`;
  else openMapLink.removeAttribute('href');
}

function downloadJson() {
  if (!currentTags) {
    showToast('没有可导出的 EXIF 数据', { type: 'warn' });
    return;
  }
  const payload = {
    file: currentFile ? { name: currentFile.name, size: currentFile.size, type: currentFile.type } : null,
    gps: currentGps,
    tags: currentTags,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const base = (currentFile?.name || 'exif').replace(/\.[^.]+$/, '').replace(/[\\/:*?"<>|]+/g, '_') || 'exif';
  downloadBlob(blob, `${base}_exif.json`);
}


/* ======== 复制 ======== */
on($('[data-action="copy"]'), 'click', async () => {
  if (!allExifText) { showToast('没有可复制的内容', { type: 'warn' }); return; }
  const ok = await copyText(allExifText);
  showToast(ok ? '已复制全部 EXIF 信息' : '复制失败', { type: ok ? 'success' : 'error' });
});

on($('[data-action="export-json"]'), 'click', downloadJson);

on(copyGpsBtn, 'click', async () => {
  if (!currentGps) { showToast('没有 GPS 坐标', { type: 'warn' }); return; }
  const ok = await copyText(`${currentGps.lat.toFixed(6)}, ${currentGps.lng.toFixed(6)}`);
  showToast(ok ? '已复制 GPS 坐标' : '复制失败', { type: ok ? 'success' : 'error' });
});
