import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createEvent } from '../features/events/eventSlice';
import { Formik, Form, Field, FieldArray, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import DatePicker from 'react-datepicker';
import { Container, Row, Col, Card, Button, Alert, Spinner, Form as BootstrapForm } from 'react-bootstrap';
import { Plus, Trash2, Calendar, MapPin, Upload, X } from 'lucide-react';
import { toast } from 'react-toastify';

const CreateEventPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.events);
  const [images, setImages] = useState([]);
  const [isOnline, setIsOnline] = useState(false);

  const initialValues = {
    title: '',
    description: '',
    shortDescription: '',
    category: '',
    tags: [],
    startDate: new Date(),
    endDate: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours later
    venue: {
      name: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      }
    },
    isOnline: false,
    onlineLink: '',
    ticketTypes: [{
      name: 'General Admission',
      description: 'Standard entry ticket',
      price: 0,
      quantity: 100,
      salesEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    }],
    maxAttendees: '',
    privacy: 'public',
    requirements: []
  };

  const validationSchema = Yup.object({
    title: Yup.string()
      .required('Event title is required')
      .max(100, 'Title cannot exceed 100 characters'),
    description: Yup.string()
      .required('Description is required')
      .max(2000, 'Description cannot exceed 2000 characters'),
    shortDescription: Yup.string()
      .max(200, 'Short description cannot exceed 200 characters'),
    category: Yup.string()
      .required('Category is required'),
    startDate: Yup.date()
      .required('Start date is required')
      .min(new Date(), 'Start date must be in the future'),
    endDate: Yup.date()
      .required('End date is required')
      .min(Yup.ref('startDate'), 'End date must be after start date'),
    venue: Yup.object().when('isOnline', {
      is: false,
      then: (schema) => schema.shape({
        name: Yup.string().required('Venue name is required'),
        address: Yup.object().shape({
          street: Yup.string(),
          city: Yup.string(),
          state: Yup.string(),
          country: Yup.string()
        })
      })
    }),
    onlineLink: Yup.string().when('isOnline', {
      is: true,
      then: (schema) => schema.url('Invalid URL').required('Online link is required')
    }),
    ticketTypes: Yup.array().of(
      Yup.object().shape({
        name: Yup.string().required('Ticket name is required'),
        price: Yup.number()
          .min(0, 'Price cannot be negative')
          .required('Price is required'),
        quantity: Yup.number()
          .min(1, 'Quantity must be at least 1')
          .required('Quantity is required'),
        salesEndDate: Yup.date()
          .min(new Date(), 'Sales end date must be in the future')
      })
    ).min(1, 'At least one ticket type is required')
  });

  const categories = [
    'music', 'sports', 'conference', 'workshop', 'festival',
    'exhibition', 'networking', 'charity', 'food', 'art',
    'technology', 'business', 'education', 'health', 'other'
  ];

  const requirements = [
    { value: 'age-18+', label: 'Age 18+' },
    { value: 'id-required', label: 'ID Required' },
    { value: 'vaccination', label: 'Vaccination Proof' },
    { value: 'dress-code', label: 'Dress Code' }
  ];

  const handleSubmit = async (values) => {
    try {
      await dispatch(createEvent(values)).unwrap();
      toast.success('Event created successfully!');
      navigate('/organizer/dashboard');
    } catch (err) {
      toast.error('Failed to create event');
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    // In a real app, you would upload to Cloudinary/S3 here
    // For now, we'll just create object URLs
    const newImages = files.map(file => ({
      url: URL.createObjectURL(file),
      file,
      isMain: images.length === 0 // First image is main
    }));
    setImages([...images, ...newImages]);
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    if (index === 0 && newImages.length > 0) {
      newImages[0].isMain = true;
    }
    setImages(newImages);
  };

  const setMainImage = (index) => {
    const newImages = images.map((img, i) => ({
      ...img,
      isMain: i === index
    }));
    setImages(newImages);
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col lg={10}>
          <Card className="shadow">
            <Card.Body className="p-4">
              <div className="text-center mb-5">
                <h2 className="fw-bold">Create New Event</h2>
                <p className="text-muted">Fill in the details to create your event</p>
              </div>

              {error && (
                <Alert variant="danger" dismissible>
                  {error}
                </Alert>
              )}

              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ values, setFieldValue, isSubmitting }) => (
                  <Form>
                    {/* Basic Information */}
                    <div className="mb-5">
                      <h4 className="mb-4">Basic Information</h4>
                      <Row>
                        <Col md={8}>
                          <div className="mb-3">
                            <label className="form-label">Event Title *</label>
                            <Field
                              name="title"
                              type="text"
                              className="form-control"
                              placeholder="Enter event title"
                            />
                            <ErrorMessage name="title" component="div" className="text-danger small" />
                          </div>
                        </Col>
                        <Col md={4}>
                          <div className="mb-3">
                            <label className="form-label">Category *</label>
                            <Field
                              as="select"
                              name="category"
                              className="form-select"
                            >
                              <option value="">Select category</option>
                              {categories.map(cat => (
                                <option key={cat} value={cat}>
                                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                </option>
                              ))}
                            </Field>
                            <ErrorMessage name="category" component="div" className="text-danger small" />
                          </div>
                        </Col>
                      </Row>

                      <div className="mb-3">
                        <label className="form-label">Short Description</label>
                        <Field
                          name="shortDescription"
                          as="textarea"
                          rows="2"
                          className="form-control"
                          placeholder="Brief description (max 200 characters)"
                        />
                        <ErrorMessage name="shortDescription" component="div" className="text-danger small" />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Full Description *</label>
                        <Field
                          name="description"
                          as="textarea"
                          rows="4"
                          className="form-control"
                          placeholder="Detailed description of your event"
                        />
                        <ErrorMessage name="description" component="div" className="text-danger small" />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Tags (comma separated)</label>
                        <Field
                          name="tags"
                          type="text"
                          className="form-control"
                          placeholder="e.g., music, concert, live"
                          onChange={(e) => {
                            const tags = e.target.value.split(',').map(tag => tag.trim());
                            setFieldValue('tags', tags);
                          }}
                        />
                      </div>
                    </div>

                    {/* Date & Time */}
                    <div className="mb-5">
                      <h4 className="mb-4">
                        <Calendar className="me-2" />
                        Date & Time
                      </h4>
                      <Row>
                        <Col md={6}>
                          <div className="mb-3">
                            <label className="form-label">Start Date & Time *</label>
                            <DatePicker
                              selected={values.startDate}
                              onChange={(date) => setFieldValue('startDate', date)}
                              showTimeSelect
                              dateFormat="MMMM d, yyyy h:mm aa"
                              className="form-control"
                              minDate={new Date()}
                            />
                            <ErrorMessage name="startDate" component="div" className="text-danger small" />
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className="mb-3">
                            <label className="form-label">End Date & Time *</label>
                            <DatePicker
                              selected={values.endDate}
                              onChange={(date) => setFieldValue('endDate', date)}
                              showTimeSelect
                              dateFormat="MMMM d, yyyy h:mm aa"
                              className="form-control"
                              minDate={values.startDate}
                            />
                            <ErrorMessage name="endDate" component="div" className="text-danger small" />
                          </div>
                        </Col>
                      </Row>
                    </div>

                    {/* Location */}
                    <div className="mb-5">
                      <h4 className="mb-4">
                        <MapPin className="me-2" />
                        Location
                      </h4>
                      <div className="mb-3">
                        <BootstrapForm.Check
                          type="switch"
                          id="isOnline"
                          label="This is an online event"
                          checked={values.isOnline}
                          onChange={(e) => {
                            setIsOnline(e.target.checked);
                            setFieldValue('isOnline', e.target.checked);
                          }}
                        />
                      </div>

                      {values.isOnline ? (
                        <div className="mb-3">
                          <label className="form-label">Online Event Link *</label>
                          <Field
                            name="onlineLink"
                            type="url"
                            className="form-control"
                            placeholder="https://meet.google.com/xxx-yyyy-zzz"
                          />
                          <ErrorMessage name="onlineLink" component="div" className="text-danger small" />
                        </div>
                      ) : (
                        <>
                          <div className="mb-3">
                            <label className="form-label">Venue Name *</label>
                            <Field
                              name="venue.name"
                              type="text"
                              className="form-control"
                              placeholder="e.g., Convention Center, Park Name"
                            />
                            <ErrorMessage name="venue.name" component="div" className="text-danger small" />
                          </div>

                          <Row>
                            <Col md={6}>
                              <div className="mb-3">
                                <label className="form-label">Street Address</label>
                                <Field
                                  name="venue.address.street"
                                  type="text"
                                  className="form-control"
                                  placeholder="123 Main Street"
                                />
                              </div>
                            </Col>
                            <Col md={6}>
                              <div className="mb-3">
                                <label className="form-label">City</label>
                                <Field
                                  name="venue.address.city"
                                  type="text"
                                  className="form-control"
                                  placeholder="City"
                                />
                              </div>
                            </Col>
                          </Row>

                          <Row>
                            <Col md={4}>
                              <div className="mb-3">
                                <label className="form-label">State/Province</label>
                                <Field
                                  name="venue.address.state"
                                  type="text"
                                  className="form-control"
                                  placeholder="State"
                                />
                              </div>
                            </Col>
                            <Col md={4}>
                              <div className="mb-3">
                                <label className="form-label">ZIP/Postal Code</label>
                                <Field
                                  name="venue.address.zipCode"
                                  type="text"
                                  className="form-control"
                                  placeholder="12345"
                                />
                              </div>
                            </Col>
                            <Col md={4}>
                              <div className="mb-3">
                                <label className="form-label">Country</label>
                                <Field
                                  name="venue.address.country"
                                  type="text"
                                  className="form-control"
                                  placeholder="Country"
                                />
                              </div>
                            </Col>
                          </Row>
                        </>
                      )}
                    </div>

                    {/* Ticket Types */}
                    <div className="mb-5">
                      <h4 className="mb-4">Ticket Types</h4>
                      <FieldArray name="ticketTypes">
                        {({ push, remove }) => (
                          <div>
                            {values.ticketTypes.map((ticket, index) => (
                              <Card key={index} className="mb-3">
                                <Card.Body>
                                  <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h5 className="mb-0">Ticket Type {index + 1}</h5>
                                    {values.ticketTypes.length > 1 && (
                                      <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => remove(index)}
                                      >
                                        <Trash2 size={16} />
                                      </Button>
                                    )}
                                  </div>

                                  <Row>
                                    <Col md={6}>
                                      <div className="mb-3">
                                        <label className="form-label">Ticket Name *</label>
                                        <Field
                                          name={`ticketTypes.${index}.name`}
                                          type="text"
                                          className="form-control"
                                          placeholder="e.g., General Admission, VIP"
                                        />
                                        <ErrorMessage
                                          name={`ticketTypes.${index}.name`}
                                          component="div"
                                          className="text-danger small"
                                        />
                                      </div>
                                    </Col>
                                    <Col md={6}>
                                      <div className="mb-3">
                                        <label className="form-label">Description</label>
                                        <Field
                                          name={`ticketTypes.${index}.description`}
                                          type="text"
                                          className="form-control"
                                          placeholder="What's included in this ticket"
                                        />
                                      </div>
                                    </Col>
                                  </Row>

                                  <Row>
                                    <Col md={4}>
                                      <div className="mb-3">
                                        <label className="form-label">Price (₹) *</label>
                                        <Field
                                          name={`ticketTypes.${index}.price`}
                                          type="number"
                                          className="form-control"
                                          min="0"
                                          step="0.01"
                                        />
                                        <ErrorMessage
                                          name={`ticketTypes.${index}.price`}
                                          component="div"
                                          className="text-danger small"
                                        />
                                      </div>
                                    </Col>
                                    <Col md={4}>
                                      <div className="mb-3">
                                        <label className="form-label">Quantity *</label>
                                        <Field
                                          name={`ticketTypes.${index}.quantity`}
                                          type="number"
                                          className="form-control"
                                          min="1"
                                        />
                                        <ErrorMessage
                                          name={`ticketTypes.${index}.quantity`}
                                          component="div"
                                          className="text-danger small"
                                        />
                                      </div>
                                    </Col>
                                    <Col md={4}>
                                      <div className="mb-3">
                                        <label className="form-label">Sales End Date</label>
                                        <DatePicker
                                          selected={values.ticketTypes[index].salesEndDate}
                                          onChange={(date) =>
                                            setFieldValue(`ticketTypes.${index}.salesEndDate`, date)
                                          }
                                          dateFormat="MMMM d, yyyy"
                                          className="form-control"
                                          minDate={new Date()}
                                        />
                                      </div>
                                    </Col>
                                  </Row>
                                </Card.Body>
                              </Card>
                            ))}

                            <Button
                              variant="outline-primary"
                              onClick={() =>
                                push({
                                  name: '',
                                  description: '',
                                  price: 0,
                                  quantity: 100,
                                  salesEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                                })
                              }
                            >
                              <Plus size={16} className="me-2" />
                              Add Another Ticket Type
                            </Button>
                          </div>
                        )}
                      </FieldArray>
                    </div>

                    {/* Additional Settings */}
                    <div className="mb-5">
                      <h4 className="mb-4">Additional Settings</h4>
                      <Row>
                        <Col md={6}>
                          <div className="mb-3">
                            <label className="form-label">Maximum Attendees</label>
                            <Field
                              name="maxAttendees"
                              type="number"
                              className="form-control"
                              placeholder="Leave empty for unlimited"
                              min="1"
                            />
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className="mb-3">
                            <label className="form-label">Privacy</label>
                            <Field as="select" name="privacy" className="form-select">
                              <option value="public">Public - Anyone can see and join</option>
                              <option value="private">Private - Only invited guests</option>
                              <option value="invite-only">Invite Only</option>
                            </Field>
                          </div>
                        </Col>
                      </Row>

                      <div className="mb-3">
                        <label className="form-label">Requirements</label>
                        <div className="d-flex flex-wrap gap-2">
                          {requirements.map((req) => (
                            <div key={req.value} className="form-check">
                              <Field
                                type="checkbox"
                                name="requirements"
                                value={req.value}
                                id={`req-${req.value}`}
                                className="form-check-input"
                              />
                              <label htmlFor={`req-${req.value}`} className="form-check-label">
                                {req.label}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Images Upload */}
                    <div className="mb-5">
                      <h4 className="mb-4">Event Images</h4>
                      <div className="mb-3">
                        <label className="btn btn-outline-primary">
                          <Upload size={16} className="me-2" />
                          Upload Images
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            className="d-none"
                            onChange={handleImageUpload}
                          />
                        </label>
                        <small className="text-muted ms-2">Upload up to 10 images</small>
                      </div>

                      {images.length > 0 && (
                        <Row className="g-3">
                          {images.map((image, index) => (
                            <Col key={index} xs={6} md={4} lg={3}>
                              <div className="position-relative">
                                <img
                                  src={image.url}
                                  alt={`Event ${index + 1}`}
                                  className="img-fluid rounded"
                                  style={{ height: '150px', width: '100%', objectFit: 'cover' }}
                                />
                                <div className="position-absolute top-0 end-0 p-2">
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => removeImage(index)}
                                  >
                                    <X size={12} />
                                  </Button>
                                </div>
                                {image.isMain && (
                                  <div className="position-absolute bottom-0 start-0 w-100 bg-primary text-white text-center py-1">
                                    Main Image
                                  </div>
                                )}
                                {!image.isMain && (
                                  <Button
                                    variant="outline-light"
                                    size="sm"
                                    className="position-absolute bottom-0 start-0 m-2"
                                    onClick={() => setMainImage(index)}
                                  >
                                    Set as Main
                                  </Button>
                                )}
                              </div>
                            </Col>
                          ))}
                        </Row>
                      )}
                    </div>

                    {/* Submit Button */}
                    <div className="text-center">
                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        disabled={isSubmitting || loading}
                        className="px-5"
                      >
                        {isSubmitting || loading ? (
                          <>
                            <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              className="me-2"
                            />
                            Creating Event...
                          </>
                        ) : (
                          'Create Event'
                        )}
                      </Button>
                    </div>
                  </Form>
                )}
              </Formik>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CreateEventPage;