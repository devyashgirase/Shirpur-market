# Database Table Structure

## Tables Created by Entity Framework

### 1. **Products** Table
```sql
CREATE TABLE Products (
    Id              INT IDENTITY(1,1) PRIMARY KEY,
    Name            NVARCHAR(MAX) NOT NULL,
    Description     NVARCHAR(MAX) NOT NULL,
    Price           DECIMAL(18,2) NOT NULL,
    ImageUrl        NVARCHAR(MAX) NOT NULL,
    Category        NVARCHAR(MAX) NOT NULL,
    StockQuantity   INT NOT NULL,
    IsActive        BIT NOT NULL DEFAULT 1,
    CreatedAt       DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);
```

### 2. **Orders** Table
```sql
CREATE TABLE Orders (
    Id              INT IDENTITY(1,1) PRIMARY KEY,
    OrderId         NVARCHAR(MAX) NOT NULL,
    CustomerName    NVARCHAR(MAX) NOT NULL,
    CustomerPhone   NVARCHAR(MAX) NOT NULL,
    DeliveryAddress NVARCHAR(MAX) NOT NULL,
    Total           DECIMAL(18,2) NOT NULL,
    Status          NVARCHAR(MAX) NOT NULL DEFAULT 'pending',
    PaymentStatus   NVARCHAR(MAX) NOT NULL DEFAULT 'pending',
    CreatedAt       DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);
```

### 3. **OrderItems** Table
```sql
CREATE TABLE OrderItems (
    Id          INT IDENTITY(1,1) PRIMARY KEY,
    OrderId     INT NOT NULL,
    ProductId   INT NOT NULL,
    ProductName NVARCHAR(MAX) NOT NULL,
    Price       DECIMAL(18,2) NOT NULL,
    Quantity    INT NOT NULL,
    FOREIGN KEY (OrderId) REFERENCES Orders(Id),
    FOREIGN KEY (ProductId) REFERENCES Products(Id)
);
```

### 4. **DeliveryTrackings** Table
```sql
CREATE TABLE DeliveryTrackings (
    Id                  INT IDENTITY(1,1) PRIMARY KEY,
    OrderId             INT NOT NULL,
    DeliveryAgentName   NVARCHAR(MAX) NOT NULL,
    DeliveryAgentPhone  NVARCHAR(MAX) NOT NULL,
    CurrentLatitude     FLOAT NULL,
    CurrentLongitude    FLOAT NULL,
    LastLocationUpdate  DATETIME2 NULL,
    FOREIGN KEY (OrderId) REFERENCES Orders(Id)
);
```

## How to Access Data

### 1. **View Database in Visual Studio**
- Open **View** → **SQL Server Object Explorer**
- Expand **(localdb)\MSSQLLocalDB**
- Find **ShirpurDeliveryDB** database

### 2. **Query Data Examples**
```sql
-- Get all products
SELECT * FROM Products;

-- Get all orders with customer details
SELECT * FROM Orders ORDER BY CreatedAt DESC;

-- Get order items with product details
SELECT oi.*, p.Name as ProductName 
FROM OrderItems oi 
JOIN Products p ON oi.ProductId = p.Id;

-- Get delivery tracking info
SELECT o.OrderId, o.CustomerName, dt.CurrentLatitude, dt.CurrentLongitude
FROM Orders o 
LEFT JOIN DeliveryTrackings dt ON o.Id = dt.OrderId;
```

### 3. **API Endpoints to Get Data**
```
GET http://localhost:5000/api/products        - All products
GET http://localhost:5000/api/orders          - All orders
GET http://localhost:5000/api/orders/1        - Specific order
```

### 4. **Sample Data Seeded**
- **10 Products**: Rice, Wheat, Dal, Oil, Sugar, Tea, Milk, Onions, Potatoes, Tomatoes
- **Categories**: Grains, Pulses, Oil, Sweeteners, Beverages, Dairy, Vegetables
- **Stock Quantities**: 15-80 items per product

## Database Location
- **File Path**: `%USERPROFILE%\ShirpurDeliveryDB.mdf`
- **Connection**: SQL Server LocalDB (automatic)
- **Created**: Automatically on first API run