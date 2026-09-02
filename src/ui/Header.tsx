import { useStore } from "../hooks/useStore";

export function Header() {
  const { lastWitness, player } = useStore();

  return (
    <header className="chrome-header" data-witness={lastWitness?.tool ?? ""}>
      <a className="brand" href="/" aria-label="Pasillo">
        <svg className="brand-mark" viewBox="0 0 32 32" aria-hidden>
          <rect width="32" height="32" rx="6" fill="#1b1713" />
          <rect x="7" y="10" width="18" height="14" rx="2" fill="#f3ebe0" />
          <rect x="10" y="14" width="4" height="6" fill="#c45c26" />
          <rect x="18" y="14" width="4" height="6" fill="#4f7c8a" />
        </svg>
        <span>Pasillo</span>
      </a>
      <span className="sr-only" data-here-aisle={player.aisleId}>
        {player.aisleId}
      </span>
    </header>
  );
}
