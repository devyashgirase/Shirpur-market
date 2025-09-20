namespace ShirpurDeliveryAPI.Models
{
    public class DeliveryTracking
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        public string DeliveryAgentName { get; set; } = string.Empty;
        public string DeliveryAgentPhone { get; set; } = string.Empty;
        public double? CurrentLatitude { get; set; }
        public double? CurrentLongitude { get; set; }
        public DateTime? LastLocationUpdate { get; set; }
        public Order? Order { get; set; }
    }
}