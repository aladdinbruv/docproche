-- Create messages table for doctor-patient communication
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ,
  contains_phi BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT messages_content_not_empty CHECK (length(content) > 0)
);

-- Add indexes to optimize common queries
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON public.messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_appointment_id ON public.messages(appointment_id);
CREATE INDEX IF NOT EXISTS idx_messages_read ON public.messages(read) WHERE read = false;
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);

-- Index for conversation queries (both directions)
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_reverse ON public.messages(receiver_id, sender_id);

-- Add RLS policies for messages table
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see messages they sent or received
CREATE POLICY "Users can view their own messages" ON public.messages 
  FOR SELECT 
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Policy: Users can only insert messages they are sending
CREATE POLICY "Users can insert their own messages" ON public.messages 
  FOR INSERT 
  WITH CHECK (auth.uid() = sender_id);

-- Policy: Users can only update messages they've received (mainly for read status)
CREATE POLICY "Users can update messages they've received" ON public.messages 
  FOR UPDATE 
  USING (auth.uid() = receiver_id);

-- Policy: Users can only delete messages they've sent
CREATE POLICY "Users can delete messages they've sent" ON public.messages 
  FOR DELETE 
  USING (auth.uid() = sender_id);

-- Trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON public.messages
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp(); 