import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { CaseItem } from "../types/caseData";

gsap.registerPlugin(ScrollTrigger);

type HorizontalCaseSectionProps = {
  items: CaseItem[];
};

export function HorizontalCaseSection({ items }: HorizontalCaseSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (!sectionRef.current || !trackRef.current) return;

    const ctx = gsap.context(() => {
      const wrap = sectionRef.current?.querySelector(
        ".horizontal-track-wrap",
      ) as HTMLElement | null;
      const track = trackRef.current;

      if (!wrap || !track) return;

      const maxDistance = Math.max(track.scrollWidth - wrap.clientWidth, 0);
      const startPoint = "center center";
      const endPoint = "bottom bottom";

      gsap.set(track, { x: 0 });

      gsap.to(track, {
        x: -maxDistance,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: startPoint,
          end: "+=1800",
          scrub: 1.4,
          pin: true,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });

      gsap.utils.toArray<HTMLElement>(".photo-card").forEach((card) => {
        gsap.to(card, {
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: startPoint,
            end: endPoint,
            scrub: true,
          },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [items]);

  return (
    <section ref={sectionRef} className="horizontal-section" aria-label="Horizontal story section">
      <div className="content-area">
        <div className="horizontal-track-wrap">
          <div ref={trackRef} className="story-track">
            <div className="section-header">
              {items.map((item) => (
                <div key={item.id} className="story-item">
                  <div className="story-header">
                    <h2>{item.category}</h2>
                    <div>{item.description}</div>
                  </div>
                  <div className="story-photo-zone">
                    {item.photos.map((photo) => (
                      <div key={photo.id} className="photo-card">
                        <div className="photo-thumb" style={{ background: photo.accent }}></div>

                        <div className="photo-caption">
                          <div className="story-category">{item.category}</div>
                          <div>{photo.title}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
