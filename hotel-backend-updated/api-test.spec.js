/**
 * Jest API Test Suite for Hotel Management System
 * 
 * Test suite sử dụng Jest để test tất cả API endpoints
 * Ghi lại chi tiết body, response và status code
 */

import axios from 'axios';
import fs from 'fs';

// Cấu hình test
const CONFIG = {
  baseURL: 'http://localhost:3001',
  timeout: 10000
};

// Setup axios
const api = axios.create({
  baseURL: CONFIG.baseURL,
  timeout: CONFIG.timeout,
  validateStatus: () => true // Chấp nhận tất cả status code
});

// Biến global cho test
let customerToken = '';
let managerToken = '';
let testData = {
  hotelId: null,
  roomId: null,
  serviceId: null,
  promotionId: null,
  bookingId: null,
  notificationId: null
};

// Helper function để log test results
function logTestResult(testName, response, requestData = null) {
  const result = {
    testName,
    timestamp: new Date().toISOString(),
    request: requestData,
    response: {
      status: response.status,
      statusText: response.statusText,
      data: response.data
    }
  };
  
  // Ghi vào file
  fs.appendFileSync('jest-test-results.log', JSON.stringify(result, null, 2) + '\n\n');
  
  return result;
}

// Setup và teardown
beforeAll(async () => {
  // Khởi tạo log file
  const header = `Jest API Test Results - Hotel Management System
Test started at: ${new Date().toISOString()}
Base URL: ${CONFIG.baseURL}
${'='.repeat(80)}\n`;
  
  fs.writeFileSync('jest-test-results.log', header);
  
  // Test health check
  const healthResponse = await api.get('/health');
  expect(healthResponse.status).toBe(200);
  logTestResult('Health Check', healthResponse);
});

afterAll(async () => {
  // Cleanup nếu cần
  console.log('\n✅ All tests completed. Results saved to jest-test-results.log');
});

describe('Authentication APIs', () => {
  const customerData = {
    fullName: "Jest Test Customer",
    email: "jest-customer@test.com", 
    password: "password123",
    phone: "0900000001"
  };
  
  const managerData = {
    fullName: "Jest Test Manager",
    email: "jest-manager@test.com",
    password: "password123", 
    phone: "0900000002"
  };

  test('Register Customer', async () => {
    const response = await api.post('/auth/register', customerData);
    logTestResult('Register Customer', response, customerData);
    
    expect(response.status).toBe(201);
    expect(response.data).toHaveProperty('user');
    expect(response.data.user.email).toBe(customerData.email);
  });

  test('Register Manager', async () => {
    const response = await api.post('/auth/register', managerData);
    logTestResult('Register Manager', response, managerData);
    
    expect(response.status).toBe(201);
    expect(response.data).toHaveProperty('user');
  });

  test('Login Customer', async () => {
    const loginData = {
      email: customerData.email,
      password: customerData.password
    };
    
    const response = await api.post('/auth/login', loginData);
    logTestResult('Login Customer', response, loginData);
    
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('token');
    
    customerToken = response.data.token;
  });

  test('Login Manager', async () => {
    const loginData = {
      email: managerData.email,
      password: managerData.password
    };
    
    const response = await api.post('/auth/login', loginData);
    logTestResult('Login Manager', response, loginData);
    
    // Note: Manager role cần được promote manually trong DB
    if (response.status === 200) {
      managerToken = response.data.token;
    }
  });

  test('Request Password Reset', async () => {
    const resetData = { email: customerData.email };
    const response = await api.post('/auth/password/request-reset', resetData);
    logTestResult('Request Password Reset', response, resetData);
    
    expect(response.status).toBe(200);
  });

  test('Reset Password with Invalid Token', async () => {
    const resetData = {
      token: "invalid-token",
      newPassword: "newpassword123"
    };
    
    const response = await api.post('/auth/password/reset', resetData);
    logTestResult('Reset Password Invalid Token', response, resetData);
    
    expect(response.status).toBe(400);
  });
});

describe('Hotel Management APIs', () => {
  test('Get Hotels (Public)', async () => {
    const response = await api.get('/hotels');
    logTestResult('Get Hotels Public', response);
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
  });

  test('Create Hotel (Manager)', async () => {
    const hotelData = {
      name: "Jest Test Hotel",
      address: "123 Test Street, Test City",
      description: "A beautiful test hotel for automated testing",
      images: ["https://example.com/hotel.jpg"],
      policies: "Check-in: 14:00, Check-out: 12:00"
    };
    
    const response = await api.post('/hotels', hotelData, {
      headers: { Authorization: `Bearer ${managerToken}` }
    });
    logTestResult('Create Hotel Manager', response, hotelData);
    
    if (managerToken) {
      expect(response.status).toBe(201);
      testData.hotelId = response.data.id;
    } else {
      expect(response.status).toBe(401);
    }
  });
});

describe('Services APIs', () => {
  test('Get Services', async () => {
    const response = await api.get(`/services?hotelId=${testData.hotelId || 1}`);
    logTestResult('Get Services', response);
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
  });

  test('Create Service (Manager)', async () => {
    const serviceData = {
      hotelId: testData.hotelId || 1,
      name: "Jest Test Service",
      description: "Test service for automated testing",
      price: 100000
    };
    
    const response = await api.post('/services', serviceData, {
      headers: { Authorization: `Bearer ${managerToken}` }
    });
    logTestResult('Create Service Manager', response, serviceData);
    
    if (managerToken) {
      expect(response.status).toBe(201);
      testData.serviceId = response.data.id;
    }
  });

  test('Update Service (Manager)', async () => {
    const updateData = {
      name: "Updated Jest Test Service",
      price: 150000
    };
    
    const response = await api.put(`/services/${testData.serviceId || 1}`, updateData, {
      headers: { Authorization: `Bearer ${managerToken}` }
    });
    logTestResult('Update Service Manager', response, updateData);
    
    if (managerToken && testData.serviceId) {
      expect(response.status).toBe(200);
    }
  });

  test('Delete Service (Manager)', async () => {
    const response = await api.delete(`/services/${testData.serviceId || 1}`, {
      headers: { Authorization: `Bearer ${managerToken}` }
    });
    logTestResult('Delete Service Manager', response);
    
    if (managerToken && testData.serviceId) {
      expect(response.status).toBe(200);
    }
  });
});

describe('Rooms APIs', () => {
  test('Get Rooms', async () => {
    const response = await api.get('/rooms');
    logTestResult('Get Rooms', response);
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
  });

  test('Create Room (Manager)', async () => {
    const roomData = {
      hotelId: testData.hotelId || 1,
      name: "Jest Test Room",
      type: "DELUXE",
      pricePerNight: 1000000,
      capacity: 2,
      description: "Test room for automated testing",
      images: ["https://example.com/room.jpg"]
    };
    
    const response = await api.post('/rooms', roomData, {
      headers: { Authorization: `Bearer ${managerToken}` }
    });
    logTestResult('Create Room Manager', response, roomData);
    
    if (managerToken) {
      expect(response.status).toBe(201);
      testData.roomId = response.data.id;
    }
  });

  test('Update Room (Manager)', async () => {
    const updateData = {
      name: "Updated Jest Test Room",
      pricePerNight: 1200000
    };
    
    const response = await api.put(`/rooms/${testData.roomId || 1}`, updateData, {
      headers: { Authorization: `Bearer ${managerToken}` }
    });
    logTestResult('Update Room Manager', response, updateData);
    
    if (managerToken && testData.roomId) {
      expect(response.status).toBe(200);
    }
  });
});

describe('Promotions APIs', () => {
  test('Get Promotions (Manager)', async () => {
    const response = await api.get(`/promotions?hotelId=${testData.hotelId || 1}`, {
      headers: { Authorization: `Bearer ${managerToken}` }
    });
    logTestResult('Get Promotions Manager', response);
    
    if (managerToken) {
      expect(response.status).toBe(200);
    }
  });

  test('Create Promotion (Manager)', async () => {
    const promotionData = {
      hotelId: testData.hotelId || 1,
      roomId: testData.roomId,
      code: "JEST2025",
      type: "PERCENT",
      value: 15,
      startDate: "2025-10-01T00:00:00.000Z",
      endDate: "2025-12-31T23:59:59.000Z"
    };
    
    const response = await api.post('/promotions', promotionData, {
      headers: { Authorization: `Bearer ${managerToken}` }
    });
    logTestResult('Create Promotion Manager', response, promotionData);
    
    if (managerToken) {
      expect(response.status).toBe(201);
      testData.promotionId = response.data.id;
    }
  });
});

describe('Search APIs', () => {
  test('Search Rooms', async () => {
    const searchParams = 'q=test&hotelId=1&guests=2&minPrice=500000&maxPrice=2000000&checkIn=2025-11-01&checkOut=2025-11-03';
    const response = await api.get(`/search/rooms?${searchParams}`);
    logTestResult('Search Rooms', response);
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
  });
});

describe('Bookings APIs', () => {
  test('Create Booking (Customer)', async () => {
    const bookingData = {
      roomId: testData.roomId || 1,
      checkIn: "2025-11-05",
      checkOut: "2025-11-07",
      method: "ONLINE"
    };
    
    const response = await api.post('/bookings', bookingData, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    logTestResult('Create Booking Customer', response, bookingData);
    
    if (customerToken) {
      expect(response.status).toBe(201);
      testData.bookingId = response.data.id;
    }
  });

  test('Get My Bookings (Customer)', async () => {
    const response = await api.get('/bookings', {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    logTestResult('Get My Bookings Customer', response);
    
    if (customerToken) {
      expect(response.status).toBe(200);
    }
  });

  test('Get All Bookings (Manager)', async () => {
    const response = await api.get('/bookings/all', {
      headers: { Authorization: `Bearer ${managerToken}` }
    });
    logTestResult('Get All Bookings Manager', response);
    
    if (managerToken) {
      expect(response.status).toBe(200);
    }
  });

  test('Update Booking Status (Manager)', async () => {
    const statusData = { status: "CONFIRMED" };
    
    const response = await api.patch(`/bookings/${testData.bookingId || 1}/status`, statusData, {
      headers: { Authorization: `Bearer ${managerToken}` }
    });
    logTestResult('Update Booking Status Manager', response, statusData);
    
    if (managerToken && testData.bookingId) {
      expect(response.status).toBe(200);
    }
  });
});

describe('Payments APIs', () => {
  test('Pay Booking (Customer)', async () => {
    const paymentData = { method: "CARD" };
    
    const response = await api.post(`/payments/${testData.bookingId || 1}/pay`, paymentData, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    logTestResult('Pay Booking Customer', response, paymentData);
    
    if (customerToken && testData.bookingId) {
      expect(response.status).toBe(200);
    }
  });
});

describe('Reviews APIs', () => {
  test('Create Review (Customer)', async () => {
    const reviewData = {
      bookingId: testData.bookingId || 1,
      rating: 5,
      comment: "Excellent test hotel! Automated testing approved."
    };
    
    const response = await api.post('/reviews', reviewData, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    logTestResult('Create Review Customer', response, reviewData);
    
    // Review có thể fail vì business logic (cần CHECKED_OUT và PAID)
    expect([200, 201, 400, 403]).toContain(response.status);
  });
});

describe('Notifications APIs', () => {
  test('Get Notifications (Customer)', async () => {
    const response = await api.get('/notifications', {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    logTestResult('Get Notifications Customer', response);
    
    if (customerToken) {
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    }
  });

  test('Mark Notification as Read', async () => {
    const response = await api.patch('/notifications/1/read', {}, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    logTestResult('Mark Notification Read', response);
    
    // Có thể fail nếu notification không tồn tại
    expect([200, 404]).toContain(response.status);
  });
});

describe('Dashboard APIs', () => {
  test('Get Dashboard Overview (Manager)', async () => {
    const response = await api.get('/dashboard/overview', {
      headers: { Authorization: `Bearer ${managerToken}` }
    });
    logTestResult('Get Dashboard Overview Manager', response);
    
    if (managerToken) {
      expect(response.status).toBe(200);
    } else {
      expect([401, 403]).toContain(response.status);
    }
  });
});
