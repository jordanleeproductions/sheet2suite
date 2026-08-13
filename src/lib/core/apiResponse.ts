import { NextResponse } from 'next/server';

export interface StandardApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export const apiResponse = {
  success<T>(data: T, status = 200) {
    return NextResponse.json(
      {
        success: true,
        data,
        timestamp: new Date().toISOString(),
      },
      { status }
    );
  },

  unauthorized(error = 'Request had invalid or expired authentication credentials.') {
    return NextResponse.json(
      {
        success: false,
        error,
        code: 'UNAUTHENTICATED',
        timestamp: new Date().toISOString(),
      },
      { status: 401 }
    );
  },

  badRequest(error = 'Bad Request. Missing or invalid parameters.') {
    return NextResponse.json(
      {
        success: false,
        error,
        code: 'BAD_REQUEST',
        timestamp: new Date().toISOString(),
      },
      { status: 400 }
    );
  },

  notFound(error = 'Requested resource not found.') {
    return NextResponse.json(
      {
        success: false,
        error,
        code: 'NOT_FOUND',
        timestamp: new Date().toISOString(),
      },
      { status: 404 }
    );
  },

  error(error = 'An unexpected server error occurred.', status = 500) {
    return NextResponse.json(
      {
        success: false,
        error,
        code: 'SERVER_ERROR',
        timestamp: new Date().toISOString(),
      },
      { status }
    );
  },
};
