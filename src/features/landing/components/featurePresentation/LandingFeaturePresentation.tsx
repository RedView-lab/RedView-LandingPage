import Image from "next/image";
import type { LandingFeaturePresentation as LandingFeaturePresentationContent } from "@/features/landing/features/shared";
import type { LandingFeatureTile } from "@/features/landing/types/landing";
import styles from "./LandingFeaturePresentation.module.css";

type LandingFeaturePresentationProps = {
  tile: LandingFeatureTile;
  presentation: LandingFeaturePresentationContent;
};

export function LandingFeaturePresentation({ tile, presentation }: LandingFeaturePresentationProps) {
  const description = presentation.description ?? `${tile.title} sera détaillée prochainement.`;
  const bullets = presentation.bullets ?? [];
  const detailId = `feature-detail-${tile.id}`;

  return (
    <section aria-labelledby={detailId} className={styles.section} id={detailId}>
      <div className={styles.copyPanel}>
        <h2 className={styles.visuallyHidden}>{tile.title}</h2>
        <div className={styles.copyBody}>
          <p className={styles.description}>{description}</p>

          {bullets.length > 0 ? <div aria-hidden="true" className={styles.textSpacer} /> : null}

          {bullets.map((bullet, index) => (
            <div key={bullet}>
              <ul className={styles.bulletList}>
                <li className={styles.bulletItem}>{bullet}</li>
              </ul>
              {index < bullets.length - 1 ? <div aria-hidden="true" className={styles.textSpacer} /> : null}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.visualPanel}>
        {presentation.imageSrc ? (
          <div className={styles.imageWrap}>
            <Image
              alt={presentation.imageAlt ?? tile.title}
              className={styles.image}
              fill
              priority={presentation.id === "cartographie-3d"}
              sizes="(max-width: 960px) 100vw, 72vw"
              src={presentation.imageSrc}
            />
          </div>
        ) : (
          <div className={styles.placeholderVisual}>
            <div className={styles.placeholderLabel}>Bientôt disponible</div>
            <p className={styles.placeholderTitle}>{tile.title}</p>
          </div>
        )}
      </div>
    </section>
  );
}