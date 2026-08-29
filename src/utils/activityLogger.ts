import { addDocumentWithId, generateId } from '@/services/firestoreService';
import { useAuthStore, type Role } from '@/store/useAuthStore';

export type ActivityAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'EXPORT' | 'IMPORT';

interface LogActivityParams {
  action: ActivityAction;
  module: string;
  description: string;
  targetId?: string;
  targetName?: string;
  metadata?: Record<string, unknown>;
  /** Optional: pass user explicitly to avoid circular imports (e.g., from auth store) */
  user?: { id: string; name: string; role: string };
}

export async function logActivity(params: LogActivityParams): Promise<void> {
  const user = params.user ?? useAuthStore.getState().user;
  if (!user) return;

  const id = `AL-${generateId()}`;
  const record = {
    id,
    userId: user.id,
    userName: user.name,
    userRole: user.role as Role,
    action: params.action,
    module: params.module,
    description: params.description,
    targetId: params.targetId,
    targetName: params.targetName,
    metadata: params.metadata,
    deletionRequested: false,
    deletionApproved: false,
    deletionRejected: false,
  };

  addDocumentWithId('activityLogs', id, record).catch(console.error);
}
