"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { StudentLayout } from "@/components/layout/student-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { getAuthToken } from "@/lib/auth"
import { FileText, Clock, AlertCircle, CheckCircle } from "lucide-react"

interface Essay {
  id: number
  title: string
  prompt: string
  rubric: string
  word_limit?: number
  created_at: string
}

export default function SubmitEssay() {
  const params = useParams()
  const router = useRouter()
  const essayId = params.id as string

  const [essay, setEssay] = useState<Essay | null>(null)
  const [submission, setSubmission] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [wordCount, setWordCount] = useState(0)

  useEffect(() => {
    const fetchEssay = async () => {
      try {
        const token = await getAuthToken()
        const response = await fetch(`https://atheno-1.onrender.com/essays/${essayId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.ok) {
          const essayData = await response.json()
          setEssay(essayData)
        } else {
          throw new Error("Failed to fetch essay")
        }
      } catch (error) {
        console.error("Error fetching essay:", error)
        alert("Failed to load essay")
        router.push("/student/dashboard")
      } finally {
        setLoading(false)
      }
    }

    fetchEssay()
  }, [essayId, router])

  useEffect(() => {
    const words = submission
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0)
    setWordCount(words.length)
  }, [submission])

  const handleSubmit = async () => {
    if (!essay || !submission.trim()) {
      alert("Please write your essay before submitting.")
      return
    }

    if (essay.word_limit && wordCount > essay.word_limit) {
      alert(`Your essay exceeds the word limit of ${essay.word_limit} words.`)
      return
    }

    setSubmitting(true)
    try {
      const token = await getAuthToken()
      const response = await fetch(`https://atheno-1.onrender.com/essays/${essayId}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: submission,
        }),
      })

      if (response.ok) {
        alert("Essay submitted successfully!")
        router.push("/student/dashboard")
      } else {
        throw new Error("Failed to submit essay")
      }
    } catch (error) {
      console.error("Error submitting essay:", error)
      alert("Failed to submit essay. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleSaveDraft = async () => {
    if (!essay || !submission.trim()) {
      alert("Please write something before saving.")
      return
    }

    try {
      const token = await getAuthToken()
      const response = await fetch(`https://atheno-1.onrender.com/essays/${essayId}/draft`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: submission,
        }),
      })

      if (response.ok) {
        alert("Draft saved successfully!")
      } else {
        throw new Error("Failed to save draft")
      }
    } catch (error) {
      console.error("Error saving draft:", error)
      alert("Failed to save draft. Please try again.")
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

  if (!essay) {
    return (
      <StudentLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Essay not found</p>
        </div>
      </StudentLayout>
    )
  }

  const isOverLimit = essay.word_limit && wordCount > essay.word_limit
  const isNearLimit = essay.word_limit && wordCount > essay.word_limit * 0.9

  return (
    <StudentLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">{essay.title}</h1>
          <div className="flex items-center mt-2 text-muted-foreground">
            <Clock className="h-4 w-4 mr-1" />
            <span className="text-sm">Assigned {new Date(essay.created_at).toLocaleDateString()}</span>
            {essay.word_limit && (
              <>
                <span className="mx-2">•</span>
                <span className="text-sm">Word limit: {essay.word_limit}</span>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Essay Prompt and Rubric */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Essay Prompt
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{essay.prompt}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Grading Rubric</CardTitle>
                <CardDescription>How your essay will be evaluated</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{essay.rubric}</p>
              </CardContent>
            </Card>
          </div>

          {/* Essay Editor */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Your Essay</CardTitle>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">Word count:</span>
                      <Badge
                        variant={isOverLimit ? "destructive" : isNearLimit ? "secondary" : "outline"}
                        className={isOverLimit ? "text-destructive-foreground" : ""}
                      >
                        {wordCount}
                        {essay.word_limit && ` / ${essay.word_limit}`}
                      </Badge>
                    </div>
                    {isOverLimit && (
                      <div className="flex items-center text-destructive">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        <span className="text-sm">Over limit</span>
                      </div>
                    )}
                  </div>
                </div>
                <CardDescription>Write your essay response below</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="h-[600px] flex flex-col">
                  <Textarea
                    value={submission}
                    onChange={(e) => setSubmission(e.target.value)}
                    placeholder="Start writing your essay here..."
                    className="flex-1 resize-none text-sm leading-relaxed"
                    style={{ minHeight: "500px" }}
                  />

                  {/* Action Buttons */}
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-border">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Auto-saved every 30 seconds
                    </div>
                    <div className="flex space-x-3">
                      <Button variant="outline" onClick={handleSaveDraft} disabled={!submission.trim()}>
                        Save Draft
                      </Button>
                      <Button onClick={handleSubmit} disabled={submitting || !submission.trim() || isOverLimit}>
                        {submitting ? "Submitting..." : "Submit Essay"}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Writing Tips */}
        <Card>
          <CardHeader>
            <CardTitle>Writing Tips</CardTitle>
            <CardDescription>Guidelines to help you write a strong essay</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-medium">Structure</h4>
                <ul className="text-muted-foreground space-y-1">
                  <li>• Clear introduction</li>
                  <li>• Body paragraphs</li>
                  <li>• Strong conclusion</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Content</h4>
                <ul className="text-muted-foreground space-y-1">
                  <li>• Answer the prompt</li>
                  <li>• Use specific examples</li>
                  <li>• Support your arguments</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Style</h4>
                <ul className="text-muted-foreground space-y-1">
                  <li>• Clear, concise writing</li>
                  <li>• Varied sentence structure</li>
                  <li>• Academic tone</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Review</h4>
                <ul className="text-muted-foreground space-y-1">
                  <li>• Check grammar</li>
                  <li>• Verify word count</li>
                  <li>• Proofread carefully</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </StudentLayout>
  )
}
