import type { LandingFeaturePresentation } from "@/features/landing/features/shared";

export const altitudePresentation: LandingFeaturePresentation = {
	id: "altitude",
	status: "ready",
	description:
		"Personnalisez l'affichage par paliers d'altitude pour adapter votre parcours aux contraintes du terrain et comprendre en un coup d'oeil les reliefs.",
	bullets: [
		"Decoupage de l'affichage en tranches d'altitude sur mesure.",
		"Visualisation claire des cols exposes et des fonds de vallees.",
		"Aide a la gestion des risques (froid, enneigement, mal des montagnes).",
	],
	imageSrc: "/landing/features/altitude/analyse-altitude.png",
	imageAlt: "Visualisation RedView de l'altitude avec colorisation par tranches sur un massif alpin.",
};