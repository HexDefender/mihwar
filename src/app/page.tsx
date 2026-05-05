import { LandingNav } from "@/components/landing/nav";
import { Hero } from "@/components/landing/hero";
import { FeaturesBento } from "@/components/landing/features-bento";
import { FlowSection } from "@/components/landing/flow-section";
import { CtaSection } from "@/components/landing/cta-section";
import { LandingFooter } from "@/components/landing/footer";

export default function HomePage() {
  return (
    <>
      <LandingNav />
      <main className="relative">
        <Hero />
        <FeaturesBento />
        <FlowSection />
        <CtaSection />
      </main>
      <LandingFooter />
    </>
  );
}
