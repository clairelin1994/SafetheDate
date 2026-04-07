import Link from "next/link";

export const metadata = {
  title: "Privacy Policy · Safe the Date",
  description: "How Safe the Date handles your data — plain and simple.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-pink-50 to-fuchsia-50">
      <main className="max-w-2xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-4xl mb-4">🌸</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-3">Privacy Policy</h1>
          <p className="text-gray-500 text-sm">Last updated: March 2026</p>
          <p className="text-gray-600 mt-4 leading-relaxed">
            We keep this short and human-readable because you deserve to actually understand it.
          </p>
        </div>

        <div className="space-y-6">

          {/* What we collect */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              What we collect
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-3">
              When you use Safe the Date, we collect only what&apos;s needed to make your check-in work:
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex gap-2">
                <span className="text-pink-400 flex-shrink-0">•</span>
                <span><strong className="text-gray-700">Your email address</strong> — used to identify you and send you a login code</span>
              </li>
              <li className="flex gap-2">
                <span className="text-pink-400 flex-shrink-0">•</span>
                <span><strong className="text-gray-700">Your first name</strong> — so we can greet you and personalize your emails</span>
              </li>
              <li className="flex gap-2">
                <span className="text-pink-400 flex-shrink-0">•</span>
                <span><strong className="text-gray-700">Check-in details</strong> — what you&apos;re doing, where you&apos;re going, your deadline, and who your emergency contacts are</span>
              </li>
              <li className="flex gap-2">
                <span className="text-pink-400 flex-shrink-0">•</span>
                <span><strong className="text-gray-700">Emergency contact info</strong> — names and email addresses of the people you trust</span>
              </li>
            </ul>
            <p className="text-gray-500 text-sm mt-3 leading-relaxed">
              That&apos;s it. No tracking pixels, no analytics cookies, no browsing history, no device fingerprints.
            </p>
          </div>

          {/* Auto-deletion */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Your data is automatically deleted
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              All check-in sessions — including activity details, deadlines, and emergency contact info — are{" "}
              <strong className="text-gray-700">automatically deleted after 30 days</strong>. We don&apos;t hold onto old check-ins any longer than that.
            </p>
            <p className="text-gray-500 text-sm mt-3 leading-relaxed">
              Your account (email + name) stays around so you can log back in, but your check-in history quietly disappears on its own.
            </p>
          </div>

          {/* No selling */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              We will never sell your data
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Full stop. Your email, your emergency contacts, your activity details — none of it is ever sold, rented, or traded to third parties for marketing or any other purpose. Safe the Date isn&apos;t an ad business. We just want to help you stay safe.
            </p>
          </div>

          {/* Third-party services */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Services we use
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              To make Safe the Date work, we rely on two trusted services:
            </p>
            <div className="space-y-4">
              <div className="bg-pink-50 border border-pink-100 rounded-xl p-4">
                <h3 className="font-semibold text-gray-800 text-sm mb-1">Resend</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  We use <strong className="text-gray-600">Resend</strong> to send emails — your login code, your check-in confirmation, and the alert emails to your emergency contacts if you don&apos;t check in on time. Your email address is shared with Resend only to deliver these messages.
                </p>
              </div>
              <div className="bg-pink-50 border border-pink-100 rounded-xl p-4">
                <h3 className="font-semibold text-gray-800 text-sm mb-1">Neon</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Your data is stored in a <strong className="text-gray-600">Neon</strong> PostgreSQL database. Neon is a serverless Postgres provider that keeps your data secure in the cloud. We access only what&apos;s needed to run your check-ins.
                </p>
              </div>
            </div>
            <p className="text-gray-500 text-sm mt-4 leading-relaxed">
              Both services process data solely to provide functionality for Safe the Date — not for their own advertising or analytics purposes.
            </p>
          </div>

          {/* How we use it */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              How we use your information
            </h2>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex gap-2">
                <span className="text-pink-400 flex-shrink-0">•</span>
                <span>To send you a login code when you sign in</span>
              </li>
              <li className="flex gap-2">
                <span className="text-pink-400 flex-shrink-0">•</span>
                <span>To send check-in confirmation emails to you</span>
              </li>
              <li className="flex gap-2">
                <span className="text-pink-400 flex-shrink-0">•</span>
                <span>To notify your emergency contacts if you miss your deadline</span>
              </li>
              <li className="flex gap-2">
                <span className="text-pink-400 flex-shrink-0">•</span>
                <span>To show you your active check-in on the dashboard</span>
              </li>
            </ul>
            <p className="text-gray-500 text-sm mt-3 leading-relaxed">
              Nothing else. We don&apos;t analyze your data, build profiles, or use it for anything beyond running the check-in you created.
            </p>
          </div>

          {/* Your rights */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Your choices
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              You&apos;re always in control. If you&apos;d like your account or any stored data deleted, just email us and we&apos;ll take care of it promptly. You can also simply stop using the app — your check-in data will auto-delete within 30 days anyway.
            </p>
          </div>

          {/* Contact */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Questions?
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              If you have any questions about how your data is handled, we&apos;re happy to talk. Safe the Date is a small, personal project built with care — you&apos;re not going to get a form letter back.
            </p>
          </div>

        </div>

        {/* Back link */}
        <div className="text-center mt-12">
          <Link
            href="/"
            className="text-pink-500 hover:text-pink-600 text-sm font-medium transition-colors"
          >
            ← Back to Safe the Date
          </Link>
        </div>
      </main>

      <footer className="text-center text-sm text-gray-400 py-6 border-t border-pink-100 bg-white">
        Safe the Date · A personal reminder tool, not an emergency service
        <div className="mt-1">© 2026 Safe the Date. All rights reserved.</div>
        <div className="mt-1 flex justify-center gap-4">
          <a href="/terms" className="hover:text-pink-400 transition-colors">Terms of Use</a>
          <a href="/support" className="hover:text-pink-400 transition-colors">Support</a>
        </div>
      </footer>
    </div>
  );
}
