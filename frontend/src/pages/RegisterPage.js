import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, clearError } from '../features/auth/authSlice';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Container, Row, Col, Card, Alert, Spinner } from 'react-bootstrap';
import { UserPlus } from 'lucide-react';

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector((state) => state.auth);
  
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const initialValues = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    phone: ''
  };

  const validationSchema = Yup.object({
    name: Yup.string()
      .required('Name is required')
      .min(2, 'Name must be at least 2 characters'),
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm password is required'),
    phone: Yup.string()
      .matches(/^[0-9+\-\s()]*$/, 'Invalid phone number')
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    const { confirmPassword, ...userData } = values;
    await dispatch(register(userData));
    setSubmitting(false);
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <div className="bg-primary bg-gradient rounded-circle d-inline-flex p-3 mb-3">
                  <UserPlus size={32} className="text-white" />
                </div>
                <h3>Create Account</h3>
                <p className="text-muted">Join our community today</p>
              </div>

              {error && (
                <Alert variant="danger" onClose={() => dispatch(clearError())} dismissible>
                  {error}
                </Alert>
              )}

              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting, errors, touched }) => (
                  <Form>
                    <Row>
                      <Col md={6}>
                        <div className="mb-3">
                          <label htmlFor="name" className="form-label">
                            Full Name
                          </label>
                          <Field
                            type="text"
                            name="name"
                            id="name"
                            className={`form-control ${
                              errors.name && touched.name ? 'is-invalid' : ''
                            }`}
                            placeholder="Enter your full name"
                          />
                          <ErrorMessage
                            name="name"
                            component="div"
                            className="invalid-feedback"
                          />
                        </div>
                      </Col>
                      
                      <Col md={6}>
                        <div className="mb-3">
                          <label htmlFor="email" className="form-label">
                            Email Address
                          </label>
                          <Field
                            type="email"
                            name="email"
                            id="email"
                            className={`form-control ${
                              errors.email && touched.email ? 'is-invalid' : ''
                            }`}
                            placeholder="Enter your email"
                          />
                          <ErrorMessage
                            name="email"
                            component="div"
                            className="invalid-feedback"
                          />
                        </div>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <div className="mb-3">
                          <label htmlFor="password" className="form-label">
                            Password
                          </label>
                          <div className="input-group">
                            <Field
                              type={showPassword ? 'text' : 'password'}
                              name="password"
                              id="password"
                              className={`form-control ${
                                errors.password && touched.password ? 'is-invalid' : ''
                              }`}
                              placeholder="Create a password"
                            />
                            <button
                              type="button"
                              className="btn btn-outline-secondary"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? 'Hide' : 'Show'}
                            </button>
                          </div>
                          <ErrorMessage
                            name="password"
                            component="div"
                            className="invalid-feedback"
                          />
                        </div>
                      </Col>
                      
                      <Col md={6}>
                        <div className="mb-3">
                          <label htmlFor="confirmPassword" className="form-label">
                            Confirm Password
                          </label>
                          <Field
                            type={showPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            id="confirmPassword"
                            className={`form-control ${
                              errors.confirmPassword && touched.confirmPassword ? 'is-invalid' : ''
                            }`}
                            placeholder="Confirm your password"
                          />
                          <ErrorMessage
                            name="confirmPassword"
                            component="div"
                            className="invalid-feedback"
                          />
                        </div>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <div className="mb-3">
                          <label htmlFor="phone" className="form-label">
                            Phone Number (Optional)
                          </label>
                          <Field
                            type="tel"
                            name="phone"
                            id="phone"
                            className={`form-control ${
                              errors.phone && touched.phone ? 'is-invalid' : ''
                            }`}
                            placeholder="Enter your phone number"
                          />
                          <ErrorMessage
                            name="phone"
                            component="div"
                            className="invalid-feedback"
                          />
                        </div>
                      </Col>
                      
                      <Col md={6}>
                        <div className="mb-3">
                          <label htmlFor="role" className="form-label">
                            Account Type
                          </label>
                          <Field
                            as="select"
                            name="role"
                            id="role"
                            className="form-select"
                          >
                            <option value="user">Attendee</option>
                            <option value="organizer">Event Organizer</option>
                          </Field>
                          <small className="text-muted">
                            Choose "Event Organizer" if you want to create events
                          </small>
                        </div>
                      </Col>
                    </Row>

                    <div className="form-check mb-4">
                      <Field
                        type="checkbox"
                        name="terms"
                        id="terms"
                        className="form-check-input"
                        required
                      />
                      <label htmlFor="terms" className="form-check-label">
                        I agree to the{' '}
                        <Link to="/terms" className="text-decoration-none">
                          Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link to="/privacy" className="text-decoration-none">
                          Privacy Policy
                        </Link>
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary w-100 mb-3"
                      disabled={isSubmitting || loading}
                    >
                      {isSubmitting || loading ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            className="me-2"
                          />
                          Creating Account...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </button>

                    <div className="text-center">
                      <p className="mb-0">
                        Already have an account?{' '}
                        <Link to="/login" className="text-decoration-none">
                          Sign in
                        </Link>
                      </p>
                    </div>
                  </Form>
                )}
              </Formik>
            </Card.Body>
          </Card>

          <div className="text-center mt-4">
            <p className="text-muted small">
              By creating an account, you agree to receive email notifications about events and updates.
            </p>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default RegisterPage;