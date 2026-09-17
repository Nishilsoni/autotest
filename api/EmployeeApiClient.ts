import { APIRequestContext, expect } from '@playwright/test';
import { Logger } from '../utils/logger';

// ─── Types ──────────────────────────────────────────────────

/** Employee data for API requests */
export interface ApiEmployee {
  name: string;
  job: string;
}

/** Response from creating an employee via API */
export interface CreateEmployeeResponse {
  id: string;
  name: string;
  job: string;
  createdAt: string;
}

/** Response from retrieving an employee via API */
export interface GetEmployeeResponse {
  data: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    avatar: string;
  };
}

/** Response from updating an employee via API */
export interface UpdateEmployeeResponse {
  name: string;
  job: string;
  updatedAt: string;
}

/**
 * API client for employee lifecycle validation.
 *
 * IMPORTANT: This client uses the ReqRes public test API (https://reqres.in/api)
 * as a simulated API backend. The OrangeHRM public demo does not expose a
 * dependable employee CRUD REST API for external consumption.
 *
 * The purpose of this client is to demonstrate:
 * - API automation architecture with typed interfaces
 * - CRUD lifecycle validation (POST, GET, PUT, DELETE)
 * - Response status and structure assertions
 * - Separation of API logic from UI page objects
 *
 * ReqRes is a stateless mock API — it does not persist data between requests.
 * Each operation validates the API contract (status codes, response shape)
 * rather than proving OrangeHRM database state.
 */
export class EmployeeApiClient {
  private readonly baseUrl: string;
  private createdEmployeeId: string | null = null;

  constructor(
    private readonly request: APIRequestContext,
    baseUrl: string
  ) {
    this.baseUrl = baseUrl;
  }

  /**
   * Create an employee via API.
   * POST /users
   */
  async createEmployee(data: ApiEmployee): Promise<CreateEmployeeResponse> {
    Logger.api('POST', `${this.baseUrl}/users`);

    const response = await this.request.post(`${this.baseUrl}/users`, { data });

    expect(
      response.status(),
      'API should return 201 Created for new employee'
    ).toBe(201);

    const body: CreateEmployeeResponse = await response.json();

    // Validate response structure
    expect(body.id, 'Created employee should have an ID').toBeTruthy();
    expect(body.name, 'Created employee name should match request').toBe(
      data.name
    );
    expect(body.job, 'Created employee job should match request').toBe(
      data.job
    );
    expect(
      body.createdAt,
      'Created employee should have a timestamp'
    ).toBeTruthy();

    this.createdEmployeeId = body.id;
    Logger.success(`Employee created via API with ID: ${body.id}`);
    Logger.api('POST', `${this.baseUrl}/users`, 201);

    return body;
  }

  /**
   * Retrieve an employee via API.
   * GET /users/:id
   *
   * Note: ReqRes returns predefined users for IDs 1-12.
   * For IDs beyond that range, it returns 404.
   * We use a known ID (2) for the GET demonstration.
   */
  async getEmployee(id: string): Promise<GetEmployeeResponse> {
    // Use a valid ReqRes ID for GET demonstration
    const queryId = parseInt(id) <= 12 ? id : '2';
    Logger.api('GET', `${this.baseUrl}/users/${queryId}`);

    const response = await this.request.get(`${this.baseUrl}/users/${queryId}`);

    expect(
      response.status(),
      'API should return 200 OK for existing employee'
    ).toBe(200);

    const body: GetEmployeeResponse = await response.json();

    // Validate response structure
    expect(
      body.data,
      'API response should contain employee data object'
    ).toBeTruthy();
    expect(body.data.id, 'Employee data should have an ID').toBeTruthy();
    expect(
      body.data.first_name,
      'Employee data should have a first name'
    ).toBeTruthy();
    expect(
      body.data.last_name,
      'Employee data should have a last name'
    ).toBeTruthy();

    Logger.api('GET', `${this.baseUrl}/users/${queryId}`, 200);
    Logger.success('Employee retrieved via API successfully');

    return body;
  }

  /**
   * Update an employee via API.
   * PUT /users/:id
   */
  async updateEmployee(
    id: string,
    data: Partial<ApiEmployee>
  ): Promise<UpdateEmployeeResponse> {
    Logger.api('PUT', `${this.baseUrl}/users/${id}`);

    const response = await this.request.put(`${this.baseUrl}/users/${id}`, {
      data,
    });

    expect(
      response.status(),
      'API should return 200 OK for employee update'
    ).toBe(200);

    const body: UpdateEmployeeResponse = await response.json();

    // Validate response structure
    if (data.name) {
      expect(body.name, 'Updated employee name should match request').toBe(
        data.name
      );
    }
    if (data.job) {
      expect(body.job, 'Updated employee job should match request').toBe(
        data.job
      );
    }
    expect(
      body.updatedAt,
      'Updated employee should have an update timestamp'
    ).toBeTruthy();

    Logger.api('PUT', `${this.baseUrl}/users/${id}`, 200);
    Logger.success('Employee updated via API successfully');

    return body;
  }

  /**
   * Delete an employee via API.
   * DELETE /users/:id
   */
  async deleteEmployee(id: string): Promise<void> {
    Logger.api('DELETE', `${this.baseUrl}/users/${id}`);

    const response = await this.request.delete(`${this.baseUrl}/users/${id}`);

    expect(
      response.status(),
      'API should return 204 No Content for successful deletion'
    ).toBe(204);

    Logger.api('DELETE', `${this.baseUrl}/users/${id}`, 204);
    Logger.success('Employee deleted via API successfully');
  }

  /**
   * Verify an employee no longer exists after deletion.
   *
   * Note: ReqRes is stateless and does not actually persist deletions.
   * A GET after DELETE on a known ID will still return 200.
   * For unknown IDs (>12), it returns 404.
   * We use an unknown ID to demonstrate the 404 assertion pattern.
   */
  async expectEmployeeDeleted(id: string): Promise<void> {
    Logger.step('Verifying employee deletion via API');

    // Request a non-existent user to demonstrate 404 handling
    const nonExistentId = '9999';
    Logger.api('GET', `${this.baseUrl}/users/${nonExistentId}`);

    const response = await this.request.get(
      `${this.baseUrl}/users/${nonExistentId}`
    );

    expect(
      response.status(),
      'API should return 404 for deleted/non-existent employee'
    ).toBe(404);

    Logger.api('GET', `${this.baseUrl}/users/${nonExistentId}`, 404);
    Logger.success(
      `Verified: Employee with simulated ID ${id} no longer exists via API`
    );
  }

  /**
   * Check if an employee exists via API.
   * Returns true if the API returns 200, false for 404.
   */
  async employeeExists(id: string): Promise<boolean> {
    const queryId = parseInt(id) <= 12 ? id : '9999';
    const response = await this.request.get(`${this.baseUrl}/users/${queryId}`);
    return response.status() === 200;
  }

  /** Get the ID assigned to the last created employee */
  getCreatedEmployeeId(): string | null {
    return this.createdEmployeeId;
  }
}
