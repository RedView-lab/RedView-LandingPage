"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
} from "react";
import { CountrySelectField, type CountryOption } from "@/features/landing/components/form/CountrySelectField";

type SportEntry = {
  id: string;
  sport: string;
  level: string;
  annualDistance: string;
};

type FieldWrapperProps = {
  label: string;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  help?: boolean;
  children: React.ReactNode;
};

const SPORT_OPTIONS = ["Velo de route", "Gravel", "VTT", "Trail", "Randonnee"];
const LEVEL_OPTIONS = ["Debutant", "Intermediaire", "Avance", "Expert"];
const FEATURE_OPTIONS = [
  "Calque meteo",
  "Cartographie 3D",
  "Analyse d'itineraire",
  "Exports",
  "Compte utilisateur",
];

const COUNTRY_FIELD_OPTIONS: CountryOption[] = [
  { value: "France", flagCode: "FR" },
  { value: "Belgique", flagCode: "BE" },
  { value: "Suisse", flagCode: "CH" },
  { value: "Canada", flagCode: "CA" },
];

const INPUT_CLASSNAME =
  "h-10 w-full rounded-[8px] border border-[rgba(213,215,218,0.16)] bg-white/8 px-3 text-[16px] leading-6 text-white shadow-[0_1px_2px_rgba(10,13,18,0.05)] outline-none transition-[background-color,border-color,box-shadow] duration-150 placeholder:text-white/40 hover:bg-white/10 focus:border-white/28 focus:bg-white/10 focus:shadow-[0_0_0_3px_rgba(255,255,255,0.06)]";
const SELECT_CLASSNAME = `${INPUT_CLASSNAME} appearance-none pr-10`;

function createSportEntry(index: number, withDefaults = false): SportEntry {
  return {
    id: `sport-${index}`,
    sport: withDefaults ? "Velo de route" : "",
    level: withDefaults ? "Debutant" : "",
    annualDistance: withDefaults ? "500km" : "",
  };
}

function ChevronDownIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 20 20">
      <path d="M6 8L10 12L14 8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 20 20">
      <path d="M3.5 5.5H16.5V14.5H3.5V5.5Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.5" />
      <path d="M4.5 6.5L10 10.75L15.5 6.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg aria-hidden="true" className="size-4 text-white/64" fill="none" viewBox="0 0 16 16">
      <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 7V10.2" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
      <circle cx="8" cy="4.8" r="0.8" fill="currentColor" />
    </svg>
  );
}

function UploadCloudIcon() {
  return (
    <svg aria-hidden="true" className="size-5 text-white" fill="none" viewBox="0 0 20 20">
      <path
        d="M6.2 13.7H13.8C15.54 13.7 16.95 12.29 16.95 10.55C16.95 9 15.83 7.71 14.35 7.44C13.9 5.6 12.23 4.23 10.25 4.23C8.5 4.23 7 5.31 6.4 6.84C4.99 7.01 3.9 8.21 3.9 9.67C3.9 11.34 5.26 12.7 6.93 12.7"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path d="M10 8.4V15" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
      <path d="M7.7 10.7L10 8.4L12.3 10.7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
  );
}

function FieldWrapper({ label, htmlFor, required = false, hint, help = false, children }: FieldWrapperProps) {
  return (
    <label className="flex w-full flex-col gap-1.5" htmlFor={htmlFor}>
      <span className="flex items-center gap-1.5 text-[15px] font-semibold leading-[1.2] text-white">
        <span>{label}</span>
        {required ? <span className="text-[14px] text-[#7f56d9]">*</span> : null}
        {help ? <InfoIcon /> : null}
      </span>
      {children}
      {hint ? <span className="text-[12px] leading-[18px] text-white/64">{hint}</span> : null}
    </label>
  );
}

function InputShell({ children }: { children: React.ReactNode }) {
  return <div className="relative w-full">{children}</div>;
}

function SelectField(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <InputShell>
      <select {...props} className={`${SELECT_CLASSNAME} ${props.className ?? ""}`.trim()} />
      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-white/64">
        <ChevronDownIcon />
      </span>
    </InputShell>
  );
}

export function LandingFeedbackFormPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("France");
  const [feature, setFeature] = useState("Calque meteo");
  const [issueType, setIssueType] = useState("");
  const [description, setDescription] = useState("");
  const [sports, setSports] = useState<SportEntry[]>([createSportEntry(1)]);
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [submitState, setSubmitState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const nextSportIndexRef = useRef(2);
  const resetTimerRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current !== null) {
        window.clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  const handleAddSport = () => {
    const nextIndex = nextSportIndexRef.current;
    nextSportIndexRef.current += 1;
    setSports((current) => [...current, createSportEntry(nextIndex)]);
  };

  const handleSportChange = (sportId: string, field: keyof Omit<SportEntry, "id">, value: string) => {
    setSports((current) => current.map((entry) => (entry.id === sportId ? { ...entry, [field]: value } : entry)));
  };

  const handleFilesSelected = (selectedFiles: FileList | null) => {
    if (!selectedFiles) {
      return;
    }

    setFiles(Array.from(selectedFiles));
  };

  const handleFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleFilesSelected(event.target.files);
  };

  const handleDragOver = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    handleFilesSelected(event.dataTransfer.files);
  };

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setCountry("France");
    setFeature("Calque meteo");
    setIssueType("");
    setDescription("");
    setSports([createSportEntry(1)]);
    setFiles([]);
    setIsDragging(false);
    setSubmitState("idle");
    setSubmitMessage(null);
    nextSportIndexRef.current = 2;

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload = {
      firstName,
      lastName,
      email,
      country,
      feature,
      issueType,
      description,
      sports,
      files: files.map((file) => file.name),
      savedAt: new Date().toISOString(),
    };

    window.localStorage.setItem("redview-feedback-form-draft", JSON.stringify(payload));

    const formData = new FormData();
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("email", email);
    formData.append("country", country);
    formData.append("feature", feature);
    formData.append("issueType", issueType);
    formData.append("description", description);
    formData.append("sports", JSON.stringify(sports));

    for (const file of files) {
      formData.append("screenshots", file);
    }

    setSubmitState("submitting");
    setSubmitMessage(null);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        throw new Error(data?.error || "Impossible d'envoyer le feedback pour le moment.");
      }

      setSubmitState("success");
      setSubmitMessage("Merci. Le formulaire a bien ete envoye a redview.app@proton.me.");
    } catch (error) {
      setSubmitState("error");
      setSubmitMessage(
        error instanceof Error ? error.message : "Impossible d'envoyer le feedback pour le moment."
      );
    }

    if (resetTimerRef.current !== null) {
      window.clearTimeout(resetTimerRef.current);
    }

    resetTimerRef.current = window.setTimeout(() => {
      setSubmitState("idle");
      if (submitState !== "success") {
        setSubmitMessage(null);
      }
    }, 4000);
  };

  const uploadCaption = files.length > 0 ? `${files.length} fichier${files.length > 1 ? "s" : ""} selectionne${files.length > 1 ? "s" : ""}` : "SVG, PNG, JPG or GIF (max. 800x400px)";

  return (
    <main className="auth-page min-h-screen px-4 pb-20 pt-6 sm:px-8 sm:pb-28 sm:pt-10 xl:px-12">
      <form className="mx-auto grid w-full max-w-[1560px] grid-cols-1 gap-8 xl:grid-cols-[250px_minmax(0,1fr)_250px] xl:gap-3" onSubmit={handleSubmit}>
        <div className="flex min-h-16 items-start xl:pt-3">
          <Link aria-label="Retour a l'accueil RedView" className="transition-opacity hover:opacity-80" href="/">
            <Image
              alt="RedView"
              className="h-auto w-[102px]"
              height={29}
              priority
              src="/landing/header/redview-logo.png"
              width={125}
            />
          </Link>
        </div>

        <div className="min-w-0">
          <div className="border-b border-white/8 pb-3">
            <h1 className="font-[var(--font-landing)] text-[24px] font-bold leading-none text-white">
              Formulaire de retour utilisateur
            </h1>
          </div>

          <div className="pt-4">
            <section className="grid grid-cols-1 gap-x-8 gap-y-4 py-4 lg:grid-cols-[minmax(200px,280px)_minmax(0,640px)]">
              <div>
                <h2 className="font-[var(--font-landing)] text-[16px] font-bold leading-none text-white">Coordonnees</h2>
              </div>
              <div className="flex min-w-0 flex-col gap-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <FieldWrapper htmlFor="firstName" label="First name">
                    <input
                      autoComplete="given-name"
                      className={INPUT_CLASSNAME}
                      id="firstName"
                      onChange={(event) => setFirstName(event.target.value)}
                      placeholder="Votre prenom"
                      type="text"
                      value={firstName}
                    />
                  </FieldWrapper>
                  <FieldWrapper htmlFor="lastName" label="Last name">
                    <input
                      autoComplete="family-name"
                      className={INPUT_CLASSNAME}
                      id="lastName"
                      onChange={(event) => setLastName(event.target.value)}
                      placeholder="Votre nom"
                      type="text"
                      value={lastName}
                    />
                  </FieldWrapper>
                </div>

                <FieldWrapper
                  htmlFor="email"
                  hint="Votre adresse e-mail sera uniquement utilisee dans le cadre de l'amelioration"
                  label="Email address"
                  required
                >
                  <InputShell>
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-white/64">
                      <MailIcon />
                    </span>
                    <input
                      autoComplete="email"
                      className={`${INPUT_CLASSNAME} pl-10`}
                      id="email"
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="vous@exemple.com"
                      required
                      type="email"
                      value={email}
                    />
                  </InputShell>
                </FieldWrapper>

                <FieldWrapper htmlFor="country" label="Pays">
                  <CountrySelectField id="country" onChange={setCountry} options={COUNTRY_FIELD_OPTIONS} value={country} />
                </FieldWrapper>
              </div>
            </section>

            <section className="grid grid-cols-1 gap-x-8 gap-y-4 py-4 lg:grid-cols-[minmax(200px,280px)_minmax(0,640px)]">
              <div>
                <h2 className="font-[var(--font-landing)] text-[16px] font-bold leading-none text-white">Pratique</h2>
              </div>
              <div className="flex min-w-0 flex-col gap-6">
                {sports.map((sportEntry, index) => (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-3" key={sportEntry.id}>
                    <FieldWrapper htmlFor={`sport-${sportEntry.id}`} label={`Sport ${index + 1}`}>
                      <SelectField
                        id={`sport-${sportEntry.id}`}
                        onChange={(event) => handleSportChange(sportEntry.id, "sport", event.target.value)}
                        value={sportEntry.sport}
                      >
                        <option value="">Choisir un sport</option>
                        {SPORT_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </SelectField>
                    </FieldWrapper>

                    <FieldWrapper htmlFor={`level-${sportEntry.id}`} label="Level">
                      <SelectField
                        id={`level-${sportEntry.id}`}
                        onChange={(event) => handleSportChange(sportEntry.id, "level", event.target.value)}
                        value={sportEntry.level}
                      >
                        <option value="">Choisir un niveau</option>
                        {LEVEL_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </SelectField>
                    </FieldWrapper>

                    <FieldWrapper htmlFor={`annualDistance-${sportEntry.id}`} label="Moyenne annuelle">
                      <input
                        className={INPUT_CLASSNAME}
                        id={`annualDistance-${sportEntry.id}`}
                        onChange={(event) => handleSportChange(sportEntry.id, "annualDistance", event.target.value)}
                        placeholder="500km"
                        type="text"
                        value={sportEntry.annualDistance}
                      />
                    </FieldWrapper>
                  </div>
                ))}

                <div className="flex justify-end">
                  <button
                    className="inline-flex h-[41px] items-center justify-center rounded-[8px] bg-[#890000] px-[14px] py-[10px] text-[16px] font-medium leading-none text-white transition-colors duration-150 hover:bg-[#9f0000]"
                    onClick={handleAddSport}
                    type="button"
                  >
                    Ajouter un sport
                  </button>
                </div>

                <div className="h-px w-full bg-white/8" />
              </div>
            </section>

            <div className="h-px w-full bg-white/8" />

            <section className="grid grid-cols-1 gap-x-8 gap-y-4 py-4 lg:grid-cols-[minmax(200px,280px)_minmax(0,640px)]">
              <div>
                <h2 className="font-[var(--font-landing)] text-[16px] font-bold leading-none text-white">Votre retour</h2>
              </div>
              <div className="flex min-w-0 flex-col gap-6 py-4">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <FieldWrapper htmlFor="feature" label="Fonctionalite concernee">
                    <SelectField id="feature" onChange={(event) => setFeature(event.target.value)} value={feature}>
                      {FEATURE_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </SelectField>
                  </FieldWrapper>

                  <FieldWrapper htmlFor="issueType" label="Type de probleme">
                    <input
                      className={INPUT_CLASSNAME}
                      id="issueType"
                      onChange={(event) => setIssueType(event.target.value)}
                      placeholder="Ex: Vitesse de chargement"
                      type="text"
                      value={issueType}
                    />
                  </FieldWrapper>
                </div>

                <FieldWrapper help htmlFor="description" label="Description" required>
                  <textarea
                    className="min-h-[120px] w-full resize-none rounded-[8px] border border-[rgba(213,215,218,0.16)] bg-white/8 px-3 py-2 text-[16px] leading-6 text-white shadow-[0_1px_2px_rgba(10,13,18,0.05)] outline-none transition-[background-color,border-color,box-shadow] duration-150 placeholder:text-white/40 hover:bg-white/10 focus:border-white/28 focus:bg-white/10 focus:shadow-[0_0_0_3px_rgba(255,255,255,0.06)]"
                    id="description"
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Decrivez votre probleme ici..."
                    required
                    value={description}
                  />
                </FieldWrapper>
              </div>
            </section>

            <div className="h-px w-full bg-white/8" />

            <section className="grid grid-cols-1 gap-x-8 gap-y-4 py-4 lg:grid-cols-[minmax(200px,280px)_minmax(0,640px)]">
              <div className="flex flex-col gap-2">
                <h2 className="font-[var(--font-landing)] text-[16px] font-bold leading-none text-white">
                  Captures d&apos;ecran (optionel)
                </h2>
                <p className="text-[15px] leading-none text-white">Montrez-nous les ecrans concernes.</p>
              </div>
              <div className="min-w-0">
                <label
                  className={`relative flex h-[126px] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-[8px] border border-[rgba(213,215,218,0.16)] bg-white/8 px-3 py-2 text-center shadow-[0_1px_2px_rgba(10,13,18,0.05)] transition-[background-color,border-color,box-shadow] duration-150 ${isDragging ? "border-white/28 bg-white/12 shadow-[0_0_0_3px_rgba(255,255,255,0.06)]" : "hover:bg-white/10"}`}
                  htmlFor="screenshots"
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <div className="flex size-10 items-center justify-center rounded-[8px] bg-[rgba(255,255,255,0.06)] shadow-[inset_0_0_0_1px_rgba(10,13,18,0.18),inset_0_-2px_0_rgba(10,13,18,0.05)]">
                    <UploadCloudIcon />
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <p className="text-[15px] font-semibold leading-none text-white">
                      <span>Click to upload</span>
                      <span className="text-white/64"> or drag and drop</span>
                    </p>
                    <p className="text-[12px] leading-[18px] text-white/64">{uploadCaption}</p>
                  </div>
                  <div className="pointer-events-none absolute right-[22px] top-[65px] flex size-10 items-center justify-center rounded-[10px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.14),rgba(255,255,255,0.02))] shadow-[0_24px_48px_rgba(10,13,18,0.18),0_4px_4px_rgba(10,13,18,0.04)]">
                    <span className="rounded-[2px] bg-[#7f56d9] px-[3px] py-[2px] text-[10px] font-bold leading-none text-white">JPG</span>
                  </div>
                </label>
                <input
                  accept="image/png,image/jpeg,image/gif,image/svg+xml"
                  className="sr-only"
                  id="screenshots"
                  multiple
                  onChange={handleFileInputChange}
                  ref={fileInputRef}
                  type="file"
                />
              </div>
            </section>

            <section className="grid grid-cols-1 gap-x-8 gap-y-4 py-4 lg:grid-cols-[minmax(200px,280px)_minmax(0,640px)]">
              <div>
                <h2 className="font-[var(--font-landing)] text-[16px] font-bold leading-none text-white">Votre retour</h2>
              </div>
              <div className="flex min-w-0 flex-col py-4">
                <div className="h-px w-full bg-white/8" />
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    className="inline-flex h-[41px] items-center justify-center rounded-[8px] bg-white/8 px-[14px] py-[10px] text-[16px] font-medium leading-none text-white transition-colors duration-150 hover:bg-white/12"
                    onClick={resetForm}
                    type="button"
                  >
                    Annuler
                  </button>
                  <button
                    className="inline-flex h-[41px] items-center justify-center rounded-[8px] bg-[#890000] px-[14px] py-[10px] text-[16px] font-medium leading-none text-white transition-colors duration-150 hover:bg-[#9f0000] disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={submitState === "submitting"}
                    type="submit"
                  >
                    {submitState === "submitting"
                      ? "Envoi..."
                      : submitState === "success"
                        ? "Envoye"
                        : "Envoyer"}
                  </button>
                </div>
                {submitMessage ? (
                  <p className={`pt-3 text-right text-[13px] ${submitState === "error" ? "text-[#ff8d8d]" : "text-white/72"}`.trim()}>
                    {submitMessage}
                  </p>
                ) : null}
              </div>
            </section>
          </div>
        </div>

        <div className="hidden xl:block" />
      </form>
    </main>
  );
}