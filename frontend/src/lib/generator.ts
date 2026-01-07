import axios from 'axios';
import type { GenerateRequest, GenerateResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function generateCode(
  request: GenerateRequest
): Promise<GenerateResponse> {
  try {
    const response = await api.post<GenerateResponse>('/api/generate', request);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || 'Erreur lors de la génération du code'
      );
    }
    throw error;
  }
}

export async function getAvailableSnippets() {
  try {
    const response = await api.get('/api/snippets');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || 'Erreur lors de la récupération des snippets'
      );
    }
    throw error;
  }
}

