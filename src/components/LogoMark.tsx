/**
 * retailab mark — two aisle rails bridged by a lab node.
 * Meaning: retail path (humans) + agent connection (WebMCP tools) in one glyph.
 */
type Props = {
  className?: string;
};

export default function LogoMark({ className = "" }: Props) {
  return (
    <svg
      className={`logo-mark ${className}`.trim()}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <path d="M8 5v22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M24 5v22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M8 16h16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="16" cy="16" r="4.25" fill="currentColor" />
      <circle cx="16" cy="16" r="1.6" className="logo-mark__core" />
    </svg>
  );
}
