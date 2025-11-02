// pages/TermsOfService.jsx (or wherever it's mounted)
"use client"
import Header from "@/components/Header"; // Adjust path as needed
import Footer from "@/components/Footer"; // Adjust path as needed
import { Shield, Mail, User, FileText, Zap, CheckCircle, AlertCircle, Scale, Download } from "lucide-react";

export default function TermsOfService() {
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
              <Scale className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Terms of Service</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Terms of Service
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Welcome to Whisone. These Terms of Service (&quot;Terms&quot;) govern your access to and use of our services. Please read them carefully.
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
                <FileText className="w-6 h-6 text-blue-600" />
                Introduction
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Whisone (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) provides an AI-powered email assistant service accessible via WhatsApp (&quot;Service&quot;). These Terms apply to all users, including beta testers. By accessing or using the Service, you agree to these Terms and our <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                If you are using on behalf of an entity, you represent authority to bind that entity. Questions? Contact support@whisone.com.
              </p>
            </section>

            {/* Acceptance of Terms */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-blue-600" />
                Acceptance of Terms
              </h2>
              <p className="text-gray-700 leading-relaxed">
                You must be 18+ or have parental consent. By signing up or using the Service, you accept these Terms. We may update them; continued use means acceptance.
              </p>
            </section>

            {/* Description of Services */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <Zap className="w-6 h-6 text-blue-600" />
                Description of Services
              </h2>
              <p className="text-gray-700 leading-relaxed">
                The Service allows you to connect your email (Gmail/Outlook), interact via WhatsApp for AI features like summaries, drafts, and alerts. Beta access is limited; full features may vary.
              </p>
              <p className="text-gray-700 mt-4">
                We may modify, suspend, or discontinue the Service. You&apos;ll get notice for material changes.
              </p>
            </section>

            {/* User Accounts */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <User className="w-6 h-6 text-blue-600" />
                User Accounts
              </h2>
              <p className="text-gray-700 leading-relaxed">
                To use the Service, create an account with accurate info. You&apos;re responsible for security. Notify us of unauthorized use immediately.
              </p>
              <ul className="text-gray-700 mt-4 space-y-2 list-disc list-inside">
                <li>Use OAuth for email connections—no passwords stored</li>
                <li>Accounts may be suspended for violations</li>
              </ul>
            </section>

            {/* User Content */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <Mail className="w-6 h-6 text-blue-600" />
                User Content
              </h2>
              <p className="text-gray-700 leading-relaxed">
                You retain ownership of content (e.g., emails, queries). By submitting, you grant us a worldwide, non-exclusive license to process it for the Service.
              </p>
              <p className="text-gray-700 mt-4">
                We don&apos;t endorse user content and may remove violating material.
              </p>
            </section>

            {/* Fees and Payment */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <FileText className="w-6 h-6 text-blue-600" />
                Fees and Payment
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Beta access is free; future paid plans will be detailed at signup. Fees are non-refundable unless required by law. We use Stripe for payments—see their terms.
              </p>
              <p className="text-gray-700 mt-4">
                Taxes are your responsibility.
              </p>
            </section>

            {/* Prohibited Conduct */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-blue-600" />
                Prohibited Conduct
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Don&apos;t misuse the Service:
              </p>
              <ul className="text-gray-700 mt-4 space-y-2 list-disc list-inside">
                <li>Violate laws, harass, or spam</li>
                <li>Reverse-engineer, scrape, or interfere with the Service</li>
                <li>Use for illegal activities or high-risk automation</li>
                <li>Upload malware or harmful content</li>
              </ul>
              <p className="text-gray-700 mt-4">
                Violations may lead to termination without refund.
              </p>
            </section>

            {/* Intellectual Property */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <Shield className="w-6 h-6 text-blue-600" />
                Intellectual Property
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Whisone owns the Service, including AI models and code. You get a limited, non-transferable license for personal use. Feedback may be used without compensation.
              </p>
              <p className="text-gray-700 mt-4">
                Trademarks are ours—don&apos;t use without permission.
              </p>
            </section>

            {/* Disclaimers and Limitations of Liability */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-blue-600" />
                Disclaimers and Limitations of Liability
              </h2>
              <p className="text-gray-700 leading-relaxed">
                The Service is &quot;as is&quot;—no warranties. AI outputs may have errors; verify critical info.
              </p>
              <p className="text-gray-700 mt-4">
                Liability is limited to fees paid (if any). No indirect damages. Some jurisdictions limit this.
              </p>
            </section>

            {/* Termination */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <FileText className="w-6 h-6 text-blue-600" />
                Termination
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We may terminate for violations or at discretion. You can stop anytime. Upon termination, access ends; data retention per Privacy Policy.
              </p>
            </section>

            {/* Governing Law */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <Scale className="w-6 h-6 text-blue-600" />
                Governing Law
              </h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms are governed by California law, without conflicts principles. Disputes via arbitration in San Francisco (AAA rules). No class actions.
              </p>
            </section>

            {/* Changes to Terms */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <Download className="w-6 h-6 text-blue-600" />
                Changes to Terms
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We may update these Terms. Notice via email or site. Changes effective 30 days after posting, unless otherwise stated.
              </p>
            </section>

            {/* Contact */}
            <section className="pt-8 border-t border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <Mail className="w-6 h-6 text-blue-600" />
                Contact Us
              </h2>
              <p className="text-gray-700">
                Questions about these Terms? Reach out:
              </p>
              <div className="mt-4 space-y-2 text-gray-600">
                <p><strong>Email:</strong> legal@whisone.com</p>
                <p><strong>Address:</strong> Whisone Inc., 123 Service Lane, San Francisco, CA 94105, USA</p>
              </div>
            </section>
          </div>

          {/* Page Footer */}
          <footer className="mt-16 pt-8 border-t border-gray-200 text-center text-gray-500 text-sm">
            <p>&copy; 2025 Whisone. All rights reserved. These Terms are governed by California law.</p>
          </footer>
        </div>
      </main>

      {/* Global Footer */}
      <Footer policyMode={true} />
    </div>
  );
}