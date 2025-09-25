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
  question_text: string
  options: string[]
  correct_answer: number
}

interface Quiz {
  id: number
  title: string
  questions: Question[]
  teacher_id: number
  created_at: string
}

export default function TakeQuiz() {
  const params = useParams()
  const router = useRouter()
  const quizId = params.id as string

  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const BASE_URL = "https://atheno-1.onrender.com"

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const token = await getAuthToken()
        const response = await fetch(`${BASE_URL}/quizzes/${quizId}`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'accept': 'application/json'
          },
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

    if (quizId) {
      fetchQuiz()
    }
  }, [quizId, router])

  const handleAnswerChange = (questionId: number, answerIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answerIndex }))
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
      
      // Prepare answers in the format expected by the backend
      const submissionAnswers: Record<string, number> = {}
      
      // Ensure we have answers for all questions (default to 0 if not answered)
      quiz.questions.forEach((question) => {
        if (!question || !question.id) {
          console.error('Invalid question found:', question)
          return
        }
        
        const answer = answers[question.id]
        // Use the stored answer index, or default to 0 if not answered
        submissionAnswers[question.id.toString()] = answer !== undefined ? answer : 0
      })

      console.log('Submitting answers:', submissionAnswers)
      console.log('Quiz questions:', quiz.questions)

      const response = await fetch(`${BASE_URL}/quizzes/${quizId}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          'accept': 'application/json'
        },
        body: JSON.stringify({
          answers: submissionAnswers
        }),
      })

      if (response.ok) {
        const result = await response.json()
        alert(`Quiz submitted successfully! Your score: ${result.score}%`)
        router.push("/student/dashboard")
      } else {
        const errorText = await response.text()
        console.error('Submission error response:', errorText)
        throw new Error(`Failed to submit quiz: ${response.status} - ${errorText}`)
      }
    } catch (error) {
      console.error("Error submitting quiz:", error)
      alert(`Failed to submit quiz. ${error instanceof Error ? error.message : 'Please try again.'}`)
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
          <Button onClick={() => router.push("/student/dashboard")} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </StudentLayout>
    )
  }

  const currentQ = quiz.questions[currentQuestion]
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100
  const currentAnswer = currentQ ? answers[currentQ.id] : undefined

  if (!currentQ) {
    return (
      <StudentLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Error: Question not found</p>
          <Button onClick={() => router.push("/student/dashboard")} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </StudentLayout>
    )
  }

  return (
    <StudentLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">{quiz.title}</h1>
          <p className="text-muted-foreground">
            {quiz.questions.length} question{quiz.questions.length !== 1 ? 's' : ''} • 
            Created {new Date(quiz.created_at).toLocaleDateString()}
          </p>
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
            <CardTitle className="flex items-center justify-between">
              <span>Question {currentQuestion + 1}</span>
              <span className="text-sm font-normal text-muted-foreground">
                ID: {currentQ.id}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-lg leading-relaxed">{currentQ.question_text}</p>
            </div>

            {/* Multiple Choice Options */}
            <RadioGroup
              value={currentAnswer !== undefined ? currentAnswer.toString() : ""}
              onValueChange={(value) => handleAnswerChange(currentQ.id, parseInt(value))}
            >
              {currentQ.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <RadioGroupItem 
                    value={index.toString()} 
                    id={`option-${currentQ.id}-${index}`} 
                  />
                  <Label 
                    htmlFor={`option-${currentQ.id}-${index}`} 
                    className="cursor-pointer flex-1"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            {/* Answer Status */}
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>
                {currentAnswer !== undefined ? "✓ Answer selected" : "No answer selected yet"}
              </span>
              <span>
                {Object.keys(answers).length} of {quiz.questions.length} questions answered
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button 
            variant="outline" 
            onClick={handlePrevious} 
            disabled={currentQuestion === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              {Object.keys(answers).length}/{quiz.questions.length} answered
            </span>
            
            {currentQuestion === quiz.questions.length - 1 ? (
              <Button 
                onClick={handleSubmit} 
                disabled={submitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  "Submit Quiz"
                )}
              </Button>
            ) : (
              <Button 
                onClick={handleNext}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>

        {/* Question Navigation Dots */}
        <div className="flex justify-center space-x-2">
          {quiz.questions.map((question, index) => (
            <button
              key={question.id}
              onClick={() => setCurrentQuestion(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentQuestion 
                  ? 'bg-primary scale-125' 
                  : answers[question.id] !== undefined 
                    ? 'bg-green-500' 
                    : 'bg-muted'
              }`}
              title={`Question ${index + 1}${answers[question.id] !== undefined ? ' (answered)' : ''}`}
            />
          ))}
        </div>
      </div>
    </StudentLayout>
  )
}