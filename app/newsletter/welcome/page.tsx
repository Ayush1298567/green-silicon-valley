import { CheckCircle, Mail, Sparkles } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function NewsletterWelcomePage() {
  return (
    <div className="container py-14">
      <div className="max-w-2xl mx-auto">
        <div className="card p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-gsv-green" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gsv-charcoal mb-4">
            Welcome to Green Silicon Valley!
          </h1>
          
          <p className="text-gsv-gray mb-6 text-lg">
            Thank you for subscribing to our newsletter! You're now part of our community dedicated to environmental STEM education.
          </p>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-green-900 mb-3 flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5" />
              What You'll Receive
            </h3>
            <ul className="text-left text-green-800 space-y-2 text-sm">
              <li>• Monthly updates on our impact and programs</li>
              <li>• Volunteer opportunities and events</li>
              <li>• Educational resources and tips</li>
              <li>• Success stories from our community</li>
            </ul>
          </div>

          <div className="space-y-4">
            <p className="text-gsv-gray">
              Want to get more involved? Check out our volunteer and intern opportunities!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/get-involved"
                className="px-6 py-3 bg-gsv-green text-white rounded-lg hover:bg-gsv-greenDark transition font-medium"
              >
                Get Involved
              </Link>
              <Link
                href="/"
                className="px-6 py-3 border-2 border-gsv-green text-gsv-green rounded-lg hover:bg-gsv-green/10 transition font-medium"
              >
                Back to Home
              </Link>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t">
            <p className="text-sm text-gsv-gray">
              Questions? Contact us at{" "}
              <a href="mailto:greensiliconvalley27@gmail.com" className="text-gsv-green hover:underline">
                greensiliconvalley27@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

