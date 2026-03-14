import { useState, useMemo, useCallback, useEffect } from "react";
import "./TableProfiles.scss";
import { MdOutlineEdit, MdDeleteOutline, MdSearch, MdClear } from "react-icons/md";
import { FaRegSave } from "react-icons/fa";
import { toast } from "react-toastify";

export default function TableProfiles() {
  const [profiles, setProfiles] = useState([]);
  const [editedProfile, setEditedProfile] = useState(null);
  const [editIndex, setEditIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchProfiles = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/profile/getAllprofiles");
      const data = await response.json();
      setProfiles(data);
      console.log("Profile row debug:", profiles);
    } catch (error) {
      toast.error("Error fetching profiles");
      console.error("Error fetching profiles:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const filteredProfiles = useMemo(() => {
    if (!searchTerm) return profiles;
    const term = searchTerm.toLowerCase();
    return profiles.filter(
      (profile) =>
        profile.name.toLowerCase().includes(term) ||
        profile.lastName.toLowerCase().includes(term) ||
        profile.email.toLowerCase().includes(term)
    );
  }, [profiles, searchTerm]);

  const handleEdit = useCallback((index) => {
    setEditIndex(index);
    setEditedProfile({ ...filteredProfiles[index] });
  }, [filteredProfiles]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setEditedProfile((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSave = useCallback(async (index) => {
    if (!editedProfile) return;

    try {
      setIsLoading(true);
      const profileId = filteredProfiles[index]._id;
    const response = await fetch(`http://localhost:5000/api/profile/admin/${profileId}`, {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(editedProfile),
});


      const data = await response.json();
      if (response.ok) {
        toast.success("Profile updated successfully");
        fetchProfiles(); // Rafraîchir les données
        setEditIndex(null);
      } else {
        throw new Error(data.message || "Failed to update profile");
      }
    } catch (error) {
      toast.error(error.message);
      console.error("Update error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [editedProfile, filteredProfiles, fetchProfiles]);

  const handleDelete = useCallback(async (index) => {
    if (window.confirm("Are you sure you want to delete this profile?")) {
      try {
        setIsLoading(true);
        const profileId = filteredProfiles[index]._id;
        const response = await fetch(`http://localhost:5000/api/profile/${profileId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          toast.success("Profile deleted successfully");
          fetchProfiles(); // Rafraîchir les données
        } else {
          throw new Error("Failed to delete profile");
        }
      } catch (error) {
        toast.error(error.message);
        console.error("Delete error:", error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [filteredProfiles, fetchProfiles]);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTerm("");
  }, []);

  if (isLoading && profiles.length === 0) {
    return <div className="loading-spinner">Loading...</div>;
  }

  return (
    <div className="table-profiles-wrapper">
      <div className="table-profiles-additional-table">
        <div className="table-profiles-header">
          <h3>Profiles Management</h3>
          <span className="profile-count">{filteredProfiles.length} profiles</span>
        </div>

        <div className="table-profiles-search">
          <MdSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by name, last name, or email..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          {searchTerm && (
            <button onClick={clearSearch} className="clear-search" aria-label="Clear search">
              <MdClear />
            </button>
          )}
        </div>

        <div className="table-profiles-table-container">
          {filteredProfiles.length === 0 ? (
            <div className="no-results">No profiles found</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Name</th>
                  <th>Last Name</th>
                  <th>Sex</th>
                  <th>Followers</th>
                  <th>Following</th>
                  <th>Uploads</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProfiles.map((profile, index) => (
                  <tr key={profile._id} className="table-profiles-row">
                    {editIndex === index ? (
                      <>
                        <td>
                          <input
                            name="email"
                            value={editedProfile?.email || ""}
                            onChange={handleChange}
                            placeholder="Email"
                          />
                        </td>
                        <td>
                          <input
                            name="name"
                            value={editedProfile?.name || ""}
                            onChange={handleChange}
                            placeholder="First name"
                          />
                        </td>
                        <td>
                          <input
                            name="lastName"
                            value={editedProfile?.lastName || ""}
                            onChange={handleChange}
                            placeholder="Last name"
                          />
                        </td>
                        <td>
                          <input
                            name="sex"
                            value={editedProfile?.sex || ""}
                            onChange={handleChange}
                            placeholder="Sex"
                          />
                        </td>
                        <td>
                          <input
                            name="followers"
                            value={editedProfile?.followersCount || ""}
                            onChange={handleChange}
                            placeholder="Followers"
                          />
                        </td>
                        <td>
                          <input
                            name="following"
                            value={editedProfile?.followingCount || ""}
                            onChange={handleChange}
                            placeholder="Following"
                          />
                        </td>
                        <td>
                          <input
                            name="uploads"
                            value={editedProfile?.uploads || ""}
                            onChange={handleChange}
                            placeholder="Uploads"
                          />
                        </td>
                        <td>
                          <button
                            onClick={() => handleSave(index)}
                            className="table-profiles-save-button"
                            disabled={isLoading}
                          >
                            <FaRegSave />
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>{typeof profile.email === 'object' ? JSON.stringify(profile.email) : profile.email}</td>

                        <td>{profile.name}</td>
                        <td>{profile.lastName}</td>
                        <td>{profile.sex}</td>
                        <td>{profile.followersCount}</td>
<td>{profile.followingCount}</td>
<td>{profile.uploadsCount}</td>

                        <td>
                          <div className="table-profiles-action-buttons">
                            <button
                              className="table-profiles-modify-button"
                              onClick={() => handleEdit(index)}
                              aria-label="Edit profile"
                              disabled={isLoading}
                            >
                              <MdOutlineEdit />
                            </button>
                            <button
                              className="table-profiles-delete-button"
                              onClick={() => handleDelete(index)}
                              aria-label="Delete profile"
                              disabled={isLoading}
                            >
                              <MdDeleteOutline />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
