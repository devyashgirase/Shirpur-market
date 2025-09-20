// Dynamic data generator for real-time application
export class DataGenerator {
  private static orderCounter = 1001;
  private static agentCounter = 1;

  // Generate unique order ID
  static generateOrderId(): string {
    return `ORD${this.orderCounter++}`;
  }

  // Generate random customer data
  static generateCustomer() {
    const names = ['Rahul Sharma', 'Priya Patel', 'Amit Kumar', 'Sneha Singh', 'Vikash Gupta', 'Pooja Jain'];
    const areas = ['MG Road', 'Station Road', 'Gandhi Chowk', 'Market Area', 'Civil Lines', 'Shivaji Nagar'];
    
    const name = names[Math.floor(Math.random() * names.length)];
    const area = areas[Math.floor(Math.random() * areas.length)];
    
    return {
      name,
      phone: `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      address: `${Math.floor(Math.random() * 999) + 1}, ${area}, Shirpur, Maharashtra 425405`,
      coordinates: {
        lat: 21.3487 + (Math.random() - 0.5) * 0.02,
        lng: 74.8831 + (Math.random() - 0.5) * 0.02
      }
    };
  }

  // Generate delivery agent data
  static generateDeliveryAgent() {
    const names = ['Ravi Kumar', 'Suresh Patil', 'Mahesh Joshi', 'Deepak Yadav', 'Santosh More'];
    const name = names[Math.floor(Math.random() * names.length)];
    
    return {
      id: `AGENT_${String(this.agentCounter++).padStart(3, '0')}`,
      name,
      phone: `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      location: {
        lat: 21.3487 + (Math.random() - 0.5) * 0.05,
        lng: 74.8831 + (Math.random() - 0.5) * 0.05
      }
    };
  }

  // Generate random products
  static generateProducts(count: number = 20) {
    const categories = ['Fruits', 'Vegetables', 'Groceries', 'Dairy', 'Snacks'];
    const products = [
      { name: 'Fresh Apples', category: 'Fruits', unit: 'kg', basePrice: 120 },
      { name: 'Bananas', category: 'Fruits', unit: 'dozen', basePrice: 60 },
      { name: 'Tomatoes', category: 'Vegetables', unit: 'kg', basePrice: 40 },
      { name: 'Onions', category: 'Vegetables', unit: 'kg', basePrice: 30 },
      { name: 'Rice', category: 'Groceries', unit: '5kg', basePrice: 250 },
      { name: 'Wheat Flour', category: 'Groceries', unit: '5kg', basePrice: 200 },
      { name: 'Milk', category: 'Dairy', unit: 'liter', basePrice: 55 },
      { name: 'Bread', category: 'Groceries', unit: 'pack', basePrice: 25 },
      { name: 'Eggs', category: 'Dairy', unit: 'dozen', basePrice: 80 },
      { name: 'Potato Chips', category: 'Snacks', unit: 'pack', basePrice: 20 }
    ];

    return Array.from({ length: count }, (_, i) => {
      const product = products[i % products.length];
      const priceVariation = 0.8 + Math.random() * 0.4; // ±20% price variation
      
      return {
        id: String(i + 1),
        name: product.name,
        category: product.category,
        price: Math.round(product.basePrice * priceVariation),
        unit: product.unit,
        stock_qty: Math.floor(Math.random() * 100) + 10,
        sku: `SKU${String(i + 1).padStart(3, '0')}`,
        description: `Fresh ${product.name.toLowerCase()} delivered to your doorstep`
      };
    });
  }

  // Generate random coordinates within Shirpur area
  static generateShirpurCoordinates() {
    return {
      lat: 21.3487 + (Math.random() - 0.5) * 0.02, // ±0.01 degree variation
      lng: 74.8831 + (Math.random() - 0.5) * 0.02
    };
  }

  // Calculate distance between two coordinates
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

  // Generate realistic delivery time based on distance
  static estimateDeliveryTime(distance: number): number {
    const baseTime = 15; // 15 minutes base
    const timePerKm = 3; // 3 minutes per km
    return Math.round(baseTime + (distance * timePerKm));
  }
}