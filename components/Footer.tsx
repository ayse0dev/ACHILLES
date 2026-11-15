import RetroButton from './RetroButton';
import ScrollReveal from './ScrollReveal';

export default function Footer() {
  return (
    <footer className="bg-retroAccent text-retroBg py-8">
      <div className="container mx-auto px-4">
        <ScrollReveal className="flex flex-col md:flex-row justify-between items-center mb-4">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <h2 className="text-2xl font-display">SoleFix</h2>
            <p className="text-sm">© {new Date().getFullYear()} All rights reserved.</p>
          </div>
          <div className="flex space-x-3">
            <RetroButton className="bg-retroPrimary hover:bg-retroPrimary/80">Contact</RetroButton>
            <RetroButton className="bg-retroPrimary hover:bg-retroPrimary/80">Terms</RetroButton>
          </div>
        </ScrollReveal>
      </div>
    </footer>
  );
}
