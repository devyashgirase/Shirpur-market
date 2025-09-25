import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Star, MessageSquare, ThumbsUp, ThumbsDown, User } from "lucide-react";

interface Feedback {
  id: string;
  orderId: string;
  customerName: string;
  rating: number;
  comment: string;
  category: 'delivery' | 'product' | 'service';
  timestamp: string;
  helpful: number;
}

const FeedbackSystem = () => {
  const [feedbacks] = useState<Feedback[]>([
    {
      id: "1",
      orderId: "ORD-001",
      customerName: "Rajesh Kumar",
      rating: 5,
      comment: "Excellent service! Fresh vegetables delivered on time.",
      category: "delivery",
      timestamp: "2024-01-15T10:30:00Z",
      helpful: 12
    },
    {
      id: "2",
      orderId: "ORD-002",
      customerName: "Priya Sharma",
      rating: 4,
      comment: "Good quality rice, but packaging could be better.",
      category: "product",
      timestamp: "2024-01-14T15:45:00Z",
      helpful: 8
    },
    {
      id: "3",
      orderId: "ORD-003",
      customerName: "Amit Patel",
      rating: 3,
      comment: "Delivery was delayed by 30 minutes. Please improve timing.",
      category: "service",
      timestamp: "2024-01-13T18:20:00Z",
      helpful: 5
    }
  ]);

  const [newFeedback, setNewFeedback] = useState({
    rating: 0,
    comment: "",
    category: "delivery" as const
  });

  const renderStars = (rating: number, interactive = false, onRate?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating 
                ? 'text-yellow-400 fill-yellow-400' 
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={() => interactive && onRate?.(star)}
          />
        ))}
      </div>
    );
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'delivery': return 'bg-blue-100 text-blue-800';
      case 'product': return 'bg-green-100 text-green-800';
      case 'service': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const averageRating = feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Customer Feedback & Ratings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star className="h-6 w-6 text-yellow-400 fill-yellow-400" />
                <span className="text-2xl font-bold">{averageRating.toFixed(1)}</span>
              </div>
              <p className="text-sm text-gray-600">Average Rating</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <MessageSquare className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{feedbacks.length}</div>
              <p className="text-sm text-blue-600">Total Reviews</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <ThumbsUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">
                {Math.round((feedbacks.filter(f => f.rating >= 4).length / feedbacks.length) * 100)}%
              </div>
              <p className="text-sm text-green-600">Positive Reviews</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Recent Feedback</h3>
            {feedbacks.map((feedback) => (
              <div key={feedback.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium">{feedback.customerName}</p>
                      <p className="text-sm text-gray-600">Order #{feedback.orderId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {renderStars(feedback.rating)}
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(feedback.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge className={getCategoryColor(feedback.category)}>
                    {feedback.category}
                  </Badge>
                </div>

                <p className="text-gray-700">{feedback.comment}</p>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-green-600">
                      <ThumbsUp className="h-4 w-4" />
                      Helpful ({feedback.helpful})
                    </button>
                    <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600">
                      <ThumbsDown className="h-4 w-4" />
                      Not Helpful
                    </button>
                  </div>
                  <Button variant="outline" size="sm">
                    Respond
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Leave Feedback</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Rating</label>
            {renderStars(newFeedback.rating, true, (rating) => 
              setNewFeedback(prev => ({ ...prev, rating }))
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select 
              className="w-full p-2 border rounded-lg"
              value={newFeedback.category}
              onChange={(e) => setNewFeedback(prev => ({ 
                ...prev, 
                category: e.target.value as 'delivery' | 'product' | 'service' 
              }))}
            >
              <option value="delivery">Delivery</option>
              <option value="product">Product Quality</option>
              <option value="service">Customer Service</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Comment</label>
            <Textarea
              placeholder="Share your experience..."
              value={newFeedback.comment}
              onChange={(e) => setNewFeedback(prev => ({ ...prev, comment: e.target.value }))}
              rows={4}
            />
          </div>

          <Button className="w-full">
            Submit Feedback
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeedbackSystem;