"use client";
import { useState } from "react";
import { Mail, X, Check, ArrowRight } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface NewsletterBarProps {
  variant?: 'top' | 'bottom' | 'modal';
  autoShow?: boolean;
  delay?: number;
}

export default function NewsletterBar({
  variant = 'top',
  autoShow = true,
  delay = 3000
}: NewsletterBarProps) {
  const [isVisible, setIsVisible] = useState(!autoShow);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const supabase = createClientComponentClient();

  // Auto-show after delay
  useState(() => {
    if (autoShow) {
      const timer = setTimeout(() => {
        // Check if user has already dismissed or subscribed
        const dismissed = localStorage.getItem('newsletter-dismissed');
        const subscribed = localStorage.getItem('newsletter-subscribed');

        if (!dismissed && !subscribed) {
          setIsVisible(true);
        }
      }, delay);

      return () => clearTimeout(timer);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // In production, this would call your newsletter API
      const { error } = await supabase
        .from('newsletter_subscriptions')
        .insert({
          email: email,
          source: 'website_bar',
          subscribed_at: new Date().toISOString()
        });

      if (error) {
        throw error;
      }

      setIsSubmitted(true);
      localStorage.setItem('newsletter-subscribed', 'true');

      // Reset form after 3 seconds
      setTimeout(() => {
        setIsVisible(false);
      }, 3000);

    } catch (error: any) {
      setError(error.message || "Failed to subscribe. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('newsletter-dismissed', 'true');
  };

  if (!isVisible) return null;

  if (variant === 'modal') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>

          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-gsv-green text-white rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Stay Connected
            </h3>
            <p className="text-gray-600">
              Get the latest updates on environmental education, program news, and volunteer opportunities.
            </p>
          </div>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gsv-green focus:border-transparent"
              />
              {error && (
                <p className="text-red-600 text-sm">{error}</p>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gsv-green text-white py-3 px-6 rounded-lg hover:bg-gsv-greenDark transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Subscribing...
                  </>
                ) : (
                  <>
                    Subscribe to Newsletter
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Welcome to our community!
              </h4>
              <p className="text-gray-600">
                You&apos;ll receive our next newsletter with the latest updates.
              </p>
            </div>
          )}

          <p className="text-xs text-gray-500 mt-4 text-center">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </div>
    );
  }

  // Top/Bottom bar variants
  const barClasses = variant === 'top'
    ? "fixed top-0 left-0 right-0 z-40"
    : "fixed bottom-0 left-0 right-0 z-40";

  return (
    <div className={`${barClasses} bg-gsv-green text-white shadow-lg`}>
      <div className="container">
        <div className="flex items-center justify-between py-3 px-4">
          {/* Content */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <Mail className="w-5 h-5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              {!isSubmitted ? (
                <>
                  <span className="font-medium mr-2">Stay updated!</span>
                  <span className="text-white/90 hidden sm:inline">
                    Get environmental education news and volunteer opportunities.
                  </span>
                </>
              ) : (
                <span className="font-medium">Thanks for subscribing! Check your email soon.</span>
              )}
            </div>
          </div>

          {/* Form or Success Message */}
          <div className="flex items-center gap-3">
            {!isSubmitted ? (
              <>
                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email"
                    required
                    className="px-3 py-1 text-gray-900 rounded border-0 text-sm min-w-[200px]"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-white text-gsv-green px-4 py-1 rounded font-medium text-sm hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {isSubmitting ? '...' : 'Subscribe'}
                  </button>
                </form>
                {error && (
                  <span className="text-red-200 text-sm">{error}</span>
                )}
              </>
            ) : (
              <div className="flex items-center gap-2 text-green-200">
                <Check className="w-4 h-4" />
                <span className="text-sm">Subscribed!</span>
              </div>
            )}

            {/* Dismiss Button */}
            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-white/10 rounded transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook for managing newsletter signup state
export function useNewsletter() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useState(() => {
    setIsSubscribed(localStorage.getItem('newsletter-subscribed') === 'true');
    setIsDismissed(localStorage.getItem('newsletter-dismissed') === 'true');
  });

  const subscribe = () => {
    setIsSubscribed(true);
    localStorage.setItem('newsletter-subscribed', 'true');
    localStorage.removeItem('newsletter-dismissed');
  };

  const dismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('newsletter-dismissed', 'true');
  };

  const reset = () => {
    setIsSubscribed(false);
    setIsDismissed(false);
    localStorage.removeItem('newsletter-subscribed');
    localStorage.removeItem('newsletter-dismissed');
  };

  return {
    isSubscribed,
    isDismissed,
    shouldShow: !isSubscribed && !isDismissed,
    subscribe,
    dismiss,
    reset
  };
}
