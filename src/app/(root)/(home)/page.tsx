"use client";

import ActionCard from "@/components/ActionCard";
import { QUICK_ACTIONS } from "@/constants";
import { useUserRole } from "@/hooks/useUserRole";
import { useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import MeetingModal from "@/components/MeetingModal";
import LoaderUI from "@/components/LoaderUI";
import { Loader2Icon, Sparkles, Zap, Award, TrendingUp } from "lucide-react";
import MeetingCard from "@/components/MeetingCard";
import Chatbot from "@/components/Chatbot";

export default function Home() {
  const router = useRouter();
  const { isInterviewer, isCandidate, isLoading } = useUserRole();
  const interviews = useQuery(api.interviews.getMyInterviews);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"start" | "join">();

  const handleQuickAction = (title: string) => {
    switch (title) {
      case "New Call":
        setModalType("start");
        setShowModal(true);
        break;
      case "Join Meeting":
        setModalType("join");
        setShowModal(true);
        break;
      default:
        router.push(`/${title.toLowerCase()}`);
    }
  };

  if (isLoading) return <LoaderUI />;

  const glassmorphismStyle = {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  };

  return (
    <div className="particles-bg min-h-screen">
      <div className="container max-w-7xl mx-auto p-6">

        {/* WELCOME SECTION */}
        <div className="rounded-2xl p-8 mb-10 glass neon-glow float-animation" style={glassmorphismStyle}>
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Sparkles className="w-8 h-8 text-yellow-500" />
              <h1 className="text-5xl font-bold gradient-text">
                Welcome to NextGen Interviews
              </h1>
              <Zap className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-xl text-muted-foreground mb-6">
              {isInterviewer
                ? "Advanced AI-powered platform for conducting and managing interviews"
                : "Your comprehensive AI interview preparation and practice platform"}
            </p>
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-green-500" />
                <span>AI-Powered Analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                <span>Real-time Feedback</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                <span>Advanced Features</span>
              </div>
            </div>
          </div>
        </div>

        {/* STATS SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          <div className="text-center p-4 rounded-xl glass" style={glassmorphismStyle}>
            <div className="text-3xl font-bold text-blue-500 mb-1">7</div>
            <p className="text-sm text-muted-foreground">AI Tools</p>
          </div>
          <div className="text-center p-4 rounded-xl glass" style={glassmorphismStyle}>
            <div className="text-3xl font-bold text-green-500 mb-1">∞</div>
            <p className="text-sm text-muted-foreground">Practice Sessions</p>
          </div>
          <div className="text-center p-4 rounded-xl glass" style={glassmorphismStyle}>
            <div className="text-3xl font-bold text-purple-500 mb-1">24/7</div>
            <p className="text-sm text-muted-foreground">AI Availability</p>
          </div>
          <div className="text-center p-4 rounded-xl glass" style={glassmorphismStyle}>
            <div className="text-3xl font-bold text-orange-500 mb-1">100%</div>
            <p className="text-sm text-muted-foreground">Personalized</p>
          </div>
        </div>

        {isInterviewer ? (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {QUICK_ACTIONS.map((action) => (
                <div key={action.title} className="ripple-effect">
                  <ActionCard
                  action={action}
                  onClick={() => handleQuickAction(action.title)}
                  />
                </div>
              ))}
            </div>

            <MeetingModal
              isOpen={showModal}
              onClose={() => setShowModal(false)}
              title={modalType === "join" ? "Join Meeting" : "Start Meeting"}
              isJoinMeeting={modalType === "join"}
            />
          </>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold gradient-text">Your Interviews</h1>
              <p className="text-muted-foreground mt-1">View and join your scheduled interviews</p>
            </div>

            <div className="mt-8">
              {interviews === undefined ? (
                <div className="flex justify-center py-12">
                  <Loader2Icon className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : interviews.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {interviews.map((interview) => (
                    <div key={interview._id} className="ripple-effect">
                      <MeetingCard interview={interview} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 p-8 rounded-2xl glass" style={glassmorphismStyle}>
                  <div className="text-6xl mb-4">🎯</div>
                  <h3 className="text-xl font-semibold mb-2">No Interviews Scheduled</h3>
                  <p className="text-muted-foreground">
                    Start practicing with our AI tools to prepare for your next opportunity!
                  </p>
                </div>
              )}
              
            </div>
            
          </>
        )}

        {/* AI ENGLISH ASSISTANT CHATBOT */}
        <div className="mt-16">
          <Chatbot />
        </div>
      </div>
    </div>
  );
}
