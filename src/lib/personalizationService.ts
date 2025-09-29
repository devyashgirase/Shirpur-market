import { authService } from './authService';
import { apiService } from './apiService';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category_id: string;
  stock_qty: number;
  is_active: boolean;
  sku: string;
  unit: string;
  is_age_restricted: boolean;
}

interface UserPreference {
  userId: string;
  productId: string;
  categoryId: string;
  addedToCartCount: number;
  purchasedCount: number;
  lastInteraction: number;
  score: number;
}

interface PersonalizedRecommendation {
  product: Product;
  reason: string;
  score: number;
}

class PersonalizationService {
  private async getUserPreferences(userPhone: string): Promise<UserPreference[]> {
    try {
      const response = await apiService.request('/user-preferences', {
        method: 'POST',
        body: JSON.stringify({ userPhone, action: 'get' })
      });
      return response.preferences || [];
    } catch (error) {
      console.error('Failed to get user preferences:', error);
      return [];
    }
  }

  private async saveUserPreference(preference: UserPreference): Promise<void> {
    try {
      await apiService.request('/user-preferences', {
        method: 'POST',
        body: JSON.stringify({ 
          action: 'save',
          preference
        })
      });
    } catch (error) {
      console.error('Failed to save user preference:', error);
    }
  }

  // Track when user adds product to cart
  trackAddToCart(product: Product): void {
    try {
      const currentUser = authService.getCurrentUser();
      const userPhone = currentUser?.phone || 'guest';

      // Fallback to localStorage tracking
      const preferences = this.getUserPreferencesFromStorage(userPhone);
      const existingPref = preferences.find(p => p.productId === product.id);

      if (existingPref) {
        existingPref.addedToCartCount++;
        existingPref.lastInteraction = Date.now();
        existingPref.score = this.calculateScore(existingPref);
      } else {
        preferences.push({
          userId: userPhone,
          productId: product.id,
          categoryId: product.category_id,
          addedToCartCount: 1,
          purchasedCount: 0,
          lastInteraction: Date.now(),
          score: 10
        });
      }

      localStorage.setItem(`preferences_${userPhone}`, JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to track add to cart:', error);
    }
  }

  // Track when user completes purchase
  async trackPurchase(products: Product[]): Promise<void> {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return;

    try {
      await apiService.request('/user-preferences', {
        method: 'POST',
        body: JSON.stringify({
          action: 'track-purchase',
          userPhone: currentUser.phone,
          products: products.map(p => ({
            productId: parseInt(p.id),
            categoryId: p.category_id
          }))
        })
      });
    } catch (error) {
      console.error('Failed to track purchase:', error);
    }
  }

  private calculateScore(preference: UserPreference): number {
    const cartWeight = 5;
    const purchaseWeight = 20;
    const recencyWeight = 0.1;
    
    // Calculate days since last interaction
    const daysSinceInteraction = (Date.now() - preference.lastInteraction) / (1000 * 60 * 60 * 24);
    const recencyScore = Math.max(0, 30 - daysSinceInteraction) * recencyWeight;
    
    return (preference.addedToCartCount * cartWeight) + 
           (preference.purchasedCount * purchaseWeight) + 
           recencyScore;
  }

  // Get personalized product recommendations
  getPersonalizedProducts(allProducts: Product[], limit: number = 8): Product[] {
    try {
      const currentUser = authService.getCurrentUser();
      const userPhone = currentUser?.phone || 'guest';

      // Fallback to localStorage-based personalization
      const preferences = this.getUserPreferencesFromStorage(userPhone);
      
      if (preferences.length === 0) {
        return allProducts.filter(p => p.stock_qty > 20).slice(0, limit);
      }

      // Simple scoring based on localStorage preferences
      const productScores = new Map<string, number>();
      preferences.forEach(pref => {
        productScores.set(pref.productId, pref.score);
      });

      const scoredProducts = allProducts.map(product => {
        let score = productScores.get(product.id) || 0;
        if (product.stock_qty > 0) score += 5;
        if (product.stock_qty > 20) score += 3;
        return { product, score };
      });

      return scoredProducts
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(item => item.product);
    } catch (error) {
      console.error('Failed to get personalized products:', error);
      return allProducts.filter(p => p.stock_qty > 20).slice(0, limit);
    }
  }

  private getUserPreferencesFromStorage(userPhone: string): UserPreference[] {
    const stored = localStorage.getItem(`preferences_${userPhone}`);
    return stored ? JSON.parse(stored) : [];
  }

  // Get recommended products with reasons
  getRecommendationsWithReasons(allProducts: Product[], limit: number = 6): PersonalizedRecommendation[] {
    try {
      const currentUser = authService.getCurrentUser();
      const userPhone = currentUser?.phone || 'guest';
      
      const preferences = this.getUserPreferencesFromStorage(userPhone);
      
      if (preferences.length === 0) {
        return allProducts
          .filter(p => p.stock_qty > 20)
          .slice(0, limit)
          .map(product => ({
            product,
            reason: "Trending now",
            score: 10
          }));
      }

    const recommendations: PersonalizedRecommendation[] = [];
    
    // Add previously purchased products
    const purchasedProducts = preferences
      .filter(p => p.purchasedCount > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
    
    purchasedProducts.forEach(pref => {
      const product = allProducts.find(p => p.id === pref.productId);
      if (product && product.stock_qty > 0) {
        recommendations.push({
          product,
          reason: `You bought this ${pref.purchasedCount} time${pref.purchasedCount > 1 ? 's' : ''}`,
          score: pref.score
        });
      }
    });

    // Add products from preferred categories
    const categoryScores = new Map<string, number>();
    preferences.forEach(pref => {
      const currentScore = categoryScores.get(pref.categoryId) || 0;
      categoryScores.set(pref.categoryId, currentScore + pref.score);
    });

    const topCategories = Array.from(categoryScores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2);

    topCategories.forEach(([categoryId, score]) => {
      const categoryProducts = allProducts
        .filter(p => p.category_id === categoryId && p.stock_qty > 0)
        .filter(p => !recommendations.some(r => r.product.id === p.id))
        .slice(0, 2);

      categoryProducts.forEach(product => {
        recommendations.push({
          product,
          reason: `From your favorite category`,
          score: score * 0.3
        });
      });
    });

    // Fill remaining slots with popular products
    const remaining = limit - recommendations.length;
    if (remaining > 0) {
      const popularProducts = allProducts
        .filter(p => p.stock_qty > 20)
        .filter(p => !recommendations.some(r => r.product.id === p.id))
        .slice(0, remaining);

      popularProducts.forEach(product => {
        recommendations.push({
          product,
          reason: "Popular choice",
          score: 5
        });
      });
    }

      return recommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    } catch (error) {
      return allProducts
        .filter(p => p.stock_qty > 20)
        .slice(0, limit)
        .map(product => ({
          product,
          reason: "Popular choice",
          score: 10
        }));
    }
  }

  // Get user's shopping patterns
  getUserInsights(): { totalInteractions: number; favoriteCategory: string; recentActivity: number } {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      return { totalInteractions: 0, favoriteCategory: 'None', recentActivity: 0 };
    }

    const preferences = this.getUserPreferences(currentUser.phone);
    
    const totalInteractions = preferences.reduce((sum, pref) => 
      sum + pref.addedToCartCount + pref.purchasedCount, 0);

    const categoryScores = new Map<string, number>();
    preferences.forEach(pref => {
      const currentScore = categoryScores.get(pref.categoryId) || 0;
      categoryScores.set(pref.categoryId, currentScore + pref.score);
    });

    const favoriteCategory = categoryScores.size > 0 
      ? Array.from(categoryScores.entries()).sort((a, b) => b[1] - a[1])[0][0]
      : 'None';

    const recentActivity = preferences.filter(pref => 
      Date.now() - pref.lastInteraction < 7 * 24 * 60 * 60 * 1000 // Last 7 days
    ).length;

    return { totalInteractions, favoriteCategory, recentActivity };
  }
}

export const personalizationService = new PersonalizationService();