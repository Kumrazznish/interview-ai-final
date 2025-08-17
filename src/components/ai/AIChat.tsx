"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { 
  Bot, 
  Send, 
  Mic, 
  MicOff, 
  Settings, 
  Download, 
  Copy, 
  RefreshCw,
  Sparkles,
  Brain,
  Code,
  FileText,
  Zap,
  MessageSquare,
  User,
  ChevronDown,
  ChevronUp,
  Star,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Share,
  Bookmark,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  X,
  Plus,
  Filter,
  Search,
  Clock,
  Trash2,
  Edit3,
  MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "react-hot-toast";

const GEMINI_API_KEY = "AIzaSyAjWxQEVa72lu4gFuMUGbaxzgVmHMsRSGI";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  isAnswerVisible?: boolean;
  answer?: string;
  rating?: number;
  isBookmarked?: boolean;
  category?: string;
  tokens?: number;
  processingTime?: number;
  confidence?: number;
  suggestions?: string[];
  codeBlocks?: { language: string; code: string }[];
  attachments?: { type: string; name: string; url: string }[];
}

interface ChatSettings {
  temperature: number;
  maxTokens: number;
  language: string;
  voiceEnabled: boolean;
  autoSave: boolean;
  theme: 'auto' | 'light' | 'dark';
  fontSize: number;
  animationsEnabled: boolean;
  soundEnabled: boolean;
}

interface AIPersonality {
  id: string;
  name: string;
  description: string;
  avatar: string;
  prompt: string;
  color: string;
  icon: React.ReactNode;
}

const AI_PERSONALITIES: AIPersonality[] = [
  {
    id: 'assistant',
    name: 'General Assistant',
    description: 'Helpful and knowledgeable assistant',
    avatar: '🤖',
    prompt: 'You are a helpful and knowledgeable AI assistant.',
    color: 'blue',
    icon: <Bot className="w-4 h-4" />
  },
  {
    id: 'interviewer',
    name: 'Interview Expert',
    description: 'Specialized in interview questions and preparation',
    avatar: '👔',
    prompt: 'You are an expert interviewer and career coach specializing in technical interviews.',
    color: 'purple',
    icon: <Brain className="w-4 h-4" />
  },
  {
    id: 'coder',
    name: 'Code Mentor',
    description: 'Expert in programming and software development',
    avatar: '💻',
    prompt: 'You are an expert programmer and coding mentor.',
    color: 'green',
    icon: <Code className="w-4 h-4" />
  },
  {
    id: 'analyst',
    name: 'Data Analyst',
    description: 'Specialized in data analysis and insights',
    avatar: '📊',
    prompt: 'You are a data analyst expert specializing in insights and analytics.',
    color: 'orange',
    icon: <FileText className="w-4 h-4" />
  }
];

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' }
];

const QUICK_ACTIONS = [
  { id: 'explain', label: 'Explain', icon: <Brain className="w-4 h-4" />, prompt: 'Please explain this in detail:' },
  { id: 'summarize', label: 'Summarize', icon: <FileText className="w-4 h-4" />, prompt: 'Please summarize:' },
  { id: 'code', label: 'Code Review', icon: <Code className="w-4 h-4" />, prompt: 'Please review this code:' },
  { id: 'improve', label: 'Improve', icon: <Zap className="w-4 h-4" />, prompt: 'How can I improve:' },
  { id: 'debug', label: 'Debug', icon: <Settings className="w-4 h-4" />, prompt: 'Help me debug this:' },
  { id: 'optimize', label: 'Optimize', icon: <Sparkles className="w-4 h-4" />, prompt: 'How to optimize:' }
];

export default function AIChat() {
  const { theme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your advanced AI assistant. How can I help you today?",
      isBot: true,
      timestamp: new Date(),
      confidence: 0.95,
      suggestions: ['Ask me anything', 'Get coding help', 'Interview preparation', 'Data analysis']
    }
  ]);
  
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedPersonality, setSelectedPersonality] = useState<AIPersonality>(AI_PERSONALITIES[0]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showSettings, setShowSettings] = useState(false);
  
  const [settings, setSettings] = useState<ChatSettings>({
    temperature: 0.7,
    maxTokens: 2048,
    language: 'en',
    voiceEnabled: true,
    autoSave: true,
    theme: 'auto',
    fontSize: 14,
    animationsEnabled: true,
    soundEnabled: true
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const generateResponse = async (prompt: string, personality: AIPersonality) => {
    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${personality.prompt}\n\nUser: ${prompt}\n\nRespond in ${LANGUAGES.find(l => l.code === settings.language)?.name || 'English'}.`
            }]
          }],
          generationConfig: {
            temperature: settings.temperature,
            maxOutputTokens: settings.maxTokens,
          }
        }),
      });

      const data = await response.json();
      return data?.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't generate a response. Please try again.";
    } catch (error) {
      console.error("API Error:", error);
      throw new Error("Failed to generate response");
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isBot: false,
      timestamp: new Date(),
      category: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    const startTime = Date.now();

    try {
      const response = await generateResponse(inputText, selectedPersonality);
      const processingTime = Date.now() - startTime;

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        isBot: true,
        timestamp: new Date(),
        confidence: Math.random() * 0.3 + 0.7, // Random confidence between 0.7-1.0
        processingTime,
        tokens: Math.floor(response.length / 4), // Rough token estimate
        category: selectedPersonality.id,
        suggestions: generateSuggestions(response)
      };

      setMessages(prev => [...prev, botMessage]);
      
      if (settings.soundEnabled) {
        playNotificationSound();
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I encountered an error while processing your request. Please try again.",
        isBot: true,
        timestamp: new Date(),
        confidence: 0,
        category: 'error'
      };
      setMessages(prev => [...prev, errorMessage]);
      toast.error("Failed to generate response");
    } finally {
      setIsLoading(false);
    }
  };

  const generateSuggestions = (response: string): string[] => {
    const suggestions = [
      "Tell me more about this",
      "Can you provide an example?",
      "How does this work?",
      "What are the alternatives?"
    ];
    return suggestions.slice(0, 2 + Math.floor(Math.random() * 3));
  };

  const playNotificationSound = () => {
    if (typeof window !== 'undefined' && settings.soundEnabled) {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
      audio.play().catch(() => {});
    }
  };

  const handleQuickAction = (action: typeof QUICK_ACTIONS[0]) => {
    setInputText(action.prompt + ' ');
    inputRef.current?.focus();
  };

  const handleRateMessage = (messageId: string, rating: number) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, rating } : msg
    ));
    toast.success(`Rated ${rating} stars`);
  };

  const handleBookmarkMessage = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, isBookmarked: !msg.isBookmarked } : msg
    ));
    toast.success("Message bookmarked");
  };

  const handleCopyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const handleDeleteMessage = (messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
    toast.success("Message deleted");
  };

  const filteredMessages = messages.filter(msg => {
    const matchesSearch = msg.text.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || msg.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const glassmorphismStyle = {
    background: theme === 'dark' 
      ? 'rgba(15, 23, 42, 0.8)' 
      : 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(20px)',
    border: theme === 'dark' 
      ? '1px solid rgba(255, 255, 255, 0.1)' 
      : '1px solid rgba(0, 0, 0, 0.1)',
  };

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50' : 'relative'} transition-all duration-300`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isFullscreen ? 'h-screen' : 'h-[800px]'} rounded-2xl overflow-hidden shadow-2xl`}
        style={glassmorphismStyle}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: isLoading ? 360 : 0 }}
              transition={{ duration: 2, repeat: isLoading ? Infinity : 0 }}
              className={`w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r from-${selectedPersonality.color}-500 to-${selectedPersonality.color}-600`}
            >
              {selectedPersonality.icon}
            </motion.div>
            <div>
              <h2 className="font-semibold text-lg">{selectedPersonality.name}</h2>
              <p className="text-sm text-muted-foreground">{selectedPersonality.description}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={selectedPersonality.id} onValueChange={(value) => {
              const personality = AI_PERSONALITIES.find(p => p.id === value);
              if (personality) setSelectedPersonality(personality);
            }}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AI_PERSONALITIES.map(personality => (
                  <SelectItem key={personality.id} value={personality.id}>
                    <div className="flex items-center gap-2">
                      {personality.icon}
                      {personality.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex items-center gap-2 p-4 border-b border-white/10">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="assistant">Assistant</SelectItem>
              <SelectItem value="interviewer">Interview</SelectItem>
              <SelectItem value="coder">Code</SelectItem>
              <SelectItem value="analyst">Analysis</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 p-4 overflow-x-auto">
          {QUICK_ACTIONS.map(action => (
            <motion.button
              key={action.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleQuickAction(action)}
              className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors whitespace-nowrap"
            >
              {action.icon}
              {action.label}
            </motion.button>
          ))}
        </div>

        {/* Messages */}
        <ScrollArea className={`${isFullscreen ? 'h-[calc(100vh-280px)]' : 'h-[480px]'} px-4`} ref={chatContainerRef}>
          <AnimatePresence>
            {filteredMessages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className={`flex gap-3 mb-6 ${message.isBot ? '' : 'flex-row-reverse'}`}
              >
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarFallback>
                    {message.isBot ? selectedPersonality.avatar : <User className="w-4 h-4" />}
                  </AvatarFallback>
                </Avatar>
                
                <div className={`flex-1 max-w-[80%] ${message.isBot ? '' : 'text-right'}`}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className={`p-4 rounded-2xl ${
                      message.isBot 
                        ? 'bg-white/10 backdrop-blur-sm' 
                        : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                    }`}
                    style={message.isBot ? glassmorphismStyle : {}}
                  >
                    <p className="whitespace-pre-wrap">{message.text}</p>
                    
                    {message.confidence && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          Confidence: {Math.round(message.confidence * 100)}%
                        </div>
                        {message.processingTime && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {message.processingTime}ms
                          </div>
                        )}
                        {message.tokens && (
                          <div className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            {message.tokens} tokens
                          </div>
                        )}
                      </div>
                    )}
                    
                    {message.suggestions && message.suggestions.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {message.suggestions.map((suggestion, idx) => (
                          <motion.button
                            key={idx}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setInputText(suggestion)}
                            className="px-2 py-1 text-xs rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                          >
                            {suggestion}
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                  
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <span>{message.timestamp.toLocaleTimeString()}</span>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-6 h-6"
                        onClick={() => handleCopyMessage(message.text)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-6 h-6"
                        onClick={() => handleBookmarkMessage(message.id)}
                      >
                        <Bookmark className={`w-3 h-3 ${message.isBookmarked ? 'fill-current' : ''}`} />
                      </Button>
                      
                      {message.isBot && (
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map(rating => (
                            <Button
                              key={rating}
                              variant="ghost"
                              size="icon"
                              className="w-6 h-6"
                              onClick={() => handleRateMessage(message.id, rating)}
                            >
                              <Star className={`w-3 h-3 ${message.rating && message.rating >= rating ? 'fill-current text-yellow-500' : ''}`} />
                            </Button>
                          ))}
                        </div>
                      )}
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="w-6 h-6">
                            <MoreHorizontal className="w-3 h-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleCopyMessage(message.text)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleBookmarkMessage(message.id)}>
                            <Bookmark className="w-4 h-4 mr-2" />
                            Bookmark
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteMessage(message.id)}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3 mb-6"
            >
              <Avatar className="w-8 h-8">
                <AvatarFallback>{selectedPersonality.avatar}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <RefreshCw className="w-4 h-4" />
                    </motion.div>
                    <span>Thinking...</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <Textarea
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your message..."
                className="min-h-[60px] max-h-[120px] resize-none pr-12"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <div className="absolute right-2 bottom-2 flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8"
                  onClick={() => setIsListening(!isListening)}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isLoading}
                className="w-12 h-12 rounded-full"
              >
                <Send className="w-4 h-4" />
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>AI Chat Settings</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="ai">AI Model</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="space-y-4">
              <div className="space-y-2">
                <Label>Language</Label>
                <Select value={settings.language} onValueChange={(value) => 
                  setSettings(prev => ({ ...prev, language: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map(lang => (
                      <SelectItem key={lang.code} value={lang.code}>
                        <div className="flex items-center gap-2">
                          <span>{lang.flag}</span>
                          {lang.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <Label>Voice Enabled</Label>
                <Switch
                  checked={settings.voiceEnabled}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, voiceEnabled: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label>Auto Save</Label>
                <Switch
                  checked={settings.autoSave}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, autoSave: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label>Sound Effects</Label>
                <Switch
                  checked={settings.soundEnabled}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, soundEnabled: checked }))
                  }
                />
              </div>
            </TabsContent>
            
            <TabsContent value="ai" className="space-y-4">
              <div className="space-y-2">
                <Label>Temperature: {settings.temperature}</Label>
                <Slider
                  value={[settings.temperature]}
                  onValueChange={([value]) => 
                    setSettings(prev => ({ ...prev, temperature: value }))
                  }
                  max={1}
                  min={0}
                  step={0.1}
                />
                <p className="text-sm text-muted-foreground">
                  Controls randomness in responses. Lower = more focused, Higher = more creative
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Max Tokens: {settings.maxTokens}</Label>
                <Slider
                  value={[settings.maxTokens]}
                  onValueChange={([value]) => 
                    setSettings(prev => ({ ...prev, maxTokens: value }))
                  }
                  max={4096}
                  min={256}
                  step={256}
                />
                <p className="text-sm text-muted-foreground">
                  Maximum length of AI responses
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="appearance" className="space-y-4">
              <div className="space-y-2">
                <Label>Font Size: {settings.fontSize}px</Label>
                <Slider
                  value={[settings.fontSize]}
                  onValueChange={([value]) => 
                    setSettings(prev => ({ ...prev, fontSize: value }))
                  }
                  max={20}
                  min={12}
                  step={1}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label>Animations</Label>
                <Switch
                  checked={settings.animationsEnabled}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, animationsEnabled: checked }))
                  }
                />
              </div>
            </TabsContent>
            
            <TabsContent value="advanced" className="space-y-4">
              <div className="space-y-4">
                <Button variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Export Chat History
                </Button>
                
                <Button variant="outline" className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Clear All Messages
                </Button>
                
                <Separator />
                
                <div className="text-sm text-muted-foreground">
                  <p>Total Messages: {messages.length}</p>
                  <p>Bookmarked: {messages.filter(m => m.isBookmarked).length}</p>
                  <p>Average Response Time: {
                    Math.round(
                      messages
                        .filter(m => m.processingTime)
                        .reduce((acc, m) => acc + (m.processingTime || 0), 0) / 
                      messages.filter(m => m.processingTime).length || 0
                    )
                  }ms</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}