"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RotateCcw, ChevronLeft, ChevronRight, BookOpen, Filter } from "lucide-react";
import { toast } from "sonner";

interface FlashcardData {
  id: string;
  question: {
    id: string;
    statement: string;
    alternatives: string[];
    correctAnswer: number;
    subject: string;
  };
  selectedAnswer: number;
  isCorrect: boolean;
  timestamp: string;
}

export default function FlashcardsPage() {
  const { data: session } = useSession();
  const [flashcards, setFlashcards] = useState<FlashcardData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [correctnessFilter, setCorrectnessFilter] = useState<string>("all");
  const [filteredCards, setFilteredCards] = useState<FlashcardData[]>([]);

  useEffect(() => {
    fetchFlashcards();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [flashcards, subjectFilter, correctnessFilter]);

  const fetchFlashcards = async () => {
    try {
      const response = await fetch("/api/flashcards");
      if (response.ok) {
        const data = await response.json();
        setFlashcards(data);
      } else {
        toast.error("Failed to load flashcards");
      }
    } catch (error) {
      toast.error("Error loading flashcards");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = flashcards;

    if (subjectFilter !== "all") {
      filtered = filtered.filter(card => card.question.subject === subjectFilter);
    }

    if (correctnessFilter !== "all") {
      const isCorrect = correctnessFilter === "correct";
      filtered = filtered.filter(card => card.isCorrect === isCorrect);
    }

    setFilteredCards(filtered);
    setCurrentIndex(0);
    setShowAnswer(false);
  };

  const handleNext = () => {
    if (currentIndex < filteredCards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowAnswer(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setShowAnswer(false);
    }
  };

  const handleFlip = () => {
    setShowAnswer(!showAnswer);
  };

  const resetFilters = () => {
    setSubjectFilter("all");
    setCorrectnessFilter("all");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading flashcards...</p>
        </div>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-4">No Flashcards Available</h2>
        <p className="text-gray-600 mb-6">
          You haven't answered any questions yet. Start solving questions to create flashcards for review.
        </p>
        <Button onClick={() => window.location.href = "/dashboard/questions"}>
          Start Solving Questions
        </Button>
      </div>
    );
  }

  if (filteredCards.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Review Flashcards</h1>
          <Button onClick={resetFilters} variant="outline">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Filters
          </Button>
        </div>

        <div className="text-center py-12">
          <Filter className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-4">No Flashcards Match Your Filters</h2>
          <p className="text-gray-600 mb-6">
            Try adjusting your filters or reset them to see all flashcards.
          </p>
        </div>
      </div>
    );
  }

  const currentCard = filteredCards[currentIndex];
  const subjects = [...new Set(flashcards.map(card => card.question.subject))];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Review Flashcards</h1>
        <div className="text-sm text-gray-600">
          {currentIndex + 1} of {filteredCards.length} cards
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Filters:</span>
        </div>
        
        <Select value={subjectFilter} onValueChange={setSubjectFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Subjects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {subjects.map(subject => (
              <SelectItem key={subject} value={subject}>
                {subject}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={correctnessFilter} onValueChange={setCorrectnessFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Answers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Answers</SelectItem>
            <SelectItem value="correct">Correct Only</SelectItem>
            <SelectItem value="incorrect">Incorrect Only</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={resetFilters} variant="outline" size="sm">
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>

      {/* Flashcard */}
      <div className="relative">
        <Card className="min-h-[400px] cursor-pointer transition-all duration-300 hover:shadow-lg" onClick={handleFlip}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {currentCard.question.subject}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant={currentCard.isCorrect ? "default" : "destructive"}>
                  {currentCard.isCorrect ? "Correct" : "Incorrect"}
                </Badge>
                <Badge variant="outline">
                  {new Date(currentCard.timestamp).toLocaleDateString()}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {!showAnswer ? (
              <div className="text-center space-y-6">
                <div className="text-lg font-medium leading-relaxed">
                  {currentCard.question.statement}
                </div>
                <div className="text-sm text-gray-500">
                  Click to reveal answer
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-lg font-medium leading-relaxed mb-6">
                  {currentCard.question.statement}
                </div>
                
                <div className="space-y-2">
                  {currentCard.question.alternatives.map((alternative, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${
                        index === currentCard.question.correctAnswer
                          ? 'bg-green-50 border-green-200 text-green-800'
                          : index === currentCard.selectedAnswer && !currentCard.isCorrect
                          ? 'bg-red-50 border-red-200 text-red-800'
                          : 'bg-gray-50'
                      }`}
                    >
                      <span className="font-medium mr-2">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      {alternative}
                      {index === currentCard.question.correctAnswer && (
                        <span className="ml-2 text-green-600 font-medium">✓ Correct Answer</span>
                      )}
                      {index === currentCard.selectedAnswer && index !== currentCard.question.correctAnswer && (
                        <span className="ml-2 text-red-600 font-medium">✗ Your Answer</span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="text-sm text-gray-500 text-center">
                  Click to hide answer
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          variant="outline"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        <div className="flex gap-2">
          <Button onClick={handleFlip} variant="outline">
            {showAnswer ? "Hide Answer" : "Show Answer"}
          </Button>
          <Button onClick={() => window.history.back()} variant="outline">
            Back to Dashboard
          </Button>
        </div>

        <Button
          onClick={handleNext}
          disabled={currentIndex === filteredCards.length - 1}
          variant="outline"
        >
          Next
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Progress indicator */}
      <div className="flex justify-center">
        <div className="flex gap-1">
          {filteredCards.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
