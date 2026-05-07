import Image from "next/image";
import Link from "next/link";
import { LANDING_FEEDBACK_FOOTER_CONTENT } from "./feedback-content";
import styles from "./LandingFeedbackFooter.module.css";

function PlayCircleIcon() {
  return (
    <Image alt="" aria-hidden="true" className={styles.chipIcon} height={20} src="/landing/icons/feedback-play.svg" unoptimized width={20} />
  );
}

function MailIcon() {
  return (
    <Image alt="" aria-hidden="true" className={styles.chipIcon} height={20} src="/landing/icons/email.svg" unoptimized width={20} />
  );
}

function VerifiedBadgeIcon() {
  return (
    <Image alt="" aria-hidden="true" className={styles.chipIcon} height={20} src="/landing/icons/instagram-verified.svg" unoptimized width={20} />
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

            <Link className={styles.chip} href={content.feedbackHref}>
              <PlayCircleIcon />
              <span>{content.feedbackLabel}</span>
            </Link>
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
            <Image alt="RedView" className={styles.footerLogo} height={24} src="/landing/icons/redview-logo.svg" unoptimized width={125} />
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