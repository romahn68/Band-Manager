import { useApp } from './useApp';

export const usePermissions = () => {
    const { userRole } = useApp();

    const ROLES = {
        ADMIN: 'Admin',
        MANAGER: 'Manager',
        MUSICIAN: 'Miembro', // Or 'Músico'
        // Legacy support
        MEMBER: 'Miembro'
    };

    // Normalize role to handle potential case sensitivity or mapping
    const currentRole = userRole || 'Miembro';

    const isAdmin = currentRole === ROLES.ADMIN;
    const isManager = currentRole === ROLES.MANAGER || isAdmin; // Manager capabilities include Admin (hierarchical)
    const isMusician = true; // Everyone is at least a musician

    return {
        // Roles
        role: currentRole,
        isAdmin,
        isManager,
        isMusician,

        // Specific Permissions
        canEditBand: isAdmin,
        canManageMembers: isManager,
        canViewFinances: isManager,
        canEditRepertoire: isManager,
        canEditGear: isManager,
        canDeleteEverything: isAdmin,

        // Helper to check arbitrary roles
        hasRole: (requiredRole) => {
            if (requiredRole === ROLES.ADMIN) return isAdmin;
            if (requiredRole === ROLES.MANAGER) return isManager;
            return true;
        }
    };
};
