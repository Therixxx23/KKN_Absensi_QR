import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';

function formatDate(iso) {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

export async function downloadQRasPDF(qrToken, tanggalMulai, tanggalSelesai) {
  const url = `${window.location.origin}/scan?token=${qrToken}`;

  const canvas = document.createElement('canvas');
  await QRCode.toCanvas(canvas, url, { width: 400, margin: 2 });

  const imgData = canvas.toDataURL('image/png');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(20);
  doc.text('QR Absensi KKN', pageWidth / 2, 50, { align: 'center' });
  doc.setFontSize(14);
  doc.text('Desa Cirumput', pageWidth / 2, 72, { align: 'center' });

  const qrSize = 280;
  const qrX = (pageWidth - qrSize) / 2;
  const qrY = 110;
  doc.addImage(imgData, 'PNG', qrX, qrY, qrSize, qrSize);

  doc.setFontSize(12);
  const periodText = `Berlaku: ${formatDate(tanggalMulai)} – ${formatDate(tanggalSelesai)}`;
  doc.text(periodText, pageWidth / 2, qrY + qrSize + 40, { align: 'center' });

  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(
    'QR ini berlaku untuk seluruh periode KKN. Print/tempel di lokasi.',
    pageWidth / 2,
    qrY + qrSize + 65,
    { align: 'center' },
  );

  const filename = `QR-Absensi-KKN-${tanggalMulai}-sampai-${tanggalSelesai}.pdf`;
  doc.save(filename);
}
