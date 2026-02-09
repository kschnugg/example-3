# PlantMaster — Product Requirements Document & Technical Specification

**Version:** 1.0
**Date:** 2026-02-09
**Status:** Draft
**Author:** Architecture Team

---

## Table of Contents

1. [Executive Summary & User Flow](#1-executive-summary--user-flow)
2. [Detailed Feature Specifications](#2-detailed-feature-specifications)
3. [Technical Stack Recommendations](#3-technical-stack-recommendations)
4. [Code Structure (Skeleton)](#4-code-structure-skeleton)
5. [Implementation Roadmap](#5-implementation-roadmap)
6. [Appendices](#6-appendices)

---

## 1. Executive Summary & User Flow

### 1.1 Product Vision

PlantMaster is a cross-platform application (Windows, macOS, Android, iOS) built from a single codebase that serves as the central hub for managing all aspects of plant care. It combines AI-powered plant identification, disease diagnosis, and intelligent scheduling to automate the cognitive load of caring for plants across indoor and outdoor environments.

### 1.2 Target Users

| Persona | Description |
|---------|-------------|
| **Casual Grower** | Owns 1–10 houseplants, needs reminders and basic care info |
| **Enthusiast** | Owns 10–50+ plants across multiple rooms, wants detailed tracking |
| **Gardener** | Manages outdoor beds and greenhouses, needs seasonal awareness |

### 1.3 User Flow — Onboarding to First Plant

```
Step 1: INSTALL & LAUNCH
  └─> User downloads app from App Store / Play Store / Desktop installer
  └─> Splash screen → Welcome carousel (3 screens explaining core features)

Step 2: ACCOUNT CREATION
  └─> Options: Email + Password, Google Sign-In, Apple Sign-In
  └─> Set local timezone (auto-detected, user-confirmable)
  └─> Optional: Enable location services for weather-aware scheduling

Step 3: CREATE FIRST LOCATION
  └─> Prompt: "Where do your plants live?"
  └─> User taps "Add Location" → enters name (e.g., "Living Room")
  └─> Selects environment type: Indoor / Outdoor / Greenhouse
  └─> Selects light level: Low / Medium / Bright Indirect / Direct Sun

Step 4: ADD FIRST PLANT
  └─> Prompt: "Let's add your first plant!"
  └─> Three entry paths:
      ├─> [A] CAMERA — Take a photo → AI identifies the species
      ├─> [B] SEARCH — Type species name → browse database results
      └─> [C] MANUAL — Enter custom species name + care details
  └─> Path A Detail:
      ├─> Camera opens → User photographs the plant
      ├─> AI returns top 3 matches with confidence scores
      ├─> User confirms the correct match
      └─> Species data auto-populates from web (light, water, soil, toxicity)

Step 5: PERSONALIZE THE PLANT PROFILE
  └─> User gives the plant a nickname (e.g., "Fern Gully")
  └─> Optionally uploads additional photos
  └─> Assigns it to the Location created in Step 3
  └─> Reviews the auto-generated care schedule

Step 6: CARE SCHEDULE ACTIVATION
  └─> App generates a calendar based on:
      ├─> Species watering frequency
      ├─> Current season + local climate
      ├─> Environment type (indoor/outdoor)
      └─> Pot size (if provided)
  └─> User confirms or adjusts the schedule
  └─> Push notifications are enabled (with permission)

Step 7: DASHBOARD
  └─> User lands on the home dashboard showing:
      ├─> Today's tasks (watering, fertilizing, etc.)
      ├─> Plant health overview
      └─> Quick-add button for more plants
```

### 1.4 Key User Journeys (Post-Onboarding)

**Diagnose a Sick Plant:**
```
Dashboard → Select Plant → "Diagnose" button → Take photo of affected area
→ AI analyzes image → Returns diagnosis (e.g., "Root Rot — Overwatering")
→ Displays treatment steps → Option to adjust care schedule
```

**View Weekly Schedule:**
```
Dashboard → Calendar tab → View tasks by day/week/month
→ Tap a task to mark complete, snooze, or skip
→ Completed tasks logged to plant history
```

---

## 2. Detailed Feature Specifications

### 2.1 Location Management

#### Data Structure

```json
{
  "location": {
    "id": "uuid-v4",
    "userId": "firebase-uid",
    "name": "Living Room",
    "environmentType": "indoor",
    "lightLevel": "bright_indirect",
    "notes": "South-facing window, gets afternoon sun",
    "iconEmoji": "🪴",
    "sortOrder": 0,
    "plantIds": ["plant-uuid-1", "plant-uuid-2"],
    "createdAt": "2026-02-09T10:30:00Z",
    "updatedAt": "2026-02-09T10:30:00Z"
  }
}
```

**Field Definitions:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string (UUID v4)` | Yes | Unique identifier |
| `userId` | `string` | Yes | Owner's auth UID |
| `name` | `string` | Yes | User-defined location name (max 50 chars) |
| `environmentType` | `enum` | Yes | `indoor`, `outdoor`, `greenhouse` |
| `lightLevel` | `enum` | Yes | `low`, `medium`, `bright_indirect`, `direct_sun` |
| `notes` | `string` | No | Free-text notes (max 500 chars) |
| `iconEmoji` | `string` | No | Single emoji for visual identification |
| `sortOrder` | `int` | Yes | Position in user's location list |
| `plantIds` | `List<string>` | Yes | References to plants at this location |
| `createdAt` | `ISO 8601` | Yes | Creation timestamp |
| `updatedAt` | `ISO 8601` | Yes | Last modification timestamp |

**Validation Rules:**
- A user can create up to 50 locations (free tier: 10).
- Location names must be unique per user.
- Deleting a location prompts the user to reassign or archive its plants.

---

### 2.2 Plant Inventory

#### JSON Schema — Plant Profile

```json
{
  "plant": {
    "id": "plant-uuid-001",
    "userId": "firebase-uid",
    "locationId": "location-uuid-001",
    "nickname": "Fern Gully",
    "species": {
      "commonName": "Boston Fern",
      "scientificName": "Nephrolepis exaltata",
      "family": "Nephrolepidaceae",
      "identificationConfidence": 0.94,
      "identifiedVia": "plant_id_api"
    },
    "careProfile": {
      "lightRequirement": "bright_indirect",
      "waterFrequencyDays": 3,
      "humidityPreference": "high",
      "soilType": "peat_based_well_draining",
      "fertilizerFrequencyWeeks": 4,
      "fertilizerType": "balanced_liquid_10-10-10",
      "pruningFrequencyWeeks": 8,
      "mistingFrequencyDays": 1,
      "toxicity": {
        "toxic": false,
        "toxicTo": []
      },
      "temperatureRange": {
        "minCelsius": 16,
        "maxCelsius": 27
      },
      "bestUses": ["air_purifying", "hanging_basket", "bathroom"]
    },
    "potSizeCm": 20,
    "dateAcquired": "2026-01-15",
    "photos": [
      {
        "id": "photo-uuid-001",
        "url": "gs://plantmaster-storage/users/{uid}/plants/{pid}/photo1.jpg",
        "caption": "Day I brought it home",
        "takenAt": "2026-01-15T14:00:00Z",
        "type": "general"
      },
      {
        "id": "photo-uuid-002",
        "url": "gs://plantmaster-storage/users/{uid}/plants/{pid}/diagnosis1.jpg",
        "caption": "Brown leaf tips",
        "takenAt": "2026-02-01T09:00:00Z",
        "type": "diagnosis"
      }
    ],
    "healthLog": [
      {
        "date": "2026-02-01",
        "status": "needs_attention",
        "diagnosis": "Low humidity stress — leaf tip browning",
        "treatment": "Increase misting to twice daily; move away from heating vent"
      }
    ],
    "careHistory": [
      {
        "taskType": "water",
        "scheduledDate": "2026-02-08",
        "completedDate": "2026-02-08",
        "skipped": false,
        "notes": ""
      }
    ],
    "notes": "Gift from Sarah. Prefers the bathroom humidity.",
    "isArchived": false,
    "createdAt": "2026-01-15T14:00:00Z",
    "updatedAt": "2026-02-09T10:00:00Z"
  }
}
```

**Photo Sub-schema:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes | Unique photo identifier |
| `url` | `string` | Yes | Cloud storage path |
| `caption` | `string` | No | User-provided caption |
| `takenAt` | `ISO 8601` | Yes | When the photo was taken |
| `type` | `enum` | Yes | `general`, `diagnosis`, `progress` |

---

### 2.3 Care Logic — Watering Schedule Calculation

The watering schedule engine must produce a `nextWateringDate` by considering multiple factors weighted together.

#### Inputs

| Factor | Source | Weight |
|--------|--------|--------|
| Base watering interval | Species database (e.g., 7 days for Pothos) | Primary |
| Current season | Device clock + hemisphere | High |
| Environment type | Location record (indoor/outdoor/greenhouse) | Medium |
| Light level | Location record | Medium |
| Pot size | Plant profile (larger pot = retains moisture longer) | Low |
| Recent weather | Weather API (outdoor plants only) | Medium |

#### Seasonal Adjustment Multipliers

The base watering interval is adjusted by a seasonal multiplier that accounts for how plant physiology changes across seasons:

| Season | Multiplier | Rationale |
|--------|------------|-----------|
| **Summer** | `0.75` | Higher evaporation, active growth — water more often |
| **Spring** | `0.85` | Growth phase beginning, moderate increase |
| **Autumn** | `1.15` | Growth slowing, soil dries more slowly |
| **Winter** | `1.40` | Dormancy for most species, much slower drying |

#### Light Level Adjustment

| Light Level | Multiplier |
|-------------|------------|
| `direct_sun` | `0.85` |
| `bright_indirect` | `1.00` |
| `medium` | `1.10` |
| `low` | `1.25` |

#### Pot Size Adjustment

| Pot Diameter | Multiplier |
|--------------|------------|
| < 10 cm | `0.85` |
| 10–20 cm | `1.00` |
| 20–35 cm | `1.10` |
| > 35 cm | `1.20` |

#### Environment Adjustment

| Environment | Multiplier |
|-------------|------------|
| `outdoor` | `0.85` (more exposure) |
| `greenhouse` | `0.90` |
| `indoor` | `1.00` |

#### Algorithm (Pseudo-code)

```
function calculateNextWateringDate(plant, location, currentDate):
    // Step 1: Get the base interval from the species database
    baseIntervalDays = plant.careProfile.waterFrequencyDays

    // Step 2: Determine the current season based on hemisphere
    season = getSeason(currentDate, user.hemisphere)

    // Step 3: Look up adjustment multipliers
    seasonMultiplier     = SEASON_MULTIPLIERS[season]
    lightMultiplier      = LIGHT_MULTIPLIERS[location.lightLevel]
    potMultiplier        = getPotSizeMultiplier(plant.potSizeCm)
    environmentMultiplier = ENVIRONMENT_MULTIPLIERS[location.environmentType]

    // Step 4: Calculate adjusted interval
    adjustedInterval = baseIntervalDays
                       * seasonMultiplier
                       * lightMultiplier
                       * potMultiplier
                       * environmentMultiplier

    // Step 5: For outdoor plants, factor in recent rainfall
    if location.environmentType == "outdoor":
        recentRainfallMm = getRecentRainfall(user.coordinates, lastDays=3)
        if recentRainfallMm > 10:
            adjustedInterval = adjustedInterval * 1.5  // delay watering
        else if recentRainfallMm > 5:
            adjustedInterval = adjustedInterval * 1.2

    // Step 6: Clamp to reasonable bounds
    adjustedInterval = clamp(adjustedInterval, minDays=1, maxDays=30)

    // Step 7: Round and compute the next date
    adjustedInterval = round(adjustedInterval)
    lastWatered = getLastCompletedDate(plant, taskType="water")

    if lastWatered is null:
        return currentDate  // water today if never watered
    else:
        return lastWatered + adjustedInterval days
```

#### Worked Example

> **Plant:** Boston Fern (`waterFrequencyDays` = 3)
> **Season:** Winter → multiplier `1.40`
> **Light:** Bright Indirect → multiplier `1.00`
> **Pot:** 20 cm → multiplier `1.00`
> **Environment:** Indoor → multiplier `1.00`
>
> `adjustedInterval = 3 × 1.40 × 1.00 × 1.00 × 1.00 = 4.2 → rounded to 4 days`
>
> If last watered on Feb 5, **next watering = Feb 9**.

---

### 2.4 AI Plant Identification

**Flow:**
1. User captures or uploads a photo.
2. Client compresses the image (max 1 MB, 1024×1024 px).
3. Client sends the image as base64 to the backend Cloud Function.
4. Cloud Function forwards the request to the Plant.id API.
5. Response includes ranked species suggestions with confidence scores.
6. If confidence ≥ 0.70, auto-populate care data. If < 0.70, ask user to confirm from the top 3 results.

**API Request (Plant.id v3):**
```json
POST https://plant.id/api/v3/identification
Headers: { "Api-Key": "YOUR_API_KEY", "Content-Type": "application/json" }
Body: {
  "images": ["base64-encoded-image"],
  "similar_images": true,
  "classification_level": "species"
}
```

### 2.5 AI Disease Diagnosis

**Flow:**
1. User selects a plant → taps "Diagnose" → photographs the affected area.
2. Image sent to the Plant.id Health Assessment endpoint.
3. API returns a list of probable diseases/pests with confidence scores.
4. App displays the top diagnosis, description, and a treatment plan.
5. Diagnosis is logged to `plant.healthLog`.

**API Request (Plant.id Health Assessment):**
```json
POST https://plant.id/api/v3/health_assessment
Headers: { "Api-Key": "YOUR_API_KEY", "Content-Type": "application/json" }
Body: {
  "images": ["base64-encoded-image"],
  "similar_images": true
}
```

### 2.6 Push Notifications

| Trigger | Timing | Message Template |
|---------|--------|------------------|
| Watering due | Morning of due date (configurable, default 8 AM) | "Time to water {nickname}! 💧" |
| Fertilizing due | Morning of due date | "{nickname} needs fertilizing today" |
| Pruning due | Morning of due date | "{nickname} could use a trim" |
| Diagnosis follow-up | 3 days after diagnosis logged | "How is {nickname} doing? Tap to update" |
| Missed task | 1 day overdue | "Reminder: {nickname} was due for {task} yesterday" |

**Implementation:** Firebase Cloud Messaging (FCM) for Android/iOS, platform notification APIs for desktop. Scheduled via Cloud Functions cron triggers checking user task queues.

---

## 3. Technical Stack Recommendations

### 3.1 Framework: Flutter (Recommended)

| Criteria | Flutter | React Native |
|----------|---------|--------------|
| **Single codebase for all 5 targets** | Yes (iOS, Android, Windows, macOS, Web) | Partial — desktop support requires Electron or separate tooling |
| **Desktop support maturity** | Stable since Flutter 3.0 (2022), production-ready | Community-maintained, less mature |
| **Performance** | Compiles to native ARM/x86 code, 60/120 fps rendering | JavaScript bridge adds overhead, Hermes helps but still interpreted |
| **UI consistency** | Custom rendering engine (Skia/Impeller) — pixel-identical on all platforms | Uses native components — visual differences between platforms |
| **Camera/Image handling** | Excellent plugins (`camera`, `image_picker`) | Good, but plugin quality varies |
| **Developer ecosystem** | Strong, Google-backed, growing | Larger JS ecosystem, but fragmented |

**Decision: Flutter**

Flutter is the recommended framework because:
1. **True cross-platform desktop support** is a hard requirement. Flutter's Windows and macOS support is production-stable. React Native's desktop story relies on third-party solutions with less community backing.
2. **Performance**: Camera-heavy AI features (plant identification, diagnosis) benefit from Flutter's compiled performance and direct platform channel access.
3. **Consistency**: A single rendering engine means the care calendar, plant cards, and photo UI look identical everywhere — reducing QA burden.

### 3.2 APIs

| Purpose | Recommended API | Alternatives | Pricing Model |
|---------|----------------|--------------|---------------|
| **Plant Identification** | **Kindwise Plant.id v3** | Pl@ntNet (free, lower accuracy), Google Cloud Vision (generic) | Pay-per-request (~$0.05/identification) |
| **Disease Diagnosis** | **Kindwise Plant.id Health Assessment** | Plantix (mobile-only SDK) | Bundled with Plant.id subscription |
| **Plant Care Database** | **Perenual API** | Trefle (deprecated/unmaintained), Open Farm (limited) | Free tier: 300 req/day; Pro: $3/month |
| **Weather Data** | **Open-Meteo** | OpenWeatherMap, WeatherAPI | Free, no API key required |
| **Geocoding** | **Platform native** (Android/iOS location services) | Google Maps Geocoding | Included with platform |

**API Selection Rationale:**

- **Plant.id** is chosen as the primary AI provider because it offers both identification and health assessment in a single platform, reducing integration complexity. Its v3 API returns structured data including common name, scientific name, taxonomy, and similar images.
- **Perenual** fills the gap for detailed care data (watering frequency, sunlight needs, pruning cycles) that Plant.id does not provide. The free tier is sufficient for MVP.
- **Open-Meteo** is chosen for weather data because it requires no API key, has no rate limits for reasonable usage, and provides historical precipitation data needed for the outdoor watering adjustment logic.

### 3.3 Backend: Firebase (Recommended)

| Criteria | Firebase | Supabase |
|----------|----------|----------|
| **Real-time sync** | Firestore — built-in real-time listeners, offline-first with local cache | Real-time via PostgreSQL LISTEN/NOTIFY — works but less battle-tested on mobile |
| **Auth** | Firebase Auth — native SDKs for all platforms, Google/Apple sign-in built-in | GoTrue — solid, but fewer native mobile SDK conveniences |
| **Cloud Functions** | Cloud Functions for Firebase (Node.js/Python) — tight integration | Edge Functions (Deno) — capable but smaller ecosystem |
| **Storage** | Firebase Storage (GCS-backed) — resumable uploads, security rules | Supabase Storage (S3-backed) — works well |
| **Flutter SDK** | FlutterFire — official, Google-maintained, 1st-party | supabase_flutter — community-maintained, good but less mature |
| **Offline support** | Firestore has transparent offline persistence on all platforms | Requires manual implementation |
| **Push notifications** | FCM — industry standard, handles token management | Requires external service (OneSignal, etc.) |
| **Cost at scale** | Can get expensive with many reads | More predictable pricing |

**Decision: Firebase**

Firebase is recommended because:
1. **Offline-first is critical** for a plant care app. Users may be in a greenhouse or garden with poor connectivity. Firestore's built-in offline persistence ensures task completion and data access without network dependency.
2. **Real-time sync** between phone and PC is a core requirement. Firestore listeners propagate changes within milliseconds.
3. **FlutterFire** is the most mature and best-maintained Flutter backend SDK, reducing integration risk.
4. **FCM** solves push notifications across all platforms with a single implementation.

### 3.4 State Management: Riverpod

Riverpod is recommended over BLoC or Provider for this project because:
- Type-safe and compile-time checked dependency injection.
- Works with code generation (`riverpod_generator`) for reduced boilerplate.
- No `BuildContext` dependency — testable and usable outside widgets.
- Built-in support for async state, caching, and auto-disposal.

### 3.5 Architecture Pattern: Feature-First + Clean Architecture

The project follows a **feature-first** directory structure with **Clean Architecture** layers within each feature:
- **Domain** (entities, repository interfaces, use cases)
- **Data** (repository implementations, data sources, DTOs)
- **Presentation** (screens, widgets, controllers/providers)

---

## 4. Code Structure (Skeleton)

### 4.1 Directory Structure

```
plantmaster/
├── android/                          # Android-specific configuration
├── ios/                              # iOS-specific configuration
├── windows/                          # Windows-specific configuration
├── macos/                            # macOS-specific configuration
├── lib/
│   ├── main.dart                     # App entry point
│   ├── app.dart                      # MaterialApp / router setup
│   ├── firebase_options.dart         # Generated Firebase config
│   │
│   ├── core/                         # Shared infrastructure
│   │   ├── constants/
│   │   │   ├── app_colors.dart
│   │   │   ├── app_strings.dart
│   │   │   └── care_multipliers.dart # Season/light/pot multiplier tables
│   │   ├── errors/
│   │   │   ├── failures.dart
│   │   │   └── exceptions.dart
│   │   ├── network/
│   │   │   ├── api_client.dart       # Dio HTTP client setup
│   │   │   └── network_info.dart
│   │   ├── routing/
│   │   │   └── app_router.dart       # GoRouter configuration
│   │   ├── theme/
│   │   │   ├── app_theme.dart
│   │   │   └── text_styles.dart
│   │   └── utils/
│   │       ├── date_utils.dart
│   │       ├── image_utils.dart      # Compression, base64 encoding
│   │       └── season_utils.dart     # Hemisphere-aware season detection
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── data/
│   │   │   │   ├── datasources/
│   │   │   │   │   └── auth_remote_datasource.dart
│   │   │   │   └── repositories/
│   │   │   │       └── auth_repository_impl.dart
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   └── user.dart
│   │   │   │   ├── repositories/
│   │   │   │   │   └── auth_repository.dart
│   │   │   │   └── usecases/
│   │   │   │       ├── sign_in.dart
│   │   │   │       └── sign_out.dart
│   │   │   └── presentation/
│   │   │       ├── providers/
│   │   │       │   └── auth_provider.dart
│   │   │       └── screens/
│   │   │           ├── login_screen.dart
│   │   │           └── onboarding_screen.dart
│   │   │
│   │   ├── locations/
│   │   │   ├── data/
│   │   │   │   ├── datasources/
│   │   │   │   │   └── location_firestore_datasource.dart
│   │   │   │   ├── models/
│   │   │   │   │   └── location_model.dart  # Firestore DTO
│   │   │   │   └── repositories/
│   │   │   │       └── location_repository_impl.dart
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   └── location.dart
│   │   │   │   ├── repositories/
│   │   │   │   │   └── location_repository.dart
│   │   │   │   └── usecases/
│   │   │   │       ├── create_location.dart
│   │   │   │       ├── delete_location.dart
│   │   │   │       └── get_locations.dart
│   │   │   └── presentation/
│   │   │       ├── providers/
│   │   │       │   └── locations_provider.dart
│   │   │       ├── screens/
│   │   │       │   └── locations_screen.dart
│   │   │       └── widgets/
│   │   │           └── location_card.dart
│   │   │
│   │   ├── plants/
│   │   │   ├── data/
│   │   │   │   ├── datasources/
│   │   │   │   │   ├── plant_firestore_datasource.dart
│   │   │   │   │   └── plant_api_datasource.dart  # Perenual API
│   │   │   │   ├── models/
│   │   │   │   │   └── plant_model.dart   # Firestore DTO
│   │   │   │   └── repositories/
│   │   │   │       └── plant_repository_impl.dart
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   ├── plant.dart          # Core entity
│   │   │   │   │   ├── care_profile.dart
│   │   │   │   │   ├── species_info.dart
│   │   │   │   │   └── plant_photo.dart
│   │   │   │   ├── repositories/
│   │   │   │   │   └── plant_repository.dart
│   │   │   │   └── usecases/
│   │   │   │       ├── add_plant.dart
│   │   │   │       ├── get_plants_by_location.dart
│   │   │   │       └── update_plant.dart
│   │   │   └── presentation/
│   │   │       ├── providers/
│   │   │       │   └── plants_provider.dart
│   │   │       ├── screens/
│   │   │       │   ├── plant_detail_screen.dart
│   │   │       │   └── add_plant_screen.dart
│   │   │       └── widgets/
│   │   │           ├── plant_card.dart
│   │   │           └── photo_gallery.dart
│   │   │
│   │   ├── identification/
│   │   │   ├── data/
│   │   │   │   ├── datasources/
│   │   │   │   │   └── plant_id_api_datasource.dart
│   │   │   │   └── repositories/
│   │   │   │       └── identification_repository_impl.dart
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   └── identification_result.dart
│   │   │   │   ├── repositories/
│   │   │   │   │   └── identification_repository.dart
│   │   │   │   └── usecases/
│   │   │   │       └── identify_plant.dart
│   │   │   └── presentation/
│   │   │       ├── providers/
│   │   │       │   └── identification_provider.dart
│   │   │       └── screens/
│   │   │           └── identification_screen.dart
│   │   │
│   │   ├── diagnosis/
│   │   │   ├── data/
│   │   │   │   ├── datasources/
│   │   │   │   │   └── health_api_datasource.dart
│   │   │   │   └── repositories/
│   │   │   │       └── diagnosis_repository_impl.dart
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   └── diagnosis_result.dart
│   │   │   │   ├── repositories/
│   │   │   │   │   └── diagnosis_repository.dart
│   │   │   │   └── usecases/
│   │   │   │       └── diagnose_plant.dart
│   │   │   └── presentation/
│   │   │       ├── providers/
│   │   │       │   └── diagnosis_provider.dart
│   │   │       └── screens/
│   │   │           └── diagnosis_screen.dart
│   │   │
│   │   ├── scheduling/
│   │   │   ├── data/
│   │   │   │   ├── datasources/
│   │   │   │   │   ├── schedule_firestore_datasource.dart
│   │   │   │   │   └── weather_api_datasource.dart
│   │   │   │   └── repositories/
│   │   │   │       └── schedule_repository_impl.dart
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   ├── care_task.dart
│   │   │   │   │   └── care_schedule.dart
│   │   │   │   ├── repositories/
│   │   │   │   │   └── schedule_repository.dart
│   │   │   │   └── usecases/
│   │   │   │       ├── calculate_next_watering.dart
│   │   │   │       ├── generate_schedule.dart
│   │   │   │       └── complete_task.dart
│   │   │   └── presentation/
│   │   │       ├── providers/
│   │   │       │   └── schedule_provider.dart
│   │   │       ├── screens/
│   │   │       │   └── calendar_screen.dart
│   │   │       └── widgets/
│   │   │           ├── task_card.dart
│   │   │           └── weekly_view.dart
│   │   │
│   │   └── dashboard/
│   │       └── presentation/
│   │           ├── providers/
│   │           │   └── dashboard_provider.dart
│   │           ├── screens/
│   │           │   └── dashboard_screen.dart
│   │           └── widgets/
│   │               ├── todays_tasks_widget.dart
│   │               └── plant_health_summary.dart
│   │
│   └── shared/
│       ├── widgets/
│       │   ├── app_button.dart
│       │   ├── loading_indicator.dart
│       │   └── error_display.dart
│       └── providers/
│           └── connectivity_provider.dart
│
├── test/
│   ├── unit/
│   │   ├── scheduling/
│   │   │   └── calculate_next_watering_test.dart
│   │   └── plants/
│   │       └── plant_model_test.dart
│   ├── widget/
│   │   └── plant_card_test.dart
│   └── integration/
│       └── add_plant_flow_test.dart
│
├── assets/
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── pubspec.yaml
├── analysis_options.yaml
└── firebase.json
```

### 4.2 Plant Data Model (Dart)

See `plantmaster/lib/features/plants/domain/entities/plant.dart` — provided as a standalone source file in this repository.

### 4.3 Watering Calculation Logic (Dart)

See `plantmaster/lib/features/scheduling/domain/usecases/calculate_next_watering.dart` — provided as a standalone source file in this repository.

---

## 5. Implementation Roadmap

### Phase 1 — MVP (Foundation)

**Goal:** Core plant management loop — add plants, view them, get watering reminders.

| Track | Deliverables |
|-------|-------------|
| **Infrastructure** | Flutter project scaffold, Firebase project setup, CI/CD pipeline (GitHub Actions), Firestore security rules |
| **Auth** | Email/password sign-up and sign-in, Google Sign-In, Apple Sign-In |
| **Locations** | CRUD for locations, assign environment type and light level |
| **Plants — Manual** | Add plant by searching species name (Perenual API), edit plant profile, assign to location, photo upload to Firebase Storage |
| **Care Scheduling** | `calculateNextWateringDate()` implementation, auto-generate watering + fertilizing schedule on plant creation, calendar view (week/month), mark task as completed/skipped |
| **Notifications** | FCM integration, daily morning notification for due tasks |
| **Desktop** | Windows and macOS builds verified, responsive layout for larger screens |

**Exit Criteria:** A user can sign up, create a location, manually add a plant, receive a watering notification, and complete the task — all synced between phone and PC.

---

### Phase 2 — Alpha (AI Features)

**Goal:** AI-powered identification and diagnosis.

| Track | Deliverables |
|-------|-------------|
| **Plant Identification** | Camera capture flow, Plant.id API integration via Cloud Function, species selection from top results, auto-populate care data from Perenual |
| **Disease Diagnosis** | Photo capture for sick plants, Plant.id Health Assessment integration, diagnosis display with treatment suggestions, health log per plant |
| **Weather Integration** | Open-Meteo API integration, outdoor plant watering adjustment based on recent rainfall, weather widget on dashboard |
| **Enhanced Scheduling** | Misting and pruning task types, snooze/reschedule functionality, task history per plant |
| **UX Polish** | Onboarding carousel, empty-state illustrations, pull-to-refresh, skeleton loading states |

**Exit Criteria:** A user can photograph a plant to identify it, photograph a sick leaf to get a diagnosis, and outdoor plants automatically adjust their watering schedule based on weather.

---

### Phase 3 — Beta (Scale & Delight)

**Goal:** Social features, advanced analytics, and production hardening.

| Track | Deliverables |
|-------|-------------|
| **Plant Journal** | Timeline view of all care actions + photos per plant, progress photos with side-by-side comparison |
| **Analytics Dashboard** | Watering adherence rate, plant health trends over time, "most neglected plant" insights |
| **Batch Operations** | "Water all plants in [Location]" with one tap, bulk reschedule for vacations (vacation mode) |
| **Search & Filter** | Search plants by name, filter by location / health status / task due |
| **Accessibility** | Screen reader support, dynamic text sizing, high-contrast mode |
| **Performance** | Image caching and lazy loading, Firestore query optimization (composite indexes), app size optimization (<30 MB) |
| **Testing** | Unit test coverage >80% on domain/data layers, widget tests for all screens, integration tests for critical flows (add plant, complete task) |
| **Localization** | English, Spanish, German, French (using `flutter_localizations` + ARB files) |

**Exit Criteria:** App is production-ready for public launch with a polished, accessible, and performant experience across all 5 target platforms.

---

## 6. Appendices

### 6.1 Firestore Data Model (Collections)

```
users/
  {userId}/
    ├── profile: { displayName, email, timezone, hemisphere, coordinates }
    ├── settings: { notificationTime, temperatureUnit, language }
    │
    ├── locations/ (subcollection)
    │     {locationId}: { ...LocationModel }
    │
    ├── plants/ (subcollection)
    │     {plantId}: { ...PlantModel }
    │       ├── photos/ (subcollection)
    │       │     {photoId}: { ...PhotoModel }
    │       ├── healthLog/ (subcollection)
    │       │     {logId}: { ...HealthLogEntry }
    │       └── careHistory/ (subcollection)
    │             {historyId}: { ...CareHistoryEntry }
    │
    └── tasks/ (subcollection — denormalized for query performance)
          {taskId}: { plantId, plantNickname, taskType, scheduledDate, completed, ... }
```

**Why subcollections for tasks?** A top-level `tasks` subcollection under the user allows efficient queries like "get all tasks due today" without reading every plant document. This is critical for the dashboard and notification Cloud Function.

### 6.2 Firebase Security Rules (Summary)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Each user can only read/write their own data tree. No cross-user access is needed for the MVP.

### 6.3 Key Dependencies (pubspec.yaml)

```yaml
dependencies:
  flutter:
    sdk: flutter
  # Firebase
  firebase_core: ^3.0.0
  firebase_auth: ^5.0.0
  cloud_firestore: ^5.0.0
  firebase_storage: ^12.0.0
  firebase_messaging: ^15.0.0
  # State Management
  flutter_riverpod: ^2.5.0
  riverpod_annotation: ^2.3.0
  # Routing
  go_router: ^14.0.0
  # Networking
  dio: ^5.4.0
  # Image
  image_picker: ^1.0.0
  image_cropper: ^7.0.0
  cached_network_image: ^3.3.0
  # UI
  flutter_local_notifications: ^17.0.0
  table_calendar: ^3.1.0
  shimmer: ^3.0.0
  # Utilities
  freezed_annotation: ^2.4.0
  json_annotation: ^4.9.0
  uuid: ^4.3.0
  intl: ^0.19.0
  equatable: ^2.0.0
  connectivity_plus: ^6.0.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  build_runner: ^2.4.0
  freezed: ^2.5.0
  json_serializable: ^6.8.0
  riverpod_generator: ^2.4.0
  mockito: ^5.4.0
  flutter_lints: ^4.0.0
```

### 6.4 Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| **Cold start time** | < 2 seconds on mid-range devices |
| **API response display** | < 3 seconds for plant identification results |
| **Offline capability** | All CRUD operations must work offline; sync on reconnect |
| **App size** | < 30 MB (Android APK), < 50 MB (iOS IPA) |
| **Battery** | Background notification checks must not drain > 2% battery/day |
| **Data privacy** | Photos stored in user-scoped Firebase Storage paths; no cross-user access |
| **Uptime (backend)** | 99.9% (Firebase SLA) |
