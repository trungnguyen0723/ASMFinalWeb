import { getRootBase } from "../utils/dom.js";

export const RAW_PHONES = [
  {
    id: "apple-iphone-18-pro-max",
    title: "iPhone 18 Pro Max",
    brand: "Apple",
    finish: "Silver Titanium",
    chip: "A20 Pro",
    display: "6.9\" OLED 120Hz",
    camera: "48MP Triple · 5x",
    battery: "4,900 mAh",
    year: 2026,
    score: 4.9,
    price: 1299,
    frame: "#d4d5d8",
    back: "#e5e6e8",
    screenA: "#d9d9dc",
    screenB: "#f2f2f4",
    frontImg: "assets/phones/iphone-18-pro-max-front.png",
    backImg: "assets/phones/iphone-18-pro-max-back.png",
    photoScale: 1.0,
    photoWidth: 0.87,
    cameraLayout: "tri-apple",
    notch: "island",
    note: "Refined silver aerospace frame, next-gen A20 Pro silicon, and redesigned horizontal camera plateau."
  },
  {
    id: "apple-iphone-17",
    title: "iPhone 17",
    brand: "Apple",
    finish: "Lavender",
    chip: "A19",
    display: "6.3\" OLED 120Hz",
    camera: "48MP Dual Fusion",
    battery: "3,700 mAh",
    year: 2025,
    score: 4.8,
    price: 799,
    frame: "#cdb7dd",
    back: "#e1d0ee",
    screenA: "#3c285e",
    screenB: "#d4b8eb",
    frontImg: "assets/phones/iphone-17-front.png",
    backImg: "assets/phones/iphone-17-back.png",
    photoScale: 1.0,
    photoWidth: 0.87,
    cameraLayout: "dual-apple",
    notch: "island",
    note: "ProMotion 120Hz comes to the standard model in a soft Lavender glass-and-aluminum finish."
  },
  {
    id: "apple-iphone-17-pro-max",
    title: "iPhone 17 Pro Max",
    brand: "Apple",
    finish: "Cosmic Orange",
    chip: "A19 Pro",
    display: "6.9\" OLED 120Hz",
    camera: "48MP Pro · 5x",
    battery: "4,820 mAh",
    year: 2025,
    score: 4.9,
    price: 1199,
    frame: "#d86b28",
    back: "#ea7f3b",
    screenA: "#140b05",
    screenB: "#e87832",
    frontImg: "assets/phones/iphone-17-pro-max-front.png",
    backImg: "assets/phones/iphone-17-pro-max-back.png",
    photoScale: 1.0,
    photoWidth: 0.87,
    cameraLayout: "tri-apple",
    notch: "island",
    note: "Bold Cosmic Orange unibody with full-width triple-lens Pro optics and all-day battery endurance."
  },
  {
    id: "samsung-galaxy-s26-ultra",
    title: "Samsung Galaxy S26 Ultra",
    brand: "Samsung",
    finish: "Titanium White",
    chip: "Snapdragon 8 Elite 2",
    display: "6.9\" AMOLED 120Hz",
    camera: "200MP Quad · 5x",
    battery: "5,200 mAh",
    year: 2026,
    score: 4.9,
    price: 1349,
    frame: "#d8dadf",
    back: "#f1f2f5",
    screenA: "#dfe5f2",
    screenB: "#f7f6fa",
    frontImg: "https://i.hoanghamobile.vn/Uploads/2026/02/25/s26-ultra-trang-2.png;p=card",
    backImg: "https://i.hoanghamobile.vn/Uploads/2026/02/25/s26-ultra-trang-5.png;p=card",
    photoScale: 1.0,
    photoWidth: 0.85,
    cameraLayout: "quad-samsung",
    notch: "punch",
    note: "Mặt lưng trắng tinh giản, khung titan mỏng nhẹ, bút S Pen tích hợp và cảm biến 200MP thế hệ mới."
  },
  {
    id: "samsung-galaxy-a17-5g",
    title: "Samsung Galaxy A17 5G",
    brand: "Samsung",
    finish: "Navy Blue",
    chip: "Exynos 1330 5G",
    display: "6.7\" AMOLED 90Hz",
    camera: "50MP OIS Triple",
    battery: "5,000 mAh",
    year: 2025,
    score: 4.6,
    price: 229,
    frame: "#1d3563",
    back: "#24427a",
    screenA: "#1c4a75",
    screenB: "#9bd7ee",
    frontImg: "https://i.hoanghamobile.vn/Uploads/2025/08/15/a17-5g-blue-4.png;p=card",
    backImg: "https://i.hoanghamobile.vn/Uploads/2025/08/15/a17-5g-blue-1.png;p=card",
    photoScale: 1.0,
    photoWidth: 0.85,
    cameraLayout: "tri-samsung",
    notch: "punch",
    note: "Thiết kế xanh navy trẻ trung, màn hình Super AMOLED 6.7 inch rực rỡ cùng camera chống rung quang học OIS 50MP."
  },
  {
    id: "samsung-galaxy-s26",
    title: "Samsung Galaxy S26",
    brand: "Samsung",
    finish: "Sky Blue",
    chip: "Exynos 2600 / SD 8",
    display: "6.3\" AMOLED 120Hz",
    camera: "50MP Triple",
    battery: "4,300 mAh",
    year: 2026,
    score: 4.7,
    price: 849,
    frame: "#b7cbe0",
    back: "#d4e3f2",
    screenA: "#3c8596",
    screenB: "#b3d7e8",
    frontImg: "https://i.hoanghamobile.vn/Uploads/2026/02/25/s26-xanh-2.png;p=card",
    backImg: "https://i.hoanghamobile.vn/Uploads/2026/02/25/s26-xanh-5.png;p=card",
    photoScale: 1.0,
    photoWidth: 0.86,
    cameraLayout: "tri-samsung",
    notch: "punch",
    note: "Flagship gọn gàng sắc xanh thanh lịch, viền mỏng đối xứng và hiệu năng AI tối ưu cả ngày."
  },
  {
    id: "oppo-find-x9s",
    title: "OPPO Find X9s",
    brand: "OPPO",
    finish: "Lavender Purple",
    chip: "Dimensity 9400+",
    display: "6.59\" AMOLED 120Hz",
    camera: "50MP Hasselblad Tri",
    battery: "5,800 mAh",
    year: 2026,
    score: 4.8,
    price: 749,
    frame: "#cbbcd8",
    back: "#e3d9ec",
    screenA: "#7b65a6",
    screenB: "#d7c9eb",
    frontImg: "assets/phones/oppo-find-x9s-front.png",
    backImg: "assets/phones/oppo-find-x9s-back.png",
    photoScale: 1.0,
    photoWidth: 0.85,
    cameraLayout: "visor-pro",
    notch: "punch",
    note: "Thiết kế tím thanh thoát, viền siêu mỏng đều 4 cạnh cùng hệ thống ống kính Hasselblad tinh chỉnh màu sắc."
  },
  {
    id: "oppo-find-x10-pro-max",
    title: "OPPO Find X10 Pro Max",
    brand: "OPPO",
    finish: "Pearl White",
    chip: "Snapdragon 8 Elite 2",
    display: "6.82\" LTPO 120Hz",
    camera: "200MP Hasselblad",
    battery: "6,100 mAh",
    year: 2026,
    score: 4.9,
    price: 1199,
    frame: "#d9dadf",
    back: "#f2f3f6",
    screenA: "#b9bcc2",
    screenB: "#eceef2",
    frontImg: "https://i.hoanghamobile.vn/Uploads/2026/10/14/oppo-find-x10-pro-max-white-1-104431266.png;p=card",
    backImg: "https://i.hoanghamobile.vn/Uploads/2026/10/14/oppo-find-x10-pro-max-white-4-104431348.png;p=card",
    frontScale: 1.035,
    backScale: 1.055,
    photoWidth: 0.86,
    cameraLayout: "visor-pro",
    notch: "punch",
    note: "Flagship đầu bảng sắc trắng ngọc trai với cụm camera Hasselblad cỡ lớn và viên pin silicon 6,100 mAh."
  },
  {
    id: "oppo-reno15-5g",
    title: "OPPO Reno15 5G",
    brand: "OPPO",
    finish: "Twilight Blue",
    chip: "Dimensity 8450 5G",
    display: "6.7\" AMOLED 120Hz",
    camera: "50MP AI Triple",
    battery: "5,600 mAh",
    year: 2025,
    score: 4.7,
    price: 549,
    frame: "#2b3d59",
    back: "#3a4f70",
    screenA: "#16264a",
    screenB: "#9eaad4",
    frontImg: "assets/phones/oppo-reno15-front.png",
    backImg: "assets/phones/oppo-reno15-back.png",
    photoScale: 1.0,
    photoWidth: 0.85,
    cameraLayout: "visor-base",
    notch: "punch",
    note: "Mặt lưng xanh nhám chống bám vân tay kết hợp cụm Reno AI Camera và sạc nhanh SuperVOOC 80W."
  },
  {
    id: "xiaomi-redmi-17-4g",
    title: "Điện thoại Xiaomi REDMI 17 4G 6GB/256GB",
    brand: "Xiaomi",
    finish: "Matte Black · 6GB/256GB",
    chip: "Helio G99-Ultra",
    display: "6.67\" AMOLED 120Hz",
    camera: "50MP AI Dual",
    battery: "5,500 mAh",
    year: 2026,
    score: 4.6,
    price: 249,
    frame: "#232427",
    back: "#2c2d31",
    screenA: "#111214",
    screenB: "#4e535c",
    frontImg: "https://i.hoanghamobile.vn/Uploads/2026/08/01/q15a-black-front-090930434.png;p=card",
    backImg: "https://i.hoanghamobile.vn/Uploads/2026/08/01/q15a-black-back-090930371.png;p=card",
    photoScale: 1.07,
    photoWidth: 0.83,
    cameraLayout: "square-xiaomi",
    notch: "punch",
    note: "Màn hình AMOLED 120Hz sắc nét, bộ nhớ 6GB/256GB rộng rãi cùng pin 5,500 mAh bền bỉ cả ngày."
  },
  {
    id: "xiaomi-18-pro-max",
    title: "Xiaomi 18 Pro Max",
    brand: "Xiaomi",
    finish: "Crimson Red · 12GB/512GB",
    chip: "Snapdragon 8 Elite 2",
    display: "6.85\" LTPO 120Hz",
    camera: "50MP Leica Dual + Rear Display",
    battery: "6,200 mAh",
    year: 2026,
    score: 4.9,
    price: 1199,
    frame: "#7c1422",
    back: "#8f1929",
    screenA: "#1c0508",
    screenB: "#c93529",
    frontImg: "https://i.hoanghamobile.vn/Uploads/2026/10/26/Gallery/384506_dien-thoai-xiaomi-18-pro-max-12-512g-do%20(1).png;p=card",
    backImg: "https://i.hoanghamobile.vn/Uploads/2026/10/26/Gallery/645600_dien-thoai-xiaomi-18-pro-max-12-512g-do%20(4).png;p=card",
    photoScale: 1.03,
    photoWidth: 0.86,
    cameraLayout: "square-xiaomi",
    notch: "punch",
    note: "Phiên bản đỏ 12GB/512GB nổi bật với màn hình phụ ở cụm camera Leica mặt lưng và hiệu năng flagship."
  },
  {
    id: "xiaomi-17t-5g",
    title: "Điện thoại Xiaomi 17T 5G 12GB/512GB chính hãng",
    brand: "Xiaomi",
    finish: "Graphite Black · 12GB/512GB",
    chip: "Dimensity 9400+ 5G",
    display: "6.67\" 144Hz AMOLED",
    camera: "50MP Leica Triple",
    battery: "5,500 mAh",
    year: 2026,
    score: 4.8,
    price: 699,
    frame: "#26282c",
    back: "#32353a",
    screenA: "#11161d",
    screenB: "#5b6d80",
    frontImg: "https://i.hoanghamobile.vn/Uploads/2026/05/12/p12a-black-front-r1-wallpaper.png;p=card",
    backImg: "https://i.hoanghamobile.vn/Uploads/2026/05/12/p12a-black-back-r3.png;p=card",
    photoScale: 1.06,
    photoWidth: 0.86,
    cameraLayout: "square-xiaomi",
    notch: "punch",
    note: "Kết nối 5G tốc độ cao, RAM 12GB/512GB, màn hình 144Hz mượt mà và cụm ba ống kính Leica chính hãng."
  }
];

export const BASE_TILTS = [-16, 12, -8, 15, -13, 9, -18, 11, -6, 17, -12, 7];

export const BRANDS = ["Apple", "Samsung", "OPPO", "Xiaomi"];

export function resolveAssetUrl(url) {
  if (!url || /^https?:|^data:/.test(url)) return url;
  return `${getRootBase()}/${url.replace(/^\.?\//, "")}`;
}

export function getPhoneById(id) {
  return RAW_PHONES.find((p) => p.id === id) || null;
}

export function getPhoneThumb(phone) {
  return phone?.frontImg ? resolveAssetUrl(phone.frontImg) : phoneThumbSvg(phone);
}

export function phoneThumbSvg(phone) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 160">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${phone.screenA}"/>
        <stop offset="100%" stop-color="${phone.screenB}"/>
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="86" height="156" rx="16" fill="${phone.frame}"/>
    <rect x="6" y="6" width="78" height="148" rx="13" fill="#0d0d10"/>
    <rect x="9" y="9" width="72" height="142" rx="11" fill="url(#g)"/>
    <circle cx="45" cy="18" r="3" fill="#0d0d10"/>
    <circle cx="45" cy="84" r="24" fill="rgba(255,255,255,0.14)"/>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function cameraModuleSvg(phone) {
  const lens = (cx, cy, r = 11) => `
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="#141417" stroke="rgba(255,255,255,0.22)" stroke-width="1.5"/>
    <circle cx="${cx}" cy="${cy}" r="${(r * 0.54).toFixed(1)}" fill="#0a101d"/>
    <circle cx="${cx - r * 0.25}" cy="${cy - r * 0.25}" r="${(r * 0.16).toFixed(1)}" fill="rgba(160,210,255,0.45)"/>
  `;

  switch (phone.cameraLayout) {
    case "tri-apple":
      return `<svg viewBox="0 0 120 120" class="cam-svg" aria-hidden="true">
        <rect x="10" y="10" width="66" height="66" rx="16" fill="rgba(0,0,0,0.16)" stroke="rgba(255,255,255,0.22)"/>
        ${lens(29, 29, 11)}${lens(29, 57, 11)}${lens(56, 43, 11)}
        <circle cx="56" cy="24" r="4" fill="#f7eed7"/>
      </svg>`;
    case "dual-apple":
      return `<svg viewBox="0 0 120 120" class="cam-svg" aria-hidden="true">
        <rect x="14" y="12" width="32" height="60" rx="16" fill="rgba(0,0,0,0.18)" stroke="rgba(255,255,255,0.2)"/>
        ${lens(30, 29, 10)}${lens(30, 55, 10)}
        <circle cx="54" cy="42" r="4" fill="#f7eed7"/>
      </svg>`;
    case "quad-samsung":
      return `<svg viewBox="0 0 120 120" class="cam-svg" aria-hidden="true">
        ${lens(26, 24, 9)}${lens(26, 48, 9)}${lens(26, 72, 9)}${lens(48, 48, 7)}
        <circle cx="48" cy="24" r="3.5" fill="#f7eed7"/>
      </svg>`;
    case "tri-samsung":
      return `<svg viewBox="0 0 120 120" class="cam-svg" aria-hidden="true">
        <rect x="14" y="12" width="24" height="68" rx="12" fill="rgba(0,0,0,0.2)"/>
        ${lens(26, 24, 8)}${lens(26, 46, 8)}${lens(26, 68, 8)}
        <circle cx="46" cy="26" r="3.5" fill="#f7eed7"/>
      </svg>`;
    case "visor-pro":
      return `<svg viewBox="0 0 140 80" class="cam-svg cam-svg--wide" aria-hidden="true">
        <rect x="10" y="18" width="120" height="36" rx="18" fill="#18191c" stroke="rgba(255,255,255,0.2)"/>
        ${lens(34, 36, 10)}${lens(60, 36, 10)}${lens(86, 36, 10)}
        <circle cx="112" cy="36" r="4" fill="#f7eed7"/>
      </svg>`;
    case "visor-base":
      return `<svg viewBox="0 0 140 80" class="cam-svg cam-svg--wide" aria-hidden="true">
        <rect x="10" y="18" width="120" height="36" rx="18" fill="#18191c" stroke="rgba(255,255,255,0.2)"/>
        ${lens(40, 36, 10)}${lens(68, 36, 10)}
        <circle cx="108" cy="36" r="4" fill="#f7eed7"/>
      </svg>`;
    case "leica-ring":
      return `<svg viewBox="0 0 120 120" class="cam-svg cam-svg--center" aria-hidden="true">
        <circle cx="60" cy="54" r="38" fill="#161618" stroke="#c89d54" stroke-width="2"/>
        ${lens(46, 42, 10)}${lens(74, 42, 10)}${lens(46, 67, 10)}${lens(74, 67, 10)}
      </svg>`;
    default:
      return `<svg viewBox="0 0 120 120" class="cam-svg" aria-hidden="true">
        <rect x="12" y="12" width="58" height="58" rx="14" fill="#16171a" stroke="rgba(255,255,255,0.18)"/>
        ${lens(29, 29, 9)}${lens(53, 29, 9)}${lens(29, 53, 9)}
        <circle cx="53" cy="53" r="4.5" fill="#f7eed7"/>
      </svg>`;
  }
}
