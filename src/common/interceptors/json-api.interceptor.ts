import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { RESOURCE_TYPE_KEY } from '../decorators/resource.decorator';

interface JsonApiResponse {
  data: unknown;
  accessToken?: string;
}

@Injectable()
export class JsonApiInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<JsonApiResponse> {
    return next.handle().pipe(
      map((data: unknown) => {
        // Get resource type from decorator or default to 'resource'
        const resourceType =
          this.reflector.get<string>(RESOURCE_TYPE_KEY, context.getHandler()) ||
          'resource';

        // If data is null/undefined, return immediately
        if (!data) {
          return this.formatResponse(null, resourceType);
        }

        // If data is an array, format each item
        if (Array.isArray(data)) {
          return {
            data: data.map((item: unknown) =>
              this.transformToJsonApi(item, resourceType),
            ),
          };
        }

        // If data is an object with 'data' property (like login response), handle specially
        const dataObj = data as Record<string, unknown>;
        if (dataObj.data && typeof dataObj.data === 'object') {
          // Auth case: { data: user, accessToken: "..." }
          // Extract accessToken and other metadata from top-level
          const metadata: Record<string, unknown> = {};
          const dataToTransform = dataObj.data;

          if (dataObj.accessToken) {
            metadata.accessToken = dataObj.accessToken;
          }

          return {
            data: this.transformToJsonApi(dataToTransform, resourceType),
            ...metadata,
          };
        }

        // Format regular object
        return this.formatResponse(data, resourceType);
      }),
    );
  }

  private formatResponse(data: unknown, resourceType: string): JsonApiResponse {
    if (!data) {
      return { data: null };
    }

    return {
      data: this.transformToJsonApi(data, resourceType),
    };
  }

  private transformToJsonApi(data: unknown, resourceType: string): unknown {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const dataObj = data as Record<string, unknown>;

    // Find id from common fields: id, _id, uid
    let id = dataObj.id || dataObj._id || dataObj.uid;

    // If not found, generate from random
    if (!id) {
      id = Math.random().toString(36).substr(2, 9);
    }

    // Extract id from attributes
    // Remove id fields and metadata fields (accessToken, refreshToken)
    const attributes = { ...dataObj };
    delete attributes.id;
    delete attributes._id;
    delete attributes.uid;
    delete attributes.accessToken;
    delete attributes.refreshToken;

    const result: Record<string, unknown> = {
      type: resourceType,
      id: String(id),
      attributes,
    };

    // Add self link
    result.links = {
      self: `/${resourceType}/${id}`,
    };

    return result;
  }
}
