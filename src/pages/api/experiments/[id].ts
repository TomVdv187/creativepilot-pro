import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse, Experiment } from '@/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Experiment>>
) {
  const { method, query } = req;
  const { id } = query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Invalid experiment ID',
      data: {} as Experiment
    });
  }

  try {
    switch (method) {
      case 'GET':
        return handleGet(id, res);
      case 'PUT':
        return handlePut(id, req, res);
      case 'DELETE':
        return handleDelete(id, res);
      default:
        return res.status(405).json({
          success: false,
          message: 'Method not allowed',
          data: {} as Experiment
        });
    }
  } catch (error) {
    console.error('Experiment API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: {} as Experiment
    });
  }
}

async function handleGet(
  id: string,
  res: NextApiResponse<ApiResponse<Experiment>>
) {
  // In production, this would query the database
  console.log(`Getting experiment ${id}`);

  const mockExperiment: Experiment = {
    id,
    projectId: 'proj_1',
    design: {
      type: 'creative_ab',
      minSampleSize: 1000,
      power: 0.8,
      significanceLevel: 0.05,
      duration: 7
    },
    variants: [],
    budgets: [],
    guardrails: [],
    outcomes: [],
    status: 'draft',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  return res.status(200).json({
    success: true,
    data: mockExperiment,
    message: 'Experiment retrieved successfully'
  });
}

async function handlePut(
  id: string,
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Experiment>>
) {
  const updates = req.body;

  // In production, this would:
  // 1. Validate the updates
  // 2. Check if experiment can be modified (not running)
  // 3. Update the experiment in the database
  // 4. Return the updated experiment

  console.log(`Updating experiment ${id}`, updates);

  const updatedExperiment: Experiment = {
    id,
    projectId: updates.projectId || 'proj_1',
    design: updates.design || {
      type: 'creative_ab',
      minSampleSize: 1000,
      power: 0.8,
      significanceLevel: 0.05,
      duration: 7
    },
    variants: updates.variants || [],
    budgets: updates.budgets || [],
    guardrails: updates.guardrails || [],
    outcomes: updates.outcomes || [],
    status: updates.status || 'draft',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
  };

  return res.status(200).json({
    success: true,
    data: updatedExperiment,
    message: 'Experiment updated successfully'
  });
}

async function handleDelete(
  id: string,
  res: NextApiResponse<ApiResponse<Experiment>>
) {
  // In production, this would:
  // 1. Check if experiment can be deleted (not running)
  // 2. Archive or delete the experiment
  // 3. Update related records

  console.log(`Deleting experiment ${id}`);

  return res.status(200).json({
    success: true,
    data: {} as Experiment,
    message: 'Experiment deleted successfully'
  });
}