function Footer(): React.ReactNode {
  return (
    <footer
      className="mt-6 py-4 text-center text-sm"
      style={{ borderTop: '1px solid var(--border)', color: 'var(--muted)' }}
    >
      <a
        href="https://faffweasel.com"
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: 'var(--accent)' }}
      >
        faffweasel.com
      </a>
      {' · AGPL-3.0 · '}
      <a
        href="https://github.com/faffweasel/meeting-costs"
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: 'var(--accent)' }}
      >
        source
      </a>
      {' · EU hosted'}
    </footer>
  );
}

export { Footer };
