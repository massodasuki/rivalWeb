import { useEffect, useState, useCallback } from 'react';
import { getSocket } from '../services/socketService';
import { MatchInvitation, MatchInvitationUpdated } from '../vite-env';

/**
 * Hook for managing match invitations via WebSocket
 * @param token - JWT authentication token
 * @returns Object containing match invitation state and methods
 */
export const useMatchInvitations = (token?: string) => {
  const [pendingInvitations, setPendingInvitations] = useState<MatchInvitation[]>([]);
  const [receivedInvitations, setReceivedInvitations] = useState<MatchInvitation[]>([]);
  const socketRef = useRef<ReturnType<typeof getSocket> | null>(null);

  // Initialize socket connection
  useEffect(() => {
    if (!token) return;

    socketRef.current = getSocket(token);

    // Listen for received invitations
    const handleInvitationReceived = (data: { invitation: MatchInvitation }) => {
      setReceivedInvitations((prev) => [...prev, data.invitation]);
    };

    // Listen for invitation updates
    const handleInvitationUpdated = (data: MatchInvitationUpdated) => {
      setPendingInvitations((prev) =>
        prev.filter((inv) => inv.id !== data.invitationId)
      );
      setReceivedInvitations((prev) =>
        prev.map((inv) =>
          inv.id === data.invitationId ? { ...inv, status: data.status } : inv
        )
      );
    };

    socketRef.current.on('match:invitationReceived', handleInvitationReceived);
    socketRef.current.on('match:invitationUpdated', handleInvitationUpdated);

    return () => {
      socketRef.current?.off('match:invitationReceived', handleInvitationReceived);
      socketRef.current?.off('match:invitationUpdated', handleInvitationUpdated);
    };
  }, [token]);

  const sendInvitation = useCallback((
    opponentId: number,
    sportType: string,
    matchType: 'casual' | 'ranked' | 'tournament',
    scheduledAt?: Date,
    venue?: string,
    notes?: string
  ) => {
    if (!socketRef.current) return;

    socketRef.current.emit('match:sendInvitation', {
      opponentId,
      sportType,
      matchType,
      scheduledAt,
      venue,
      notes,
    });
  }, []);

  const respondToInvitation = useCallback((
    invitationId: number,
    response: 'accept' | 'decline' | 'counter',
    counterDate?: Date,
    reason?: string
  ) => {
    if (!socketRef.current) return;

    socketRef.current.emit('match:respondInvitation', {
      invitationId,
      response,
      counterDate,
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

export default useMatchInvitations;
