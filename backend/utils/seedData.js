const mongoose = require('mongoose');
const Driver = require('../models/Driver');
const Route = require('../models/Route');
const Order = require('../models/Order');
require('dotenv').config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected for seeding...');

    // Clear existing data
    await Driver.deleteMany({});
    await Route.deleteMany({});
    await Order.deleteMany({});
    console.log('Cleared existing data');

    // Seed Routes
    const routes = [
      {
        routeName: 'Downtown Express',
        startLocation: 'Central Hub',
        endLocation: 'Downtown District',
        distance: 15,
        baseTime: 30,
        trafficLevel: 'Medium',
        isActive: true,
        maxOrders: 5
      },
      {
        routeName: 'Suburban Loop',
        startLocation: 'Central Hub',
        endLocation: 'Suburban Area',
        distance: 25,
        baseTime: 45,
        trafficLevel: 'Low',
        isActive: true,
        maxOrders: 8
      },
      {
        routeName: 'Industrial Zone',
        startLocation: 'Central Hub',
        endLocation: 'Industrial District',
        distance: 12,
        baseTime: 25,
        trafficLevel: 'High',
        isActive: true,
        maxOrders: 4
      },
      {
        routeName: 'City Center',
        startLocation: 'Central Hub',
        endLocation: 'City Center',
        distance: 8,
        baseTime: 20,
        trafficLevel: 'High',
        isActive: true,
        maxOrders: 6
      },
      {
        routeName: 'Northern Hills',
        startLocation: 'Central Hub',
        endLocation: 'Northern Hills',
        distance: 35,
        baseTime: 60,
        trafficLevel: 'Low',
        isActive: true,
        maxOrders: 3
      }
    ];

    const createdRoutes = await Route.insertMany(routes);
    console.log(`Created ${createdRoutes.length} routes`);

    // Seed Drivers
    const drivers = [
      {
        name: 'Rajesh Kumar',
        licenseNumber: 'DL-1234567890',
        phone: '+91-9876543210',
        assignedRoute: createdRoutes[0]._id,
        currentShiftHours: 4,
        past7DaysHours: 32,
        dailyHoursWorked: 4,
        fatigueStatus: false,
        isAvailable: true
      },
      {
        name: 'Priya Sharma',
        licenseNumber: 'DL-2345678901',
        phone: '+91-9765432109',
        assignedRoute: createdRoutes[1]._id,
        currentShiftHours: 6,
        past7DaysHours: 45,
        dailyHoursWorked: 6,
        fatigueStatus: false,
        isAvailable: true
      },
      {
        name: 'Amit Singh',
        licenseNumber: 'DL-3456789012',
        phone: '+91-9654321098',
        assignedRoute: createdRoutes[2]._id,
        currentShiftHours: 8,
        past7DaysHours: 56,
        dailyHoursWorked: 8,
        fatigueStatus: false,
        isAvailable: true
      },
      {
        name: 'Deepika Patel',
        licenseNumber: 'DL-4567890123',
        phone: '+91-9543210987',
        assignedRoute: null,
        currentShiftHours: 2,
        past7DaysHours: 18,
        dailyHoursWorked: 2,
        fatigueStatus: false,
        isAvailable: true
      },
      {
        name: 'Vikram Gupta',
        licenseNumber: 'DL-5678901234',
        phone: '+91-9432109876',
        assignedRoute: createdRoutes[3]._id,
        currentShiftHours: 9,
        past7DaysHours: 62,
        dailyHoursWorked: 9,
        fatigueStatus: true,
        isAvailable: false
      },
      {
        name: 'Anita Verma',
        licenseNumber: 'DL-6789012345',
        phone: '+91-9321098765',
        assignedRoute: createdRoutes[4]._id,
        currentShiftHours: 3,
        past7DaysHours: 25,
        dailyHoursWorked: 3,
        fatigueStatus: false,
        isAvailable: true
      }
    ];

    const createdDrivers = await Driver.insertMany(drivers);
    console.log(`Created ${createdDrivers.length} drivers`);

    // Seed Orders
    const orders = [
      {
        customerId: 'CUST001',
        customerName: 'Ravi Agarwal',
        deliveryAddress: '123 MG Road, Downtown District',
        items: ['Electronics', 'Mobile Accessories'],
        value: 1250,
        status: 'Assigned',
        assignedDriver: createdDrivers[0]._id,
        assignedRoute: createdRoutes[0]._id,
        estimatedDeliveryTime: 35,
        actualDeliveryTime: null,
        isHighValue: true,
        priorityLevel: 'High'
      },
      {
        customerId: 'CUST002',
        customerName: 'Sunita Joshi',
        deliveryAddress: '456 Park Street, Suburban Area',
        items: ['Clothing', 'Shoes'],
        value: 800,
        status: 'Pending',
        assignedDriver: null,
        assignedRoute: null,
        estimatedDeliveryTime: 45,
        actualDeliveryTime: null,
        isHighValue: false,
        priorityLevel: 'Medium'
      },
      {
        customerId: 'CUST003',
        customerName: 'Manish Tiwari',
        deliveryAddress: '789 Industrial Road, Industrial District',
        items: ['Tools', 'Hardware'],
        value: 1800,
        status: 'Assigned',
        assignedDriver: createdDrivers[2]._id,
        assignedRoute: createdRoutes[2]._id,
        estimatedDeliveryTime: 30,
        actualDeliveryTime: null,
        isHighValue: true,
        priorityLevel: 'High'
      },
      {
        customerId: 'CUST004',
        customerName: 'Kavita Reddy',
        deliveryAddress: '321 Central Plaza, City Center',
        items: ['Books', 'Stationery'],
        value: 450,
        status: 'Delivered',
        assignedDriver: createdDrivers[1]._id,
        assignedRoute: createdRoutes[3]._id,
        estimatedDeliveryTime: 25,
        actualDeliveryTime: 22,
        isHighValue: false,
        priorityLevel: 'Low'
      },
      {
        customerId: 'CUST005',
        customerName: 'Arjun Malhotra',
        deliveryAddress: '654 Hill View, Northern Hills',
        items: ['Home Appliances'],
        value: 2200,
        status: 'Assigned',
        assignedDriver: createdDrivers[5]._id,
        assignedRoute: createdRoutes[4]._id,
        estimatedDeliveryTime: 65,
        actualDeliveryTime: null,
        isHighValue: true,
        priorityLevel: 'High'
      },
      {
        customerId: 'CUST006',
        customerName: 'Neha Kapoor',
        deliveryAddress: '987 Garden Colony, Suburban Area',
        items: ['Cosmetics', 'Personal Care'],
        value: 650,
        status: 'Pending',
        assignedDriver: null,
        assignedRoute: null,
        estimatedDeliveryTime: 40,
        actualDeliveryTime: null,
        isHighValue: false,
        priorityLevel: 'Medium'
      },
      {
        customerId: 'CUST007',
        customerName: 'Rohit Saxena',
        deliveryAddress: '147 Business District, Downtown District',
        items: ['Office Supplies', 'Furniture'],
        value: 1600,
        status: 'Delivered',
        assignedDriver: createdDrivers[0]._id,
        assignedRoute: createdRoutes[0]._id,
        estimatedDeliveryTime: 35,
        actualDeliveryTime: 38,
        isHighValue: true,
        priorityLevel: 'High'
      },
      {
        customerId: 'CUST008',
        customerName: 'Pooja Bhatt',
        deliveryAddress: '258 Tech Park, Industrial District',
        items: ['Computer Parts'],
        value: 980,
        status: 'In Transit',
        assignedDriver: createdDrivers[2]._id,
        assignedRoute: createdRoutes[2]._id,
        estimatedDeliveryTime: 28,
        actualDeliveryTime: null,
        isHighValue: false,
        priorityLevel: 'Medium'
      }
    ];

    const createdOrders = await Order.insertMany(orders);
    console.log(`Created ${createdOrders.length} orders`);

    console.log('\n✅ Database seeding completed successfully!');
    console.log(`\nSummary:`);
    console.log(`- Routes: ${createdRoutes.length}`);
    console.log(`- Drivers: ${createdDrivers.length}`);
    console.log(`- Orders: ${createdOrders.length}`);
    
    console.log('\n📊 Data Distribution:');
    console.log(`- Available Drivers: ${createdDrivers.filter(d => d.isAvailable).length}`);
    console.log(`- Fatigued Drivers: ${createdDrivers.filter(d => d.fatigueStatus).length}`);
    console.log(`- High-Value Orders: ${createdOrders.filter(o => o.isHighValue).length}`);
    console.log(`- Delivered Orders: ${createdOrders.filter(o => o.status === 'Delivered').length}`);

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run seeding if called directly
if (require.main === module) {
  seedData();
}

module.exports = seedData;
