"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, ArrowRight, RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface Question {
  id: string;
  statement: string;
  alternatives: string[];
  correctAnswer: number;
  subject: string;
}

export default function QuestionsPage() {
  const { data: session } = useSession();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await fetch("/api/questions");
      if (response.ok) {
        const data = await response.json();
        setQuestions(data);
      } else {
        toast.error("Failed to load questions");
      }
    } catch (error) {
      toast.error("Error loading questions");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer) {
      toast.error("Please select an answer");
      return;
    }

    setSubmitting(true);
    const currentQuestion = questions[currentQuestionIndex];
    const selectedIndex = parseInt(selectedAnswer);
    const correct = selectedIndex === currentQuestion.correctAnswer;
    
    setIsCorrect(correct);
    setShowResult(true);

    try {
      const response = await fetch("/api/questions/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          selectedAnswer: selectedIndex,
        }),
      });

      if (response.ok) {
        setScore(prev => ({
          correct: prev.correct + (correct ? 1 : 0),
          total: prev.total + 1
        }));
        
        if (correct) {
          toast.success("Correct answer! 🎉");
        } else {
          toast.error("Incorrect answer. Keep trying! 💪");
        }
      } else {
        toast.error("Failed to save answer");
      }
    } catch (error) {
      toast.error("Error submitting answer");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer("");
      setShowResult(false);
    } else {
      setCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer("");
    setShowResult(false);
    setCompleted(false);
    setScore({ correct: 0, total: 0 });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading questions...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">No Questions Available</h2>
        <p className="text-gray-600 mb-6">
          There are no questions in the database yet. Please contact an administrator to add questions.
        </p>
        <Button onClick={() => window.history.back()}>
          Go Back to Dashboard
        </Button>
      </div>
    );
  }

  if (completed) {
    const percentage = Math.round((score.correct / score.total) * 100);
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Quiz Completed! 🎉</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="text-6xl font-bold text-blue-600">
              {percentage}%
            </div>
            <div className="text-lg">
              You got <span className="font-bold text-green-600">{score.correct}</span> out of{" "}
              <span className="font-bold">{score.total}</span> questions correct!
            </div>
            <div className="flex gap-4 justify-center">
              <Button onClick={handleRestart} variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button onClick={() => window.history.back()}>
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Solve Questions</h1>
        <div className="text-sm text-gray-600">
          Question {currentQuestionIndex + 1} of {questions.length}
        </div>
      </div>

      <Progress value={progress} className="w-full" />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {currentQuestion.subject}
            </CardTitle>
            <div className="text-sm text-gray-500">
              Score: {score.correct}/{score.total}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-lg font-medium leading-relaxed">
            {currentQuestion.statement}
          </div>

          {!showResult ? (
            <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
              <div className="space-y-3">
                {currentQuestion.alternatives.map((alternative, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label 
                      htmlFor={`option-${index}`} 
                      className="flex-1 cursor-pointer p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-medium mr-2">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      {alternative}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          ) : (
            <div className="space-y-4">
              <div className={`flex items-center gap-2 p-4 rounded-lg ${
                isCorrect ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}>
                {isCorrect ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <XCircle className="w-5 h-5" />
                )}
                <span className="font-medium">
                  {isCorrect ? 'Correct!' : 'Incorrect'}
                </span>
              </div>

              <div className="space-y-2">
                {currentQuestion.alternatives.map((alternative, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      index === currentQuestion.correctAnswer
                        ? 'bg-green-50 border-green-200'
                        : index === parseInt(selectedAnswer)
                        ? 'bg-red-50 border-red-200'
                        : 'bg-gray-50'
                    }`}
                  >
                    <span className="font-medium mr-2">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    {alternative}
                    {index === currentQuestion.correctAnswer && (
                      <CheckCircle className="w-4 h-4 text-green-600 inline ml-2" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => window.history.back()}
            >
              Back to Dashboard
            </Button>
            
            {!showResult ? (
              <Button
                onClick={handleSubmitAnswer}
                disabled={!selectedAnswer || submitting}
              >
                {submitting ? "Submitting..." : "Submit Answer"}
              </Button>
            ) : (
              <Button onClick={handleNextQuestion}>
                {currentQuestionIndex < questions.length - 1 ? (
                  <>
                    Next Question
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  "Finish Quiz"
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
