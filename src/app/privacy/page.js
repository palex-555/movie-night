export default function PrivacyPolicy() {
  return (
    <main className="p-8 max-w-3xl mx-auto text-white">
      <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>

      <p className="mb-4">
        This website uses Google AdSense, a third-party advertising service provided by Google.
        Google may use cookies or device identifiers to serve personalized ads based on your
        visits to this and other websites.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">Information We Collect</h2>
      <p className="mb-4">
        We do not collect personal information directly. However, third-party vendors,
        including Google, use cookies to serve ads based on your prior visits to this website
        or other websites.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">How Google Uses Data</h2>
      <p className="mb-4">
        Google uses advertising cookies to enable it and its partners to serve ads to you
        based on your visit to this site and other sites on the Internet.
      </p>
      <p className="mb-4">
        You can learn more about how Google uses data here:
        <a
          href="https://policies.google.com/technologies/partner-sites"
          className="text-blue-400 underline ml-2"
        >
          https://policies.google.com/technologies/partner-sites
        </a>
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">Opting Out</h2>
      <p className="mb-4">
        Users may opt out of personalized advertising by visiting Google’s Ads Settings:
        <a
          href="https://www.google.com/settings/ads"
          className="text-blue-400 underline ml-2"
        >
          https://www.google.com/settings/ads
        </a>
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">Contact</h2>
      <p>
        If you have any questions, you can contact the site owner.
      </p>
    </main>
  );
}