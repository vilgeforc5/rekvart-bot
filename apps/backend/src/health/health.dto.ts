export type HealthStatus = 'ok' | 'error';

export interface HealthCheckResult {
  status: HealthStatus;
  message: string;
}

export interface HealthResponse {
  status: HealthStatus;
  timestamp: string;
  checks: {
    database: HealthCheckResult;
    bot: HealthCheckResult;
  };
}
