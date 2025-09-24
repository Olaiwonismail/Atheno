"use client"

import { useState, useEffect } from "react"
import { TeacherLayout } from "@/components/layout/teacher-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { TrendingUp, TrendingDown, Users, BookOpen, AlertTriangle } from "lucide-react"
import { getAuthToken } from "@/lib/auth"

interface QuizAnalytics {
  quiz_id: number
  total_submissions: number
  average_score: number
  question_analytics: {
    question_id: number
    correct_percentage: number
    difficulty_level: string
  }[]
}

interface StudentAnalytics {
  student_id: number
  student_name: string
  overall_score: number
  quiz_count: number
  essay_count: number
  strengths: string[]
  weaknesses: string[]
}

export default function TeacherAnalytics() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("month")
  const [selectedSubject, setSelectedSubject] = useState("all")
  const [quizAnalytics, setQuizAnalytics] = useState<QuizAnalytics[]>([])
  const [studentAnalytics, setStudentAnalytics] = useState<StudentAnalytics[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = await getAuthToken()

        // Fetch quiz analytics for all quizzes (in real app, you'd get quiz IDs first)
        // For now, we'll use mock data structure but with real API calls when quiz IDs are available

        // This would be the real implementation:
        // const quizResponse = await fetch(`https://atheno.onrender.com/analytics/quiz/${quizId}`, {
        //   headers: { Authorization: `Bearer ${token}` }
        // })

        // For now, keeping mock data but structured to match API response
        setQuizAnalytics([])
        setStudentAnalytics([])
      } catch (error) {
        console.error("Error fetching analytics:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [selectedTimeframe, selectedSubject])

  // Mock data - structured to match API responses
  const quizPerformanceData = [
    { question: "Q1", correct: 85, incorrect: 15, difficulty: "Easy" },
    { question: "Q2", correct: 72, incorrect: 28, difficulty: "Medium" },
    { question: "Q3", correct: 45, incorrect: 55, difficulty: "Hard" },
    { question: "Q4", correct: 68, incorrect: 32, difficulty: "Medium" },
    { question: "Q5", correct: 91, incorrect: 9, difficulty: "Easy" },
  ]

  const classPerformanceData = [
    { subject: "Math", average: 78, trend: "up" },
    { subject: "Science", average: 82, trend: "up" },
    { subject: "History", average: 65, trend: "down" },
    { subject: "English", average: 74, trend: "up" },
  ]

  const weaknessData = [
    { topic: "Fractions", failRate: 65, students: 16 },
    { topic: "Essay Structure", failRate: 45, students: 11 },
    { topic: "Historical Dates", failRate: 58, students: 14 },
    { topic: "Grammar", failRate: 38, students: 9 },
  ]

  const studentProgressData = [
    { name: "Week 1", average: 72 },
    { name: "Week 2", average: 75 },
    { name: "Week 3", average: 78 },
    { name: "Week 4", average: 82 },
    { name: "Week 5", average: 79 },
    { name: "Week 6", average: 85 },
  ]

  const submissionData = [
    { name: "Completed", value: 18, color: "#8b5cf6" },
    { name: "In Progress", value: 4, color: "#06b6d4" },
    { name: "Not Started", value: 2, color: "#6b7280" },
  ]

  if (loading) {
    return (
      <TeacherLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </TeacherLayout>
    )
  }

  return (
    <TeacherLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Insights into your students' performance and learning progress</p>
          </div>
          <div className="flex space-x-4">
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                <SelectItem value="math">Mathematics</SelectItem>
                <SelectItem value="science">Science</SelectItem>
                <SelectItem value="history">History</SelectItem>
                <SelectItem value="english">English</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="semester">This Semester</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{studentAnalytics.length || 24}</div>
              <p className="text-xs text-muted-foreground">Active this semester</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {studentAnalytics.length > 0
                  ? Math.round(studentAnalytics.reduce((acc, s) => acc + s.overall_score, 0) / studentAnalytics.length)
                  : 82}
                %
              </div>
              <p className="text-xs text-muted-foreground">+5% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">92%</div>
              <p className="text-xs text-muted-foreground">Assignments completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">At-Risk Students</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {studentAnalytics.filter((s) => s.overall_score < 70).length || 3}
              </div>
              <p className="text-xs text-muted-foreground">Need attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quiz Performance Heatmap */}
          <Card>
            <CardHeader>
              <CardTitle>Quiz Question Analysis</CardTitle>
              <CardDescription>Performance breakdown by question difficulty</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={quizPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="question" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="correct" stackId="a" fill="#8b5cf6" name="Correct" />
                  <Bar dataKey="incorrect" stackId="a" fill="#ef4444" name="Incorrect" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Class Progress Over Time */}
          <Card>
            <CardHeader>
              <CardTitle>Class Progress Trend</CardTitle>
              <CardDescription>Average performance over the past 6 weeks</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={studentProgressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                    }}
                  />
                  <Line type="monotone" dataKey="average" stroke="#06b6d4" strokeWidth={3} dot={{ fill: "#06b6d4" }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Assignment Completion */}
          <Card>
            <CardHeader>
              <CardTitle>Assignment Status</CardTitle>
              <CardDescription>Current assignment completion rates</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={submissionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {submissionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center space-x-4 mt-4">
                {submissionData.map((item, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Subject Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Subject Performance</CardTitle>
              <CardDescription>Average scores by subject area</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {classPerformanceData.map((subject, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{subject.subject}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">{subject.average}%</span>
                      {subject.trend === "up" ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>
                  <Progress value={subject.average} className="w-full" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Problem Areas */}
          <Card>
            <CardHeader>
              <CardTitle>Areas Needing Attention</CardTitle>
              <CardDescription>Topics with highest failure rates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {weaknessData.map((weakness, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">{weakness.topic}</p>
                    <p className="text-sm text-muted-foreground">{weakness.students} students struggling</p>
                  </div>
                  <Badge variant={weakness.failRate > 50 ? "destructive" : "secondary"}>
                    {weakness.failRate}% fail rate
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Student Performance Table */}
        <Card>
          <CardHeader>
            <CardTitle>Individual Student Performance</CardTitle>
            <CardDescription>Detailed breakdown of student progress and areas for improvement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium">Student</th>
                    <th className="text-left py-3 px-4 font-medium">Overall Score</th>
                    <th className="text-left py-3 px-4 font-medium">Quizzes</th>
                    <th className="text-left py-3 px-4 font-medium">Essays</th>
                    <th className="text-left py-3 px-4 font-medium">Trend</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {studentAnalytics.length > 0 ? (
                    studentAnalytics.map((student) => (
                      <tr key={student.student_id} className="border-b border-border">
                        <td className="py-3 px-4">{student.student_name}</td>
                        <td className="py-3 px-4">{student.overall_score}%</td>
                        <td className="py-3 px-4">{student.quiz_count}</td>
                        <td className="py-3 px-4">{student.essay_count}</td>
                        <td className="py-3 px-4">
                          {student.overall_score >= 80 ? (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-500" />
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              student.overall_score >= 90
                                ? "secondary"
                                : student.overall_score >= 70
                                  ? "outline"
                                  : "secondary"
                            }
                            className={
                              student.overall_score >= 90
                                ? "bg-green-100 text-green-800"
                                : student.overall_score < 70
                                  ? "bg-orange-100 text-orange-800"
                                  : ""
                            }
                          >
                            {student.overall_score >= 90
                              ? "Excellent"
                              : student.overall_score >= 70
                                ? "Good"
                                : "Needs Help"}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  ) : (
                    // Fallback to mock data when no real data available
                    <>
                      <tr className="border-b border-border">
                        <td className="py-3 px-4">Alice Johnson</td>
                        <td className="py-3 px-4">92%</td>
                        <td className="py-3 px-4">8/8</td>
                        <td className="py-3 px-4">3/3</td>
                        <td className="py-3 px-4">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Excellent
                          </Badge>
                        </td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="py-3 px-4">Bob Smith</td>
                        <td className="py-3 px-4">78%</td>
                        <td className="py-3 px-4">7/8</td>
                        <td className="py-3 px-4">2/3</td>
                        <td className="py-3 px-4">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">Good</Badge>
                        </td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="py-3 px-4">Carol Davis</td>
                        <td className="py-3 px-4">65%</td>
                        <td className="py-3 px-4">6/8</td>
                        <td className="py-3 px-4">2/3</td>
                        <td className="py-3 px-4">
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                            Needs Help
                          </Badge>
                        </td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </TeacherLayout>
  )
}
