# Product Requirements Document (PRD)
## Green Silicon Valley Platform - Database Consistency & Team Tracking Fixes

**Version:** 1.0  
**Date:** December 2024  
**Status:** Draft  
**Owner:** Green Silicon Valley Development Team  
**Priority:** CRITICAL - Blocks core functionality

---

## Executive Summary

This PRD addresses critical database inconsistencies and architectural flaws discovered during the implementation of team-based volunteer tracking. The platform currently has mixed models (individual vs team tracking), type mismatches, and incorrect foreign key relationships that prevent proper functionality.

---

## 1. Problem Statement

### Critical Issues Identified

1. **Type Mismatch:** `volunteer_hours.presentation_id` is `uuid` but `presentations.id` is `bigint`
2. **Wrong Reference:** `volunteer_hours.volunteer_id` references `users(id)` instead of `volunteers(id)`
3. **Mixed Tracking:** Code queries volunteers by `user_id` directly, but volunteers are teams
4. **Inconsistent Types:** Migration 0027 uses `bigint` for `team_members.volunteer_team_id` (correct), but code still uses `user_id`

---

## 2. Proposed Solution

### Data Model
```
users (uuid) 
  ↓ (via team_members)
volunteers (bigint) ← TEAM
  ↓ (via volunteer_id)
volunteer_hours, volunteer_activities, etc.
```

**Key Principle:** All volunteer data references the TEAM (`volunteers.id`), not individual users.

---

## 3. Implementation Plan

### Phase 1: Database Schema Fixes
- Fix `volunteer_hours.volunteer_id` type and reference
- Fix `volunteer_hours.presentation_id` type
- Migrate existing data

### Phase 2: Code Updates
- Create helper functions for team lookups
- Update volunteer dashboard
- Update API routes
- Update analytics queries

---

**See full implementation in migration 0029 and code updates.**

