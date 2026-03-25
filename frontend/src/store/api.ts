// frontend/src/store/api.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  designation?: string;
  mobile?: string;
  token?: string;
}

export interface Project {
  _id: string;
  name: string;
  type: string;
  status: 'completed' | 'yet_to_start' | 'ongoing';
  startDate: string;
  endDate: string;
  scientistId: string;
}

export interface Staff {
  _id: string;
  name: string;
  designation: string;
  doj: string;
  currentlyWorking: boolean;
  lastDay?: string;
  mobile: string;
  email: string;
  remark?: string;
  projectId: string;
}

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['User', 'Project', 'Staff'],
  endpoints: (builder) => ({
    // Auth
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    
    // Scientists
    getScientists: builder.query<User[], void>({
      query: () => '/users/scientists',
      providesTags: ['User'],
    }),
    
    createScientist: builder.mutation({
      query: (scientist) => ({
        url: '/users/scientists',
        method: 'POST',
        body: scientist,
      }),
      invalidatesTags: ['User'],
    }),
    
    updateScientist: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/users/scientists/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    
    deleteScientist: builder.mutation({
      query: (id) => ({
        url: `/users/scientists/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
    
    // Projects
    getProjects: builder.query<Project[], string | void>({
      query: (scientistId) => scientistId ? `/projects?scientistId=${scientistId}` : '/projects',
      providesTags: ['Project'],
    }),
    
    createProject: builder.mutation({
      query: (project) => ({
        url: '/projects',
        method: 'POST',
        body: project,
      }),
      invalidatesTags: ['Project'],
    }),
    
    updateProject: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/projects/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Project'],
    }),
    
    deleteProject: builder.mutation({
      query: (id) => ({
        url: `/projects/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Project'],
    }),
    
    // Staff
    getStaffByProject: builder.query<Staff[], string>({
      query: (projectId) => `/staff/project/${projectId}`,
      providesTags: ['Staff'],
    }),
    
    createStaff: builder.mutation({
      query: (staff) => ({
        url: `/staff/project/${staff.projectId}`,
        method: 'POST',
        body: staff,
      }),
      invalidatesTags: ['Staff'],
    }),
    
    updateStaff: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/staff/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Staff'],
    }),
    
    deleteStaff: builder.mutation({
      query: (id) => ({
        url: `/staff/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Staff'],
    }),
  }),
});

export const {
  useLoginMutation,
  useGetScientistsQuery,
  useCreateScientistMutation,
  useUpdateScientistMutation,
  useDeleteScientistMutation,
  useGetProjectsQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useGetStaffByProjectQuery,
  useCreateStaffMutation,
  useUpdateStaffMutation,
  useDeleteStaffMutation,
} = api;