import 'dart:math';

import 'package:plantmaster/features/plants/domain/entities/plant.dart';

// ============================================================================
// PlantMaster — Calculate Next Watering Date Use Case
// ============================================================================
// Determines when a plant should next be watered based on its species care
// profile, the environment it lives in, the current season, pot size, and
// (for outdoor plants) recent rainfall data.
//
// See PRD Section 2.3 for the full algorithm specification and worked example.
// ============================================================================

/// Represents the location context needed for watering calculation.
/// This avoids a direct dependency on the full Location entity.
class WateringContext {
  final String environmentType; // 'indoor', 'outdoor', 'greenhouse'
  final String lightLevel; // 'low', 'medium', 'bright_indirect', 'direct_sun'

  const WateringContext({
    required this.environmentType,
    required this.lightLevel,
  });
}

/// Represents the user's geographic context for season determination.
class UserGeoContext {
  final String hemisphere; // 'north' or 'south'
  final double? latitude;
  final double? longitude;

  const UserGeoContext({
    required this.hemisphere,
    this.latitude,
    this.longitude,
  });
}

/// The result of a watering calculation.
class WateringCalculationResult {
  final DateTime nextWateringDate;
  final int adjustedIntervalDays;
  final Map<String, double> appliedMultipliers;

  const WateringCalculationResult({
    required this.nextWateringDate,
    required this.adjustedIntervalDays,
    required this.appliedMultipliers,
  });
}

/// Abstract interface for fetching recent rainfall data.
/// Implemented by the data layer (e.g., Open-Meteo API datasource).
abstract class RainfallDataSource {
  /// Returns total rainfall in mm over the past [days] at the given coordinates.
  Future<double> getRecentRainfallMm({
    required double latitude,
    required double longitude,
    required int days,
  });
}

// ============================================================================
// Multiplier Tables
// ============================================================================

enum Season { spring, summer, autumn, winter }

const Map<Season, double> seasonMultipliers = {
  Season.summer: 0.75, // Active growth, high evaporation — water more often
  Season.spring: 0.85, // Growth beginning — moderately more frequent
  Season.autumn: 1.15, // Growth slowing — less frequent
  Season.winter: 1.40, // Dormancy — much less frequent
};

const Map<String, double> lightMultipliers = {
  'direct_sun': 0.85,
  'bright_indirect': 1.00,
  'medium': 1.10,
  'low': 1.25,
};

const Map<String, double> environmentMultipliers = {
  'outdoor': 0.85,
  'greenhouse': 0.90,
  'indoor': 1.00,
};

// ============================================================================
// Use Case
// ============================================================================

class CalculateNextWatering {
  final RainfallDataSource? rainfallDataSource;

  const CalculateNextWatering({this.rainfallDataSource});

  /// Calculates the next watering date for the given [plant] in the given
  /// [context] (location environment) for the given [user] (geographic info).
  ///
  /// [currentDate] is injectable for testability; defaults to now.
  /// [rainfallDataSource] is only consulted for outdoor plants.
  Future<WateringCalculationResult> execute({
    required Plant plant,
    required WateringContext context,
    required UserGeoContext user,
    DateTime? currentDate,
  }) async {
    final now = currentDate ?? DateTime.now();
    final appliedMultipliers = <String, double>{};

    // ── Step 1: Base interval from species care profile ──
    final int baseIntervalDays = plant.careProfile.waterFrequencyDays;

    // ── Step 2: Determine current season ──
    final season = _getSeason(now, user.hemisphere);
    final seasonMult = seasonMultipliers[season]!;
    appliedMultipliers['season'] = seasonMult;

    // ── Step 3: Look up environment multipliers ──
    final lightMult = lightMultipliers[context.lightLevel] ?? 1.0;
    appliedMultipliers['light'] = lightMult;

    final envMult = environmentMultipliers[context.environmentType] ?? 1.0;
    appliedMultipliers['environment'] = envMult;

    final potMult = _getPotSizeMultiplier(plant.potSizeCm);
    appliedMultipliers['potSize'] = potMult;

    // ── Step 4: Calculate adjusted interval ──
    double adjustedInterval =
        baseIntervalDays * seasonMult * lightMult * potMult * envMult;

    // ── Step 5: Rainfall adjustment for outdoor plants ──
    if (context.environmentType == 'outdoor' &&
        rainfallDataSource != null &&
        user.latitude != null &&
        user.longitude != null) {
      final recentRainfallMm = await rainfallDataSource!.getRecentRainfallMm(
        latitude: user.latitude!,
        longitude: user.longitude!,
        days: 3,
      );

      double rainfallMult = 1.0;
      if (recentRainfallMm > 10) {
        rainfallMult = 1.5; // Heavy rain — significantly delay watering
      } else if (recentRainfallMm > 5) {
        rainfallMult = 1.2; // Moderate rain — slightly delay
      }

      adjustedInterval *= rainfallMult;
      appliedMultipliers['rainfall'] = rainfallMult;
    }

    // ── Step 6: Clamp to reasonable bounds ──
    adjustedInterval = adjustedInterval.clamp(1.0, 30.0);

    // ── Step 7: Round and compute date ──
    final int roundedInterval = adjustedInterval.round();
    final DateTime? lastWatered = plant.lastWateredDate;

    DateTime nextDate;
    if (lastWatered == null) {
      // Never watered — water today
      nextDate = DateTime(now.year, now.month, now.day);
    } else {
      nextDate = DateTime(
        lastWatered.year,
        lastWatered.month,
        lastWatered.day,
      ).add(Duration(days: roundedInterval));

      // If the calculated date is in the past, set it to today
      final today = DateTime(now.year, now.month, now.day);
      if (nextDate.isBefore(today)) {
        nextDate = today;
      }
    }

    return WateringCalculationResult(
      nextWateringDate: nextDate,
      adjustedIntervalDays: roundedInterval,
      appliedMultipliers: appliedMultipliers,
    );
  }

  /// Determines the astronomical season based on the month and hemisphere.
  ///
  /// Northern hemisphere: Mar–May = Spring, Jun–Aug = Summer, etc.
  /// Southern hemisphere: Seasons are inverted.
  Season _getSeason(DateTime date, String hemisphere) {
    final month = date.month;

    Season northernSeason;
    if (month >= 3 && month <= 5) {
      northernSeason = Season.spring;
    } else if (month >= 6 && month <= 8) {
      northernSeason = Season.summer;
    } else if (month >= 9 && month <= 11) {
      northernSeason = Season.autumn;
    } else {
      northernSeason = Season.winter;
    }

    if (hemisphere.toLowerCase() == 'south') {
      // Invert: northern summer = southern winter, etc.
      const inversion = {
        Season.spring: Season.autumn,
        Season.summer: Season.winter,
        Season.autumn: Season.spring,
        Season.winter: Season.summer,
      };
      return inversion[northernSeason]!;
    }

    return northernSeason;
  }

  /// Returns a watering multiplier based on pot diameter.
  ///
  /// Larger pots retain moisture longer, so watering interval increases.
  /// Smaller pots dry out faster, so watering interval decreases.
  double _getPotSizeMultiplier(double? potSizeCm) {
    if (potSizeCm == null) return 1.0; // Default if pot size not provided

    if (potSizeCm < 10) return 0.85;
    if (potSizeCm <= 20) return 1.00;
    if (potSizeCm <= 35) return 1.10;
    return 1.20;
  }
}
