import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMe, updatePassword } from '../features/auth/authSlice'; // Fixed: updatePassword is now exported
import { updateUserProfile } from '../features/users/userSlice'; // Changed from updateUser to updateUserProfile
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Container, Row, Col, Card, Button, Alert, Spinner, Tab, Nav, Badge } from 'react-bootstrap';
import { User, Settings, Lock, Bell, Calendar, Shield } from 'lucide-react';
import { toast } from 'react-toastify';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('profile');
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    if (!user) {
      dispatch(getMe());
    }
  }, [dispatch, user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSubmit = async (values, { setSubmitting }) => {
    try {
      // Fixed: using updateUserProfile instead of updateUser
      await dispatch(updateUserProfile({ id: user._id, ...values })).unwrap();
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      // Fixed: updatePassword is now properly imported
      await dispatch(updatePassword(values)).unwrap();
      toast.success('Password updated successfully!');
      resetForm();
    } catch (error) {
      toast.error('Failed to update password');
    } finally {
      setSubmitting(false);
    }
  };

  const profileSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    phone: Yup.string(),
    bio: Yup.string().max(500, 'Bio cannot exceed 500 characters'),
    address: Yup.object().shape({
      street: Yup.string(),
      city: Yup.string(),
      state: Yup.string(),
      zipCode: Yup.string(),
      country: Yup.string()
    })
  });

  const passwordSchema = Yup.object({
    currentPassword: Yup.string().required('Current password is required'),
    newPassword: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('New password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
      .required('Confirm password is required')
  });

  if (loading || !user) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading profile...</p>
      </Container>
    );
  }

  const initialProfileValues = {
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    bio: user.bio || '',
    address: {
      street: user.address?.street || '',
      city: user.address?.city || '',
      state: user.address?.state || '',
      zipCode: user.address?.zipCode || '',
      country: user.address?.country || ''
    }
  };

  const initialPasswordValues = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  return (
    <Container className="py-5">
      <Row>
        <Col lg={3} className="mb-4">
          <Card className="border-0 shadow-sm sticky-top" style={{ top: '20px' }}>
            <Card.Body className="text-center">
              <div className="mb-3">
                <div className="position-relative d-inline-block">
                  <img
                    src={imagePreview || user.profilePhoto || '/default-avatar.jpg'}
                    alt={user.name}
                    className="rounded-circle"
                    style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                  />
                  <label className="position-absolute bottom-0 end-0 bg-primary rounded-circle p-2 cursor-pointer">
                    <User size={16} className="text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      className="d-none"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
              </div>
              
              <h4 className="mb-1">{user.name}</h4>
              <p className="text-muted mb-2">{user.email}</p>
              <Badge bg={
                user.role === 'admin' ? 'danger' :
                user.role === 'organizer' ? 'primary' : 'success'
              } className="mb-3">
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Badge>
              
              <div className="text-start">
                <p>
                  <Calendar size={16} className="me-2 text-muted" />
                  Member since: {new Date(user.createdAt).toLocaleDateString()}
                </p>
                <p>
                  <Shield size={16} className="me-2 text-muted" />
                  Email verified: {user.isEmailVerified ? 'Yes' : 'No'}
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={9}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
                <Nav variant="tabs" className="mb-4">
                  <Nav.Item>
                    <Nav.Link eventKey="profile">
                      <User size={16} className="me-2" />
                      Profile
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="password">
                      <Lock size={16} className="me-2" />
                      Password
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="notifications">
                      <Bell size={16} className="me-2" />
                      Notifications
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="settings">
                      <Settings size={16} className="me-2" />
                      Settings
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
                
                <Tab.Content>
                  {/* Profile Tab */}
                  <Tab.Pane eventKey="profile">
                    <Formik
                      initialValues={initialProfileValues}
                      validationSchema={profileSchema}
                      onSubmit={handleProfileSubmit}
                    >
                      {({ isSubmitting }) => (
                        <Form>
                          <Row>
                            <Col md={6}>
                              <div className="mb-3">
                                <label className="form-label">Full Name *</label>
                                <Field
                                  name="name"
                                  type="text"
                                  className="form-control"
                                />
                                <ErrorMessage name="name" component="div" className="text-danger small" />
                              </div>
                            </Col>
                            <Col md={6}>
                              <div className="mb-3">
                                <label className="form-label">Email *</label>
                                <Field
                                  name="email"
                                  type="email"
                                  className="form-control"
                                />
                                <ErrorMessage name="email" component="div" className="text-danger small" />
                              </div>
                            </Col>
                          </Row>
                          
                          <div className="mb-3">
                            <label className="form-label">Phone Number</label>
                            <Field
                              name="phone"
                              type="tel"
                              className="form-control"
                            />
                          </div>
                          
                          <div className="mb-3">
                            <label className="form-label">Bio</label>
                            <Field
                              name="bio"
                              as="textarea"
                              rows="3"
                              className="form-control"
                              placeholder="Tell us about yourself..."
                            />
                            <ErrorMessage name="bio" component="div" className="text-danger small" />
                          </div>
                          
                          <h5 className="mb-3">Address</h5>
                          <Row>
                            <Col md={6}>
                              <div className="mb-3">
                                <label className="form-label">Street</label>
                                <Field
                                  name="address.street"
                                  type="text"
                                  className="form-control"
                                />
                              </div>
                            </Col>
                            <Col md={6}>
                              <div className="mb-3">
                                <label className="form-label">City</label>
                                <Field
                                  name="address.city"
                                  type="text"
                                  className="form-control"
                                />
                              </div>
                            </Col>
                          </Row>
                          
                          <Row>
                            <Col md={4}>
                              <div className="mb-3">
                                <label className="form-label">State</label>
                                <Field
                                  name="address.state"
                                  type="text"
                                  className="form-control"
                                />
                              </div>
                            </Col>
                            <Col md={4}>
                              <div className="mb-3">
                                <label className="form-label">ZIP Code</label>
                                <Field
                                  name="address.zipCode"
                                  type="text"
                                  className="form-control"
                                />
                              </div>
                            </Col>
                            <Col md={4}>
                              <div className="mb-3">
                                <label className="form-label">Country</label>
                                <Field
                                  name="address.country"
                                  type="text"
                                  className="form-control"
                                />
                              </div>
                            </Col>
                          </Row>
                          
                          <div className="text-end">
                            <Button
                              type="submit"
                              variant="primary"
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? (
                                <>
                                  <Spinner as="span" animation="border" size="sm" className="me-2" />
                                  Saving...
                                </>
                              ) : (
                                'Save Changes'
                              )}
                            </Button>
                          </div>
                        </Form>
                      )}
                    </Formik>
                  </Tab.Pane>
                  
                  {/* Password Tab */}
                  <Tab.Pane eventKey="password">
                    <Formik
                      initialValues={initialPasswordValues}
                      validationSchema={passwordSchema}
                      onSubmit={handlePasswordSubmit}
                    >
                      {({ isSubmitting }) => (
                        <Form>
                          <div className="mb-4">
                            <Alert variant="info">
                              <h6>Password Requirements</h6>
                              <ul className="mb-0">
                                <li>At least 6 characters long</li>
                                <li>Include uppercase and lowercase letters</li>
                                <li>Include at least one number</li>
                              </ul>
                            </Alert>
                          </div>
                          
                          <div className="mb-3">
                            <label className="form-label">Current Password *</label>
                            <Field
                              name="currentPassword"
                              type="password"
                              className="form-control"
                            />
                            <ErrorMessage name="currentPassword" component="div" className="text-danger small" />
                          </div>
                          
                          <div className="mb-3">
                            <label className="form-label">New Password *</label>
                            <Field
                              name="newPassword"
                              type="password"
                              className="form-control"
                            />
                            <ErrorMessage name="newPassword" component="div" className="text-danger small" />
                          </div>
                          
                          <div className="mb-3">
                            <label className="form-label">Confirm New Password *</label>
                            <Field
                              name="confirmPassword"
                              type="password"
                              className="form-control"
                            />
                            <ErrorMessage name="confirmPassword" component="div" className="text-danger small" />
                          </div>
                          
                          <div className="text-end">
                            <Button
                              type="submit"
                              variant="primary"
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? (
                                <>
                                  <Spinner as="span" animation="border" size="sm" className="me-2" />
                                  Updating...
                                </>
                              ) : (
                                'Update Password'
                              )}
                            </Button>
                          </div>
                        </Form>
                      )}
                    </Formik>
                  </Tab.Pane>
                  
                  {/* Notifications Tab */}
                  <Tab.Pane eventKey="notifications">
                    <h5 className="mb-4">Notification Preferences</h5>
                    <div className="mb-3">
                      <div className="form-check form-switch mb-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="emailNotifications"
                          defaultChecked={user.preferences?.notifications?.email !== false}
                        />
                        <label className="form-check-label" htmlFor="emailNotifications">
                          Email Notifications
                        </label>
                      </div>
                      
                      <div className="form-check form-switch mb-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="pushNotifications"
                          defaultChecked={user.preferences?.notifications?.push !== false}
                        />
                        <label className="form-check-label" htmlFor="pushNotifications">
                          Push Notifications
                        </label>
                      </div>
                    </div>
                    
                    <h6 className="mb-3">Event Categories</h6>
                    <div className="row">
                      {['Music', 'Sports', 'Conference', 'Workshop', 'Festival', 'Networking'].map(category => (
                        <div key={category} className="col-md-6 mb-2">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={`cat-${category.toLowerCase()}`}
                              defaultChecked={user.preferences?.categories?.includes(category.toLowerCase())}
                            />
                            <label className="form-check-label" htmlFor={`cat-${category.toLowerCase()}`}>
                              {category}
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="text-end mt-4">
                      <Button variant="primary">Save Preferences</Button>
                    </div>
                  </Tab.Pane>
                  
                  {/* Settings Tab */}
                  <Tab.Pane eventKey="settings">
                    <h5 className="mb-4">Account Settings</h5>
                    
                    <div className="mb-4">
                      <h6>Danger Zone</h6>
                      <Alert variant="danger">
                        <p className="mb-3">Once you delete your account, there is no going back. Please be certain.</p>
                        <Button variant="outline-danger" size="sm">
                          Delete Account
                        </Button>
                      </Alert>
                    </div>
                    
                    <div className="mb-4">
                      <h6>Data Export</h6>
                      <p className="text-muted mb-3">
                        Download all your personal data in JSON format.
                      </p>
                      <Button variant="outline-secondary" size="sm">
                        Export Data
                      </Button>
                    </div>
                    
                    <div className="mb-4">
                      <h6>Privacy</h6>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="publicProfile"
                          defaultChecked
                        />
                        <label className="form-check-label" htmlFor="publicProfile">
                          Make profile public
                        </label>
                      </div>
                    </div>
                  </Tab.Pane>
                </Tab.Content>
              </Tab.Container>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProfilePage;