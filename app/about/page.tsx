import ScrollReveal from "@/components/ScrollReveal";

export const metadata = {
  title: "About – ACHILLES",
  description: "Learn about ACHILLES, its mission, and the team behind our shoe shop and repair service.",
};

export default function AboutPage() {
  return (
    <section className="abstract-hero rounded-3xl mx-4 my-10 py-16 px-4 md:px-10 min-h-[60vh]">
      <ScrollReveal className="max-w-3xl mx-auto space-y-5">
        <p className="eyebrow">Our story</p>
        <h1 className="page-title">About ACHILLES</h1>
        <p className="leading-relaxed">
          ACHILLES started as a passion project to bring together sneaker lovers and people who need reliable shoe repair.
          We believe a good pair of shoes deserves a second life, so we pair fresh finds with expert restoration.
        </p>
        <p className="leading-relaxed">
          We curate a selection of shoes and offer repair services for soles, heels, stitching, zippers and more,
          all managed through one simple online platform. Our goal is to keep your shoes looking great for longer.
        </p>
        <p className="leading-relaxed">
          The team combines craftsmanship, fashion and software to make shopping and repairs feel easy.
        </p>
        <p className="pt-6 text-sm text-ink/60">
          © {new Date().getFullYear()} ACHILLES – All rights reserved.
        </p>
      </ScrollReveal>
    </section>
  );
}
