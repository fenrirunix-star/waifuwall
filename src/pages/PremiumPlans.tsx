import { motion } from "motion/react";
import { Check, Crown, Zap, Shield, Sparkles, Star } from "lucide-react";
import { cn } from "@/src/lib/utils";

export function PremiumPlans() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      description: "Basic experience with core features",
      features: [
        "Standard HD downloads",
        "Community access",
        "Basic search",
        "Ads supported",
        "Wait-to-unlock 4K"
      ],
      buttonText: "Current Plan",
      featured: false,
      color: "slate"
    },
    {
      name: "Pro Monthly",
      price: "$5",
      period: "/month",
      description: "Perfect for casual collectors",
      features: [
        "Unrestricted 4K/8K downloads",
        "Zero ads experience",
        "Early access to new drops",
        "Premium only collections",
        "Custom profile badge"
      ],
      buttonText: "Get Started",
      featured: true,
      color: "indigo"
    },
    {
      name: "Artist Yearly",
      price: "$20",
      period: "/year",
      description: "Best value for power users",
      features: [
        "Everything in Pro Monthly",
        "Two months for free",
        "Priority AI requests",
        "Direct artist support",
        "Commercial usage rights"
      ],
      buttonText: "Save with Yearly",
      featured: false,
      color: "sakura"
    }
  ];

  return (
    <div className="pt-40 pb-20 px-6">
      <div className="max-w-7xl mx-auto text-center mb-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-6 py-2 glass rounded-full mb-6"
        >
          <Crown className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Premium Membership</span>
        </motion.div>
        
        <h1 className="font-display text-5xl lg:text-7xl font-bold text-slate-800 mb-6">
          Choose Your <br /> 
          <span className="bg-gradient-to-r from-indigo-500 to-sakura-400 bg-clip-text text-transparent">Creative Journey</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Unlock the full potential of WaifuWall with our premium plans. 
          Support artists and enjoy absolute quality without interruptions.
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              "relative glass rounded-[48px] p-10 flex flex-col group",
              plan.featured && "bg-gradient-to-br from-indigo-500/5 to-purple-500/5 ring-2 ring-indigo-500/20 scale-105 z-10"
            )}
          >
            {plan.featured && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-500 text-white px-6 py-2 rounded-full text-xs font-bold shadow-xl shadow-indigo-100 flex items-center gap-2">
                <Star className="w-3 h-3 fill-white" /> Recommended
              </div>
            )}

            <div className="mb-8">
              <h3 className="text-2xl font-display font-bold text-slate-800 mb-2">{plan.name}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{plan.description}</p>
            </div>

            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-5xl font-display font-bold text-slate-800">{plan.price}</span>
              {plan.period && <span className="text-slate-400 font-medium">{plan.period}</span>}
            </div>

            <div className="flex flex-col gap-4 mb-10 flex-1">
              {plan.features.map((feature) => (
                <div key={feature} className="flex items-center gap-3 text-sm font-medium text-slate-600">
                  <div className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center shrink-0",
                    plan.color === "indigo" ? "bg-indigo-100 text-indigo-500" : 
                    plan.color === "sakura" ? "bg-sakura-100 text-sakura-500" : "bg-slate-100 text-slate-400"
                  )}>
                    <Check className="w-3 h-3" />
                  </div>
                  {feature}
                </div>
              ))}
            </div>

            <button className={cn(
              "w-full py-4 rounded-2xl font-bold transition-all hover:scale-[1.02] active:scale-95 shadow-xl",
              plan.color === "indigo" ? "bg-indigo-500 text-white shadow-indigo-100" :
              plan.color === "sakura" ? "bg-sakura-400 text-white shadow-sakura-100" :
              "bg-white border-2 border-slate-100 text-slate-500 shadow-slate-100"
            )}>
              {plan.buttonText}
            </button>
          </motion.div>
        ))}
      </div>

      <div className="mt-32 max-w-4xl mx-auto glass rounded-[48px] p-12 flex flex-col md:flex-row items-center gap-12 overflow-hidden relative">
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-sakura-200/20 rounded-full blur-3xl pointer-events-none" />
        <div className="flex-1">
           <h2 className="text-3xl font-display font-bold text-slate-800 mb-4">The Premium Difference</h2>
           <p className="text-slate-500 leading-relaxed">
             Join over <span className="text-indigo-500 font-bold">5,000+ premium users</span> who have already upgraded. 
             Get access to private galleries, 8K ultra-wide wallpapers, and a personalized experience.
           </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[Zap, Shield, Sparkles, Star].map((Icon, i) => (
            <div key={i} className="w-16 h-16 glass rounded-2xl flex items-center justify-center text-sakura-400">
               <Icon className="w-8 h-8" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
