import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class HistoryItem {
  final String id;
  final String title;
  final String type; // 'presentation', 'cv', 'document'
  final String filePath;
  final String createdAt; // ISO 8601 string
  final String? docType;
  final String emoji;

  HistoryItem({
    required this.id,
    required this.title,
    required this.type,
    required this.filePath,
    required this.createdAt,
    this.docType,
    this.emoji = '📄',
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'type': type,
        'filePath': filePath,
        'createdAt': createdAt,
        'docType': docType,
        'emoji': emoji,
      };

  factory HistoryItem.fromJson(Map<String, dynamic> json) => HistoryItem(
        id: (json['id'] as String?) ?? '',
        title: (json['title'] as String?) ?? '',
        type: (json['type'] as String?) ?? 'document',
        filePath: (json['filePath'] as String?) ?? '',
        createdAt: (json['createdAt'] as String?) ?? '',
        docType: json['docType'] as String?,
        emoji: (json['emoji'] as String?) ?? '📄',
      );
}

class HistoryService {
  static const _key = 'sg_history_v2';
  static const _maxItems = 20;

  static Future<List<HistoryItem>> getHistory() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getStringList(_key) ?? [];
    final items = <HistoryItem>[];
    for (final s in raw) {
      try {
        items.add(HistoryItem.fromJson(jsonDecode(s) as Map<String, dynamic>));
      } catch (_) {}
    }
    return items;
  }

  static Future<void> addItem(HistoryItem item) async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getStringList(_key) ?? [];

    // Remove any duplicate by filePath
    final filtered = raw.where((s) {
      try {
        final m = jsonDecode(s) as Map<String, dynamic>;
        return m['filePath'] != item.filePath;
      } catch (_) {
        return true;
      }
    }).toList();

    filtered.insert(0, jsonEncode(item.toJson()));

    if (filtered.length > _maxItems) {
      filtered.removeRange(_maxItems, filtered.length);
    }

    await prefs.setStringList(_key, filtered);
  }

  static Future<void> clearHistory() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_key);
  }

  // Helper: emoji by doc type
  static String emojiForDocType(String? docType) {
    const map = {
      'cover_letter': '📨',
      'business_proposal': '💼',
      'meeting_minutes': '📝',
      'business_plan': '📈',
      'assignment': '📚',
      'project_report': '🗂️',
      'email': '✉️',
      'announcement': '📢',
      'report': '📊',
      'proposal': '💡',
      'letter': '📜',
      'summary': '📑',
      'plan': '📅',
      'article': '📰',
    };
    return map[docType] ?? '📄';
  }
}
