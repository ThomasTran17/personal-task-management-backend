import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

/**
 * Decorator for documenting JSON:API error responses
 *
 * @param statusCode HTTP status code
 * @param description Description of the error
 */
export function ApiJsonApiError(
  statusCode: number,
  description: string = 'Error response',
) {
  return applyDecorators(
    ApiResponse({
      status: statusCode,
      description,
      schema: {
        type: 'object',
        properties: {
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                status: {
                  type: 'string',
                  example: String(statusCode),
                  description: 'HTTP status code as string',
                },
                source: {
                  type: 'object',
                  properties: {
                    pointer: {
                      type: 'string',
                      example: '/data/attributes/email',
                      description:
                        'JSON Pointer to the problem field (RFC 6901)',
                    },
                  },
                },
                title: {
                  type: 'string',
                  example: 'Validation Error',
                  description: 'Short error title',
                },
                detail: {
                  type: 'string',
                  example: 'Email is required and must be valid',
                  description: 'Detailed error message',
                },
              },
            },
          },
        },
        example: {
          errors: [
            {
              status: String(statusCode),
              source: {
                pointer: '/data/attributes/email',
              },
              title: 'Validation Error',
              detail: 'Email is required and must be valid',
            },
          ],
        },
      },
    }),
  );
}
