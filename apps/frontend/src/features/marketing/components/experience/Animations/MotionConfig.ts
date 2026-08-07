export const motionConfig = {
  springLayout: {
    type: "spring" as const,
    stiffness: 160,
    damping: 22,
  },
  springBounce: {
    type: "spring" as const,
    stiffness: 220,
    damping: 18,
  },
  springMagnet: {
    type: "spring" as const,
    stiffness: 300,
    damping: 16,
  },
  revealDelay: (index: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      delay: index * 0.12,
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

export default motionConfig;
