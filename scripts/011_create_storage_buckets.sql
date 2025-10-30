-- Create storage buckets for avatars and task proofs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('task-proofs', 'task-proofs', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars bucket
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policies for task-proofs bucket
CREATE POLICY "Anyone can view task proofs"
ON storage.objects FOR SELECT
USING (bucket_id = 'task-proofs');

CREATE POLICY "Users can upload task proofs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'task-proofs' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can update their own task proofs"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'task-proofs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own task proofs"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'task-proofs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
