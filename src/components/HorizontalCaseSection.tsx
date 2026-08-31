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
    const section = sectionRef.current;
    const track = trackRef.current;

    if (!section || !track) return;

    const ctx = gsap.context(() => {
      const wrap = section.querySelector(".horizontal-track-wrap") as HTMLElement | null;

      if (!wrap) return;

      const storyItems = gsap.utils.toArray<HTMLElement>(".story-item", section);

      /**
       * --------------------------------------------------
       * Helpers
       * --------------------------------------------------
       */

      const getOuterDistance = () => {
        return Math.max(track.scrollWidth - wrap.clientWidth, 0);
      };

      const getInnerDistance = (storyItem: HTMLElement) => {
        const photoZone = storyItem.querySelector(".story-photo-zone") as HTMLElement | null;

        const photoTrack = storyItem.querySelector(".photo-track") as HTMLElement | null;

        if (!photoZone || !photoTrack) {
          return 0;
        }

        return Math.max(photoTrack.scrollWidth - photoZone.clientWidth, 0);
      };

      const getItemX = (storyItem: HTMLElement) => {
        return -storyItem.offsetLeft;
      };

      /**
       * --------------------------------------------------
       * Initial state
       * --------------------------------------------------
       */

      gsap.set(track, {
        x: 0,
      });

      storyItems.forEach((storyItem) => {
        const photoTrack = storyItem.querySelector(".photo-track") as HTMLElement | null;

        if (photoTrack) {
          gsap.set(photoTrack, {
            x: 0,
          });
        }
      });

      /**
       * --------------------------------------------------
       * Master Timeline
       * --------------------------------------------------
       */

      const timeline = gsap.timeline({
        defaults: {
          ease: "none",
        },
      });

      storyItems.forEach((storyItem, index) => {
        /**
         * 다음 story-item까지 외부 이동
         */
        if (index > 0) {
          timeline.to(track, {
            x: () => getItemX(storyItem),

            duration: () => {
              const currentX = Number(gsap.getProperty(track, "x")) || 0;

              const targetX = getItemX(storyItem);

              return Math.max(Math.abs(targetX - currentX) / 1000, 0.5);
            },
          });
        }

        /**
         * 현재 story-item 내부 이동
         */
        const photoTrack = storyItem.querySelector(".photo-track") as HTMLElement | null;

        if (!photoTrack) return;

        timeline.to(photoTrack, {
          x: () => -getInnerDistance(storyItem),

          duration: () => Math.max(getInnerDistance(storyItem) / 1000, 0.5),
        });
      });

      /**
       * 마지막 story-item 이후
       * 전체 track 끝까지 이동
       */
      timeline.to(track, {
        x: () => -getOuterDistance(),

        duration: () => Math.max(getOuterDistance() / 1000, 0.5),
      });

      /**
       * --------------------------------------------------
       * Responsive ScrollTrigger
       * --------------------------------------------------
       *
       * 1025px 이상:
       * 기존 GSAP pin + horizontal interaction
       *
       * 1024px 이하:
       * 이 컴포넌트에서는 pin을 하지 않는다.
       *
       * 부모(spin-spacer)의 움직임을
       * 그대로 받을 수 있도록 한다.
       */
      const mm = gsap.matchMedia();

      mm.add(
        {
          desktop: "(min-width: 1025px)",
          mobile: "(max-width: 1024px)",
        },
        (context) => {
          const { desktop } = (context.conditions || {}) as Record<"desktop" | "mobile", boolean>;

          if (desktop) {
            ScrollTrigger.create({
              animation: timeline,

              trigger: section,

              start: "center center",

              end: () => {
                const outerDistance = getOuterDistance();

                const innerDistance = storyItems.reduce((total, storyItem) => {
                  return total + getInnerDistance(storyItem);
                }, 0);

                return `+=${Math.max(outerDistance + innerDistance, 1)}`;
              },

              scrub: 1.4,

              /*
               * 1025px 이상에서만 pin
               */
              pin: true,

              anticipatePin: 1,

              invalidateOnRefresh: true,
            });
          }

          /**
           * ----------------------------------------------
           * Mobile / Tablet
           * ----------------------------------------------
           *
           * 1024px 이하에서는
           *
           * - ScrollTrigger 없음
           * - pin 없음
           * - 부모의 움직임에 맡김
           */
          if (!desktop) {
            gsap.set(track, {
              clearProps: "transform",
            });

            storyItems.forEach((storyItem) => {
              const photoTrack = storyItem.querySelector(".photo-track") as HTMLElement | null;

              if (photoTrack) {
                gsap.set(photoTrack, {
                  clearProps: "transform",
                });
              }
            });
          }

          return () => {
            timeline.pause();
          };
        },
      );
    }, section);

    return () => {
      ctx.revert();
    };
  }, [items]);

  return (
    <section ref={sectionRef} className="horizontal-section" aria-label="Horizontal story section">
      <div className="content-area">
        <div className="horizontal-track-wrap">
          <div ref={trackRef} className="story-track">
            {items.map((item) => (
              <div key={item.id} className="story-item">
                <div className="story-header">
                  <h2>{item.category}</h2>
                  <div>{item.description}</div>
                </div>

                <div className="story-photo-zone">
                  <div className="photo-track">
                    {item.photos.map((photo) => (
                      <div key={photo.id} className="photo-card">
                        <div
                          className="photo-thumb"
                          style={{
                            background: photo.accent,
                          }}
                        />

                        <div className="photo-caption">
                          <div className="story-category">{item.category}</div>

                          <div>{photo.title}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
