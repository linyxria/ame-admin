ALTER TABLE "menu" ADD COLUMN "titleKey" text;--> statement-breakpoint
UPDATE "menu" SET "titleKey" = CASE "id"
  WHEN 'menu_system' THEN 'systemSettings'
  WHEN 'menu_dashboard' THEN 'dashboard'
  WHEN 'menu_system_users' THEN 'userManagement'
  WHEN 'menu_system_roles' THEN 'roleManagement'
  WHEN 'menu_system_menus' THEN 'menuManagement'
  WHEN 'menu_system_audit_logs' THEN 'auditLogs'
  WHEN 'menu_system_settings' THEN 'systemSettings'
  WHEN 'menu_notifications' THEN 'notificationCenter'
  WHEN 'menu_demos' THEN 'demos'
  WHEN 'menu_demo_charts' THEN 'chartDemo'
  WHEN 'menu_demo_table' THEN 'tableDemo'
  WHEN 'menu_demo_form' THEN 'formDemo'
END WHERE "id" IN (
  'menu_system',
  'menu_dashboard',
  'menu_system_users',
  'menu_system_roles',
  'menu_system_menus',
  'menu_system_audit_logs',
  'menu_system_settings',
  'menu_notifications',
  'menu_demos',
  'menu_demo_charts',
  'menu_demo_table',
  'menu_demo_form'
);--> statement-breakpoint
UPDATE "system_setting" SET "value" = 'en-US', "updatedAt" = now() WHERE "key" = 'defaultLanguage' AND "value" = 'zh-CN';
