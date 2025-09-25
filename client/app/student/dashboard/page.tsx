"use client"

import { useState, useEffect } from "react"
import { StudentLayout } from "@/components/layout/student-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, FileText, Clock, CheckCircle } from "lucide-react"
import Link from "next/link"
import { getAuthToken } from "@/lib/auth"

interface Quiz {
  id: number
  title: string
  questions: Array<{
    question_text: string
    options: string[]
    correct_answer: number
  }>
  teacher_id: number
  created_at: string
}

interface Essay {
  id: number
  prompt: string
  rubric: {
    [key: string]: {
      description: string
      max_score: number
    }
  }
  teacher_id: number
  created_at: string
}

interface DashboardData {
  pending_quizzes: number
  pending_essays: number
  completed_assignments: number
  pending_quizzes_list: Quiz[]
  pending_essays_list: Essay[]
}

export default function StudentDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [availableQuizzes, setAvailableQuizzes] = useState<Quiz[]>([])
  const [availableEssays, setAvailableEssays] = useState<Essay[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true)
        const token = await getAuthToken()

        if (!token) {
          throw new Error('No authentication token found')
        }

        // Fetch dashboard data
        const dashboardResponse = await fetch("https://atheno-1.onrender.com/student/dashboard", {
          headers: { 
            Authorization: `Bearer ${token}`,
            'accept': 'application/json'
          },
        })

        if (!dashboardResponse.ok) {
          throw new Error(`Failed to fetch dashboard data: ${dashboardResponse.status}`)
        }
        const dashboardData = await dashboardResponse.json()
        setDashboardData(dashboardData)

        // Fetch available quizzes
        const quizzesResponse = await fetch("https://atheno-1.onrender.com/student/quizzes/available", {
          headers: { 
            Authorization: `Bearer ${token}`,
            'accept': 'application/json'
          },
        })

        if (quizzesResponse.ok) {
          const quizzesData = await quizzesResponse.json()
          setAvailableQuizzes(quizzesData)
        }

        // Fetch available essays
        const essaysResponse = await fetch("https://atheno-1.onrender.com/student/essays/available", {
          headers: { 
            Authorization: `Bearer ${token}`,
            'accept': 'application/json'
          },
        })

        if (essaysResponse.ok) {
          const essaysData = await essaysResponse.json()
          setAvailableEssays(essaysData)
        }

      } catch (error) {
        console.error("Error fetching student data:", error)
        setError(error instanceof Error ? error.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchStudentData()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
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

  if (error) {
    return (
      <StudentLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="text-red-500 text-lg mb-4">Error: {error}</div>
          <Button onClick={() => window.location.reload()} variant="outline">
            Retry
          </Button>
        </div>
      </StudentLayout>
    )
  }

  // Use dashboard data if available, otherwise fallback to available quizzes/essays
  const pendingQuizzes = dashboardData?.pending_quizzes_list || availableQuizzes
  const pendingEssays = dashboardData?.pending_essays_list || availableEssays
  const pendingQuizzesCount = dashboardData?.pending_quizzes || pendingQuizzes.length
  const pendingEssaysCount = dashboardData?.pending_essays || pendingEssays.length
  const completedCount = dashboardData?.completed_assignments || 0

  return (
    <StudentLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here are your assignments and progress.</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Quizzes</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingQuizzesCount}</div>
              <p className="text-xs text-muted-foreground">Quizzes to complete</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Essays</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingEssaysCount}</div>
              <p className="text-xs text-muted-foreground">Essays to submit</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedCount}</div>
              <p className="text-xs text-muted-foreground">Assignments completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Assignments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Quizzes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                Pending Quizzes
                <Badge variant="secondary" className="ml-2">
                  {pendingQuizzes.length}
                </Badge>
              </CardTitle>
              <CardDescription>Quizzes waiting for you to complete</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingQuizzes.length > 0 ? (
                  pendingQuizzes.map((quiz) => (
                    <div key={quiz.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium">{quiz.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {quiz.questions.length} question{quiz.questions.length !== 1 ? 's' : ''}
                        </p>
                        <div className="flex items-center mt-2">
                          <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            Created {formatDate(quiz.created_at)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <Link href={`/student/quiz/${quiz.id}`}>
                          <Button size="sm">Start Quiz</Button>
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No pending quizzes</p>
                    <p className="text-sm mt-1">Great job! You're all caught up.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pending Essays */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Pending Essays
                <Badge variant="secondary" className="ml-2">
                  {pendingEssays.length}
                </Badge>
              </CardTitle>
              <CardDescription>Essay assignments to complete</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingEssays.length > 0 ? (
                  pendingEssays.map((essay) => (
                    <div key={essay.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium">Essay Assignment</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{essay.prompt}</p>
                        <div className="flex items-center mt-2 space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {Object.keys(essay.rubric).length} criteria
                          </Badge>
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {formatDate(essay.created_at)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <Link href={`/student/essay/${essay.id}`}>
                          <Button size="sm">Start Essay</Button>
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No pending essays</p>
                    <p className="text-sm mt-1">All essay assignments are complete!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest submissions and progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {completedCount > 0 ? (
                <>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      <div>
                        <p className="font-medium">Completed Assignments</p>
                        <p className="text-sm text-muted-foreground">
                          You've completed {completedCount} assignment{completedCount !== 1 ? 's' : ''} in total
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">Great work!</Badge>
                  </div>
                  
                  {pendingQuizzes.length === 0 && pendingEssays.length === 0 && (
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                        <div>
                          <p className="font-medium text-green-800">All Caught Up!</p>
                          <p className="text-sm text-green-600">
                            You have no pending assignments. Keep up the good work!
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        Excellent
                      </Badge>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <p>No recent activity yet</p>
                  <p className="text-sm mt-1">Start by completing your first assignment!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Jump back into your work</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingQuizzes.length > 0 && (
                <Link href={`/student/quiz/${pendingQuizzes[0].id}`} className="block">
                  <Button className="w-full justify-start" size="lg">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Start Next Quiz
                  </Button>
                </Link>
              )}
              {pendingEssays.length > 0 && (
                <Link href={`/student/essay/${pendingEssays[0].id}`} className="block">
                  <Button className="w-full justify-start" size="lg" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Start Next Essay
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Progress Summary</CardTitle>
              <CardDescription>Your current standing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Pending Assignments</span>
                  <Badge variant={pendingQuizzesCount + pendingEssaysCount > 0 ? "destructive" : "secondary"}>
                    {pendingQuizzesCount + pendingEssaysCount}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Completed Assignments</span>
                  <Badge variant="secondary">{completedCount}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Progress</span>
                  <span className="text-sm font-medium">
                    {completedCount}/{completedCount + pendingQuizzesCount + pendingEssaysCount}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </StudentLayout>
  )
}