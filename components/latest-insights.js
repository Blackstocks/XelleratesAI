import { supabase } from '@/lib/supabaseclient';

export const fetchLatestInsightsData = async () => {
    const { data, error } = await supabase
        .from('latest_insights')
        .select('*');

    if (error) {
        console.error('Error fetching latest insights:', error.message);
        return [];
    }

    return data || [];
};
