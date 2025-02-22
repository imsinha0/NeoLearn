import { useState } from 'react';
import type { Course } from '../types/Course';

interface CourseCardProps {
  course: Course;
  onDelete: (id: string) => void;
  onEdit: (course: Course) => void;
}

export function CourseCard({ course, onDelete, onEdit }: CourseCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete(course.id);
    } else {
      setShowDeleteConfirm(true);
    }
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-2">{course.title}</h3>

      <div className="flex space-x-2">
        <button
          onClick={() => onEdit(course)}
          className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          className="px-3 py-1 bg-red-600 rounded hover:bg-red-700"
        >
          {showDeleteConfirm ? 'Confirm Delete?' : 'Delete'}
        </button>
      </div>
    </div>
  );
}