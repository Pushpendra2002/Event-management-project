import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import { Navbar, Nav, Container, NavDropdown, Badge } from 'react-bootstrap';
import { Bell, Calendar, User, LogOut } from 'lucide-react';
import { useEffect } from 'react';
import { fetchNotifications } from '../../features/notifications/notificationSlice';

const Header = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const { notifications } = useSelector((state) => state.notifications);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  useEffect(() => {
  if (user) {
    dispatch(fetchNotifications());
  }
}, [dispatch, user]);

  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top">
      <Container>
        <Navbar.Brand as={Link} to="/">
          <Calendar className="me-2" />
          EventHub
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/events">Events</Nav.Link>
  <Nav.Link as={Link} to="/categories">Categories</Nav.Link> {/* Fixed this line */}
            {user?.role === 'organizer' && (
              <Nav.Link as={Link} to="/organizer/dashboard">Dashboard</Nav.Link>
            )}
            {user?.role === 'admin' && (
              <Nav.Link as={Link} to="/admin/dashboard">Admin</Nav.Link>
            )}
          </Nav>
          
          <Nav>
            {user ? (
              <>
                <Nav.Link 
                  as={Link} 
                  to="/bookings"
                  className="d-flex align-items-center"
                >
                  My Bookings
                </Nav.Link>
                
                <NavDropdown
                  title={
                    <div className="d-flex align-items-center">
                      <Bell />
                      {unreadNotifications > 0 && (
                        <Badge bg="danger" className="ms-1">
                          {unreadNotifications}
                        </Badge>
                      )}
                    </div>
                  }
                  align="end"
                >
                  <NavDropdown.Header>Notifications</NavDropdown.Header>
                  {notifications.slice(0, 5).map((notification) => (
                    <NavDropdown.Item key={notification._id}>
                      <div className="d-flex">
                        <div className={`me-2 ${notification.read ? '' : 'text-primary'}`}>
                          ●
                        </div>
                        <div>
                          <div className="fw-bold">{notification.title}</div>
                          <div className="text-muted small">{notification.message}</div>
                        </div>
                      </div>
                    </NavDropdown.Item>
                  ))}
                  {notifications.length === 0 && (
                    <NavDropdown.Item disabled>
                      No notifications
                    </NavDropdown.Item>
                  )}
                  <NavDropdown.Divider />
                  <NavDropdown.Item as={Link} to="/notifications">
                    View All
                  </NavDropdown.Item>
                </NavDropdown>
                
                <NavDropdown
                  title={
                    <div className="d-flex align-items-center">
                      <User className="me-1" />
                      {user.name}
                    </div>
                  }
                  align="end"
                >
                  <NavDropdown.Item as={Link} to="/profile">
                    Profile
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/settings">
                    Settings
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>
                    <LogOut className="me-1" size={16} />
                    Logout
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                <Nav.Link as={Link} to="/register">Register</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;