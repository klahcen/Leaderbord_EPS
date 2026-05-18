-- Reset progress logs for activity structure migration
TRUNCATE TABLE "ProgressLog";

-- Drop old enum and column
DROP INDEX IF EXISTS "ProgressLog_physicalActivity_idx";
ALTER TABLE "ProgressLog" DROP COLUMN IF EXISTS "physicalActivity";
DROP TYPE IF EXISTS "PhysicalActivity";

-- New enums
CREATE TYPE "ActivityFamily" AS ENUM ('ATHLETISME', 'SPORTS_COLLECTIFS', 'GYMNASTIQUE');
CREATE TYPE "SubActivity" AS ENUM (
  'COURSE_VITESSE', 'COURSE_HAIES', 'COURSE_RELAIS', 'COURSE_ENDURANCE',
  'SAUT_LONGUEUR', 'SAUT_HAUTEUR', 'TRIPLE_SAUT',
  'LANCER_POIDS', 'LANCER_DISQUE', 'LANCER_JAVELOT',
  'FOOTBALL', 'BASKETBALL', 'HANDBALL', 'RUGBY',
  'VOLLEYBALL', 'BADMINTON', 'GYMNASTIQUE_SOL'
);
CREATE TYPE "AthletismeGroup" AS ENUM ('COURSES', 'SAUTS', 'LANCERS');
CREATE TYPE "SportsCollectifsType" AS ENUM ('MARQUAGE_DEMARQUAGE', 'SPORTS_RENVOI');

-- New columns
ALTER TABLE "ProgressLog" ADD COLUMN "family" "ActivityFamily" NOT NULL;
ALTER TABLE "ProgressLog" ADD COLUMN "subActivity" "SubActivity" NOT NULL;

CREATE INDEX "ProgressLog_family_idx" ON "ProgressLog"("family");
CREATE INDEX "ProgressLog_subActivity_idx" ON "ProgressLog"("subActivity");
