// Smart Dynamic Data Generator
export class SmartDataGenerator {
  private static productNames = [
    'Fresh Tomatoes', 'Basmati Rice', 'Organic Milk', 'Wheat Flour', 'Cooking Oil',
    'Fresh Onions', 'Potatoes', 'Green Chilies', 'Ginger', 'Garlic',
    'Toor Dal', 'Moong Dal', 'Chana Dal', 'Masoor Dal', 'Urad Dal',
    'Turmeric Powder', 'Red Chili Powder', 'Coriander Powder', 'Cumin Seeds', 'Mustard Seeds',
    'Fresh Spinach', 'Cauliflower', 'Cabbage', 'Carrots', 'Beetroot',
    'Paneer', 'Yogurt', 'Butter', 'Cheese', 'Cream',
    'Chicken', 'Mutton', 'Fish', 'Eggs', 'Prawns'
  ];

  private static categories = [
    { name: 'Vegetables', slug: 'vegetables' },
    { name: 'Grains & Cereals', slug: 'grains' },
    { name: 'Dairy Products', slug: 'dairy' },
    { name: 'Pulses & Lentils', slug: 'pulses' },
    { name: 'Spices & Seasonings', slug: 'spices' },
    { name: 'Meat & Seafood', slug: 'meat' }
  ];

  private static customerNames = [
    'Rajesh Sharma', 'Priya Patel', 'Amit Kumar', 'Sunita Singh', 'Vikram Gupta',
    'Meera Joshi', 'Ravi Verma', 'Kavita Agarwal', 'Suresh Yadav', 'Pooja Mishra'
  ];

  private static addresses = [
    'MG Road, Shirpur', 'Station Road, Shirpur', 'Gandhi Chowk, Shirpur',
    'Market Yard, Shirpur', 'Civil Hospital Road, Shirpur', 'Bus Stand Area, Shirpur',
    'College Road, Shirpur', 'Industrial Area, Shirpur', 'New Colony, Shirpur',
    'Old City, Shirpur'
  ];

  static generateProducts(count = 20) {
    const products = [];
    
    for (let i = 1; i <= count; i++) {
      const category = this.categories[Math.floor(Math.random() * this.categories.length)];
      const name = this.productNames[Math.floor(Math.random() * this.productNames.length)];
      
      products.push({
        id: i,
        name: name,
        description: `Fresh and high-quality ${name.toLowerCase()}`,
        price: this.generatePrice(category.slug),
        imageUrl: '/placeholder.svg',
        category: category.name,
        stockQuantity: this.generateStock(),
        isActive: Math.random() > 0.1, // 90% active
        createdAt: this.generateRandomDate(),
        sku: `SKU${i.toString().padStart(3, '0')}`,
        unit: this.getUnit(category.slug)
      });
    }
    
    return products;
  }

  static generateOrders(count = 15) {
    const orders = [];
    const statuses = ['pending', 'processing', 'out_for_delivery', 'delivered', 'cancelled'];
    const paymentStatuses = ['pending', 'paid', 'failed'];
    
    for (let i = 1; i <= count; i++) {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const paymentStatus = status === 'delivered' ? 'paid' : 
                           paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)];
      
      const itemCount = Math.floor(Math.random() * 4) + 1;
      const items = this.generateOrderItems(itemCount);
      const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      orders.push({
        id: i,
        orderId: `ORD${i.toString().padStart(3, '0')}`,
        customerName: this.customerNames[Math.floor(Math.random() * this.customerNames.length)],
        customerPhone: this.generatePhone(),
        deliveryAddress: this.addresses[Math.floor(Math.random() * this.addresses.length)],
        total: total,
        status: status,
        paymentStatus: paymentStatus,
        items: items,
        createdAt: this.generateRecentDate(),
        estimatedDelivery: this.generateDeliveryTime(),
        deliveryFee: 20
      });
    }
    
    return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  static generateCategories() {
    return this.categories.map((cat, index) => ({
      id: index + 1,
      name: cat.name,
      slug: cat.slug,
      isActive: true,
      createdAt: new Date().toISOString()
    }));
  }

  static generateDeliveryAgents(count = 5) {
    const agents = [];
    const vehicleTypes = ['Bike', 'Scooter', 'Bicycle'];
    
    for (let i = 1; i <= count; i++) {
      agents.push({
        id: i,
        name: `Agent ${i}`,
        phone: this.generatePhone(),
        email: `agent${i}@shirpur.com`,
        vehicleType: vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)],
        licenseNumber: `DL${i}${Math.random().toString().substr(2, 8)}`,
        isActive: Math.random() > 0.2, // 80% active
        currentLat: 21.3486 + (Math.random() - 0.5) * 0.01, // Around Shirpur
        currentLng: 74.8811 + (Math.random() - 0.5) * 0.01,
        totalDeliveries: Math.floor(Math.random() * 100) + 10,
        rating: (Math.random() * 2 + 3).toFixed(1), // 3.0 to 5.0
        createdAt: this.generateRandomDate()
      });
    }
    
    return agents;
  }

  // Real-time data simulation
  static simulateRealTimeUpdates() {
    const updates = {
      newOrders: Math.random() > 0.7, // 30% chance
      stockUpdates: Math.random() > 0.5, // 50% chance
      deliveryUpdates: Math.random() > 0.6, // 40% chance
      priceChanges: Math.random() > 0.9 // 10% chance
    };
    
    return updates;
  }

  static generateLiveMetrics() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return {
      activeUsers: Math.floor(Math.random() * 50) + 10,
      ordersToday: Math.floor(Math.random() * 20) + 5,
      revenueToday: Math.floor(Math.random() * 5000) + 1000,
      averageDeliveryTime: Math.floor(Math.random() * 20) + 25, // 25-45 minutes
      customerSatisfaction: (Math.random() * 1 + 4).toFixed(1), // 4.0-5.0
      peakHours: this.getPeakHours(),
      lastUpdated: now.toISOString()
    };
  }

  // Helper methods
  private static generatePrice(category: string) {
    const basePrices = {
      vegetables: [20, 80],
      grains: [40, 150],
      dairy: [30, 120],
      pulses: [80, 200],
      spices: [15, 100],
      meat: [200, 600]
    };
    
    const range = basePrices[category] || [20, 100];
    return Math.floor(Math.random() * (range[1] - range[0]) + range[0]);
  }

  private static generateStock() {
    const stockLevels = [0, 2, 5, 8, 15, 25, 50, 100, 150];
    return stockLevels[Math.floor(Math.random() * stockLevels.length)];
  }

  private static getUnit(category: string) {
    const units = {
      vegetables: 'kg',
      grains: 'kg',
      dairy: 'ltr',
      pulses: 'kg',
      spices: 'gm',
      meat: 'kg'
    };
    return units[category] || 'piece';
  }

  private static generatePhone() {
    return `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`;
  }

  private static generateRandomDate() {
    const start = new Date(2024, 0, 1);
    const end = new Date();
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
  }

  private static generateRecentDate() {
    const now = new Date();
    const daysAgo = Math.floor(Math.random() * 7); // Last 7 days
    const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    return date.toISOString();
  }

  private static generateDeliveryTime() {
    const now = new Date();
    const deliveryTime = new Date(now.getTime() + (Math.random() * 60 + 30) * 60 * 1000); // 30-90 minutes
    return deliveryTime.toISOString();
  }

  private static generateOrderItems(count: number) {
    const items = [];
    const usedProducts = new Set();
    
    for (let i = 0; i < count; i++) {
      let productId;
      do {
        productId = Math.floor(Math.random() * 20) + 1;
      } while (usedProducts.has(productId));
      
      usedProducts.add(productId);
      
      const productName = this.productNames[Math.floor(Math.random() * this.productNames.length)];
      const price = Math.floor(Math.random() * 100) + 20;
      const quantity = Math.floor(Math.random() * 3) + 1;
      
      items.push({
        id: i + 1,
        productId: productId,
        productName: productName,
        price: price,
        quantity: quantity
      });
    }
    
    return items;
  }

  private static getPeakHours() {
    const hours = [];
    const peakTimes = [
      { start: 8, end: 10, label: 'Morning' },
      { start: 12, end: 14, label: 'Lunch' },
      { start: 18, end: 21, label: 'Evening' }
    ];
    
    return peakTimes[Math.floor(Math.random() * peakTimes.length)];
  }
}

// Initialize smart data on first load
export const initializeSmartData = () => {
  const hasData = localStorage.getItem('smartDataInitialized');
  
  if (!hasData) {
    const products = SmartDataGenerator.generateProducts(25);
    const orders = SmartDataGenerator.generateOrders(20);
    const categories = SmartDataGenerator.generateCategories();
    const agents = SmartDataGenerator.generateDeliveryAgents(6);
    
    localStorage.setItem('smartProducts', JSON.stringify(products));
    localStorage.setItem('smartOrders', JSON.stringify(orders));
    localStorage.setItem('smartCategories', JSON.stringify(categories));
    localStorage.setItem('smartAgents', JSON.stringify(agents));
    localStorage.setItem('smartDataInitialized', 'true');
    
    console.log('🎯 Smart data initialized with realistic content');
  }
};