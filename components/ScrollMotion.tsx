"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const SELECTOR = "main section, main .card, main article, main .reveal-item";
const HIDDEN = { opacity: 0, transform: "translateY(32px)" };
const SHOWN = { opacity: 1, transform: "none" };

type State = { hold: Animation | null; index: number };

export default function ScrollMotion() {
    const pathname = usePathname();

    useEffect(() => {
        const bar = document.getElementById("scroll-progress");
        function onScroll() {
            if (!bar) return;
            const max = document.documentElement.scrollHeight - window.innerHeight;
            bar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
        }
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            return () => window.removeEventListener("scroll", onScroll);
        }

        const states = new WeakMap<Element, State>();
        const tracked: Element[] = [];

        function hide(el: Element, state: State) {
            state.hold?.cancel();
            state.hold = el.animate([HIDDEN], { duration: 1, fill: "forwards" });
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const state = states.get(entry.target);
                    if (!state) return;
                    if (entry.isIntersecting) {
                        if (!state.hold) return;
                        const show = entry.target.animate([HIDDEN, SHOWN], {
                            duration: 800,
                            delay: (state.index % 4) * 90,
                            easing: "cubic-bezier(0.2, 0.7, 0.2, 1)",
                            fill: "backwards",
                        });
                        show.onfinish = () => {
                            state.hold?.cancel();
                            state.hold = null;
                        };
                    } else if (!state.hold) {
                        hide(entry.target, state);
                    }
                });
            },
            { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
        );

        function collect() {
            document.querySelectorAll<HTMLElement>(SELECTOR).forEach((el) => {
                if (states.has(el)) return;
                const state: State = { hold: null, index: tracked.length };
                states.set(el, state);
                tracked.push(el);
                hide(el, state);
                observer.observe(el);
            });
        }

        const first = setTimeout(collect, 0);
        const second = setTimeout(collect, 600);

        return () => {
            clearTimeout(first);
            clearTimeout(second);
            window.removeEventListener("scroll", onScroll);
            observer.disconnect();
            tracked.forEach((el) => {
                states.get(el)?.hold?.cancel();
            });
        };
    }, [pathname]);

    return <div id="scroll-progress" className="scroll-progress" aria-hidden="true" />;
}
