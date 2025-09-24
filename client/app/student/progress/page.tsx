"use client"

import { StudentLayout } from "@/components/layout/student-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Target, Award } from "lucide-react"

export default function StudentProgress() {
  return (
    <StudentLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Progress</h1>
          <p className="text-muted-foreground">
            Track your learning journey and see your strengths and areas for improvement.
          </p>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">82%</div>
              <p className="text-xs text-muted-foreground">Average across all subjects</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quizzes Completed</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">This semester</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Essays Submitted</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">This semester</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Improvement</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">+8%</div>
              <p className="text-xs text-muted-foreground">From last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Subject Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Subject Performance</CardTitle>
            <CardDescription>Your performance across different subjects</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Mathematics</span>
                <span className="text-sm text-muted-foreground">88%</span>
              </div>
              <Progress value={88} className="w-full" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Science</span>
                <span className="text-sm text-muted-foreground">92%</span>
              </div>
              <Progress value={92} className="w-full" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">History</span>
                <span className="text-sm text-muted-foreground">75%</span>
              </div>
              <Progress value={75} className="w-full" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">English</span>
                <span className="text-sm text-muted-foreground">85%</span>
              </div>
              <Progress value={85} className="w-full" />
            </div>
          </CardContent>
        </Card>

        {/* Strengths and Weaknesses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-green-600">
                <TrendingUp className="h-5 w-5 mr-2" />
                Strengths
              </CardTitle>
              <CardDescription>Areas where you excel</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Problem Solving</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Strong
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Scientific Method</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Strong
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Essay Writing</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Good
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Critical Thinking</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Strong
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-orange-600">
                <TrendingDown className="h-5 w-5 mr-2" />
                Areas for Improvement
              </CardTitle>
              <CardDescription>Focus areas for better performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Algebra</span>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                    Needs Work
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Historical Dates</span>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                    Needs Work
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Grammar</span>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    Improving
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Time Management</span>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                    Needs Work
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Feedback */}
        <Card>
          <CardHeader>
            <CardTitle>Recent AI Feedback</CardTitle>
            <CardDescription>Personalized insights from your recent submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Math Quiz - Chapter 5</h4>
                  <Badge variant="outline">85% Score</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Great work on geometry problems! Consider reviewing fraction operations for better accuracy. Your
                  problem-solving approach shows strong logical thinking.
                </p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">History Essay - Ancient Rome</h4>
                  <Badge variant="outline">Under Review</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your essay demonstrates good understanding of Roman politics. Try to include more specific dates and
                  events to strengthen your arguments.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </StudentLayout>
  )
}
