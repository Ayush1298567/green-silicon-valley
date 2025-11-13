# Complete SQL Setup - Copy-Paste Ready

This document contains all SQL migrations in order. Copy and paste each section into Supabase SQL Editor and run them sequentially.

## ⚠️ IMPORTANT: Run Migrations in Order

Run these migrations in the exact order listed below. Each migration builds on the previous ones.

---

## Migration 1: Document Workflow (0032_document_workflow.sql)

```sql
-- Copy contents from: supabase/migrations/0032_document_workflow.sql
```

---

## Migration 2: Enhance Website Builder (0033_enhance_website_builder.sql)

```sql
-- Copy contents from: supabase/migrations/0033_enhance_website_builder.sql
```

---

## Migration 3: Complete Setup (0034_complete_setup.sql)

```sql
-- Copy contents from: supabase/migrations/0034_complete_setup.sql
```

---

## Post-Migration Steps (Manual - Cannot be automated via SQL)

### 1. Create Storage Buckets

Go to **Supabase Dashboard > Storage > New Bucket**:

**Bucket 1: `public`**
- Name: `public`
- Public bucket: ✅ Yes
- File size limit: 50MB
- Allowed MIME types: Leave empty (all types allowed)

**Bucket 2: `documents`**
- Name: `documents`
- Public bucket: ❌ No (Private)
- File size limit: 10MB
- Allowed MIME types: `application/pdf,image/jpeg,image/png,image/jpg`

### 2. Set Up Storage Policies for `documents` Bucket

Go to **Supabase Dashboard > Storage > documents > Policies** and create these policies:

**Policy 1: Volunteers can upload documents**
```sql
CREATE POLICY "Volunteers can upload documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documents' AND
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.user_id = auth.uid()
    )
  );
```

**Policy 2: Volunteers can view their own documents**
```sql
CREATE POLICY "Volunteers can view own documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents' AND
    EXISTS (
      SELECT 1 FROM volunteer_documents vd
      JOIN team_members tm ON tm.volunteer_team_id = vd.volunteer_id
      WHERE tm.user_id = auth.uid() AND vd.file_url LIKE '%' || (storage.objects.name) || '%'
    )
  );
```

**Policy 3: Staff can view all documents**
```sql
CREATE POLICY "Staff can view all documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents' AND
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role IN ('founder', 'intern')
    )
  );
```

**Policy 4: Staff can upload signed documents**
```sql
CREATE POLICY "Staff can upload signed documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documents' AND
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role IN ('founder', 'intern')
    )
  );
```

### 3. Verify Setup

Run these queries to verify everything is set up correctly:

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'volunteer_documents',
  'document_templates',
  'user_notification_preferences',
  'notifications',
  'presentation_comments'
)
ORDER BY table_name;

-- Check columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'volunteer_documents'
ORDER BY ordinal_position;

-- Check indexes exist
SELECT indexname FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('volunteer_documents', 'user_notification_preferences')
ORDER BY indexname;
```

### 4. Test Data (Optional)

Insert test document template:

```sql
INSERT INTO document_templates (template_name, template_type, file_url, description, is_active)
VALUES (
  'Volunteer Signature Form',
  'volunteer_signature_form',
  'https://example.com/templates/volunteer-signature.pdf',
  'Form for volunteers to sign after presentations',
  true
)
ON CONFLICT DO NOTHING;
```

---

## Troubleshooting

### Error: "relation does not exist"
- Make sure you've run migrations in order
- Check that previous migrations completed successfully

### Error: "permission denied"
- Ensure you're running as the postgres role
- Check RLS policies are correctly set up

### Storage bucket errors
- Verify buckets are created in Supabase Dashboard
- Check bucket names match exactly: `public` and `documents`
- Ensure policies are created for the `documents` bucket

### Foreign key errors
- Verify referenced tables exist
- Check that foreign key columns have matching data types

---

## Migration Checklist

- [ ] Migration 0032_document_workflow.sql executed successfully
- [ ] Migration 0033_enhance_website_builder.sql executed successfully
- [ ] Migration 0034_complete_setup.sql executed successfully
- [ ] Storage bucket `public` created (PUBLIC)
- [ ] Storage bucket `documents` created (PRIVATE)
- [ ] Storage policies created for `documents` bucket
- [ ] All tables verified to exist
- [ ] All indexes verified to exist
- [ ] Test data inserted (optional)

---

## Next Steps After SQL Setup

1. **Test Document Upload**: Try uploading a document as a volunteer
2. **Test Document Review**: Review and sign documents as a founder
3. **Test Notifications**: Verify notification preferences work
4. **Test Website Builder**: Try editing layouts and uploading images
5. **Test Search**: Verify global search functionality works

---

## Support

If you encounter any issues:
1. Check the error message carefully
2. Verify all previous migrations ran successfully
3. Check that storage buckets exist
4. Verify RLS policies are set up correctly
5. Check Supabase logs for detailed error messages

