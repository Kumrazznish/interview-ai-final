"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Target, 
  Clock, 
  CheckCircle, 
  XCircle,
  Brain,
  Code,
  Database,
  Globe,
  Smartphone,
  Shield,
  Zap,
  Award,
  TrendingUp,
  BarChart3,
  RefreshCw,
  Play,
  Pause,
  RotateCcw,
  Download,
  Share,
  Star,
  AlertTriangle,
  Lightbulb,
  BookOpen,
  Users,
  Settings
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "react-hot-toast";

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  points: number;
  timeLimit: number;
}

interface Assessment {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  color: string;
  questions: Question[];
  totalTime: number;
  passingScore: number;
}

interface AssessmentResult {
  assessmentId: string;
  score: number;
  percentage: number;
  timeSpent: number;
  correctAnswers: number;
  totalQuestions: number;
  categoryScores: { [key: string]: number };
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  certificate?: boolean;
}

const SKILL_CATEGORIES = [
  { id: 'frontend', label: 'Frontend Development', icon: Globe, color: 'blue' },
  { id: 'backend', label: 'Backend Development', icon: Database, color: 'green' },
  { id: 'mobile', label: 'Mobile Development', icon: Smartphone, color: 'purple' },
  { id: 'devops', label: 'DevOps & Cloud', icon: Shield, color: 'orange' },
  { id: 'data', label: 'Data Science', icon: BarChart3, color: 'red' },
  { id: 'ai', label: 'AI & Machine Learning', icon: Brain, color: 'pink' }
];

const SAMPLE_ASSESSMENTS: Assessment[] = [
  {
    id: 'react-fundamentals',
    title: 'React Fundamentals',
    description: 'Test your knowledge of React concepts, hooks, and best practices',
    category: 'frontend',
    icon: <Code className="w-6 h-6" />,
    color: 'blue',
    totalTime: 30,
    passingScore: 70,
    questions: [
      {
        id: '1',
        question: 'What is the purpose of the useEffect hook in React?',
        options: [
          'To manage component state',
          'To perform side effects in functional components',
          'To handle user events',
          'To render JSX elements'
        ],
        correctAnswer: 1,
        explanation: 'useEffect is used to perform side effects in functional components, such as data fetching, subscriptions, or manually changing the DOM.',
        difficulty: 'medium',
        category: 'React Hooks',
        points: 10,
        timeLimit: 60
      },
      {
        id: '2',
        question: 'Which of the following is the correct way to update state in a functional component?',
        options: [
          'this.setState({value: newValue})',
          'setState(newValue)',
          'const [value, setValue] = useState(); setValue(newValue)',
          'state.value = newValue'
        ],
        correctAnswer: 2,
        explanation: 'In functional components, you use the useState hook and call the setter function to update state.',
        difficulty: 'easy',
        category: 'React State',
        points: 5,
        timeLimit: 45
      }
    ]
  },
  {
    id: 'javascript-advanced',
    title: 'Advanced JavaScript',
    description: 'Advanced concepts including closures, prototypes, and async programming',
    category: 'frontend',
    icon: <Zap className="w-6 h-6" />,
    color: 'yellow',
    totalTime: 45,
    passingScore: 75,
    questions: [
      {
        id: '1',
        question: 'What will be the output of the following code?\n\nfor (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 100);\n}',
        options: ['0 1 2', '3 3 3', '0 0 0', 'undefined undefined undefined'],
        correctAnswer: 1,
        explanation: 'Due to closure and var hoisting, all setTimeout callbacks will log 3, as they all reference the same variable i which becomes 3 after the loop ends.',
        difficulty: 'hard',
        category: 'Closures',
        points: 15,
        timeLimit: 90
      }
    ]
  }
];

export default function SkillAssessment() {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [availableAssessments, setAvailableAssessments] = useState<Assessment[]>(SAMPLE_ASSESSMENTS);
  const [currentAssessment, setCurrentAssessment] = useState<Assessment | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: number }>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const glassmorphismStyle = {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  };

  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && !isPaused && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(time => time - 1);
      }, 1000);
    } else if (timeRemaining === 0 && isActive) {
      finishAssessment();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isPaused, timeRemaining]);

  const startAssessment = (assessment: Assessment) => {
    setCurrentAssessment(assessment);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setTimeRemaining(assessment.totalTime * 60);
    setIsActive(true);
    setIsPaused(false);
    setAssessmentResult(null);
    setShowExplanation(false);
  };

  const selectAnswer = (questionId: string, answerIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const nextQuestion = () => {
    if (currentAssessment && currentQuestionIndex < currentAssessment.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowExplanation(false);
    } else {
      finishAssessment();
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setShowExplanation(false);
    }
  };

  const finishAssessment = () => {
    if (!currentAssessment) return;

    setIsActive(false);
    
    let correctAnswers = 0;
    let totalPoints = 0;
    let earnedPoints = 0;
    const categoryScores: { [key: string]: number } = {};

    currentAssessment.questions.forEach(question => {
      totalPoints += question.points;
      const userAnswer = selectedAnswers[question.id];
      
      if (userAnswer === question.correctAnswer) {
        correctAnswers++;
        earnedPoints += question.points;
      }

      // Track category performance
      if (!categoryScores[question.category]) {
        categoryScores[question.category] = 0;
      }
      if (userAnswer === question.correctAnswer) {
        categoryScores[question.category]++;
      }
    });

    const percentage = Math.round((earnedPoints / totalPoints) * 100);
    const timeSpent = (currentAssessment.totalTime * 60) - timeRemaining;

    const result: AssessmentResult = {
      assessmentId: currentAssessment.id,
      score: earnedPoints,
      percentage,
      timeSpent,
      correctAnswers,
      totalQuestions: currentAssessment.questions.length,
      categoryScores,
      strengths: Object.keys(categoryScores).filter(cat => categoryScores[cat] > 0),
      weaknesses: Object.keys(categoryScores).filter(cat => categoryScores[cat] === 0),
      recommendations: [
        'Review the topics you struggled with',
        'Practice more coding exercises',
        'Consider taking advanced courses'
      ],
      certificate: percentage >= currentAssessment.passingScore
    };

    setAssessmentResult(result);
    toast.success(`Assessment completed! Score: ${percentage}%`);
  };

  const resetAssessment = () => {
    setCurrentAssessment(null);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setTimeRemaining(0);
    setIsActive(false);
    setIsPaused(false);
    setAssessmentResult(null);
    setShowExplanation(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredAssessments = selectedCategory 
    ? availableAssessments.filter(a => a.category === selectedCategory)
    : availableAssessments;

  if (assessmentResult) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-6"
      >
        <Card style={glassmorphismStyle}>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              {assessmentResult.certificate ? (
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                  <Award className="w-10 h-10 text-white" />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                  <AlertTriangle className="w-10 h-10 text-white" />
                </div>
              )}
            </div>
            <CardTitle className="text-2xl">
              {assessmentResult.certificate ? 'Congratulations!' : 'Assessment Complete'}
            </CardTitle>
            <p className="text-muted-foreground">
              {assessmentResult.certificate 
                ? 'You have successfully passed the assessment!'
                : 'Keep practicing to improve your score!'}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-500">
                  {assessmentResult.percentage}%
                </div>
                <p className="text-sm text-muted-foreground">Score</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-500">
                  {assessmentResult.correctAnswers}
                </div>
                <p className="text-sm text-muted-foreground">Correct</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-500">
                  {formatTime(assessmentResult.timeSpent)}
                </div>
                <p className="text-sm text-muted-foreground">Time Spent</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-500">
                  {Object.keys(assessmentResult.categoryScores).length}
                </div>
                <p className="text-sm text-muted-foreground">Categories</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-green-600 mb-2">Strengths</h4>
                <div className="flex flex-wrap gap-2">
                  {assessmentResult.strengths.map((strength, index) => (
                    <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {strength}
                    </Badge>
                  ))}
                </div>
              </div>

              {assessmentResult.weaknesses.length > 0 && (
                <div>
                  <h4 className="font-medium text-red-600 mb-2">Areas for Improvement</h4>
                  <div className="flex flex-wrap gap-2">
                    {assessmentResult.weaknesses.map((weakness, index) => (
                      <Badge key={index} variant="outline" className="border-red-200 text-red-800">
                        <XCircle className="w-3 h-3 mr-1" />
                        {weakness}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-medium text-blue-600 mb-2">Recommendations</h4>
                <ul className="space-y-1">
                  {assessmentResult.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Lightbulb className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex gap-4">
              <Button onClick={resetAssessment} className="flex-1">
                <RotateCcw className="w-4 h-4 mr-2" />
                Take Another Assessment
              </Button>
              <Button variant="outline" className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Download Certificate
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (currentAssessment) {
    const currentQuestion = currentAssessment.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / currentAssessment.questions.length) * 100;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Assessment Header */}
        <Card style={glassmorphismStyle}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {currentAssessment.icon}
                  <h2 className="text-xl font-semibold">{currentAssessment.title}</h2>
                </div>
                <Badge variant="outline">
                  Question {currentQuestionIndex + 1} of {currentAssessment.questions.length}
                </Badge>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span className={`font-mono text-lg ${timeRemaining < 300 ? 'text-red-500' : ''}`}>
                    {formatTime(timeRemaining)}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPaused(!isPaused)}
                >
                  {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                </Button>
                <Button variant="outline" size="sm" onClick={resetAssessment}>
                  <XCircle className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="mt-4">
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Question Card */}
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
                <Badge variant="outline">{currentQuestion.points} points</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4 leading-relaxed">
                {currentQuestion.question}
              </h3>
              
              <RadioGroup
                value={selectedAnswers[currentQuestion.id]?.toString() || ''}
                onValueChange={(value) => selectAnswer(currentQuestion.id, parseInt(value))}
              >
                {currentQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-muted/20 transition-colors">
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {showExplanation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
              >
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Explanation:</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">{currentQuestion.explanation}</p>
              </motion.div>
            )}

            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={previousQuestion}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowExplanation(!showExplanation)}
                  disabled={!selectedAnswers[currentQuestion.id]}
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  {showExplanation ? 'Hide' : 'Show'} Explanation
                </Button>

                <Button
                  onClick={nextQuestion}
                  disabled={selectedAnswers[currentQuestion.id] === undefined}
                >
                  {currentQuestionIndex === currentAssessment.questions.length - 1 ? 'Finish' : 'Next'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card style={glassmorphismStyle}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-6 h-6 text-blue-500" />
            Skill Assessment Center
            <Badge variant="secondary">AI-Powered</Badge>
          </CardTitle>
          <p className="text-muted-foreground">
            Test your technical skills with our comprehensive assessments and get instant feedback
          </p>
        </CardHeader>
      </Card>

      {/* Category Filter */}
      <Card style={glassmorphismStyle}>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Label>Filter by category:</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All categories</SelectItem>
                {SKILL_CATEGORIES.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <category.icon className="w-4 h-4" />
                      {category.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Available Assessments */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAssessments.map((assessment, index) => (
          <motion.div
            key={assessment.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="h-full hover:shadow-lg transition-all cursor-pointer group" style={glassmorphismStyle}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-r from-${assessment.color}-500 to-${assessment.color}-600 flex items-center justify-center`}>
                    {assessment.icon}
                  </div>
                  <Badge variant="outline">
                    {assessment.questions.length} questions
                  </Badge>
                </div>
                <CardTitle className="group-hover:text-blue-500 transition-colors">
                  {assessment.title}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {assessment.description}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {assessment.totalTime} min
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    {assessment.passingScore}% to pass
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Difficulty Distribution:</span>
                  </div>
                  <div className="flex gap-1">
                    {['easy', 'medium', 'hard'].map(difficulty => {
                      const count = assessment.questions.filter(q => q.difficulty === difficulty).length;
                      const percentage = (count / assessment.questions.length) * 100;
                      return (
                        <div
                          key={difficulty}
                          className={`h-2 rounded-full ${
                            difficulty === 'easy' ? 'bg-green-500' :
                            difficulty === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                          title={`${count} ${difficulty} questions`}
                        />
                      );
                    })}
                  </div>
                </div>

                <Button 
                  className="w-full"
                  onClick={() => startAssessment(assessment)}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Assessment
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Statistics */}
      <Card style={glassmorphismStyle}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Assessment Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">
                {availableAssessments.length}
              </div>
              <p className="text-sm text-muted-foreground">Available Assessments</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">
                {availableAssessments.reduce((acc, a) => acc + a.questions.length, 0)}
              </div>
              <p className="text-sm text-muted-foreground">Total Questions</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-500">
                {SKILL_CATEGORIES.length}
              </div>
              <p className="text-sm text-muted-foreground">Skill Categories</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">
                {Math.round(availableAssessments.reduce((acc, a) => acc + a.totalTime, 0) / availableAssessments.length)}
              </div>
              <p className="text-sm text-muted-foreground">Avg. Duration (min)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}