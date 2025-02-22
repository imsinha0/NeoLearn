import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Course } from '../types/Course';

interface CourseCardProps {
  course: Course;
  onDelete: (id: string) => void;
  onEdit: (course: Course) => void;
}

export function CourseCard({ course, onDelete, onEdit }: CourseCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const router = useRouter();

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete(course.id);
    } else {
      setShowDeleteConfirm(true);
    }
  };

  const handleClick = () => {
    router.push(`/chat?courseId=${course.id}`);
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-2">{course.title}</h3>

      <div className="flex space-x-2">
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(course); }}
          className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700"
        >
          Edit
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); handleDelete(); }}
          className="px-3 py-1 bg-red-600 rounded hover:bg-red-700"
        >
          {showDeleteConfirm ? 'Confirm Delete?' : 'Delete'}
        </button>
      </div>
    </div>
  );
}