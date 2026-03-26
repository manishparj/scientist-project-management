import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Staff } from '../types';

export const staffApi = createApi({
  reducerPath: 'staffApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/staff',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Staff'],
  endpoints: (builder) => ({
    getStaffByProject: builder.query<Staff[], string>({
      query: (projectId) => `/project/${projectId}`,
      providesTags: ['Staff'],
    }),
    addStaff: builder.mutation<Staff, Partial<Staff>>({
      query: (staff) => ({
        url: '/',
        method: 'POST',
        body: staff,
      }),
      invalidatesTags: ['Staff'],
    }),
    updateStaff: builder.mutation<Staff, { id: string; data: Partial<Staff> }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Staff'],
    }),
    deleteStaff: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Staff'],
    }),
  }),
});

export const {
  useGetStaffByProjectQuery,
  useAddStaffMutation,
  useUpdateStaffMutation,
  useDeleteStaffMutation,
} = staffApi;