import 'package:shared_preferences/shared_preferences.dart';

class UsageService {
  static const _keyCount = 'daily_count';
  static const _keyDate  = 'daily_date';
  static const _keyPro   = 'is_pro';
  static const freeLimit = 5;

  static Future<bool> isPro() async {
    final p = await SharedPreferences.getInstance();
    return p.getBool(_keyPro) ?? false;
  }

  static Future<int> todayCount() async {
    final p = await SharedPreferences.getInstance();
    final today = _today();
    if ((p.getString(_keyDate) ?? '') != today) return 0;
    return p.getInt(_keyCount) ?? 0;
  }

  static Future<bool> canGenerate() async {
    if (await isPro()) return true;
    return (await todayCount()) < freeLimit;
  }

  static Future<int> remaining() async {
    if (await isPro()) return 9999;
    final used = await todayCount();
    return (freeLimit - used).clamp(0, freeLimit);
  }

  static Future<void> recordGeneration() async {
    final p = await SharedPreferences.getInstance();
    final today = _today();
    final savedDate = p.getString(_keyDate) ?? '';
    final count = savedDate == today ? (p.getInt(_keyCount) ?? 0) : 0;
    await p.setString(_keyDate, today);
    await p.setInt(_keyCount, count + 1);
  }

  static Future<void> unlockPro() async {
    final p = await SharedPreferences.getInstance();
    await p.setBool(_keyPro, true);
  }

  // For testing only — remove before shipping
  static Future<void> resetUsage() async {
    final p = await SharedPreferences.getInstance();
    await p.remove(_keyCount);
    await p.remove(_keyDate);
    await p.remove(_keyPro);
  }

  static String _today() =>
      DateTime.now().toIso8601String().substring(0, 10);
}
