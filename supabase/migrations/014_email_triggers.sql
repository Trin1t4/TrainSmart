-- ============================================
-- TRIGGER PER INVIO EMAIL INVITI
-- ============================================
-- Questo trigger chiama la Edge Function quando viene creato un invito

-- 1. Abilita l'estensione http se non già abilitata
CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA extensions;

-- 2. Crea la funzione che chiama la Edge Function
CREATE OR REPLACE FUNCTION notify_team_invite()
RETURNS TRIGGER AS $$
DECLARE
  payload jsonb;
  request_id bigint;
BEGIN
  -- Costruisci il payload
  payload := jsonb_build_object(
    'type', 'INSERT',
    'table', 'team_invites',
    'record', jsonb_build_object(
      'id', NEW.id,
      'team_id', NEW.team_id,
      'email', NEW.email,
      'role', NEW.role,
      'invite_token', NEW.invite_token,
      'invited_by', NEW.invited_by,
      'position', NEW.position,
      'jersey_number', NEW.jersey_number
    )
  );

  -- Chiama la Edge Function (async via pg_net)
  -- Nota: pg_net deve essere abilitato nel progetto Supabase
  SELECT INTO request_id net.http_post(
    url := 'https://mhcdxqhhlrujbjxtgnmz.supabase.co/functions/v1/send-team-invite',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := payload
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the insert
    RAISE WARNING 'Failed to send invite email: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Crea il trigger
DROP TRIGGER IF EXISTS on_team_invite_created ON team_invites;

CREATE TRIGGER on_team_invite_created
  AFTER INSERT ON team_invites
  FOR EACH ROW
  EXECUTE FUNCTION notify_team_invite();

-- 4. Verifica
SELECT 'Trigger creato!' as status;
