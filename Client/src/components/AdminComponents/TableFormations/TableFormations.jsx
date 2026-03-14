import { useState, useMemo, useEffect, useCallback, Fragment } from "react";
import "./TableFormations.scss";
import {
  MdOutlineEdit,
  MdDeleteOutline,
  MdSearch,
  MdClear,
  MdExpandMore,
  MdExpandLess,
  MdVideoLibrary,
  MdPictureAsPdf,
} from "react-icons/md";
import { FaRegSave, FaStar } from "react-icons/fa";
import { FaPlus } from "react-icons/fa";

export default function TableFormations() {
  const [formations, setFormations] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [editedFormation, setEditedFormation] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRows, setExpandedRows] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const openAddModal = () => {
    setIsAddModalOpen(true);
  };

  const fetchFormations = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/formations/alladmin");
      const data = await response.json();

      // Formatage des données pour extraire le nom de l'instructeur
      const formattedData = data.map(formation => ({
        ...formation,
        instructor: formation.InstructorId?.name || 'Unknown Instructor',
        instructorId: formation.InstructorId?._id || null
      }));

      setFormations(formattedData);
    } catch (error) {
      console.error("Error fetching formations:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFormations();
  }, [fetchFormations]);

  const filteredFormations = useMemo(() => {
    if (!searchTerm) return formations;
    const term = searchTerm.toLowerCase();
    return formations.filter(
      (formation) =>
        formation.title.toLowerCase().includes(term) ||
        (formation.instructor && formation.instructor.toLowerCase().includes(term)) ||
        formation.category.toLowerCase().includes(term)
    );
  }, [formations, searchTerm]);

  const handleEdit = useCallback((index) => {
    const formation = filteredFormations[index];
    setExpandedRows((prev) => ({
      ...prev,
      [formation._id]: true,
    }));
    setEditIndex(index);
    setEditedFormation({
      ...formation,
      contents: formation.contents?.map(content => ({
        _id: content._id,
        name: content.name || content.title,
        type: content.content?.type || content.type,
        url: content.content?.url || content.url
      })) || []
    });
  }, [filteredFormations]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setEditedFormation((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleLessonChange = useCallback((lessonIndex, field, value) => {
    setEditedFormation((prev) => {
      const newContents = [...prev.contents];

      if (field === 'url' && value) {
        value = value.replace(/"/g, '');
        const type = newContents[lessonIndex]?.type;
        if (type === 'video' && value.endsWith('.pdf')) {
          value = value.replace('.pdf', '');
        } else if (type === 'pdf' && !value.endsWith('.pdf')) {
          value = `${value}.pdf`;
        }
      }

      newContents[lessonIndex] = {
        ...newContents[lessonIndex],
        [field]: value,
      };
      return { ...prev, contents: newContents };
    });
  }, []);

  const handleSave = useCallback(async (index) => {
    if (!editedFormation) return;
    try {
      setIsLoading(true);
      const formationId = filteredFormations[index]._id;

      const payload = {
        formationId,
        title: editedFormation.title || filteredFormations[index].title,
        description: editedFormation.description || filteredFormations[index].description,
        category: editedFormation.category || filteredFormations[index].category,
        instructor: editedFormation.instructor || filteredFormations[index].instructor,
        status: editedFormation.status || filteredFormations[index].status,
        enrolledSeats: editedFormation.enrolledSeats || filteredFormations[index].enrolledSeats,
        maxSeats: editedFormation.maxSeats || filteredFormations[index].maxSeats,
        averageRating: editedFormation.averageRating || filteredFormations[index].averageRating,
        totalHours: editedFormation.totalHours || filteredFormations[index].totalHours,
        createdAt: editedFormation.createdAt || filteredFormations[index].createdAt,
        endAt: editedFormation.endAt || filteredFormations[index].endAt,
        contents: editedFormation.contents?.map(content => ({
          _id: content._id,
          name: content.name,
          type: content.type,
          url: content.url
        })) || []
      };

      const response = await fetch("http://localhost:5000/api/formations/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update formation");
      }

      const data = await response.json();
      setFormations(prev => prev.map(f =>
        f._id === data.formation._id ? {
          ...f,
          ...data.formation,
          instructor: data.formation.InstructorId?.name || editedFormation.instructor
        } : f
      ));

      setEditIndex(null);
      setExpandedRows(prev => ({
        ...prev,
        [formationId]: false,
      }));
    } catch (error) {
      console.error("Update error:", error);
      alert(`Update failed: ${error.message}`);
      fetchFormations();
    } finally {
      setIsLoading(false);
    }
  }, [editedFormation, filteredFormations, fetchFormations]);

  const handleDelete = useCallback(async (index) => {
    if (window.confirm("Are you sure you want to delete this formation?")) {
      try {
        setIsLoading(true);
        const formationId = filteredFormations[index]._id;
        const response = await fetch(
          `http://localhost:5000/api/formations/delete/${formationId}`,
          { method: "DELETE" }
        );
        if (response.ok) {
          fetchFormations();
        } else {
          throw new Error("Failed to delete formation");
        }
      } catch (error) {
        console.error("Delete error:", error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [filteredFormations, fetchFormations]);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const clearSearch = () => {
    setSearchTerm("");
  };

  const getContentIcon = (type) => {
    switch (type) {
      case "video": return <MdVideoLibrary className="text-red-500" size={30} />;
      case "pdf": return <MdPictureAsPdf className="text-red-600" size={30} />;
      default: return <MdPictureAsPdf className="text-red-600" size={30} />;
    }
  };

  const renderRatingStars = (rating) => (
    <div className="flex items-center">
      <FaStar className="text-yellow-400" />
      <span className="ml-1">{rating}</span>
    </div>
  );

  const toggleRowExpand = (id) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="table-formations-wrapper">
      <div className="table-formations-additional-table">
        <div className="table-formations-header">
          <h3>Formations Management</h3>
          <button
            className="table-users-add-button"
            onClick={openAddModal}
            aria-label="Add new user"
          >
            <FaPlus /> Add Formation
          </button>
        </div>

        <div className="table-formations-search">
          <MdSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by title, instructor or category..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          {searchTerm && (
            <button onClick={clearSearch} className="clear-search" aria-label="Clear search">
              <MdClear />
            </button>
          )}
        </div>

        <div className="table-formations-table-container">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Instructor</th>
                <th>Category</th>
                <th>Status</th>
                <th>Seats</th>
                <th>Rating</th>
                <th style={{ width: "140px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFormations.map((formation, index) => (
                <Fragment key={formation._id}>
                  <tr className="table-formations-row">
                    {editIndex === index ? (
                      <>
                        <td>
                          <input
                            name="title"
                            value={editedFormation.title}
                            onChange={handleChange}
                          />
                        </td>
                        <td>
                          <input
                            name="instructor"
                            value={editedFormation.instructor}
                            onChange={handleChange}
                          />
                        </td>
                        <td>
                          <select
                            name="category"
                            value={editedFormation.category}
                            onChange={handleChange}
                          >
                            <option value="Web Development">Web Development</option>
                            <option value="Backend Development">Backend Development</option>
                            <option value="Data Science">Data Science</option>
                            <option value="Mobile Development">Mobile Development</option>
                          </select>
                        </td>
                        <td>
                          <select
                            name="status"
                            value={editedFormation.status}
                            onChange={handleChange}
                          >
                            <option value="Active">Active</option>
                            <option value="Completed">Completed</option>
                            <option value="Upcoming">Upcoming</option>
                          </select>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <input
                              name="enrolledSeats"
                              type="number"
                              value={editedFormation.enrolledSeats}
                              onChange={handleChange}
                              className="w-16"
                            />
                            <span>/</span>
                            <input
                              name="maxSeats"
                              type="number"
                              value={editedFormation.maxSeats}
                              onChange={handleChange}
                              className="w-16"
                            />
                          </div>
                        </td>
                        <td>
                          <input
                            name="averageRating"
                            type="number"
                            step="0.1"
                            min="0"
                            max="5"
                            value={editedFormation.averageRating}
                            onChange={handleChange}
                            className="w-20"
                          />
                        </td>
                        <td>
                          <div className="table-formations-action-buttons">
                            <button
                              className="table-formations-save-button"
                              onClick={() => handleSave(index)}
                              aria-label="Save changes"
                              disabled={isLoading}
                            >
                              <FaRegSave />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>{formation.title}</td>
                        <td>{formation.instructor}</td>
                        <td>{formation.category}</td>
                        <td>
                          <span className={`status-badge ${formation.status.toLowerCase()}`}>
                            {formation.status.charAt(0).toUpperCase() + formation.status.slice(1)}
                          </span>
                        </td>
                        <td>
                          {Array.isArray(formation.enrolledSeats)
                            ? formation.enrolledSeats.length
                            : 0}/{formation.maxSeats}
                        </td>                        <td>{renderRatingStars(formation.averageRating)}</td>
                        <td>
                          <div className="table-formations-action-buttons">
                            <button
                              className="table-formations-modify-button"
                              onClick={() => handleEdit(index)}
                              aria-label="Edit formation"
                              disabled={isLoading}
                            >
                              <MdOutlineEdit />
                            </button>
                            <button
                              className="table-formations-delete-button"
                              onClick={() => handleDelete(index)}
                              aria-label="Delete formation"
                              disabled={isLoading}
                            >
                              <MdDeleteOutline />
                            </button>
                            <button
                              className="table-formations-expand-button"
                              onClick={() => toggleRowExpand(formation._id)}
                              disabled={isLoading}
                            >
                              {expandedRows[formation._id] ? <MdExpandLess /> : <MdExpandMore />}
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                  {expandedRows[formation._id] && (
                    <tr className="table-formations-details-row">
                      <td colSpan="7">
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-semibold mb-2">Details</h4>
                              {editIndex === index ? (
                                <>
                                  <div className="mb-3">
                                    <label className="block text-sm font-medium mb-1">
                                      Description
                                    </label>
                                    <textarea
                                      name="description"
                                      value={editedFormation.description}
                                      onChange={handleChange}
                                      className="w-full p-2 border rounded"
                                      rows="3"
                                    />
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="block text-sm font-medium mb-1">
                                        Start Date
                                      </label>
                                      <input
                                        type="date"
                                        name="createdAt"
                                        value={editedFormation.createdAt ? new Date(editedFormation.createdAt).toISOString().split('T')[0] : ''}
                                        onChange={handleChange}
                                        className="w-full p-1 border rounded"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium mb-1">
                                        End Date
                                      </label>
                                      <input
                                        type="date"
                                        name="endAt"
                                        value={editedFormation.endAt ? new Date(editedFormation.endAt).toISOString().split('T')[0] : ''}
                                        onChange={handleChange}
                                        className="w-full p-1 border rounded"
                                      />
                                    </div>
                                  </div>
                                  <div className="mt-3">
                                    <label className="block text-sm font-medium mb-1">
                                      Total Hours
                                    </label>
                                    <input
                                      type="number"
                                      name="totalHours"
                                      value={editedFormation.totalHours}
                                      onChange={handleChange}
                                      className="w-full p-1 border rounded"
                                    />
                                  </div>
                                </>
                              ) : (
                                <>
                                  <p className="mb-3">{formation.description}</p>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-sm font-medium">Start Date</p>
                                      <p>{new Date(formation.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium">End Date</p>
                                      <p>{new Date(formation.endAt).toLocaleDateString()}</p>
                                    </div>
                                  </div>
                                  <p className="mt-3">
                                    <span className="text-sm font-medium">Total Hours: </span>
                                    {formation.totalHours}
                                  </p>
                                </>
                              )}
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2">Contents</h4>
                              {editIndex === index ? (
                                editedFormation.contents?.map((content, contentIndex) => (
                                  <div key={contentIndex} className="mb-4 p-3 border rounded">
                                    <div className="mb-2">
                                      <label className="block text-sm font-medium mb-1">
                                        Content Name
                                      </label>
                                      <input
                                        type="text"
                                        value={content.name}
                                        onChange={(e) =>
                                          handleLessonChange(
                                            contentIndex,
                                            "name",
                                            e.target.value
                                          )
                                        }
                                        className="w-full p-1 border rounded"
                                      />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mb-2">
                                      <div>
                                        <label className="block text-sm font-medium mb-1">
                                          Content Type
                                        </label>
                                        <select
                                          value={content.type}
                                          onChange={(e) => {
                                            handleLessonChange(
                                              contentIndex,
                                              "type",
                                              e.target.value
                                            );
                                            if (content.url) {
                                              handleLessonChange(
                                                contentIndex,
                                                "url",
                                                content.url
                                              );
                                            }
                                          }}
                                          className="w-full p-1 border rounded"
                                        >
                                          <option value="video">Video</option>
                                          <option value="pdf">PDF</option>
                                        </select>
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium mb-1">
                                          URL
                                        </label>
                                        <input
                                          type="url"
                                          value={content.url || ""}
                                          onChange={(e) =>
                                            handleLessonChange(
                                              contentIndex,
                                              "url",
                                              e.target.value
                                            )
                                          }
                                          className={`w-full p-1 border rounded ${content.type === 'video' && content.url?.endsWith('.pdf')
                                            ? 'border-red-500'
                                            : content.type === 'pdf' && !content.url?.endsWith('.pdf')
                                              ? 'border-yellow-500'
                                              : ''
                                            }`}
                                          placeholder={
                                            content.type === 'video'
                                              ? 'https://example.com/video'
                                              : 'https://example.com/document.pdf'
                                          }
                                        />
                                        {content.type === 'video' && content.url?.endsWith('.pdf') && (
                                          <p className="text-red-500 text-xs mt-1">
                                            Video URL should not end with .pdf
                                          </p>
                                        )}
                                        {content.type === 'pdf' && content.url && !content.url.endsWith('.pdf') && (
                                          <p className="text-yellow-500 text-xs mt-1">
                                            PDF URL should normally end with .pdf
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="space-y-3 flex flex-col gap-2">
                                  {formation.contents?.length > 0 ? (
                                    formation.contents.map((content, index) => (
                                      <div key={index} className="p-3 border rounded">
                                        <div className="flex justify-between items-start">
                                          <h5 className="font-medium">{content.name}</h5>
                                          {getContentIcon(content.type)}
                                        </div>
                                        <div className="mt-2 flex items-center justify-between text-sm">
                                          {content.url ? (
                                            <a
                                              href={content.url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-blue-600 hover:underline"
                                            >
                                              View Content
                                            </a>
                                          ) : (
                                            <span className="text-gray-500">No URL provided</span>
                                          )}
                                        </div>
                                      </div>
                                    ))
                                  ) : (
                                    <p>No contents available</p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {isAddModalOpen && (
        <div className="table-users-modal-overlay">
          <div className="table-users-modal-content">
            <div className="table-users-modal-header">
              <h3>Create New Formation</h3>
              <button
                className="table-users-modal-close"
                aria-label="Close modal"
                onClick={() => { setIsAddModalOpen(false) }}
              >
                &times;
              </button>
            </div>

            <div className="table-users-modal-body">
              <div className="table-users-modal-form-group">
                <label>Title</label>
                <input type="text" name="name" placeholder="Enter Title" />
              </div>

              <div className="table-users-modal-form-group">
                <label>Instructor</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter Instructor"
                />
              </div>

              <div className="table-users-modal-form-group">
                <label>Category</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter Category"
                />
              </div>
              <div className="table-users-modal-form-group">
                <label>Seats</label>
                <input
                  type="numeric"
                  name="Seats"
                  placeholder="Enter Seats"
                />
              </div>

            </div>

            <div className="table-users-modal-footer">
              <button className="table-users-modal-cancel" onClick={() => { setIsAddModalOpen(false) }}
              >Cancel</button>
              <button className="table-users-modal-confirm" onClick={() => { setIsAddModalOpen(false) }}
              >Create Formation</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

}