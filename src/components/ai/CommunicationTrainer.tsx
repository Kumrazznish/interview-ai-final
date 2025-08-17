"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Play, Pause, Square, Volume2, VolumeX, RotateCcw, TrendingUp, MessageSquare, Clock, Target, Award, Brain, Zap, BarChart3, AlertTriangle, CheckCircle, Lightbulb, Download, RefreshCw, Settings, Headphones, AudioWaveform as Waveform, Activity, Eye, Users, BookOpen } from "lucide-react";
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

interface Exercise {
  id: string;
  title: string;
  description: string;
  type: 'pronunciation' | 'fluency' | 'vocabulary' | 'grammar' | 'conversation';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  content: string;
  targetWords?: string[];
  tips: string[];
}

interface AnalysisResult {
  overallScore: number;
  pronunciation: number;
  fluency: number;
  clarity: number;
  pace: number;
  confidence: number;
  vocabulary: number;
  grammar: number;
  fillerWords: number;
  pauseAnalysis: {
    totalPauses: number;
    averagePauseLength: number;
    appropriatePauses: number;
  };
  strengths: string[];
  improvements: string[];
  recommendations: string[];
  detailedFeedback: string;
}

const EXERCISE_TYPES = [
  { id: 'pronunciation', label: 'Pronunciation', icon: Volume2, color: 'blue' },
  { id: 'fluency', label: 'Fluency', icon: Activity, color: 'green' },
  { id: 'vocabulary', label: 'Vocabulary', icon: BookOpen, color: 'purple' },
  { id: 'grammar', label: 'Grammar', icon: Target, color: 'orange' },
  { id: 'conversation', label: 'Conversation', icon: MessageSquare, color: 'red' }
];

const SAMPLE_EXERCISES: Exercise[] = [
  {
    id: '1',
    title: 'Technical Presentation',
    description: 'Practice explaining complex technical concepts clearly',
    type: 'conversation',
    difficulty: 'intermediate',
    duration: 180,
    content: 'Explain how a REST API works and its key principles. Include examples of HTTP methods and status codes.',
    targetWords: ['REST', 'API', 'HTTP', 'GET', 'POST', 'PUT', 'DELETE', 'status codes'],
    tips: [
      'Use simple analogies to explain complex concepts',
      'Speak at a moderate pace',
      'Use clear transitions between ideas',
      'Include practical examples'
    ]
  },
  {
    id: '2',
    title: 'Pronunciation Practice',
    description: 'Focus on difficult technical terms and their correct pronunciation',
    type: 'pronunciation',
    difficulty: 'beginner',
    duration: 120,
    content: 'Read the following technical terms clearly: Algorithm, Authentication, Authorization, Asynchronous, Synchronous, Kubernetes, PostgreSQL, Elasticsearch, Microservices, Infrastructure.',
    targetWords: ['Algorithm', 'Authentication', 'Authorization', 'Asynchronous', 'Kubernetes'],
    tips: [
      'Break down complex words into syllables',
      'Practice each word multiple times',
      'Focus on stress patterns',
      'Record yourself and listen back'
    ]
  },
  {
    id: '3',
    title: 'Fluency Builder',
    description: 'Improve speaking flow and reduce hesitations',
    type: 'fluency',
    difficulty: 'intermediate',
    duration: 240,
    content: 'Describe your experience with a challenging project. Talk continuously for 3 minutes without long pauses. Focus on maintaining steady flow.',
    tips: [
      'Plan your main points beforehand',
      'Use connecting words and phrases',
      'Don\'t worry about perfect grammar',
      'Keep talking even if you make mistakes'
    ]
  },
  {
    id: '4',
    title: 'Vocabulary Enhancement',
    description: 'Practice using advanced technical vocabulary in context',
    type: 'vocabulary',
    difficulty: 'advanced',
    duration: 200,
    content: 'Use these words in sentences related to software development: scalability, optimization, refactoring, deployment, integration, architecture, framework, paradigm.',
    targetWords: ['scalability', 'optimization', 'refactoring', 'deployment', 'integration'],
    tips: [
      'Create meaningful sentences',
      'Use words in proper context',
      'Explain the meaning if unsure',
      'Connect words to real experiences'
    ]
  }
];

export default function CommunicationTrainer() {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [selectedType, setSelectedType] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
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
      stopRecording();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording, isPaused, timeRemaining]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Set up audio level monitoring
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      
      analyser.fftSize = 256;
      microphone.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      
      // Monitor audio levels
      const monitorAudio = () => {
        if (analyserRef.current) {
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setAudioLevel(average);
        }
        if (isRecording) {
          requestAnimationFrame(monitorAudio);
        }
      };
      monitorAudio();

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      recordedChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);
      
      if (selectedExercise) {
        setTimeRemaining(selectedExercise.duration);
      }

      toast.success('Recording started!');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Could not access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      setAudioLevel(0);
      
      // Start analysis
      analyzeRecording();
    }
  };

  const analyzeRecording = () => {
    setIsAnalyzing(true);
    
    // Simulate analysis delay
    setTimeout(() => {
      const mockAnalysis: AnalysisResult = {
        overallScore: Math.floor(Math.random() * 25) + 75,
        pronunciation: Math.floor(Math.random() * 20) + 80,
        fluency: Math.floor(Math.random() * 30) + 70,
        clarity: Math.floor(Math.random() * 25) + 75,
        pace: Math.floor(Math.random() * 20) + 80,
        confidence: Math.floor(Math.random() * 30) + 70,
        vocabulary: Math.floor(Math.random() * 25) + 75,
        grammar: Math.floor(Math.random() * 20) + 80,
        fillerWords: Math.floor(Math.random() * 15) + 5,
        pauseAnalysis: {
          totalPauses: Math.floor(Math.random() * 10) + 5,
          averagePauseLength: Math.random() * 2 + 1,
          appropriatePauses: Math.floor(Math.random() * 8) + 7
        },
        strengths: [
          'Clear pronunciation of technical terms',
          'Good pace and rhythm',
          'Confident delivery',
          'Appropriate use of pauses'
        ],
        improvements: [
          'Reduce filler words (um, uh)',
          'Improve sentence structure',
          'Work on voice projection',
          'Practice smoother transitions'
        ],
        recommendations: [
          'Practice reading technical documentation aloud',
          'Record yourself daily for 5 minutes',
          'Work on breathing techniques',
          'Join a public speaking group'
        ],
        detailedFeedback: 'Your overall communication shows strong technical knowledge with clear articulation. Focus on reducing hesitations and maintaining consistent energy throughout your speech. Your pronunciation of technical terms is excellent, which is crucial for technical interviews.'
      };

      setAnalysis(mockAnalysis);
      setIsAnalyzing(false);
      toast.success('Analysis complete!');
    }, 3000);
  };

  const resetExercise = () => {
    setSelectedExercise(null);
    setIsRecording(false);
    setIsPaused(false);
    setTimeRemaining(0);
    setAnalysis(null);
    setIsAnalyzing(false);
    setAudioLevel(0);
    
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
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

  const filteredExercises = SAMPLE_EXERCISES.filter(exercise => {
    const typeMatch = !selectedType || exercise.type === selectedType;
    const difficultyMatch = !selectedDifficulty || exercise.difficulty === selectedDifficulty;
    return typeMatch && difficultyMatch;
  });

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
              <Brain className="w-16 h-16 text-purple-500" />
            </motion.div>
            <h3 className="text-xl font-semibold mb-2">Analyzing Your Speech</h3>
            <p className="text-muted-foreground mb-4">
              Our AI is evaluating your communication skills...
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Analyzing pronunciation and clarity</p>
              <p>• Evaluating fluency and pace</p>
              <p>• Checking grammar and vocabulary</p>
              <p>• Assessing confidence and delivery</p>
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
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-3xl font-bold text-white">{analysis.overallScore}</span>
              </div>
            </div>
            <CardTitle className="text-2xl">Communication Analysis</CardTitle>
            <p className="text-muted-foreground">
              Comprehensive evaluation of your speaking skills
            </p>
          </CardHeader>
        </Card>

        {/* Detailed Analysis */}
        <Tabs defaultValue="scores" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="scores">Scores</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="exercises">Practice</TabsTrigger>
          </TabsList>

          <TabsContent value="scores" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Pronunciation', value: analysis.pronunciation, icon: Volume2 },
                { label: 'Fluency', value: analysis.fluency, icon: Activity },
                { label: 'Clarity', value: analysis.clarity, icon: Eye },
                { label: 'Pace', value: analysis.pace, icon: Clock },
                { label: 'Confidence', value: analysis.confidence, icon: TrendingUp },
                { label: 'Vocabulary', value: analysis.vocabulary, icon: BookOpen },
                { label: 'Grammar', value: analysis.grammar, icon: Target },
                { label: 'Filler Words', value: 100 - analysis.fillerWords, icon: AlertTriangle }
              ].map((metric) => (
                <Card key={metric.label} style={glassmorphismStyle}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <metric.icon className="w-5 h-5 text-muted-foreground" />
                      <span className={`text-xl font-bold ${getScoreColor(metric.value)}`}>
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

            <Card style={glassmorphismStyle}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Pause Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-500">
                      {analysis.pauseAnalysis.totalPauses}
                    </div>
                    <p className="text-sm text-muted-foreground">Total Pauses</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">
                      {analysis.pauseAnalysis.averagePauseLength.toFixed(1)}s
                    </div>
                    <p className="text-sm text-muted-foreground">Avg. Pause Length</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-500">
                      {Math.round((analysis.pauseAnalysis.appropriatePauses / analysis.pauseAnalysis.totalPauses) * 100)}%
                    </div>
                    <p className="text-sm text-muted-foreground">Appropriate Pauses</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            <Card style={glassmorphismStyle}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Detailed Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{analysis.detailedFeedback}</p>
              </CardContent>
            </Card>

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

          <TabsContent value="feedback" className="space-y-4">
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
                      <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs text-white font-bold">{index + 1}</span>
                      </div>
                      <p className="text-sm">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exercises" className="space-y-4">
            <Card style={glassmorphismStyle}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Recommended Practice Exercises
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {SAMPLE_EXERCISES.slice(0, 4).map((exercise) => (
                    <div key={exercise.id} className="p-4 rounded-lg bg-muted/20 border">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{exercise.title}</h4>
                        <Badge variant="outline">{exercise.difficulty}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {exercise.description}
                      </p>
                      <Button size="sm" variant="outline" className="w-full">
                        Practice This
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button onClick={resetExercise} className="flex-1">
            <RotateCcw className="w-4 h-4 mr-2" />
            Try Another Exercise
          </Button>
          <Button variant="outline" className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            Download Report
          </Button>
        </div>
      </motion.div>
    );
  }

  if (selectedExercise) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Exercise Header */}
        <Card style={glassmorphismStyle}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Headphones className="w-5 h-5" />
                  <h2 className="text-xl font-semibold">{selectedExercise.title}</h2>
                </div>
                <Badge variant="outline">{selectedExercise.type}</Badge>
                <Badge variant="secondary">{selectedExercise.difficulty}</Badge>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span className={`font-mono text-lg ${timeRemaining < 30 ? 'text-red-500' : ''}`}>
                    {formatTime(timeRemaining)}
                  </span>
                </div>
                <Button variant="outline" size="sm" onClick={resetExercise}>
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Exercise Content */}
          <Card style={glassmorphismStyle}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Exercise Content
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{selectedExercise.description}</p>
              
              <div className="p-4 rounded-lg bg-muted/20 border">
                <p className="leading-relaxed">{selectedExercise.content}</p>
              </div>

              {selectedExercise.targetWords && (
                <div>
                  <h4 className="font-medium mb-2">Focus Words:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedExercise.targetWords.map((word, index) => (
                      <Badge key={index} variant="secondary">{word}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-yellow-500" />
                  Tips:
                </h4>
                <ul className="space-y-1">
                  {selectedExercise.tips.map((tip, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Recording Controls */}
          <Card style={glassmorphismStyle}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="w-5 h-5" />
                Recording Studio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Audio Level Indicator */}
              <div className="space-y-2">
                <Label>Audio Level</Label>
                <div className="flex items-center gap-2">
                  <Mic className="w-4 h-4" />
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-100"
                      style={{ width: `${Math.min(audioLevel * 2, 100)}%` }}
                    />
                  </div>
                  <Volume2 className="w-4 h-4" />
                </div>
              </div>

              {/* Recording Controls */}
              <div className="flex flex-col items-center space-y-4">
                {!isRecording ? (
                  <Button
                    onClick={startRecording}
                    size="lg"
                    className="w-full"
                  >
                    <Mic className="w-5 h-5 mr-2" />
                    Start Recording
                  </Button>
                ) : (
                  <div className="flex gap-2 w-full">
                    <Button
                      onClick={() => setIsPaused(!isPaused)}
                      variant="outline"
                      className="flex-1"
                    >
                      {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                    </Button>
                    <Button
                      onClick={stopRecording}
                      variant="destructive"
                      className="flex-1"
                    >
                      <Square className="w-4 h-4 mr-2" />
                      Stop & Analyze
                    </Button>
                  </div>
                )}
              </div>

              {/* Recording Status */}
              {isRecording && (
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-red-500">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    <span className="font-medium">
                      {isPaused ? 'Recording Paused' : 'Recording...'}
                    </span>
                  </div>
                </div>
              )}

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>
                    {formatTime(selectedExercise.duration - timeRemaining)} / {formatTime(selectedExercise.duration)}
                  </span>
                </div>
                <Progress 
                  value={((selectedExercise.duration - timeRemaining) / selectedExercise.duration) * 100} 
                  className="h-2" 
                />
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
            <MessageSquare className="w-6 h-6 text-green-500" />
            AI Communication Trainer
            <Badge variant="secondary">Speech Analysis</Badge>
          </CardTitle>
          <p className="text-muted-foreground">
            Improve your communication skills with AI-powered speech analysis and personalized feedback
          </p>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card style={glassmorphismStyle}>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label>Type:</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All types</SelectItem>
                  {EXERCISE_TYPES.map(type => (
                    <SelectItem key={type.id} value={type.id}>
                      <div className="flex items-center gap-2">
                        <type.icon className="w-4 h-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Label>Difficulty:</Label>
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All levels</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exercise Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredExercises.map((exercise, index) => (
          <motion.div
            key={exercise.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="h-full hover:shadow-lg transition-all cursor-pointer group" style={glassmorphismStyle}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {EXERCISE_TYPES.find(t => t.id === exercise.type)?.icon && (
                      React.createElement(EXERCISE_TYPES.find(t => t.id === exercise.type)!.icon, {
                        className: "w-5 h-5"
                      })
                    )}
                    <Badge variant="outline">{exercise.type}</Badge>
                  </div>
                  <Badge variant={
                    exercise.difficulty === 'beginner' ? 'secondary' :
                    exercise.difficulty === 'intermediate' ? 'default' : 'destructive'
                  }>
                    {exercise.difficulty}
                  </Badge>
                </div>
                <CardTitle className="group-hover:text-green-500 transition-colors">
                  {exercise.title}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {exercise.description}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {Math.floor(exercise.duration / 60)} min
                  </div>
                  {exercise.targetWords && (
                    <div className="flex items-center gap-1">
                      <Target className="w-4 h-4" />
                      {exercise.targetWords.length} focus words
                    </div>
                  )}
                </div>
                
                <Button 
                  className="w-full"
                  onClick={() => setSelectedExercise(exercise)}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Exercise
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card style={glassmorphismStyle}>
          <CardContent className="p-4 text-center">
            <Brain className="w-8 h-8 mx-auto mb-2 text-purple-500" />
            <h3 className="font-medium mb-1">AI Analysis</h3>
            <p className="text-sm text-muted-foreground">
              Advanced speech recognition and analysis
            </p>
          </CardContent>
        </Card>

        <Card style={glassmorphismStyle}>
          <CardContent className="p-4 text-center">
            <Waveform className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <h3 className="font-medium mb-1">Real-time Feedback</h3>
            <p className="text-sm text-muted-foreground">
              Instant audio level and quality monitoring
            </p>
          </CardContent>
        </Card>

        <Card style={glassmorphismStyle}>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <h3 className="font-medium mb-1">Progress Tracking</h3>
            <p className="text-sm text-muted-foreground">
              Monitor improvement over time
            </p>
          </CardContent>
        </Card>

        <Card style={glassmorphismStyle}>
          <CardContent className="p-4 text-center">
            <Award className="w-8 h-8 mx-auto mb-2 text-orange-500" />
            <h3 className="font-medium mb-1">Personalized Tips</h3>
            <p className="text-sm text-muted-foreground">
              Customized recommendations for improvement
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}