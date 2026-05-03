import Image from "next/image";
import { LandingPricingPlanCard } from "./LandingPricingPlanCard";
import { LANDING_PRICING_ENTERPRISE, LANDING_PRICING_FEATURE_GROUPS, LANDING_PRICING_PLANS } from "./pricing-content";
import styles from "./LandingPricingSection.module.css";

export function LandingPricingSection() {
  return (
    <section aria-labelledby="pricing-title" className={styles.section} id="offres">
      <div className={styles.banner}>
        <Image
          alt="Aperçu des outils RedView et des vues d'analyse associées"
          className={styles.bannerImage}
          fill
          sizes="(max-width: 720px) 100vw, 100vw"
          src="/landing/pricing-banner.png"
        />
      </div>

      <div className={styles.layout}>
        <div className={styles.introCard}>
          <h2 className={styles.introTitle} id="pricing-title">
            Tous les services de planification rassemblés en un abonnement
          </h2>
        </div>

        <div className={styles.cards}>
          {LANDING_PRICING_PLANS.map((plan, index) => (
            <LandingPricingPlanCard cardIndex={index} groups={LANDING_PRICING_FEATURE_GROUPS} key={plan.id} plan={plan} />
          ))}

          <article className={styles.enterpriseCard} style={{ "--pricing-card-index": LANDING_PRICING_PLANS.length } as React.CSSProperties}>
            <div className={styles.enterpriseCardContent}>
              <div className={styles.planHeadingBlock}>
                <h3 className={styles.planName}>{LANDING_PRICING_ENTERPRISE.title}</h3>
              </div>

              <div className={styles.planBadgeRow}>
                <span className={styles.planBadge}>{LANDING_PRICING_ENTERPRISE.badge}</span>
              </div>

              <p className={styles.enterpriseCopy}>{LANDING_PRICING_ENTERPRISE.description}</p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}