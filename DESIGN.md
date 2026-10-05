---
version: alpha
name: Hương Chất Kids
description: Shop dinh dưỡng Hàn Quốc cho bé (huongchatkids.vn). Tokens lấy từ :root trong css/style.css.
colors:
  primary: "#F0537A"
  primary-600: "#D93E66"
  primary-100: "#FFE9EF"
  on-primary: "#FFFFFF"
  secondary: "#17A398"
  secondary-100: "#E0F5F2"
  tertiary: "#FFB020"
  tertiary-100: "#FFF3D6"
  juice-deep: "#A04C00"
  price: "#C9285D"
  ink: "#22202A"
  ink-2: "#4E4B58"
  muted: "#6F6B78"
  line: "#ECE7EA"
  surface: "#FFFFFF"
  surface-soft: "#FFF8FA"
typography:
  headline-display:
    fontFamily: Quicksand
    fontSize: 40px
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Quicksand
    fontSize: 26px
    fontWeight: 700
    lineHeight: 1.2
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.55
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.55
  label-md:
    fontFamily: Be Vietnam Pro
    fontSize: 13px
    fontWeight: 700
    lineHeight: 1.2
  label-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 12px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: 0.04em
  price-lg:
    fontFamily: Quicksand
    fontSize: 22px
    fontWeight: 700
    lineHeight: 1.1
rounded:
  xs: 6px
  sm: 10px
  md: 16px
  lg: 28px
  full: 999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 48px
  container: 1240px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    padding: 14px 26px
  button-primary-hover:
    backgroundColor: "{colors.primary-600}"
    textColor: "{colors.on-primary}"
  button-light:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary-600}"
    rounded: "{rounded.full}"
  badge-hero:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.juice-deep}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
  hero-juice:
    backgroundColor: "{colors.tertiary-100}"
    textColor: "{colors.ink}"
    typography: "{typography.headline-display}"
    rounded: "{rounded.lg}"
  price-tile:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.price}"
    typography: "{typography.price-lg}"
    rounded: "{rounded.md}"
  price-tile-label:
    textColor: "{colors.muted}"
    typography: "{typography.label-sm}"
  chip-flavor:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-2}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
  chip-teal:
    backgroundColor: "{colors.secondary-100}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
  chip-pink:
    backgroundColor: "{colors.primary-100}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
  section-soft:
    backgroundColor: "{colors.surface-soft}"
    textColor: "{colors.ink}"
  divider:
    backgroundColor: "{colors.line}"
    textColor: "{colors.ink}"
  sticker-price:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.full}"
  accent-sun:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.ink}"
  link-secondary:
    textColor: "{colors.secondary}"
---

## Overview

Ấm áp, tin cậy, vui vẻ vừa đủ: khách là các mẹ đang chọn đồ dinh dưỡng cho con, đọc trên điện thoại là chính. Giao diện sáng, bo tròn mềm, nhiều khoảng thở, ảnh sản phẩm thật luôn là nhân vật chính. Không dùng hiệu ứng rối mắt; chuyển động chỉ để dẫn mắt tới giá hoặc nút mua.

## Colors

- **Hồng san hô (#F0537A):** màu thương hiệu, dành cho nút mua và điểm nhấn chính.
- **Xanh ngọc (#17A398):** màu phụ cho thông tin tin cậy (chính hãng, giao hàng).
- **Vàng nắng (#FFB020) và Kem vàng (#FFF3D6):** tông của dòng nước ép, nền hero ấm.
- **Cam đậm (#A04C00):** chữ nhãn trên nền kem vàng, đạt tương phản AA.
- **Giá (#C9285D):** chỉ dùng cho con số giá.
- **Mực (#22202A):** chữ chính; Mực nhạt (#4E4B58) và Xám (#6F6B78) cho chữ phụ.

## Typography

Quicksand đậm cho tiêu đề và con số giá (tròn, thân thiện). Be Vietnam Pro cho nội dung, hỗ trợ dấu tiếng Việt đầy đủ. Tiêu đề hero tối đa 2 dòng.

## Layout

Khung tối đa 1240px. Hero chia 2 cột trên máy tính (chữ trái, ảnh phải), về 1 cột trên điện thoại với ảnh nhỏ ở góc. Thang khoảng cách 4/8/16/24/48px.

## Elevation & Depth

Bóng mềm nhuốm màu mực (rgba(34,32,42,.06 đến .16)). Trên nền vàng, bóng nhuốm cam để không bị xám bẩn.

## Shapes

Thẻ 16px, khung ảnh hero 28px, nút và chip bo tròn hẳn (999px).

## Components

- **Hero nước ép:** nền kem vàng có quầng nắng, ảnh sản phẩm thật trong khung bo 28px, chip vị nước ép bay quanh ảnh, sticker giá theo gói.
- **Ô giá:** nền trắng, nhãn nhỏ xám ở trên, giá Quicksand màu giá ở dưới.
- **Nút:** nút sáng trên hero màu, nút hồng trên nền sáng.

## Do's and Don'ts

- Do dùng ảnh sản phẩm thật, không vẽ giả sản phẩm.
- Do giữ giá đúng với dữ liệu sản phẩm.
- Don't đặt quá 4 lớp chữ trong hero (nhãn, tiêu đề, mô tả, nút/giá).
- Don't dùng chữ trắng trên nền vàng nhạt (không đủ tương phản).
- Don't dùng dấu gạch dài trong câu chữ hiển thị.
