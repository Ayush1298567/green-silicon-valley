# Green Silicon Valley API Documentation

## Overview

The Green Silicon Valley API provides comprehensive endpoints for managing all aspects of the environmental STEM education platform. This RESTful API follows OpenAPI 3.0 specification and supports JSON request/response formats.

## Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://greensiliconvalley.org/api`

## Authentication

Most endpoints require authentication using Bearer tokens. Include the token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Getting an Access Token

1. Login via `/api/auth/login` with email and password
2. Receive JWT token in response
3. Include token in subsequent requests

## Rate Limiting

- **Public endpoints**: 100 requests per minute
- **Authenticated endpoints**: 1000 requests per minute
- **Admin endpoints**: 5000 requests per minute

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Time when limit resets

## Error Handling

All errors follow a consistent format:

```json
{
  "error": {
    "message": "Human-readable error message",
    "code": "ERROR_CODE",
    "statusCode": 400,
    "context": {
      "field": "additional error context"
    }
  }
}
```

### Common Error Codes

- `VALIDATION_ERROR` (400): Request validation failed
- `AUTHENTICATION_ERROR` (401): Authentication required
- `AUTHORIZATION_ERROR` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `CONFLICT_ERROR` (409): Resource conflict
- `RATE_LIMIT_ERROR` (429): Rate limit exceeded
- `DATABASE_ERROR` (500): Database operation failed
- `EXTERNAL_SERVICE_ERROR` (502): External service unavailable
- `INTERNAL_ERROR` (500): Internal server error

## Core Endpoints

### Authentication

#### POST `/api/auth/login`
User login endpoint.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "role": "volunteer"
  },
  "session": {
    "accessToken": "jwt_token_here"
  }
}
```

### Volunteers

#### POST `/api/volunteers/apply`
Submit volunteer application (public endpoint).

**Request:**
```json
{
  "email": "volunteer@example.com",
  "name": "John Doe",
  "phone": "+1234567890",
  "bio": "Environmental enthusiast",
  "interests": ["climate-change", "renewable-energy"]
}
```

#### POST `/api/volunteer-hours/submit`
Submit volunteer hours (authenticated).

**Request:**
```json
{
  "hours": 3.5,
  "presentationId": "uuid",
  "feedback": "Great presentation experience"
}
```

### Teachers

#### POST `/api/teachers/request`
Submit teacher presentation request (public endpoint).

**Request:**
```json
{
  "contactName": "Jane Smith",
  "contactEmail": "teacher@school.edu",
  "schoolName": "Elementary School",
  "gradeLevel": "5th Grade",
  "studentCount": 25,
  "preferredDates": ["2024-02-15", "2024-02-16"]
}
```

### Search

#### GET `/api/search`
Advanced search across all content types.

**Query Parameters:**
- `q` (required): Search query (min 2 characters)
- `types`: Comma-separated content types (presentation, volunteer, teacher, school, event, faq, blog, resource, team)
- `limit`: Results per page (default: 20, max: 100)
- `offset`: Pagination offset (default: 0)
- `sortBy`: Sort order (relevance, date, title)
- `filter_*`: Additional filters (e.g., `filter_status=active`)

**Response:**
```json
{
  "results": [
    {
      "id": "uuid",
      "type": "presentation",
      "title": "Presentation Title",
      "description": "Description text",
      "url": "/path/to/resource",
      "relevanceScore": 0.95,
      "metadata": {
        "date": "2024-01-15",
        "school": "School Name"
      },
      "highlights": ["matched text snippets"]
    }
  ],
  "facets": {
    "types": {
      "presentation": 10,
      "volunteer": 5
    },
    "categories": {},
    "tags": {}
  },
  "total": 15,
  "queryTime": 45
}
```

#### GET `/api/search/suggestions`
Get search suggestions and autocomplete.

**Query Parameters:**
- `q`: Search query (optional)
- `type`: `suggestions` or `trending` (default: suggestions)
- `limit`: Number of suggestions (default: 5)

### Automation

#### POST `/api/automation/onboarding-packet`
Generate onboarding packet for volunteer (admin only).

**Request:**
```json
{
  "volunteerId": "uuid"
}
```

#### POST `/api/automation/tasks`
Generate tasks from entity (admin only).

**Request:**
```json
{
  "entityType": "teacher_request",
  "entityId": "uuid"
}
```

#### POST `/api/automation/reminders`
Schedule reminders (admin only).

**Request:**
```json
{
  "entityType": "presentation",
  "entityId": "uuid",
  "reminderType": "presentation"
}
```

### Monitoring

#### GET `/api/monitoring`
Get system performance metrics (admin only).

**Query Parameters:**
- `action`: `summary`, `metrics`, or `health` (default: summary)

**Response:**
```json
{
  "summary": {
    "totalMetrics": 1250,
    "totalErrors": 5,
    "apiSuccessRate": 99.6
  },
  "performance": {
    "averagePageLoad": 1200,
    "averageApiResponse": 150
  },
  "errors": {
    "criticalErrors": 0,
    "recentErrors": []
  }
}
```

## File Upload

#### POST `/api/upload`
Upload file with automatic optimization.

**Request:** `multipart/form-data`
- `file`: File to upload
- `folder`: Storage folder (default: general)
- `preset`: Upload preset (avatar, presentation, document, media, resource)

**Response:**
```json
{
  "success": true,
  "file": {
    "id": "file-id",
    "name": "filename.jpg",
    "originalName": "original.jpg",
    "size": 245760,
    "type": "image/jpeg",
    "url": "https://storage.url/file.jpg",
    "thumbnailUrl": "https://storage.url/file_thumb.jpg",
    "uploadedAt": "2024-01-15T10:30:00Z"
  }
}
```

## Webhooks

The API supports webhooks for real-time notifications. Configure webhook endpoints in the admin dashboard.

### Webhook Events

- `volunteer.approved`
- `volunteer.rejected`
- `presentation.scheduled`
- `presentation.completed`
- `hours.approved`
- `hours.rejected`
- `teacher.request.submitted`

### Webhook Payload

```json
{
  "event": "volunteer.approved",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "volunteerId": "uuid",
    "volunteerName": "John Doe",
    "volunteerEmail": "john@example.com"
  }
}
```

## Pagination

List endpoints support pagination:

- `limit`: Items per page (default: 20, max: 100)
- `offset`: Starting position (default: 0)

Response includes pagination metadata:
```json
{
  "data": [...],
  "pagination": {
    "total": 150,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

## Filtering

Many endpoints support filtering via query parameters:

- `filter_status=active`
- `filter_role=volunteer`
- `filter_date_from=2024-01-01`
- `filter_date_to=2024-12-31`

## Sorting

Sort results using `sortBy` parameter:

- `sortBy=date` (newest first)
- `sortBy=-date` (oldest first)
- `sortBy=name` (alphabetical)
- `sortBy=relevance` (search relevance)

## Best Practices

1. **Always handle errors**: Check status codes and error responses
2. **Use pagination**: Don't request all data at once
3. **Cache responses**: Cache static data to reduce API calls
4. **Rate limiting**: Implement exponential backoff for rate limit errors
5. **Validate input**: Validate data before sending requests
6. **Use HTTPS**: Always use HTTPS in production
7. **Store tokens securely**: Never expose tokens in client-side code

## SDKs and Libraries

### JavaScript/TypeScript

```typescript
import { GSVClient } from '@gsv/api-client';

const client = new GSVClient({
  baseUrl: 'https://greensiliconvalley.org/api',
  apiKey: 'your-api-key'
});

const results = await client.search({
  query: 'environmental education',
  types: ['presentation', 'volunteer']
});
```

## Support

For API support:
- Email: api-support@greensiliconvalley.org
- Documentation: https://docs.greensiliconvalley.org/api
- Status Page: https://status.greensiliconvalley.org

## Changelog

### v1.0.0 (2024-01-15)
- Initial API release
- Core endpoints for volunteers, teachers, presentations
- Advanced search functionality
- Automation endpoints
- Performance monitoring

## OpenAPI Specification

Full OpenAPI 3.0 specification available at:
- `/docs/api/openapi.json`
- Swagger UI: `/docs/api/swagger` (coming soon)
