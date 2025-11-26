import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

// Google Calendar OAuth configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CALENDAR_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CALENDAR_CLIENT_SECRET;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_BASE_URL}/api/calendar/export/google/callback`;

interface GoogleTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

interface GoogleCalendarEvent {
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  location?: string;
  colorId?: string;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");
  const calendarId = searchParams.get("calendarId");

  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  if (action === "authorize") {
    // Redirect to Google OAuth
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${GOOGLE_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
      `scope=${encodeURIComponent('https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events')}&` +
      `response_type=code&` +
      `access_type=offline&` +
      `prompt=consent`;

    return NextResponse.redirect(authUrl);
  }

  if (action === "sync" && calendarId) {
    try {
      // Get user's Google Calendar subscription
      const { data: subscription } = await supabase
        .from("calendar_subscriptions")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("calendar_type", "google")
        .eq("is_active", true)
        .single();

      if (!subscription) {
        return NextResponse.json({ ok: false, error: "No Google Calendar subscription found" }, { status: 404 });
      }

      // Check if token is expired and refresh if needed
      let accessToken = subscription.sync_token;

      if (subscription.last_synced_at) {
        const lastSynced = new Date(subscription.last_synced_at);
        const now = new Date();
        const timeDiff = now.getTime() - lastSynced.getTime();
        const expiresIn = 3600 * 1000; // 1 hour

        if (timeDiff > expiresIn && subscription.external_calendar_id) {
          // Refresh token
          const refreshResponse = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              client_id: GOOGLE_CLIENT_ID!,
              client_secret: GOOGLE_CLIENT_SECRET!,
              refresh_token: subscription.external_calendar_id,
              grant_type: "refresh_token",
            }),
          });

          if (refreshResponse.ok) {
            const tokenData: GoogleTokenResponse = await refreshResponse.json();
            accessToken = tokenData.access_token;

            // Update subscription with new token
            await supabase
              .from("calendar_subscriptions")
              .update({
                sync_token: tokenData.access_token,
                last_synced_at: new Date().toISOString()
              })
              .eq("id", subscription.id);
          }
        }
      }

      if (!accessToken) {
        return NextResponse.json({ ok: false, error: "No valid access token" }, { status: 401 });
      }

      // Sync events based on direction
      if (subscription.sync_direction === "export" || subscription.sync_direction === "both") {
        // Export local events to Google Calendar
        const { data: localEvents } = await supabase
          .from("events")
          .select("*")
          .eq("export_enabled", true)
          .gte("start_date", new Date().toISOString());

        if (localEvents) {
          for (const event of localEvents) {
            const googleEvent: GoogleCalendarEvent = {
              summary: event.title,
              description: event.description,
              start: {
                dateTime: event.all_day ? undefined : event.start_date,
                date: event.all_day ? event.start_date.split('T')[0] : undefined,
                timeZone: event.all_day ? undefined : "America/Los_Angeles"
              },
              end: {
                dateTime: event.end_date && !event.all_day ? event.end_date : undefined,
                date: event.end_date && event.all_day ? event.end_date.split('T')[0] : undefined,
                timeZone: event.end_date && !event.all_day ? "America/Los_Angeles" : undefined
              },
              location: event.location,
              colorId: getGoogleColorId(event.color)
            };

            // Create event in Google Calendar
            const createResponse = await fetch(
              `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
              {
                method: "POST",
                headers: {
                  "Authorization": `Bearer ${accessToken}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(googleEvent),
              }
            );

            if (createResponse.ok) {
              const createdEvent = await createResponse.json();
              // Store Google event ID for future sync
              await supabase
                .from("events")
                .update({
                  metadata: {
                    ...event.metadata,
                    google_event_id: createdEvent.id,
                    last_synced_to_google: new Date().toISOString()
                  }
                })
                .eq("id", event.id);
            }
          }
        }
      }

      // Update last synced time
      await supabase
        .from("calendar_subscriptions")
        .update({ last_synced_at: new Date().toISOString() })
        .eq("id", subscription.id);

      return NextResponse.json({ ok: true, message: "Sync completed successfully" });

    } catch (error: any) {
      console.error("Google Calendar sync error:", error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: false, error: "Invalid action" }, { status: 400 });
}

function getGoogleColorId(color?: string): string | undefined {
  // Map our colors to Google Calendar color IDs
  const colorMap: Record<string, string> = {
    "#3B82F6": "1", // Blue
    "#10B981": "2", // Green
    "#EF4444": "4", // Red
    "#F59E0B": "5", // Yellow
    "#8B5CF6": "3", // Purple
    "#EC4899": "6", // Pink
  };

  return color ? colorMap[color] : undefined;
}

// Callback handler for OAuth
export async function POST(req: Request) {
  try {
    const { code, state } = await req.json();

    if (!code) {
      return NextResponse.json({ ok: false, error: "Authorization code required" }, { status: 400 });
    }

    // Exchange code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID!,
        client_secret: GOOGLE_CLIENT_SECRET!,
        code: code,
        grant_type: "authorization_code",
        redirect_uri: REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      return NextResponse.json({ ok: false, error: "Failed to exchange code for tokens" }, { status: 500 });
    }

    const tokenData: GoogleTokenResponse = await tokenResponse.json();

    // Get user's calendar list
    const calendarResponse = await fetch(
      "https://www.googleapis.com/calendar/v3/users/me/calendarList",
      {
        headers: {
          "Authorization": `Bearer ${tokenData.access_token}`,
        },
      }
    );

    if (!calendarResponse.ok) {
      return NextResponse.json({ ok: false, error: "Failed to fetch calendars" }, { status: 500 });
    }

    const calendarData = await calendarResponse.json();

    return NextResponse.json({
      ok: true,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      calendars: calendarData.items || []
    });

  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
