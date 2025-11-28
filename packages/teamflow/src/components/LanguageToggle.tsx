import { useTranslation } from "@/lib/i18n";
import { Globe } from "lucide-react";

export default function LanguageToggle() {
  const { language, setLanguage } = useTranslation();

  return (
    <button
      onClick={() => setLanguage(language === "it" ? "en" : "it")}
      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent transition-colors"
      data-testid="button-language-toggle"
      title={language === "it" ? "Switch to English" : "Passa all'Italiano"}
    >
      <Globe className="w-5 h-5" />
      <span className="font-semibold uppercase">{language}</span>
    </button>
  );
}
