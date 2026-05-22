// Browser-safe email service
// In a production app, these should call a backend API to keep API keys secure

export async function sendOrderStatusEmail(
  email: string, 
  orderId: string, 
  status: string, 
  customerName: string
) {
  console.log('📝 Notification Sim:', {
    to: email,
    subject: `Order Update: TC-${orderId?.toUpperCase()}`,
    body: `Hi ${customerName}, your order TC-${orderId?.toUpperCase()} is now ${status?.toUpperCase()}.`
  });
  
  // To use real emails, implement a server-side route that uses Resend
}

export async function sendOrderConfirmationEmail(
  email: string,
  orderId: string,
  customerName: string,
  total: number
) {
  console.log('📝 Order Confirmation Sim:', {
    to: email,
    subject: `Order Confirmation: TC-${orderId?.toUpperCase()}`,
    total: total
  });
}
