"use client";
import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Target, Users, Loader2, Lightbulb } from "lucide-react";

interface PerformanceInsight {
  category: 'success_factors' | 'failure_points' | 'best_practices' | 'improvements';
  title: string;
  description: string;
  impact: number; // -1 to 1, where 1 is most positive impact
  confidence: number;
  evidence: string[];
  recommendations: string[];
}

export default function PerformanceInsights() {
  const [insights, setInsights] = useState<PerformanceInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedInsight, setExpandedInsight] = useState<number | null>(null);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/ai/performance-insights');
      const data = await res.json();

      if (data.ok) {
        setInsights(data.insights);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to load performance insights');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'success_factors': return <TrendingUp className="w-4 h-4" />;
      case 'failure_points': return <TrendingDown className="w-4 h-4" />;
      case 'best_practices': return <Target className="w-4 h-4" />;
      case 'improvements': return <Lightbulb className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'success_factors': return 'bg-green-100 text-green-800';
      case 'failure_points': return 'bg-red-100 text-red-800';
      case 'best_practices': return 'bg-blue-100 text-blue-800';
      case 'improvements': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getImpactColor = (impact: number) => {
    if (impact > 0.5) return 'text-green-600';
    if (impact > 0) return 'text-yellow-600';
    if (impact > -0.5) return 'text-orange-600';
    return 'text-red-600';
  };

  const getConfidenceBadge = (confidence: number) => {
    const color = confidence >= 0.8 ? 'bg-green-100 text-green-800' :
                  confidence >= 0.6 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-orange-100 text-orange-800';
    return `${color} px-2 py-0.5 rounded-full text-xs font-medium`;
  };

  if (loading) {
    return (
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
            <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gsv-charcoal">Performance Insights</h3>
        </div>
        <div className="text-center py-8 text-gsv-gray">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
          Analyzing performance patterns...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
            <TrendingDown className="w-4 h-4 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gsv-charcoal">Performance Insights</h3>
        </div>
        <div className="text-center py-4">
          <p className="text-red-600 text-sm">{error}</p>
          <button
            onClick={fetchInsights}
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
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
            <Lightbulb className="w-4 h-4 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gsv-charcoal">Performance Insights</h3>
        </div>
        <span className="text-xs text-gsv-gray bg-gray-100 px-2 py-1 rounded-full">
          {insights.length} insights
        </span>
      </div>

      {insights.length === 0 ? (
        <div className="text-center py-8 text-gsv-gray">
          <Lightbulb className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">No performance insights available yet</p>
          <p className="text-xs mt-1">Insights will appear as more data becomes available.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {insights.map((insight, index) => (
            <div
              key={index}
              className="p-4 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow cursor-pointer"
              onClick={() => setExpandedInsight(expandedInsight === index ? null : index)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`p-2 rounded-lg ${getCategoryColor(insight.category)}`}>
                    {getCategoryIcon(insight.category)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gsv-charcoal text-sm mb-1">
                      {insight.title}
                    </h4>
                    <p className="text-xs text-gsv-gray mb-2">
                      {insight.description}
                    </p>
                    <div className="flex items-center gap-3 text-xs">
                      <span className={getImpactColor(insight.impact)}>
                        Impact: {insight.impact > 0 ? '+' : ''}{Math.round(insight.impact * 100)}%
                      </span>
                      <span className={getConfidenceBadge(insight.confidence)}>
                        {Math.round(insight.confidence * 100)}% confidence
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {expandedInsight === index && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  {insight.evidence.length > 0 && (
                    <div className="mb-3">
                      <h5 className="text-xs font-medium text-gsv-charcoal mb-2">Evidence:</h5>
                      <ul className="text-xs text-gsv-gray space-y-1">
                        {insight.evidence.map((evidence, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-gsv-green mt-0.5">•</span>
                            {evidence}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {insight.recommendations.length > 0 && (
                    <div>
                      <h5 className="text-xs font-medium text-gsv-charcoal mb-2">Recommendations:</h5>
                      <ul className="text-xs text-gsv-gray space-y-1">
                        {insight.recommendations.map((rec, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-blue-500 mt-0.5">→</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gsv-gray text-center">
          AI analysis of success patterns • Updates every 2 hours
        </p>
      </div>
    </div>
  );
}
