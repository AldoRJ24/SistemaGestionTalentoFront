const routes = [
  // Rutas públicas (auth)
  {
    path: '/',
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      { path: '', name: 'login', component: () => import('pages/LoginPage.vue') },
      { path: 'register', name: 'register', component: () => import('pages/RegisterPage.vue') },
    ],
  },

  // Rutas protegidas (app)
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard/lider',
        name: 'dashboard-lider',
        component: () => import('pages/LeaderDashboardPage.vue'),
      },
      {
        path: 'dashboard/colaborador',
        name: 'dashboard-colaborador',
        component: () => import('pages/CollaboratorDashboardPage.vue'),
      },
      {
        path: 'perfil',
        name: 'perfil',
        component: () => import('pages/ProfilePage.vue'),
      },
      {
        path: 'perfil/:id',
        name: 'perfil-detalle',
        component: () => import('pages/ProfilePage.vue'),
      },
      {
        path: 'admin/skills',
        name: 'admin-skills',
        component: () => import('pages/AdminSkillsPage.vue'),
        meta: { requiresAuth: true, roles: ['AdminRRHH'] },
      },
      {
        path: 'admin/dashboard',
        name: 'admin-dashboard',
        component: () => import('pages/AdminDashboardPage.vue'),
        meta: { requiresAuth: true, roles: ['AdminRRHH'] },
      },

      // { path: 'competencias', component: () => import('pages/SkillsPage.vue') },
      // { path: 'vacantes', component: () => import('pages/VacanciesPage.vue') },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
