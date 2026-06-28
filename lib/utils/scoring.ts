import { calculateMarkOutOf20, calculateLogPercent } from "@/lib/utils/moroccan-scoring";

export { calculateMarkOutOf20, calculateLogPercent };

import { markOutOf20ToGradeLabel } from "@/lib/utils/qualitative-grades";

export function formatMarkOutOf20(mark: number, locale = "fr"): string {
  return markOutOf20ToGradeLabel(mark, locale);
}
