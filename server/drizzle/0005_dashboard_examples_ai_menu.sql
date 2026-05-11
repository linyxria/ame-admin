DELETE FROM "role_menu"
WHERE "menuId" IN (
  'menu_dashboard_ai',
  'menu_maps',
  'menu_maps_2d',
  'menu_maps_3d',
  'menu_charts',
  'menu_charts_2d',
  'menu_charts_3d',
  'menu_demos',
  'menu_demo_charts',
  'menu_demo_table',
  'menu_demo_form'
);--> statement-breakpoint

DELETE FROM "menu"
WHERE "id" IN (
  'menu_dashboard_ai',
  'menu_maps',
  'menu_maps_2d',
  'menu_maps_3d',
  'menu_charts',
  'menu_charts_2d',
  'menu_charts_3d',
  'menu_demos',
  'menu_demo_charts',
  'menu_demo_table',
  'menu_demo_form'
);--> statement-breakpoint

INSERT INTO "menu" ("id", "parentId", "title", "titleKey", "path", "icon", "sort", "visible", "builtIn")
VALUES
  ('menu_dashboard', NULL, 'Dashboard', 'dashboard', '/dashboard', 'dashboard', 0, true, true),
  ('menu_dashboard_workbench', 'menu_dashboard', '工作台', 'workbench', '/dashboard/workbench', 'workbench', 10, true, true),
  ('menu_dashboard_monitor', 'menu_dashboard', '监控台', 'monitor', '/dashboard/monitor', 'monitor', 20, true, true),
  ('menu_dashboard_analytics', 'menu_dashboard', '分析台', 'analytics', '/dashboard/analytics', 'analytics', 30, true, true),
  ('menu_ai', NULL, 'AI 问答', 'aiAssistant', '/ai', 'ai', 18, true, true)
ON CONFLICT ("id") DO UPDATE SET
  "parentId" = excluded."parentId",
  "title" = excluded."title",
  "titleKey" = excluded."titleKey",
  "path" = excluded."path",
  "icon" = excluded."icon",
  "sort" = excluded."sort",
  "visible" = excluded."visible",
  "builtIn" = excluded."builtIn",
  "updatedAt" = now();--> statement-breakpoint

INSERT INTO "role_menu" ("roleId", "menuId", "actions")
VALUES
  ('role_admin', 'menu_dashboard', 'view,create,update,delete'),
  ('role_admin', 'menu_dashboard_workbench', 'view,create,update,delete'),
  ('role_admin', 'menu_dashboard_monitor', 'view,create,update,delete'),
  ('role_admin', 'menu_dashboard_analytics', 'view,create,update,delete'),
  ('role_admin', 'menu_ai', 'view,create,update,delete')
ON CONFLICT ("roleId", "menuId") DO UPDATE SET "actions" = excluded."actions";
