"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AIChat from "@/components/ai/AIChat";
import CodeAnalyzer from "@/components/ai/CodeAnalyzer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Code, Sparkles, Brain } from "lucide-react";

const Chatbot: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border-none">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-3 text-3xl">
            <div className="relative">
              <Bot className="w-8 h-8 text-blue-500" />
              <Sparkles className="w-4 h-4 text-yellow-500 absolute -top-1 -right-1" />
            </div>
            Advanced AI Assistant Suite
          </CardTitle>
          <p className="text-muted-foreground text-lg">
            Powered by cutting-edge AI technology for interviews, coding, and analysis
          </p>
        </CardContent>
      </Card>

      {/* AI Tools Tabs */}
      <Tabs defaultValue="chat" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-12">
          <TabsTrigger value="chat" className="flex items-center gap-2 text-base">
            <Brain className="w-5 h-5" />
            AI Chat Assistant
          </TabsTrigger>
          <TabsTrigger value="analyzer" className="flex items-center gap-2 text-base">
            <Code className="w-5 h-5" />
            Code Analyzer
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="mt-6">
          <AIChat />
        </TabsContent>

        <TabsContent value="analyzer" className="mt-6">
          <CodeAnalyzer />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Chatbot;
