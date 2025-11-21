/**
 * Setup Test Data Script
 * 
 * Script để setup dữ liệu test và promote manager role
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setupTestData() {
  try {
    console.log('🚀 Setting up test data...\n');

    // 1. Promote test users to MANAGER role
    console.log('👤 Promoting test users to MANAGER role...');
    
    const managerEmails = [
      'manager@test.com',
      'jest-manager@test.com',
      'manager1@example.com'
    ];

    for (const email of managerEmails) {
      try {
        const updated = await prisma.user.updateMany({
          where: { email },
          data: { role: 'MANAGER' }
        });
        
        if (updated.count > 0) {
          console.log(`✅ Promoted ${email} to MANAGER`);
        } else {
          console.log(`⚠️  User ${email} not found`);
        }
      } catch (error) {
        console.log(`❌ Failed to promote ${email}:`, error.message);
      }
    }

    // 2. Create sample hotel if not exists
    console.log('\n🏨 Creating sample hotel...');
    
    const existingHotel = await prisma.hotel.findFirst({
      where: { name: 'Sample Test Hotel' }
    });
    
    let sampleHotel;
    if (existingHotel) {
      sampleHotel = existingHotel;
      console.log(`✅ Hotel already exists: ID ${sampleHotel.id}`);
    } else {
      sampleHotel = await prisma.hotel.create({
        data: {
          name: 'Sample Test Hotel',
          address: '123 Test Street, Test City',
          description: 'A sample hotel for testing purposes',
          images: JSON.stringify(['https://example.com/hotel1.jpg']),
          policies: 'Check-in: 14:00, Check-out: 12:00. Cancellation >= 2 days before check-in.'
        }
      });
      console.log(`✅ Hotel created: ID ${sampleHotel.id}`);
    }

    // 3. Create sample room
    console.log('\n🛏️ Creating sample room...');
    
    const existingRoom = await prisma.room.findFirst({
      where: { 
        hotelId: sampleHotel.id,
        name: 'Standard Test Room'
      }
    });
    
    let sampleRoom;
    if (existingRoom) {
      sampleRoom = existingRoom;
      console.log(`✅ Room already exists: ID ${sampleRoom.id}`);
    } else {
      sampleRoom = await prisma.room.create({
        data: {
          hotelId: sampleHotel.id,
          name: 'Standard Test Room',
          type: 'STANDARD',
          pricePerNight: 1000000,
          capacity: 2,
          description: 'A standard room for testing',
          images: JSON.stringify(['https://example.com/room1.jpg']),
          status: 'AVAILABLE'
        }
      });
      console.log(`✅ Room created: ID ${sampleRoom.id}`);
    }

    // 4. Create sample service
    console.log('\n🛎️ Creating sample service...');
    
    const existingService = await prisma.service.findFirst({
      where: { 
        hotelId: sampleHotel.id,
        name: 'Airport Transfer'
      }
    });
    
    let sampleService;
    if (existingService) {
      sampleService = existingService;
      console.log(`✅ Service already exists: ID ${sampleService.id}`);
    } else {
      sampleService = await prisma.service.create({
        data: {
          hotelId: sampleHotel.id,
          name: 'Airport Transfer',
          description: 'Comfortable airport transfer service',
          price: 200000
        }
      });
      console.log(`✅ Service created: ID ${sampleService.id}`);
    }

    // 5. Display test accounts
    console.log('\n👥 Test accounts available:');
    
    const testUsers = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: 'test.com' } },
          { email: { contains: 'example.com' } }
        ]
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true
      }
    });

    if (testUsers.length > 0) {
      console.table(testUsers);
    } else {
      console.log('⚠️  No test users found. Please run the API tests first to create users.');
    }

    console.log('\n✅ Test data setup completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Start the server: npm run dev');
    console.log('2. Run API tests: npm run test:api');
    console.log('3. Or run Jest tests: npm run test:api:jest');

  } catch (error) {
    console.error('❌ Setup failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Export cho sử dụng module
export { setupTestData };

// Chạy setup nếu file được execute trực tiếp
setupTestData();
