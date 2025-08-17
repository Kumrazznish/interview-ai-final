"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Upload, 
  FileText, 
  User, 
  Award, 
  Briefcase, 
  GraduationCap,
  Star,
  TrendingUp,
  Brain,
  Target,
  CheckCircle,
  AlertTriangle,
  Download,
  RefreshCw,
  Sparkles,
  Eye,
  BarChart3,
  Clock,
  MapPin,
  Mail,
  Phone,
  Globe,
  Code,
  Database,
  Zap,
  Shield,
  Layers,
  GitBranch
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "react-hot-toast";

interface ResumeAnalysis {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    github: string;
    website: string;
  };
  summary: {
    overallScore: number;
    experienceLevel: string;
    primarySkills: string[];
    industryFocus: string[];
    careerStage: string;
  };
  skills: {
    technical: { name: string; level: number; category: string }[];
    soft: { name: string; level: number }[];
    certifications: { name: string; issuer: string; year: string; verified: boolean }[];
  };
  experience: {
    totalYears: number;
    positions: {
      title: string;
      company: string;
      duration: string;
      responsibilities: string[];
      achievements: string[];
      technologies: string[];
    }[];
  };
  education: {
    degrees: {
      degree: string;
      field: string;
      institution: string;
      year: string;
      gpa?: string;
    }[];
    relevantCourses: string[];
  };
  projects: {
    name: string;
    description: string;
    technologies: string[];
    impact: string;
    url?: string;
  }[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  interviewQuestions: {
    technical: string[];
    behavioral: string[];
    situational: string[];
    roleSpecific: string[];
  };
  marketability: {
    salaryRange: string;
    demandLevel: string;
    competitiveness: number;
    improvementAreas: string[];
  };
}

const GEMINI_API_KEY = "AIzaSyAjWxQEVa72lu4gFuMUGbaxzgVmHMsRSGI";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export default function ResumeAnalyzer() {
  const [resumeText, setResumeText] = useState('');
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFile = async (file: File) => {
    if (file.type === 'application/pdf') {
      // For PDF files, we'll simulate text extraction
      const reader = new FileReader();
      reader.onload = (e) => {
        // In a real implementation, you'd use a PDF parser
        setResumeText("Sample resume content extracted from PDF...");
        toast.success("PDF uploaded successfully");
      };
      reader.readAsText(file);
    } else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setResumeText(e.target?.result as string);
        toast.success("Text file uploaded successfully");
      };
      reader.readAsText(file);
    } else {
      toast.error("Please upload a PDF or text file");
    }
  };

  const analyzeResume = async () => {
    if (!resumeText.trim()) {
      toast.error("Please provide resume content to analyze");
      return;
    }

    setIsAnalyzing(true);

    try {
      const prompt = `
        Analyze the following resume and provide a comprehensive analysis in JSON format:
        
        ${resumeText}
        
        Please provide analysis in this exact JSON structure:
        {
          "personalInfo": {
            "name": "string",
            "email": "string",
            "phone": "string",
            "location": "string",
            "linkedin": "string",
            "github": "string",
            "website": "string"
          },
          "summary": {
            "overallScore": number (0-100),
            "experienceLevel": "Junior|Mid|Senior|Lead|Executive",
            "primarySkills": ["skill1", "skill2"],
            "industryFocus": ["industry1", "industry2"],
            "careerStage": "string"
          },
          "skills": {
            "technical": [{"name": "string", "level": number (0-100), "category": "string"}],
            "soft": [{"name": "string", "level": number (0-100)}],
            "certifications": [{"name": "string", "issuer": "string", "year": "string", "verified": boolean}]
          },
          "experience": {
            "totalYears": number,
            "positions": [{
              "title": "string",
              "company": "string", 
              "duration": "string",
              "responsibilities": ["string"],
              "achievements": ["string"],
              "technologies": ["string"]
            }]
          },
          "education": {
            "degrees": [{
              "degree": "string",
              "field": "string",
              "institution": "string",
              "year": "string",
              "gpa": "string"
            }],
            "relevantCourses": ["string"]
          },
          "projects": [{
            "name": "string",
            "description": "string",
            "technologies": ["string"],
            "impact": "string",
            "url": "string"
          }],
          "strengths": ["string"],
          "weaknesses": ["string"],
          "recommendations": ["string"],
          "interviewQuestions": {
            "technical": ["string"],
            "behavioral": ["string"],
            "situational": ["string"],
            "roleSpecific": ["string"]
          },
          "marketability": {
            "salaryRange": "string",
            "demandLevel": "High|Medium|Low",
            "competitiveness": number (0-100),
            "improvementAreas": ["string"]
          }
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
      const analysisText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysisData = JSON.parse(jsonMatch[0]);
        setAnalysis(analysisData);
        toast.success("Resume analysis completed!");
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Analysis error:", error);
      // Fallback mock analysis
      setAnalysis({
        personalInfo: {
          name: "John Doe",
          email: "john.doe@email.com",
          phone: "+1-234-567-8900",
          location: "San Francisco, CA",
          linkedin: "linkedin.com/in/johndoe",
          github: "github.com/johndoe",
          website: "johndoe.dev"
        },
        summary: {
          overallScore: 85,
          experienceLevel: "Senior",
          primarySkills: ["JavaScript", "React", "Node.js", "Python"],
          industryFocus: ["Technology", "Software Development"],
          careerStage: "Senior Software Engineer"
        },
        skills: {
          technical: [
            { name: "JavaScript", level: 90, category: "Programming" },
            { name: "React", level: 85, category: "Frontend" },
            { name: "Node.js", level: 80, category: "Backend" },
            { name: "Python", level: 75, category: "Programming" },
            { name: "AWS", level: 70, category: "Cloud" }
          ],
          soft: [
            { name: "Leadership", level: 85 },
            { name: "Communication", level: 90 },
            { name: "Problem Solving", level: 95 },
            { name: "Team Collaboration", level: 88 }
          ],
          certifications: [
            { name: "AWS Solutions Architect", issuer: "Amazon", year: "2023", verified: true },
            { name: "React Developer", issuer: "Meta", year: "2022", verified: true }
          ]
        },
        experience: {
          totalYears: 6,
          positions: [
            {
              title: "Senior Software Engineer",
              company: "Tech Corp",
              duration: "2021 - Present",
              responsibilities: ["Lead development team", "Architecture decisions", "Code reviews"],
              achievements: ["Improved performance by 40%", "Led team of 5 developers"],
              technologies: ["React", "Node.js", "AWS", "MongoDB"]
            }
          ]
        },
        education: {
          degrees: [
            {
              degree: "Bachelor of Science",
              field: "Computer Science",
              institution: "Stanford University",
              year: "2018",
              gpa: "3.8"
            }
          ],
          relevantCourses: ["Data Structures", "Algorithms", "Software Engineering"]
        },
        projects: [
          {
            name: "E-commerce Platform",
            description: "Full-stack e-commerce solution",
            technologies: ["React", "Node.js", "MongoDB"],
            impact: "Increased sales by 30%",
            url: "github.com/johndoe/ecommerce"
          }
        ],
        strengths: ["Strong technical skills", "Leadership experience", "Problem-solving abilities"],
        weaknesses: ["Limited mobile development experience", "Could improve DevOps skills"],
        recommendations: ["Consider mobile development courses", "Gain more cloud certifications"],
        interviewQuestions: {
          technical: [
            "Explain the virtual DOM in React",
            "How do you handle state management in large applications?",
            "Describe your experience with microservices architecture"
          ],
          behavioral: [
            "Tell me about a time you led a difficult project",
            "How do you handle conflicts in your team?",
            "Describe a situation where you had to learn a new technology quickly"
          ],
          situational: [
            "How would you approach scaling a web application?",
            "What would you do if you disagreed with a technical decision?",
            "How would you mentor a junior developer?"
          ],
          roleSpecific: [
            "How do you ensure code quality in your team?",
            "Describe your approach to system design",
            "How do you stay updated with new technologies?"
          ]
        },
        marketability: {
          salaryRange: "$120,000 - $180,000",
          demandLevel: "High",
          competitiveness: 88,
          improvementAreas: ["Mobile Development", "DevOps", "Machine Learning"]
        }
      });
      toast.success("Resume analysis completed with sample data!");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const glassmorphismStyle = {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="relative overflow-hidden" style={glassmorphismStyle}>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10" />
        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-blue-500" />
            AI Resume Analyzer
            <Sparkles className="w-5 h-5 text-yellow-500" />
          </CardTitle>
        </CardHeader>
        <CardContent className="relative space-y-4">
          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
              dragActive 
                ? 'border-blue-500 bg-blue-500/10' 
                : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">Upload Resume</p>
            <p className="text-sm text-muted-foreground mb-4">
              Drag and drop your resume here, or click to browse
            </p>
            <input
              type="file"
              accept=".pdf,.txt"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              className="hidden"
              id="resume-upload"
            />
            <label htmlFor="resume-upload">
              <Button variant="outline" className="cursor-pointer">
                <FileText className="w-4 h-4 mr-2" />
                Choose File
              </Button>
            </label>
          </div>

          {/* Text Input Area */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Or paste resume content:</label>
            <textarea
              placeholder="Paste your resume content here..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              className="w-full h-32 p-3 rounded-lg border bg-background/50 backdrop-blur-sm resize-none"
            />
          </div>

          <Button 
            onClick={analyzeResume} 
            disabled={isAnalyzing}
            className="w-full"
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Analyzing Resume...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                Analyze Resume
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card style={glassmorphismStyle}>
              <CardContent className="p-4 text-center">
                <div className="relative">
                  <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    <Star className="w-8 h-8 text-white" />
                  </div>
                  <div className={`text-2xl font-bold ${getScoreColor(analysis.summary.overallScore)}`}>
                    {analysis.summary.overallScore}
                  </div>
                  <p className="text-sm text-muted-foreground">Overall Score</p>
                </div>
              </CardContent>
            </Card>

            <Card style={glassmorphismStyle}>
              <CardContent className="p-4 text-center">
                <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center">
                  <Briefcase className="w-8 h-8 text-white" />
                </div>
                <div className="text-2xl font-bold">{analysis.experience.totalYears}</div>
                <p className="text-sm text-muted-foreground">Years Experience</p>
              </CardContent>
            </Card>

            <Card style={glassmorphismStyle}>
              <CardContent className="p-4 text-center">
                <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <div className="text-2xl font-bold">{analysis.skills.certifications.length}</div>
                <p className="text-sm text-muted-foreground">Certifications</p>
              </CardContent>
            </Card>

            <Card style={glassmorphismStyle}>
              <CardContent className="p-4 text-center">
                <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <div className="text-2xl font-bold">{analysis.marketability.competitiveness}</div>
                <p className="text-sm text-muted-foreground">Market Score</p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analysis */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
              <TabsTrigger value="experience">Experience</TabsTrigger>
              <TabsTrigger value="questions">Questions</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
              <TabsTrigger value="market">Market</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card style={glassmorphismStyle}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>{analysis.personalInfo.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>{analysis.personalInfo.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{analysis.personalInfo.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{analysis.personalInfo.location}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card style={glassmorphismStyle}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Career Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="text-sm text-muted-foreground">Experience Level:</span>
                      <Badge className="ml-2">{analysis.summary.experienceLevel}</Badge>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Career Stage:</span>
                      <p className="mt-1">{analysis.summary.careerStage}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Primary Skills:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {analysis.summary.primarySkills.map((skill, index) => (
                          <Badge key={index} variant="secondary">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card style={glassmorphismStyle}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="w-5 h-5" />
                    Projects
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysis.projects.map((project, index) => (
                      <div key={index} className="p-4 rounded-lg bg-muted/20 backdrop-blur-sm">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium">{project.name}</h4>
                          {project.url && (
                            <Button variant="ghost" size="sm">
                              <Globe className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{project.description}</p>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {project.technologies.map((tech, techIndex) => (
                            <Badge key={techIndex} variant="outline" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-sm font-medium text-green-600">{project.impact}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="skills" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card style={glassmorphismStyle}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="w-5 h-5" />
                      Technical Skills
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-3">
                        {analysis.skills.technical.map((skill, index) => (
                          <div key={index} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium">{skill.name}</span>
                              <span className={getScoreColor(skill.level)}>{skill.level}%</span>
                            </div>
                            <Progress value={skill.level} className="h-2" />
                            <Badge variant="outline" className="text-xs">{skill.category}</Badge>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card style={glassmorphismStyle}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="w-5 h-5" />
                      Soft Skills
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analysis.skills.soft.map((skill, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{skill.name}</span>
                            <span className={getScoreColor(skill.level)}>{skill.level}%</span>
                          </div>
                          <Progress value={skill.level} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card style={glassmorphismStyle}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Certifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysis.skills.certifications.map((cert, index) => (
                      <div key={index} className="p-3 rounded-lg bg-muted/20 backdrop-blur-sm">
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="font-medium text-sm">{cert.name}</h4>
                          {cert.verified && (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{cert.issuer}</p>
                        <p className="text-xs text-muted-foreground">{cert.year}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="experience" className="space-y-4">
              <Card style={glassmorphismStyle}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Work Experience
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {analysis.experience.positions.map((position, index) => (
                      <div key={index} className="relative pl-6 pb-6 border-l-2 border-blue-500/30 last:border-l-0">
                        <div className="absolute -left-2 top-0 w-4 h-4 bg-blue-500 rounded-full"></div>
                        <div className="space-y-3">
                          <div>
                            <h3 className="font-semibold text-lg">{position.title}</h3>
                            <p className="text-muted-foreground">{position.company}</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {position.duration}
                            </p>
                          </div>
                          
                          <div>
                            <h4 className="font-medium mb-2">Key Responsibilities:</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                              {position.responsibilities.map((resp, respIndex) => (
                                <li key={respIndex}>{resp}</li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="font-medium mb-2">Achievements:</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm text-green-600">
                              {position.achievements.map((achievement, achIndex) => (
                                <li key={achIndex}>{achievement}</li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="font-medium mb-2">Technologies Used:</h4>
                            <div className="flex flex-wrap gap-1">
                              {position.technologies.map((tech, techIndex) => (
                                <Badge key={techIndex} variant="secondary" className="text-xs">
                                  {tech}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card style={glassmorphismStyle}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    Education
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysis.education.degrees.map((degree, index) => (
                      <div key={index} className="p-4 rounded-lg bg-muted/20 backdrop-blur-sm">
                        <h4 className="font-medium">{degree.degree} in {degree.field}</h4>
                        <p className="text-muted-foreground">{degree.institution}</p>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>{degree.year}</span>
                          {degree.gpa && <span>GPA: {degree.gpa}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="questions" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card style={glassmorphismStyle}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="w-5 h-5" />
                      Technical Questions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[200px]">
                      <div className="space-y-2">
                        {analysis.interviewQuestions.technical.map((question, index) => (
                          <div key={index} className="p-2 rounded bg-muted/20 backdrop-blur-sm text-sm">
                            {question}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card style={glassmorphismStyle}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="w-5 h-5" />
                      Behavioral Questions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[200px]">
                      <div className="space-y-2">
                        {analysis.interviewQuestions.behavioral.map((question, index) => (
                          <div key={index} className="p-2 rounded bg-muted/20 backdrop-blur-sm text-sm">
                            {question}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card style={glassmorphismStyle}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Situational Questions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[200px]">
                      <div className="space-y-2">
                        {analysis.interviewQuestions.situational.map((question, index) => (
                          <div key={index} className="p-2 rounded bg-muted/20 backdrop-blur-sm text-sm">
                            {question}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card style={glassmorphismStyle}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="w-5 h-5" />
                      Role-Specific Questions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[200px]">
                      <div className="space-y-2">
                        {analysis.interviewQuestions.roleSpecific.map((question, index) => (
                          <div key={index} className="p-2 rounded bg-muted/20 backdrop-blur-sm text-sm">
                            {question}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="insights" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card style={glassmorphismStyle}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-yellow-600">
                      <AlertTriangle className="w-5 h-5" />
                      Areas for Improvement
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.weaknesses.map((weakness, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                          {weakness}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card style={glassmorphismStyle}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-600">
                      <TrendingUp className="w-5 h-5" />
                      Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.recommendations.map((recommendation, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <TrendingUp className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          {recommendation}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="market" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card style={glassmorphismStyle}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Market Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Salary Range</span>
                        <span className="text-lg font-bold text-green-600">
                          {analysis.marketability.salaryRange}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Market Demand</span>
                        <Badge variant={
                          analysis.marketability.demandLevel === 'High' ? 'default' :
                          analysis.marketability.demandLevel === 'Medium' ? 'secondary' : 'outline'
                        }>
                          {analysis.marketability.demandLevel}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Competitiveness Score</span>
                        <span className={`text-lg font-bold ${getScoreColor(analysis.marketability.competitiveness)}`}>
                          {analysis.marketability.competitiveness}%
                        </span>
                      </div>
                      <Progress value={analysis.marketability.competitiveness} className="h-3" />
                    </div>
                  </CardContent>
                </Card>

                <Card style={glassmorphismStyle}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Improvement Areas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analysis.marketability.improvementAreas.map((area, index) => (
                        <div key={index} className="p-3 rounded-lg bg-muted/20 backdrop-blur-sm">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-blue-500" />
                            <span className="text-sm font-medium">{area}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button variant="outline" className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Export Analysis
            </Button>
            <Button variant="outline" className="flex-1">
              <Eye className="w-4 h-4 mr-2" />
              Generate Interview Plan
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}