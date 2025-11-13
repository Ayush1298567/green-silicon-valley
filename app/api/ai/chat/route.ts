import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { getUserRoleServer } from "@/lib/auth/guards";
import { aiCommandParser, aiCommandExecutor, type AICommand, type AIResponse } from "@/lib/aiAdministrativeAssistant";

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const role = await getUserRoleServer(supabase as any);

  if (role !== "founder" && role !== "intern") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { message, sessionId, confirmed = false, commandToConfirm } = body;

    if (!message && !commandToConfirm) {
      return NextResponse.json({ ok: false, error: "Message or command confirmation required" }, { status: 400 });
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const currentSessionId = sessionId || `session_${Date.now()}_${userId}`;

    let command: AICommand;
    let response: AIResponse;

    if (commandToConfirm && confirmed) {
      // Execute previously confirmed command
      command = commandToConfirm;
      response = await aiCommandExecutor.executeCommand(command, userId, true);
    } else {
      // Parse new command from message
      command = await aiCommandParser.parseCommand(message, userId);
      response = await aiCommandExecutor.executeCommand(command, userId, false);
    }

    // Log the interaction
    await supabase.from("ai_chat_history").insert({
      user_id: userId,
      session_id: currentSessionId,
      message_type: commandToConfirm ? 'system' : 'user',
      message_content: message || 'Command confirmation',
      command_intent: command.intent,
      command_entity: command.entity,
      command_parameters: command.parameters,
      execution_status: response.success ? 'completed' : 'failed',
      execution_result: response.data || {},
      execution_error: response.success ? null : response.message,
      confidence_score: command.confidence,
      requires_confirmation: response.requiresConfirmation || false,
      confirmed_by: confirmed ? userId : null,
      confirmed_at: confirmed ? new Date().toISOString() : null
    });

    // Generate AI response message if this was a new command
    let aiMessage = response.message;
    if (!commandToConfirm && command.intent !== 'unknown') {
      // Add helpful suggestions
      const suggestions = generateSuggestions(command);
      if (suggestions.length > 0) {
        aiMessage += "\n\n💡 Suggestions:\n" + suggestions.map(s => `• ${s}`).join('\n');
      }
    }

    return NextResponse.json({
      ok: true,
      response: aiMessage,
      command: command,
      requiresConfirmation: response.requiresConfirmation,
      confirmationCommand: response.confirmationCommand,
      suggestions: response.suggestions,
      sessionId: currentSessionId,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error("AI chat error:", error);

    // Log error
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        await supabase.from("ai_chat_history").insert({
          user_id: session.user.id,
          session_id: `error_${Date.now()}`,
          message_type: 'error',
          message_content: 'System error occurred',
          execution_status: 'failed',
          execution_error: error.message
        });
      }
    } catch (logError) {
      console.error("Failed to log error:", logError);
    }

    return NextResponse.json({
      ok: false,
      error: "Sorry, I encountered an error processing your request. Please try again.",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

function generateSuggestions(command: AICommand): string[] {
  const suggestions: string[] = [];

  switch (command.intent) {
    case 'create':
      if (command.entity === 'school') {
        suggestions.push("Add another school in the same district");
        suggestions.push("Send welcome email to the school contact");
      } else if (command.entity === 'presentation') {
        suggestions.push("Schedule a follow-up presentation");
        suggestions.push("Invite volunteers to the presentation");
      }
      break;

    case 'query':
      if (command.entity === 'volunteer') {
        suggestions.push("Show me pending applications");
        suggestions.push("Generate a volunteer progress report");
      } else if (command.entity === 'presentation') {
        suggestions.push("Show presentations this month");
        suggestions.push("Check presentation attendance");
      }
      break;

    case 'send':
      if (command.entity === 'email') {
        suggestions.push("Send reminder emails to inactive volunteers");
        suggestions.push("Follow up with schools about scheduling");
      }
      break;

    case 'approve':
    case 'reject':
      suggestions.push("Show me the next pending application");
      suggestions.push("Send confirmation email to the volunteer");
      break;
  }

  // Add general suggestions if we don't have specific ones
  if (suggestions.length === 0) {
    suggestions.push("Show me platform statistics");
    suggestions.push("List all active schools");
    suggestions.push("Check pending volunteer applications");
  }

  return suggestions.slice(0, 3); // Limit to 3 suggestions
}

// Get chat history for a session
export async function GET(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const role = await getUserRoleServer(supabase as any);

  if (role !== "founder" && role !== "intern") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);

  if (!sessionId) {
    return NextResponse.json({ ok: false, error: "Session ID required" }, { status: 400 });
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("ai_chat_history")
      .select("*")
      .eq("session_id", sessionId)
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: true })
      .limit(limit);

    if (error) throw error;

    return NextResponse.json({
      ok: true,
      history: data || [],
      sessionId
    });

  } catch (error: any) {
    console.error("Error fetching chat history:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}