import React from 'react';
import { Card, Form } from 'react-bootstrap';
import { Filter } from 'lucide-react';

const EventFilters = ({ filters, onFilterChange }) => {
  const categories = [
    'music', 'sports', 'conference', 'workshop', 'festival',
    'exhibition', 'networking', 'charity', 'food', 'art',
    'technology', 'business', 'education', 'health', 'other'
  ];

  const handleFilterChange = (name, value) => {
    onFilterChange({ [name]: value });
  };

  return (
    <Card className="border-0 shadow-sm">
      <Card.Body>
        <div className="d-flex align-items-center mb-3">
          <Filter size={20} className="me-2" />
          <h5 className="mb-0">Filters</h5>
        </div>

        {/* Category Filter */}
        <div className="mb-4">
          <h6 className="mb-2">Category</h6>
          <div className="d-flex flex-wrap gap-2">
            <Form.Check
              type="radio"
              id="category-all"
              label="All"
              name="category"
              checked={!filters.category}
              onChange={() => handleFilterChange('category', '')}
            />
            {categories.slice(0, 5).map(category => (
              <Form.Check
                key={category}
                type="radio"
                id={`category-${category}`}
                label={category.charAt(0).toUpperCase() + category.slice(1)}
                name="category"
                checked={filters.category === category}
                onChange={() => handleFilterChange('category', category)}
              />
            ))}
          </div>
        </div>

        {/* Date Filter */}
        <div className="mb-4">
          <h6 className="mb-2">Date</h6>
          <div className="d-flex flex-column gap-2">
            <Form.Check
              type="radio"
              id="date-all"
              label="All Dates"
              name="date"
              checked={!filters.startDate && !filters.endDate}
              onChange={() => handleFilterChange('startDate', '')}
            />
            <Form.Check
              type="radio"
              id="date-today"
              label="Today"
              name="date"
              onChange={() => {
                const today = new Date().toISOString().split('T')[0];
                handleFilterChange('startDate', today);
              }}
            />
            <Form.Check
              type="radio"
              id="date-weekend"
              label="This Weekend"
              name="date"
              onChange={() => {
                const today = new Date();
                const saturday = new Date(today);
                saturday.setDate(today.getDate() + (6 - today.getDay()));
                handleFilterChange('startDate', saturday.toISOString().split('T')[0]);
              }}
            />
            <Form.Check
              type="radio"
              id="date-week"
              label="This Week"
              name="date"
              onChange={() => {
                const today = new Date();
                handleFilterChange('startDate', today.toISOString().split('T')[0]);
              }}
            />
          </div>
        </div>

        {/* Price Filter */}
        <div className="mb-4">
          <h6 className="mb-2">Price</h6>
          <div className="d-flex flex-column gap-2">
            <Form.Check
              type="radio"
              id="price-all"
              label="All Prices"
              name="price"
              checked={true}
              onChange={() => {}}
            />
            <Form.Check
              type="radio"
              id="price-free"
              label="Free"
              name="price"
              onChange={() => {}}
            />
            <Form.Check
              type="radio"
              id="price-paid"
              label="Paid"
              name="price"
              onChange={() => {}}
            />
          </div>
        </div>

        {/* Sort By */}
        <div className="mb-4">
          <h6 className="mb-2">Sort By</h6>
          <Form.Select
            value={filters.sort}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
          >
            <option value="-createdAt">Newest First</option>
            <option value="createdAt">Oldest First</option>
            <option value="startDate">Date (Soonest)</option>
            <option value="-startDate">Date (Latest)</option>
            <option value="-rating.average">Highest Rated</option>
            <option value="price">Price (Low to High)</option>
            <option value="-price">Price (High to Low)</option>
          </Form.Select>
        </div>

        {/* Reset Filters */}
        <button
          className="btn btn-outline-secondary w-100"
          onClick={() => onFilterChange({
            category: '',
            startDate: '',
            endDate: '',
            sort: '-createdAt',
            page: 1
          })}
        >
          Reset Filters
        </button>
      </Card.Body>
    </Card>
  );
};

export default EventFilters;