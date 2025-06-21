const modulesRoutes = import.meta.glob("../../module/*/ui/src/Router.tsx", { eager: true });
console.log("Modules Routes:", modulesRoutes);
let publicRoutes = [];
let protectedRoutes = [];

for (const mod of Object.values(modulesRoutes)) {
  publicRoutes = publicRoutes.concat(mod.publicRoutes ?? []);
  protectedRoutes = protectedRoutes.concat(mod.protectedRoutes ?? []);
}
console.log("Public Routes:", publicRoutes);
console.log("Protected Routes:", protectedRoutes);
export { publicRoutes, protectedRoutes };
