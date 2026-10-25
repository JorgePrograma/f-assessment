import { httpClient } from '#lib/core/http/index.ts';
import { CustomerService } from './customer.service.ts';

export const customerService = new CustomerService(httpClient);
