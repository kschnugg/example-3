import 'package:equatable/equatable.dart';

// ============================================================================
// PlantMaster — Plant Domain Entity
// ============================================================================
// This is the core domain entity representing a plant in the user's inventory.
// It is framework-agnostic and contains no Firebase or serialization logic.
// The corresponding PlantModel (data layer) handles Firestore conversion.
// ============================================================================

/// Top-level entity representing a single plant owned by a user.
class Plant extends Equatable {
  final String id;
  final String userId;
  final String locationId;
  final String nickname;
  final SpeciesInfo species;
  final CareProfile careProfile;
  final double? potSizeCm;
  final DateTime dateAcquired;
  final List<PlantPhoto> photos;
  final List<HealthLogEntry> healthLog;
  final List<CareHistoryEntry> careHistory;
  final String? notes;
  final bool isArchived;
  final DateTime createdAt;
  final DateTime updatedAt;

  const Plant({
    required this.id,
    required this.userId,
    required this.locationId,
    required this.nickname,
    required this.species,
    required this.careProfile,
    this.potSizeCm,
    required this.dateAcquired,
    this.photos = const [],
    this.healthLog = const [],
    this.careHistory = const [],
    this.notes,
    this.isArchived = false,
    required this.createdAt,
    required this.updatedAt,
  });

  /// Returns the most recent photo of type [PlantPhotoType.general], or null.
  PlantPhoto? get primaryPhoto {
    final generalPhotos =
        photos.where((p) => p.type == PlantPhotoType.general).toList();
    if (generalPhotos.isEmpty) return null;
    generalPhotos.sort((a, b) => b.takenAt.compareTo(a.takenAt));
    return generalPhotos.first;
  }

  /// Returns the latest health status from the health log, or 'healthy'.
  String get currentHealthStatus {
    if (healthLog.isEmpty) return 'healthy';
    final sorted = List<HealthLogEntry>.from(healthLog)
      ..sort((a, b) => b.date.compareTo(a.date));
    return sorted.first.status;
  }

  /// Returns the date of the last completed watering, or null if never watered.
  DateTime? get lastWateredDate {
    final wateringEntries = careHistory
        .where((e) => e.taskType == CareTaskType.water && !e.skipped)
        .toList();
    if (wateringEntries.isEmpty) return null;
    wateringEntries.sort((a, b) => b.completedDate.compareTo(a.completedDate));
    return wateringEntries.first.completedDate;
  }

  Plant copyWith({
    String? id,
    String? userId,
    String? locationId,
    String? nickname,
    SpeciesInfo? species,
    CareProfile? careProfile,
    double? potSizeCm,
    DateTime? dateAcquired,
    List<PlantPhoto>? photos,
    List<HealthLogEntry>? healthLog,
    List<CareHistoryEntry>? careHistory,
    String? notes,
    bool? isArchived,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Plant(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      locationId: locationId ?? this.locationId,
      nickname: nickname ?? this.nickname,
      species: species ?? this.species,
      careProfile: careProfile ?? this.careProfile,
      potSizeCm: potSizeCm ?? this.potSizeCm,
      dateAcquired: dateAcquired ?? this.dateAcquired,
      photos: photos ?? this.photos,
      healthLog: healthLog ?? this.healthLog,
      careHistory: careHistory ?? this.careHistory,
      notes: notes ?? this.notes,
      isArchived: isArchived ?? this.isArchived,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  List<Object?> get props => [id, userId, locationId, nickname, updatedAt];
}

// ============================================================================
// Species Information
// ============================================================================

class SpeciesInfo extends Equatable {
  final String commonName;
  final String scientificName;
  final String? family;
  final double? identificationConfidence;
  final IdentificationSource? identifiedVia;

  const SpeciesInfo({
    required this.commonName,
    required this.scientificName,
    this.family,
    this.identificationConfidence,
    this.identifiedVia,
  });

  @override
  List<Object?> get props => [commonName, scientificName];
}

enum IdentificationSource { plantIdApi, manual, search }

// ============================================================================
// Care Profile — species-specific care requirements
// ============================================================================

class CareProfile extends Equatable {
  final LightRequirement lightRequirement;
  final int waterFrequencyDays;
  final HumidityPreference humidityPreference;
  final String? soilType;
  final int? fertilizerFrequencyWeeks;
  final String? fertilizerType;
  final int? pruningFrequencyWeeks;
  final int? mistingFrequencyDays;
  final ToxicityInfo toxicity;
  final TemperatureRange? temperatureRange;
  final List<String> bestUses;

  const CareProfile({
    required this.lightRequirement,
    required this.waterFrequencyDays,
    this.humidityPreference = HumidityPreference.medium,
    this.soilType,
    this.fertilizerFrequencyWeeks,
    this.fertilizerType,
    this.pruningFrequencyWeeks,
    this.mistingFrequencyDays,
    this.toxicity = const ToxicityInfo(),
    this.temperatureRange,
    this.bestUses = const [],
  });

  @override
  List<Object?> get props => [lightRequirement, waterFrequencyDays];
}

enum LightRequirement { directSun, brightIndirect, medium, low }

enum HumidityPreference { low, medium, high }

class ToxicityInfo extends Equatable {
  final bool isToxic;
  final List<String> toxicTo; // e.g., ['cats', 'dogs', 'children']

  const ToxicityInfo({
    this.isToxic = false,
    this.toxicTo = const [],
  });

  @override
  List<Object?> get props => [isToxic, toxicTo];
}

class TemperatureRange extends Equatable {
  final double minCelsius;
  final double maxCelsius;

  const TemperatureRange({
    required this.minCelsius,
    required this.maxCelsius,
  });

  bool isWithinRange(double currentTempCelsius) {
    return currentTempCelsius >= minCelsius &&
        currentTempCelsius <= maxCelsius;
  }

  @override
  List<Object?> get props => [minCelsius, maxCelsius];
}

// ============================================================================
// Plant Photos
// ============================================================================

class PlantPhoto extends Equatable {
  final String id;
  final String url;
  final String? caption;
  final DateTime takenAt;
  final PlantPhotoType type;

  const PlantPhoto({
    required this.id,
    required this.url,
    this.caption,
    required this.takenAt,
    required this.type,
  });

  @override
  List<Object?> get props => [id];
}

enum PlantPhotoType { general, diagnosis, progress }

// ============================================================================
// Health Log — records of diagnoses and health observations
// ============================================================================

class HealthLogEntry extends Equatable {
  final String id;
  final DateTime date;
  final String status; // 'healthy', 'needs_attention', 'critical'
  final String? diagnosis;
  final String? treatment;
  final String? photoId;

  const HealthLogEntry({
    required this.id,
    required this.date,
    required this.status,
    this.diagnosis,
    this.treatment,
    this.photoId,
  });

  @override
  List<Object?> get props => [id, date];
}

// ============================================================================
// Care History — completed or skipped care tasks
// ============================================================================

class CareHistoryEntry extends Equatable {
  final String id;
  final CareTaskType taskType;
  final DateTime scheduledDate;
  final DateTime completedDate;
  final bool skipped;
  final String? notes;

  const CareHistoryEntry({
    required this.id,
    required this.taskType,
    required this.scheduledDate,
    required this.completedDate,
    this.skipped = false,
    this.notes,
  });

  @override
  List<Object?> get props => [id, taskType, scheduledDate];
}

enum CareTaskType { water, fertilize, prune, mist, repot }
