export const environment = {
  production: false,
  keycloakAdminUrl: 'http://localhost:8080',
  keycloakRealm: 'master',
  apiUrlMongo: 'http://localhost:3000/api',
  apiUrlSql: 'http://localhost:4000/api',
  apiRoutes: {
    documents: {
      base: 'documents'
    },
    users: {
      base: 'users'
    }
  }
};
