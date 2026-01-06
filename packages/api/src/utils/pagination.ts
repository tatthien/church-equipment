export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Extract and validate pagination parameters from query string
 * @param query - Express request query object
 * @returns Validated pagination parameters
 */
export function getPaginationParams(query: any): PaginationParams {
  const page = Math.max(1, parseInt(query.page as string) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(query.limit as string) || 10))

  return { page, limit }
}

/**
 * Calculate skip value for Prisma queries
 * @param page - Current page number (1-indexed)
 * @param limit - Items per page
 * @returns Number of items to skip
 */
export function getSkip(page: number, limit: number): number {
  return (page - 1) * limit
}

/**
 * Format data with pagination metadata
 * @param data - Array of items for current page
 * @param total - Total number of items
 * @param page - Current page number
 * @param limit - Items per page
 * @returns Formatted paginated response
 */
export function paginateResults<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResponse<T> {
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}
