import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import '../../widgets/loading_overlay.dart';
import 'document_result_screen.dart';

class DocumentFormScreen extends StatefulWidget {
  const DocumentFormScreen({super.key});

  @override
  State<DocumentFormScreen> createState() => _DocumentFormScreenState();
}

class _DocumentFormScreenState extends State<DocumentFormScreen> {
  final _topicCtrl = TextEditingController();
  String _docType = 'report';
  String _length = 'medium';
  bool _loading = false;

  final _docTypes = [
    {'key': 'report', 'label': 'Business Report', 'emoji': '📊'},
    {'key': 'proposal', 'label': 'Proposal', 'emoji': '💡'},
    {'key': 'letter', 'label': 'Letter', 'emoji': '✉️'},
    {'key': 'summary', 'label': 'Executive Summary', 'emoji': '📋'},
    {'key': 'plan', 'label': 'Project Plan', 'emoji': '📅'},
    {'key': 'article', 'label': 'Article', 'emoji': '📰'},
  ];

  final _lengths = [
    {'key': 'short', 'label': 'Short', 'desc': '~500 words'},
    {'key': 'medium', 'label': 'Medium', 'desc': '~1000 words'},
    {'key': 'long', 'label': 'Long', 'desc': '~2000 words'},
  ];

  Future<void> _generate() async {
    final topic = _topicCtrl.text.trim();
    if (topic.isEmpty) {
      _showSnack('Please enter a topic');
      return;
    }
    setState(() => _loading = true);
    try {
      final filePath = await ApiService.generateDocument(
        topic: topic,
        docType: _docType,
        length: _length,
      );
      if (!mounted) return;
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (_) => DocumentResultScreen(
            topic: topic,
            filePath: filePath,
          ),
        ),
      );
    } catch (e) {
      if (mounted) _showSnack('Error: $e');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _showSnack(String msg) {
    ScaffoldMessenger.of(context)
        .showSnackBar(SnackBar(content: Text(msg)));
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Scaffold(
          backgroundColor: const Color(0xFFF8FAFC),
          appBar: AppBar(
            title: const Text('Document Generator'),
            backgroundColor: Colors.white,
          ),
          body: SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header card
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFFEA580C), Color(0xFFD97706)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(18),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      Icon(Icons.article_outlined,
                          color: Colors.white, size: 32),
                      SizedBox(height: 10),
                      Text(
                        'AI Document Generator',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      SizedBox(height: 4),
                      Text(
                        'Tell us what document you need — AI will generate a structured, professional Word file',
                        style: TextStyle(
                          color: Colors.white70,
                          fontSize: 12,
                          height: 1.5,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                _label('Topic / Subject'),
                const SizedBox(height: 8),
                TextField(
                  controller: _topicCtrl,
                  maxLines: 3,
                  decoration: const InputDecoration(
                    hintText:
                        'e.g. "Q3 Sales Performance Report" or "Business Proposal for New Product Launch"',
                    hintStyle: TextStyle(fontSize: 13),
                  ),
                ),

                const SizedBox(height: 20),
                _label('Document Type'),
                const SizedBox(height: 10),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: _docTypes.map((t) {
                    final selected = _docType == t['key'];
                    return GestureDetector(
                      onTap: () => setState(() => _docType = t['key']!),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        padding: const EdgeInsets.symmetric(
                            horizontal: 14, vertical: 9),
                        decoration: BoxDecoration(
                          color: selected
                              ? const Color(0xFFEA580C)
                              : Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: selected
                                ? const Color(0xFFEA580C)
                                : const Color(0xFFE2E8F0),
                            width: 2,
                          ),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(t['emoji']!,
                                style: const TextStyle(fontSize: 14)),
                            const SizedBox(width: 6),
                            Text(
                              t['label']!,
                              style: TextStyle(
                                color: selected
                                    ? Colors.white
                                    : const Color(0xFF1E1B4B),
                                fontWeight: FontWeight.w600,
                                fontSize: 12,
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  }).toList(),
                ),

                const SizedBox(height: 20),
                _label('Document Length'),
                const SizedBox(height: 10),
                Row(
                  children: _lengths.map((l) {
                    final selected = _length == l['key'];
                    return Expanded(
                      child: GestureDetector(
                        onTap: () => setState(() => _length = l['key']!),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          margin: EdgeInsets.only(
                              right: l['key'] != 'long' ? 8 : 0),
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          decoration: BoxDecoration(
                            color: selected
                                ? const Color(0xFFEA580C)
                                : Colors.white,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: selected
                                  ? const Color(0xFFEA580C)
                                  : const Color(0xFFE2E8F0),
                              width: 2,
                            ),
                          ),
                          child: Column(
                            children: [
                              Text(
                                l['label']!,
                                style: TextStyle(
                                  color: selected
                                      ? Colors.white
                                      : const Color(0xFF1E1B4B),
                                  fontWeight: FontWeight.w700,
                                  fontSize: 13,
                                ),
                              ),
                              Text(
                                l['desc']!,
                                style: TextStyle(
                                  color: selected
                                      ? Colors.white70
                                      : const Color(0xFF94A3B8),
                                  fontSize: 10,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),

                const SizedBox(height: 32),
                ElevatedButton.icon(
                  onPressed: _loading ? null : _generate,
                  icon: const Icon(Icons.auto_awesome),
                  label: const Text('Generate Document'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFEA580C),
                  ),
                ),
                const SizedBox(height: 40),
              ],
            ),
          ),
        ),
        if (_loading)
          const LoadingOverlay(
            message: 'AI is writing your document...',
            color: Color(0xFFEA580C),
          ),
      ],
    );
  }

  Widget _label(String text) => Text(
        text,
        style: const TextStyle(
          color: Color(0xFF1E1B4B),
          fontWeight: FontWeight.w600,
          fontSize: 14,
        ),
      );

  @override
  void dispose() {
    _topicCtrl.dispose();
    super.dispose();
  }
}
