import { motion } from "motion/react";

type NavLink = {
  href: string;
  label: string;
};

const links: NavLink[] = [
  { href: "/docs", label: "Docs" },
  { href: "#demo", label: "Demo" },
  { href: "#github", label: "GitHub" },
];

export default function Nav() {
  return (
    <motion.header
      className="nav"
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="nav__inner">
        <a className="nav__brand" href="/">
          shopping-mcp
        </a>
        <nav className="nav__links" aria-label="Primary">
          {links.map((link, index) => (
            <motion.a
              key={link.href}
              className="nav__link"
              href={link.href}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.12 + index * 0.06,
                duration: 0.35,
                ease: [0.22, 1, 0.36, 1],
              }}
              whileHover={{ y: -1 }}
            >
              {link.label}
            </motion.a>
          ))}
        </nav>
      </div>
    </motion.header>
  );
}
