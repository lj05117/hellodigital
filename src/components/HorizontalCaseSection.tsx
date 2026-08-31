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

      /**
       * 전체 story-track이 이동해야 하는 최대 거리
       */
      const getOuterDistance = () => {
        return Math.max(track.scrollWidth - wrap.clientWidth, 0);
      };

      /**
       * 특정 story-item의 내부 photo-track 이동 거리
       */
      const getInnerDistance = (storyItem: HTMLElement) => {
        const photoZone = storyItem.querySelector(".story-photo-zone") as HTMLElement | null;

        const photoTrack = storyItem.querySelector(".photo-track") as HTMLElement | null;

        if (!photoZone || !photoTrack) {
          return 0;
        }

        return Math.max(photoTrack.scrollWidth - photoZone.clientWidth, 0);
      };

      /**
       * story-item의 left edge가
       * horizontal-track-wrap의 left edge에
       * 정확하게 맞도록 만드는 x값
       *
       * story-track은 translateX(-offsetLeft)만큼 이동한다.
       */
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
       *
       * 각 story-item마다:
       *
       * 1. story-track 이동
       * 2. story-item left가 viewport left에 도착
       * 3. story-track 정지
       * 4. photo-track 내부 이동
       * 5. 내부 이동 종료
       * 6. story-track 다시 이동
       *
       */

      const timeline = gsap.timeline({
        defaults: {
          ease: "none",
        },
      });

      storyItems.forEach((storyItem, index) => {
        /**
         * ----------------------------------------------
         * 1. 다음 story-item까지 바깥 이동
         * ----------------------------------------------
         *
         * 첫 번째 item은 이미 viewport에 있으므로
         * 외부 이동이 필요 없다.
         */
        if (index > 0) {
          timeline.to(track, {
            x: () => getItemX(storyItem),

            /*
             * duration은 실제 이동량에 비례해서 설정한다.
             * 너무 빠르거나 느려지는 것을 방지한다.
             */
            duration: () => {
              const currentX = Number(gsap.getProperty(track, "x")) || 0;

              const targetX = getItemX(storyItem);

              return Math.max(Math.abs(targetX - currentX) / 1000, 0.5);
            },
          });
        }

        /**
         * ----------------------------------------------
         * 2. 내부 photo-track 이동
         * ----------------------------------------------
         *
         * 이 구간에서는 track의 x를 변경하지 않는다.
         *
         * 따라서 story-item 전체가 움직이지 않고
         * story-header도 화면에서 그대로 유지된다.
         */
        const photoTrack = storyItem.querySelector(".photo-track") as HTMLElement | null;

        if (!photoTrack) return;

        timeline.to(photoTrack, {
          x: () => {
            return -getInnerDistance(storyItem);
          },

          /*
           * 내부 이동 속도
           */
          duration: () => {
            return Math.max(getInnerDistance(storyItem) / 1000, 0.5);
          },
        });
      });

      /**
       * ----------------------------------------------
       * 3. 마지막 story-item 이후
       *    전체 track 끝까지 이동
       * ----------------------------------------------
       */
      timeline.to(track, {
        x: () => -getOuterDistance(),

        duration: () => {
          return Math.max(getOuterDistance() / 1000, 0.5);
        },
      });

      /**
       * ----------------------------------------------
       * ScrollTrigger
       * ----------------------------------------------
       *
       * timeline 전체를 세로 스크롤과 연결한다.
       */
      ScrollTrigger.create({
        animation: timeline,

        trigger: section,

        start: "center center",

        /*
         * timeline의 각 구간을 충분히 사용할 수 있도록
         * 전체 가로 이동 + 내부 이동량을 기준으로 한다.
         */
        end: () => {
          const outerDistance = getOuterDistance();

          const innerDistance = storyItems.reduce((total, storyItem) => {
            return total + getInnerDistance(storyItem);
          }, 0);

          return `+=${Math.max(outerDistance + innerDistance, 1)}`;
        },

        scrub: 1.4,

        pin: true,

        anticipatePin: 1,

        invalidateOnRefresh: true,
      });
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
