// components/Footer.jsx
export default function Footer({ policyMode = false }) {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {policyMode ? (
          <p>&copy; {year} Whisone. All rights reserved. This policy is governed by California law.</p>
        ) : (
          <p>&copy; {year} Whisone. Built for pros who can&apos;t afford to miss.</p>
        )}
      </div>
    </footer>
  );
}