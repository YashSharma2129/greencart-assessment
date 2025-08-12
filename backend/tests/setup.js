// Test setup file - Mock database connections for faster, isolated tests

// Set environment variables first before any modules are loaded
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-testing';
process.env.MONGO_URI = 'mongodb://localhost:27017/test-db';

// Mock the database connection module before it's imported anywhere
jest.doMock('../config/db', () => jest.fn().mockResolvedValue(true));

// Mock mongoose to prevent real database connections
jest.doMock('mongoose', () => {
  const actualMongoose = jest.requireActual('mongoose');
  return {
    ...actualMongoose,
    connect: jest.fn().mockResolvedValue(true),
    disconnect: jest.fn().mockResolvedValue(true),
    connection: {
      ...actualMongoose.connection,
      close: jest.fn().mockResolvedValue(true),
      readyState: 1 // Connected state
    }
  };
});

// Global cleanup for tests
afterAll(async () => {
  // Clean up any timers and handles
  jest.clearAllTimers();
  
  // Force garbage collection if available
  if (global.gc) {
    global.gc();
  }
});

// Clean up after each test
afterEach(async () => {
  // Clear all mocks after each test
  jest.clearAllMocks();
});
