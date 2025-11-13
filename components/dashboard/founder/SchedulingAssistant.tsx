"use client";
import { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, Users, Loader2, CheckCircle } from "lucide-react";

interface SchedulingRecommendation {
  timeSlot: string;
  date: string;
  school: string;
  confidence: number;
  reasoning: string[];
  expectedAttendance: number;
  alternatives: string[];
}

interface SchedulingAssistantProps {
  groupId?: string;
}

export default function SchedulingAssistant({ groupId }: SchedulingAssistantProps) {
  const [recommendations, setRecommendations] = useState<SchedulingRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecommendation, setSelectedRecommendation] = useState<number | null>(null);

  useEffect(() => {
    fetchRecommendations();
  }, [groupId]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const params = groupId ? `?groupId=${groupId}` : '';
      const res = await fetch(`/api/ai/scheduling-recommendations${params}`);
      const data = await res.json();

      if (data.ok) {
        setRecommendations(data.recommendations);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to load scheduling recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleSchedulePresentation = (recommendation: SchedulingRecommendation) => {
    // In a real implementation, this would open a scheduling modal or redirect to create presentation
    alert(`Schedule presentation:\n${recommendation.timeSlot}\n${recommendation.date}\n${recommendation.school}\nExpected attendance: ${recommendation.expectedAttendance}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-orange-600 bg-orange-100';
  };

  if (loading) {
    return (
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gsv-charcoal">Smart Scheduling</h3>
        </div>
        <div className="text-center py-8 text-gsv-gray">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
          Analyzing optimal scheduling...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
            <Calendar className="w-4 h-4 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gsv-charcoal">Smart Scheduling</h3>
        </div>
        <div className="text-center py-4">
          <p className="text-red-600 text-sm">{error}</p>
          <button
            onClick={fetchRecommendations}
            className="mt-2 text-gsv-green hover:underline text-sm"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gsv-charcoal">
            Smart Scheduling {groupId && '- Group Specific'}
          </h3>
        </div>
        <button
          onClick={fetchRecommendations}
          className="text-xs text-gsv-gray hover:text-gsv-green"
        >
          Refresh
        </button>
      </div>

      {recommendations.length === 0 ? (
        <div className="text-center py-8 text-gsv-gray">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">No scheduling recommendations available</p>
          <p className="text-xs mt-1">Check back later or add more presentation data.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.map((rec, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                selectedRecommendation === index
                  ? 'border-gsv-green bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedRecommendation(selectedRecommendation === index ? null : index)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-gsv-gray" />
                    <span className="font-medium text-gsv-charcoal">{rec.timeSlot}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-gsv-gray" />
                    <span className="text-sm text-gsv-gray">{formatDate(rec.date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gsv-gray" />
                    <span className="text-sm text-gsv-gray">{rec.school}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(rec.confidence)}`}>
                    {Math.round(rec.confidence * 100)}% confidence
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-xs text-gsv-gray">
                    <Users className="w-3 h-3" />
                    {rec.expectedAttendance} expected
                  </div>
                </div>
              </div>

              {selectedRecommendation === index && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-gsv-charcoal mb-2">Why this time?</h4>
                    <ul className="text-xs text-gsv-gray space-y-1">
                      {rec.reasoning.map((reason, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {rec.alternatives.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-gsv-charcoal mb-2">Alternatives</h4>
                      <div className="flex flex-wrap gap-2">
                        {rec.alternatives.map((alt, i) => (
                          <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {alt}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSchedulePresentation(rec);
                    }}
                    className="w-full bg-gsv-green text-white px-4 py-2 rounded-lg hover:bg-gsv-greenDark transition text-sm font-medium"
                  >
                    Schedule Presentation
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gsv-gray text-center">
          AI recommendations based on historical data • Updates hourly
        </p>
      </div>
    </div>
  );
}
