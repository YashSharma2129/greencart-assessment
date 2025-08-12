const applyRules = (orderData) => {
  try {
    // Create a copy of the order data to avoid mutating the original
    const updatedOrderData = { ...orderData };
    
    // Rule: If order distance > 50 km → mark status as 'in-transit'
    // Else mark as 'pending'
    if (orderData.distance && orderData.distance > 50) {
      updatedOrderData.status = 'in-transit';
    } else {
      updatedOrderData.status = 'pending';
    }
    
    return updatedOrderData;
  } catch (error) {
    console.error('Error applying company rules:', error);
    // Return original data if there's an error
    return orderData;
  }
};

module.exports = { applyRules };
