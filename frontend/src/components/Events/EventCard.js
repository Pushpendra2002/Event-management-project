import React from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Star } from 'lucide-react';
import moment from 'moment';

const EventCard = ({ event }) => {
  const formatDate = (date) => {
    return moment(date).format('MMM D, YYYY • h:mm A');
  };

  const getCategoryBadge = (category) => {
    const categories = {
      music: 'primary',
      sports: 'success',
      conference: 'info',
      workshop: 'warning',
      festival: 'danger',
      exhibition: 'secondary',
      networking: 'dark',
      charity: 'success',
      food: 'warning',
      art: 'info',
      technology: 'primary',
      business: 'dark',
      education: 'info',
      health: 'success',
      other: 'secondary'
    };
    
    return categories[category] || 'secondary';
  };

  return (
    <Card className="h-100 shadow-sm">
      <div style={{ height: '200px', overflow: 'hidden' }}>
        <Card.Img
          variant="top"
          src={event.images?.find(img => img.isMain)?.url || '/default-event.jpg'}
          alt={event.title}
          style={{ objectFit: 'cover', height: '100%', width: '100%' }}
        />
        {event.featured && (
          <Badge
            bg="warning"
            className="position-absolute"
            style={{ top: '10px', right: '10px' }}
          >
            Featured
          </Badge>
        )}
      </div>
      
      <Card.Body className="d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <Badge bg={getCategoryBadge(event.category)}>
            {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
          </Badge>
          <div className="d-flex align-items-center">
            <Star size={16} className="text-warning me-1" />
            <span>{event.rating.average.toFixed(1)}</span>
            <span className="text-muted ms-1">({event.rating.count})</span>
          </div>
        </div>
        
        <Card.Title className="mb-3">
          <Link to={`/events/${event._id}`} className="text-decoration-none text-dark">
            {event.title}
          </Link>
        </Card.Title>
        
        <Card.Text className="flex-grow-1 text-muted">
          {event.shortDescription || 
           (event.description.length > 100 
            ? `${event.description.substring(0, 100)}...` 
            : event.description)}
        </Card.Text>
        
        <div className="mt-auto">
          <div className="d-flex align-items-center text-muted mb-2">
            <Calendar size={16} className="me-2" />
            <small>{formatDate(event.startDate)}</small>
          </div>
          
          <div className="d-flex align-items-center text-muted mb-3">
            <MapPin size={16} className="me-2" />
            <small>
              {event.isOnline ? 'Online Event' : event.venue?.name || 'Venue TBA'}
            </small>
          </div>
          
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <Users size={16} className="me-1" />
              <small>
                {event.currentAttendees} / {event.maxAttendees || '∞'}
              </small>
            </div>
            
            {event.ticketTypes?.length > 0 && (
              <Badge bg="light" text="dark">
                From ₹{Math.min(...event.ticketTypes.map(t => t.price))}
              </Badge>
            )}
          </div>
          
          <Button
            as={Link}
            to={`/events/${event._id}`}
            variant="primary"
            className="w-100 mt-3"
          >
            View Details
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default EventCard;