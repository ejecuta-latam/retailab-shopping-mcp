import { motion } from "motion/react";

const brand = "shopping-mcp";
const support =
  "A shared tool profile so agents shop the same way on every store — then track orders through your integration.";

const ease = [0.22, 1, 0.36, 1] as const;

const rise = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
};

export default function Banner() {
  return (
    <section className="banner" aria-labelledby="banner-brand">
      <motion.div
        className="banner__glow"
        aria-hidden="true"
        initial={{ opacity: 0.45, scale: 0.92 }}
        animate={{ opacity: [0.45, 0.85, 0.55], scale: [0.92, 1.04, 1] }}
        transition={{ duration: 4.8, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
      />
      <div className="banner__content">
        <motion.p
          className="banner__kicker"
          variants={rise}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.55, ease, delay: 0.08 }}
        >
          WebMCP for retail
        </motion.p>
        <motion.h1
          id="banner-brand"
          className="banner__brand"
          variants={rise}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.65, ease, delay: 0.16 }}
        >
          {brand}
        </motion.h1>
        <motion.p
          className="banner__support"
          variants={rise}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.6, ease, delay: 0.28 }}
        >
          {support}
        </motion.p>
        <motion.div
          className="banner__actions"
          variants={rise}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.55, ease, delay: 0.4 }}
        >
          <motion.a
            className="banner__cta banner__cta--primary"
            href="/docs"
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 420, damping: 28 }}
          >
            Get started
          </motion.a>
          <motion.a
            className="banner__cta banner__cta--ghost"
            href="#demo"
            whileHover={{ y: -2, scale: 1.02, borderColor: "rgba(16, 36, 44, 0.28)" }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 420, damping: 28 }}
          >
            View demo
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
