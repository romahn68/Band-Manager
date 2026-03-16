export const DEV_EMAILS = ['josimaromahn@gmail.com'];

export const ENTITY_TYPES = {
    'songs': 'song',
    'gear': 'gear',
    'musicians': 'member',
    'instruments': 'instrument',
    'rehearsals': 'rehearsal',
    'gigs': 'gig',
    'finances': 'finance'
};

export const ROLES = {
    ADMIN: 'Administrador',
    EDITOR: 'Editor',
    VISOR: 'Visor'
};

export const FINANCE_TYPES = {
    INCOME: 'ingreso',
    EXPENSE: 'egreso'
};


export const normalizeRole = (role) => {
    const rolesMap = {
        'Admin': ROLES.ADMIN,
        'Manager': ROLES.EDITOR,
        'Miembro': ROLES.VISOR,
        'Administrador': ROLES.ADMIN,
        'Editor': ROLES.EDITOR,
        'Visor': ROLES.VISOR
    };
    return rolesMap[role] || ROLES.VISOR;
};
