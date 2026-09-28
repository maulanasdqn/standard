UPDATE "custom_role"
SET "permissions" = (
	SELECT COALESCE(jsonb_agg(DISTINCT "expanded"."permission"), '[]'::jsonb)
	FROM jsonb_array_elements_text("custom_role"."permissions") AS "granted"("permission")
	CROSS JOIN LATERAL unnest(
		CASE "granted"."permission"
			WHEN 'note:write' THEN ARRAY['note:create', 'note:update']
			WHEN 'user:manage' THEN ARRAY[
				'user:create', 'user:read', 'user:update', 'user:delete',
				'role:create', 'role:read', 'role:update', 'role:delete'
			]
			ELSE ARRAY["granted"."permission"]
		END
	) AS "expanded"("permission")
)
WHERE "permissions" ?| ARRAY['note:write', 'user:manage'];
