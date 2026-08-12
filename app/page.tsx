import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Composition from "@/components/sections/Composition";
import Intensities from "@/components/sections/Intensities";
import Acquire from "@/components/sections/Acquire";
import Footer from "@/components/sections/Footer";

export default function Home() {
  return (
    <>
      {/* The bottom margin equals the fixed footer height, so the page
         scrolls past its own end and uncovers the footer beneath it.
         The extra 2px push the last section fully past the viewport top,
         where subpixel rounding otherwise leaves a 1px sliver of it
         visible above the footer. */}
      <main className="relative z-[1] mb-[calc(100vh+2px)] bg-bone">
        <Hero />
        {/* Pulled up one viewport so this block scrolls over the pinned
           hero stage and covers it before the hero unpins. */}
        <div className="relative z-10 -mt-[100svh]">
          <About />
          <Composition />
          {/* The house lives inside the Intensities pinned stage: the
             descent empties, the light rises, and the house cascades in
             before the stage unpins into Acquire. */}
          <Intensities />
          <Acquire />
        </div>
      </main>
      <Footer />
    </>
  );
}
