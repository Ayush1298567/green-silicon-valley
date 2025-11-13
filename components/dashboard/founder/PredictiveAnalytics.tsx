"use client";
import { useState, useEffect } from "react";
import { TrendingUp, Clock, AlertTriangle, CheckCircle, Loader2, Calendar } from "lucide-react";

interface CompletionPrediction {
  estimatedCompletion: string;
  confidence: number;
  riskFactors: string[];
  successProbability: number;
  milestones: {
    name: string;
    estimatedDate: string;
    confidence: number;
  }[];
}

interface PredictiveAnalyticsProps {
  groupId?: string;
}

export default function PredictiveAnalytics({ groupId }: PredictiveAnalyticsProps) {
  const [prediction, setPrediction] = useState<CompletionPrediction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (groupId) {
      fetchPrediction();
    }
  }, [groupId]);

  const fetchPrediction = async () => {
    if (!groupId) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/ai/predictive-analytics/${groupId}`);
      const data = await res.json();

      if (data.ok) {
        setPrediction(data.prediction);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to load prediction');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysUntil = (dateString: string) => {
    const target = new Date(dateString);
    const now = new Date();
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-orange-600 bg-orange-100';
  };

  const getSuccessColor = (probability: number) => {
    if (probability >= 0.8) return 'text-green-600 bg-green-100';
    if (probability >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (!groupId) {
    return (
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold text-gsv-charcoal">Predictive Analytics</h3>
        </div>
        <div className="text-center py-8 text-gsv-gray">
          <TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">Select a group to view predictions</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold text-gsv-charcoal">Predictive Analytics</h3>
        </div>
        <div className="text-center py-8 text-gsv-gray">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
          Calculating predictions...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gsv-charcoal">Predictive Analytics</h3>
        </div>
        <div className="text-center py-4">
          <p className="text-red-600 text-sm">{error}</p>
          <button
            onClick={fetchPrediction}
            className="mt-2 text-gsv-green hover:underline text-sm"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold text-gsv-charcoal">Predictive Analytics</h3>
        </div>
        <div className="text-center py-8 text-gsv-gray">
          <TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">No prediction data available</p>
          <p className="text-xs mt-1">More data needed for accurate predictions.</p>
        </div>
      </div>
    );
  }

  const daysUntil = getDaysUntil(prediction.estimatedCompletion);
  const isOverdue = daysUntil < 0;

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold text-gsv-charcoal">Predictive Analytics</h3>
        </div>
        <button
          onClick={fetchPrediction}
          className="text-xs text-gsv-gray hover:text-gsv-green"
        >
          Refresh
        </button>
      </div>

      {/* Main Prediction */}
      <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <span className="font-medium text-gsv-charcoal">Estimated Completion</span>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(prediction.confidence)}`}>
            {Math.round(prediction.confidence * 100)}% confidence
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-2xl font-bold text-gsv-charcoal">
            {formatDate(prediction.estimatedCompletion)}
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${isOverdue ? 'bg-red-100 text-red-800' : daysUntil <= 7 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
            {isOverdue ? `${Math.abs(daysUntil)} days overdue` : `${daysUntil} days remaining`}
          </div>
        </div>
      </div>

      {/* Success Probability */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gsv-charcoal">Success Probability</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSuccessColor(prediction.successProbability)}`}>
            {Math.round(prediction.successProbability * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${prediction.successProbability * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Risk Factors */}
      {prediction.riskFactors.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gsv-charcoal mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            Risk Factors
          </h4>
          <div className="space-y-2">
            {prediction.riskFactors.map((risk, index) => (
              <div key={index} className="flex items-start gap-2 p-2 bg-orange-50 rounded text-xs text-orange-800">
                <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                {risk}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Milestone Timeline */}
      {prediction.milestones.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gsv-charcoal mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Milestone Predictions
          </h4>
          <div className="space-y-2">
            {prediction.milestones.map((milestone, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                <span className="text-gsv-charcoal">{milestone.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-gsv-gray text-xs">{formatDate(milestone.estimatedDate)}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${getConfidenceColor(milestone.confidence)}`}>
                    {Math.round(milestone.confidence * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gsv-gray text-center">
          AI prediction based on historical data • Updates hourly
        </p>
      </div>
    </div>
  );
}
