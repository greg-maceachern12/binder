// CourseDownloader.tsx
import React from 'react';
import { Download } from 'lucide-react';
import JSZip from 'jszip';
import { jsPDF } from 'jspdf';
import { 
  Syllabus, 
  DetailedLesson,
} from '@/app/types';

interface CourseDownloaderProps {
  syllabus: Syllabus;
  generatedLessons: { [key: string]: DetailedLesson };
}

export default function CourseDownloader({ syllabus, generatedLessons }: CourseDownloaderProps) {
  const generateLessonPDF = (lesson: DetailedLesson) => {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Set initial position
    let y = 20;
    const margin = 20;
    const pageWidth = pdf.internal.pageSize.width;
    const contentWidth = pageWidth - (2 * margin);

    // Title
    pdf.setFontSize(24);
    pdf.text(lesson.title, margin, y);
    y += 15;

    // Metadata
    pdf.setFontSize(12);
    pdf.text(`Duration: ${lesson.metadata.duration}`, margin, y);
    y += 8;
    pdf.text(`Difficulty: ${lesson.metadata.difficulty}`, margin, y);
    y += 15;

    // Learning Objectives
    if (lesson.metadata.learningObjectives?.length > 0) {
      pdf.setFontSize(16);
      pdf.text('Learning Objectives', margin, y);
      y += 10;
      pdf.setFontSize(12);
      lesson.metadata.learningObjectives.forEach(objective => {
        const lines = pdf.splitTextToSize(`• ${objective}`, contentWidth);
        pdf.text(lines, margin, y);
        y += 8 * lines.length;
      });
      y += 10;
    }

    // Summary
    if (lesson.content.summary) {
      pdf.setFontSize(16);
      pdf.text('Summary', margin, y);
      y += 10;
      pdf.setFontSize(12);
      const summaryLines = pdf.splitTextToSize(lesson.content.summary, contentWidth);
      pdf.text(summaryLines, margin, y);
      y += 8 * summaryLines.length + 15;
    }

    // Content Sections
    lesson.content.sections.forEach(section => {
      if (y > pdf.internal.pageSize.height - 40) {
        pdf.addPage();
        y = 20;
      }

      pdf.setFontSize(16);
      pdf.text(section.title, margin, y);
      y += 10;

      pdf.setFontSize(12);
      const contentLines = pdf.splitTextToSize(section.content, contentWidth);
      pdf.text(contentLines, margin, y);
      y += 8 * contentLines.length + 10;

      // Key Points
      if (section.keyPoints?.length > 0) {
        pdf.setFontSize(14);
        pdf.text('Key Points:', margin, y);
        y += 8;
        section.keyPoints.forEach(point => {
          const lines = pdf.splitTextToSize(`• ${point}`, contentWidth);
          pdf.text(lines, margin, y);
          y += 8 * lines.length;
        });
        y += 10;
      }

      // Examples
      if (section.examples?.length > 0) {
        section.examples.forEach(example => {
          pdf.setFontSize(14);
          pdf.text('Example:', margin, y);
          y += 8;
          
          pdf.setFontSize(12);
          const scenarioLines = pdf.splitTextToSize(`Scenario: ${example.scenario}`, contentWidth);
          pdf.text(scenarioLines, margin, y);
          y += 8 * scenarioLines.length;
          
          const explanationLines = pdf.splitTextToSize(`Explanation: ${example.explanation}`, contentWidth);
          pdf.text(explanationLines, margin, y);
          y += 8 * explanationLines.length + 10;
        });
      }
    });

    // Practical Exercises
    if (lesson.content.practicalExercises?.length > 0) {
      pdf.addPage();
      y = 20;
      pdf.setFontSize(18);
      pdf.text('Practical Exercises', margin, y);
      y += 15;

      lesson.content.practicalExercises.forEach(exercise => {
        pdf.setFontSize(14);
        pdf.text(exercise.title, margin, y);
        y += 8;
        
        pdf.setFontSize(12);
        pdf.text(`Type: ${exercise.type}`, margin, y);
        y += 8;
        
        const instructionLines = pdf.splitTextToSize(exercise.instructions, contentWidth);
        pdf.text(instructionLines, margin, y);
        y += 8 * instructionLines.length + 8;
        
        if (exercise.tips?.length > 0) {
          pdf.setFontSize(14);
          pdf.text('Tips:', margin, y);
          y += 8;
          pdf.setFontSize(12);
          exercise.tips.forEach(tip => {
            const tipLines = pdf.splitTextToSize(`• ${tip}`, contentWidth);
            pdf.text(tipLines, margin, y);
            y += 8 * tipLines.length;
          });
          y += 15;
        }
      });
    }

    // Assessment
    if (lesson.assessment?.reviewQuestions?.length > 0) {
      pdf.addPage();
      y = 20;
      pdf.setFontSize(18);
      pdf.text('Review Questions', margin, y);
      y += 15;

      lesson.assessment.reviewQuestions.forEach((q, index) => {
        pdf.setFontSize(14);
        const questionLines = pdf.splitTextToSize(`${index + 1}. ${q.question}`, contentWidth);
        pdf.text(questionLines, margin, y);
        y += 8 * questionLines.length + 8;

        if (q.hints?.length > 0) {
          pdf.setFontSize(12);
          pdf.text('Hints:', margin, y);
          y += 8;
          q.hints.forEach(hint => {
            const hintLines = pdf.splitTextToSize(`• ${hint}`, contentWidth);
            pdf.text(hintLines, margin + 5, y);
            y += 8 * hintLines.length;
          });
          y += 15;
        }
      });
    }

    // Practice Problems
    if (lesson.assessment?.practiceProblems?.length > 0) {
      pdf.addPage();
      y = 20;
      pdf.setFontSize(18);
      pdf.text('Practice Problems', margin, y);
      y += 15;

      lesson.assessment.practiceProblems.forEach((prob, index) => {
        pdf.setFontSize(14);
        const problemLines = pdf.splitTextToSize(`${index + 1}. ${prob.problem}`, contentWidth);
        pdf.text(problemLines, margin, y);
        y += 8 * problemLines.length + 8;

        pdf.setFontSize(12);
        if (prob.approach) {
          const approachLines = pdf.splitTextToSize(`Approach: ${prob.approach}`, contentWidth);
          pdf.text(approachLines, margin, y);
          y += 8 * approachLines.length + 8;
        }

        if (prob.solution) {
          const solutionLines = pdf.splitTextToSize(`Solution: ${prob.solution}`, contentWidth);
          pdf.text(solutionLines, margin, y);
          y += 8 * solutionLines.length + 15;
        }
      });
    }

    // Resources
    if (lesson.resources?.required?.length > 0 || lesson.resources?.supplementary?.length > 0) {
      pdf.addPage();
      y = 20;
      pdf.setFontSize(18);
      pdf.text('Resources', margin, y);
      y += 15;

      if (lesson.resources.required?.length > 0) {
        pdf.setFontSize(14);
        pdf.text('Required Resources:', margin, y);
        y += 10;
        
        lesson.resources.required.forEach(resource => {
          pdf.setFontSize(12);
          pdf.text(`• ${resource.title} (${resource.type})`, margin, y);
          y += 8;
          const descLines = pdf.splitTextToSize(resource.description, contentWidth - 10);
          pdf.text(descLines, margin + 10, y);
          y += 8 * descLines.length + 5;
        });
        y += 10;
      }

      if (lesson.resources.supplementary?.length > 0) {
        pdf.setFontSize(14);
        pdf.text('Supplementary Resources:', margin, y);
        y += 10;
        
        lesson.resources.supplementary.forEach(resource => {
          pdf.setFontSize(12);
          pdf.text(`• ${resource.title} (${resource.type})`, margin, y);
          y += 8;
          const descLines = pdf.splitTextToSize(resource.description, contentWidth - 10);
          pdf.text(descLines, margin + 10, y);
          y += 8 * descLines.length + 5;
        });
      }
    }

    // Next Steps
    if (lesson.nextSteps?.summary || 
        lesson.nextSteps?.furtherLearning?.length > 0 || 
        lesson.nextSteps?.applications?.length > 0) {
      pdf.addPage();
      y = 20;
      pdf.setFontSize(18);
      pdf.text('Next Steps', margin, y);
      y += 15;

      if (lesson.nextSteps.summary) {
        pdf.setFontSize(12);
        const summaryLines = pdf.splitTextToSize(lesson.nextSteps.summary, contentWidth);
        pdf.text(summaryLines, margin, y);
        y += 8 * summaryLines.length + 15;
      }

      if (lesson.nextSteps.furtherLearning?.length > 0) {
        pdf.setFontSize(14);
        pdf.text('Further Learning:', margin, y);
        y += 10;
        pdf.setFontSize(12);
        lesson.nextSteps.furtherLearning.forEach(item => {
          pdf.text(`• ${item}`, margin, y);
          y += 8;
        });
        y += 10;
      }

      if (lesson.nextSteps.applications?.length > 0) {
        pdf.setFontSize(14);
        pdf.text('Applications:', margin, y);
        y += 10;
        pdf.setFontSize(12);
        lesson.nextSteps.applications.forEach(item => {
          pdf.text(`• ${item}`, margin, y);
          y += 8;
        });
      }
    }

    // Notes Section
    pdf.addPage();
    pdf.setFontSize(18);
    pdf.text('Notes', margin, 20);
    // Add lines for notes
    for (let i = 40; i < 250; i += 10) {
      pdf.setDrawColor(200);
      pdf.line(margin, i, pageWidth - margin, i);
    }

    return pdf;
  };

  const downloadCourse = async () => {
    const zip = new JSZip();
    const courseFolder = zip.folder(syllabus.title);

    if (!courseFolder) {
      console.error('Failed to create course folder');
      return;
    }

    // Create folders for each chapter
    syllabus.chapters.forEach((chapter, chapterIndex) => {
      const chapterFolder = courseFolder.folder(`Chapter ${chapterIndex + 1} - ${chapter.title}`);
      if (!chapterFolder) {
        console.error(`Failed to create folder for chapter ${chapter.title}`);
        return;
      }

      // Generate PDFs for each lesson
      chapter.lessons.forEach((lesson, lessonIndex) => {
        const detailedLesson = generatedLessons[lesson.id];
        if (!detailedLesson) {
          console.error(`No content found for lesson ${lesson.title}`);
          return;
        }

        const pdf = generateLessonPDF(detailedLesson);
        const pdfContent = pdf.output('arraybuffer');
        chapterFolder.file(`Lesson ${lessonIndex + 1} - ${lesson.title}.pdf`, pdfContent);
      });
    });

    // Generate and download the zip file
    const content = await zip.generateAsync({ type: 'blob' });
    const url = window.URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${syllabus.title}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const allLessonsGenerated = syllabus.chapters.every(chapter =>
    chapter.lessons.every(lesson => generatedLessons[lesson.id])
  );

  return (
    <button
      onClick={downloadCourse}
      disabled={allLessonsGenerated}
      className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors flex items-center justify-center gap-2"
    >
      <Download className="w-4 h-4" />
      {allLessonsGenerated ? 'Download Course' : 'Generate all lessons first'}
    </button>
  );
}