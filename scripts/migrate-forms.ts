#!/usr/bin/env tsx

/**
 * Form Migration Script
 *
 * This script migrates existing hard-coded forms to the new dynamic form builder system.
 * It analyzes form components and creates corresponding form schemas in the database.
 */

import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Existing forms to migrate
interface LegacyForm {
  component: string;
  title: string;
  description: string;
  fields: Array<{
    name: string;
    label: string;
    type: string;
    required: boolean;
    options?: string[];
    placeholder?: string;
  }>;
  submitAction: string;
  targetTable: string;
}

// Volunteer signup form
const VOLUNTEER_FORM: LegacyForm = {
  component: 'components/forms/VolunteerSignupForm.tsx',
  title: 'Volunteer Application',
  description: 'Join our team of environmental STEM educators',
  fields: [
    {
      name: 'name',
      label: 'Full Name',
      type: 'text',
      required: true,
      placeholder: 'Enter your full name'
    },
    {
      name: 'email',
      label: 'Email Address',
      type: 'email',
      required: true,
      placeholder: 'your.email@example.com'
    },
    {
      name: 'phone',
      label: 'Phone Number',
      type: 'text',
      required: false,
      placeholder: '(555) 123-4567'
    },
    {
      name: 'school',
      label: 'School/Organization',
      type: 'text',
      required: false,
      placeholder: 'Your school or organization'
    },
    {
      name: 'grade',
      label: 'Grade Level',
      type: 'select',
      required: false,
      options: ['9th Grade', '10th Grade', '11th Grade', '12th Grade', 'College', 'Other']
    },
    {
      name: 'interests',
      label: 'Areas of Interest',
      type: 'multiselect',
      required: false,
      options: [
        'Environmental Science',
        'STEM Education',
        'Community Outreach',
        'Event Planning',
        'Social Media',
        'Fundraising',
        'Curriculum Development',
        'Student Mentoring'
      ]
    },
    {
      name: 'availability',
      label: 'Availability',
      type: 'multiselect',
      required: false,
      options: [
        'Weekdays after school (2-5 PM)',
        'Weekends',
        'School holidays',
        'Summer break',
        'Virtual meetings'
      ]
    },
    {
      name: 'experience',
      label: 'Previous Volunteering Experience',
      type: 'textarea',
      required: false,
      placeholder: 'Tell us about any previous volunteering or teaching experience...'
    },
    {
      name: 'referral',
      label: 'How did you hear about us?',
      type: 'select',
      required: false,
      options: [
        'School',
        'Social media',
        'Friend/family',
        'Website',
        'Event',
        'Teacher',
        'Other'
      ]
    },
    {
      name: 'commitment',
      label: 'Commitment Level',
      type: 'select',
      required: false,
      options: [
        'High - Available most weeks',
        'Medium - Available 1-2 times per month',
        'Low - Available occasionally',
        'Flexible - Depends on scheduling'
      ]
    }
  ],
  submitAction: '/api/volunteers',
  targetTable: 'volunteers'
};

// Teacher request form
const TEACHER_FORM: LegacyForm = {
  component: 'components/forms/TeacherRequestForm.tsx',
  title: 'Presentation Request',
  description: 'Request a free environmental STEM presentation for your classroom',
  fields: [
    {
      name: 'school_name',
      label: 'School Name',
      type: 'text',
      required: true,
      placeholder: 'Your school name'
    },
    {
      name: 'contact_name',
      label: 'Contact Person',
      type: 'text',
      required: true,
      placeholder: 'Your full name'
    },
    {
      name: 'email',
      label: 'Email Address',
      type: 'email',
      required: true,
      placeholder: 'school.email@example.com'
    },
    {
      name: 'phone',
      label: 'Phone Number',
      type: 'text',
      required: false,
      placeholder: '(555) 123-4567'
    },
    {
      name: 'grade_levels',
      label: 'Grade Levels',
      type: 'multiselect',
      required: true,
      options: [
        'Kindergarten',
        '1st Grade',
        '2nd Grade',
        '3rd Grade',
        '4th Grade',
        '5th Grade',
        '6th Grade',
        '7th Grade',
        '8th Grade',
        'Other'
      ]
    },
    {
      name: 'student_count',
      label: 'Number of Students',
      type: 'number',
      required: false,
      placeholder: 'Approximate number of students'
    },
    {
      name: 'presentation_topics',
      label: 'Preferred Topics',
      type: 'multiselect',
      required: false,
      options: [
        'Climate Change & Global Warming',
        'Renewable Energy (Solar, Wind, Hydro)',
        'Ocean Pollution & Marine Life',
        'Recycling & Waste Management',
        'Biodiversity & Ecosystems',
        'Sustainable Transportation',
        'Environmental Justice',
        'Local Environmental Issues',
        'STEM Careers in Environmental Science'
      ]
    },
    {
      name: 'preferred_date',
      label: 'Preferred Date',
      type: 'date',
      required: false
    },
    {
      name: 'alternative_dates',
      label: 'Alternative Dates',
      type: 'textarea',
      required: false,
      placeholder: 'List 2-3 alternative dates if your preferred date is not available...'
    },
    {
      name: 'special_requirements',
      label: 'Special Requirements or Notes',
      type: 'textarea',
      required: false,
      placeholder: 'Any special accommodations, classroom setup notes, or additional information...'
    }
  ],
  submitAction: '/api/schools',
  targetTable: 'schools'
};

/**
 * Convert legacy form to form builder schema
 */
function convertLegacyFormToSchema(legacyForm: LegacyForm) {
  const columns = legacyForm.fields.map((field, index) => ({
    id: `field_${field.name}`,
    title: field.label,
    field_type: mapFieldType(field.type),
    required: field.required,
    column_index: index,
    validation_rules: getValidationRules(field),
    conditional_logic: null,
    field_options: field.options ? { options: field.options } : null,
    placeholder: field.placeholder
  }));

  return {
    title: legacyForm.title,
    description: legacyForm.description,
    columns,
    created_by: 'migration-script',
    status: 'published',
    visibility: { roles: ['public'] },
    edit_permissions: { roles: ['founder', 'intern'] },
    workflow_config: {},
    ai_generated: false,
    target_table: legacyForm.targetTable,
    submit_action: legacyForm.submitAction
  };
}

/**
 * Map legacy field types to form builder types
 */
function mapFieldType(legacyType: string): string {
  const typeMapping: Record<string, string> = {
    'text': 'text',
    'email': 'email',
    'textarea': 'textarea',
    'select': 'select',
    'multiselect': 'multiselect',
    'number': 'number',
    'date': 'date',
    'checkbox': 'checkbox',
    'radio': 'select' // Map radio to select for simplicity
  };

  return typeMapping[legacyType] || 'text';
}

/**
 * Get validation rules for a field
 */
function getValidationRules(field: LegacyForm['fields'][0]) {
  const rules: any = {};

  if (field.type === 'email') {
    rules.email = true;
  }

  if (field.type === 'number') {
    rules.min = 0;
  }

  return rules;
}

/**
 * Create form in database
 */
async function createFormInDatabase(formSchema: any): Promise<string> {
  console.log(`Creating form: ${formSchema.title}`);

  const { data, error } = await supabase
    .from('forms')
    .insert({
      title: formSchema.title,
      description: formSchema.description,
      created_by: formSchema.created_by,
      status: formSchema.status,
      visibility: formSchema.visibility,
      edit_permissions: formSchema.edit_permissions,
      workflow_config: formSchema.workflow_config,
      ai_generated: formSchema.ai_generated,
      schema: formSchema // Store the full schema
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create form ${formSchema.title}: ${error.message}`);
  }

  // Create form columns
  for (const column of formSchema.columns) {
    const { error: columnError } = await supabase
      .from('form_columns')
      .insert({
        form_id: data.id,
        column_index: column.column_index,
        title: column.title,
        field_type: column.field_type,
        required: column.required,
        validation_rules: column.validation_rules,
        conditional_logic: column.conditional_logic,
        field_options: column.field_options
      });

    if (columnError) {
      throw new Error(`Failed to create column ${column.title}: ${columnError.message}`);
    }
  }

  console.log(`✅ Created form: ${formSchema.title} (ID: ${data.id})`);
  return data.id;
}

/**
 * Update component to use dynamic form renderer
 */
async function updateComponentToUseDynamicRenderer(componentPath: string, formId: string, formTitle: string) {
  const fullPath = path.join(process.cwd(), componentPath);

  if (!fs.existsSync(fullPath)) {
    console.warn(`⚠️  Component not found: ${componentPath}`);
    return;
  }

  console.log(`🔄 Updating component: ${componentPath}`);

  // Read current component
  let content = fs.readFileSync(fullPath, 'utf-8');

  // Replace the component with a dynamic form renderer
  const newComponentContent = `"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DynamicFormRenderer from '@/components/forms/DynamicFormRenderer';
import { toast } from 'sonner';

export default function ${formTitle.replace(/\s+/g, '')}Form() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    setLoading(true);
    try {
      const response = await fetch('${componentPath.includes('Volunteer') ? '/api/volunteers' : '/api/schools'}', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success('${formTitle} submitted successfully!');
        router.push('/thank-you');
      } else {
        throw new Error('Submission failed');
      }
    } catch (error: any) {
      toast.error('Failed to submit ${formTitle.toLowerCase()}');
      console.error('Submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-10">
      <div className="max-w-2xl mx-auto">
        <DynamicFormRenderer
          formId="${formId}"
          onSubmit={handleSubmit}
          loading={loading}
          submitButtonText="Submit ${formTitle}"
        />
      </div>
    </div>
  );
}
`;

  fs.writeFileSync(fullPath, newComponentContent);
  console.log(`✅ Updated component: ${componentPath}`);
}

/**
 * Main migration function
 */
async function main(): Promise<void> {
  try {
    console.log('🚀 Starting form migration...\n');

    const formsToMigrate = [VOLUNTEER_FORM, TEACHER_FORM];

    for (const legacyForm of formsToMigrate) {
      console.log(`\n📝 Migrating form: ${legacyForm.title}`);

      // Convert to form builder schema
      const formSchema = convertLegacyFormToSchema(legacyForm);

      // Create in database
      const formId = await createFormInDatabase(formSchema);

      // Update component (commented out for safety)
      // await updateComponentToUseDynamicRenderer(legacyForm.component, formId, legacyForm.title);

      console.log(`✅ Migration complete for: ${legacyForm.title}\n`);
    }

    console.log('🎉 Form migration completed successfully!');
    console.log('📋 Next steps:');
    console.log('   1. Review migrated forms in admin/forms');
    console.log('   2. Update components to use DynamicFormRenderer');
    console.log('   3. Test form submissions');
    console.log('   4. Remove old form component files');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
main();
