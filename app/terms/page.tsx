import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-4">Terms of Service (Placeholder)</h1>

        <p className="text-sm text-gray-600 mb-6">This page contains placeholder legal text. Replace with the final Terms of Service document provided by legal counsel before publishing.</p>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">1. Acceptance of Terms</h2>
          <p className="text-gray-700">[Placeholder] By accessing or using Ikram Automotive services, you agree to be bound by these terms.</p>

          <h2 className="text-lg font-semibold">2. Service Description</h2>
          <p className="text-gray-700">[Placeholder] Description of the services provided and any limitations.</p>

          <h2 className="text-lg font-semibold">3. Limitation of Liability</h2>
          <p className="text-gray-700">[Placeholder] Limitations and disclaimers.</p>
        </section>

        <div className="mt-8 text-sm text-gray-500">
          <p>This is placeholder content. For the final legal text, provide the approved Terms of Service document.</p>
          <p className="mt-3">Back to <Link href="/" className="underline">home</Link>.</p>
        </div>
      </main>
    </div>
  );
}
