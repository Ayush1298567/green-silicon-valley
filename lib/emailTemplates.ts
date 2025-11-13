export function teacherRequestConfirmation(params: { teacherName: string; school: string }) {
  const { teacherName, school } = params;
  return {
    subject: "Green Silicon Valley — Presentation Request Received",
    text:
      `Hi ${teacherName},\n\n` +
      `Thanks for your request for a GSV presentation at ${school}.\n` +
      `Our team will reach out shortly to coordinate scheduling and materials.\n\n` +
      `— Green Silicon Valley`
  };
}

export function hoursApproved(params: { name?: string | null; presentationId: number; hours: number; comment?: string }) {
  const { name, presentationId, hours, comment } = params;
  return {
    subject: "GSV — Volunteer Hours Approved",
    text:
      `Hello ${name ?? ""},\n\n` +
      `Your hours submission for presentation #${presentationId} was approved for ${hours} hours.\n` +
      (comment ? `Reviewer note: ${comment}\n\n` : "\n") +
      `You can view your records in the volunteer dashboard.\n\n— Green Silicon Valley`
  };
}

export function hoursRejected(params: { name?: string | null; submissionId: number; comment?: string }) {
  const { name, submissionId, comment } = params;
  return {
    subject: "GSV — Volunteer Hours Rejected",
    text:
      `Hello ${name ?? ""},\n\n` +
      `Your hours submission (ID ${submissionId}) was not approved.\n` +
      (comment ? `Reviewer note: ${comment}\n\n` : "\n") +
      `If you believe this is an error, please reply to this email.\n\n— Green Silicon Valley`
  };
}

export function presentationSubmitted(params: { teamName: string; topic?: string | null }) {
  const { teamName, topic } = params;
  return {
    subject: "GSV — Presentation Submitted for Review",
    text:
      `Hello ${teamName},\n\n` +
      `Your presentation${topic ? ` on "${topic}"` : ""} has been submitted for review.\n` +
      `Our team will review it and get back to you within 48 hours.\n\n` +
      `You can check the status in your volunteer dashboard.\n\n— Green Silicon Valley`
  };
}

export function presentationApproved(params: { teamName: string; topic?: string | null }) {
  const { teamName, topic } = params;
  return {
    subject: "GSV — Presentation Approved!",
    text:
      `Congratulations ${teamName}!\n\n` +
      `Your presentation${topic ? ` on "${topic}"` : ""} has been approved.\n` +
      `Next steps:\n` +
      `1. We'll work with you to schedule the presentation\n` +
      `2. You'll receive details about the school and date\n` +
      `3. Prepare any final materials needed\n\n` +
      `Check your dashboard for updates.\n\n— Green Silicon Valley`
  };
}

export function presentationNeedsChanges(params: { teamName: string; topic?: string | null; comment?: string | null }) {
  const { teamName, topic, comment } = params;
  return {
    subject: "GSV — Presentation Needs Changes",
    text:
      `Hello ${teamName},\n\n` +
      `Your presentation${topic ? ` on "${topic}"` : ""} needs some changes before it can be approved.\n` +
      (comment ? `\nFeedback:\n${comment}\n\n` : "\n") +
      `Please review the comments in your dashboard and make the requested changes.\n` +
      `Once updated, you can resubmit for review.\n\n— Green Silicon Valley`
  };
}

export function commentPosted(params: { recipientName: string; authorName: string; commentType: string; volunteerId: number }) {
  const { recipientName, authorName, commentType, volunteerId } = params;
  return {
    subject: `GSV — New ${commentType === "question" ? "Question" : commentType === "update" ? "Update" : "Comment"}`,
    text:
      `Hello ${recipientName},\n\n` +
      `${authorName} posted a ${commentType === "question" ? "question" : commentType === "update" ? "update" : "comment"} on your presentation.\n\n` +
      `View and respond in your volunteer dashboard:\n` +
      `https://greensiliconvalley.org/dashboard/volunteer/onboarding\n\n— Green Silicon Valley`
  };
}

export function applicationApproved(params: { name: string; type: "volunteer" | "intern" }) {
  const { name, type } = params;
  return {
    subject: `GSV — ${type === "volunteer" ? "Volunteer" : "Intern"} Application Approved!`,
    text:
      `Congratulations ${name}!\n\n` +
      `Your ${type} application has been approved.\n` +
      (type === "volunteer"
        ? `Next steps:\n1. Complete your onboarding\n2. Choose your presentation activity\n3. Start making an impact!\n\n`
        : `Next steps:\n1. Complete your onboarding\n2. Review assigned projects\n3. Get started!\n\n`) +
      `Log in to your dashboard to get started:\n` +
      `https://greensiliconvalley.org/dashboard/${type}\n\n— Green Silicon Valley`
  };
}

export function applicationRejected(params: { name: string; type: "volunteer" | "intern"; reason?: string | null }) {
  const { name, type, reason } = params;
  return {
    subject: `GSV — ${type === "volunteer" ? "Volunteer" : "Intern"} Application Update`,
    text:
      `Hello ${name},\n\n` +
      `Thank you for your interest in Green Silicon Valley.\n\n` +
      `Unfortunately, we're unable to move forward with your ${type} application at this time.\n` +
      (reason ? `\nReason: ${reason}\n\n` : "\n") +
      `We encourage you to apply again in the future.\n\n— Green Silicon Valley`
  };
}

export function volunteerWelcome(params: { name: string; teamName?: string | null }) {
  const { name, teamName } = params;
  return {
    subject: "Welcome to Green Silicon Valley!",
    text:
      `Hello ${name}${teamName ? ` and ${teamName}` : ""},\n\n` +
      `Welcome to Green Silicon Valley! We're excited to have you join our mission to inspire the next generation.\n\n` +
      `Getting Started:\n` +
      `1. Complete your onboarding in the volunteer dashboard\n` +
      `2. Choose your presentation activity\n` +
      `3. Connect with your team\n` +
      `4. Start making an impact!\n\n` +
      `Access your dashboard: https://greensiliconvalley.org/dashboard/volunteer\n\n` +
      `If you have any questions, don't hesitate to reach out.\n\n— Green Silicon Valley Team`
  };
}


