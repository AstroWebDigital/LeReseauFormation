import React from "react";
import HeroSection from "@/components/home/HeroSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import ProgramsSection from "@/components/home/ProgramsSection";
import TimelineSection from "@/components/home/TimelineSection";
import FlagshipProgramSection from "@/components/home/FlagshipProgramSection";
import HowToApplySection from "@/components/home/HowToApplySection";
import CommunitySection from "@/components/home/CommunitySection";
import FinalCtaSection from "@/components/home/FinalCtaSection";
import HomeFooter from "@/components/home/HomeFooter";

const Home = () => {
    return (
        <main className="bg-background text-foreground">
            <HeroSection />
            <TestimonialsSection />
            <ProgramsSection />
            <TimelineSection />
            <FlagshipProgramSection />
            <HowToApplySection />
            <CommunitySection />
            <FinalCtaSection />
            <HomeFooter />
        </main>
    );
};

export default Home;
