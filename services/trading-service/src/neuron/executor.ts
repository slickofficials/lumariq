import { recordUsage } from './usage';

export async function executeFunction(functionId: string) {
  recordUsage(functionId);
  return { functionId, status: 'EXECUTED' };
}
