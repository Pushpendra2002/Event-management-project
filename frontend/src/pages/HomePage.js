import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { fetchFeaturedEvents } from '../features/events/eventSlice';
import { Calendar, MapPin, Users, Star, ArrowRight } from 'lucide-react';
import EventCard from '../components/Events/EventCard';

const HomePage = () => {
  const dispatch = useDispatch();
  const { featuredEvents } = useSelector((state) => state.events);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchFeaturedEvents());
  }, [dispatch]);

  const categories = [
    { name: 'Music', icon: '🎵', count: 45 },
    { name: 'Sports', icon: '⚽', count: 32 },
    { name: 'Conference', icon: '🎤', count: 28 },
    { name: 'Workshop', icon: '🔧', count: 36 },
    { name: 'Festival', icon: '🎉', count: 19 },
    { name: 'Networking', icon: '🤝', count: 24 }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-primary bg-gradient text-white py-5">
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="mb-5 mb-lg-0">
              <h1 className="display-4 fw-bold mb-4">
                Discover & Manage Events Like Never Before
              </h1>
              <p className="lead mb-4">
                Join thousands of people discovering amazing events, connecting with 
                communities, and creating unforgettable experiences.
              </p>
              <div className="d-flex gap-3">
                <Button as={Link} to="/events" variant="light" size="lg">
                  Explore Events
                </Button>
                {!user && (
                  <Button as={Link} to="/register" variant="outline-light" size="lg">
                    Get Started
                  </Button>
                )}
              </div>
            </Col>
            <Col lg={6}>
              <div className="position-relative">
                <div className="position-absolute top-0 start-0 w-100 h-100 bg-white bg-opacity-10 rounded-3"></div>
                <img
                  src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Event celebration"
                  className="img-fluid rounded-3 shadow-lg"
                />
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Stats Section */}
      <section className="py-5">
        <Container>
          <Row className="text-center">
            <Col md={3} className="mb-4">
              <div className="display-4 fw-bold text-primary">500+</div>
              <p className="text-muted">Events</p>
            </Col>
            <Col md={3} className="mb-4">
              <div className="display-4 fw-bold text-primary">20K+</div>
              <p className="text-muted">Attendees</p>
            </Col>
            <Col md={3} className="mb-4">
              <div className="display-4 fw-bold text-primary">150+</div>
              <p className="text-muted">Organizers</p>
            </Col>
            <Col md={3} className="mb-4">
              <div className="display-4 fw-bold text-primary">95%</div>
              <p className="text-muted">Satisfaction Rate</p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Categories Section */}
      <section className="py-5 bg-light">
        <Container>
          <div className="text-center mb-5">
            <h2 className="fw-bold mb-3">Browse by Category</h2>
            <p className="text-muted">Find events that match your interests</p>
          </div>
          <Row>
            {categories.map((category) => (
              <Col key={category.name} md={4} lg={2} className="mb-3">
                <Card className="text-center border-0 shadow-sm h-100">
                  <Card.Body>
                    <div className="display-4 mb-3">{category.icon}</div>
                    <h5 className="mb-1">{category.name}</h5>
                    <p className="text-muted small">{category.count} events</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Featured Events */}
      <section className="py-5">
        <Container>
          <div className="d-flex justify-content-between align-items-center mb-5">
            <div>
              <h2 className="fw-bold mb-2">Featured Events</h2>
              <p className="text-muted">Hand-picked events you don't want to miss</p>
            </div>
            <Button as={Link} to="/events" variant="outline-primary">
              View All <ArrowRight size={20} />
            </Button>
          </div>
          
          {featuredEvents.length > 0 ? (
            <Row>
              {featuredEvents.slice(0, 3).map((event) => (
                <Col key={event._id} lg={4} className="mb-4">
                  <EventCard event={event} />
                </Col>
              ))}
            </Row>
          ) : (
            <Row>
              {[1, 2, 3].map((i) => (
                <Col key={i} lg={4} className="mb-4">
                  <Card className="h-100">
                    <div className="placeholder-glow">
                      <div className="placeholder col-12" style={{ height: '200px' }}></div>
                      <Card.Body>
                        <div className="placeholder col-8 mb-2"></div>
                        <div className="placeholder col-10 mb-3"></div>
                        <div className="placeholder col-12 mb-2"></div>
                        <div className="placeholder col-6"></div>
                      </Card.Body>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-5 bg-dark text-white">
        <Container>
          <Row className="align-items-center">
            <Col lg={8}>
              <h2 className="fw-bold mb-3">Ready to Create Your Event?</h2>
              <p className="lead mb-0">
                Join our community of organizers and share your passion with the world.
              </p>
            </Col>
            <Col lg={4} className="text-lg-end">
              <Button as={Link} to="/create-event" variant="light" size="lg">
                Create Event
              </Button>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default HomePage;