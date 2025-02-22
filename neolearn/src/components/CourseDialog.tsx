import { useState } from 'react';
import { Course } from '@/types/Course';

interface CourseDialogProps {
  isOpen: boolean;
  course?: Course;
  onClose: () => void;
  onSave: (course: Course) => void;
}

export function CourseDialog({ isOpen, course, onClose, onSave }: CourseDialogProps) {
  const [formData, setFormData] = useState<Course>({
    id: course?.id || crypto.randomUUID(),
    name: course?.name || '',
    subject: course?.subject || '',
    syllabus: course?.syllabus || '',
    textbook: course?.textbook || '',
    description: course?.description || '',
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">
          {course ? 'Edit Course' : 'Add New Course'}
        </h2>
        <form onSubmit={(e) => {
          e.preventDefault();
          onSave(formData);
        }}>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Course Name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 bg-gray-700 rounded"
            />
            <input
              type="text"
              placeholder="Subject"
              value={formData.subject}
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
              className="w-full px-3 py-2 bg-gray-700 rounded"
            />
            <textarea
              placeholder="Syllabus"
              value={formData.syllabus}
              onChange={(e) => setFormData({...formData, syllabus: e.target.value})}
              className="w-full px-3 py-2 bg-gray-700 rounded"
            />
            <input
              type="text"
              placeholder="Textbook"
              value={formData.textbook}
              onChange={(e) => setFormData({...formData, textbook: e.target.value})}
              className="w-full px-3 py-2 bg-gray-700 rounded"
            />
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 bg-gray-700 rounded"
            />
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}