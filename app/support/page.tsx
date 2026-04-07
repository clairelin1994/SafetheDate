import Link from "next/link";

export const metadata = {
  title: "Support · Safe the Date",
  description: "Get help with Safe the Date — FAQ and contact info.",
};

const faqs = [
  {
    q: "How does Safe the Date work?",
    a: "You create a check-in by entering what you're doing, where you're going, and when you expect to be back. You add 1–3 trusted emergency contacts. If you confirm you're safe before the deadline, the session closes quietly. If you don't, your contacts automatically receive an email letting them know something may be wrong.",
  },
  {
    q: "How do I cancel my subscription?",
    a: "Safe the Date is free to try. Premium features are available for $3.99/month, and you can cancel anytime from your account settings. If you'd like your account deleted entirely, just email us and we'll take care of it right away.",
  },
  {
    q: "How is my data handled?",
    a: "We collect only what's needed to run your check-in: your email, name, check-in details, and emergency contact info. All check-in sessions are automatically deleted after 30 days. We never sell your data. For the full picture, see our Privacy Policy.",
    link: { href: "/privacy", label: "Privacy Policy" },
  },
];

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-pink-50 to-fuchsia-50">
      <main className="max-w-2xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-4xl mb-4">💌</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-3">Need Help?</h1>
          <p className="text-gray-600 mt-4 leading-relaxed">
            Safe the Date is a small personal project — if something isn't working or you have a
            question, just reach out. You'll hear back from a real person.
          </p>
        </div>

        <div className="space-y-6">
          {/* Contact */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Contact us</h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              For any questions, feedback, or account requests (like data deletion), email us
              directly:
            </p>
            <a
              href="mailto:clairelin127@outlook.com"
              className="inline-flex items-center gap-2 bg-pink-50 border border-pink-200 text-pink-600 font-medium text-sm px-4 py-2.5 rounded-xl hover:bg-pink-100 transition-colors"
            >
              📧 clairelin127@outlook.com
            </a>
          </div>

          {/* FAQ */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-800 mb-5">
              Frequently asked questions
            </h2>
            <div className="space-y-6">
              {faqs.map(({ q, a, link }) => (
                <div key={q}>
                  <h3 className="font-semibold text-gray-800 text-sm mb-2">{q}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {a}{" "}
                    {link && (
                      <Link
                        href={link.href}
                        className="text-pink-500 hover:text-pink-600 font-medium transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </p>
                </div>
              ))}
            </div>
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
