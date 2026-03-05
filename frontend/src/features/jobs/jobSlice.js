import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const initialState = {
  jobs: [],
  totalJobs: 0,
  totalPages: 1,
  currentPage: 1,
  userJobs: [],
  isLoading: false,
  error: null,
};

// Create new job
export const createJob = createAsyncThunk(
  'jobs/createJob',
  async (jobData, thunkAPI) => {
    try {
      const response = await axios.post(`${backendUrl}/jobs`, jobData);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Error creating job');
    }
  }
);

// Get all open jobs (with filters, sort, pagination)
export const getJobs = createAsyncThunk(
  'jobs/getJobs',
  async (filters = {}, thunkAPI) => {
    try {
      const params = new URLSearchParams();
      if (filters.game) params.set('game', filters.game);
      if (filters.search) params.set('search', filters.search);
      if (filters.serviceType) params.set('serviceType', filters.serviceType);
      if (filters.budgetMin) params.set('budgetMin', filters.budgetMin);
      if (filters.budgetMax) params.set('budgetMax', filters.budgetMax);
      if (filters.sortBy) params.set('sortBy', filters.sortBy);
      if (filters.page) params.set('page', filters.page);
      if (filters.limit) params.set('limit', filters.limit);


      const response = await axios.get(`${backendUrl}/jobs?${params.toString()}`);
      return response.data; // { jobs, total, page, pages }
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Error fetching jobs');
    }
  }
);

// Get user's own jobs
export const getUserJobs = createAsyncThunk(
  'jobs/getUserJobs',
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(`${backendUrl}/jobs/user`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Error fetching user jobs');
    }
  }
);

// Delete a job (buyer only, open jobs)
export const deleteJob = createAsyncThunk(
  'jobs/deleteJob',
  async (jobId, thunkAPI) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${backendUrl}/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return jobId;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Error deleting job');
    }
  }
);

// Withdraw a bid (seller only, pending bids)
export const withdrawBid = createAsyncThunk(
  'jobs/withdrawBid',
  async (bidId, thunkAPI) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${backendUrl}/bids/${bidId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return bidId;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Error withdrawing bid');
    }
  }
);

const jobSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    setPage: (state, action) => { state.currentPage = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getJobs.pending, (state) => { state.isLoading = true; })
      .addCase(getJobs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.jobs = action.payload.jobs;
        state.totalJobs = action.payload.total;
        state.totalPages = action.payload.pages;
        state.currentPage = action.payload.page;
      })
      .addCase(getJobs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(getUserJobs.pending, (state) => { state.isLoading = true; })
      .addCase(getUserJobs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userJobs = action.payload.jobs || action.payload;
      })
      .addCase(getUserJobs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createJob.pending, (state) => { state.isLoading = true; })
      .addCase(createJob.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userJobs.unshift(action.payload);
      })
      .addCase(createJob.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.userJobs = state.userJobs.filter(j => j._id !== action.payload);
      });

  }
});

export const { clearError, setPage } = jobSlice.actions;
export default jobSlice.reducer;
