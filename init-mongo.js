// MongoDB initialization script
db = db.getSiblingDB('greencart');

// Create user
db.createUser({
  user: 'greencart_user',
  pwd: 'greencart123',
  roles: [
    {
      role: 'readWrite',
      db: 'greencart'
    }
  ]
});

// Create collections
db.createCollection('users');
db.createCollection('drivers');
db.createCollection('routes');
db.createCollection('orders');
db.createCollection('simulationresults');

print('Database initialized successfully!');
