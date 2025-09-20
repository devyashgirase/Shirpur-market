using ShirpurDeliveryAPI.Models;

namespace ShirpurDeliveryAPI.Data
{
    public static class DataSeeder
    {
        private static readonly Random _random = new();
        
        public static void SeedData(DeliveryContext context)
        {
            // Always clear and regenerate with fresh dynamic data
            if (context.Products.Any())
            {
                context.Products.RemoveRange(context.Products);
                context.SaveChanges();
            }

            var products = GenerateDynamicProducts();
            context.Products.AddRange(products);
            context.SaveChanges();
        }
        
        private static List<Product> GenerateDynamicProducts()
        {
            var productTemplates = new[]
            {
                new { Name = "Basmati Rice", Category = "Grains", BasePrice = 120m, Unit = "kg" },
                new { Name = "Wheat Flour", Category = "Grains", BasePrice = 45m, Unit = "kg" },
                new { Name = "Toor Dal", Category = "Pulses", BasePrice = 85m, Unit = "kg" },
                new { Name = "Moong Dal", Category = "Pulses", BasePrice = 95m, Unit = "kg" },
                new { Name = "Sunflower Oil", Category = "Oil", BasePrice = 150m, Unit = "liter" },
                new { Name = "Mustard Oil", Category = "Oil", BasePrice = 180m, Unit = "liter" },
                new { Name = "White Sugar", Category = "Sweeteners", BasePrice = 42m, Unit = "kg" },
                new { Name = "Jaggery", Category = "Sweeteners", BasePrice = 65m, Unit = "kg" },
                new { Name = "Tea Powder", Category = "Beverages", BasePrice = 95m, Unit = "pack" },
                new { Name = "Coffee Powder", Category = "Beverages", BasePrice = 120m, Unit = "pack" },
                new { Name = "Fresh Milk", Category = "Dairy", BasePrice = 28m, Unit = "liter" },
                new { Name = "Paneer", Category = "Dairy", BasePrice = 80m, Unit = "pack" },
                new { Name = "Red Onions", Category = "Vegetables", BasePrice = 35m, Unit = "kg" },
                new { Name = "Potatoes", Category = "Vegetables", BasePrice = 25m, Unit = "kg" },
                new { Name = "Tomatoes", Category = "Vegetables", BasePrice = 40m, Unit = "kg" },
                new { Name = "Green Chilies", Category = "Vegetables", BasePrice = 60m, Unit = "kg" },
                new { Name = "Fresh Apples", Category = "Fruits", BasePrice = 150m, Unit = "kg" },
                new { Name = "Bananas", Category = "Fruits", BasePrice = 60m, Unit = "dozen" },
                new { Name = "Oranges", Category = "Fruits", BasePrice = 80m, Unit = "kg" },
                new { Name = "Bread", Category = "Bakery", BasePrice = 25m, Unit = "pack" },
                new { Name = "Biscuits", Category = "Snacks", BasePrice = 20m, Unit = "pack" },
                new { Name = "Namkeen", Category = "Snacks", BasePrice = 35m, Unit = "pack" }
            };

            var products = new List<Product>();
            var currentTime = DateTime.Now;
            
            foreach (var template in productTemplates)
            {
                // Dynamic pricing based on time and market conditions
                var priceMultiplier = 0.8m + (decimal)(_random.NextDouble() * 0.4); // 0.8 to 1.2
                
                // Peak hours pricing
                var hour = currentTime.Hour;
                if ((hour >= 7 && hour <= 9) || (hour >= 18 && hour <= 20))
                {
                    priceMultiplier += 0.1m;
                }
                
                var dynamicPrice = Math.Round(template.BasePrice * priceMultiplier, 2);
                var dynamicStock = _random.Next(5, 100);
                
                products.Add(new Product
                {
                    Name = template.Name,
                    Description = $"Fresh {template.Name.ToLower()} - Market price updated in real-time",
                    Price = dynamicPrice,
                    Category = template.Category,
                    StockQuantity = dynamicStock,
                    IsActive = true,
                    ImageUrl = GetRandomImageUrl(template.Category)
                });
            }
            
            return products;
        }
        
        private static string GetRandomImageUrl(string category)
        {
            var imageUrls = category.ToLower() switch
            {
                "grains" => new[] { "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300", "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300" },
                "vegetables" => new[] { "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=300", "https://images.unsplash.com/photo-1546470427-e26264be0b0d?w=300" },
                "fruits" => new[] { "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300", "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300" },
                "dairy" => new[] { "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300", "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300" },
                _ => new[] { "https://images.unsplash.com/photo-1542838132-92c53300491e?w=300" }
            };
            
            return imageUrls[_random.Next(imageUrls.Length)];
        }
    }
}