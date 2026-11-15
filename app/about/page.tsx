import { ScrollReveal } from "@/components/ScrollReveal";

export const metadata = {
  title: "About – SoleFix",
  description: "Learn about the SoleFix platform, its mission, and the team behind the retro shoe shop and restoration service.",
};

export default function AboutPage() {
  return (
    <section className="bg-retroBg text-retroText py-12 min-h-screen">
      <div className="container mx-auto px-4">
        <ScrollReveal className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-display mb-6 text-retroPrimary">About SoleFix</h1>
          <p className="mb-4">
            SoleFix started as a passion project to bring together sneaker enthusiasts and people who need reliable shoe restoration.
            Our retro‑inspired design reflects a love for classic aesthetics while leveraging modern technology for a smooth shopping experience.
          </p>
          <p className="mb-4">
            We curate a selection of fresh kicks and offer expert repair services, all backed by a seamless online platform.
            Our mission is to keep your shoes looking fresh and lasting longer.
          </p>
          <p className="mb-4">
            The team combines expertise in fashion, craftsmanship, and software engineering to deliver a unique blend of style and functionality.
          </p>
          <p className="mt-8 text-sm">
            © {new Date().getFullYear()} SoleFix – All rights reserved.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}

