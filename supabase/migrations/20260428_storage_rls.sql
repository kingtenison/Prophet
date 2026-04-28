-- Storage RLS Policies for datasets bucket

-- Enable RLS for storage.objects if not already enabled (usually enabled by default)
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow users to upload datasets to their own folder
CREATE POLICY "Users can upload their own datasets"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'datasets' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to read their own datasets
CREATE POLICY "Users can read their own datasets"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'datasets' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to update their own datasets
CREATE POLICY "Users can update their own datasets"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'datasets' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to delete their own datasets
CREATE POLICY "Users can delete their own datasets"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'datasets' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
