import type { LandingFeaturePresentation } from "@/features/landing/features/shared";

export const meteoPresentation: LandingFeaturePresentation = {
	id: "meteo",
	status: "ready",
	description:
		"Superposez les previsions en direct et les historiques climatiques directement sur votre trace pour eviter les mauvaises surprises.",
	bullets: [
		"Couches de donnees superposables directement sur la vue 3D.",
		"Acces aux historiques pour planifier des expeditions des mois a l'avance.",
		"Securisation du choix materiel avant le depart.",
	],
	imageSrc: "/landing/features/meteo/previsions-meteo.png",
	imageAlt: "Superposition meteo RedView sur une carte avec controles de previsions et tendances.",
};