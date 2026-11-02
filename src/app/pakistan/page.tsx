import PakHero from "@/components/HomepageComponents/PakHero";
import PakThirdSection from "@/components/PakThirdSection";
import SecondSection from "@/components/PakSecondSection";
import GFC from "@/components/GeneralFormsComponents/GFC";
import Over15YearsOfExcellence from "@/components/HomepageComponents/Over15YearsOfExcellence";
import PakSectionDivider from "@/components/PakSectionDivider";
import PakStudyDestination from "@/components/PakStudyDestination";
export const metadata = {
  title: "JnS Education | Pakistan",
  description: "Explore JnS Education's services and opportunities in Pakistan.",
};
export default function PakistanPage() {
  return (
    <>
    <PakHero />
    <SecondSection />
    <PakThirdSection />
    <PakStudyDestination />
    <PakSectionDivider />
    <Over15YearsOfExcellence />
    <GFC />
    </>
  );
}