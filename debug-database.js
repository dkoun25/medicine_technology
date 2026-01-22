/**
 * DEBUG SCRIPT - Kiểm tra và dọn dữ liệu AsyncStorage
 * 
 * CÁCH DÙNG:
 * 1. Mở Chrome DevTools của Expo app
 * 2. Copy toàn bộ script này
 * 3. Chạy trong console
 * 4. Follow hướng dẫn
 */

// Helper function để lấy dữ liệu
async function getInvoices() {
  try {
    const data = await AsyncStorage.getItem('invoices');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error:', e);
    return [];
  }
}

async function getPurchaseOrders() {
  try {
    const data = await AsyncStorage.getItem('purchase_orders');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error:', e);
    return [];
  }
}

// Kiểm tra toàn bộ dữ liệu
async function checkDatabase() {
  console.log('=== KIỂM TRA DATABASE ===\n');
  
  const invoices = await getInvoices();
  const purchaseOrders = await getPurchaseOrders();
  
  console.log('📊 INVOICES (Hóa đơn bán, trả):');
  console.log(`Total: ${invoices.length} hóa đơn\n`);
  
  invoices.forEach((inv, i) => {
    const totalQty = inv.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
    console.log(`[${i}] ID: ${inv.id}`);
    console.log(`    Type: ${inv.type} | Customer: ${inv.customerName || 'N/A'}`);
    console.log(`    Items: ${totalQty} | Total: ${inv.total} đ`);
    console.log(`    Date: ${new Date(inv.createdAt).toLocaleString('vi-VN')}`);
    console.log('');
  });

  console.log('\n📦 PURCHASE ORDERS (Hóa đơn nhập):');
  console.log(`Total: ${purchaseOrders.length} phiếu nhập\n`);
  
  purchaseOrders.forEach((po, i) => {
    const totalQty = po.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
    console.log(`[${i}] Code: ${po.code}`);
    console.log(`    Supplier: ${po.supplierName}`);
    console.log(`    Items: ${totalQty} | Total: ${po.total} đ`);
    console.log(`    Date: ${new Date(po.createdAt).toLocaleString('vi-VN')}`);
    console.log('');
  });

  // Phân tích dữ liệu trả hàng
  console.log('\n🔍 PHÂN TÍCH TRẢ HÀNG:');
  const returnInvoices = invoices.filter(inv => inv.type === 'return');
  const retailInvoices = invoices.filter(inv => inv.type === 'retail');
  
  console.log(`Hóa đơn bán lẻ: ${retailInvoices.length}`);
  console.log(`Phiếu trả hàng: ${returnInvoices.length}`);
  
  // Tính tổng cho từng khách
  const customerStats = new Map();
  
  retailInvoices.forEach(inv => {
    const customer = inv.customerName || 'Khách Vãng Lai';
    const qty = inv.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
    if (!customerStats.has(customer)) {
      customerStats.set(customer, { purchased: 0, returned: 0 });
    }
    customerStats.get(customer).purchased += qty;
  });
  
  returnInvoices.forEach(inv => {
    const customer = inv.customerName || 'Khách Vãng Lai';
    const qty = inv.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
    if (!customerStats.has(customer)) {
      customerStats.set(customer, { purchased: 0, returned: 0 });
    }
    customerStats.get(customer).returned += qty;
  });
  
  console.log('\nThống kê theo khách hàng:');
  Array.from(customerStats.entries()).forEach(([customer, stats]) => {
    const remaining = stats.purchased - stats.returned;
    const status = remaining === 0 ? '✅ Trả hết' : `⚠️ Còn ${remaining}`;
    console.log(`${customer}: Mua ${stats.purchased} | Trả ${stats.returned} | ${status}`);
  });
}

// Xóa tất cả dữ liệu test (GIỮ LẠI DỮ LIỆU TRẢ HÀNG ĐÚNG)
async function cleanDatabase() {
  console.log('\n🧹 CLEANING DATABASE...\n');
  
  const invoices = await getInvoices();
  const purchaseOrders = await getPurchaseOrders();
  
  // Tính toán khách hàng trả hàng đúng
  const returnInvoices = invoices.filter(inv => inv.type === 'return');
  const retailInvoices = invoices.filter(inv => inv.type === 'retail');
  
  const customerStats = new Map();
  retailInvoices.forEach(inv => {
    const customer = inv.customerName || 'Khách Vãng Lai';
    const qty = inv.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
    if (!customerStats.has(customer)) {
      customerStats.set(customer, { purchased: 0, returned: 0, invoices: [] });
    }
    customerStats.get(customer).purchased += qty;
    customerStats.get(customer).invoices.push(inv.id);
  });
  
  returnInvoices.forEach(inv => {
    const customer = inv.customerName || 'Khách Vãng Lai';
    const qty = inv.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
    if (!customerStats.has(customer)) {
      customerStats.set(customer, { purchased: 0, returned: 0 });
    }
    customerStats.get(customer).returned += qty;
  });
  
  // Xóa hóa đơn bán của khách đã trả hết
  let keptInvoices = invoices.filter(inv => {
    if (inv.type === 'retail') {
      const customer = inv.customerName || 'Khách Vãng Lai';
      const stats = customerStats.get(customer);
      return stats && stats.purchased > stats.returned; // Giữ nếu còn chưa trả hết
    }
    return true; // Giữ tất cả return invoices
  });
  
  const removed = invoices.length - keptInvoices.length;
  console.log(`✅ Xóa ${removed} hóa đơn test`);
  console.log(`✅ Giữ lại ${keptInvoices.length} hóa đơn`);
  
  // Lưu lại
  await AsyncStorage.setItem('invoices', JSON.stringify(keptInvoices));
  
  console.log('\n✨ Dọn dữ liệu hoàn tất!\n');
  
  // Hiển thị kết quả
  await checkDatabase();
}

// CHẠY
console.log('🚀 CHẠY KIỂM TRA DATABASE...\n');
await checkDatabase();

console.log('\n' + '='.repeat(50));
console.log('📝 ĐỂ DỌN DỮ LIỆU TEST, CHẠY:');
console.log('='.repeat(50) + '\n');
console.log('await cleanDatabase()');
