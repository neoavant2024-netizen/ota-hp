import fs from 'node:fs';
import path from 'node:path';

/**
 * 工場写真 / チラシ画像を「ファイル名」から自動検出します。
 * ビルド時に実行されるため、フォルダに画像を置くだけで反映されます（コード編集は不要）。
 *
 *  ★ 日本語のファイル名にも対応しています。
 *    例）public/images/factory/太田第１工場.jpg → 太田 第1エリアの工場写真として自動表示
 *
 *  ゆれの吸収：全角数字（１→1）、半角/全角スペース、漢数字（一→1）、
 *              「第」「工場」の有無 などを正規化して照合します。
 */

const IMG_EXT = /\.(jpe?g|png|webp)$/i;

/** 比較用にファイル名を正規化する */
function normalize(s: string): string {
  return s
    .replace(IMG_EXT, '')
    // 全角英数字 → 半角
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    // 漢数字 → 算用数字（工場名で使う範囲のみ）
    .replace(/一/g, '1').replace(/二/g, '2').replace(/三/g, '3')
    .replace(/七/g, '7').replace(/九/g, '9').replace(/十/g, '10')
    // 空白（半角・全角）・記号を除去
    .replace(/[\s　_\-‐―ー]/g, '')
    .toLowerCase();
}

/** エリアkey → 受け付けるファイル名（日本語名を含む） */
const FACTORY_ALIASES: Record<string, string[]> = {
  'ota-1': ['ota1', '太田第1工場', '太田本社工場', '太田第1', '太田工場', '太田本社'],
  'ota-2': ['ota2', '太田第2工場', '太田第2', 'ハイクラス工場'],
  'gyoda': ['gyoda', '行田工場', '行田第7工場', '行田'],
  'fukaya': ['fukaya', '深谷工場', '深谷第9工場', '深谷'],
  'annaka': ['annaka', '安中工場', '安中第10工場', '安中'],
  'maebashi': ['maebashi', '前橋工場', '前橋'],
};

/** ディレクトリ内の画像を [正規化名, 実ファイル名] で列挙 */
function listImages(dir: string): { norm: string; file: string }[] {
  const abs = path.join(process.cwd(), 'public', dir);
  if (!fs.existsSync(abs)) return [];
  return fs
    .readdirSync(abs)
    .filter((f) => IMG_EXT.test(f))
    .map((f) => ({ norm: normalize(f), file: f }));
}

/**
 * 工場写真を探す。
 * public/images/factory/ の中から、エリアkey または日本語の工場名に一致する画像を返す。
 */
export function factoryPhoto(key: string): string | undefined {
  const files = listImages('images/factory');
  if (files.length === 0) return undefined;

  const aliases = (FACTORY_ALIASES[key] ?? [key]).map(normalize);

  // 完全一致 → 部分一致（「太田第１工場（外観）.jpg」のような命名にも対応）の順で探す
  for (const a of aliases) {
    const hit = files.find((f) => f.norm === a);
    if (hit) return `/images/factory/${encodeURIComponent(hit.file)}`;
  }
  for (const a of aliases) {
    const hit = files.find((f) => f.norm.includes(a));
    if (hit) return `/images/factory/${encodeURIComponent(hit.file)}`;
  }
  return undefined;
}

/**
 * セールチラシを探す。
 * 指定名があればそれを、無ければ public/images/sale/ にある画像を1枚使う。
 * （仮画像 mofu-futon-sale は候補から除外）
 */
export function salePhoto(preferred?: string): string | undefined {
  const files = listImages('images/sale');
  if (files.length === 0) return undefined;

  if (preferred) {
    const p = normalize(preferred);
    const hit = files.find((f) => f.norm === p) ?? files.find((f) => f.norm.includes(p));
    if (hit) return `/images/sale/${encodeURIComponent(hit.file)}`;
  }
  const real = files.find((f) => !f.norm.includes('mofufutonsale'));
  const pick = real ?? files[0];
  return `/images/sale/${encodeURIComponent(pick.file)}`;
}
