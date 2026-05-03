"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ChangeEvent,
  type WheelEvent,
} from "react";
import { LandingFeaturePresentation } from "@/features/landing/components/featurePresentation/LandingFeaturePresentation";
import { LandingFeedbackFooter } from "@/features/landing/components/feedback";
import { LandingFoundersSection } from "@/features/landing/components/founders";
import { LandingPricingSection } from "@/features/landing/components/pricing";
import { LandingIcon } from "@/features/landing/components/shared/LandingIcon";
import { LANDING_FEATURE_PRESENTATIONS } from "@/features/landing/features/registry";
import type { LandingPageData } from "@/features/landing/types/landing";
import { LandingHeader } from "@/features/landing/components/header/LandingHeader";
import { LandingHero } from "@/features/landing/components/hero/LandingHero";
import styles from "./LandingPage.module.css";

type LandingPageProps = {
  content: LandingPageData;
};

export function LandingPage({ content }: LandingPageProps) {
  const mainRef = useRef<HTMLElement | null>(null);
  const railRef = useRef<HTMLDivElement | null>(null);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [maxScrollLeft, setMaxScrollLeft] = useState(0);
  const [viewportRatio, setViewportRatio] = useState(1);
  const [activeFeatureId, setActiveFeatureId] = useState(content.featureTiles[0]?.id ?? "cartographie-3d");

  useLayoutEffect(() => {
    const mainElement = mainRef.current;

    if (!mainElement) {
      return undefined;
    }

    const revealNodes = [
      { delay: undefined, mode: "up", selector: "#hero" },
      { delay: "80ms", mode: "scale", selector: `.${styles.heroDividerWrap}` },
      { delay: "120ms", mode: "up", selector: "#fonctionnalites" },
      { delay: undefined, mode: "up", selector: 'section[id^="feature-detail-"]' },
      { delay: undefined, mode: "up", selector: "#offres" },
      { delay: undefined, mode: "up", selector: "#apropos" },
      { delay: undefined, mode: "up", selector: "#feedbacks" },
    ].flatMap(({ delay, mode, selector }) => {
      return Array.from(mainElement.querySelectorAll<HTMLElement>(selector)).map((node) => {
        node.dataset.reveal = mode;

        if (delay) {
          node.style.setProperty("--reveal-delay", delay);
        } else {
          node.style.removeProperty("--reveal-delay");
        }

        return node;
      });
    });

    if (revealNodes.length === 0) {
      return undefined;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion || typeof IntersectionObserver === "undefined") {
      revealNodes.forEach((node) => {
        node.dataset.revealVisible = "true";
      });

      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          const target = entry.target as HTMLElement;
          target.dataset.revealVisible = "true";
          observer.unobserve(target);
        });
      },
      {
        threshold: 0.18,
        rootMargin: "0px 0px -12% 0px",
      },
    );

    revealNodes.forEach((node) => {
      if (node.dataset.revealVisible === "true") {
        return;
      }

      observer.observe(node);
    });

    return () => {
      observer.disconnect();
    };
  }, [activeFeatureId]);

  useEffect(() => {
    const rail = railRef.current;

    if (!rail) {
      return undefined;
    }

    const updateRailMetrics = () => {
      const nextMaxScrollLeft = Math.max(rail.scrollWidth - rail.clientWidth, 0);
      const nextViewportRatio = rail.scrollWidth > 0 ? Math.min(rail.clientWidth / rail.scrollWidth, 1) : 1;

      setMaxScrollLeft(nextMaxScrollLeft);
      setViewportRatio(nextViewportRatio);
      setScrollLeft(Math.min(rail.scrollLeft, nextMaxScrollLeft));
    };

    updateRailMetrics();

    const resizeObserver = new ResizeObserver(updateRailMetrics);
    resizeObserver.observe(rail);

    Array.from(rail.children).forEach((child) => {
      resizeObserver.observe(child);
    });

    window.addEventListener("resize", updateRailMetrics);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateRailMetrics);
    };
  }, [content.featureTiles.length]);

  const handleRailScroll = () => {
    const rail = railRef.current;

    if (!rail) {
      return;
    }

    const nextMaxScrollLeft = Math.max(rail.scrollWidth - rail.clientWidth, 0);

    if (nextMaxScrollLeft !== maxScrollLeft) {
      setMaxScrollLeft(nextMaxScrollLeft);
    }

    setScrollLeft(rail.scrollLeft);
  };

  const handleRailWheel = (event: WheelEvent<HTMLDivElement>) => {
    const rail = railRef.current;

    if (!rail || maxScrollLeft <= 0 || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
      return;
    }

    const canScrollBackward = event.deltaY < 0 && rail.scrollLeft > 0;
    const canScrollForward = event.deltaY > 0 && rail.scrollLeft < maxScrollLeft;

    if (!canScrollBackward && !canScrollForward) {
      return;
    }

    event.preventDefault();
    rail.scrollLeft += event.deltaY;
    setScrollLeft(rail.scrollLeft);
  };

  const handleScrubberChange = (event: ChangeEvent<HTMLInputElement>) => {
    const rail = railRef.current;

    if (!rail) {
      return;
    }

    const nextScrollLeft = Number(event.target.value);

    rail.scrollTo({ left: nextScrollLeft, behavior: "auto" });
    setScrollLeft(nextScrollLeft);
  };

  const scrubberMax = Math.max(maxScrollLeft, 1);
  const scrubberStyle = {
    "--scrubber-thumb-ratio": `${viewportRatio}`,
  } as CSSProperties;
  const activeTile = content.featureTiles.find((tile) => tile.id === activeFeatureId) ?? content.featureTiles[0];
  const activePresentation = activeTile ? LANDING_FEATURE_PRESENTATIONS[activeTile.id] : undefined;

  return (
    <div className={styles.page}>
      <LandingHeader content={content.header} />

      <main className={styles.main} ref={mainRef}>
        <LandingHero content={content.hero} />

        <div className={styles.heroDividerWrap}>
          <input
            aria-label="Défilement horizontal des fonctionnalités"
            className={styles.heroDivider}
            disabled={maxScrollLeft <= 0}
            max={scrubberMax}
            min={0}
            onChange={handleScrubberChange}
            step={1}
            style={scrubberStyle}
            type="range"
            value={Math.min(scrollLeft, scrubberMax)}
          />
        </div>

        <section className={styles.featureSection} id="fonctionnalites">
          <div className={styles.featureRail} onScroll={handleRailScroll} onWheel={handleRailWheel} ref={railRef}>
            {content.featureTiles.map((tile) => {
              const titleLines = tile.titleLines && tile.titleLines.length > 0 ? tile.titleLines : [tile.title];
              const hasFixedLineBreaks = titleLines.length > 1;
              const isActive = tile.id === activeFeatureId;
              const cardStyle = {
                "--tile-background": tile.background,
                "--tile-width": `${tile.widthPx ?? 240}px`,
                "--tile-text-width": tile.textWidthPx ? `${tile.textWidthPx}px` : undefined,
              } as CSSProperties;

              return (
                <button
                  aria-controls={`feature-detail-${tile.id}`}
                  aria-label={`Afficher la présentation ${tile.title}`}
                  aria-pressed={isActive}
                  className={styles.featureCard}
                  data-active={isActive ? "true" : "false"}
                  key={tile.id}
                  onClick={() => setActiveFeatureId(tile.id)}
                  style={cardStyle}
                  type="button"
                >
                  <LandingIcon className={styles.featureIcon} icon={tile.icon} />
                  <h2 className={styles.featureTitle} data-fixed-lines={hasFixedLineBreaks ? "true" : "false"}>
                    {titleLines.map((line) => (
                      <span className={styles.featureTitleLine} key={`${tile.id}-${line}`}>
                        {line}
                      </span>
                    ))}
                  </h2>
                </button>
              );
            })}
          </div>
        </section>

        {activeTile && activePresentation ? (
          <LandingFeaturePresentation key={activeTile.id} presentation={activePresentation} tile={activeTile} />
        ) : null}

        <LandingPricingSection />

        <LandingFoundersSection />

        <LandingFeedbackFooter />
      </main>
    </div>
  );
}