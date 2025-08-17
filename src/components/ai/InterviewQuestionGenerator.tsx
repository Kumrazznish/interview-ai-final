"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Brain, 
  Target, 
  Code, 
  Users, 
  Lightbulb,
  RefreshCw,
  Copy,
  Download,
  Star,
  Clock,
  Filter,
  Shuffle,
  BookOpen,
  MessageSquare,
  Zap,
  Award,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Settings
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  type: 'technical' | 'behavioral' | 'situational' | 'cultural' | 'leadership';
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  expectedAnswer?: string;
  followUpQuestions?: string[];
  evaluationCriteria?: string[];
  timeLimit?: number;
  tags: string[];
}

interface QuestionSet {
  title: string;
  description: string;
  questions: Question[];
  totalTime: number;
  difficulty: string;
}

const GEMINI_API_KEY = "AIzaSyAjWxQEVa72lu4gFuMUGbaxzgVmHMsRSGI";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const QUESTION_TYPES = [
  { id: 'technical', label: 'Technical', icon: Code, color: 'blue' },
  { id: 'behavioral', label: 'Behavioral', icon: Users, color: 'green' },
  { id: 'situational', label: 'Situational', icon: Target, color: 'purple' },
  { id: 'cultural', label: 'Cultural Fit', icon: MessageSquare, color: 'orange' },
  { id: 'leadership', label: 'Leadership', icon: Award, color: 'red' }
];

const DIFFICULTY_LEVELS = [
  { id: 'easy', label: 'Easy', color: 'green' },
  { id: 'medium', label: 'Medium', color: 'yellow' },
  { id: 'hard', label: 'Hard', color: 'red' }
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
  'System Administrator',
  'Mobile Developer',
  'Machine Learning Engineer'
];

const EXPERIENCE_LEVELS = [
  'Entry Level (0-2 years)',
  'Mid Level (3-5 years)',
  'Senior Level (6-10 years)',
  'Lead Level (10+ years)',
  'Executive Level'
];

export default function InterviewQuestionGenerator() {
  const [questionSets, setQuestionSets] = useState<QuestionSet[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedExperience, setSelectedExperience] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['technical', 'behavioral']);
  const [difficulty, setDifficulty] = useState(['medium']);
  const [questionCount, setQuestionCount] = useState([10]);
  const [timeLimit, setTimeLimit] = useState([60]);

  const glassmorphismStyle = {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  };

  const generateQuestions = async () => {
    if (!selectedRole || !selectedExperience) {
      toast.error("Please select job role and experience level");
      return;
    }

    setIsGenerating(true);

    try {
      const prompt = `
        Generate ${questionCount[0]} interview questions for a ${selectedRole} position with ${selectedExperience} experience level.
        
        Question types to include: ${selectedTypes.join(', ')}
        Difficulty level: ${difficulty[0]}
        Interview duration: ${timeLimit[0]} minutes
        
        Please provide the response in this exact JSON format:
        {
          "title": "Interview Questions for ${selectedRole}",
          "description": "Comprehensive interview questions tailored for ${selectedExperience} ${selectedRole}",
          "questions": [
            {
              "id": "unique_id",
              "question": "The actual question",
              "type": "technical|behavioral|situational|cultural|leadership",
              "difficulty": "easy|medium|hard",
              "category": "specific category like 'JavaScript', 'Problem Solving', etc.",
              "expectedAnswer": "Brief expected answer or key points",
              "followUpQuestions": ["follow up question 1", "follow up question 2"],
              "evaluationCriteria": ["criteria 1", "criteria 2", "criteria 3"],
              "timeLimit": number_in_minutes,
              "tags": ["tag1", "tag2", "tag3"]
            }
          ],
          "totalTime": ${timeLimit[0]},
          "difficulty": "${difficulty[0]}"
        }
      `;

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        }),
      });

      const data = await response.json();
      const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const questionSet = JSON.parse(jsonMatch[0]);
        setQuestionSets(prev => [questionSet, ...prev]);
        toast.success("Interview questions generated successfully!");
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Generation error:", error);
      // Fallback mock data
      const mockQuestionSet: QuestionSet = {
        title: `Interview Questions for ${selectedRole}`,
        description: `Comprehensive interview questions tailored for ${selectedExperience} ${selectedRole}`,
        totalTime: timeLimit[0],
        difficulty: difficulty[0],
        questions: [
          {
            id: '1',
            question: 'Explain the concept of closures in JavaScript and provide a practical example.',
            type: 'technical',
            difficulty: 'medium',
            category: 'JavaScript',
            expectedAnswer: 'A closure is a function that has access to variables in its outer scope even after the outer function has returned.',
            followUpQuestions: [
              'How do closures affect memory management?',
              'Can you show an example of a closure causing a memory leak?'
            ],
            evaluationCriteria: [
              'Understanding of scope and lexical environment',
              'Ability to provide clear examples',
              'Knowledge of practical applications'
            ],
            timeLimit: 10,
            tags: ['JavaScript', 'Functions', 'Scope']
          },
          {
            id: '2',
            question: 'Tell me about a time when you had to work with a difficult team member.',
            type: 'behavioral',
            difficulty: 'medium',
            category: 'Team Collaboration',
            expectedAnswer: 'Should demonstrate conflict resolution skills and professional communication.',
            followUpQuestions: [
              'What would you do differently in that situation?',
              'How did you maintain team productivity?'
            ],
            evaluationCriteria: [
              'Communication skills',
              'Conflict resolution ability',
              'Professional maturity'
            ],
            timeLimit: 8,
            tags: ['Teamwork', 'Communication', 'Conflict Resolution']
          },
          {
            id: '3',
            question: 'How would you approach debugging a performance issue in a web application?',
            type: 'situational',
            difficulty: 'hard',
            category: 'Problem Solving',
            expectedAnswer: 'Systematic approach including profiling, monitoring, and optimization strategies.',
            followUpQuestions: [
              'What tools would you use for performance monitoring?',
              'How would you prioritize different performance optimizations?'
            ],
            evaluationCriteria: [
              'Systematic problem-solving approach',
              'Knowledge of debugging tools',
              'Understanding of performance optimization'
            ],
            timeLimit: 15,
            tags: ['Performance', 'Debugging', 'Web Development']
          }
        ]
      };
      setQuestionSets(prev => [mockQuestionSet, ...prev]);
      toast.success("Sample interview questions generated!");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyQuestion = (question: string) => {
    navigator.clipboard.writeText(question);
    toast.success("Question copied to clipboard");
  };

  const exportQuestionSet = (questionSet: QuestionSet) => {
    const content = JSON.stringify(questionSet, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${questionSet.title.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Question set exported successfully");
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'hard': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    const typeConfig = QUESTION_TYPES.find(t => t.id === type);
    return typeConfig ? <typeConfig.icon className="w-4 h-4" /> : <Brain className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Configuration Panel */}
      <Card style={glassmorphismStyle}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-500" />
            AI Interview Question Generator
            <Zap className="w-5 h-5 text-yellow-500" />
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
              <Label>Experience Level</Label>
              <Select value={selectedExperience} onValueChange={setSelectedExperience}>
                <SelectTrigger>
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent>
                  {EXPERIENCE_LEVELS.map(level => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Question Types</Label>
              <div className="flex flex-wrap gap-2">
                {QUESTION_TYPES.map(type => (
                  <Button
                    key={type.id}
                    variant={selectedTypes.includes(type.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setSelectedTypes(prev => 
                        prev.includes(type.id) 
                          ? prev.filter(t => t !== type.id)
                          : [...prev, type.id]
                      );
                    }}
                    className="flex items-center gap-2"
                  >
                    <type.icon className="w-4 h-4" />
                    {type.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Difficulty: {difficulty[0]}</Label>
                <Select value={difficulty[0]} onValueChange={(value) => setDifficulty([value])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTY_LEVELS.map(level => (
                      <SelectItem key={level.id} value={level.id}>{level.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Number of Questions: {questionCount[0]}</Label>
                <Slider
                  value={questionCount}
                  onValueChange={setQuestionCount}
                  max={20}
                  min={5}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label>Interview Duration: {timeLimit[0]} min</Label>
                <Slider
                  value={timeLimit}
                  onValueChange={setTimeLimit}
                  max={120}
                  min={30}
                  step={15}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <Button 
            onClick={generateQuestions} 
            disabled={isGenerating}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating Questions...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                Generate Interview Questions
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Question Sets */}
      {questionSets.length > 0 && (
        <div className="space-y-6">
          {questionSets.map((questionSet, setIndex) => (
            <motion.div
              key={setIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: setIndex * 0.1 }}
            >
              <Card style={glassmorphismStyle}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5" />
                        {questionSet.title}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {questionSet.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        <Clock className="w-3 h-3 mr-1" />
                        {questionSet.totalTime} min
                      </Badge>
                      <Badge variant="secondary">
                        {questionSet.questions.length} questions
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportQuestionSet(questionSet)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="questions" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="questions">Questions</TabsTrigger>
                      <TabsTrigger value="analytics">Analytics</TabsTrigger>
                      <TabsTrigger value="evaluation">Evaluation</TabsTrigger>
                    </TabsList>

                    <TabsContent value="questions" className="space-y-4">
                      <ScrollArea className="h-[600px]">
                        <div className="space-y-4">
                          {questionSet.questions.map((question, index) => (
                            <motion.div
                              key={question.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="p-4 rounded-lg bg-muted/20 backdrop-blur-sm border"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-muted-foreground">
                                    Q{index + 1}
                                  </span>
                                  {getTypeIcon(question.type)}
                                  <Badge variant="outline" className="text-xs">
                                    {question.type}
                                  </Badge>
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs ${getDifficultyColor(question.difficulty)}`}
                                  >
                                    {question.difficulty}
                                  </Badge>
                                  <Badge variant="secondary" className="text-xs">
                                    {question.category}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyQuestion(question.question)}
                                  >
                                    <Copy className="w-4 h-4" />
                                  </Button>
                                  <span className="text-xs text-muted-foreground">
                                    {question.timeLimit} min
                                  </span>
                                </div>
                              </div>

                              <h4 className="font-medium mb-3 text-lg leading-relaxed">
                                {question.question}
                              </h4>

                              {question.expectedAnswer && (
                                <div className="mb-3">
                                  <h5 className="text-sm font-medium text-green-600 mb-1">
                                    Expected Answer:
                                  </h5>
                                  <p className="text-sm text-muted-foreground bg-green-50 dark:bg-green-900/20 p-2 rounded">
                                    {question.expectedAnswer}
                                  </p>
                                </div>
                              )}

                              {question.followUpQuestions && question.followUpQuestions.length > 0 && (
                                <div className="mb-3">
                                  <h5 className="text-sm font-medium text-blue-600 mb-2">
                                    Follow-up Questions:
                                  </h5>
                                  <ul className="space-y-1">
                                    {question.followUpQuestions.map((followUp, followUpIndex) => (
                                      <li key={followUpIndex} className="text-sm text-muted-foreground flex items-start gap-2">
                                        <span className="text-blue-500 mt-1">•</span>
                                        {followUp}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {question.evaluationCriteria && question.evaluationCriteria.length > 0 && (
                                <div className="mb-3">
                                  <h5 className="text-sm font-medium text-purple-600 mb-2">
                                    Evaluation Criteria:
                                  </h5>
                                  <div className="flex flex-wrap gap-1">
                                    {question.evaluationCriteria.map((criteria, criteriaIndex) => (
                                      <Badge key={criteriaIndex} variant="outline" className="text-xs">
                                        {criteria}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div className="flex flex-wrap gap-1">
                                {question.tags.map((tag, tagIndex) => (
                                  <Badge key={tagIndex} variant="secondary" className="text-xs">
                                    #{tag}
                                  </Badge>
                                ))}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </ScrollArea>
                    </TabsContent>

                    <TabsContent value="analytics" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                          <CardContent className="p-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-500">
                                {questionSet.questions.filter(q => q.type === 'technical').length}
                              </div>
                              <p className="text-sm text-muted-foreground">Technical Questions</p>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="p-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-500">
                                {questionSet.questions.filter(q => q.type === 'behavioral').length}
                              </div>
                              <p className="text-sm text-muted-foreground">Behavioral Questions</p>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="p-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-purple-500">
                                {questionSet.questions.filter(q => q.difficulty === 'hard').length}
                              </div>
                              <p className="text-sm text-muted-foreground">Hard Questions</p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Question Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {QUESTION_TYPES.map(type => {
                              const count = questionSet.questions.filter(q => q.type === type.id).length;
                              const percentage = (count / questionSet.questions.length) * 100;
                              return (
                                <div key={type.id} className="space-y-1">
                                  <div className="flex justify-between text-sm">
                                    <span className="flex items-center gap-2">
                                      <type.icon className="w-4 h-4" />
                                      {type.label}
                                    </span>
                                    <span>{count} ({percentage.toFixed(0)}%)</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className={`bg-${type.color}-500 h-2 rounded-full`}
                                      style={{ width: `${percentage}%` }}
                                    ></div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="evaluation" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            Evaluation Guidelines
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium text-green-600 mb-2">Scoring Criteria</h4>
                              <ul className="space-y-1 text-sm">
                                <li className="flex items-center gap-2">
                                  <Star className="w-3 h-3 text-yellow-500" />
                                  Excellent (4-5): Comprehensive, insightful answers
                                </li>
                                <li className="flex items-center gap-2">
                                  <Star className="w-3 h-3 text-blue-500" />
                                  Good (3-4): Solid understanding, minor gaps
                                </li>
                                <li className="flex items-center gap-2">
                                  <Star className="w-3 h-3 text-orange-500" />
                                  Average (2-3): Basic knowledge, needs improvement
                                </li>
                                <li className="flex items-center gap-2">
                                  <Star className="w-3 h-3 text-red-500" />
                                  Poor (1-2): Limited understanding, major gaps
                                </li>
                              </ul>
                            </div>

                            <div>
                              <h4 className="font-medium text-blue-600 mb-2">Key Evaluation Areas</h4>
                              <ul className="space-y-1 text-sm">
                                <li className="flex items-center gap-2">
                                  <CheckCircle className="w-3 h-3 text-green-500" />
                                  Technical competency and problem-solving
                                </li>
                                <li className="flex items-center gap-2">
                                  <CheckCircle className="w-3 h-3 text-green-500" />
                                  Communication and articulation
                                </li>
                                <li className="flex items-center gap-2">
                                  <CheckCircle className="w-3 h-3 text-green-500" />
                                  Cultural fit and team collaboration
                                </li>
                                <li className="flex items-center gap-2">
                                  <CheckCircle className="w-3 h-3 text-green-500" />
                                  Leadership potential and growth mindset
                                </li>
                              </ul>
                            </div>
                          </div>

                          <Separator />

                          <div>
                            <h4 className="font-medium text-purple-600 mb-2">Interview Tips</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <h5 className="font-medium mb-1">For Interviewers:</h5>
                                <ul className="space-y-1 text-muted-foreground">
                                  <li>• Create a comfortable environment</li>
                                  <li>• Allow thinking time for complex questions</li>
                                  <li>• Ask follow-up questions for clarity</li>
                                  <li>• Take detailed notes during the interview</li>
                                </ul>
                              </div>
                              <div>
                                <h5 className="font-medium mb-1">Red Flags to Watch:</h5>
                                <ul className="space-y-1 text-muted-foreground">
                                  <li>• Inability to explain basic concepts</li>
                                  <li>• Poor communication skills</li>
                                  <li>• Negative attitude towards teamwork</li>
                                  <li>• Lack of curiosity or learning mindset</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}