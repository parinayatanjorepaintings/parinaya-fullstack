import Hero from "../components/home/Hero";
import TrustStrip from "../components/home/TrustStrip";
import CategoryGrid from "../components/home/CategoryGrid";
import FeaturedProducts from "../components/home/FeaturedProducts";
import VideoSection from "../components/home/VideoSection";
import AboutStrip from "../components/home/AboutStrip";

export default function Home() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <CategoryGrid />
      <FeaturedProducts />
      <VideoSection />
      <AboutStrip />
    </>
  );
}
