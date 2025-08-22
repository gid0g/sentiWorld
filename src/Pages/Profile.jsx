import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { getUserProfile, updateUserProfile, deleteUserProfile } from "../services/api";
import { Card, Form, Button, Spinner, Alert } from "react-bootstrap";

const Profile = () => {
    const { darkMode } = useTheme();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const handleShow = () => setShowModal(true);
    
    const [profile, setProfile] = useState({
        full_name: "",
        email: "",
        organization: "",
        role: "",
        created_at: "",
    });
    
    useEffect(() => {
        fetchProfile();
    }, []);
    const handleClose = () => {
        setShowModal(false);
        setConfirmText('');
        setIsDeleting(false);
    };

    const handleDelete = async () => {
        if (confirmText === 'DELETE') {
            setIsDeleting(true);
            try {
                await deleteUserProfile(); 
                window.location.href = '/login'; 
            } catch (error) {
                console.error('Error deleting profile:', error);
                setError('Failed to delete account. Please try again.');
                setIsDeleting(false); 
                setShowModal(false); 
            }
        }
    };

    const isDeleteEnabled = confirmText === 'DELETE' && !isDeleting;

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const data = await getUserProfile();
            setProfile(data);
            console.log(data)
        } catch (err) {
            setError("Failed to load profile data. Please try again later.");
            console.error("Profile fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            setError(null);
            setSuccess(false);
            await updateUserProfile(profile);
            setSuccess(true);
        } catch (err) {
            setError("Failed to update profile. Please try again later.");
            console.error("Profile update error:", err);
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
                <Spinner animation="border" variant={darkMode ? "light" : "primary"} />
            </div>
        );
    }

    return (
        <div className="p-4">
            <Card className={`border-0 shadow-sm ${darkMode ? "bg-dark text-light" : "bg-white"}`}>
                <Card.Body>
                    <h4 className={`mb-4 ${darkMode ? "text-light" : "text-dark"}`}>Profile Information</h4>

                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">Profile updated successfully!</Alert>}

                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Full Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="full_name"
                                value={profile.full_name}
                                onChange={handleChange}
                                className={darkMode ? "bg-dark text-light" : ""}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={profile.email}
                                onChange={handleChange}
                                className={darkMode ? "bg-dark text-light" : ""}
                                disabled
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Organization</Form.Label>
                            <Form.Control
                                type="text"
                                name="organization"
                                value={profile.organization}
                                onChange={handleChange}
                                className={darkMode ? "bg-dark text-light" : ""}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Role</Form.Label>
                            <Form.Control
                                type="text"
                                name="role"
                                value={profile.role}
                                disabled
                                className={darkMode ? "bg-dark text-light" : ""}
                            />
                        </Form.Group>

                        <Form.Group className="mb-4">
                            <Form.Label>Account Created</Form.Label>
                            <Form.Control
                                type="text"
                                value={new Date(profile.created_at).toLocaleDateString()}
                                className={darkMode ? "bg-dark text-light" : ""}
                                disabled
                            />
                        </Form.Group>

                        <div className="d-flex justify-content-between align-items-center mt-4">

                            <button
                                type="button"
                                className="btn btn-danger px-4 py-2"
                                onClick={handleShow}
                            >
                                Delete Account
                            </button>
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={saving}
                                className="px-4 py-2"
                            >
                                {saving ? (
                                    <>
                                        <Spinner
                                            as="span"
                                            animation="border"
                                            size="sm"
                                            role="status"
                                            aria-hidden="true"
                                            className="me-2"
                                        />
                                        Saving...
                                    </>
                                ) : (
                                    "Save Changes"
                                )}
                            </Button>
                        </div>

                        <div className="container mt-5">
                            {showModal && (
                                <>
                                    <div
                                        className="modal fade show"
                                        style={{ display: 'block' }}
                                        tabIndex="-1"
                                        role="dialog"
                                    >
                                        <div className="modal-dialog modal-dialog-centered" role="document">
                                            <div
                                                className={`modal-content ${darkMode ? 'bg-dark text-white' : 'bg-white text-dark'}`}
                                            >
                                                <div className="modal-header border-0 pb-0">
                                                    <h5 className="modal-title fw-bold text-danger">Delete Your Account</h5>
                                                    <button
                                                        type="button"
                                                        className="btn-close"
                                                        onClick={handleClose}
                                                        disabled={isDeleting}
                                                    ></button>
                                                </div>

                                                <div className="modal-body pt-2">
                                                    <div className="mb-4">
                                                        <p className="mb-3">
                                                            <strong>Are you sure you want to delete your account?</strong>
                                                        </p>
                                                        <p className={`mb-3 ${darkMode ? 'text-light' : 'text-muted'}`}>
                                                            This action is permanent and cannot be undone. All of your data including saved preferences, activity history, and profile information will be permanently deleted.
                                                        </p>
                                                    </div>

                                                    <div className="mb-4">
                                                        <label htmlFor="confirmInput" className="form-label">
                                                            Please type <strong>DELETE</strong> to confirm:
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className={`form-control ${confirmText === 'DELETE' ? 'is-valid' : confirmText ? 'is-invalid' : ''}`}
                                                            id="confirmInput"
                                                            value={confirmText}
                                                            onChange={(e) => setConfirmText(e.target.value)}
                                                            placeholder="Type DELETE here"
                                                            disabled={isDeleting}
                                                        />
                                                        {confirmText && confirmText !== 'DELETE' && (
                                                            <div className="invalid-feedback">
                                                                Please type exactly "DELETE" to confirm
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="modal-footer border-0 pt-0">
                                                    <button
                                                        type="button"
                                                        className="btn btn-secondary"
                                                        onClick={handleClose}
                                                        disabled={isDeleting}
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className={`btn btn-danger ${isDeleting ? 'disabled' : ''}`}
                                                        onClick={handleDelete}
                                                        disabled={!isDeleteEnabled}
                                                    >
                                                        {isDeleting ? (
                                                            <>
                                                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                                Deleting...
                                                            </>
                                                        ) : (
                                                            'Delete Account'
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Modal backdrop */}
                                    <div className="modal-backdrop fade show"></div>
                                </>
                            )}
                        </div>


                    </Form>
                </Card.Body>
            </Card>
        </div>
    );
};

export default Profile; 