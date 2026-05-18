import { calculateMarkOutOf20, calculateLogPercent } from "@/lib/utils/moroccan-scoring";

export { calculateMarkOutOf20, calculateLogPercent };

export function formatMarkOutOf20(mark: number): string {
  return `${mark.toFixed(2)}/20`;
}
