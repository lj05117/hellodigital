import { useRef } from "react";
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

  return (
    <section ref={sectionRef} className="horizontal-section" aria-label="Horizontal story section">
      <div className="content-area">
        <div className="horizontal-track-wrap">
          <div ref={trackRef} className="story-track">
            <div className="section-header">
              {items.map((item) => (
                <div key={item.id} className="story-item">
                  <h2>{item.category}</h2>
                  <div>{item.description}</div>

                  <div className="story-photo-zone">
                    {item.photos.map((photo) => (
                      <div key={photo.id} className="photo-card">
                        <div
                          className="photo-thumb"
                          style={{ background: photo.accent }}
                          aria-hidden="true"
                        ></div>

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
