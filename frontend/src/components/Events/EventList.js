import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEvents, fetchFeaturedEvents } from '../../features/events/eventSlice';
import { Container, Row, Col, Form, InputGroup, Spinner, Alert, Pagination } from 'react-bootstrap';
import { Search, Filter, Calendar } from 'lucide-react';
import EventCard from './EventCard';
import EventFilters from './EventFilters';

const EventList = () => {
  const dispatch = useDispatch();
  const { events, featuredEvents, loading, error, pagination } = useSelector(
    (state) => state.events
  );
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    status: 'published',
    featured: '',
    startDate: '',
    endDate: '',
    sort: '-createdAt',
    page: 1,
    limit: 12
  });

  useEffect(() => {
    dispatch(fetchEvents(filters));
    dispatch(fetchFeaturedEvents());
  }, [dispatch, filters]);

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters({ ...filters, search: searchTerm, page: 1 });
  };

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters, page: 1 });
  };

  const handlePageChange = (page) => {
    setFilters({ ...filters, page });
  };

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      {/* Hero Section */}
      <Row className="mb-5">
        <Col>
          <div className="text-center">
            <h1 className="display-4 fw-bold mb-3">Discover Amazing Events</h1>
            <p className="lead text-muted">
              Find events that match your interests and connect with like-minded people
            </p>
          </div>
        </Col>
      </Row>

      {/* Search Bar */}
      <Row className="mb-4">
        <Col md={8} lg={6} className="mx-auto">
          <Form onSubmit={handleSearch}>
            <InputGroup>
              <InputGroup.Text>
                <Search />
              </InputGroup.Text>
              <Form.Control
                type="search"
                placeholder="Search events by name, description, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type="submit" className="btn btn-primary">
                Search
              </button>
            </InputGroup>
          </Form>
        </Col>
      </Row>

      {/* Featured Events */}
      {featuredEvents.length > 0 && (
        <>
          <Row className="mb-4">
            <Col>
              <h3 className="mb-3">
                <Calendar className="me-2" />
                Featured Events
              </h3>
            </Col>
          </Row>
          <Row className="mb-5">
            {featuredEvents.map((event) => (
              <Col key={event._id} md={6} lg={4} className="mb-4">
                <EventCard event={event} />
              </Col>
            ))}
          </Row>
        </>
      )}

      {/* Filters and Events */}
      <Row>
        <Col lg={3}>
          <EventFilters filters={filters} onFilterChange={handleFilterChange} />
        </Col>
        
        <Col lg={9}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4>All Events</h4>
            <span className="text-muted">
              {pagination.total} events found
            </span>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Loading events...</p>
            </div>
          ) : events.length === 0 ? (
            <Alert variant="info">
              <Alert.Heading>No events found</Alert.Heading>
              <p>Try adjusting your filters or search terms.</p>
            </Alert>
          ) : (
            <>
              <Row>
                {events.map((event) => (
                  <Col key={event._id} md={6} lg={4} className="mb-4">
                    <EventCard event={event} />
                  </Col>
                ))}
              </Row>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="d-flex justify-content-center mt-5">
                  <Pagination>
                    <Pagination.First
                      onClick={() => handlePageChange(1)}
                      disabled={filters.page === 1}
                    />
                    <Pagination.Prev
                      onClick={() => handlePageChange(filters.page - 1)}
                      disabled={filters.page === 1}
                    />
                    
                    {[...Array(pagination.totalPages)].map((_, i) => {
                      const page = i + 1;
                      if (
                        page === 1 ||
                        page === pagination.totalPages ||
                        (page >= filters.page - 2 && page <= filters.page + 2)
                      ) {
                        return (
                          <Pagination.Item
                            key={page}
                            active={page === filters.page}
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </Pagination.Item>
                        );
                      } else if (
                        page === filters.page - 3 ||
                        page === filters.page + 3
                      ) {
                        return <Pagination.Ellipsis key={page} />;
                      }
                      return null;
                    })}
                    
                    <Pagination.Next
                      onClick={() => handlePageChange(filters.page + 1)}
                      disabled={filters.page === pagination.totalPages}
                    />
                    <Pagination.Last
                      onClick={() => handlePageChange(pagination.totalPages)}
                      disabled={filters.page === pagination.totalPages}
                    />
                  </Pagination>
                </div>
              )}
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default EventList;