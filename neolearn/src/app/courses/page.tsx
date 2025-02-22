"use client"

import { useState } from 'react';
import { CourseCard } from '../../components/CourseCard';
import { CourseDialog } from '../../components/CourseDialog';
import type { Course } from '../../types/Course';

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | undefined>();

  const handleSaveCourse = (course: Course) => {
    if (selectedCourse) {
      setCourses(courses.map(c => c.id === course.id ? course : c));
    } else {
      setCourses([...courses, course]);
    }
    setIsDialogOpen(false);
    setSelectedCourse(undefined);
  };

  const handleDeleteCourse = (id: string) => {
    setCourses(courses.filter(course => course.id !== id));
  };

  const handleEditCourse = (course: Course) => {
    setSelectedCourse(course);
    setIsDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Courses</h1>
          <button
            onClick={() => setIsDialogOpen(true)}
            className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Add Course
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map(course => (
            <CourseCard
              key={course.id}
              course={course}
              onDelete={handleDeleteCourse}
              onEdit={handleEditCourse}
            />
          ))}
        </div>

        <CourseDialog
          isOpen={isDialogOpen}
          course={selectedCourse}
          onClose={() => {
            setIsDialogOpen(false);
            setSelectedCourse(undefined);
          }}
          onSave={handleSaveCourse}
        />
      </div>
    </div>
  );
}