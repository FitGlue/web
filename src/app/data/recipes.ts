/**
 * Recipe Definitions
 *
 * Each recipe defines an outcome-first pipeline configuration that users
 * can import with one click. Recipes use existing pipeline import codes
 * (base64-encoded PortablePipeline JSON from pipeline-sharing.ts).
 *
 * Enricher references use `enricherProviderType` numbers that match the
 * plugin registry, so display names and icons are resolved at render time.
 *
 * Recipes are just starting points — users can edit them after importing.
 */

export interface RecipeTransformation {
    before: string;
    after: string;
}

export interface Recipe {
    /** Unique recipe identifier */
    id: string;
    /** User-facing title framed as an outcome */
    title: string;
    /** Short tagline describing the value proposition */
    tagline: string;
    /** Icon emoji */
    icon: string;
    /** Category for filtering */
    category: RecipeCategory;
    /** Recommended source integration ID (matches registry source.id) */
    recommendedSource: string;
    /** Human-readable note about source flexibility */
    sourceNote: string;
    /** Destination integration IDs (match registry destination.id) */
    destinations: string[];
    /** Enricher provider type numbers (match registry enricher.enricherProviderType) */
    enricherProviderTypes: number[];
    /** Pipeline import code (base64-encoded PortablePipeline) */
    importCode: string;
    /** Before/after transformation example */
    transformation: RecipeTransformation;
    /** Required connection IDs to use this recipe (match registry integration.id) */
    requiredConnections: string[];
    /** Whether this recipe includes Athlete-tier features */
    includesAthleteFeatures: boolean;
    /** Slug for the matching guide page (e.g. "hevy-to-strava" → /guides/hevy-to-strava) */
    guideSlug?: string;
}

export type RecipeCategory = 'strength' | 'running' | 'parkrun' | 'device' | 'sharing';

export interface RecipeCategoryInfo {
    id: RecipeCategory;
    label: string;
    icon: string;
}

export const RECIPE_CATEGORIES: RecipeCategoryInfo[] = [
    { id: 'strength', label: 'Strength', icon: '🏋️' },
    { id: 'running', label: 'Running', icon: '🏃' },
    { id: 'parkrun', label: 'Parkrun', icon: '🌳' },
    { id: 'device', label: 'Device Data', icon: '⌚' },
    { id: 'sharing', label: 'Sharing', icon: '🔗' },
];

export const RECIPES: Recipe[] = [
    {
        id: 'hevy-strength-showcase',
        title: 'Make Strava Show What You Actually Lifted',
        tagline: 'Turn boring "Weight Training — 45 min" into stunning activity posts with exercise breakdowns and emoji muscle heatmaps',
        icon: '🏋️',
        category: 'strength',
        recommendedSource: 'hevy',
        sourceNote: 'Works with any strength training source',
        destinations: ['strava', 'showcase'],
        enricherProviderTypes: [2, 3],     // Workout Summary, Muscle Heatmap
        importCode: 'eyJ2IjoxLCJuIjoiSGV2eSBTdHJlbmd0aCBTaG93Y2FzZSIsInMiOiJoZXZ5IiwiZSI6W3sicCI6Mn0seyJwIjozfV0sImQiOlsic3RyYXZhIiwic2hvd2Nhc2UiXX0=',
        transformation: {
            before: 'Weight Training\nDuration: 45 min',
            after: '📋 Workout Summary\n20 sets • 8,240kg volume • 57 reps\n\n• Bench Press: 4 × 8 × 80kg\n• Overhead Press: 4 × 10 × 40kg\n• Incline DB Press: 4 × 12 × 24kg\n\n🔥 Muscle Activation\nChest: 🟪🟪🟪🟪🟪\nShoulders: 🟪🟪🟪🟪⬛\nTriceps: 🟪🟪🟪⬛⬛',
        },
        requiredConnections: ['hevy', 'strava'],
        includesAthleteFeatures: false,
        guideSlug: 'hevy-to-strava',
    },
    {
        id: 'fitbit-heart-rate',
        title: 'Your Fitbit Knows Your Heart. Now Strava Can Too.',
        tagline: 'Merge second-by-second Fitbit heart rate into any Strava activity — accurate calories, training zones, and the full intensity story',
        icon: '💓',
        category: 'running',
        recommendedSource: 'strava',
        sourceNote: 'Heart rate data pulled from your connected Fitbit',
        destinations: ['strava', 'showcase'],
        enricherProviderTypes: [1, 14, 21], // Workout Summary, Fitbit Heart Rate, Training Load
        importCode: 'eyJ2IjoxLCJuIjoiQ29tcGxldGUgQWN0aXZpdHkgRGF0YSIsInMiOiJzdHJhdmEiLCJlIjpbeyJwIjoxfSx7InAiOjE0fSx7InAiOjIxfV0sImQiOlsic3RyYXZhIiwic2hvd2Nhc2UiXX0=',
        transformation: {
            before: 'Morning Run\n5.2 km • 28:32\nAvg HR: —\nCalories: Est. 320',
            after: '❤️ Heart Rate: 95 bpm min • 156 bpm avg • 178 bpm max\n\n💪 Training Load: 89 (Moderate)\n🔥 Calories: 412 (Accurate)\n\nZone 3: 18 min • Zone 4: 8 min\n\n[Full HR graph now visible in Strava]',
        },
        requiredConnections: ['strava', 'fitbit'],
        includesAthleteFeatures: false,
        guideSlug: 'fitbit-heart-rate',
    },
    {
        id: 'parkrun-magic',
        title: 'Your Saturday Parkrun Deserves Official Results',
        tagline: 'Automatic event detection, official chip times, finishing position, age grade — plus PB celebrations when you smash your best',
        icon: '🌳',
        category: 'parkrun',
        recommendedSource: 'strava',
        sourceNote: 'Detects parkrun events from your Strava activities',
        destinations: ['strava', 'showcase'],
        enricherProviderTypes: [8, 23, 20], // Parkrun Results, Weather, Personal Records
        importCode: 'eyJ2IjoxLCJuIjoiUGFya3J1biBNYWdpYyIsInMiOiJzdHJhdmEiLCJlIjpbeyJwIjo4fSx7InAiOjIzfSx7InAiOjIwfV0sImQiOlsic3RyYXZhIiwic2hvd2Nhc2UiXX0=',
        transformation: {
            before: 'Morning Run\n5.1 km • 24:35\n(No context, wrong time)',
            after: '🌳 Parkrun @ Newark\n\n🏃 Official Parkrun Results\n📍 Newark Parkrun\n🏁 Position: 45/312\n⏱️ Official Time: 24:12\n📊 Age Grade: 58.2%\n🎉 NEW PB! (Previous: 24:28)\n\n🌤️ Weather: 12°C, Partly Cloudy',
        },
        requiredConnections: ['strava'],
        includesAthleteFeatures: false,
        guideSlug: 'parkrun-automation',
    },
    {
        id: 'garmin-supercharger',
        title: 'Your Garmin Captures Amazing Data. Let FitGlue Tell the Story.',
        tagline: 'Weather conditions, location titles, elevation profiles, and shareable pages — transform raw FIT files into rich activity posts',
        icon: '⌚',
        category: 'device',
        recommendedSource: 'file_upload',
        sourceNote: 'Upload .FIT files exported from Garmin Connect',
        destinations: ['strava', 'showcase'],
        enricherProviderTypes: [14, 23, 24, 25], // Fitbit HR, Weather, Location Naming, Elevation Profile
        importCode: 'eyJ2IjoxLCJuIjoiR2FybWluIEFjdGl2aXR5IFN1cGVyY2hhcmdlciIsInMiOiJmaWxlX3VwbG9hZCIsImUiOlt7InAiOjE0fSx7InAiOjIzfSx7InAiOjI0fSx7InAiOjI1fV0sImQiOlsic3RyYXZhIiwic2hvd2Nhc2UiXX0=',
        transformation: {
            before: 'Morning Run\n10.2 km | 52:15\nAvg HR: 152 bpm',
            after: '📍 Morning Run in Hyde Park\n10.2 km | 52:15 | 5:07/km\n\n❤️ Heart Rate: 98 bpm min • 152 bpm avg • 175 bpm max\n\n⛰️ Elevation: +127m gain • −125m loss • 45m max\n\n🌤️ Weather: 14°C, Clear • Wind: 8 km/h NW\n\n💪 Training Load: 112 (Hard)',
        },
        requiredConnections: [],
        includesAthleteFeatures: false,
        guideSlug: 'garmin-fit-upload',
    },
    {
        id: 'showcase-strength',
        title: 'Share Your Workouts With Anyone — No Strava Needed',
        tagline: 'Beautiful public pages with full exercise breakdowns, muscle heatmaps, and AI summaries — perfect for coaches, friends, or social media',
        icon: '🔗',
        category: 'sharing',
        recommendedSource: 'hevy',
        sourceNote: 'Works with any source — share cardio, strength, or device data',
        destinations: ['showcase'],
        enricherProviderTypes: [2, 3, 26], // Workout Summary, Muscle Heatmap, AI Companion
        importCode: 'eyJ2IjoxLCJuIjoiU3RyZW5ndGggVHJhaW5pbmcgU2hvd2Nhc2UiLCJzIjoiaGV2eSIsImUiOlt7InAiOjJ9LHsicCI6M30seyJwIjoyNn1dLCJkIjpbInNob3djYXNlIl19',
        transformation: {
            before: 'Your workout data lives in one app.\nFriends without that app can\'t see it.',
            after: '🔗 fitglue.tech/s/your-name/push-day\n\nA beautiful public page with:\n📋 Full exercise breakdown\n🔥 Muscle heatmap visualization\n🤖 AI-generated summary\n📊 Volume and intensity stats\n\nShareable anywhere — no login required!',
        },
        requiredConnections: ['hevy'],
        includesAthleteFeatures: true,
        guideSlug: 'showcase',
    },
];
