// src/app/lib/schemas.ts
// Defines JSON schemas for OpenRouter's structured outputs

// Schema for lesson generation
export const lessonJsonSchema = {
  name: "LessonContent",
  schema: {
    type: "object",
    properties: {
      id: { type: "string", description: "Lesson identifier" },
      title: { type: "string", description: "Lesson title" },
      metadata: {
        type: "object",
        properties: {
          duration: { type: "string", description: "Estimated completion time" },
          difficulty: { type: "string", description: "Beginner/Intermediate/Advanced" },
          prerequisites: { 
            type: "array", 
            items: { type: "string" },
            description: "Required knowledge"
          },
          learningObjectives: { 
            type: "array", 
            items: { type: "string" },
            description: "What students will learn. Clear and concise"
          }
        },
        required: ["duration", "difficulty", "prerequisites", "learningObjectives"]
      },
      content: {
        type: "object",
        properties: {
          summary: { type: "string", description: "Brief overview of key concepts" },
          sections: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string", description: "Section heading" },
                content: { type: "string", description: "Main content text with formatting" },
                keyPoints: { 
                  type: "array", 
                  items: { type: "string" },
                  description: "Important points to remember"
                },
                examples: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      scenario: { type: "string", description: "Example context" },
                      explanation: { type: "string", description: "Detailed walkthrough" }
                    },
                    required: ["scenario", "explanation"]
                  }
                }
              },
              required: ["title", "content", "keyPoints", "examples"]
            }
          },
          practicalExercises: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string", description: "Exercise name" },
                type: { type: "string", description: "Individual/Group/Discussion" },
                instructions: { type: "string", description: "Step-by-step guide" },
                tips: { 
                  type: "array", 
                  items: { type: "string" },
                  description: "Helpful suggestions"
                },
                solution: { type: "string", description: "Sample solution or approach" }
              },
              required: ["title", "type", "instructions", "tips", "solution"]
            }
          }
        },
        required: ["summary", "sections", "practicalExercises"]
      },
      assessment: {
        type: "object",
        properties: {
          reviewQuestions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                question: { type: "string", description: "Open-ended question" },
                hints: { 
                  type: "array", 
                  items: { type: "string" },
                  description: "Guiding points"
                },
                sampleAnswer: { type: "string", description: "Model response" }
              },
              required: ["question", "hints", "sampleAnswer"]
            }
          },
          practiceProblems: {
            type: "array",
            items: {
              type: "object",
              properties: {
                problem: { type: "string", description: "Scenario or question" },
                approach: { type: "string", description: "How to solve it" },
                solution: { type: "string", description: "Complete answer" }
              },
              required: ["problem", "approach", "solution"]
            }
          }
        },
        required: ["reviewQuestions", "practiceProblems"]
      },
      resources: {
        type: "object",
        properties: {
          required: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string", description: "Resource name" },
                type: { type: "string", description: "Book/Article/Video" },
                description: { type: "string", description: "Why it's important" },
                url: { type: "string", description: "Link to resource. Do not provide fake url" }
              },
              required: ["title", "type", "description", "url"]
            }
          },
          supplementary: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string", description: "Additional resource" },
                type: { type: "string", description: "Resource type" },
                description: { type: "string", description: "How it helps" },
                url: { type: "string", description: "Link to resource" }
              },
              required: ["title", "type", "description", "url"]
            }
          }
        },
        required: ["required", "supplementary"]
      },
      nextSteps: {
        type: "object",
        properties: {
          summary: { type: "string", description: "Key takeaways" },
          furtherLearning: { 
            type: "array", 
            items: { type: "string" },
            description: "Suggested topics"
          },
          applications: { 
            type: "array", 
            items: { type: "string" },
            description: "Real-world uses"
          }
        },
        required: ["summary", "furtherLearning", "applications"]
      }
    },
    required: ["id", "title", "metadata", "content", "assessment", "resources", "nextSteps"]
  }
};

// Schema for syllabus generation
export const syllabusJsonSchema = {
  name: "SyllabusStructure",
  schema: {
    type: "object",
    properties: {
      title: { type: "string", description: "Course title with emoji" },
      description: { type: "string", description: "Brief course description" },
      difficultyLevel: { type: "string", description: "Beginner/Intermediate/Advanced or range" },
      estimatedDuration: { type: "string", description: "Estimated time to complete the course" },
      prerequisites: { 
        type: "array", 
        items: { type: "string" },
        description: "List of required knowledge or skills"
      },
      chapters: {
        type: "array",
        items: {
          type: "object",
          properties: {
            emoji: { type: "string", description: "Emoji representing the chapter theme" },
            title: { type: "string", description: "Chapter title" },
            description: { type: "string", description: "Chapter description" },
            estimatedDuration: { type: "string", description: "Estimated time to complete the chapter" },
            lessons: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string", description: "Unique lesson identifier" },
                  title: { type: "string", description: "Lesson title" },
                  description: { type: "string", description: "Lesson description" }
                },
                required: ["id", "title", "description"]
              }
            }
          },
          required: ["emoji", "title", "description", "estimatedDuration", "lessons"]
        }
      }
    },
    required: ["title", "description", "difficultyLevel", "estimatedDuration", "prerequisites", "chapters"]
  }
}; 