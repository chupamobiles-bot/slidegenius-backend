import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:path_provider/path_provider.dart';
import '../models/cv_model.dart';

class ApiService {
  // Replace with your Render.com URL after deployment
  static const String _baseUrl = 'https://slidegenius-backend.vercel.app';

  static Future<String> generatePresentation({
    required String topic,
    required String style,
    required int slideCount,
    String language = 'English',
  }) async {
    final uri = Uri.parse('$_baseUrl/generate/presentation');
    final response = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'topic': topic,
        'style': style,
        'slideCount': slideCount,
        'language': language,
      }),
    ).timeout(const Duration(seconds: 120));
    if (response.statusCode == 200) {
      return _saveFile(response.bodyBytes, '${_slug(topic)}.pptx');
    }
    throw Exception('Server error ${response.statusCode}: ${response.body}');
  }

  static Future<String> generateDocument({
    required String topic,
    required String docType,
    required String length,
    String language = 'English',
    String tone = 'professional',
  }) async {
    final uri = Uri.parse('$_baseUrl/generate/document');
    final response = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'topic': topic,
        'docType': docType,
        'length': length,
        'language': language,
        'tone': tone,
      }),
    ).timeout(const Duration(seconds: 120));
    if (response.statusCode == 200) {
      return _saveFile(response.bodyBytes, '${_slug(topic)}.docx');
    }
    throw Exception('Server error ${response.statusCode}: ${response.body}');
  }

  static Future<String> rewriteDocument({
    required String topic,
    required String docType,
    required String tone,
    String length = 'medium',
    String language = 'English',
  }) async {
    final uri = Uri.parse('$_baseUrl/rewrite/document');
    final response = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'topic': topic,
        'docType': docType,
        'length': length,
        'tone': tone,
        'language': language,
      }),
    ).timeout(const Duration(seconds: 120));
    if (response.statusCode == 200) {
      return _saveFile(response.bodyBytes, '${_slug(topic)}_$tone.docx');
    }
    throw Exception('Server error ${response.statusCode}: ${response.body}');
  }

  static Future<CvModel> enhanceCv(CvModel cv) async {
    final uri = Uri.parse('$_baseUrl/enhance/cv');
    final cvMap = {
      'fullName': cv.fullName,
      'title': cv.title,
      'summary': cv.summary,
      'experience': cv.experience
          .map((e) => {
                'company': e.company,
                'role': e.role,
                'startDate': e.startDate,
                'endDate': e.endDate,
                'description': e.description,
              })
          .toList(),
      'education': cv.education
          .map((e) => {
                'institution': e.institution,
                'degree': e.degree,
                'field': e.field,
                'year': e.year,
              })
          .toList(),
      'skills': cv.skills,
    };

    final response = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'cv': cvMap}),
    ).timeout(const Duration(seconds: 90));

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body) as Map<String, dynamic>;
      final enhanced = data['enhanced'] as Map<String, dynamic>;
      final expList = (enhanced['experience'] as List?) ?? [];
      return CvModel(
        fullName: cv.fullName,
        title: cv.title,
        email: cv.email,
        phone: cv.phone,
        location: cv.location,
        linkedin: cv.linkedin,
        summary: (enhanced['summary'] as String?) ?? cv.summary,
        experience: expList.asMap().entries.map((entry) {
          final i = entry.key;
          final e = entry.value as Map<String, dynamic>;
          final orig = i < cv.experience.length
              ? cv.experience[i]
              : WorkExperience();
          return WorkExperience(
            company: (e['company'] as String?) ?? orig.company,
            role: (e['role'] as String?) ?? orig.role,
            startDate: (e['startDate'] as String?) ?? orig.startDate,
            endDate: (e['endDate'] as String?) ?? orig.endDate,
            description: (e['description'] as String?) ?? orig.description,
          );
        }).toList(),
        education: cv.education,
        skills: cv.skills,
      );
    }
    throw Exception('Enhancement failed: ${response.statusCode}');
  }

  static Future<Map<String, dynamic>> parseLinkedInProfile(String profileText) async {
    final uri = Uri.parse('$_baseUrl/enhance/cv/parse-profile');
    final response = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'profileText': profileText}),
    ).timeout(const Duration(seconds: 60));
    if (response.statusCode == 200) {
      final body = jsonDecode(response.body) as Map<String, dynamic>;
      return body['data'] as Map<String, dynamic>;
    }
    throw Exception('Parse failed ${response.statusCode}: ${response.body}');
  }

  static Future<String> _saveFile(List<int> bytes, String filename) async {
    final dir = await getDownloadsDirectory() ??
        await getApplicationDocumentsDirectory();
    final file = File('${dir.path}/$filename');
    await file.writeAsBytes(bytes);
    return file.path;
  }

  static String _esc(String s) =>
      s.replaceAll('\\', '\\\\').replaceAll('"', '\\"');

  static String _slug(String s) {
    final clean = s.toLowerCase().replaceAll(RegExp(r'[^a-z0-9]+'), '_');
    return clean.length > 30 ? clean.substring(0, 30) : clean;
  }
}
