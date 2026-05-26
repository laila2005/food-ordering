import * as signalR from '@microsoft/signalr';

const API_URL = 'http://localhost:5165';

async function runTests() {
  console.log('🚀 Starting Full-Stack End-to-End Integration Test Suite...');
  
  // 1. Authenticate Seeded Admin
  console.log('\n1. Authenticating Seeded Admin: admin@quickbite.com...');
  const adminLoginRes = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@quickbite.com',
      password: 'Admin123!'
    })
  });
  
  if (!adminLoginRes.ok) throw new Error('Admin authentication failed.');
  const adminData = await adminLoginRes.json();
  console.log('✅ Admin authenticated successfully!');
  const adminToken = adminData.token;
  
  // 2. Register Customer
  const customerEmail = `customer_e2e_${Date.now()}@test.com`;
  console.log(`\n2. Registering Customer: ${customerEmail}...`);
  const custRegRes = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: customerEmail,
      password: 'Password123!',
      fullName: 'Customer Tester'
    })
  });
  
  if (!custRegRes.ok) throw new Error('Customer registration failed.');
  const custData = await custRegRes.json();
  console.log('✅ Customer registered and authenticated successfully!');
  const custToken = custData.token;
  const customerId = custData.user.id;
  
  // 3. Fetch Categories and Products
  console.log('\n3. Fetching Menu Catalog...');
  const catRes = await fetch(`${API_URL}/api/menu/categories`);
  const prodRes = await fetch(`${API_URL}/api/menu/products`);
  
  if (!catRes.ok || !prodRes.ok) throw new Error('Menu fetch failed.');
  const categories = await catRes.json();
  const products = await prodRes.json();
  console.log(`✅ Fetched ${categories.length} Categories and ${products.length} Products successfully!`);
  
  if (products.length === 0) throw new Error('No products seeded in database!');
  const testProduct = products[0];
  console.log(`👉 Selected product for test checkout: ${testProduct.name.en || testProduct.name} - Price: $${testProduct.price}`);

  // 4. Place a COD Order
  console.log('\n4. Placing Transactional Customer Order (COD)...');
  const orderRes = await fetch(`${API_URL}/api/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${custToken}`
    },
    body: JSON.stringify({
      paymentMethod: 'CashOnDelivery',
      deliveryAddress: '123 E2E Test Boulevard',
      items: [{ productId: testProduct.id, quantity: 2 }]
    })
  });
  
  if (!orderRes.ok) {
    const errorMsg = await orderRes.text();
    throw new Error(`Order checkout failed: ${errorMsg}`);
  }
  const orderData = await orderRes.json();
  const orderId = orderData.orderId;
  console.log(`✅ Order placed successfully! Order ID: ${orderId} - Total: $${orderData.totalAmount}`);

  // 5. Establish SignalR WebSockets Connections
  console.log('\n5. Establishing Real-time SignalR Sockets...');
  
  const adminConnection = new signalR.HubConnectionBuilder()
    .withUrl(`${API_URL}/hubs/order`, {
      accessTokenFactory: () => adminToken,
      skipNegotiation: true,
      transport: signalR.HttpTransportType.WebSockets
    })
    .build();

  const customerConnection = new signalR.HubConnectionBuilder()
    .withUrl(`${API_URL}/hubs/order`, {
      accessTokenFactory: () => custToken,
      skipNegotiation: true,
      transport: signalR.HttpTransportType.WebSockets
    })
    .build();

  let adminAlertReceived = false;
  let customerUpdateReceived = false;

  adminConnection.on('ReceiveAdminStatusUpdate', (data) => {
    console.log(`📡 [Admin Socket] Live Event: Order Status changed! Order ID: ${data.orderId} -> Status: ${data.status}`);
    adminAlertReceived = true;
  });

  customerConnection.on('ReceiveStatusUpdate', (data) => {
    console.log(`📡 [Customer Socket] Live Event: Your order status updated! Order ID: ${data.orderId} -> Status: ${data.status}`);
    customerUpdateReceived = true;
  });

  await Promise.all([adminConnection.start(), customerConnection.start()]);
  console.log('✅ Both Admin and Customer socket bridges established!');

  // Join groups
  await adminConnection.invoke('JoinAdminDashboard');
  await customerConnection.invoke('JoinOrderGroup', orderId);
  console.log('✅ Joined socket groups successfully!');

  // 6. Admin updates order status to "Preparing"
  console.log('\n6. Admin updating order status to "Preparing"...');
  const updateRes = await fetch(`${API_URL}/api/admin/orders/${orderId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({ status: 'Preparing' })
  });

  if (!updateRes.ok) {
    const errorMsg = await updateRes.text();
    throw new Error(`Admin status update failed: ${updateRes.status} - ${errorMsg}`);
  }
  console.log('✅ API returned status update success!');

  // Wait a short moment for WebSocket events to propagate
  await new Promise(resolve => setTimeout(resolve, 2000));

  // 7. Verify Assertions
  console.log('\n7. Running Assertions...');
  
  let passed = true;
  if (adminAlertReceived) {
    console.log('✅ PASS: Admin WebSocket received status update event.');
  } else {
    console.log('❌ FAIL: Admin WebSocket did not receive status update event.');
    passed = false;
  }

  if (customerUpdateReceived) {
    console.log('✅ PASS: Customer WebSocket received status update event.');
  } else {
    console.log('❌ FAIL: Customer WebSocket did not receive status update event.');
    passed = false;
  }

  // Cleanup connections
  await Promise.all([
    adminConnection.stop(),
    customerConnection.stop()
  ]);
  
  if (passed) {
    console.log('\n🏁 E2E Testing completed successfully! All pipelines verified.');
  } else {
    console.log('\n❌ E2E Testing failed some assertions!');
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('\n❌ E2E Testing failed with error:');
  console.error(err);
  process.exit(1);
});
