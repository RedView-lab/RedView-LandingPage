import Image from "next/image";
import type { CSSProperties } from "react";
import {
  LANDING_FOUNDER_PERSONAS,
  LANDING_FOUNDER_PROFILES,
  LANDING_FOUNDER_STORY,
  type LandingFounderProfile,
} from "./founders-content";
import styles from "./LandingFoundersSection.module.css";

function VerifiedBadgeIcon() {
  return (
    <svg
      aria-hidden="true"
      className={styles.socialIcon}
      fill="none"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="10" cy="10" fill="rgba(255,255,255,0.08)" r="8.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 10.2L9.1 12.3L13.4 8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
    </svg>
  );
}

function FounderCard({ founder }: { founder: LandingFounderProfile }) {
  const imageStyle = founder.imagePosition ? ({ objectPosition: founder.imagePosition } as CSSProperties) : undefined;

  return (
    <article className={styles.founderCard}>
      <div className={styles.photoCard}>
        <Image
          alt={founder.imageAlt}
          className={styles.founderImage}
          fill
          placeholder="blur"
          sizes="(max-width: 720px) 100vw, (max-width: 1320px) 50vw, 33vw"
          src={founder.image}
          style={imageStyle}
        />
      </div>

      <div className={styles.founderBody}>
        <h3 className={styles.founderName}>{founder.name}</h3>
        <p className={styles.founderBio}>{founder.bio}</p>

        <div aria-label={`${founder.name} sur ${founder.socialLabel}`} className={styles.socialBadge}>
          <VerifiedBadgeIcon />
          <span className={styles.socialLabel}>{founder.socialLabel}</span>
        </div>
      </div>
    </article>
  );
}

export function LandingFoundersSection() {
  return (
    <section aria-labelledby="about-title" className={styles.section} id="apropos">
      <div className={styles.personaRail}>
        {LANDING_FOUNDER_PERSONAS.map((persona) => (
          <div
            className={styles.personaPill}
            key={persona.label}
            style={{ "--persona-color": persona.background } as CSSProperties}
          >
            <span>{persona.label}</span>
          </div>
        ))}
      </div>

      <div className={styles.layout}>
        <div className={styles.storyColumn}>
          <article className={styles.storyHeadlineCard}>
            <h2 className={styles.storyTitle} id="about-title">
              {LANDING_FOUNDER_STORY.title}
            </h2>
          </article>

          <article className={styles.storyCopyCard}>
            <p className={styles.storyCopy}>{LANDING_FOUNDER_STORY.description}</p>
          </article>
        </div>

        <div className={styles.profilesGrid}>
          {LANDING_FOUNDER_PROFILES.map((founder) => (
            <FounderCard founder={founder} key={founder.name} />
          ))}
        </div>
      </div>
    </section>
  );
}