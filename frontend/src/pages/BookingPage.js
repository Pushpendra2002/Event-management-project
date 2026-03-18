import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBookings, cancelBooking } from '../features/bookings/bookingSlice';
import { Container, Row, Col, Card, Table, Badge, Button, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import { Calendar, MapPin, Users, Ticket, Download, X, CheckCircle } from 'lucide-react';
import moment from 'moment';
import { QRCodeSVG } from 'qrcode.react'; // Changed import

const BookingPage = () => {
  const dispatch = useDispatch();
  const { bookings, loading } = useSelector((state) => state.bookings);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    dispatch(fetchBookings());
  }, [dispatch]);

  const handleCancelBooking = async () => {
    if (selectedBooking && cancelReason) {
      try {
        await dispatch(cancelBooking({ id: selectedBooking._id, reason: cancelReason })).unwrap();
        setShowCancelModal(false);
        setSelectedBooking(null);
        setCancelReason('');
      } catch (error) {
        console.error('Failed to cancel booking:', error);
      }
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return new Date(booking.event?.startDate) > new Date();
    if (filter === 'past') return new Date(booking.event?.startDate) <= new Date();
    if (filter === 'cancelled') return booking.status === 'cancelled';
    return booking.paymentStatus === filter;
  });

  const getStatusBadge = (booking) => {
    const statusMap = {
      pending: { variant: 'warning', label: 'Pending' },
      paid: { variant: 'success', label: 'Confirmed' },
      failed: { variant: 'danger', label: 'Failed' },
      refunded: { variant: 'info', label: 'Refunded' },
      cancelled: { variant: 'secondary', label: 'Cancelled' }
    };

    const { variant, label } = statusMap[booking.paymentStatus] || { variant: 'secondary', label: 'Unknown' };
    return <Badge bg={variant}>{label}</Badge>;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const downloadTicket = (booking) => {
    // In a real app, generate a PDF ticket
    alert('Ticket download feature would generate a PDF in production');
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading bookings...</p>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      {/* Header */}
      <div className="mb-5">
        <h1 className="fw-bold">My Bookings</h1>
        <p className="text-muted">Manage and view your event bookings</p>
      </div>

      {/* Stats */}
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <h4 className="text-primary">{bookings.length}</h4>
              <p className="text-muted mb-0">Total Bookings</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <h4 className="text-success">
                {bookings.filter(b => b.paymentStatus === 'paid').length}
              </h4>
              <p className="text-muted mb-0">Confirmed</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <h4 className="text-warning">
                {bookings.filter(b => b.paymentStatus === 'pending').length}
              </h4>
              <p className="text-muted mb-0">Pending</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <h4 className="text-danger">
                {bookings.filter(b => b.status === 'cancelled').length}
              </h4>
              <p className="text-muted mb-0">Cancelled</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-4 border-0 shadow-sm">
        <Card.Body>
          <div className="d-flex flex-wrap gap-2">
            <Button
              variant={filter === 'all' ? 'primary' : 'outline-primary'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              variant={filter === 'upcoming' ? 'primary' : 'outline-primary'}
              size="sm"
              onClick={() => setFilter('upcoming')}
            >
              Upcoming
            </Button>
            <Button
              variant={filter === 'past' ? 'primary' : 'outline-primary'}
              size="sm"
              onClick={() => setFilter('past')}
            >
              Past
            </Button>
            <Button
              variant={filter === 'paid' ? 'primary' : 'outline-primary'}
              size="sm"
              onClick={() => setFilter('paid')}
            >
              Confirmed
            </Button>
            <Button
              variant={filter === 'pending' ? 'primary' : 'outline-primary'}
              size="sm"
              onClick={() => setFilter('pending')}
            >
              Pending
            </Button>
            <Button
              variant={filter === 'cancelled' ? 'primary' : 'outline-primary'}
              size="sm"
              onClick={() => setFilter('cancelled')}
            >
              Cancelled
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <Alert variant="info">
          <Alert.Heading>No bookings found</Alert.Heading>
          <p>
            {filter === 'all' 
              ? "You haven't made any bookings yet."
              : `No ${filter} bookings found.`}
          </p>
          <Button variant="primary" href="/events">
            Browse Events
          </Button>
        </Alert>
      ) : (
        <Row>
          {filteredBookings.map((booking) => (
            <Col key={booking._id} lg={6} className="mb-4">
              <Card className="h-100 border-0 shadow-sm hover-lift">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h5 className="mb-1">{booking.event?.title || 'Event'}</h5>
                      <div className="d-flex align-items-center gap-2 mb-2">
                        {getStatusBadge(booking)}
                        {booking.checkInStatus && (
                          <Badge bg="success">
                            <CheckCircle size={12} className="me-1" />
                            Checked In
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-end">
                      <code className="text-muted small">{booking.ticketNumber}</code>
                    </div>
                  </div>

                  {/* Booking Details */}
                  <div className="mb-3">
                    <div className="d-flex align-items-center mb-2">
                      <Calendar size={16} className="me-2 text-muted" />
                      <small>
                        {moment(booking.event?.startDate).format('ddd, MMM D • h:mm A')}
                      </small>
                    </div>
                    <div className="d-flex align-items-center mb-2">
                      <MapPin size={16} className="me-2 text-muted" />
                      <small>
                        {booking.event?.isOnline ? 'Online Event' : booking.event?.venue?.name}
                      </small>
                    </div>
                    <div className="d-flex align-items-center mb-3">
                      <Ticket size={16} className="me-2 text-muted" />
                      <small>
                        {booking.quantity} × {booking.ticketType?.name || 'General Admission'}
                      </small>
                    </div>
                  </div>

                  {/* QR Code - Fixed line 237 */}
                  {booking.ticketNumber && (
                    <div className="text-center mb-3">
                      <QRCodeSVG value={booking.ticketNumber} size={80} />
                      <small className="d-block text-muted mt-2">Scan for check-in</small>
                    </div>
                  )}

                  {/* Total & Actions */}
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h5 className="mb-0">{formatCurrency(booking.totalAmount || 0)}</h5>
                      <small className="text-muted">
                        Booked {moment(booking.createdAt).fromNow()}
                      </small>
                    </div>
                    <div className="d-flex gap-2">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => downloadTicket(booking)}
                      >
                        <Download size={16} />
                      </Button>
                      {booking.paymentStatus === 'paid' && 
                       booking.status !== 'cancelled' &&
                       new Date(booking.event?.startDate) > new Date() && (
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => {
                            setSelectedBooking(booking);
                            setShowCancelModal(true);
                          }}
                        >
                          <X size={16} />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Attendees */}
                  {booking.attendees?.length > 0 && (
                    <div className="mt-3 pt-3 border-top">
                      <h6 className="mb-2">Attendees</h6>
                      {booking.attendees.map((attendee, index) => (
                        <div key={index} className="d-flex align-items-center mb-1">
                          <Users size={14} className="me-2 text-muted" />
                          <small>
                            {attendee.name} • {attendee.email}
                          </small>
                        </div>
                      ))}
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Cancel Modal */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Cancel Booking</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedBooking && (
            <>
              <Alert variant="warning">
                <strong>Important:</strong> Cancellations may be subject to fees according to the event's cancellation policy.
              </Alert>
              
              <div className="mb-3">
                <p>You are about to cancel your booking for:</p>
                <h6>{selectedBooking.event?.title}</h6>
                <p className="text-muted">
                  {moment(selectedBooking.event?.startDate).format('MMMM D, YYYY • h:mm A')}
                </p>
              </div>
              
              <Form.Group className="mb-3">
                <Form.Label>Reason for cancellation *</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Please provide a reason for cancellation..."
                />
              </Form.Group>
              
              <div className="mb-3">
                <strong>Refund Amount:</strong> {formatCurrency(selectedBooking.totalAmount || 0)}
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
            Keep Booking
          </Button>
          <Button
            variant="danger"
            onClick={handleCancelBooking}
            disabled={!cancelReason.trim()}
          >
            Confirm Cancellation
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default BookingPage;