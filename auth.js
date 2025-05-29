function initializeSupabase() {
    const supabaseUrl = 'https://nytrwrlnqfauwsiuhtav.supabase.co'; // Replace with your Supabase URL
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55dHJ3cmxucWZhdXdzaXVodGF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MjEzMzIsImV4cCI6MjA2NDA5NzMzMn0.WQkD46yB8ZsRtRuEbmRXo4PHH5QCIecwLdV0WA3nUcs'; // Replace with your Supabase anon key
    return supabase.createClient(supabaseUrl, supabaseKey, {
        auth: {
            storage: localStorage,
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: false
        }
    });
}

// Restore session from localStorage if available
document.addEventListener('DOMContentLoaded', async () => {
    const supabase = initializeSupabase();
    const storedSession = localStorage.getItem('supabase_session');
    if (storedSession) {
        const sessionData = JSON.parse(storedSession);
        const { error } = await supabase.auth.setSession({
            access_token: sessionData.access_token,
            refresh_token: sessionData.refresh_token
        });
        if (error) {
            console.error('Error restoring session:', error.message);
            localStorage.removeItem('supabase_session');
        }
    }
});
