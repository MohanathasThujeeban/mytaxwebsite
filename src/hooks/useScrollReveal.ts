import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function useScrollReveal() {
  const { pathname } = useLocation();

  useEffect(() => {
    let observer: IntersectionObserver;

    const timer = setTimeout(() => {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              (entry.target as HTMLElement).classList.add('is-visible');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
      );

      document
        .querySelectorAll(
          '.reveal, .section-card, .about-card, .service-card, .guide-card, .company-card'
        )
        .forEach((el) => observer.observe(el));
    }, 80);

    return () => {
      clearTimeout(timer);
      observer?.disconnect();
    };
  }, [pathname]);
}
