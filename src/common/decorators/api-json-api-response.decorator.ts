import { applyDecorators, Type } from '@nestjs/common';
import { ApiResponse, ApiExtraModels, getSchemaPath } from '@nestjs/swagger';

interface JsonApiDataObject {
  type: string;
  id: string;
  attributes: Record<string, unknown>;
  links: {
    self: string;
  };
}

interface JsonApiResponseObject {
  data: JsonApiDataObject | JsonApiDataObject[];
  accessToken?: string;
}

/**
 * Decorator for documenting JSON:API compliant responses.
 * Handles both regular responses, array responses, and auth responses (with accessToken).
 *
 * @param model The DTO class representing the attributes
 * @param resourceType The JSON:API resource type (e.g., 'users', 'auth', 'tasks')
 * @param statusCode HTTP status code (default: 200)
 * @param isAuthResponse Whether this includes accessToken at top-level (default: false)
 * @param isArray Whether the response is an array of items (default: false)
 * @param includeSetCookie Whether to add Set-Cookie header documentation (default: isAuthResponse)
 */
export function ApiJsonApiResponse(
  model: Type<unknown>,
  resourceType: string,
  statusCode: number = 200,
  isAuthResponse: boolean = false,
  isArray: boolean = false,
  includeSetCookie: boolean = isAuthResponse,
) {
  const attributes = generateAttributesExample(model);

  const dataExample: JsonApiDataObject = {
    type: resourceType,
    id: resourceType === 'auth' ? 'firebase-uid-123' : `${resourceType}-id-123`,
    attributes,
    links: {
      self: `/${resourceType}/${resourceType === 'auth' ? 'firebase-uid-123' : `${resourceType}-id-123`}`,
    },
  };

  const responseExample: JsonApiResponseObject = {
    data: isArray ? [dataExample] : dataExample,
  };

  if (isAuthResponse) {
    responseExample.accessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
  }

  const description = includeSetCookie
    ? 'Response with Set-Cookie header containing HttpOnly refreshToken'
    : 'JSON:API compliant response';

  const resourceId =
    resourceType === 'auth' ? 'user-id-123' : `${resourceType}-id-123`;

  const dataSchema = {
    ...(isArray
      ? {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                example: resourceType,
              },
              id: {
                type: 'string',
                example: resourceId,
              },
              attributes: {
                $ref: getSchemaPath(model),
              },
              links: {
                type: 'object',
                properties: {
                  self: {
                    type: 'string',
                    example: `/${resourceType}/${resourceId}`,
                  },
                },
              },
            },
          },
        }
      : {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              example: resourceType,
            },
            id: {
              type: 'string',
              example: resourceId,
            },
            attributes: {
              $ref: getSchemaPath(model),
            },
            links: {
              type: 'object',
              properties: {
                self: {
                  type: 'string',
                  example: `/${resourceType}/${resourceId}`,
                },
              },
            },
          },
        }),
  };

  return applyDecorators(
    ApiExtraModels(model),
    ApiResponse({
      status: statusCode,
      description,
      schema: {
        type: 'object',
        properties: {
          data: dataSchema,
          ...(isAuthResponse && {
            accessToken: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
              description:
                'JWT access token for authentication (stored in top-level, not in data)',
            },
          }),
        },
        example: responseExample,
      },
      headers: includeSetCookie
        ? {
            'Set-Cookie': {
              description:
                'Refresh token stored in HttpOnly, Secure, SameSite cookie',
              schema: {
                type: 'string',
                example:
                  'refreshToken=<token>; HttpOnly; Secure; SameSite=Strict; Path=/',
              },
            },
          }
        : undefined,
    }),
  );
}

/**
 * Generate example attributes from a DTO model
 */
function generateAttributesExample(
  model: Type<unknown>,
): Record<string, unknown> {
  const modelName = model.name.toLowerCase();
  const attributes: Record<string, unknown> = {};

  // Generate specific examples based on DTO type
  if (modelName.includes('user') || modelName.includes('auth')) {
    attributes.email = 'user@example.com';
    attributes.firstName = 'John';
    attributes.lastName = 'Doe';
    attributes.displayName = 'John Doe';
    attributes.photoUrl = 'https://example.com/photo.jpg';
    attributes.isEmailVerified = true;
    attributes.createdAt = '2024-01-15T10:30:00Z';
    attributes.updatedAt = '2024-01-15T10:30:00Z';
  } else if (modelName.includes('task')) {
    attributes.userId = 'user-id-456';
    attributes.title = 'Sample Task';
    attributes.description = 'This is a sample task description';
    attributes.status = 'todo';
    attributes.priority = 'high';
    attributes.dueDate = '2024-02-15T18:00:00Z';
    attributes.createdAt = '2024-01-15T10:30:00Z';
    attributes.updatedAt = '2024-01-15T10:30:00Z';
  } else if (modelName.includes('message')) {
    attributes.message = 'Operation completed successfully';
  } else if (modelName.includes('stats')) {
    attributes.total = 42;
    attributes.todo = 15;
    attributes.inProgress = 12;
    attributes.done = 15;
  } else {
    // Fallback: try to instantiate and get properties
    try {
      const instance = new model();
      const propertyNames = Object.getOwnPropertyNames(instance);

      for (const prop of propertyNames) {
        if (prop === 'id' || prop === '_id' || prop === 'uid') {
          continue;
        }

        const descriptor = Object.getOwnPropertyDescriptor(instance, prop);
        if (descriptor && descriptor.value !== undefined) {
          attributes[prop] = descriptor.value;
        }
      }
    } catch {
      // If instantiation fails, use generic defaults
      attributes.data = 'Sample data';
    }
  }

  return attributes;
}
