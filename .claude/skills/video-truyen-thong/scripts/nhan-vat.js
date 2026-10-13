/* Nhân vật hoạt hình "Cô Hương" – tư vấn viên dinh dưỡng (SVG, vẽ tay bằng code, không dùng ảnh ngoài).
   <i class="nv" data-tu="chao|chao2|chi|thuoc|like|vo|noi" data-mieng="mo|cuoi" data-mat="nham" data-noi="lời thoại" data-k="1" data-kh="2"></i>
   data-k: hiện từ khung k · data-kh: ẩn từ khung k (để đổi tư thế, tạo cử chỉ). */
(function () {
  const DA = '#FFDCC8', DA2 = '#F4BFA6', TOC = '#3A2430', AO = '#F0537A', AO2 = '#D93E66';
  const TU = {   // r / l: góc tay phải / trái (0 = buông xuống, độ, quay quanh vai); ri / li: vật trên tay
    chao:  { r: -140, l: 12,  ri: 'xoe', li: '' },
    chao2: { r: -112, l: 12,  ri: 'xoe', li: '' },
    chi:   { r: -12,  l: 78,  ri: '',    li: 'chi', nghieng: -4 },
    chi2:  { r: -12,  l: 92,  ri: '',    li: 'chi', nghieng: -4 },
    thuoc: { r: -150, l: 18,  ri: 'thuoc', li: '' },
    like:  { r: -162, l: 24,  ri: 'like', li: '', nghieng: 4 },
    vo:    { r: -150, l: 150, ri: 'xoe', li: 'xoe' },
    vo2:   { r: -128, l: 128, ri: 'xoe', li: 'xoe' },
    noi:   { r: -28,  l: 30,  ri: 'xoe', li: '' },
  };
  function tay(x, goc, vat, ben) {
    const tayNgon = vat === 'xoe' ? `<g fill="${DA}">${[-14, -5, 4, 13].map((d, i) => `<ellipse cx="${x + d}" cy="${351 + (i === 0 || i === 3 ? -2 : 3)}" rx="5" ry="10"/>`).join('')}</g>` : '';
    const chi = vat === 'chi' ? `<rect x="${x - 4}" y="340" width="8" height="34" rx="4" fill="${DA}"/>` : '';
    const like = vat === 'like' ? `<rect x="${x - 5}" y="342" width="10" height="26" rx="5" fill="${DA}"/>` : '';
    const thuoc = vat === 'thuoc' ? `<g><rect x="${x - 13}" y="300" width="26" height="150" rx="4" fill="#FFC93C" stroke="#E0A400" stroke-width="2"/>${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => `<line x1="${x - 13}" x2="${x - 13 + (i % 2 ? 8 : 14)}" y1="${308 + i * 11}" y2="${308 + i * 11}" stroke="#7A5A00" stroke-width="2"/>`).join('')}</g>` : '';
    return `<g transform="rotate(${goc} ${x} 236)">
      <rect x="${x - 15}" y="226" width="30" height="74" rx="15" fill="${AO}"/>
      <rect x="${x - 11}" y="290" width="22" height="46" rx="11" fill="${DA}"/>
      ${thuoc}${tayNgon}${chi}${like}
      <circle cx="${x}" cy="338" r="17" fill="${DA}"/>
    </g>`;
  }
  function svg(tu, mieng, mat) {
    const t = TU[tu] || TU.noi;
    const mo = mieng === 'mo';
    return `<svg viewBox="0 0 320 450" style="overflow:visible" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <ellipse cx="160" cy="440" rx="96" ry="10" fill="rgba(142,30,74,.16)"/>
      <rect x="128" y="360" width="24" height="66" rx="10" fill="#4A3646"/><rect x="168" y="360" width="24" height="66" rx="10" fill="#4A3646"/>
      <ellipse cx="138" cy="428" rx="22" ry="11" fill="${AO2}"/><ellipse cx="182" cy="428" rx="22" ry="11" fill="${AO2}"/>
      ${tay(98, t.l, t.li, 'trai')}
      <path d="M104 228 Q160 210 216 228 L246 378 Q160 396 74 378 Z" fill="${AO}"/>
      <path d="M128 222 L160 262 L192 222" fill="#fff"/><path d="M140 222 L160 250 L180 222" fill="${AO}"/>
      <path d="M160 286 c-6 -10 -20 -6 -16 6 c3 8 16 14 16 14 c0 0 13 -6 16 -14 c4 -12 -10 -16 -16 -6z" fill="#fff"/>
      <rect x="146" y="198" width="28" height="26" rx="8" fill="${DA2}"/>
      ${tay(222, t.r, t.ri, 'phai')}
      <g transform="rotate(${t.nghieng || 0} 160 150)">
        <circle cx="160" cy="138" r="92" fill="${TOC}"/>
        <circle cx="160" cy="54" r="30" fill="${TOC}"/>
        <path d="M140 40 l-26 -14 l4 28 z M180 40 l26 -14 l-4 28 z" fill="${AO}"/><circle cx="160" cy="40" r="9" fill="${AO2}"/>
        <ellipse cx="160" cy="156" rx="74" ry="78" fill="${DA}"/>
        <path d="M86 140 Q96 72 160 70 Q224 72 234 140 Q208 104 176 102 Q168 120 140 118 Q112 116 86 140 Z" fill="${TOC}"/>
        ${mat === 'nham' ? `<path d="M120 162 q12 8 24 0 M176 162 q12 8 24 0" stroke="#2A1A22" stroke-width="5" fill="none" stroke-linecap="round"/>`
          : `<ellipse cx="132" cy="160" rx="10" ry="13" fill="#2A1A22"/><ellipse cx="188" cy="160" rx="10" ry="13" fill="#2A1A22"/><circle cx="136" cy="155" r="4" fill="#fff"/><circle cx="192" cy="155" r="4" fill="#fff"/>`}
        <path d="M118 138 q14 -8 26 -2 M176 136 q12 -6 26 2" stroke="#3A2430" stroke-width="4" fill="none" stroke-linecap="round"/>
        <ellipse cx="114" cy="186" rx="15" ry="9" fill="#FF8FA8" opacity=".55"/><ellipse cx="206" cy="186" rx="15" ry="9" fill="#FF8FA8" opacity=".55"/>
        ${mo ? `<path d="M144 190 Q160 186 176 190 Q174 214 160 214 Q146 214 144 190 Z" fill="#B92C51"/><ellipse cx="160" cy="206" rx="9" ry="5" fill="#FF8FA8"/>`
          : `<path d="M144 192 Q160 208 176 192" stroke="#B92C51" stroke-width="5" fill="none" stroke-linecap="round"/>`}
      </g>
    </svg>`;
  }
  document.querySelectorAll('.nv').forEach((el) => {
    el.innerHTML = svg(el.dataset.tu, el.dataset.mieng, el.dataset.mat) + (el.dataset.noi ? `<span class="nv-noi">${el.dataset.noi}</span>` : '');
  });
})();
