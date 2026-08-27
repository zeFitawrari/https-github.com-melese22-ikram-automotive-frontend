import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-4">Privacy Policy (Placeholder)</h1>

        <p className="text-sm text-gray-600 mb-6">This page contains placeholder legal text. Replace with the final Privacy Policy document provided by legal counsel before publishing.</p>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">1. Information We Collect</h2>
          <p className="text-gray-700">[Placeholder] Types of personal data collected and how it is used.</p>

          <h2 className="text-lg font-semibold">2. How We Use Information</h2>
          <p className="text-gray-700">[Placeholder] Purposes for processing personal data.</p>

          <h2 className="text-lg font-semibold">3. Your Rights</h2>
          <p className="text-gray-700">[Placeholder] Rights available to users regarding their personal data.</p>
        </section>

        <div className="mt-8 text-sm text-gray-500">
          <p>This is placeholder content. For the final legal text, provide the approved Privacy Policy document.</p>
          <p className="mt-3">Back to <Link href="/" className="underline">home</Link>.</p>
        </div>
      </main>
    </div>
  );
}
