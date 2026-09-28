CREATE OR REPLACE FUNCTION "note_attachment_reap_on_delete"() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
	INSERT INTO "note_attachment_reap" ("storage_key", "reap_after")
	VALUES (OLD."storage_key", now())
	ON CONFLICT ("storage_key") DO UPDATE SET "reap_after" = EXCLUDED."reap_after";
	RETURN OLD;
END;
$$;
--> statement-breakpoint
CREATE TRIGGER "note_attachment_reap_on_delete"
AFTER DELETE ON "note_attachment"
FOR EACH ROW EXECUTE FUNCTION "note_attachment_reap_on_delete"();
