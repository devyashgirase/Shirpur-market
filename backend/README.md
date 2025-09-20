# Shirpur Delivery API Backend

## Setup Instructions

1. **Install .NET 8 SDK**
   ```bash
   # Download from: https://dotnet.microsoft.com/download/dotnet/8.0
   ```

2. **Navigate to backend directory**
   ```bash
   cd backend/ShirpurDeliveryAPI
   ```

3. **Restore packages**
   ```bash
   dotnet restore
   ```

4. **Run the API**
   ```bash
   dotnet run
   ```

5. **API will be available at:**
   - HTTP: `http://localhost:5000`
   - Swagger UI: `http://localhost:5000/swagger`

## Database

- Uses SQL Server LocalDB (automatically created)
- Connection string in `appsettings.json`
- Database created automatically on first run

## API Endpoints

### Products
- `GET /api/products` - Get all active products
- `POST /api/products` - Create new product
- `PUT /api/products/{id}` - Update product

### Orders
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create new order
- `PUT /api/orders/{id}/status` - Update order status
- `PUT /api/orders/{id}/location` - Update delivery location

## CORS Configuration

Configured to allow requests from:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (React dev server)