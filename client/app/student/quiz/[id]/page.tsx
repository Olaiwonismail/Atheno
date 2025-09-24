"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { StudentLayout } from "@/components/layout/student-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { getAuthToken } from "@/lib/auth"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface Question {
  id: number
  question: string
  type: "multiple_choice" | "short_answer"
  options?: string[]
}

interface Quiz {
  id: number
  title: string
  description: string
  questions: Question[]
}

export default function TakeQuiz() {
  const params = useParams()
  const router = useRouter()
  const quizId = params.id as string

  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const token = await getAuthToken()
        const response = await fetch(`https://atheno.onrender.com/quizzes/${quizId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.ok) {
          const quizData = await response.json()
          setQuiz(quizData)
        } else {
          throw new Error("Failed to fetch quiz")
        }
      } catch (error) {
        console.error("Error fetching quiz:", error)
        alert("Failed to load quiz")
        router.push("/student/dashboard")
      } finally {
        setLoading(false)
      }
    }

    fetchQuiz()
  }, [quizId, router])

  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }))
  }

  const handleNext = () => {
    if (quiz && currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmit = async () => {
    if (!quiz) return

    setSubmitting(true)
    try {
      const token = await getAuthToken()
      const response = await fetch(`https://atheno.onrender.com/quizzes/${quizId}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          answers: Object.fromEntries(
            Object.entries(answers).map(([questionIndex, answer]) => [
              questionIndex,
              quiz.questions[Number.parseInt(questionIndex)].type === "multiple_choice"
                ? (quiz.questions[Number.parseInt(questionIndex)].options?.indexOf(answer) ?? 0)
                : answer,
            ]),
          ),
        }),
      })

      if (response.ok) {
        const result = await response.json()
        alert(`Quiz submitted! Your score: ${result.score}%`)
        router.push("/student/dashboard")
      } else {
        throw new Error("Failed to submit quiz")
      }
    } catch (error) {
      console.error("Error submitting quiz:", error)
      alert("Failed to submit quiz. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </StudentLayout>
    )
  }

  if (!quiz) {
    return (
      <StudentLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Quiz not found</p>
        </div>
      </StudentLayout>
    )
  }

  const currentQ = quiz.questions[currentQuestion]
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100

  return (
    <StudentLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">{quiz.title}</h1>
          <p className="text-muted-foreground">{quiz.description}</p>
        </div>

        {/* Progress */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">
                Question {currentQuestion + 1} of {quiz.questions.length}
              </span>
            </div>
            <Progress value={progress} className="w-full" />
          </CardContent>
        </Card>

        {/* Question */}
        <Card>
          <CardHeader>
            <CardTitle>Question {currentQuestion + 1}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-lg leading-relaxed">{currentQ.question}</p>
            </div>

            {currentQ.type === "multiple_choice" && currentQ.options ? (
              <RadioGroup
                value={answers[currentQ.id] || ""}
                onValueChange={(value) => handleAnswerChange(currentQ.id, value)}
              >
                {currentQ.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="short-answer">Your Answer</Label>
                <Input
                  id="short-answer"
                  value={answers[currentQ.id] || ""}
                  onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                  placeholder="Enter your answer..."
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex space-x-2">
            {currentQuestion === quiz.questions.length - 1 ? (
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Quiz"}
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </StudentLayout>
  )
}
