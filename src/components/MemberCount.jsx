"use client";

import { useEffect, useRef, useState } from "react";

export default function MemberCount({ total = 150 }) {
  const ref = useRef(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      const start = performance.now();
      const duration = 1300;
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        setCount(Math.round(total * (1 - Math.pow(1 - progress, 3))));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      observer.disconnect();
    }, { threshold: 0.45 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [total]);

  return <b ref={ref}>{count}+</b>;
}
