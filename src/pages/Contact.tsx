import { motion } from "motion/react";
import { Send, Mail, MapPin, MessageCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { handleFirestoreError, OperationType } from "@/src/lib/firestore-utils";
import { SupportChat } from "@/src/components/SupportChat";
import { SEO } from "@/src/components/SEO";

export function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Save to Firestore for backup/tracking
      const targetDb = db;
      if (targetDb) {
        try {
          await addDoc(collection(targetDb, "contact_messages"), {
            ...formData,
            createdAt: serverTimestamp(),
            status: "new"
          });
        } catch (dbErr) {
          console.error("Firestore submission error:", dbErr);
          handleFirestoreError(dbErr, OperationType.CREATE, "contact_messages");
        }
      }

      // 2. Send Email via Backend
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown API error" }));
        throw new Error(errorData.error || "Failed to send email via server");
      }

      setIsSubmitting(false);
      setSubmitted(true);
      setFormData({ name: "", email: "", message: "" });
    } catch (err: any) {
      console.error("Submission error:", err);
      // If it's a Firestore error JSON, it's already logged and handled by handleFirestoreError (which throws)
      // But we still want to show a nice error in the UI
      let displayMessage = "Désolé, une erreur est survenue lors de l'envoi. Veuillez réessayer plus tard.";
      
      try {
        const parsed = JSON.parse(err.message);
        if (parsed.error && parsed.operationType) {
          displayMessage = `Erreur Firestore (${parsed.operationType}): ${parsed.error}`;
        }
      } catch (e) {
        if (err.message) displayMessage = `Erreur: ${err.message}`;
      }

      setError(displayMessage);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-32 pb-20 px-6">
      <SEO 
        title="Contact Us | Support & Inquiries" 
        description="Get in touch with WaifuWall for support, collaborations, or inquiries. We're here to help!"
        keywords="contact us, support, inquiries, collaboration, customer service"
      />
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          <div>
            <motion.div 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               className="space-y-8"
            >
              <div>
                <h1 className="text-5xl font-bold text-slate-800 mb-6 font-display">Get in touch with us</h1>
                <p className="text-slate-500 text-lg leading-relaxed font-medium">
                  Have a suggestion, error report, or want to collaborate? Use the form or our direct contact channels.
                </p>
              </div>

              <div className="space-y-6 pt-10">
                <div className="flex items-center gap-6 group">
                  <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Direct Email</h4>
                    <p className="text-slate-800 font-bold text-lg">waifuwall0@gmail.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 group">
                  <div className="w-14 h-14 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-500 group-hover:scale-110 transition-transform">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Live Support</h4>
                    <p className="text-slate-800 font-bold text-lg">Discord Community Hub</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 group">
                  <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Headquarters</h4>
                    <p className="text-slate-800 font-bold text-lg">Akihabara District, Tokyo</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass p-10 rounded-[48px] relative overflow-hidden"
          >
            {submitted ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Send className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-bold text-slate-800 mb-4">Message Sent!</h2>
                <p className="text-slate-500 font-medium">We'll get back to you within 24 hours.</p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="mt-10 font-bold text-indigo-500 uppercase tracking-widest text-xs hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <div className="space-y-12">
                  <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                    <h3 className="text-2xl font-bold text-slate-800 mb-8">Send a Message</h3>
                    
                    {error && (
                      <div className="p-4 bg-red-50 text-red-500 rounded-2xl text-sm font-medium border border-red-100 italic">
                        {error}
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Full Name</label>
                      <input 
                        required
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Your name"
                        className="w-full px-8 py-5 bg-white border border-slate-100 rounded-3xl outline-none focus:ring-4 focus:ring-indigo-50 transition-all font-medium"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Email Address</label>
                      <input 
                        required
                        type="email" 
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="your@email.com"
                        className="w-full px-8 py-5 bg-white border border-slate-100 rounded-3xl outline-none focus:ring-4 focus:ring-indigo-50 transition-all font-medium"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Message Content</label>
                      <textarea 
                        required
                        rows={6}
                        value={formData.message}
                        onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                        placeholder="Tell us what's on your mind..."
                        className="w-full px-8 py-5 bg-white border border-slate-100 rounded-3xl outline-none focus:ring-4 focus:ring-indigo-50 transition-all font-medium resize-none"
                      />
                    </div>

                    <button 
                      disabled={isSubmitting}
                      className="w-full py-5 bg-slate-900 text-white rounded-3xl font-bold uppercase tracking-widest text-sm shadow-xl hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                      type="submit"
                    >
                      {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                      {isSubmitting ? "Sending..." : "Send Message"}
                    </button>
                  </form>
                  <div className="border-t border-slate-100 pt-10">
                    <h3 className="text-xl font-bold text-slate-800 mb-6">Alternatively, chat with us live:</h3>
                    <SupportChat />
                  </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
