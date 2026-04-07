import Link from "next/link";

export const metadata = {
  title: "Terms of Use · Safe the Date",
  description: "Terms of use for Safe the Date.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-pink-50 to-fuchsia-50">
      <main className="max-w-2xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-4xl mb-4">📋</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-3">Terms of Use</h1>
          <p className="text-gray-500 text-sm">Last updated: April 2026</p>
          <p className="text-gray-600 mt-4 leading-relaxed">
            Plain language, no legalese. By using Safe the Date, you agree to the following.
          </p>
        </div>

        <div className="space-y-6">

          <div className="card">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">What Safe the Date is</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Safe the Date is a personal reminder tool that notifies your emergency contacts if you
              don&apos;t check in by a deadline you set. It is{" "}
              <strong className="text-gray-700">not an emergency service</strong> and is not a
              substitute for calling 911 or your local emergency number in a life-threatening
              situation.
            </p>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Your responsibilities</h2>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex gap-2">
                <span className="text-pink-400 flex-shrink-0">•</span>
                <span>Provide accurate emergency contact information and make sure your contacts are aware they may receive notifications.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-pink-400 flex-shrink-0">•</span>
                <span>Use the service in good faith — don&apos;t abuse it or use it to send unwanted messages to others.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-pink-400 flex-shrink-0">•</span>
                <span>Keep your account credentials secure and notify us if you suspect unauthorized access.</span>
              </li>
            </ul>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">No guarantees</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Safe the Date is provided as-is. While we do our best to keep it running reliably,
              we can&apos;t guarantee 100% uptime or that every alert email will be delivered.
              Email delivery depends on third-party services and factors outside our control. Do not
              rely on Safe the Date as your sole safety plan.
            </p>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Changes to these terms</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              We may update these terms from time to time. If we make significant changes,
              we&apos;ll do our best to let you know. Continued use of Safe the Date after changes
              means you accept the updated terms.
            </p>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Questions?</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Reach out at{" "}
              <a
                href="mailto:clairelin127@outlook.com"
                className="text-pink-500 hover:text-pink-600 font-medium transition-colors"
              >
                clairelin127@outlook.com
              </a>{" "}
              — we&apos;re happy to clarify anything.
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
      </footer>
    </div>
  );
}
