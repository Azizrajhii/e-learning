import { useState, useEffect, useMemo, useCallback } from "react";
import "./TableUsers.scss";
import {
  MdOutlineEdit,
  MdDeleteOutline,
  MdSearch,
  MdClear,
} from "react-icons/md";
import { FaPlus } from "react-icons/fa";
import { BiShow, BiSolidHide } from "react-icons/bi";
import { FaRegSave } from "react-icons/fa";
import { toast } from "react-toastify";

export default function TableUsers() {
  const [users, setUsers] = useState([]);
  const [pwdVisibility, setPwdVisibility] = useState({});
  const [editIndex, setEditIndex] = useState(null);
  const [editedUser, setEditedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    pwd: "",
  });
  const [showNewPassword, setShowNewPassword] = useState(false);

  const openAddModal = () => {
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setNewUser({ name: "", email: "", pwd: "" });
    setShowNewPassword(false);
  };

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/user/get-all-users");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      toast.error("Error fetching users");
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    const term = searchTerm.toLowerCase();
    return users.filter(
      (user) =>
        user.name?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term)
    );
  }, [users, searchTerm]);

  const togglePwdVisibility = useCallback((index) => {
    setPwdVisibility((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  }, []);

  const handleEdit = useCallback(
    (index) => {
      setEditIndex(index);
      setEditedUser({ ...filteredUsers[index] });
    },
    [filteredUsers]
  );

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setEditedUser((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSave = useCallback(
    async (index) => {
      if (!editedUser) return;
      try {
        setIsLoading(true);
        const userId = filteredUsers[index]._id;
        const response = await fetch("http://localhost:5000/api/user/update-user", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            name: editedUser.name,
            email: editedUser.email,
            password: editedUser.pwd,
          }),
        });

        const data = await response.json();
        if (response.ok) {
          toast.success("User updated successfully");
          fetchUsers();
          setEditIndex(null);
        } else {
          throw new Error(data.message || "Failed to update user");
        }
      } catch (error) {
        toast.error(error.message);
        console.error("Update error:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [editedUser, filteredUsers, fetchUsers]
  );

  const handleDelete = useCallback(
    async (index) => {
      if (window.confirm("Are you sure you want to delete this user?")) {
        try {
          setIsLoading(true);
          const userId = filteredUsers[index]._id;
          const response = await fetch(
            `http://localhost:5000/api/user/delete-user/${userId}`,
            { method: "DELETE" }
          );
          if (response.ok) {
            toast.success("User deleted successfully");
            fetchUsers();
          } else {
            throw new Error("Failed to delete user");
          }
        } catch (error) {
          toast.error(error.message);
          console.error("Delete error:", error);
        } finally {
          setIsLoading(false);
        }
      }
    },
    [filteredUsers, fetchUsers]
  );

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTerm("");
  }, []);

  const handleNewUserChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };

const handleCreateUser = async () => {
  if (!newUser.name || !newUser.email || !newUser.pwd) {
    toast.warn("All fields are required");
    return;
  }

  try {
    setIsLoading(true);

    // تحويل pwd إلى password عند الإرسال
    const userPayload = {
      name: newUser.name,
      email: newUser.email,
      password: newUser.pwd, // هنا
    };
    console.log(userPayload);

    const response = await fetch("http://localhost:5000/api/user/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userPayload),
    });

    const data = await response.json();

    if (response.ok) {
      toast.success("User created successfully");
      fetchUsers();
      closeAddModal();
    } else {
      throw new Error(data.message || "Failed to create user");
    }
  } catch (error) {
    toast.error(error.message);
    console.error("Create user error:", error);
  } finally {
    setIsLoading(false);
  }
};


  if (isLoading && users.length === 0) {
    return <div className="loading-spinner">Loading...</div>;
  }

  return (
    <div className="table-users-wrapper">
      <div className="table-users-additional-table">
        <div className="table-users-header">
          <h3>User Management</h3>
          <button className="table-users-add-button" onClick={openAddModal}>
            <FaPlus /> Add User
          </button>
        </div>

        <div className="table-users-search">
          <MdSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          {searchTerm && (
            <button onClick={clearSearch} className="clear-search">
              <MdClear />
            </button>
          )}
        </div>

        <div className="table-users-table-container">
          {filteredUsers.length === 0 ? (
            <div className="no-results">No users found</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Password</th>
                  <th style={{ width: "140px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <tr key={user._id} className="table-users-row">
                    {editIndex === index ? (
                      <>
                        <td>
                          <input
                            name="name"
                            value={editedUser?.name || ""}
                            onChange={handleChange}
                            placeholder="Full name"
                          />
                        </td>
                        <td>
                          <input
                            name="email"
                            type="email"
                            value={editedUser?.email || ""}
                            onChange={handleChange}
                            placeholder="Email address"
                          />
                        </td>
                        <td className="table-users-pwd-cell">
                          <input
                            name="pwd"
                            type={pwdVisibility[index] ? "text" : "password"}
                            value={editedUser?.pwd || ""}
                            onChange={handleChange}
                            placeholder="New password"
                          />
                          <button
                            type="button"
                            className="table-users-toggle-pwd"
                            onClick={() => togglePwdVisibility(index)}
                          >
                            {pwdVisibility[index] ? <BiSolidHide /> : <BiShow />}
                          </button>
                        </td>
                        <td>
                          <div className="table-users-action-buttons">
                            <button
                              className="table-users-save-button"
                              onClick={() => handleSave(index)}
                              disabled={isLoading}
                            >
                              <FaRegSave />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>{user.name || "—"}</td>
                        <td>{user.email}</td>
                        <td className="table-users-pwd-cell">
                          <span className="table-users-pwd-text">
                            {pwdVisibility[index] ? user.pwd : "••••••••"}
                          </span>
                          <button
                            type="button"
                            className="table-users-toggle-pwd"
                            onClick={() => togglePwdVisibility(index)}
                          >
                            {pwdVisibility[index] ? <BiSolidHide /> : <BiShow />}
                          </button>
                        </td>
                        <td>
                          <div className="table-users-action-buttons">
                            <button
                              className="table-users-modify-button"
                              onClick={() => handleEdit(index)}
                              disabled={isLoading}
                            >
                              <MdOutlineEdit />
                            </button>
                            <button
                              className="table-users-delete-button"
                              onClick={() => handleDelete(index)}
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

      {isAddModalOpen && (
        <div className="table-users-modal-overlay">
          <div className="table-users-modal-content">
            <div className="table-users-modal-header">
              <h3>Create New User</h3>
              <button
                className="table-users-modal-close"
                onClick={closeAddModal}
              >
                &times;
              </button>
            </div>

            <div className="table-users-modal-body">
              <div className="table-users-modal-form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={newUser.name}
                  onChange={handleNewUserChange}
                  placeholder="Enter full name"
                />
              </div>

              <div className="table-users-modal-form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={newUser.email}
                  onChange={handleNewUserChange}
                  placeholder="Enter email address"
                />
              </div>

              <div className="table-users-modal-form-group">
                <label>Password</label>
                <div className="table-users-modal-password-input">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    name="pwd"
                    value={newUser.pwd}
                    onChange={handleNewUserChange}
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    className="table-users-modal-toggle-pwd"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <BiSolidHide /> : <BiShow />}
                  </button>
                </div>
              </div>
            </div>

            <div className="table-users-modal-footer">
              <button
                className="table-users-modal-cancel"
                onClick={closeAddModal}
              >
                Cancel
              </button>
              <button
                className="table-users-modal-confirm"
                onClick={handleCreateUser}
              >
                Create User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
