/**
 * The drawing half of SignaturePad without React: strokes as points, the
 * smoothed path each draws, and the SVG and PNG a signature is kept as.
 */

/** One stroke: the points the pointer passed through, in the pad's own units, and the line's width. */
export type SignatureStroke = { points: [number, number][]; width: number };

/** A signature as the pad hands it over. */
export type SignatureValue = {
  /** Whether it was drawn or typed. */
  kind: 'drawn' | 'typed';
  /** The signature as a standalone SVG document in `currentColor`, so it scales and prints. */
  svg: string;
  /** The typed name, for a typed signature. */
  text?: string;
  /** Renders the signature to a PNG on demand, at twice its size. */
  png: () => Promise<Blob>;
};

const round = (n: number) => Math.round(n * 10) / 10;

/**
 * A stroke's path, smoothed: a quadratic curve through the midpoints of
 * successive points, so a slow hand's jitter and a fast hand's gaps both
 * read as one line. A single point is a dot.
 */
export function strokePath(points: readonly [number, number][]): string {
  if (points.length === 0) return '';
  const [x0, y0] = points[0];
  if (points.length === 1) return `M${round(x0)} ${round(y0)}l0.1 0`;
  let d = `M${round(x0)} ${round(y0)}`;
  for (let i = 1; i < points.length - 1; i++) {
    const [x, y] = points[i];
    const [nx, ny] = points[i + 1];
    d += `Q${round(x)} ${round(y)} ${round((x + nx) / 2)} ${round((y + ny) / 2)}`;
  }
  const [lx, ly] = points[points.length - 1];
  return `${d}L${round(lx)} ${round(ly)}`;
}

const escapeXml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Drawn strokes as a standalone SVG document. */
export function drawnSvg(strokes: readonly SignatureStroke[], width: number, height: number): string {
  const paths = strokes
    .map(
      (s) =>
        `<path d="${strokePath(s.points)}" fill="none" stroke="currentColor" stroke-width="${round(s.width)}" stroke-linecap="round" stroke-linejoin="round"/>`,
    )
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${round(width)} ${round(height)}" width="${round(width)}" height="${round(height)}">${paths}</svg>`;
}

/** A typed name as a standalone SVG document, set on the baseline in the face it was shown in. */
export function typedSvg(text: string, width: number, height: number, fontFamily: string, fontSize: number): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${round(width)} ${round(height)}" width="${round(width)}" height="${round(height)}"><text x="${round(width * 0.06)}" y="${round(height * 0.7)}" fill="currentColor" font-family="${escapeXml(fontFamily)}" font-style="italic" font-size="${round(fontSize)}">${escapeXml(text)}</text></svg>`;
}

/** An SVG document drawn onto a canvas and read back as a PNG, at `scale` times its size. */
export function svgToPng(svg: string, width: number, height: number, scale = 2): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = Math.ceil(width * scale);
      canvas.height = Math.ceil(height * scale);
      const context = canvas.getContext('2d');
      if (!context) return reject(new Error('No 2D canvas context'));
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('The canvas gave no PNG'))), 'image/png');
    };
    image.onerror = () => reject(new Error('The signature SVG did not load'));
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  });
}
