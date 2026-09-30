import { useInView } from "react-intersection-observer";

export function LazyMount({
  children,
  rootMargin = "200px"
}: {
  children: React.ReactNode;
  rootMargin?: string;
}) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin
  });

  return <div ref={ref}>{inView ? children : null}</div>;
}
