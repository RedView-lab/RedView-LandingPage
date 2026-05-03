import type { LandingFeaturePresentation } from "@/features/landing/features/shared";

export const ventPresentation: LandingFeaturePresentation = {
	id: "vent",
	status: "ready",
	description:
		"Visualisez instantanement la direction et la force du vent sur la carte pour optimiser votre effort et votre exposition.",
	bullets: [
		"Flux d'air animes directement sur la cartographie.",
		"Anticipation de la fatigue liee au vent de face sur les longs segments ouverts.",
	],
	imageSrc: "/landing/features/vent/vent.png",
	imageAlt: "Vue RedView avec couche de vent en temps reel sur la carte.",
};