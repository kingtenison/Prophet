export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6">
      <h1 className="text-6xl font-display font-bold text-primary-600 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-secondary-900 mb-2">Page not found</h2>
      <p className="text-secondary-600 mb-8 text-center max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <a
        href="/"
        className="px-6 py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors"
      >
        Return home
      </a>
    </div>
  )
}
