"use client"

import { TeacherLayout } from "@/components/layout/teacher-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, FileText, Users, BarChart3, Calendar, BookOpen } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { getAuthToken } from "@/lib/auth" // Import the auth function

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

export default function TeacherDashboard() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [essays, setEssays] = useState<Essay[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Get the authentication token
        const token = await getAuthToken()
        
        if (!token) {
          throw new Error('No authentication token found')
        }

        // Fetch quizzes with proper authorization
        const quizzesResponse = await fetch('https://atheno-1.onrender.com/teacher/quizzes', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'accept': 'application/json',
            'Content-Type': 'application/json'
          }
        })
        
        if (!quizzesResponse.ok) {
          throw new Error(`Failed to fetch quizzes: ${quizzesResponse.status}`)
        }
        const quizzesData = await quizzesResponse.json()
        setQuizzes(quizzesData)

        // Fetch essays with proper authorization
        const essaysResponse = await fetch('https://atheno-1.onrender.com/teacher/essays', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'accept': 'application/json',
            'Content-Type': 'application/json'
          }
        })
        
        if (!essaysResponse.ok) {
          throw new Error(`Failed to fetch essays: ${essaysResponse.status}`)
        }
        const essaysData = await essaysResponse.json()
        setEssays(essaysData)

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        console.error('Error fetching data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
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
      <TeacherLayout>
        <div className="flex justify-center items-center min-h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </TeacherLayout>
    )
  }

  if (error) {
    return (
      <TeacherLayout>
        <div className="flex justify-center items-center min-h-64">
          <div className="text-red-500">Error: {error}</div>
          <Button 
            onClick={() => window.location.reload()} 
            className="ml-4"
            variant="outline"
          >
            Retry
          </Button>
        </div>
      </TeacherLayout>
    )
  }

  return (
    <TeacherLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening with your classes.</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Quizzes</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{quizzes.length}</div>
              <p className="text-xs text-muted-foreground">Active quizzes created</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Essays</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{essays.length}</div>
              <p className="text-xs text-muted-foreground">Essay assignments created</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
              <PlusCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {quizzes.reduce((total, quiz) => total + quiz.questions.length, 0)}
              </div>
              <p className="text-xs text-muted-foreground">Across all quizzes</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {quizzes.length > 0 ? formatDate(quizzes[0]?.created_at) : 'None'}
              </div>
              <p className="text-xs text-muted-foreground">Latest creation</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Create new assignments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/teacher/create-quiz">
                <Button className="w-full justify-start" size="lg">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create New Quiz
                </Button>
              </Link>
              <Link href="/teacher/create-essay">
                <Button className="w-full justify-start" size="lg" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Create New Essay
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>View class performance</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/teacher/analytics">
                <Button className="w-full justify-start" size="lg" variant="outline">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Analytics Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Quizzes */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Quizzes</CardTitle>
              <CardDescription>Your latest quiz activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quizzes.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    <p>No quizzes created yet.</p>
                    <Link href="/teacher/create-quiz">
                      <Button variant="link" className="mt-2">
                        Create your first quiz
                      </Button>
                    </Link>
                  </div>
                ) : (
                  quizzes.slice(0, 3).map((quiz) => (
                    <div key={quiz.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium truncate">{quiz.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {quiz.questions.length} question{quiz.questions.length !== 1 ? 's' : ''}
                        </p>
                        <div className="flex items-center mt-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(quiz.created_at)}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">ID: {quiz.id}</p>
                        <p className="text-xs text-muted-foreground">Quiz ID</p>
                      </div>
                    </div>
                  ))
                )}
                {quizzes.length > 3 && (
                  <Link href="/teacher/quizzes">
                    <Button variant="outline" className="w-full mt-2">
                      View All Quizzes ({quizzes.length})
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Essays */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Essays</CardTitle>
              <CardDescription>Your latest essay assignments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {essays.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    <p>No essays created yet.</p>
                    <Link href="/teacher/create-essay">
                      <Button variant="link" className="mt-2">
                        Create your first essay
                      </Button>
                    </Link>
                  </div>
                ) : (
                  essays.slice(0, 3).map((essay) => (
                    <div key={essay.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium truncate">{essay.prompt}</p>
                        <p className="text-sm text-muted-foreground">
                          {Object.keys(essay.rubric).length} rubric criteria
                        </p>
                        <div className="flex items-center mt-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(essay.created_at)}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">ID: {essay.id}</p>
                        <p className="text-xs text-muted-foreground">Essay ID</p>
                      </div>
                    </div>
                  ))
                )}
                {essays.length > 3 && (
                  <Link href="/teacher/essays">
                    <Button variant="outline" className="w-full mt-2">
                      View All Essays ({essays.length})
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TeacherLayout>
  )
}