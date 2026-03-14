import React, { useState, useEffect } from 'react';
import { FaCheck, FaTimes, FaChalkboardTeacher, FaCalendarAlt, FaTags } from 'react-icons/fa';
import { MdPendingActions } from 'react-icons/md';
import './TableProf.scss';

function TableProf() {
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFormations = async () => {
      try {
        setLoading(true);
        const res = await fetch('http://localhost:5000/api/formations/alladmin');
        if (!res.ok) throw new Error('Erreur lors du chargement des formations');
        const data = await res.json();
        setFormations(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFormations();
  }, []);

  const handleStatusUpdate = async (id, accepted) => {
    try {
      const res = await fetch(`http://localhost:5000/api/formations/${id}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accepted }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Erreur lors de la mise à jour');
      }

      setFormations(prevFormations => 
        prevFormations.map(formation => 
          formation._id === id ? { ...formation, accepted } : formation
        )
      );

    } catch (err) {
      alert(`Erreur: ${err.message}`);
    }
  };

  const getAcceptedIcon = (accepted) => {
    if (accepted === true) return <FaCheck className="status-icon approved" title="Approuvé" />;
    if (accepted === false) return <FaTimes className="status-icon rejected" title="Rejeté" />;
    return <MdPendingActions className="status-icon pending" title="En attente" />;
  };

  const getAcceptedText = (accepted) => {
    if (accepted === true) return "Approuvé";
    if (accepted === false) return "Rejeté";
    return "En attente";
  };

   const getTrainerName = (instructor) => {
    if (!instructor) return "Non assigné";
    if (typeof instructor === 'string') return instructor;
    // Accès au nom via instructor.name ou instructor.InstructorId?.name selon la structure réelle
    return instructor.name || instructor.InstructorId?.name || "Formateur inconnu";
  };

  const getFormationDate = (formation) => {
    return formation.createdAt 
      ? new Date(formation.createdAt).toLocaleDateString() 
      : "Date non disponible";
  };

  if (loading) return <div className="loading">Chargement...</div>;
  if (error) return <div className="error">Erreur: {error}</div>;

  return (
    <div className="training-confirmation">
      <div className="header">
        <h1 className="title">
          <FaChalkboardTeacher className="header-icon" />
          Confirmations de Formations
        </h1>
        <p className="subtitle">Gérez les formations proposées par les formateurs</p>
      </div>

      <div className="table-container">
        <table className="trainings-table">
          <thead>
            <tr>
              <th>Titre</th>
              <th><FaChalkboardTeacher /> Formateur</th>
              <th><FaCalendarAlt /> Date</th>
              <th><FaTags /> Catégorie</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {formations.map((formation) => (
              <tr key={formation._id}>
                <td>{formation.title || "Sans titre"}</td>
                <td>{getTrainerName(formation.InstructorId)}</td>
                <td>{getFormationDate(formation)}</td>
                <td>
                  <span className="category-badge">
                    {formation.category || "Non catégorisé"}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${getAcceptedText(formation.accepted).toLowerCase().replace(' ', '-')}`}>
                    {getAcceptedIcon(formation.accepted)}
                    {getAcceptedText(formation.accepted)}
                  </span>
                </td>
                <td className="actions">
                  <button
                    className="btn approve"
                    disabled={formation.accepted === true}
                    onClick={() => handleStatusUpdate(formation._id, true)}
                    title="Approuver"
                  >
                    <FaCheck />
                  </button>
                  <button
                    className="btn reject"
                    disabled={formation.accepted === false}
                    onClick={() => handleStatusUpdate(formation._id, false)}
                    title="Rejeter"
                  >
                    <FaTimes />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TableProf;