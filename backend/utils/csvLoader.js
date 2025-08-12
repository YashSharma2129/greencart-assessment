const fs = require('fs');
const csv = require('csv-parser');
const Driver = require('../models/Driver');
const Route = require('../models/Route');
const Order = require('../models/Order');

/**
 * Load initial data from CSV files
 */
const loadInitialData = async (filePath, Model, dataType = 'general') => {
  try {
    const results = [];
    
    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => {
          // Convert CSV row to object based on data type
          const rowData = transformCsvRow(data, dataType);
          if (rowData) {
            results.push(rowData);
          }
        })
        .on('end', async () => {
          try {
            if (results.length === 0) {
              console.log('No data found in CSV file');
              resolve({ success: false, message: 'No data found in CSV file' });
              return;
            }
            
            // Clear existing data for fresh load
            await Model.deleteMany({});
            
            // Insert data into MongoDB
            const insertedData = await Model.insertMany(results);
            
            // If loading orders, link them to routes
            if (dataType === 'orders') {
              await linkOrdersToRoutes(insertedData);
            }
            
            console.log(`Successfully loaded ${insertedData.length} ${dataType} records from ${filePath}`);
            
            resolve({
              success: true,
              message: `Successfully loaded ${insertedData.length} ${dataType} records`,
              count: insertedData.length,
              data: insertedData
            });
          } catch (insertError) {
            console.error('Error inserting data:', insertError);
            reject({
              success: false,
              message: 'Error inserting data into database',
              error: insertError.message
            });
          }
        })
        .on('error', (error) => {
          console.error('Error reading CSV file:', error);
          reject({
            success: false,
            message: 'Error reading CSV file',
            error: error.message
          });
        });
    });
  } catch (error) {
    console.error('CSV loader error:', error);
    throw {
      success: false,
      message: 'CSV loader error',
      error: error.message
    };
  }
};

/**
 * Transform CSV row based on data type
 */
const transformCsvRow = (data, dataType) => {
  try {
    switch (dataType) {
      case 'drivers':
        return transformDriverRow(data);
      case 'routes':
        return transformRouteRow(data);
      case 'orders':
        return transformOrderRow(data);
      default:
        return transformGenericRow(data);
    }
  } catch (error) {
    console.error('Error transforming row:', error);
    return null;
  }
};

const transformDriverRow = (data) => {
  // Handle the new CSV format: name,shift_hours,past_week_hours
  const pastWeekHours = data.past_week_hours || data.past7DaysHours || '0|0|0|0|0|0|0';
  const hoursArray = pastWeekHours.split('|').map(h => parseInt(h) || 0);
  const totalWeekHours = hoursArray.reduce((sum, hours) => sum + hours, 0);
  
  return {
    name: cleanString(data.name || data.driver_name),
    licenseNumber: cleanString(data.license_number || data.licenseNumber || `LIC${Date.now()}${Math.floor(Math.random() * 1000)}`),
    phone: cleanString(data.phone || `+91-${Math.floor(Math.random() * 9000000000) + 1000000000}`),
    currentShiftHours: cleanNumber(data.shift_hours || data.currentShiftHours || 0),
    past7DaysHours: totalWeekHours,
    dailyHoursWorked: cleanNumber(data.shift_hours || data.dailyHoursWorked || 0),
    fatigueStatus: cleanBoolean(data.fatigue_status || data.fatigueStatus || false),
    isAvailable: cleanBoolean(data.is_available || data.isAvailable || true)
  };
};

const transformRouteRow = (data) => {
  // Handle the new CSV format: route_id,distance_km,traffic_level,base_time_min
  return {
    routeId: cleanString(data.route_id || data.routeId || `ROUTE${Date.now()}${Math.floor(Math.random() * 1000)}`),
    routeName: cleanString(data.route_name || data.routeName || `Route ${data.route_id || Math.floor(Math.random() * 1000)}`),
    startLocation: cleanString(data.start_location || data.startLocation || 'Warehouse'),
    endLocation: cleanString(data.end_location || data.endLocation || 'Customer Location'),
    distance: cleanNumber(data.distance_km || data.distance || Math.floor(Math.random() * 50) + 5),
    trafficLevel: cleanTrafficLevel(data.traffic_level || data.trafficLevel),
    baseTime: cleanNumber(data.base_time_min || data.baseTime || Math.floor(Math.random() * 60) + 30),
    estimatedTime: cleanNumber(data.estimated_time || data.estimatedTime || data.base_time_min || Math.floor(Math.random() * 60) + 30)
  };
};

const transformOrderRow = (data) => {
  // Handle the new CSV format: order_id,value_rs,route_id,delivery_time
  // Convert delivery_time to deliveryTimestamp
  const deliveryTime = data.delivery_time || '00:00';
  const [hours, minutes] = deliveryTime.split(':').map(t => parseInt(t) || 0);
  const totalMinutes = hours * 60 + minutes;
  
  return {
    orderId: cleanString(data.order_id || data.orderId || `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`),
    orderNumber: cleanString(data.order_number || data.orderNumber || `ON${data.order_id || Date.now()}${Math.floor(Math.random() * 1000)}`),
    customerName: cleanString(data.customer_name || data.customerName || `Customer ${data.order_id || Math.floor(Math.random() * 1000)}`),
    deliveryAddress: cleanString(data.delivery_address || data.deliveryAddress || `Address ${data.order_id || Math.floor(Math.random() * 1000)}`),
    value: cleanNumber(data.value_rs || data.value || Math.floor(Math.random() * 2000) + 200),
    routeId: cleanString(data.route_id || data.routeId),
    status: cleanString(data.status || 'pending'),
    deliveryTimestamp: data.delivery_timestamp ? new Date(data.delivery_timestamp) : null,
    estimatedDeliveryMinutes: totalMinutes
  };
};

const transformGenericRow = (data) => {
  const rowData = {};
  
  Object.keys(data).forEach(key => {
    let value = data[key].trim();
    
    // Convert numeric values
    if (!isNaN(value) && value !== '') {
      value = Number(value);
    }
    
    // Convert boolean values
    if (value.toLowerCase() === 'true') value = true;
    if (value.toLowerCase() === 'false') value = false;
    
    // Skip empty values
    if (value !== '') {
      rowData[key] = value;
    }
  });
  
  return rowData;
};


const cleanString = (value) => {
  if (!value) return '';
  return String(value).trim();
};

const cleanNumber = (value) => {
  if (!value && value !== 0) return 0;
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

const cleanBoolean = (value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true' || value === '1';
  }
  return Boolean(value);
};

const cleanTrafficLevel = (value) => {
  if (!value) return 'Medium';
  const level = String(value).trim().toLowerCase();
  if (['low', 'medium', 'high'].includes(level)) {
    return level.charAt(0).toUpperCase() + level.slice(1);
  }
  return 'Medium';
};

/**
 * Link orders to routes after loading
 */
const linkOrdersToRoutes = async (orders) => {
  try {
    for (const order of orders) {
      if (order.routeId) {
        const route = await Route.findOne({ routeId: order.routeId });
        if (route) {
          await Order.findByIdAndUpdate(order._id, { 
            assignedRoute: route._id 
          });
        }
      }
    }
  } catch (error) {
    console.error('Error linking orders to routes:', error);
  }
};

/**
 * Create sample data if no CSV is provided
 */
const createSampleData = async () => {
  try {
    console.log('Creating sample data...');
    
    // Create sample drivers
    const sampleDrivers = [
      {
        name: 'John Doe',
        licenseNumber: 'LIC001',
        phone: '+91-9876543210',
        currentShiftHours: 4,
        past7DaysHours: 35,
        dailyHoursWorked: 4,
        fatigueStatus: false,
        isAvailable: true
      },
      {
        name: 'Jane Smith',
        licenseNumber: 'LIC002',
        phone: '+91-9876543211',
        currentShiftHours: 6,
        past7DaysHours: 42,
        dailyHoursWorked: 6,
        fatigueStatus: false,
        isAvailable: true
      },
      {
        name: 'Mike Johnson',
        licenseNumber: 'LIC003',
        phone: '+91-9876543212',
        currentShiftHours: 9,
        past7DaysHours: 56,
        dailyHoursWorked: 9,
        fatigueStatus: true,
        isAvailable: true
      },
      {
        name: 'Sarah Wilson',
        licenseNumber: 'LIC004',
        phone: '+91-9876543213',
        currentShiftHours: 3,
        past7DaysHours: 28,
        dailyHoursWorked: 3,
        fatigueStatus: false,
        isAvailable: true
      },
      {
        name: 'David Brown',
        licenseNumber: 'LIC005',
        phone: '+91-9876543214',
        currentShiftHours: 7,
        past7DaysHours: 49,
        dailyHoursWorked: 7,
        fatigueStatus: false,
        isAvailable: true
      }
    ];

    // Create sample routes
    const sampleRoutes = [
      {
        routeId: 'ROUTE001',
        routeName: 'Downtown Circuit',
        startLocation: 'Central Warehouse',
        endLocation: 'Downtown Area',
        distance: 15,
        trafficLevel: 'High',
        baseTime: 45,
        estimatedTime: 50
      },
      {
        routeId: 'ROUTE002',
        routeName: 'Suburb Express',
        startLocation: 'Central Warehouse',
        endLocation: 'Suburb Area',
        distance: 25,
        trafficLevel: 'Medium',
        baseTime: 60,
        estimatedTime: 65
      },
      {
        routeId: 'ROUTE003',
        routeName: 'Industrial Zone',
        startLocation: 'Central Warehouse',
        endLocation: 'Industrial Area',
        distance: 20,
        trafficLevel: 'Low',
        baseTime: 40,
        estimatedTime: 40
      },
      {
        routeId: 'ROUTE004',
        routeName: 'Shopping District',
        startLocation: 'Central Warehouse',
        endLocation: 'Shopping Center',
        distance: 12,
        trafficLevel: 'High',
        baseTime: 35,
        estimatedTime: 45
      },
      {
        routeId: 'ROUTE005',
        routeName: 'Residential Area',
        startLocation: 'Central Warehouse',
        endLocation: 'Residential Zone',
        distance: 18,
        trafficLevel: 'Medium',
        baseTime: 50,
        estimatedTime: 55
      }
    ];

    // Clear existing data
    await Driver.deleteMany({});
    await Route.deleteMany({});
    await Order.deleteMany({});

    // Insert drivers and routes
    const drivers = await Driver.insertMany(sampleDrivers);
    const routes = await Route.insertMany(sampleRoutes);

    // Create sample orders
    const sampleOrders = [];
    for (let i = 1; i <= 20; i++) {
      const randomRoute = routes[Math.floor(Math.random() * routes.length)];
      sampleOrders.push({
        orderId: `ORD${String(i).padStart(3, '0')}`,
        orderNumber: `ON${String(i).padStart(3, '0')}`,
        customerName: `Customer ${i}`,
        deliveryAddress: `${i} Main Street, City`,
        value: Math.floor(Math.random() * 2000) + 200, // ₹200-2200
        assignedRoute: randomRoute._id,
        status: 'pending'
      });
    }

    const orders = await Order.insertMany(sampleOrders);

    console.log('Sample data created successfully');
    return {
      drivers: drivers.length,
      routes: routes.length,
      orders: orders.length
    };

  } catch (error) {
    console.error('Error creating sample data:', error);
    throw error;
  }
};

module.exports = { 
  loadInitialData,
  createSampleData,
  transformDriverRow,
  transformRouteRow,
  transformOrderRow
};
