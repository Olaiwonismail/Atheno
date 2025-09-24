import { TeacherLayout } from "@/components/layout/teacher-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, FileText, Users, BarChart3 } from "lucide-react"
import Link from "next/link"

export default function TeacherDashboard() {
  return (
    <TeacherLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening with your classes.</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Create Quiz</CardTitle>
              <PlusCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">New</div>
              <p className="text-xs text-muted-foreground">Create a new quiz for your students</p>
              <Link href="/teacher/create-quiz">
                <Button className="w-full mt-3" size="sm">
                  Create Quiz
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Create Essay</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">New</div>
              <p className="text-xs text-muted-foreground">Create essay prompts with rubrics</p>
              <Link href="/teacher/create-essay">
                <Button className="w-full mt-3" size="sm">
                  Create Essay
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">Active students this semester</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Analytics</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">View</div>
              <p className="text-xs text-muted-foreground">Check class performance</p>
              <Link href="/teacher/analytics">
                <Button variant="outline" className="w-full mt-3 bg-transparent" size="sm">
                  View Analytics
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Quizzes</CardTitle>
              <CardDescription>Your latest quiz activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">Math Quiz - Chapter 5</p>
                    <p className="text-sm text-muted-foreground">Created 2 days ago</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">18/24 completed</p>
                    <p className="text-xs text-muted-foreground">75% completion</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">Science Quiz - Atoms</p>
                    <p className="text-sm text-muted-foreground">Created 5 days ago</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">24/24 completed</p>
                    <p className="text-xs text-muted-foreground">100% completion</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Essays</CardTitle>
              <CardDescription>Your latest essay assignments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">History Essay - World War II</p>
                    <p className="text-sm text-muted-foreground">Created 1 week ago</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">12/24 submitted</p>
                    <p className="text-xs text-muted-foreground">50% submitted</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">English Essay - Shakespeare</p>
                    <p className="text-sm text-muted-foreground">Created 2 weeks ago</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">20/24 submitted</p>
                    <p className="text-xs text-muted-foreground">83% submitted</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TeacherLayout>
  )
}
