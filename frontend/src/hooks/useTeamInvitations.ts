import { useEffect, useState, useCallback, useRef } from 'react';
import { getSocket } from '../services/socketService';
import { TeamInvitation, TeamInvitationUpdated } from '../vite-env';

/**
 * Hook for managing team invitations via WebSocket
 * @param token - JWT authentication token
 * @returns Object containing team invitation state and methods
 */
export const useTeamInvitations = (token?: string) => {
  const [pendingInvitations, setPendingInvitations] = useState<TeamInvitation[]>([]);
  const [receivedInvitations, setReceivedInvitations] = useState<TeamInvitation[]>([]);
  const socketRef = useRef<ReturnType<typeof getSocket> | null>(null);

  // Initialize socket connection
  useEffect(() => {
    if (!token) return;

    socketRef.current = getSocket(token);

    // Listen for received invitations
    const handleInvitationReceived = (data: { invitation: TeamInvitation }) => {
      setReceivedInvitations((prev) => [...prev, data.invitation]);
    };

    // Listen for invitation updates
    const handleInvitationUpdated = (data: TeamInvitationUpdated) => {
      setPendingInvitations((prev) =>
        prev.filter((inv) => inv.id !== data.invitationId)
      );
      setReceivedInvitations((prev) =>
        prev.map((inv) =>
          inv.id === data.invitationId ? { ...inv, status: data.status } : inv
        )
      );
    };

    socketRef.current.on('team:invitationReceived', handleInvitationReceived);
    socketRef.current.on('team:invitationUpdated', handleInvitationUpdated);

    return () => {
      socketRef.current?.off('team:invitationReceived', handleInvitationReceived);
      socketRef.current?.off('team:invitationUpdated', handleInvitationUpdated);
    };
  }, [token]);

  const sendInvitation = useCallback((
    userId: number,
    teamId: number,
    role: 'member' | 'captain' | 'vice_captain',
    message?: string
  ) => {
    if (!socketRef.current) return;

    socketRef.current.emit('team:sendInvitation', {
      userId,
      teamId,
      role,
      message,
    });
  }, []);

  const respondToInvitation = useCallback((
    invitationId: number,
    response: 'accept' | 'decline',
    reason?: string
  ) => {
    if (!socketRef.current) return;

    socketRef.current.emit('team:respondInvitation', {
      invitationId,
      response,
      reason,
    });
  }, []);

  const clearReceivedInvitations = useCallback(() => {
    setReceivedInvitations([]);
  }, []);

  return {
    sentInvitations: pendingInvitations,
    receivedInvitations,
    sendInvitation,
    respondToInvitation,
    clearReceivedInvitations,
  };
};

export default useTeamInvitations;
