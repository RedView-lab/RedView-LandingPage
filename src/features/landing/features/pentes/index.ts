import type { LandingFeaturePresentation } from "@/features/landing/features/shared";

export const pentesPresentation: LandingFeaturePresentation = {
	id: "pentes",
	status: "ready",
	description:
		"Colorisez les inclinaisons selon vos propres pourcentages pour reperer immediatement les passages critiques ou un replat pour le bivouac.",
	bullets: [
		"Echelle de couleurs 100% personnalisable, en degres ou en pourcentages.",
		"Identification instantanee des zones pentues ou plates pour bivouaquer.",
	],
	imageSrc: "/landing/features/pentes/analyse-pentes.png",
	imageAlt: "Analyse des pentes RedView avec colorisation du relief autour d'un lac alpin.",
};