import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { DashboardData } from '../types';

export const publicApi = createApi({
  reducerPath: 'publicApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/public',
  }),
  endpoints: (builder) => ({
    getPublicDashboard: builder.query<DashboardData[], void>({
      query: () => '/dashboard',
    }),
  }),
});

export const { useGetPublicDashboardQuery } = publicApi;