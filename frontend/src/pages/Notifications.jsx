import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} from '../features/notifications/notificationSlice';
import { Button, ListGroup, Badge } from 'react-bootstrap';

const Notifications = () => {
  const dispatch = useDispatch();
  const { notifications, loading } = useSelector(state => state.notifications);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Notifications</h3>
        <Button variant="secondary" onClick={() => dispatch(markAllAsRead())}>
          Mark all as read
        </Button>
      </div>

      <ListGroup>
        {notifications.map(notification => (
          <ListGroup.Item
            key={notification._id}
            className={!notification.read ? 'bg-light' : ''}
          >
            <div className="d-flex justify-content-between">
              <div
                onClick={() => dispatch(markAsRead(notification._id))}
                style={{ cursor: 'pointer' }}
              >
                <strong>{notification.title}</strong>
                {!notification.read && (
                  <Badge bg="primary" className="ms-2">New</Badge>
                )}
                <div className="text-muted">{notification.message}</div>
              </div>

              <Button
                variant="danger"
                size="sm"
                onClick={() => dispatch(deleteNotification(notification._id))}
              >
                Delete
              </Button>
            </div>
          </ListGroup.Item>
        ))}

        {notifications.length === 0 && (
          <ListGroup.Item>No notifications</ListGroup.Item>
        )}
      </ListGroup>
    </div>
  );
};

export default Notifications;
