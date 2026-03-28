function PrivacyNotice(): React.ReactNode {
  return (
    <div
      className="mt-12 pt-5 text-center text-sm"
      style={{ borderTop: '1px solid var(--border)', color: 'var(--muted)' }}
    >
      <p>No data leaves your browser.</p>
      <p className="mt-1">On-cost rates: UK 2025/26.</p>
    </div>
  );
}

export { PrivacyNotice };
