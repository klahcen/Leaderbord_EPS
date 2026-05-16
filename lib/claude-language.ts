export function getLanguageInstruction(locale: string): string {
  switch (locale) {
    case "fr":
      return "Respond entirely in French. Use formal educational French suitable for school reports and parent communication.";
    case "ar":
      return "Respond entirely in Modern Standard Arabic (الفصحى). Use clear, professional educational Arabic suitable for school reports.";
    default:
      return "Respond in English.";
  }
}
