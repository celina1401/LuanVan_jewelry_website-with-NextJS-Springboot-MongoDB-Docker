import jsPDF from 'jspdf';

interface InvoiceData {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  receiverName: string;
  shippingAddress: string;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
    wage: number;
    totalPrice: number;
    weight?: string;
  }>;
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  note?: string;
}

// Function to remove Vietnamese diacritical marks
const removeVietnameseDiacritics = (text: string): string => {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritical marks
    .replace(/[đĐ]/g, (match) => match === 'đ' ? 'd' : 'D'); // Replace đ/Đ with d/D
};

const safeSetFont = (doc: jsPDF, font: string, style: 'normal' | 'bold', fallback = 'helvetica'): string => {
  try {
    doc.setFont(font, style);
    return font;
  } catch {
    doc.setFont(fallback, style);
    return fallback;
  }
};

export const generateInvoicePDF = async (data: InvoiceData): Promise<void> => {
  const doc = new jsPDF('landscape', 'mm', 'a4');
  const pageWidth = 297;
  const pageHeight = 210;
  const margin = 10;
  
  // Enhanced color scheme
  const primaryColor: [number, number, number] = [41, 128, 185]; // Blue
  const secondaryColor: [number, number, number] = [52, 152, 219]; // Lighter blue
  const accentColor: [number, number, number] = [231, 76, 60]; // Red
  const lightGray: [number, number, number] = [236, 240, 241]; // Light gray
  const darkGray: [number, number, number] = [52, 73, 94]; // Dark gray
  
  const fontFamily = 'helvetica';
  const fallbackFont = 'helvetica';

  // Background gradient effect
  doc.setFillColor(248, 249, 250);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Header with enhanced design - reduced height
  const headerHeight = 25;
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, pageWidth, headerHeight, 'F');
  
  // Header pattern
  doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  for (let i = 0; i < pageWidth; i += 20) {
    doc.rect(i, 0, 10, headerHeight, 'F');
  }
  
  // Header content - smaller font
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  safeSetFont(doc, fontFamily, 'bold', fallbackFont);
  doc.text(removeVietnameseDiacritics('HOA DON BAN HANG'), pageWidth / 2, 15, { align: 'center' });
  
  // Invoice number in header - smaller font
  doc.setFontSize(10);
  doc.text(`Ma don hang: ${data.orderNumber}`, pageWidth - margin - 50, 8);
  doc.text(`Ngay: ${new Date(data.createdAt).toLocaleDateString('vi-VN')}`, pageWidth - margin - 50, 15);
  
  doc.setTextColor(0, 0, 0);

  // Main content area with shadow effect - adjusted positioning
  const contentY = headerHeight + 10;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, contentY, pageWidth - 2 * margin, pageHeight - contentY - 20, 3, 3, 'FD');

  // Two-column layout - optimized spacing
  const leftColumnX = margin + 5;
  const rightColumnX = pageWidth / 2 + 2;
  const columnWidth = (pageWidth - 2 * margin - 10) / 2;
  let currentY = contentY + 10;

  // Left column - Order information
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.roundedRect(leftColumnX, currentY, columnWidth, 6, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  safeSetFont(doc, fontFamily, 'bold', fallbackFont);
  doc.text(removeVietnameseDiacritics('THONG TIN DON HANG'), leftColumnX + 8, currentY + 4);
  
  currentY += 12;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  safeSetFont(doc, fontFamily, 'normal', fallbackFont);
  
  const infoItems = [
    { label: 'Ma don hang', value: data.orderNumber },
    { label: 'Ngay dat', value: new Date(data.createdAt).toLocaleDateString('vi-VN') },
    { label: 'Phuong thuc thanh toan', value: data.paymentMethod === 'COD' ? 'Tien mat khi nhan hang' : 'VNPAY' },
    { label: 'Trang thai thanh toan', value: data.paymentStatus === 'Đã thanh toán' ? 'Da thanh toan' : 'Chua thanh toan' }
  ];

  infoItems.forEach((item, index) => {
    doc.setFillColor(index % 2 === 0 ? lightGray[0] : 255, index % 2 === 0 ? lightGray[1] : 255, index % 2 === 0 ? lightGray[2] : 255);
    doc.rect(leftColumnX, currentY, columnWidth, 6, 'F');
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.text(`${item.label}:`, leftColumnX + 3, currentY + 4);
    doc.setTextColor(0, 0, 0);
    const maxValueLength = 25;
    const displayValue = item.value.length > maxValueLength ? item.value.substring(0, maxValueLength) + '...' : item.value;
    doc.text(displayValue, leftColumnX + 70, currentY + 4);
    currentY += 6;
  });

  // Right column - Customer information - REDUCED SPACING
  currentY = contentY + 10;
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.roundedRect(rightColumnX, currentY, columnWidth, 6, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  safeSetFont(doc, fontFamily, 'bold', fallbackFont);
  doc.text(removeVietnameseDiacritics('THONG TIN KHACH HANG'), rightColumnX + 8, currentY + 4);
  
  currentY += 10; // Reduced from 12
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  safeSetFont(doc, fontFamily, 'normal', fallbackFont);
  
  const customerItems = [
    { label: 'Ten khach hang', value: removeVietnameseDiacritics(data.customerName) },
    { label: 'So dien thoai', value: data.customerPhone },
    { label: 'Email', value: data.customerEmail },
    { label: 'Nguoi nhan', value: removeVietnameseDiacritics(data.receiverName) },
    { label: 'Dia chi', value: removeVietnameseDiacritics(data.shippingAddress) }
  ];

  customerItems.forEach((item, index) => {
    doc.setFillColor(index % 2 === 0 ? lightGray[0] : 255, index % 2 === 0 ? lightGray[1] : 255, index % 2 === 0 ? lightGray[2] : 255);
    doc.rect(rightColumnX, currentY, columnWidth, 5, 'F'); // Reduced height from 6 to 5
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.text(`${item.label}:`, rightColumnX + 3, currentY + 3.5); // Adjusted Y position
    doc.setTextColor(0, 0, 0);
    const maxValueLength = 30; // Increased from 25
    const displayValue = item.value.length > maxValueLength ? item.value.substring(0, maxValueLength) + '...' : item.value;
    doc.text(displayValue, rightColumnX + 70, currentY + 3.5); // Adjusted Y position
    currentY += 5; // Reduced spacing from 6 to 5
  });

  // Product section with enhanced design - adjusted positioning
  const productSectionY = contentY + 75; // Reduced from 85
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.roundedRect(margin + 5, productSectionY, pageWidth - 2 * margin - 10, 8, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  safeSetFont(doc, fontFamily, 'bold', fallbackFont);
  doc.text(removeVietnameseDiacritics('CHI TIET SAN PHAM'), margin + 15, productSectionY + 5);

  const tableData = data.items.map((item, index) => {
    // Tính giá vàng theo công thức: Giá vàng = (Tổng tiền / Số lượng / Khối lượng) - Tiền công
    let goldPrice = 0;
    
    if (item.weight && item.weight !== '0' && item.weight !== '' && item.quantity > 0) {
      const weight = parseFloat(item.weight);
      const wage = item.wage || 0;
      const totalPrice = item.totalPrice || 0;
      
      if (weight > 0 && totalPrice > 0) {
        // Giá vàng = (Tổng tiền / Số lượng / Khối lượng) - Tiền công
        goldPrice = (totalPrice / item.quantity / weight) - wage;
        // Đảm bảo giá vàng không âm
        goldPrice = Math.max(0, goldPrice);
      }
    }
    
    return [
      (index + 1).toString(),
      removeVietnameseDiacritics(item.productName).length > 20 
        ? removeVietnameseDiacritics(item.productName).substring(0, 17) + '...' 
        : removeVietnameseDiacritics(item.productName),
      item.quantity.toString(),
      goldPrice > 0 ? Number(goldPrice).toLocaleString('vi-VN') + ' ₫' : '0 ₫',
      Number(item.wage || 0).toLocaleString('vi-VN') + ' ₫',
      Number(item.totalPrice || 0).toLocaleString('vi-VN', { maximumFractionDigits: 0 }) + ' ₫'
    ];
  });

  // Calculate optimal column widths based on content - REDUCED WIDTHS
  const availableWidth = pageWidth - 2 * margin - 1; // Total available width
  const minColumnWidths = [10, 60, 15, 35, 30, 45];
  const totalMinWidth = minColumnWidths.reduce((sum, width) => sum + width, 0);
  
  // If total minimum width exceeds available width, scale down proportionally
  let columnWidths = minColumnWidths;
  if (totalMinWidth > availableWidth) {
    const scaleFactor = availableWidth / totalMinWidth;
    // columnWidths = minColumnWidths.map(width => Math.max(width * scaleFactor, 8)); // Reduced minimum to 8
    columnWidths = minColumnWidths.map(width => width * scaleFactor);

  }

  const autoTable = await import('jspdf-autotable');
  autoTable.default(doc, {
    startY: productSectionY + 12,
    head: [['STT', 'Ten san pham', 'So luong', 'Gia ban', 'Tien cong', 'Thanh tien']],
    body: tableData,
    theme: 'grid',
    tableWidth: 'wrap', // 👉 đảm bảo bảng không bị thu ngắn
    margin: { left: margin+5, right: margin+5}, // 👉 giảm margin để mở rộng bảng
  
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      font: fontFamily,
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 10, // 👉 nhỏ hơn để chứa số dài
      font: fontFamily,
      textColor: [0, 0, 0]
    },
    alternateRowStyles: {
      fillColor: lightGray
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },        // STT
      1: { cellWidth: 60 },                          // Tên sản phẩm
      2: { cellWidth: 30, halign: 'center' },        // Số lượng
      3: { cellWidth: 35, halign: 'center' },         // Giá bán
      4: { cellWidth: 50, halign: 'center' },         // Tiền công
      5: { cellWidth: 80, halign: 'center' }          // Thanh tiền 👉 Tăng lên cho đủ chỗ
    },
    styles: {
      lineColor: primaryColor,
      lineWidth: 0.5
    }
  });
  

  const finalY = (doc as any).lastAutoTable?.finalY || productSectionY + 12 + (tableData.length * 8) + 10;

  // Enhanced summary section - adjusted positioning and size
  const summaryY = finalY + 10;
  const summaryWidth = 120;
  const summaryX = pageWidth - margin - summaryWidth - 5;
  
  // Summary background with gradient effect
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(1);
  doc.roundedRect(summaryX, summaryY, summaryWidth, 40, 5, 5, 'FD');
  
  // Summary header
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.roundedRect(summaryX, summaryY, summaryWidth, 8, 5, 5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  safeSetFont(doc, fontFamily, 'bold', fallbackFont);
  doc.text(removeVietnameseDiacritics('TONG CONG'), summaryX + summaryWidth / 2, summaryY + 5, { align: 'center' });
  
  // Summary content
  let detailY = summaryY + 15;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  safeSetFont(doc, fontFamily, 'normal', fallbackFont);
  
  const summaryItems = [
    { label: 'Tam tinh', value: Number(data.subtotal || 0).toLocaleString('vi-VN') + ' ₫' },
    { label: 'Phi giao hang', value: data.shippingFee === 0 ? 'Mien phi' : Number(data.shippingFee || 0).toLocaleString('vi-VN') + ' ₫' }
  ];
  
  if (data.discount > 0) {
    summaryItems.push({ label: 'Giam gia', value: '- ' + Number(data.discount || 0).toLocaleString('vi-VN') + ' ₫' });
  }
  
  summaryItems.forEach(item => {
    doc.text(item.label + ':', summaryX + 8, detailY);
    doc.text(item.value, summaryX + summaryWidth - 8, detailY, { align: 'right' });
    detailY += 6;
  });
  
  // Total amount
  doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.setLineWidth(0.5);
  doc.line(summaryX + 8, detailY, summaryX + summaryWidth - 8, detailY);
  detailY += 6;
  
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.setFontSize(11);
  safeSetFont(doc, fontFamily, 'bold', fallbackFont);
  doc.text(removeVietnameseDiacritics('TONG CONG:'), summaryX + 8, detailY);
  doc.text(Number(data.total || 0).toLocaleString('vi-VN') + ' ₫', summaryX + summaryWidth - 8, detailY, { align: 'right' });

  // Note section if exists - adjusted positioning
  if (data.note) {
    const noteY = summaryY + 45;
    doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.roundedRect(margin + 5, noteY, summaryX - margin - 15, 20, 3, 3, 'F');
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.setFontSize(10);
    safeSetFont(doc, fontFamily, 'bold', fallbackFont);
    doc.text(removeVietnameseDiacritics('Ghi chu:'), margin + 15, noteY + 6);
    safeSetFont(doc, fontFamily, 'normal', fallbackFont);
    doc.setFontSize(8);
    doc.text(removeVietnameseDiacritics(data.note), margin + 15, noteY + 14);
  }

  // Enhanced footer - reduced height
  doc.setFillColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.rect(0, pageHeight - 20, pageWidth, 20, 'F');
  
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text(`Trang ${i}/${pageCount}`, pageWidth / 2, pageHeight - 6, { align: 'center' });
    doc.setFontSize(7);
    doc.text(removeVietnameseDiacritics('Cong ty TNHH Thuong mai va Dich vu'), pageWidth / 2, pageHeight - 12, { align: 'center' });
    doc.text('Cam on quy khach da su dung dich vu cua chung toi!', pageWidth / 2, pageHeight - 2, { align: 'center' });
  }

  doc.save(`HoaDon_${data.orderNumber}.pdf`);
};
