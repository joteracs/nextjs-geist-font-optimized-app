"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

interface Question {
  id: string;
  statement: string;
  alternatives: string[];
  correctAnswer: number;
  subject: string;
  createdAt: string;
  user: {
    username: string;
  };
}

export default function AdminQuestionsPage() {
  const { data: session } = useSession();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [formData, setFormData] = useState({
    statement: "",
    alternatives: ["", "", "", ""],
    correctAnswer: 0,
    subject: "",
  });

  useEffect(() => {
    if (session?.user?.role !== "ADMIN") {
      window.location.href = "/dashboard";
      return;
    }
    fetchQuestions();
  }, [session]);

  const fetchQuestions = async () => {
    try {
      const response = await fetch("/api/admin/questions");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.statement || !formData.subject) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.alternatives.some(alt => !alt.trim())) {
      toast.error("Please fill in all alternatives");
      return;
    }

    try {
      const url = editingQuestion 
        ? `/api/admin/questions/${editingQuestion.id}`
        : "/api/admin/questions";
      
      const method = editingQuestion ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(editingQuestion ? "Question updated!" : "Question created!");
        setIsDialogOpen(false);
        resetForm();
        fetchQuestions();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to save question");
      }
    } catch (error) {
      toast.error("Error saving question");
    }
  };

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    setFormData({
      statement: question.statement,
      alternatives: question.alternatives,
      correctAnswer: question.correctAnswer,
      subject: question.subject,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (questionId: string) => {
    try {
      const response = await fetch(`/api/admin/questions/${questionId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Question deleted!");
        fetchQuestions();
      } else {
        toast.error("Failed to delete question");
      }
    } catch (error) {
      toast.error("Error deleting question");
    }
  };

  const resetForm = () => {
    setFormData({
      statement: "",
      alternatives: ["", "", "", ""],
      correctAnswer: 0,
      subject: "",
    });
    setEditingQuestion(null);
  };

  const filteredQuestions = questions.filter(question =>
    question.statement.toLowerCase().includes(searchTerm.toLowerCase()) ||
    question.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (session?.user?.role !== "ADMIN") {
    return <div>Access denied</div>;
  }

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manage Questions</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Add Question
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingQuestion ? "Edit Question" : "Add New Question"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g., Mathematics, Science, History"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="statement">Question Statement *</Label>
                <Textarea
                  id="statement"
                  value={formData.statement}
                  onChange={(e) => setFormData({ ...formData, statement: e.target.value })}
                  placeholder="Enter the question..."
                  rows={3}
                  required
                />
              </div>

              <div>
                <Label>Alternatives *</Label>
                <div className="space-y-2">
                  {formData.alternatives.map((alt, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="font-medium min-w-[20px]">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      <Input
                        value={alt}
                        onChange={(e) => {
                          const newAlts = [...formData.alternatives];
                          newAlts[index] = e.target.value;
                          setFormData({ ...formData, alternatives: newAlts });
                        }}
                        placeholder={`Alternative ${String.fromCharCode(65 + index)}`}
                        required
                      />
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={formData.correctAnswer === index}
                        onChange={() => setFormData({ ...formData, correctAnswer: index })}
                        className="w-4 h-4"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Select the radio button next to the correct answer
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingQuestion ? "Update" : "Create"} Question
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="text-sm text-gray-600">
          {filteredQuestions.length} question(s)
        </div>
      </div>

      <div className="grid gap-4">
        {filteredQuestions.map((question) => (
          <Card key={question.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-lg">{question.statement}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{question.subject}</Badge>
                    <span className="text-sm text-gray-500">
                      by {question.user.username} • {new Date(question.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(question)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Question</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this question? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(question.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {question.alternatives.map((alt, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded ${
                      index === question.correctAnswer
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-gray-50'
                    }`}
                  >
                    <span className="font-medium mr-2">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    {alt}
                    {index === question.correctAnswer && (
                      <span className="ml-2 text-green-600 font-medium">✓</span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredQuestions.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">No questions found</h3>
          <p className="text-gray-600">
            {searchTerm ? "Try adjusting your search terms." : "Start by adding your first question."}
          </p>
        </div>
      )}
    </div>
  );
}
