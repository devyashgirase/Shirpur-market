// Real-time dynamic data generator - NO STATIC DATA
export class DataGenerator {
  private static orderCounter = Date.now() % 10000;
  private static agentCounter = 1;
  private static productCounter = 1;

  // Generate unique order ID based on timestamp
  static generateOrderId(): string {
    return `ORD${Date.now()}_${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  }

  // Generate random customer data with real Indian names
  static generateCustomer() {
    const firstNames = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan', 'Shaurya', 'Atharv', 'Advik', 'Pranav', 'Vivek', 'Ananya', 'Fatima', 'Ira', 'Priya', 'Riya', 'Anvi', 'Kavya', 'Pihu', 'Myra', 'Sara', 'Aanya', 'Pari', 'Avni', 'Diya', 'Khushi'];
    const lastNames = ['Sharma', 'Patel', 'Kumar', 'Singh', 'Gupta', 'Jain', 'Agarwal', 'Verma', 'Yadav', 'Mishra', 'Tiwari', 'Pandey', 'Joshi', 'Sinha', 'Reddy', 'Nair', 'Menon', 'Iyer', 'Chopra', 'Malhotra'];
    const areas = ['MG Road', 'Station Road', 'Gandhi Chowk', 'Market Area', 'Civil Lines', 'Shivaji Nagar', 'Nehru Colony', 'Ambedkar Nagar', 'Saraswati Nagar', 'Indira Colony'];
    
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const area = areas[Math.floor(Math.random() * areas.length)];
    
    return {
      name: `${firstName} ${lastName}`,
      phone: `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      address: `${Math.floor(Math.random() * 999) + 1}, ${area}, Shirpur, Maharashtra 425405`,
      coordinates: this.generateShirpurCoordinates()
    };
  }

  // Generate delivery agent data with real names
  static generateDeliveryAgent() {
    const names = ['Ravi Kumar', 'Suresh Patil', 'Mahesh Joshi', 'Deepak Yadav', 'Santosh More', 'Vikram Singh', 'Ajay Sharma', 'Rohit Gupta', 'Amit Verma', 'Sanjay Tiwari'];
    const name = names[Math.floor(Math.random() * names.length)];
    
    return {
      id: `AGENT_${Date.now()}_${String(this.agentCounter++).padStart(3, '0')}`,
      name,
      phone: `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      location: {
        lat: 21.3487 + (Math.random() - 0.5) * 0.05,
        lng: 74.8831 + (Math.random() - 0.5) * 0.05
      },
      isActive: Math.random() > 0.3, // 70% chance of being active
      rating: 3.5 + Math.random() * 1.5, // Rating between 3.5-5.0
      completedDeliveries: Math.floor(Math.random() * 500) + 50
    };
  }

  // Generate completely dynamic products with real-time pricing
  static generateProducts(count: number = 50) {
    const productTemplates = [
      { name: 'Basmati Rice', category: 'Grains', unit: 'kg', basePrice: 120, seasonal: false },
      { name: 'Wheat Flour', category: 'Grains', unit: 'kg', basePrice: 45, seasonal: false },
      { name: 'Toor Dal', category: 'Pulses', unit: 'kg', basePrice: 85, seasonal: false },
      { name: 'Moong Dal', category: 'Pulses', unit: 'kg', basePrice: 95, seasonal: false },
      { name: 'Chana Dal', category: 'Pulses', unit: 'kg', basePrice: 75, seasonal: false },
      { name: 'Sunflower Oil', category: 'Oil', unit: 'liter', basePrice: 150, seasonal: false },
      { name: 'Mustard Oil', category: 'Oil', unit: 'liter', basePrice: 180, seasonal: false },
      { name: 'White Sugar', category: 'Sweeteners', unit: 'kg', basePrice: 42, seasonal: false },
      { name: 'Jaggery', category: 'Sweeteners', unit: 'kg', basePrice: 65, seasonal: true },
      { name: 'Tea Powder', category: 'Beverages', unit: 'pack', basePrice: 95, seasonal: false },
      { name: 'Coffee Powder', category: 'Beverages', unit: 'pack', basePrice: 120, seasonal: false },
      { name: 'Fresh Milk', category: 'Dairy', unit: 'liter', basePrice: 28, seasonal: false },
      { name: 'Paneer', category: 'Dairy', unit: 'pack', basePrice: 80, seasonal: false },
      { name: 'Curd', category: 'Dairy', unit: 'pack', basePrice: 25, seasonal: false },
      { name: 'Red Onions', category: 'Vegetables', unit: 'kg', basePrice: 35, seasonal: true },
      { name: 'Potatoes', category: 'Vegetables', unit: 'kg', basePrice: 25, seasonal: true },
      { name: 'Tomatoes', category: 'Vegetables', unit: 'kg', basePrice: 40, seasonal: true },
      { name: 'Green Chilies', category: 'Vegetables', unit: 'kg', basePrice: 60, seasonal: true },
      { name: 'Ginger', category: 'Vegetables', unit: 'kg', basePrice: 80, seasonal: true },
      { name: 'Garlic', category: 'Vegetables', unit: 'kg', basePrice: 120, seasonal: true },
      { name: 'Fresh Apples', category: 'Fruits', unit: 'kg', basePrice: 150, seasonal: true },
      { name: 'Bananas', category: 'Fruits', unit: 'dozen', basePrice: 60, seasonal: true },
      { name: 'Oranges', category: 'Fruits', unit: 'kg', basePrice: 80, seasonal: true },
      { name: 'Mangoes', category: 'Fruits', unit: 'kg', basePrice: 200, seasonal: true },
      { name: 'Grapes', category: 'Fruits', unit: 'kg', basePrice: 120, seasonal: true },
      { name: 'Bread', category: 'Bakery', unit: 'pack', basePrice: 25, seasonal: false },
      { name: 'Biscuits', category: 'Snacks', unit: 'pack', basePrice: 20, seasonal: false },
      { name: 'Namkeen', category: 'Snacks', unit: 'pack', basePrice: 35, seasonal: false },
      { name: 'Chips', category: 'Snacks', unit: 'pack', basePrice: 30, seasonal: false },
      { name: 'Noodles', category: 'Instant Food', unit: 'pack', basePrice: 15, seasonal: false }
    ];

    return Array.from({ length: count }, (_, i) => {
      const template = productTemplates[i % productTemplates.length];
      const currentTime = Date.now();
      const hourOfDay = new Date().getHours();
      
      // Dynamic pricing based on time, demand, and seasonality
      let priceMultiplier = 1;
      
      // Peak hours pricing (7-9 AM, 6-8 PM)
      if ((hourOfDay >= 7 && hourOfDay <= 9) || (hourOfDay >= 18 && hourOfDay <= 20)) {
        priceMultiplier += 0.1;
      }
      
      // Seasonal pricing
      if (template.seasonal) {
        const seasonalVariation = Math.sin((currentTime / (1000 * 60 * 60 * 24)) * Math.PI / 30) * 0.2;
        priceMultiplier += seasonalVariation;
      }
      
      // Random market fluctuation
      priceMultiplier += (Math.random() - 0.5) * 0.3;
      
      // Ensure minimum price
      priceMultiplier = Math.max(0.7, priceMultiplier);
      
      const dynamicPrice = Math.round(template.basePrice * priceMultiplier);
      const dynamicStock = Math.floor(Math.random() * 100) + 5;
      
      return {
        id: `PROD_${currentTime}_${String(this.productCounter++).padStart(3, '0')}`,
        name: template.name,
        category: template.category,
        price: dynamicPrice,
        unit: template.unit,
        stock_qty: dynamicStock,
        sku: `SKU${currentTime.toString().slice(-6)}${String(i + 1).padStart(3, '0')}`,
        description: `Fresh ${template.name.toLowerCase()} - Market price updated in real-time`,
        lastUpdated: currentTime,
        isActive: true,
        discount: Math.random() > 0.8 ? Math.floor(Math.random() * 20) + 5 : 0, // 20% chance of discount
        rating: 3.5 + Math.random() * 1.5,
        reviewCount: Math.floor(Math.random() * 200) + 10
      };
    });
  }

  // Generate random coordinates within Shirpur area with realistic distribution
  static generateShirpurCoordinates() {
    // Shirpur center: 21.3487, 74.8831
    const centerLat = 21.3487;
    const centerLng = 74.8831;
    
    // Generate coordinates in a realistic city distribution
    const angle = Math.random() * 2 * Math.PI;
    const radius = Math.random() * 0.02; // Max 2km radius
    
    return {
      lat: centerLat + radius * Math.cos(angle),
      lng: centerLng + radius * Math.sin(angle)
    };
  }

  // Calculate distance between two coordinates (Haversine formula)
  static calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + 
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Generate realistic delivery time based on distance and traffic
  static estimateDeliveryTime(distance: number): number {
    const baseTime = 15; // 15 minutes base
    const timePerKm = 3; // 3 minutes per km
    const hourOfDay = new Date().getHours();
    
    // Traffic multiplier based on time
    let trafficMultiplier = 1;
    if ((hourOfDay >= 8 && hourOfDay <= 10) || (hourOfDay >= 17 && hourOfDay <= 19)) {
      trafficMultiplier = 1.5; // Peak traffic
    } else if (hourOfDay >= 22 || hourOfDay <= 6) {
      trafficMultiplier = 0.8; // Low traffic
    }
    
    return Math.round((baseTime + (distance * timePerKm)) * trafficMultiplier);
  }

  // Generate real-time market trends
  static generateMarketTrends() {
    const trends = {
      demandMultiplier: 0.8 + Math.random() * 0.4, // 0.8 to 1.2
      supplyStatus: Math.random() > 0.7 ? 'low' : 'normal',
      peakHours: Math.random() > 0.5,
      weatherImpact: Math.random() > 0.8 ? 'high' : 'normal'
    };
    
    return trends;
  }

  // Generate dynamic categories based on available products
  static generateCategories(products: any[]) {
    const categoryMap = new Map();
    
    products.forEach(product => {
      if (!categoryMap.has(product.category)) {
        categoryMap.set(product.category, {
          id: product.category.toLowerCase().replace(/\s+/g, '-'),
          name: product.category,
          slug: product.category.toLowerCase().replace(/\s+/g, '-'),
          is_active: true,
          productCount: 0
        });
      }
      categoryMap.get(product.category).productCount++;
    });
    
    return Array.from(categoryMap.values());
  }

  // Generate real-time order status updates
  static generateOrderStatusUpdate(orderId: string, currentStatus: string) {
    const statusFlow = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['preparing', 'cancelled'],
      'preparing': ['out_for_delivery'],
      'out_for_delivery': ['delivered'],
      'delivered': ['delivered'],
      'cancelled': ['cancelled']
    };
    
    const possibleStatuses = statusFlow[currentStatus] || [currentStatus];
    const newStatus = possibleStatuses[Math.floor(Math.random() * possibleStatuses.length)];
    
    return {
      orderId,
      status: newStatus,
      timestamp: Date.now(),
      estimatedTime: this.estimateDeliveryTime(Math.random() * 5) // Random distance
    };
  }

}