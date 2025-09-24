"use client"

import type React from "react"
import { useState } from "react"
import { TeacherLayout } from "@/components/layout/teacher-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { getAuthToken } from "@/lib/auth"

export default function CreateEssay() {
  const [title, setTitle] = useState("")
  const [prompt, setPrompt] = useState("")
  const [rubric, setRubric] = useState("")
  const [wordLimit, setWordLimit] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = await getAuthToken()
      if (!token) {
        alert("Authentication token not found. Please log in again.")
        return
      }

      const requestBody = {
        title,
        prompt,
        rubric,
        word_limit: wordLimit ? Number.parseInt(wordLimit) : null,
      }

      console.log("Sending request body:", requestBody)

      const response = await fetch("https://atheno.onrender.com/essays/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      })

      console.log("Response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("Success response:", data)
        alert("Essay prompt created successfully!")
        // Reset form
        setTitle("")
        setPrompt("")
        setRubric("")
        setWordLimit("")
      } else {
        const errorText = await response.text()
        console.error("Error response:", errorText)
        throw new Error(`Failed to create essay prompt: ${response.status} - ${errorText}`)
      }
    } catch (error) {
      console.error("Error creating essay:", error)
      alert(`Failed to create essay prompt. Please try again. Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Test function to check the API endpoint
  const testEndpoint = async () => {
    try {
      const token = await getAuthToken()
      const response = await fetch("https://atheno.onrender.com/essays/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      console.log("Endpoint test response:", response.status)
    } catch (error) {
      console.error("Endpoint test failed:", error)
    }
  }

  return (
    <TeacherLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Create Essay Prompt</h1>
          <p className="text-muted-foreground">Create a new essay assignment for your students</p>
          {/* Remove this button in production - it's just for testing */}
          <Button variant="outline" onClick={testEndpoint} className="mt-2">
            Test API Endpoint
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Essay Details</CardTitle>
              <CardDescription>Basic information about your essay assignment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Essay Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter essay title"
                  required
                  minLength={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="word-limit">Word Limit (optional)</Label>
                <Input
                  id="word-limit"
                  type="number"
                  value={wordLimit}
                  onChange={(e) => setWordLimit(e.target.value)}
                  placeholder="e.g., 500"
                  min="0"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Essay Prompt *</CardTitle>
              <CardDescription>The main question or topic for the essay</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter the essay prompt or question..."
                rows={6}
                required
                minLength={10}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rubric *</CardTitle>
              <CardDescription>Grading criteria and expectations</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={rubric}
                onChange={(e) => setRubric(e.target.value)}
                placeholder="Enter grading rubric and criteria..."
                rows={8}
                required
                minLength={10}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => window.history.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !title || !prompt || !rubric}>
              {loading ? "Creating..." : "Create Essay Prompt"}
            </Button>
          </div>
        </form>
      </div>
    </TeacherLayout>
  )
}