export type LandingFeedbackFooterContent = {
  communityTitle: string;
  communityDescription: string;
  feedbackHref: string;
  feedbackLabel: string;
  contactTitle: string;
  contactDescription: string;
  emailLabel: string;
  emailHref: string;
  instagramLabel: string;
  instagramHref: string;
  copyright: string;
};

export const LANDING_FEEDBACK_FOOTER_CONTENT: LandingFeedbackFooterContent = {
  communityTitle: "Construit avec et pour la communauté",
  communityDescription:
    "RedView s’appuie de nombreuses rencontres, discussions et observations réalisées avec la communauté cycliste. Si vous voulez contribuer au développement de l’outil, vous pouvez utiliser notre questionnaire de feedback ci-dessous.",
  feedbackHref: "mailto:redview.app@proton.me?subject=Questionnaire%20feedback%20RedView",
  feedbackLabel: "Notre questionnaire de feedback",
  contactTitle: "Nous contacter",
  contactDescription: "Pour toute demande spéciale et prise de contact, écrivez nous par mail ou sur notre page instagram !",
  emailLabel: "redview.app@proton.me",
  emailHref: "mailto:redview.app@proton.me",
  instagramLabel: "redview.app",
  instagramHref: "https://instagram.com/redview.app",
  copyright: "©2026 REDVIEW - All Rights Reserved",
};