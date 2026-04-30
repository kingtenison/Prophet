'use client'

export default function ProtectedError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: '#0a0a0a',
      color: 'white',
      fontFamily: 'monospace',
    }}>
      <div style={{ maxWidth: '600px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#ef4444' }}>
          Something went wrong
        </h2>
        <pre style={{
          background: '#1a1a1a',
          padding: '1rem',
          borderRadius: '8px',
          fontSize: '0.875rem',
          textAlign: 'left',
          overflowX: 'auto',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          marginBottom: '1rem',
          border: '1px solid #333',
        }}>
          {error.message}
          {error.digest && `\n\nDigest: ${error.digest}`}
        </pre>
        <button
          onClick={() => reset()}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.875rem',
          }}
        >
          Try again
        </button>
      </div>
    </div>
  )
}
