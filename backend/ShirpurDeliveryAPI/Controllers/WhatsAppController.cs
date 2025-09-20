using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace ShirpurDeliveryAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WhatsAppController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;

        public WhatsAppController(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _configuration = configuration;
        }

        [HttpPost("send-message")]
        public async Task<IActionResult> SendMessage([FromBody] WhatsAppMessageRequest request)
        {
            try
            {
                var accessToken = _configuration["WhatsApp:AccessToken"];
                var phoneNumberId = _configuration["WhatsApp:PhoneNumberId"];

                if (string.IsNullOrEmpty(accessToken) || string.IsNullOrEmpty(phoneNumberId))
                {
                    return BadRequest("WhatsApp configuration missing");
                }

                var whatsappMessage = new
                {
                    messaging_product = "whatsapp",
                    to = request.To.Replace("+", "").Replace(" ", ""),
                    type = "text",
                    text = new { body = request.Message }
                };

                _httpClient.DefaultRequestHeaders.Clear();
                _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");

                var json = JsonSerializer.Serialize(whatsappMessage);
                var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");

                var response = await _httpClient.PostAsync(
                    $"https://graph.facebook.com/v18.0/{phoneNumberId}/messages", 
                    content
                );

                if (response.IsSuccessStatusCode)
                {
                    var responseContent = await response.Content.ReadAsStringAsync();
                    return Ok(new { success = true, response = responseContent });
                }
                else
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    return BadRequest(new { success = false, error = errorContent });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, error = ex.Message });
            }
        }

        [HttpPost("webhook")]
        public IActionResult WebhookVerification([FromQuery] string hub_mode, [FromQuery] string hub_verify_token, [FromQuery] string hub_challenge)
        {
            var verifyToken = _configuration["WhatsApp:VerifyToken"] ?? "shirpur_delivery_webhook";
            
            if (hub_mode == "subscribe" && hub_verify_token == verifyToken)
            {
                return Ok(hub_challenge);
            }
            
            return Forbid();
        }

        [HttpPost("webhook")]
        public async Task<IActionResult> WebhookReceive([FromBody] object payload)
        {
            // Handle incoming WhatsApp messages
            Console.WriteLine($"WhatsApp Webhook received: {payload}");
            return Ok();
        }
    }

    public class WhatsAppMessageRequest
    {
        public string To { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string Type { get; set; } = "text";
    }
}