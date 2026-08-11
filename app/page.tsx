import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Composition from "@/components/sections/Composition";
import Intensities from "@/components/sections/Intensities";
import House from "@/components/sections/House";
import Acquire from "@/components/sections/Acquire";
import Footer from "@/components/sections/Footer";

export default function Home() {
  return (
    <>
      {/* The bottom margin equals the fixed footer height, so the page
         scrolls past its own end and uncovers the footer beneath it. */}
      <main className="relative z-[1] mb-[100vh] bg-bone">
        <Hero />
        {/* Pulled up one viewport so this block scrolls over the pinned
           hero stage and covers it before the hero unpins. */}
        <div className="relative z-10 -mt-[100svh]">
          <About />
          <Composition />
          <Intensities />
          <House />
          <Acquire />
        </div>
      </main>
      <Footer />
    </>
  );
}
