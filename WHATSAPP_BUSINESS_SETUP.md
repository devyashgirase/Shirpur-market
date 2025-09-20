# WhatsApp Business API Integration

## Setup Instructions

### 1. **Create WhatsApp Business Account**
1. Go to [Meta Business Manager](https://business.facebook.com/)
2. Create a Business Account
3. Add WhatsApp Business API

### 2. **Get API Credentials**
1. **Access Token**: From Meta Business Manager → WhatsApp → API Setup
2. **Phone Number ID**: Your WhatsApp Business phone number ID
3. **Verify Token**: Custom webhook verification token

### 3. **Update Environment Variables**
```env
VITE_WHATSAPP_ACCESS_TOKEN=EAAYour_Real_Access_Token_Here
VITE_WHATSAPP_PHONE_NUMBER_ID=your_real_phone_number_id
```

### 4. **Update Backend Configuration**
In `appsettings.json`:
```json
{
  "WhatsApp": {
    "AccessToken": "EAAYour_Real_Access_Token_Here",
    "PhoneNumberId": "your_real_phone_number_id",
    "VerifyToken": "shirpur_delivery_webhook"
  }
}
```

## Features Implemented

### ✅ **Real WhatsApp Business Messaging**
- Order confirmations
- Status updates (confirmed, out for delivery, delivered)
- Delivery partner information
- OTP for delivery verification
- Promotional messages

### ✅ **Message Templates**
- **Order Confirmation**: Template with order ID, amount, ETA
- **Status Updates**: Real-time order status changes
- **Delivery Info**: Partner name and contact details
- **OTP Messages**: Secure delivery verification codes

### ✅ **Webhook Integration**
- Receive incoming messages
- Handle delivery confirmations
- Process customer replies

## API Endpoints

### **Send Message**
```
POST /api/whatsapp/send-message
{
  "to": "+919876543210",
  "message": "Your order #ABC123 is confirmed!",
  "type": "text"
}
```

### **Webhook Verification**
```
GET /api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=shirpur_delivery_webhook&hub.challenge=challenge_code
```

## Message Flow

### 📱 **Customer Journey**
1. **Order Placed** → WhatsApp confirmation with OTP
2. **Order Confirmed** → Status update message
3. **Out for Delivery** → Delivery partner info + ETA
4. **Delivered** → Completion confirmation

### 🚚 **Delivery Partner**
- Receives customer contact via WhatsApp
- Gets OTP for delivery verification
- Can message customer directly

### 👨💼 **Admin**
- Send promotional messages
- Broadcast offers to customers
- Handle customer support via WhatsApp

## Testing

### **Test Message**
```javascript
await WhatsAppBusinessService.sendOrderConfirmation(
  '+919876543210',
  { orderId: 'TEST123', total: 299 }
);
```

### **Webhook Testing**
Use ngrok to expose local webhook:
```bash
ngrok http 5000
# Use ngrok URL in Meta Business Manager webhook settings
```

## Production Deployment

1. **Domain Verification**: Verify your domain in Meta Business Manager
2. **Webhook URL**: Set production webhook URL
3. **Rate Limits**: WhatsApp has messaging rate limits
4. **Templates**: Submit message templates for approval

## Security Notes

- ✅ **Access tokens** are environment-specific
- ✅ **Webhook verification** prevents unauthorized access
- ✅ **Phone number validation** before sending messages
- ✅ **Rate limiting** to prevent spam

The system now sends real WhatsApp Business messages instead of mock notifications!