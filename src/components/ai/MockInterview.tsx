"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Video, 
  Mic, 
  MicOff, 
  VideoOff,
  Play,
  Pause,
  Square,
  RotateCcw,
  Download,
  Eye,
  Brain,
  Clock,
  Star,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  MessageSquare,
  Users,
  Target,
  Award,
  Lightbulb,
  BarChart3,
  Volume2,
  VolumeX,
  Settings,
  RefreshCw,
  Zap,
  BookOpen,
  Camera,
  Monitor
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "react-hot-toast";

interface Question {
  id: string;
  question: string;
  type: 'technical' | 'behavioral' | 'situational';
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  timeLimit: number;
  followUpQuestions?: string[];
  tips: string[];
}

interface InterviewSession {
  id: string;
  title: string;
  role: string;
  company: string;
  duration: number;
  questions: Question[];
  difficulty: string;
}

interface InterviewAnalysis {
  overallScore: number;
  confidence: number;
  clarity: number;
  technicalAccuracy: number;
  communicationSkills: number;
  bodyLanguage: number;
  responseTime: number;
  strengths: string[];
  improvements: string[];
  detailedFeedback: {
    questionId: string;
    score: number;
    feedback: string;
    suggestions: string[];
  }[];
  recommendations: string[];
}

const INTERVIEW_TYPES = [
  { id: 'technical', label: 'Technical Interview', icon: Brain, color: 'blue' },
  { id: 'behavioral', label: 'Behavioral Interview', icon: Users, color: 'green' },
  { id: 'mixed', label: 'Mixed Interview', icon: Target, color: 'purple' }
];

const JOB_ROLES = [
  'Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'DevOps Engineer',
  'Data Scientist',
  'Product Manager',
  'UI/UX Designer',
  'QA Engineer',
  'Mobile Developer'
];

const COMPANIES = [
  'Google', 'Microsoft', 'Amazon', 'Apple', 'Meta',
  'Netflix', 'Tesla', 'Spotify', 'Airbnb', 'Uber'
];

const SAMPLE_QUESTIONS: Question[] = [
  {
    id: '1',
    question: 'Tell me about yourself and your background in software development.',
    type: 'behavioral',
    difficulty: 'easy',
    category: 'Introduction',
    timeLimit: 120,
    tips: [
      'Keep it concise and relevant to the role',
      'Highlight your key achievements',
      'Connect your experience to the job requirements'
    ]
  },
  {
    id: '2',
    question: 'Explain the difference between REST and GraphQL APIs.',
    type: 'technical',
    difficulty: 'medium',
    category: 'APIs',
    timeLimit: 180,
    followUpQuestions: [
      'When would you choose GraphQL over REST?',
      'What are the performance implications of each?'
    ],
    tips: [
      'Provide clear definitions',
      'Give practical examples',
      'Discuss pros and cons of each'
    ]
  },
  {
    id: '3',
    question: 'Describe a challenging project you worked on and how you overcame the difficulties.',
    type: 'behavioral',
    difficulty: 'medium',
    category: 'Problem Solving',
    timeLimit: 240,
    tips: [
      'Use the STAR method (Situation, Task, Action, Result)',
      'Focus on your specific contributions',
      'Highlight lessons learned'
    ]
  }
];

export default function MockInterview() {
  const [currentSession, setCurrentSession] = useState<InterviewSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [analysis, setAnalysis] = useState<InterviewAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Configuration states
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedType, setSelectedType] = useState('mixed');
  const [difficulty, setDifficulty] = useState(['medium']);
  const [duration, setDuration] = useState([30]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const glassmorphismStyle = {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRecording && !isPaused && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(time => time - 1);
      }, 1000);
    } else if (timeRemaining === 0 && isRecording) {
      endInterview();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording, isPaused, timeRemaining]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Could not access camera and microphone');
    }
  };

  const startInterview = async () => {
    if (!selectedRole || !selectedCompany) {
      toast.error('Please select job role and company');
      return;
    }

    await startCamera();

    const session: InterviewSession = {
      id: Date.now().toString(),
      title: `${selectedRole} Interview`,
      role: selectedRole,
      company: selectedCompany,
      duration: duration[0],
      difficulty: difficulty[0],
      questions: SAMPLE_QUESTIONS.slice(0, Math.ceil(duration[0] / 10)) // Roughly 1 question per 10 minutes
    };

    setCurrentSession(session);
    setCurrentQuestionIndex(0);
    setTimeRemaining(session.duration * 60);
    setIsRecording(true);
    setIsPaused(false);
    setAnalysis(null);

    // Start recording
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      recordedChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
    }

    toast.success('Interview started! Good luck!');
  };

  const nextQuestion = () => {
    if (currentSession && currentQuestionIndex < currentSession.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      endInterview();
    }
  };

  const endInterview = async () => {
    setIsRecording(false);
    
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }

    // Stop camera stream
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }

    // Simulate analysis
    setIsAnalyzing(true);
    
    setTimeout(() => {
      const mockAnalysis: InterviewAnalysis = {
        overallScore: Math.floor(Math.random() * 30) + 70,
        confidence: Math.floor(Math.random() * 25) + 75,
        clarity: Math.floor(Math.random() * 20) + 80,
        technicalAccuracy: Math.floor(Math.random() * 35) + 65,
        communicationSkills: Math.floor(Math.random() * 20) + 80,
        bodyLanguage: Math.floor(Math.random() * 25) + 75,
        responseTime: Math.floor(Math.random() * 30) + 70,
        strengths: [
          'Clear communication',
          'Good technical knowledge',
          'Confident presentation',
          'Structured thinking'
        ],
        improvements: [
          'Provide more specific examples',
          'Improve eye contact',
          'Reduce filler words',
          'Better time management'
        ],
        detailedFeedback: currentSession?.questions.map((q, index) => ({
          questionId: q.id,
          score: Math.floor(Math.random() * 30) + 70,
          feedback: 'Good response with relevant examples. Could be more concise.',
          suggestions: ['Add more specific metrics', 'Structure answer better']
        })) || [],
        recommendations: [
          'Practice more behavioral questions',
          'Work on maintaining eye contact',
          'Prepare more specific examples',
          'Practice time management'
        ]
      };

      setAnalysis(mockAnalysis);
      setIsAnalyzing(false);
      toast.success('Interview analysis completed!');
    }, 3000);
  };

  const resetInterview = () => {
    setCurrentSession(null);
    setCurrentQuestionIndex(0);
    setIsRecording(false);
    setIsPaused(false);
    setTimeRemaining(0);
    setAnalysis(null);
    setIsAnalyzing(false);
    
    // Stop camera stream
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  if (isAnalyzing) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card style={glassmorphismStyle}>
          <CardContent className="p-8 text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 mx-auto mb-4"
            >
              <Brain className="w-16 h-16 text-blue-500" />
            </motion.div>
            <h3 className="text-xl font-semibold mb-2">Analyzing Your Interview</h3>
            <p className="text-muted-foreground mb-4">
              Our AI is evaluating your performance across multiple dimensions...
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Analyzing speech patterns and clarity</p>
              <p>• Evaluating technical accuracy</p>
              <p>• Assessing communication skills</p>
              <p>• Reviewing body language and confidence</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (analysis) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-6"
      >
        {/* Overall Score */}
        <Card style={glassmorphismStyle}>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                <span className="text-3xl font-bold text-white">{analysis.overallScore}</span>
              </div>
            </div>
            <CardTitle className="text-2xl">Interview Analysis Complete</CardTitle>
            <p className="text-muted-foreground">
              Here's your comprehensive performance analysis
            </p>
          </CardHeader>
        </Card>

        {/* Detailed Metrics */}
        <Tabs defaultValue="scores" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="scores">Scores</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="questions">Questions</TabsTrigger>
            <TabsTrigger value="recommendations">Tips</TabsTrigger>
          </TabsList>

          <TabsContent value="scores" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: 'Confidence', value: analysis.confidence, icon: TrendingUp },
                { label: 'Clarity', value: analysis.clarity, icon: MessageSquare },
                { label: 'Technical Accuracy', value: analysis.technicalAccuracy, icon: Brain },
                { label: 'Communication', value: analysis.communicationSkills, icon: Users },
                { label: 'Body Language', value: analysis.bodyLanguage, icon: Eye },
                { label: 'Response Time', value: analysis.responseTime, icon: Clock }
              ].map((metric) => (
                <Card key={metric.label} style={glassmorphismStyle}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <metric.icon className="w-5 h-5 text-muted-foreground" />
                      <span className={`text-2xl font-bold ${getScoreColor(metric.value)}`}>
                        {metric.value}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <p className="font-medium text-sm">{metric.label}</p>
                      <Progress value={metric.value} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="feedback" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card style={glassmorphismStyle}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card style={glassmorphismStyle}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-600">
                    <AlertTriangle className="w-5 h-5" />
                    Areas for Improvement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.improvements.map((improvement, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="questions" className="space-y-4">
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {analysis.detailedFeedback.map((feedback, index) => {
                  const question = currentSession?.questions.find(q => q.id === feedback.questionId);
                  return (
                    <Card key={feedback.questionId} style={glassmorphismStyle}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-medium">Question {index + 1}</h4>
                          <Badge className={getScoreColor(feedback.score)}>
                            {feedback.score}/100
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {question?.question}
                        </p>
                        <p className="text-sm mb-3">{feedback.feedback}</p>
                        <div className="space-y-1">
                          <h5 className="text-xs font-medium text-blue-600">Suggestions:</h5>
                          {feedback.suggestions.map((suggestion, suggestionIndex) => (
                            <p key={suggestionIndex} className="text-xs text-muted-foreground">
                              • {suggestion}
                            </p>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            <Card style={glassmorphismStyle}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  Personalized Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysis.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/20">
                      <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs text-white font-bold">{index + 1}</span>
                      </div>
                      <p className="text-sm">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button onClick={resetInterview} className="flex-1">
            <RotateCcw className="w-4 h-4 mr-2" />
            Start New Interview
          </Button>
          <Button variant="outline" className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            Download Report
          </Button>
        </div>
      </motion.div>
    );
  }

  if (currentSession) {
    const currentQuestion = currentSession.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / currentSession.questions.length) * 100;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Interview Header */}
        <Card style={glassmorphismStyle}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Video className="w-5 h-5" />
                  <h2 className="text-xl font-semibold">
                    {currentSession.role} at {currentSession.company}
                  </h2>
                </div>
                <Badge variant="outline">
                  Question {currentQuestionIndex + 1} of {currentSession.questions.length}
                </Badge>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span className={`font-mono text-lg ${timeRemaining < 300 ? 'text-red-500' : ''}`}>
                    {formatTime(timeRemaining)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsPaused(!isPaused)}
                  >
                    {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  </Button>
                  <Button variant="outline" size="sm" onClick={endInterview}>
                    <Square className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Video Feed */}
          <Card style={glassmorphismStyle}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Video Feed
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                  >
                    {isVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                  >
                    {isAudioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  className="w-full h-full object-cover"
                  style={{ display: isVideoEnabled ? 'block' : 'none' }}
                />
                {!isVideoEnabled && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <VideoOff className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                {isRecording && (
                  <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    REC
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Question Panel */}
          <Card style={glassmorphismStyle}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{currentQuestion.category}</Badge>
                  <Badge 
                    variant={
                      currentQuestion.difficulty === 'easy' ? 'secondary' :
                      currentQuestion.difficulty === 'medium' ? 'default' : 'destructive'
                    }
                  >
                    {currentQuestion.difficulty}
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{currentQuestion.timeLimit}s</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4 leading-relaxed">
                  {currentQuestion.question}
                </h3>
              </div>

              {currentQuestion.tips && (
                <div className="space-y-2">
                  <h4 className="font-medium text-blue-600 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    Tips for answering:
                  </h4>
                  <ul className="space-y-1">
                    {currentQuestion.tips.map((tip, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {currentQuestion.followUpQuestions && (
                <div className="space-y-2">
                  <h4 className="font-medium text-purple-600">Potential follow-up questions:</h4>
                  <ul className="space-y-1">
                    {currentQuestion.followUpQuestions.map((followUp, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-purple-500 mt-1">•</span>
                        {followUp}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                  disabled={currentQuestionIndex === 0}
                >
                  Previous
                </Button>
                <Button onClick={nextQuestion}>
                  {currentQuestionIndex === currentSession.questions.length - 1 ? 'Finish' : 'Next Question'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card style={glassmorphismStyle}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="w-6 h-6 text-purple-500" />
            AI Mock Interview
            <Badge variant="secondary">Practice & Improve</Badge>
          </CardTitle>
          <p className="text-muted-foreground">
            Practice interviews with AI-powered analysis and real-time feedback
          </p>
        </CardHeader>
      </Card>

      {/* Configuration */}
      <Card style={glassmorphismStyle}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Interview Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Job Role</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select job role" />
                </SelectTrigger>
                <SelectContent>
                  {JOB_ROLES.map(role => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Company</Label>
              <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                <SelectTrigger>
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  {COMPANIES.map(company => (
                    <SelectItem key={company} value={company}>{company}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Interview Type</Label>
              <div className="flex flex-wrap gap-2">
                {INTERVIEW_TYPES.map(type => (
                  <Button
                    key={type.id}
                    variant={selectedType === type.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedType(type.id)}
                    className="flex items-center gap-2"
                  >
                    <type.icon className="w-4 h-4" />
                    {type.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Difficulty: {difficulty[0]}</Label>
                <Select value={difficulty[0]} onValueChange={(value) => setDifficulty([value])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Duration: {duration[0]} minutes</Label>
                <Slider
                  value={duration}
                  onValueChange={setDuration}
                  max={60}
                  min={15}
                  step={15}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <Button 
            onClick={startInterview} 
            className="w-full"
            size="lg"
          >
            <Play className="w-4 h-4 mr-2" />
            Start Mock Interview
          </Button>
        </CardContent>
      </Card>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card style={glassmorphismStyle}>
          <CardContent className="p-4 text-center">
            <Brain className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <h3 className="font-medium mb-1">AI Analysis</h3>
            <p className="text-sm text-muted-foreground">
              Get detailed feedback on your performance
            </p>
          </CardContent>
        </Card>

        <Card style={glassmorphismStyle}>
          <CardContent className="p-4 text-center">
            <Video className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <h3 className="font-medium mb-1">Video Recording</h3>
            <p className="text-sm text-muted-foreground">
              Review your body language and presentation
            </p>
          </CardContent>
        </Card>

        <Card style={glassmorphismStyle}>
          <CardContent className="p-4 text-center">
            <BarChart3 className="w-8 h-8 mx-auto mb-2 text-purple-500" />
            <h3 className="font-medium mb-1">Performance Metrics</h3>
            <p className="text-sm text-muted-foreground">
              Track improvement across multiple dimensions
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}