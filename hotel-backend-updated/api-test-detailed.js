/**
 * API Test Suite for Hotel Management System
 * 
 * Tệp test chi tiết ghi lại body, response và status code cho tất cả API endpoints
 * Sử dụng axios để gọi API và ghi kết quả vào file log
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';

// Cấu hình
const CONFIG = {
  baseURL: 'http://localhost:3001',
  timeout: 10000,
  logFile: 'api-test-results.log'
};

// Biến lưu trữ token và dữ liệu test
let customerToken = '';
let managerToken = '';
let testData = {
  hotelId: null,
  roomId: null,
  bookingId: null,
  serviceId: null,
  promotionId: null,
  notificationId: null,
  resetToken: ''
};

// Axios instance
const api = axios.create({
  baseURL: CONFIG.baseURL,
  timeout: CONFIG.timeout,
  validateStatus: () => true // Chấp nhận tất cả status code
});

// Hàm ghi log
function logResult(testName, method, url, requestBody, response) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    testName,
    method,
    url,
    requestBody,
    response: {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      headers: response.headers
    }
  };
  
  const logLine = `\n${'='.repeat(80)}\n${JSON.stringify(logEntry, null, 2)}\n`;
  fs.appendFileSync(CONFIG.logFile, logLine);
  
  console.log(`✓ ${testName} - Status: ${response.status}`);
  return logEntry;
}

// Hàm test API
async function testAPI(testName, method, endpoint, data = null, headers = {}) {
  try {
    const config = {
      method,
      url: endpoint,
      headers,
      ...(data && { data })
    };
    
    const response = await api(config);
    logResult(testName, method, endpoint, data, response);
    return response;
  } catch (error) {
    console.error(`✗ ${testName} - Error:`, error.message);
    const errorResponse = {
      status: error.response?.status || 500,
      statusText: error.response?.statusText || 'Network Error',
      data: error.response?.data || { error: error.message }
    };
    logResult(testName, method, endpoint, data, errorResponse);
    return errorResponse;
  }
}

// Khởi tạo file log
function initLogFile() {
  const header = `API Test Results - Hotel Management System
Test started at: ${new Date().toISOString()}
Base URL: ${CONFIG.baseURL}
${'='.repeat(80)}`;
  
  fs.writeFileSync(CONFIG.logFile, header);
  console.log(`📝 Log file initialized: ${CONFIG.logFile}`);
}

// Test Suite
async function runAllTests() {
  console.log('🚀 Starting API Test Suite...\n');
  initLogFile();
  
  try {
    // 1. Health Check
    await testAPI('Health Check', 'GET', '/health');
    
    // 2. Authentication Tests
    console.log('\n📋 Testing Authentication APIs...');
    
    // Register Customer
    const customerData = {
      fullName: "Test Customer",
      email: "customer@test.com",
      password: "password123",
      phone: "0900000001"
    };
    await testAPI('Register Customer', 'POST', '/auth/register', customerData);
    
    // Register Manager
    const managerData = {
      fullName: "Test Manager", 
      email: "manager@test.com",
      password: "password123",
      phone: "0900000002"
    };
    await testAPI('Register Manager', 'POST', '/auth/register', managerData);
    
    // Login Customer
    const customerLoginResponse = await testAPI('Login Customer', 'POST', '/auth/login', {
      email: customerData.email,
      password: customerData.password
    });
    
    if (customerLoginResponse.status === 200) {
      customerToken = customerLoginResponse.data.token;
    }
    
    // Login Manager (Note: Cần promote role manually trong DB)
    const managerLoginResponse = await testAPI('Login Manager', 'POST', '/auth/login', {
      email: managerData.email,
      password: managerData.password
    });
    
    if (managerLoginResponse.status === 200) {
      managerToken = managerLoginResponse.data.token;
    }
    
    // Password Reset Request
    await testAPI('Request Password Reset', 'POST', '/auth/password/request-reset', {
      email: customerData.email
    });
    
    // Password Reset (với token giả)
    await testAPI('Reset Password', 'POST', '/auth/password/reset', {
      token: "dummy-token",
      newPassword: "newpassword123"
    });
    
    // 3. Hotel Management Tests
    console.log('\n🏨 Testing Hotel APIs...');
    
    // Get Hotels (public)
    await testAPI('Get Hotels (Public)', 'GET', '/hotels');
    
    // Create Hotel (Manager)
    const hotelData = {
      name: "Test Sunrise Hotel",
      address: "123 Beach Road, Da Nang",
      description: "Beautiful beachside hotel with modern amenities",
      images: ["https://example.com/hotel1.jpg", "https://example.com/hotel2.jpg"],
      policies: "Check-in: 14:00, Check-out: 12:00. Cancellation allowed >= 2 days before check-in."
    };
    
    const hotelResponse = await testAPI('Create Hotel (Manager)', 'POST', '/hotels', hotelData, {
      Authorization: `Bearer ${managerToken}`
    });
    
    if (hotelResponse.status === 200 || hotelResponse.status === 201) {
      testData.hotelId = hotelResponse.data.id;
    }
    
    // 4. Services Tests
    console.log('\n🛎️ Testing Services APIs...');
    
    // Get Services
    await testAPI('Get Services', 'GET', `/services?hotelId=${testData.hotelId || 1}`);
    
    // Create Service (Manager)
    const serviceData = {
      hotelId: testData.hotelId || 1,
      name: "Airport Pickup",
      description: "Comfortable airport transfer service",
      price: 150000
    };
    
    const serviceResponse = await testAPI('Create Service (Manager)', 'POST', '/services', serviceData, {
      Authorization: `Bearer ${managerToken}`
    });
    
    if (serviceResponse.status === 200 || serviceResponse.status === 201) {
      testData.serviceId = serviceResponse.data.id;
    }
    
    // Update Service
    await testAPI('Update Service (Manager)', 'PUT', `/services/${testData.serviceId || 1}`, {
      name: "Premium Airport Pickup",
      price: 200000
    }, {
      Authorization: `Bearer ${managerToken}`
    });
    
    // Delete Service
    await testAPI('Delete Service (Manager)', 'DELETE', `/services/${testData.serviceId || 1}`, null, {
      Authorization: `Bearer ${managerToken}`
    });
    
    // 5. Rooms Tests
    console.log('\n🛏️ Testing Rooms APIs...');
    
    // Get Rooms
    await testAPI('Get Rooms', 'GET', '/rooms');
    
    // Create Room (Manager)
    const roomData = {
      hotelId: testData.hotelId || 1,
      name: "Deluxe Ocean View",
      type: "DELUXE",
      pricePerNight: 1500000,
      capacity: 2,
      description: "Spacious room with ocean view and modern amenities",
      images: ["https://example.com/room1.jpg"]
    };
    
    const roomResponse = await testAPI('Create Room (Manager)', 'POST', '/rooms', roomData, {
      Authorization: `Bearer ${managerToken}`
    });
    
    if (roomResponse.status === 200 || roomResponse.status === 201) {
      testData.roomId = roomResponse.data.id;
    }
    
    // Update Room
    await testAPI('Update Room (Manager)', 'PUT', `/rooms/${testData.roomId || 1}`, {
      name: "Premium Deluxe Ocean View",
      pricePerNight: 1800000
    }, {
      Authorization: `Bearer ${managerToken}`
    });
    
    // 6. Promotions Tests
    console.log('\n🎉 Testing Promotions APIs...');
    
    // Get Promotions
    await testAPI('Get Promotions (Manager)', 'GET', `/promotions?hotelId=${testData.hotelId || 1}`, null, {
      Authorization: `Bearer ${managerToken}`
    });
    
    // Create Promotion
    const promotionData = {
      hotelId: testData.hotelId || 1,
      roomId: testData.roomId,
      code: "SUMMER2025",
      type: "PERCENT",
      value: 20,
      conditions: { minNights: 3 },
      startDate: "2025-10-01T00:00:00.000Z",
      endDate: "2025-12-31T23:59:59.000Z"
    };
    
    const promotionResponse = await testAPI('Create Promotion (Manager)', 'POST', '/promotions', promotionData, {
      Authorization: `Bearer ${managerToken}`
    });
    
    if (promotionResponse.status === 200 || promotionResponse.status === 201) {
      testData.promotionId = promotionResponse.data.id;
    }
    
    // Update Promotion
    await testAPI('Update Promotion (Manager)', 'PUT', `/promotions/${testData.promotionId || 1}`, {
      value: 25,
      active: true
    }, {
      Authorization: `Bearer ${managerToken}`
    });
    
    // Delete Promotion
    await testAPI('Delete Promotion (Manager)', 'DELETE', `/promotions/${testData.promotionId || 1}`, null, {
      Authorization: `Bearer ${managerToken}`
    });
    
    // 7. Search Tests
    console.log('\n🔍 Testing Search APIs...');
    
    await testAPI('Search Rooms', 'GET', '/search/rooms?q=deluxe&hotelId=1&guests=2&minPrice=500000&maxPrice=2000000&checkIn=2025-10-15&checkOut=2025-10-18');
    
    // 8. Bookings Tests
    console.log('\n📅 Testing Bookings APIs...');
    
    // Create Booking
    const bookingData = {
      roomId: testData.roomId || 1,
      checkIn: "2025-10-20",
      checkOut: "2025-10-22",
      method: "ONLINE"
    };
    
    const bookingResponse = await testAPI('Create Booking (Customer)', 'POST', '/bookings', bookingData, {
      Authorization: `Bearer ${customerToken}`
    });
    
    if (bookingResponse.status === 200 || bookingResponse.status === 201) {
      testData.bookingId = bookingResponse.data.id;
    }
    
    // Get My Bookings
    await testAPI('Get My Bookings (Customer)', 'GET', '/bookings', null, {
      Authorization: `Bearer ${customerToken}`
    });
    
    // Get All Bookings (Manager)
    await testAPI('Get All Bookings (Manager)', 'GET', '/bookings/all', null, {
      Authorization: `Bearer ${managerToken}`
    });
    
    // Update Booking Status
    await testAPI('Update Booking Status (Manager)', 'PATCH', `/bookings/${testData.bookingId || 1}/status`, {
      status: "CONFIRMED"
    }, {
      Authorization: `Bearer ${managerToken}`
    });
    
    // Cancel Booking
    await testAPI('Cancel Booking', 'POST', `/bookings/${testData.bookingId || 1}/cancel`, null, {
      Authorization: `Bearer ${customerToken}`
    });
    
    // 9. Payments Tests
    console.log('\n💳 Testing Payments APIs...');
    
    await testAPI('Pay Booking (Customer)', 'POST', `/payments/${testData.bookingId || 1}/pay`, {
      method: "CARD"
    }, {
      Authorization: `Bearer ${customerToken}`
    });
    
    // 10. Reviews Tests
    console.log('\n⭐ Testing Reviews APIs...');
    
    await testAPI('Create Review (Customer)', 'POST', '/reviews', {
      bookingId: testData.bookingId || 1,
      rating: 5,
      comment: "Excellent service and beautiful room with great ocean view!"
    }, {
      Authorization: `Bearer ${customerToken}`
    });
    
    // 11. Notifications Tests
    console.log('\n🔔 Testing Notifications APIs...');
    
    // Get Notifications
    const notificationsResponse = await testAPI('Get Notifications (Customer)', 'GET', '/notifications', null, {
      Authorization: `Bearer ${customerToken}`
    });
    
    // Mark Notification as Read
    await testAPI('Mark Notification as Read', 'PATCH', `/notifications/${testData.notificationId || 1}/read`, null, {
      Authorization: `Bearer ${customerToken}`
    });
    
    // 12. Dashboard Tests
    console.log('\n📊 Testing Dashboard APIs...');
    
    await testAPI('Get Dashboard Overview (Manager)', 'GET', '/dashboard/overview', null, {
      Authorization: `Bearer ${managerToken}`
    });
    
    console.log('\n✅ API Test Suite completed!');
    console.log(`📄 Results saved to: ${CONFIG.logFile}`);
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
}

// Export cho sử dụng module
export {
  runAllTests,
  testAPI,
  CONFIG
};

// Chạy test nếu file được execute trực tiếp
runAllTests();
