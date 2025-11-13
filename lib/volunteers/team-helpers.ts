/**
 * Team Helper Functions
 * 
 * Provides utilities for working with volunteer teams and team members.
 * All volunteer data should reference teams (volunteers.id), not individual users.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { VolunteerRow, TeamMemberRow } from "@/types/db";

/**
 * Get user's team ID via team_members table
 * @param userId - The user's UUID
 * @param supabase - Supabase client instance
 * @returns Team ID (bigint) or null if user is not in a team
 */
export async function getUserTeamId(
  userId: string,
  supabase: SupabaseClient
): Promise<number | null> {
  const { data, error } = await supabase
    .from("team_members")
    .select("volunteer_team_id")
    .eq("user_id", userId)
    .single();
  
  if (error || !data) {
    return null;
  }
  
  return data.volunteer_team_id as number | null;
}

/**
 * Get team record by user ID
 * @param userId - The user's UUID
 * @param supabase - Supabase client instance
 * @returns VolunteerRow (team) or null if user is not in a team
 */
export async function getTeamByUserId(
  userId: string,
  supabase: SupabaseClient
): Promise<VolunteerRow | null> {
  const teamId = await getUserTeamId(userId, supabase);
  if (!teamId) return null;
  
  const { data, error } = await supabase
    .from("volunteers")
    .select("*")
    .eq("id", teamId)
    .single();
  
  if (error || !data) {
    return null;
  }
  
  return data as VolunteerRow;
}

/**
 * Get all members of a team
 * @param teamId - The team's ID (volunteers.id)
 * @param supabase - Supabase client instance
 * @returns Array of team members
 */
export async function getTeamMembers(
  teamId: number,
  supabase: SupabaseClient
): Promise<TeamMemberRow[]> {
  const { data, error } = await supabase
    .from("team_members")
    .select("*")
    .eq("volunteer_team_id", teamId);
  
  if (error || !data) {
    return [];
  }
  
  return data as TeamMemberRow[];
}

/**
 * Check if user is part of a team
 * @param userId - The user's UUID
 * @param supabase - Supabase client instance
 * @returns true if user is in a team, false otherwise
 */
export async function isUserInTeam(
  userId: string,
  supabase: SupabaseClient
): Promise<boolean> {
  const teamId = await getUserTeamId(userId, supabase);
  return teamId !== null;
}

/**
 * Get team ID from volunteer ID (for backward compatibility)
 * If the ID is already a team ID (number), return it.
 * If it's a user ID (string), find the team.
 * @param id - Either a team ID (number) or user ID (string)
 * @param supabase - Supabase client instance
 * @returns Team ID or null
 */
export async function getTeamId(
  id: number | string,
  supabase: SupabaseClient
): Promise<number | null> {
  // If it's already a number, assume it's a team ID
  if (typeof id === "number") {
    return id;
  }
  
  // Otherwise, treat as user ID and find team
  return getUserTeamId(id, supabase);
}

