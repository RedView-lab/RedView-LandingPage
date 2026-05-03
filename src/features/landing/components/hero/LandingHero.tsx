import type { LandingHeroContent } from "@/features/landing/types/landing";
import styles from "./LandingHero.module.css";

type LandingHeroInput = Partial<LandingHeroContent> & {
  backgroundSrc?: string;
};

type LandingHeroProps = {
  content?: LandingHeroInput;
};

const FALLBACK_HERO_CONTENT: LandingHeroContent = {
  badge: "RedView.app - Advanced Planification Tool (Cycling)",
  headline: {
    prefix: "Enlarge your",
    emphasis: "vision",
  },
  imageSrc: "",
};

export function LandingHero({ content }: LandingHeroProps) {
  const normalizedContent: LandingHeroContent = {
    badge: content?.badge ?? FALLBACK_HERO_CONTENT.badge,
    headline: {
      prefix: content?.headline?.prefix ?? FALLBACK_HERO_CONTENT.headline.prefix,
      emphasis: content?.headline?.emphasis ?? FALLBACK_HERO_CONTENT.headline.emphasis,
    },
    imageSrc: content?.imageSrc ?? content?.backgroundSrc ?? FALLBACK_HERO_CONTENT.imageSrc,
  };

  return (
    <section className={styles.hero} id="hero">
      <div
        className={styles.heroVisual}
        style={normalizedContent.imageSrc ? { backgroundImage: `url(${normalizedContent.imageSrc})` } : undefined}
      />

      <div className={styles.content}>
        <h1 className={styles.title}>
          <span>{normalizedContent.headline.prefix} </span>
          <strong className={styles.titleEmphasis}>{normalizedContent.headline.emphasis}</strong>
        </h1>
      </div>
      <div className={styles.badge}>{normalizedContent.badge}</div>
    </section>
  );
}