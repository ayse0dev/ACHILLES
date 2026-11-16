"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ScrollMotion() {
    const pathname = usePathname();

    useEffect(() => {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        const bar = document.getElementById("scroll-progress");
        function onScroll() {
            if (!bar) return;
            const max = document.documentElement.scrollHeight - window.innerHeight;
            bar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
        }
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();

        if (reduce) {
            return () => window.removeEventListener("scroll", onScroll);
        }

        const targets = Array.from(
            document.querySelectorAll<HTMLElement>("main section, main .card, main article, main .reveal-item")
        );
        targets.forEach((el, i) => {
            el.classList.add("reveal");
            el.style.transitionDelay = `${(i % 4) * 90}ms`;
        });

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("in");
                    } else {
                        entry.target.classList.remove("in");
                    }
                });
            },
            { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
        );
        targets.forEach((el) => observer.observe(el));

        return () => {
            window.removeEventListener("scroll", onScroll);
            observer.disconnect();
        };
    }, [pathname]);

    return <div id="scroll-progress" className="scroll-progress" aria-hidden="true" />;
}
