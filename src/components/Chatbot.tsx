"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AIChat from "@/components/ai/AIChat";
import CodeAnalyzer from "@/components/ai/CodeAnalyzer";
import ResumeAnalyzer from "@/components/ai/ResumeAnalyzer";
import InterviewQuestionGenerator from "@/components/ai/InterviewQuestionGenerator";
import SkillAssessment from "@/components/ai/SkillAssessment";
import MockInterview from "@/components/ai/MockInterview";
import CommunicationTrainer from "@/components/ai/CommunicationTrainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Bot, 
  Code, 
  Sparkles, 
  Brain, 
  FileText, 
  MessageSquare, 
  Target, 
  Video, 
  Mic,
  Zap,
  Award,
  Users,
  BookOpen
} from "lucide-react";

const Chatbot: React.FC = () => {
  const glassmorphismStyle = {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border-none" style={glassmorphismStyle}>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-3 text-3xl">
            <div className="relative">
              <Bot className="w-8 h-8 text-blue-500" />
              <Sparkles className="w-4 h-4 text-yellow-500 absolute -top-1 -right-1" />
            </div>
            NextGen AI Interview Platform
          </CardTitle>
          <p className="text-muted-foreground text-lg">
            Complete AI-powered interview preparation and assessment platform
          </p>
        </CardContent>
      </Card>

      {/* AI Tools Tabs */}
      <Tabs defaultValue="chat" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 h-12 overflow-x-auto">
          <TabsTrigger value="chat" className="flex items-center gap-2 text-base">
            <Brain className="w-5 h-5" />
            AI Chat
          </TabsTrigger>
          <TabsTrigger value="analyzer" className="flex items-center gap-2 text-base">
            <Code className="w-5 h-5" />
            Code Analysis
          </TabsTrigger>
          <TabsTrigger value="resume" className="flex items-center gap-2 text-base">
            <FileText className="w-5 h-5" />
            Resume Analyzer
          </TabsTrigger>
          <TabsTrigger value="questions" className="flex items-center gap-2 text-base">
            <MessageSquare className="w-5 h-5" />
            Question Generator
          </TabsTrigger>
          <TabsTrigger value="assessment" className="flex items-center gap-2 text-base">
            <Target className="w-5 h-5" />
            Skill Assessment
          </TabsTrigger>
          <TabsTrigger value="mock" className="flex items-center gap-2 text-base">
            <Video className="w-5 h-5" />
            Mock Interview
          </TabsTrigger>
          <TabsTrigger value="communication" className="flex items-center gap-2 text-base">
            <Mic className="w-5 h-5" />
            Communication
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="mt-6">
          <AIChat />
        </TabsContent>

        <TabsContent value="analyzer" className="mt-6">
          <CodeAnalyzer />
        </TabsContent>

        <TabsContent value="resume" className="mt-6">
          <ResumeAnalyzer />
        </TabsContent>

        <TabsContent value="questions" className="mt-6">
          <InterviewQuestionGenerator />
        </TabsContent>

        <TabsContent value="assessment" className="mt-6">
          <SkillAssessment />
        </TabsContent>

        <TabsContent value="mock" className="mt-6">
          <MockInterview />
        </TabsContent>

        <TabsContent value="communication" className="mt-6">
          <CommunicationTrainer />
        </TabsContent>
      </Tabs>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        <Card style={glassmorphismStyle}>
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold mb-1">AI-Powered Analysis</h3>
            <p className="text-sm text-muted-foreground">
              Advanced algorithms for comprehensive evaluation
            </p>
          </CardContent>
        </Card>

        <Card style={glassmorphismStyle}>
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
              <Award className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold mb-1">Instant Feedback</h3>
            <p className="text-sm text-muted-foreground">
              Real-time analysis and personalized recommendations
            </p>
          </CardContent>
        </Card>

        <Card style={glassmorphismStyle}>
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold mb-1">Multi-Modal Training</h3>
            <p className="text-sm text-muted-foreground">
              Video, audio, and text-based interview practice
            </p>
          </CardContent>
        </Card>

        <Card style={glassmorphismStyle}>
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold mb-1">Comprehensive Learning</h3>
            <p className="text-sm text-muted-foreground">
              Complete skill development and assessment platform
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Chatbot;
