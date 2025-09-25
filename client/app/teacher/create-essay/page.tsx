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

// Define the rubric criteria structure
interface RubricCriterion {
  description: string
  max_score: number
}

interface Rubric {
  [key: string]: RubricCriterion
}

export default function CreateEssay() {
  const [title, setTitle] = useState("")
  const [prompt, setPrompt] = useState("")
  const [wordLimit, setWordLimit] = useState("")
  const [loading, setLoading] = useState(false)
  
  // State for rubric criteria
  const [criteria, setCriteria] = useState([
    { name: "clarity", description: "", max_score: 10 },
    { name: "structure", description: "", max_score: 10 },
    { name: "content", description: "", max_score: 20 }
  ])

  const updateCriterion = (index: number, field: string, value: string | number) => {
    const updatedCriteria = [...criteria]
    updatedCriteria[index] = {
      ...updatedCriteria[index],
      [field]: value
    }
    setCriteria(updatedCriteria)
  }

  const addCriterion = () => {
    setCriteria([...criteria, { name: "", description: "", max_score: 10 }])
  }

  const removeCriterion = (index: number) => {
    if (criteria.length > 1) {
      setCriteria(criteria.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = await getAuthToken()
      if (!token) {
        alert("Authentication token not found. Please log in again.")
        return
      }

      // Convert criteria array to rubric object
      const rubricObject: Rubric = {}
      criteria.forEach(criterion => {
        if (criterion.name.trim()) {
          rubricObject[criterion.name] = {
            description: criterion.description,
            max_score: criterion.max_score
          }
        }
      })

      const requestBody = {
        title,
        prompt,
        rubric: rubricObject,
        word_limit: wordLimit ? Number.parseInt(wordLimit) : null,
      }

      console.log("Sending request body:", requestBody)

      const response = await fetch("https://atheno-1.onrender.com/essays/", {
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
        setWordLimit("")
        // Reset to default criteria
        setCriteria([
          { name: "clarity", description: "", max_score: 10 },
          { name: "structure", description: "", max_score: 10 },
          { name: "content", description: "", max_score: 20 }
        ])
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

  return (
    <TeacherLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Create Essay Prompt</h1>
          <p className="text-muted-foreground">Create a new essay assignment for your students</p>
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
              <Button type="button" onClick={addCriterion} variant="outline" size="sm">
                Add Criterion
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {criteria.map((criterion, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <Label>Criterion {index + 1}</Label>
                    {criteria.length > 1 && (
                      <Button 
                        type="button" 
                        onClick={() => removeCriterion(index)} 
                        variant="destructive" 
                        size="sm"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <Label htmlFor={`criterion-name-${index}`}>Criterion Name</Label>
                      <Input
                        id={`criterion-name-${index}`}
                        value={criterion.name}
                        onChange={(e) => updateCriterion(index, "name", e.target.value)}
                        placeholder="e.g., clarity, structure"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`criterion-score-${index}`}>Max Score</Label>
                      <Input
                        id={`criterion-score-${index}`}
                        type="number"
                        value={criterion.max_score}
                        onChange={(e) => updateCriterion(index, "max_score", Number(e.target.value))}
                        min="1"
                        max="100"
                        required
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <Label htmlFor={`criterion-desc-${index}`}>Description</Label>
                      <Textarea
                        id={`criterion-desc-${index}`}
                        value={criterion.description}
                        onChange={(e) => updateCriterion(index, "description", e.target.value)}
                        placeholder="Description of this criterion..."
                        rows={2}
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => window.history.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !title || !prompt || criteria.length === 0}>
              {loading ? "Creating..." : "Create Essay Prompt"}
            </Button>
          </div>
        </form>
      </div>
    </TeacherLayout>
  )
}