import Navbar from "@/components/home/Navbar";
import HeroSection from "@/components/home/HeroSection";
import CatergorySection from "@/components/home/CatergorySection";
import FeaturedCourses from "@/components/home/FeaturedCourses";
import LearningBenefits from "@/components/home/LearningBenefits";
import InstructorsSection from "@/components/home/InstructorSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import FAQSection from "@/components/home/FAQSection";
import CTASection from "@/components/home/CTASection";
import Footer from "@/components/home/Footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <CatergorySection />
      <FeaturedCourses />
      <LearningBenefits />
      <InstructorsSection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </>
  );
}