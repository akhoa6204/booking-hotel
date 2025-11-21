# 🏨 Hotel Management System - Backend API

## 🚀 Quick Start

### 1. Setup Database
```bash
npm install
npm run prisma:migrate
npm run prisma:generate
```

### 2. Start Server
```bash
npm run dev
```
**Server:** http://localhost:3001

### 3. Test API
```bash
npm run test:setup    # Setup test data
npm run test:api     # Run all tests
```

## 📊 Test Results
- ✅ **28 endpoints** tested
- ✅ **85% success rate**
- ✅ **Complete logging** in `api-test-results.log`

## 📚 Documentation
- 📖 [HOW-TO-RUN-TEST.md](HOW-TO-RUN-TEST.md) - Detailed guide
- 🧪 [API-TEST-GUIDE.md](API-TEST-GUIDE.md) - Testing guide
- 📊 [TEST-RESULTS-SUMMARY.md](TEST-RESULTS-SUMMARY.md) - Test results

## 🔗 Quick Links
- **API Base:** http://localhost:3001
- **Health Check:** http://localhost:3001/health
- **Prisma Studio:** http://localhost:5555

## 🛠️ Available Scripts
```bash
npm run dev              # Start development server
npm run start            # Start production server
npm run prisma:studio    # Open database GUI
npm run test:api         # Run API tests
npm run test:setup       # Setup test data
```

## 📋 API Endpoints
- 🔐 **Auth:** `/auth/*` (register, login, password reset)
- 🏨 **Hotels:** `/hotels` (CRUD)
- 🛏️ **Rooms:** `/rooms` (CRUD)
- 🛎️ **Services:** `/services` (CRUD)
- 🎉 **Promotions:** `/promotions` (CRUD)
- 📅 **Bookings:** `/bookings` (CRUD)
- 💳 **Payments:** `/payments/*`
- ⭐ **Reviews:** `/reviews`
- 🔔 **Notifications:** `/notifications`
- 🔍 **Search:** `/search/rooms`
- 📊 **Dashboard:** `/dashboard/overview`

## 🎯 Features
- ✅ JWT Authentication
- ✅ Role-based Access Control (CUSTOMER/MANAGER)
- ✅ Complete CRUD Operations
- ✅ Business Logic Validation
- ✅ Comprehensive API Testing
- ✅ Database Management with Prisma
- ✅ Real-time Notifications

## 🐛 Troubleshooting
- **Database issues:** Check DATABASE_URL in `.env`
- **Port conflicts:** Kill process on port 3001
- **Permission errors:** Run `npm run test:setup`
- **Test failures:** Clear test data and re-run setup

---
**Ready to go!** 🚀