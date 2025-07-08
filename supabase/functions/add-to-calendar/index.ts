import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TaskCalendarEvent {
  taskId: string;
  title: string;
  description?: string;
  dueDate: string;
  dueTime?: string;
  estimatedTime?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { taskId, title, description, dueDate, dueTime, estimatedTime }: TaskCalendarEvent = await req.json();

    // Parse the date and time correctly
    const startDateTime = new Date(`${dueDate}T${dueTime || '09:00'}:00`);

    // Parse estimated time to determine duration in minutes
    let durationMinutes = 90; // Default 1.5 hours
    if (estimatedTime) {
      if (estimatedTime.includes('hour')) {
        const hours = parseFloat(estimatedTime.match(/(\d+\.?\d*)/)?.[0] || '1.5');
        durationMinutes = hours * 60;
      } else if (estimatedTime.includes('minute')) {
        durationMinutes = parseInt(estimatedTime.match(/(\d+)/)?.[0] || '90');
      }
    }

    const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60000);

    // Format dates for iCal
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    // Create iCal content
    const icalContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//AI Task Manager//EN',
      'BEGIN:VEVENT',
      `UID:task-${taskId}@aitaskmanager.com`,
      `DTSTART:${formatDate(startDateTime)}`,
      `DTEND:${formatDate(endDateTime)}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${description || 'AI-generated task'}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    // Create Google Calendar URL for easy adding
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${formatDate(startDateTime)}/${formatDate(endDateTime)}&details=${encodeURIComponent(description || 'AI-generated task')}&location=&trp=false`;

    return new Response(JSON.stringify({ 
      success: true,
      icalContent,
      googleCalendarUrl,
      message: 'Calendar event created successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in add-to-calendar function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});