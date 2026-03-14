// src/hooks/useFormations.js
import { useState, useEffect } from 'react';

const generateFakeFormations = () => {
  const categories = ['Développement', 'Design', 'Marketing', 'Business', 'Photographie'];
  const statuses = ['draft', 'upcoming', 'ongoing', 'completed', 'cancelled'];
  
  return Array.from({ length: 12 }, (_, i) => ({
    _id: `fake-id-${i}`,
    InstructorId: 'fake-instructor-id',
    title: `Formation ${i + 1} : ${['React', 'Node.js', 'UI/UX', 'SEO', 'Leadership'][i % 5]}`,
    category: categories[i % categories.length],
    description: `Cette formation vous apprendra tout sur ${['React', 'Node.js', 'UI/UX', 'SEO', 'Leadership'][i % 5]}. Un cours complet avec des projets pratiques.`,
    coverImage: `https://source.unsplash.com/random/300x200?${i}`,
    status: statuses[i % statuses.length],
    totalHours: [10, 15, 20, 25, 30][i % 5],
    averageRating: (Math.random() * 5).toFixed(1),
    lessons: Array.from({ length: [3, 5, 7, 4][i % 4] }, (_, j) => `fake-lesson-${j}`),
    maxSeats: [20, 30, 50, 100][i % 4],
    enrolledSeats: Math.floor(Math.random() * [20, 30, 50, 100][i % 4]),
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)),
    endAt: new Date(Date.now() + Math.floor(Math.random() * 10000000000)),
    updatedAt: new Date(),
  }));
};

const useFormations = () => {
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFormations = async () => {
    setLoading(true);
    try {
      // Simuler un délai réseau
      await new Promise(resolve => setTimeout(resolve, 800));
      const fakeData = generateFakeFormations();
      setFormations(fakeData);
      setError(null);
    } catch (err) {
      setError('Failed to load formations');
    } finally {
      setLoading(false);
    }
  };

  const getFormationById = async (id) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const fakeData = generateFakeFormations();
      return fakeData.find(f => f._id === id) || null;
    } catch (err) {
      throw new Error('Failed to fetch formation');
    }
  };

  const createFormation = async (formData) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 700));
      const newFormation = {
        ...formData,
        _id: `fake-id-${formations.length + 1}`,
        InstructorId: 'fake-instructor-id',
        lessons: [],
        enrolledSeats: 0,
        averageRating: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setFormations(prev => [...prev, newFormation]);
      return newFormation;
    } catch (err) {
      throw new Error('Failed to create formation');
    }
  };

  const updateFormation = async (id, formData) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 700));
      setFormations(prev => 
        prev.map(formation => 
          formation._id === id ? { ...formation, ...formData, updatedAt: new Date() } : formation
        )
      );
      return { ...formData, _id: id };
    } catch (err) {
      throw new Error('Failed to update formation');
    }
  };

  return {
    formations,
    loading,
    error,
    fetchFormations,
    getFormationById,
    createFormation,
    updateFormation,
  };
};

export default useFormations;