/* Tách nền 1 ảnh (chạy ở tiến trình con để máy chủ chính không bị nặng): node tach-nen.mjs <vào> <ra.png>
   Thư viện @imgly/background-removal-node (AGPL-3.0, mã nguồn: https://github.com/imgly/background-removal-js) – mô hình có sẵn, không cần mạng. */
import { removeBackground } from '@imgly/background-removal-node';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
const [vao, ra] = process.argv.slice(2);
const blob = await removeBackground(pathToFileURL(vao).href, { model: 'medium', output: { format: 'image/png', quality: 1 } });
fs.writeFileSync(ra, Buffer.from(await blob.arrayBuffer()));
