import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyEvents } from '../features/events/eventSlice';
import { fetchBookings } from '../features/bookings/bookingSlice';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Table, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { Calendar, Users, IndianRupee, TrendingUp, Eye, Edit, AlertCircle } from 'lucide-react';
import moment from 'moment';
import api from '../services/api';

const DashboardPage = () => {
  const dispatch = useDispatch();
  const { myEvents, loading: eventsLoading } = useSelector((state) => state.events);
  const { bookings, loading: bookingsLoading } = useSelector((state) => state.bookings);
  const { user } = useSelector((state) => state.auth);
  
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalAttendees: 0,
    totalRevenue: 0,
    upcomingEvents: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    dispatch(fetchMyEvents());
    dispatch(fetchBookings());
    fetchDashboardStats();
  }, [dispatch]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/dashboard/stats');
      setStats(response.data.data.stats);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      setError('Could not load dashboard stats. Using local data.');
      // Fallback to local calculation
      calculateLocalStats();
    } finally {
      setLoading(false);
    }
  };

  const calculateLocalStats = () => {
    if (myEvents.length > 0) {
      const totalEvents = myEvents.length;
      const upcomingEvents = myEvents.filter(event => 
        new Date(event.startDate) > new Date() && event.status === 'published'
      ).length;
      const totalAttendees = myEvents.reduce((sum, event) => sum + (event.currentAttendees || 0), 0);
      const totalRevenue = myEvents.reduce((sum, event) => {
        const eventRevenue = event.ticketTypes?.reduce((ticketSum, ticket) => 
          ticketSum + (ticket.price * (ticket.sold || 0)), 0
        ) || 0;
        return sum + eventRevenue;
      }, 0);

      setStats({
        totalEvents,
        totalAttendees,
        totalRevenue,
        upcomingEvents
      });
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      draft: 'secondary',
      published: 'success',
      cancelled: 'danger',
      completed: 'info'
    };
    return <Badge bg={variants[status]}>{status}</Badge>;
  };

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};


  if ((loading || eventsLoading || bookingsLoading) && myEvents.length === 0) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading dashboard...</p>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      {/* Header */}
      <div className="mb-5">
        <h1 className="fw-bold">Organizer Dashboard</h1>
        <p className="text-muted">
          Welcome back, {user?.name}! Manage your events and track performance.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="warning" className="mb-4">
          <AlertCircle className="me-2" />
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Row className="mb-5">
        <Col md={3} className="mb-4">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                  <Calendar className="text-primary" size={24} />
                </div>
                <div>
                  <h4 className="mb-0">{stats.totalEvents}</h4>
                  <p className="text-muted mb-0">Total Events</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} className="mb-4">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="bg-success bg-opacity-10 rounded-circle p-3 me-3">
                  <Users className="text-success" size={24} />
                </div>
                <div>
                  <h4 className="mb-0">{stats.totalAttendees}</h4>
                  <p className="text-muted mb-0">Total Attendees</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} className="mb-4">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="bg-warning bg-opacity-10 rounded-circle p-3 me-3">
                  <IndianRupee className="text-warning" size={24} />
                </div>
                <div>
                  <h4 className="mb-0">{formatCurrency(stats.totalRevenue)}</h4>
                  <p className="text-muted mb-0">Total Revenue</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} className="mb-4">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="bg-info bg-opacity-10 rounded-circle p-3 me-3">
                  <TrendingUp className="text-info" size={24} />
                </div>
                <div>
                  <h4 className="mb-0">{stats.upcomingEvents}</h4>
                  <p className="text-muted mb-0">Upcoming Events</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row className="mb-5">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="mb-0">Quick Actions</h5>
                <Button as={Link} to="/create-event" variant="primary">
                  Create New Event
                </Button>
              </div>
              <Row>
                <Col md={3}>
                  <Button as={Link} to="/events" variant="outline-primary" className="w-100 mb-3">
                    Browse Events
                  </Button>
                </Col>
                <Col md={3}>
                  <Button as={Link} to="/bookings" variant="outline-success" className="w-100 mb-3">
                    View Bookings
                  </Button>
                </Col>
                <Col md={3}>
                  <Button as={Link} to="/profile" variant="outline-info" className="w-100 mb-3">
                    Edit Profile
                  </Button>
                </Col>
                <Col md={3}>
                  <Button 
                    as={Link} 
                    to="/events?category=music" 
                    variant="outline-warning" 
                    className="w-100 mb-3"
                  >
                    Browse by Category
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Events */}
      <Row className="mb-5">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="mb-0">Recent Events</h5>
                <Link to="/events" className="text-decoration-none">
                  View All
                </Link>
              </div>
              
              {myEvents.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted">No events created yet.</p>
                  <Button as={Link} to="/create-event" variant="primary">
                    Create Your First Event
                  </Button>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>Event</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Attendees</th>
                        <th>Revenue</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myEvents.slice(0, 5).map((event) => (
                        <tr key={event._id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <img
                                src={event.images?.find(img => img.isMain)?.url || '/default-event.jpg'}
                                alt={event.title}
                                className="rounded me-3"
                                style={{ width: '60px', height: '40px', objectFit: 'cover' }}
                              />
                              <div>
                                <div className="fw-bold">{event.title}</div>
                                <small className="text-muted">{event.category}</small>
                              </div>
                            </div>
                          </td>
                          <td>
                            {moment(event.startDate).format('MMM D, YYYY')}
                            <br />
                            <small className="text-muted">
                              {moment(event.startDate).format('h:mm A')}
                            </small>
                          </td>
                          <td>{getStatusBadge(event.status)}</td>
                          <td>
                            <div className="d-flex align-items-center">
                              <Users size={16} className="me-1" />
                              {event.currentAttendees || 0} / {event.maxAttendees || '∞'}
                            </div>
                          </td>
                          <td>
                            {formatCurrency(
                              event.ticketTypes?.reduce((sum, ticket) => 
                                sum + (ticket.price * (ticket.sold || 0)), 0
                              ) || 0
                            )}
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <Button
                                as={Link}
                                to={`/events/${event._id}`}
                                variant="outline-primary"
                                size="sm"
                              >
                                <Eye size={16} />
                              </Button>
                              <Button
                                as={Link}
                                to={`/events/${event._id}/edit`}
                                variant="outline-secondary"
                                size="sm"
                              >
                                <Edit size={16} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DashboardPage;