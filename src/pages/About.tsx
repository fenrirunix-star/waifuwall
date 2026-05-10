import { motion } from "motion/react";
import { Sparkles, Users, Target, Rocket } from "lucide-react";
import { SEO } from "@/src/components/SEO";

export function About() {
  return (
    <div className="pt-32 pb-20 px-6">
      <SEO 
        title="About Us | WaifuWall" 
        description="Learn more about WaifuWall, our mission to curate the best AI masterpieces, and our dedicated team."
        keywords="about us, waifuwall, mission, ai art, community"
      />
      <div className="max-w-4xl mx-auto space-y-16">
        <header className="text-center">
            <h1 className="text-5xl font-bold font-display text-slate-800 mb-6">About WaifuWall</h1>
            <p className="text-xl text-slate-500">Elevating your digital experience with AI-curated art.</p>
        </header>
        
        <div className="grid md:grid-cols-2 gap-10">
            <div className="p-8 border rounded-3xl space-y-4">
                <Target className="w-10 h-10 text-pink-500" />
                <h3 className="text-xl font-bold">Our Mission</h3>
                <p className="text-slate-500">To create the most accessible, high-quality, AI-curated art platform for everyone.</p>
            </div>
             <div className="p-8 border rounded-3xl space-y-4">
                <Users className="w-10 h-10 text-indigo-500" />
                <h3 className="text-xl font-bold">Our Community</h3>
                <p className="text-slate-500">A growing family of artists, collectors, and tech enthusiasts sharing inspiration.</p>
            </div>
        </div>
      </div>
    </div>
  );
}
