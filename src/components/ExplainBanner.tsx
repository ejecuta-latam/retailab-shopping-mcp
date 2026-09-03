import { motion, useReducedMotion } from "motion/react";

const ease = [0.22, 1, 0.36, 1] as const;

const beats = [
  {
    step: "01",
    title: "Same tools",
    body: "search_products, switch_store, add_to_cart. NileMart and DartHouse share one profile so the agent never scrapes.",
  },
  {
    step: "02",
    title: "This page only",
    body: "Tools see the open storefront. Milk is not on NileMart. The agent calls switch_store to WideMart, then shops there.",
  },
  {
    step: "03",
    title: "One cart",
    body: "Needs and picks live in a shared basket across stores. Then track the order through your integration.",
  },
] as const;

export default function ExplainBanner() {
  const reduce = useReducedMotion();

  const container = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduce ? 0 : 0.12,
        delayChildren: reduce ? 0 : 0.06,
      },
    },
  };

  const rise = {
    hidden: { opacity: 0, y: reduce ? 0 : 22 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reduce ? 0.01 : 0.6, ease },
    },
  };

  return (
    <motion.section
      className="explain"
      id="why"
      aria-labelledby="explain-heading"
      initial={reduce ? "show" : "hidden"}
      whileInView="show"
      viewport={{ once: true, amount: 0.28 }}
      variants={container}
    >
      <motion.div
        className="explain__glow"
        aria-hidden="true"
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { duration: reduce ? 0.01 : 0.9, ease } },
        }}
      />

      <div className="explain__inner">
        <motion.p className="explain__kicker" variants={rise}>
          The idea
        </motion.p>
        <motion.h2 id="explain-heading" className="explain__heading" variants={rise}>
          Agents shop the page. You keep the cart.
        </motion.h2>
        <motion.span
          className="explain__rule"
          aria-hidden="true"
          style={{ originX: 0 }}
          variants={{
            hidden: { scaleX: reduce ? 1 : 0 },
            show: {
              scaleX: 1,
              transition: { duration: reduce ? 0 : 0.7, ease, delay: reduce ? 0 : 0.15 },
            },
          }}
        />
        <motion.p className="explain__support" variants={rise}>
          shopping-mcp is a shared WebMCP profile. Stores can look different. The
          tools do not. An agent reads the storefront that is open, you choose,
          then the basket travels when you switch shops.
        </motion.p>

        <div className="explain__beats">
          {beats.map((beat) => (
            <motion.article
              key={beat.step}
              className="explain__card"
              variants={rise}
              whileHover={reduce ? undefined : { y: -4 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
            >
              <p className="explain__step">{beat.step}</p>
              <h3>{beat.title}</h3>
              <p>{formatBody(beat.body)}</p>
            </motion.article>
          ))}
        </div>

        <motion.div className="explain__actions" variants={rise}>
          <motion.a
            className="banner__cta banner__cta--primary"
            href="/docs"
            whileHover={reduce ? undefined : { y: -2, scale: 1.02 }}
            whileTap={reduce ? undefined : { scale: 0.98 }}
            transition={{ type: "spring", stiffness: 420, damping: 28 }}
          >
            Read the tools
          </motion.a>
        </motion.div>
      </div>
    </motion.section>
  );
}

function formatBody(body: string) {
  const tools = ["search_products", "switch_store", "add_to_cart"];
  const parts = body.split(new RegExp(`(${tools.join("|")})`, "g"));
  return parts.map((part, index) =>
    tools.includes(part) ? <code key={`${part}-${index}`}>{part}</code> : part,
  );
}
