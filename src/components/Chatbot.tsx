"use client";

import React, { useState } from "react";
import { Loader2, Bot, ChevronDown, ChevronUp, Search } from "lucide-react";
import { useTheme } from "next-themes";

const GEMINI_API_KEY = "AIzaSyAjWxQEVa72lu4gFuMUGbaxzgVmHMsRSGI";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const ROLES = ["HR", "Employee", "Head"];
const JOB_TYPES = ["Full Stack Developer", "Backend Developer", "Frontend Developer", "Data Scientist"];
const EXPERIENCE_LEVELS = ["Fresher", "1-3 Years", "3-5 Years", "5+ Years"];
const DIFFICULTY_LEVELS = ["Simple", "Medium", "Hard"];
const LANGUAGES = [
  { code: "English", name: "English" },
  { code: "urdu", name: "Urdu" },
  { code: "Spanish", name: "Spanish" },
  { code: "French", name: "French" },
  { code: "German", name: "German" },
  { code: "Chinese", name: "Chinese" },
  { code: "Arabic", name: "Arabic" },
];

interface Message {
  text: string;
  isBot: boolean;
  isAnswerVisible?: boolean;
  answer?: string;
}

const Chatbot: React.FC = () => {
  const { theme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([{ text: "Select parameters to generate questions!", isBot: true }]);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedJobType, setSelectedJobType] = useState("");
  const [selectedExperience, setSelectedExperience] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [skills, setSkills] = useState("");
  const [numQuestions, setNumQuestions] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userQuery, setUserQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("en"); // Default language is English

  const handleGenerateQuestions = async () => {
    if (!selectedRole || !selectedJobType || !selectedExperience || !skills || !selectedDifficulty) return;

    setLoading(true);
    setMessages((prev) => [...prev, { text: `Generating ${numQuestions} ${selectedDifficulty.toLowerCase()} level question(s)...`, isBot: true }]);

    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Generate ${numQuestions} ${selectedDifficulty.toLowerCase()} level interview questions for ${selectedJobType} (${selectedExperience}) requiring ${skills}. 
              Format each question starting with 'Q1.', 'Q2.', etc. Return only the questions without any additional text. Respond in ${selectedLanguage}.`
            }]
          }]
        }),
      });

      const data = await response.json();
      const rawQuestions = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Failed to generate questions";
      
      const questions = rawQuestions
        .split('\n')
        .filter((line: string) => line.match(/^Q\d+\./))          
        .map((q:string, index: number) => ({
          text: q.trim(),
          isBot: true,
          isAnswerVisible: false,
          answer: ""
      }));

      setMessages(prev => [...prev, ...questions]);
    } catch (error) {
      console.error("API Error:", error);
      setMessages(prev => [...prev, { text: "Error generating questions", isBot: true }]);
    } finally {
      setLoading(false);
    }
  };

  const handleShowAnswer = async (index: number) => {
    const message = messages[index];
    if (!message.answer) {
      setLoading(true);
      try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Provide a concise answer to this question: ${message.text}. Respond in ${selectedLanguage}.`
              }]
            }]
          }),
        });

        const data = await response.json();
        const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Couldn't generate answer";

        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[index].answer = answer;
          newMessages[index].isAnswerVisible = true;
          return newMessages;
        });
      } catch (error) {
        console.error("API Error:", error);
        setMessages(prev => [...prev, { text: "Error generating answer", isBot: true }]);
      } finally {
        setLoading(false);
      }
    } else {
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[index].isAnswerVisible = !newMessages[index].isAnswerVisible;
        return newMessages;
      });
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleUserQuery = async () => {
    if (!userQuery.trim()) return;

    setLoading(true);
    setMessages(prev => [...prev, { text: userQuery, isBot: false }]);

    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${userQuery}. Respond in ${selectedLanguage}.`
            }]
          }]
        }),
      });

      const data = await response.json();
      const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Couldn't generate answer";

      setMessages(prev => [...prev, { text: answer, isBot: true }]);
    } catch (error) {
      console.error("API Error:", error);
      setMessages(prev => [...prev, { text: "Error generating response", isBot: true }]);
    } finally {
      setLoading(false);
      setUserQuery("");
    }
  };

  const filteredMessages = messages.filter(message =>
    message.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Theme classes
  const containerClasses = `flex rounded-lg shadow-xl p-6 mx-auto max-w-7xl ${
    theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"
  } transition-colors duration-300`;
  
  const leftPanelClasses = `w-1/3 p-6 space-y-4 rounded-l-lg ${
    theme === "dark" ? "bg-gray-800" : "bg-gray-50"
  } transition-colors duration-300`;

  const chatWindowClasses = `p-4 h-[650px] overflow-y-auto rounded-lg ${
    theme === "dark" ? "bg-gray-800" : "bg-white border"
  } transition-colors duration-300`;

  return (
    <div className={containerClasses}>
      {/* Controls Panel */}
      <div className={leftPanelClasses}>
        <h1 className="text-2xl font-bold mb-4">🤖  Generate Questions</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block mb-2 font-medium">Role</label>
            <select 
              className="w-full p-2 rounded-lg border hover:bg-opacity-10 focus:ring-2 focus:ring-blue-500 transition-all duration-300"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="">Select Role</option>
              {ROLES.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 font-medium">Job Type</label>
            <select
              className="w-full p-2 rounded-lg border hover:bg-opacity-10 focus:ring-2 focus:ring-blue-500 transition-all duration-300"
              value={selectedJobType}
              onChange={(e) => setSelectedJobType(e.target.value)}
            >
              <option value="">Select Job Type</option>
              {JOB_TYPES.map(job => (
                <option key={job} value={job}>{job}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 font-medium">Experience</label>
            <select
              className="w-full p-2 rounded-lg border  hover:bg-opacity-10 focus:ring-2 focus:ring-blue-500 transition-all duration-300"
              value={selectedExperience}
              onChange={(e) => setSelectedExperience(e.target.value)}
            >
              <option value="">Select Experience</option>
              {EXPERIENCE_LEVELS.map(exp => (
                <option key={exp} value={exp}>{exp}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 font-medium">Difficulty</label>
            <select
              className="w-full p-2 rounded-lg border  hover:bg-opacity-10 focus:ring-2 focus:ring-blue-500 transition-all duration-300"
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
            >
              <option value="">Select Difficulty</option>
              {DIFFICULTY_LEVELS.map(difficulty => (
                <option key={difficulty} value={difficulty}>{difficulty}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 font-medium">Skills</label>
            <input
              type="text"
              className="w-full p-2 rounded-lg border  hover:bg-opacity-10 focus:ring-2 focus:ring-blue-500 transition-all duration-300"
              placeholder="Enter skills (comma separated)"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Questions</label>
            <input
              type="number"
              min="1"
              max="10"
              className="w-full p-2 rounded-lg border hover:bg-opacity-10 focus:ring-2 focus:ring-blue-500 transition-all duration-300"
              value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Language</label>
            <select
              className="w-full p-2 rounded-lg border hover:bg-opacity-10 focus:ring-2 focus:ring-blue-500 transition-all duration-300"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
            >
              {LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleGenerateQuestions}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin mx-auto" /> : "Generate Questions"}
          </button>
        </div>
      </div>

      {/* Chat Panel */}
      <div className="w-2/3 p-6">
        <div className="relative mb-4">
          <input
            type="text"
            className="w-full p-2 pl-10 rounded-lg border hover:bg-opacity-10 focus:ring-2 focus:ring-blue-500 transition-all duration-300"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={handleSearch}
          />
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        </div>
        <div className={chatWindowClasses}>
          {filteredMessages.map((msg, index) => (
            <div key={index} className={`group flex gap-3 mb-4 ${msg.isBot ? "" : "justify-end"}`}>
              {msg.isBot && <Bot className="h-6 w-6 mt-1 text-blue-500" />}
              
              <div className={`max-w-[85%] rounded-xl p-4 transition-all duration-300 ${
                msg.isBot ? 
                (theme === "dark" ? "bg-gray-700 hover:bg-gray-600" : "bg-blue-50 hover:bg-blue-100") : 
                (theme === "dark" ? "bg-gray-600 hover:bg-gray-500" : "bg-gray-100 hover:bg-gray-200")
              }`}>
                <div className="font-medium mb-1.5">{msg.text}</div>
                
                {msg.isBot && msg.text.startsWith("Q") && (
                  <div className="mt-3">
                    <button
                      onClick={() => handleShowAnswer(index)}
                      className="flex items-center text-sm text-blue-500 hover:text-blue-600 font-medium transition-colors duration-300"
                    >
                      {msg.isAnswerVisible ? (
                        <>
                          <ChevronUp className="w-4 h-4 mr-1" />
                          Hide Answer
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4 mr-1" />
                          Show Answer
                        </>
                      )}
                    </button>
                    
                    {msg.isAnswerVisible && msg.answer && (
                      <div className={`mt-2 p-3 rounded-lg transition-all duration-300 ${
                        theme === "dark" ? "bg-gray-600" : "bg-gray-100"
                      }`}>
                        <p className="whitespace-pre-line">{msg.answer}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="relative mt-4">
          <input
            type="text"
            className="w-full p-2 pl-10 rounded-lg border hover:bg-opacity-10 focus:ring-2 focus:ring-blue-500 transition-all duration-300"
            placeholder="Ask anything..."
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleUserQuery()}
          />
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
