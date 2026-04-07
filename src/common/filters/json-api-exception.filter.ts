import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { FirebaseError } from 'firebase-admin';

@Catch()
export class JsonApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let title = 'Internal Server Error';
    let detail = 'An unexpected error occurred';
    let pointer = '/data';

    // Handle HttpException
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object') {
        const error = exceptionResponse as Record<string, unknown>;
        title = (error.error as string) || exception.name || title;
        detail =
          (error.message as string) ||
          (error.errors && (error.errors as Array<{ msg: string }>)[0]?.msg) ||
          detail;
        pointer = this.extractPointerFromMessage(detail, pointer);
      } else {
        detail = String(exceptionResponse);
      }
    }
    // Handle Firebase Admin SDK errors
    else if (
      exception instanceof Error &&
      (exception as unknown as Record<string, unknown>).code
    ) {
      const firebaseError = exception as unknown as FirebaseError;
      const errorCode =
        (typeof firebaseError.code === 'string'
          ? firebaseError.code
          : 'unknown') || 'unknown';

      // Map Firebase error codes to HTTP status codes
      const firebaseStatusMap: Record<string, number> = {
        'auth/user-not-found': HttpStatus.NOT_FOUND,
        'auth/wrong-password': HttpStatus.UNAUTHORIZED,
        'auth/invalid-email': HttpStatus.BAD_REQUEST,
        'auth/email-already-in-use': HttpStatus.CONFLICT,
        'auth/weak-password': HttpStatus.BAD_REQUEST,
        'auth/invalid-credential': HttpStatus.UNAUTHORIZED,
        'permission-denied': HttpStatus.FORBIDDEN,
        'not-found': HttpStatus.NOT_FOUND,
      };

      status = firebaseStatusMap[errorCode] || HttpStatus.INTERNAL_SERVER_ERROR;
      title = this.mapFirebaseErrorToTitle(errorCode);
      detail = firebaseError.message || detail;
      pointer = this.extractPointerFromFirebaseError(errorCode, pointer);
    }
    // Handle regular errors
    else if (exception instanceof Error) {
      title = exception.name;
      detail = exception.message;
    } else {
      detail = String(exception);
    }

    const jsonApiError = {
      status: String(status),
      source: {
        pointer,
      },
      title,
      detail,
    };

    response.status(status).json({
      errors: [jsonApiError],
    });
  }

  private mapFirebaseErrorToTitle(code: string): string {
    const titleMap: Record<string, string> = {
      'auth/user-not-found': 'User Not Found',
      'auth/wrong-password': 'Invalid Credentials',
      'auth/invalid-email': 'Invalid Email',
      'auth/email-already-in-use': 'Email Already In Use',
      'auth/weak-password': 'Weak Password',
      'auth/invalid-credential': 'Invalid Credentials',
      'permission-denied': 'Permission Denied',
      'not-found': 'Resource Not Found',
    };

    return titleMap[code] || 'Firebase Error';
  }

  private extractPointerFromMessage(
    message: string,
    defaultPointer: string,
  ): string {
    // Extract field name from error message
    if (message.includes('email')) return '/data/attributes/email';
    if (message.includes('password')) return '/data/attributes/password';
    if (message.includes('firstName')) return '/data/attributes/firstName';
    if (message.includes('lastName')) return '/data/attributes/lastName';
    if (message.includes('username')) return '/data/attributes/username';
    return defaultPointer;
  }

  private extractPointerFromFirebaseError(
    errorCode: string,
    defaultPointer: string,
  ): string {
    if (typeof errorCode !== 'string') return defaultPointer;
    if (errorCode.includes('email')) return '/data/attributes/email';
    if (errorCode.includes('password')) return '/data/attributes/password';
    return defaultPointer;
  }
}
