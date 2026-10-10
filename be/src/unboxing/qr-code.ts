import QRCode from 'qrcode';

// Error correction "H" (30 %) survives scratches, folds and small logos printed on the box bottom.
// A 4-module quiet zone is the standard minimum margin for reliable scanning.
const OPTIONS = { errorCorrectionLevel: 'H', margin: 4, color: { dark: '#000000', light: '#FFFFFF' } } as const;

/** PNG at 1200 px: about 10 cm wide at 300 DPI. */
export const QR_PNG_WIDTH = 1200;

export function qrPng(text: string): Promise<Buffer> {
  return QRCode.toBuffer(text, { ...OPTIONS, type: 'png', width: QR_PNG_WIDTH });
}

/** Vector version for the print export (scales to any size without blur). */
export function qrSvg(text: string): Promise<string> {
  return QRCode.toString(text, { ...OPTIONS, type: 'svg' });
}
