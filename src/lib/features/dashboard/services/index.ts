import { httpClient } from '#lib/core/http/index.ts';
import { DashboardService } from './dashboard.service.ts';

export const dashboardService = new DashboardService(httpClient);
