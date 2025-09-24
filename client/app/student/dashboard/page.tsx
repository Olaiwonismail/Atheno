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
  description: string
  created_at: string
}

interface Essay {
  id: number
  title: string
  prompt: string
  created_at: string
}

export default function StudentDashboard() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [essays, setEssays] = useState<Essay[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const token = await getAuthToken()

        // Fetch quizzes
        const quizzesResponse = await fetch("https://atheno.onrender.com/quizzes/", {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (quizzesResponse.ok) {
          const quizzesData = await quizzesResponse.json()
          setQuizzes(quizzesData)
        }

        // Fetch essays
        const essaysResponse = await fetch("https://atheno.onrender.com/essays/", {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (essaysResponse.ok) {
          const essaysData = await essaysResponse.json()
          setEssays(essaysData)
        }
      } catch (error) {
        console.error("Error fetching assignments:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAssignments()
  }, [])

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </StudentLayout>
    )
  }

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
              <div className="text-2xl font-bold">{quizzes.length}</div>
              <p className="text-xs text-muted-foreground">Quizzes to complete</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Essays</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{essays.length}</div>
              <p className="text-xs text-muted-foreground">Essays to submit</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
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
              </CardTitle>
              <CardDescription>Quizzes waiting for you to complete</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quizzes.length > 0 ? (
                  quizzes.map((quiz) => (
                    <div key={quiz.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium">{quiz.title}</h3>
                        <p className="text-sm text-muted-foreground">{quiz.description}</p>
                        <div className="flex items-center mt-2">
                          <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            Created {new Date(quiz.created_at).toLocaleDateString()}
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
              </CardTitle>
              <CardDescription>Essay assignments to complete</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {essays.length > 0 ? (
                  essays.map((essay) => (
                    <div key={essay.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium">{essay.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{essay.prompt}</p>
                        <div className="flex items-center mt-2">
                          <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            Created {new Date(essay.created_at).toLocaleDateString()}
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
            <CardDescription>Your latest submissions and feedback</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <div>
                    <p className="font-medium">Math Quiz - Chapter 4</p>
                    <p className="text-sm text-muted-foreground">Completed with 85% score</p>
                  </div>
                </div>
                <Badge variant="secondary">Completed</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <div>
                    <p className="font-medium">History Essay - Ancient Rome</p>
                    <p className="text-sm text-muted-foreground">Submitted for review</p>
                  </div>
                </div>
                <Badge variant="outline">Under Review</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </StudentLayout>
  )
}
