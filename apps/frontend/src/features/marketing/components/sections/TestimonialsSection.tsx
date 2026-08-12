import React from "react";

export const TestimonialsSection: React.FC = () => {
  return (
    <section className="w-full max-w-[680px] mx-auto my-32 px-6 text-center relative z-10 select-none">
      <blockquote className="font-serif italic font-normal text-2xl md:text-3xl text-[#f3f1ec] leading-[1.45] mb-5">
        "We deleted four tools in our first week. Standup went from twenty minutes to five."
      </blockquote>
      <cite className="not-italic text-xs md:text-sm text-[#8b8a90] font-sans">
        — Head of engineering, Series B infra startup
      </cite>
    </section>
  );
};

export default TestimonialsSection;
