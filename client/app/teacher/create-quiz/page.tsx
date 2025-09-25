"use client"

import type React from "react"

import { useState } from "react"
import { TeacherLayout } from "@/components/layout/teacher-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Plus } from "lucide-react"
import { getAuthToken } from "@/lib/auth"

interface Question {
  id: string
  type: "multiple_choice" | "short_answer"
  question: string
  options?: string[]
  correct_answer: string
}

export default function CreateQuiz() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(false)

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      type: "multiple_choice",
      question: "",
      options: ["", "", "", ""],
      correct_answer: "",
    }
    setQuestions([...questions, newQuestion])
  }

  const updateQuestion = (id: string, field: keyof Question, value: any) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, [field]: value } : q)))
  }

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId && q.options) {
          const newOptions = [...q.options]
          newOptions[optionIndex] = value
          return { ...q, options: newOptions }
        }
        return q
      }),
    )
  }

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = await getAuthToken()
      const response = await fetch("https://atheno-1.onrender.com/quizzes/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          questions: questions.map((q, index) => ({
            question_text: q.question,
            options: q.type === "multiple_choice" ? q.options : undefined,
            correct_answer:
              q.type === "multiple_choice" ? (q.options?.indexOf(q.correct_answer) ?? 0) : q.correct_answer,
          })),
        }),
      })

      if (response.ok) {
        alert(`Quiz created successfully! `)
        setTitle("")
        
        setDescription("")
        setQuestions([])
      } else {
        throw new Error("Failed to create quiz")
      }
    } catch (error) {
      console.error("Error creating quiz:", error)
      alert("Failed to create quiz. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <TeacherLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Create Quiz</h1>
          <p className="text-muted-foreground">Create a new quiz for your students</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quiz Details</CardTitle>
              <CardDescription>Basic information about your quiz</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Quiz Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter quiz title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter quiz description"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Questions</CardTitle>
                <CardDescription>Add questions to your quiz</CardDescription>
              </div>
              <Button type="button" onClick={addQuestion} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {questions.map((question, index) => (
                <div key={question.id} className="p-4 border border-border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Question {index + 1}</h3>
                    <Button type="button" variant="destructive" size="sm" onClick={() => removeQuestion(question.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Question Type</Label>
                      <Select
                        value={question.type}
                        onValueChange={(value) => updateQuestion(question.id, "type", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                          <SelectItem value="short_answer">Short Answer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Question</Label>
                      <Textarea
                        value={question.question}
                        onChange={(e) => updateQuestion(question.id, "question", e.target.value)}
                        placeholder="Enter your question"
                        rows={2}
                      />
                    </div>

                    {question.type === "multiple_choice" && question.options && (
                      <div className="space-y-2">
                        <Label>Options</Label>
                        {question.options.map((option, optionIndex) => (
                          <Input
                            key={optionIndex}
                            value={option}
                            onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                            placeholder={`Option ${optionIndex + 1}`}
                          />
                        ))}
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>Correct Answer</Label>
                      {question.type === "multiple_choice" ? (
                        <Select
                          value={question.correct_answer}
                          onValueChange={(value) => updateQuestion(question.id, "correct_answer", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select correct answer" />
                          </SelectTrigger>
                          <SelectContent>
                            {question.options?.map((option, index) => {
                              // Fix: Use index as value if option is empty
                              const value = option.trim() === "" ? `option-${index}` : option
                              const displayText = option.trim() === "" ? `Option ${index + 1} (empty)` : option
                              
                              return (
                                <SelectItem key={index} value={value}>
                                  {displayText}
                                </SelectItem>
                              )
                            })}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          value={question.correct_answer}
                          onChange={(e) => updateQuestion(question.id, "correct_answer", e.target.value)}
                          placeholder="Enter correct answer"
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {questions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No questions added yet. Click "Add Question" to get started.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline">
              Save as Draft
            </Button>
            <Button type="submit" disabled={loading || questions.length === 0}>
              {loading ? "Creating..." : "Create Quiz"}
            </Button>
          </div>
        </form>
      </div>
    </TeacherLayout>
  )
}