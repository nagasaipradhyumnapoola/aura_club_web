import { IntroSequence } from "@/components/intro/IntroSequence";
import { WhatWeDo } from "@/components/activities/WhatWeDo";
import { AuraStructure } from "@/components/structure/AuraStructure";
import { AuraPrinciples } from "@/components/principles/AuraPrinciples";
import { RecruitmentSection } from "@/components/recruitment/RecruitmentSection";
import { ContactSection } from "@/components/contact/ContactSection";

export default function Page() {
  return (
    <main>
      <IntroSequence />
      <WhatWeDo />
      <AuraStructure />
      <AuraPrinciples />
      <RecruitmentSection />
      <ContactSection />
    </main>
  );
}
