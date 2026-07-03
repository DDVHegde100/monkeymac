import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | MonkeyMac',
  description: 'Privacy policy for MonkeyMac mental math training.',
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-bg-primary text-text-primary">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <a href="/" className="text-accent hover:opacity-80">
          MonkeyMac
        </a>

        <h1 className="mt-8 text-4xl font-bold text-text-primary">Privacy Policy</h1>
        <p className="mt-3 text-text-secondary">Last updated: July 3, 2026</p>

        <section className="mt-10 space-y-5 text-text-secondary leading-7">
          <p>
            MonkeyMac is a mental math training app. We designed the mobile app to work
            without an account, and practice data is stored locally on your device.
          </p>

          <h2 className="pt-4 text-2xl font-semibold text-text-primary">Data We Collect</h2>
          <p>
            The MonkeyMac mobile app does not collect, sell, or share personal data. Your
            scores, history, mode records, and training statistics are stored locally on
            your device using local app storage.
          </p>

          <h2 className="pt-4 text-2xl font-semibold text-text-primary">Analytics And Tracking</h2>
          <p>
            The MonkeyMac mobile app does not use third-party tracking, advertising SDKs,
            or cross-app tracking. We do not sell personal information.
          </p>

          <h2 className="pt-4 text-2xl font-semibold text-text-primary">Web Version</h2>
          <p>
            The MonkeyMac web app may use account information only when you choose to
            register or sign in, so it can provide features such as saved stats,
            leaderboards, and multiplayer. Web account data is used only to provide the
            service.
          </p>

          <h2 className="pt-4 text-2xl font-semibold text-text-primary">Children&apos;s Privacy</h2>
          <p>
            MonkeyMac is intended for general education and mental math practice. We do
            not knowingly collect personal information from children through the mobile
            app.
          </p>

          <h2 className="pt-4 text-2xl font-semibold text-text-primary">Contact</h2>
          <p>
            If you have questions about this privacy policy, contact us through the{' '}
            <a
              className="text-accent hover:opacity-80"
              href="https://github.com/DDVHegde100/monkeymac"
            >
              MonkeyMac GitHub repository
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  )
}
