// pages/PrivacyPolicy.jsx (or wherever it's mounted)
"use client"
import Footer from "@/components/footer";
import Header from "@/components/header";
import { Shield, Mail, Lock, User, FileText, Calendar, Download } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <Header showNav={true} ctaText="Get Early Access" ctaHref="/signup" />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12 border border-gray-100">
          {/* Hero */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full mx-auto mb-6 w-fit">
              <Shield className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Privacy Policy</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Your Privacy Matters
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              At Whisone, we&apos;re committed to protecting your data. This policy explains how we handle your information securely and transparently.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Last updated: November 2, 2025
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-12">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <Lock className="w-6 h-6 text-blue-600" />
                Introduction
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Whisone (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates the Whisone service, an AI-powered email assistant accessible via WhatsApp. This Privacy Policy describes how we collect, use, share, and protect your personal information when you use our website (whisone.com), mobile app, or services.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                We comply with applicable data protection laws, including GDPR and CCPA. By using Whisone, you consent to these practices. If you have questions, contact us at privacy@whisone.com.
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <Mail className="w-6 h-6 text-blue-600" />
                Information We Collect
              </h2>
              <div className="space-y-4">
                <div className="pl-6 border-l-4 border-blue-200">
                  <h3 className="font-semibold text-gray-900">Personal Information</h3>
                  <ul className="text-gray-700 list-disc list-inside space-y-1">
                    <li>Email address and WhatsApp number (for account creation and notifications)</li>
                    <li>Email content from connected inboxes (Gmail/Outlook) for AI processing—only with your explicit consent</li>
                    <li>Usage data (e.g., queries, interactions) to improve service</li>
                  </ul>
                </div>
                <div className="pl-6 border-l-4 border-blue-200">
                  <h3 className="font-semibold text-gray-900">Non-Personal Information</h3>
                  <ul className="text-gray-700 list-disc list-inside space-y-1">
                    <li>Device info (e.g., IP address, browser type) for analytics</li>
                    <li>Cookies and tracking data (see below)</li>
                  </ul>
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  We do not collect sensitive data (e.g., health, financial) unless explicitly required for service features, and only with consent.
                </p>
              </div>
            </section>

            {/* How We Use Your Information */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <User className="w-6 h-6 text-blue-600" />
                How We Use Your Information
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We use your data to provide, improve, and secure Whisone:
              </p>
              <ul className="text-gray-700 mt-4 space-y-2 list-disc list-inside">
                <li>Process AI queries (e.g., summarize emails, draft replies) using secure, anonymized models</li>
                <li>Send notifications and alerts via WhatsApp</li>
                <li>Analyze usage for product enhancements (aggregated, non-identifiable)</li>
                <li>Prevent fraud and comply with legal obligations</li>
                <li>Communicate updates or support responses</li>
              </ul>
              <p className="text-gray-700 mt-4">
                Data is processed in the EU/US with GDPR-compliant providers (e.g., AWS with encryption).
              </p>
            </section>

            {/* Sharing Your Information */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <Users className="w-6 h-6 text-blue-600" />
                Sharing Your Information
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We do not sell your data. We share only as needed:
              </p>
              <ul className="text-gray-700 mt-4 space-y-2 list-disc list-inside">
                <li>Service providers (e.g., AI processors like OpenAI, with data minimization)</li>
                <li>Legal requirements (e.g., subpoenas)</li>
                <li>Business transfers (e.g., merger, with notice)</li>
              </ul>
              <p className="text-sm text-gray-500 mt-4">
                No third-party marketing shares. Email content stays end-to-end encrypted and is not accessible to Whisone staff.
              </p>
            </section>

            {/* Data Security */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <Shield className="w-6 h-6 text-blue-600" />
                Data Security
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We prioritize security with:
              </p>
              <ul className="text-gray-700 mt-4 space-y-2 list-disc list-inside">
                <li>AES-256 encryption for data at rest/transit</li>
                <li>OAuth for secure email connections (no password storage)</li>
                <li>Regular audits and penetration testing</li>
                <li>Access controls (least privilege)</li>
              </ul>
              <p className="text-gray-700 mt-4">
                While no system is 100% secure, we report breaches within 72 hours per GDPR.
              </p>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <FileText className="w-6 h-6 text-blue-600" />
                Your Rights
              </h2>
              <p className="text-gray-700 leading-relaxed">
                You control your data. Under GDPR/CCPA:
              </p>
              <ul className="text-gray-700 mt-4 space-y-2 list-disc list-inside">
                <li><strong>Access/Delete:</strong> Request your data or erasure anytime</li>
                <li><strong>Opt-Out:</strong> Unsubscribe from emails; revoke WhatsApp consent</li>
                <li><strong>Portability:</strong> Export your data in standard format</li>
                <li><strong>Do Not Sell:</strong> We don&apos;t sell—opt-out not applicable</li>
              </ul>
              <p className="text-sm text-gray-500 mt-4">
                Email privacy@whisone.com. Responses within 30 days.
              </p>
            </section>

            {/* Cookies and Tracking */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <Calendar className="w-6 h-6 text-blue-600" />
                Cookies and Tracking
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We use essential cookies for functionality (e.g., session management) and analytics (e.g., Google Analytics, anonymized). No advertising cookies.
              </p>
              <p className="text-gray-700 mt-4">
                Manage preferences via browser settings or our cookie banner. For details, see our <a href="#" className="text-blue-600 hover:underline">Cookie Policy</a>.
              </p>
            </section>

            {/* Changes to This Policy */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <Download className="w-6 h-6 text-blue-600" />
                Changes to This Policy
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this policy. Significant changes will be emailed and posted here with a new date. Continued use constitutes acceptance.
              </p>
            </section>

            {/* Contact */}
            <section className="pt-8 border-t border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <Mail className="w-6 h-6 text-blue-600" />
                Contact Us
              </h2>
              <p className="text-gray-700">
                Questions? Reach out:
              </p>
              <div className="mt-4 space-y-2 text-gray-600">
                <p><strong>Email:</strong> privacy@whisone.com</p>
                <p><strong>Address:</strong> Whisone Inc., 123 Privacy Lane, San Francisco, CA 94105, USA</p>
                <p className="text-sm"><strong>EU Representative:</strong> GDPR Rep, Berlin, Germany (for EU queries)</p>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer policyMode={true} />
    </div>
  );
}