import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEvents,updateEventStatus } from '../features/events/eventSlice';
import { Container, Row, Col, Card, Table, Badge, Button, Form, Spinner } from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Calendar, DollarSign, TrendingUp, Eye, Edit, CheckCircle, XCircle } from 'lucide-react';
// import { updateEventStatus } from '../features/events/eventSlice';

const AdminDashboardPage = () => {
  const dispatch = useDispatch();
  const { events, loading } = useSelector((state) => state.events);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    totalRevenue: 0,
    pendingEvents: 0
  });

  const [revenueData, setRevenueData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);

  useEffect(() => {
    dispatch(fetchEvents({ limit: 1000 ,role:"admin"}));
  }, [dispatch]);

  useEffect(() => {
    if (events.length > 0) {
      // Calculate stats
      const totalEvents = events.length;
      const pendingEvents = events.filter(e => e.status === 'draft').length;
      
      const totalRevenue = events.reduce((sum, event) => {
        const eventRevenue = event.ticketTypes?.reduce((ticketSum, ticket) => 
          ticketSum + (ticket.price * ticket.sold), 0
        ) || 0;
        return sum + eventRevenue;
      }, 0);

      // Generate revenue data (last 7 days)
      const today = new Date();
      const revenueByDay = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - (6 - i));
        return {
          date: date.toLocaleDateString('en-US', { weekday: 'short' }),
          revenue: Math.floor(Math.random() * 5000) + 1000
        };
      });

      // Generate category distribution
      const categories = {};
      events.forEach(event => {
        categories[event.category] = (categories[event.category] || 0) + 1;
      });

      const categoryDistribution = Object.entries(categories).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value
      }));

      setStats({
        totalUsers: 1250, // Mock data
        totalEvents,
        totalRevenue,
        pendingEvents
      });
      setRevenueData(revenueByDay);
      setCategoryData(categoryDistribution);
    }
  }, [events]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading admin dashboard...</p>
      </Container>
    );
  }
  const handleApprove = (eventId) => {
  dispatch(updateEventStatus({ id: eventId, status: 'published' }));
};

const handleReject = (eventId) => {
  dispatch(updateEventStatus({ id: eventId, status: 'cancelled' }));
};


  return (
    <Container fluid className="py-4">
      {/* Header */}
      <div className="mb-4">
        <h2 className="fw-bold">Admin Dashboard</h2>
        <p className="text-muted">System overview and management</p>
      </div>

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col xl={3} lg={6} className="mb-3">
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                  <Users className="text-primary" size={24} />
                </div>
                <div>
                  <h4 className="mb-0">{stats.totalUsers.toLocaleString()}</h4>
                  <p className="text-muted mb-0">Total Users</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col xl={3} lg={6} className="mb-3">
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="bg-success bg-opacity-10 rounded-circle p-3 me-3">
                  <Calendar className="text-success" size={24} />
                </div>
                <div>
                  <h4 className="mb-0">{stats.totalEvents}</h4>
                  <p className="text-muted mb-0">Total Events</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col xl={3} lg={6} className="mb-3">
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="bg-warning bg-opacity-10 rounded-circle p-3 me-3">
                  <DollarSign className="text-warning" size={24} />
                </div>
                <div>
                  <h4 className="mb-0">{formatCurrency(stats.totalRevenue)}</h4>
                  <p className="text-muted mb-0">Total Revenue</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col xl={3} lg={6} className="mb-3">
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="bg-danger bg-opacity-10 rounded-circle p-3 me-3">
                  <TrendingUp className="text-danger" size={24} />
                </div>
                <div>
                  <h4 className="mb-0">{stats.pendingEvents}</h4>
                  <p className="text-muted mb-0">Pending Events</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row className="mb-4">
        <Col lg={8} className="mb-4">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <h5 className="mb-4">Revenue Overview (Last 7 Days)</h5>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [formatCurrency(value), 'Revenue']} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#8884d8" name="Daily Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4} className="mb-4">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <h5 className="mb-4">Events by Category</h5>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, 'Events']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Events Table */}
      <Row>
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="mb-0">Recent Events</h5>
                <Form.Select style={{ width: 'auto' }}>
                  <option>All Status</option>
                  <option>Published</option>
                  <option>Pending</option>
                  <option>Draft</option>
                </Form.Select>
              </div>
              
              <div className="table-responsive">
                <Table hover>
                  <thead>
                    <tr>
                      <th>Event</th>
                      <th>Organizer</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Attendees</th>
                      <th>Revenue</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.slice(0, 10).map((event) => (
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
                        <td>{event.organizerName}</td>
                        <td>
                          {new Date(event.startDate).toLocaleDateString()}
                          <br />
                          <small className="text-muted">
                            {new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </small>
                        </td>
                        <td>
                          <Badge bg={
                            event.status === 'published' ? 'success' :
                            event.status === 'draft' ? 'secondary' :
                            event.status === 'cancelled' ? 'danger' : 'warning'
                          }>
                            {event.status}
                          </Badge>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <Users size={16} className="me-1" />
                            {event.currentAttendees} / {event.maxAttendees || '∞'}
                          </div>
                        </td>
                        <td className="fw-bold">
                          {formatCurrency(
                            event.ticketTypes?.reduce((sum, ticket) => sum + (ticket.price * ticket.sold), 0) || 0
                          )}
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              href={`/events/${event._id}`}
                            >
                              <Eye size={16} />
                            </Button>
                            {event.status === 'draft' && (
                              <>
                                <Button
                                  variant="outline-success"
                                  size="sm"
                                  title="Approve"
                                    onClick={() => handleApprove(event._id)}

                                >
                                  <CheckCircle size={16} />
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  title="Reject"
                                    onClick={() => handleReject(event._id)}
                                >
                                  <XCircle size={16} />

                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboardPage;