import Image from "next/image";
import Link from "next/link";
import { LANDING_FEEDBACK_FOOTER_CONTENT } from "./feedback-content";
import styles from "./LandingFeedbackFooter.module.css";

function PlayCircleIcon() {
  return (
    <svg aria-hidden="true" className={styles.chipIcon} fill="none" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="8.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8.2 6.9L13.1 10L8.2 13.1V6.9Z" fill="currentColor" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg aria-hidden="true" className={styles.chipIcon} fill="none" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <path d="M3.5 5.5H16.5V14.5H3.5V5.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M4.5 6.5L10 10.75L15.5 6.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
  );
}

function VerifiedBadgeIcon() {
  return (
    <svg aria-hidden="true" className={styles.chipIcon} fill="none" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="8.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 10.2L9.1 12.3L13.4 8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
    </svg>
  );
}

export function LandingFeedbackFooter() {
  const content = LANDING_FEEDBACK_FOOTER_CONTENT;

  return (
    <section aria-labelledby="feedback-title" className={styles.section} id="feedbacks">
      <div className={styles.banner}>
        <Image
          alt="Panorama alpin RedView"
          className={styles.bannerImage}
          fill
          sizes="(max-width: 720px) 100vw, 100vw"
          src="/landing/footer/community-banner.png"
        />
      </div>

      <div className={styles.grid}>
        <div className={styles.row}>
          <article className={styles.titleCard}>
            <h2 className={styles.communityTitle} id="feedback-title">
              {content.communityTitle}
            </h2>
          </article>

          <article className={styles.bodyCard}>
            <p className={styles.copy}>{content.communityDescription}</p>

            <a className={styles.chip} href={content.feedbackHref}>
              <PlayCircleIcon />
              <span>{content.feedbackLabel}</span>
            </a>
          </article>
        </div>

        <div className={styles.row}>
          <article className={styles.titleCard}>
            <h2 className={styles.contactTitle}>{content.contactTitle}</h2>
          </article>

          <article className={styles.bodyCard}>
            <p className={styles.copy}>{content.contactDescription}</p>

            <div className={styles.chipRow}>
              <a className={styles.chip} href={content.emailHref}>
                <MailIcon />
                <span>{content.emailLabel}</span>
              </a>

              <a className={styles.chip} href={content.instagramHref} rel="noreferrer" target="_blank">
                <VerifiedBadgeIcon />
                <span>{content.instagramLabel}</span>
              </a>
            </div>
          </article>
        </div>
      </div>

      <footer className={styles.footerBar}>
        <div className={styles.footerBrandBlock}>
          <Link aria-label="RedView" className={styles.footerBrand} href="/">
            <Image alt="RedView" className={styles.footerLogo} height={24} src="/landing/header/redview-logo.png" unoptimized width={125} />
          </Link>

          <nav aria-label="Navigation du pied de page" className={styles.footerNav}>
            <Link className={styles.footerLink} href="#fonctionnalites">
              Fonctionnalités
            </Link>
            <Link className={styles.footerLink} href="#offres">
              Offres
            </Link>
            <Link className={styles.footerLink} href="#apropos">
              À propos
            </Link>
            <Link className={styles.footerLink} href="#feedbacks">
              Feedbacks
            </Link>
          </nav>
        </div>

        <div className={styles.copyright}>{content.copyright}</div>
      </footer>
    </section>
  );
}