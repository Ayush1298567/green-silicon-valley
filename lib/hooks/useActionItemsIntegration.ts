import { useEffect } from 'react';
import { actionItemsService } from '@/lib/actionItemsService';

/**
 * Hook to integrate action items with volunteer applications
 */
export function useVolunteerApplicationIntegration(volunteerId?: string, teamName?: string) {
  useEffect(() => {
    if (volunteerId && teamName) {
      // Create action item when volunteer application is submitted
      actionItemsService.onVolunteerApplicationSubmitted(volunteerId, teamName);
    }
  }, [volunteerId, teamName]);
}

/**
 * Hook to integrate action items with teacher requests
 */
export function useTeacherRequestIntegration(schoolId?: string, schoolName?: string) {
  useEffect(() => {
    if (schoolId && schoolName) {
      // Create action item when teacher request is submitted
      actionItemsService.onTeacherRequestSubmitted(schoolId, schoolName);
    }
  }, [schoolId, schoolName]);
}

/**
 * Hook to integrate action items with presentation completions
 */
export function usePresentationCompletionIntegration(
  presentationId?: string,
  schoolId?: string,
  schoolName?: string,
  isCompleted?: boolean
) {
  useEffect(() => {
    if (presentationId && schoolId && schoolName && isCompleted) {
      // Create followup action item when presentation is completed
      actionItemsService.onPresentationCompleted(presentationId, schoolId, schoolName);
    }
  }, [presentationId, schoolId, schoolName, isCompleted]);
}

/**
 * Hook to integrate action items with blog post submissions
 */
export function useBlogPostIntegration(postId?: string, title?: string, authorName?: string, status?: string) {
  useEffect(() => {
    if (postId && title && authorName && status === 'submitted_for_review') {
      // Create action item when blog post is submitted for review
      actionItemsService.onBlogPostSubmitted(postId, title, authorName);
    }
  }, [postId, title, authorName, status]);
}

/**
 * Hook to handle application status changes
 */
export function useApplicationStatusIntegration(
  entityType: string,
  entityId: string,
  status: string,
  reviewerId?: string
) {
  useEffect(() => {
    if (['approved', 'rejected'].includes(status)) {
      // Update related action item when application status changes
      actionItemsService.onApplicationStatusChanged(entityType, entityId, status, reviewerId);
    }
  }, [entityType, entityId, status, reviewerId]);
}

/**
 * Hook to create deadline reminders (run periodically)
 */
export function useDeadlineReminders() {
  useEffect(() => {
    // Create deadline reminders every hour
    const interval = setInterval(() => {
      actionItemsService.createDeadlineReminders();
    }, 60 * 60 * 1000); // 1 hour

    // Run immediately on mount
    actionItemsService.createDeadlineReminders();

    return () => clearInterval(interval);
  }, []);
}
