import { useApp } from './useApp';

export const usePermissions = () => {
    const { userRole } = useApp();

    const ROLES = {
        ADMIN: 'Administrador',
        EDITOR: 'Editor',
        VISOR: 'Visor'
    };

    // Normalize role and handle potential null/undefined
    const roleString = typeof userRole === 'string' ? userRole : ROLES.VISOR;

    const isAdmin = roleString === ROLES.ADMIN;
    const isEditor = roleString === ROLES.EDITOR;
    const isVisor = roleString === ROLES.VISOR;

    return {
        // Roles
        role: roleString,
        isAdmin,
        isEditor,
        isVisor,

        // Specific Permissions
        canAccessSettings: isAdmin,
        canEditBand: isAdmin,
        canEditBandName: isAdmin,
        canManagePermissions: isAdmin,
        canViewFinances: isAdmin,
        canEditFinances: isAdmin,
        
        canEditRepertoire: isAdmin || isEditor,
        canEditGear: isAdmin || isEditor,
        canEditGigs: isAdmin || isEditor,
        canEditRehearsals: isAdmin || isEditor,
        canManageMembers: isAdmin || isEditor,
        canInvite: isAdmin || isEditor,
        
        canReadEverything: true,
        isReadOnly: isVisor
    };
};
