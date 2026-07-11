import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import '../../widgets/loading_overlay.dart';
import 'presentation_result_screen.dart';

class PresentationFormScreen extends StatefulWidget {
  const PresentationFormScreen({super.key});

  @override
  State<PresentationFormScreen> createState() => _PresentationFormScreenState();
}

class _PresentationFormScreenState extends State<PresentationFormScreen> {
  final _topicCtrl = TextEditingController();
  String _style = 'professional';
  int _slideCount = 8;
  bool _loading = false;

  final _styles = [
    {'key': 'professional', 'label': 'Professional', 'emoji': '💼'},
    {'key': 'creative', 'label': 'Creative', 'emoji': '🎨'},
    {'key': 'minimal', 'label': 'Minimal', 'emoji': '⬜'},
    {'key': 'academic', 'label': 'Academic', 'emoji': '🎓'},
  ];

  Future<void> _generate() async {
    final topic = _topicCtrl.text.trim();
    if (topic.isEmpty) {
      _showSnack('Please enter a topic');
      return;
    }
    setState(() => _loading = true);
    try {
      final filePath = await ApiService.generatePresentation(
        topic: topic,
        style: _style,
        slideCount: _slideCount,
      );
      if (!mounted) return;
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (_) => PresentationResultScreen(
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
            title: const Text('Presentation Maker'),
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
                      colors: [Color(0xFF6366F1), Color(0xFF8B5CF6)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(18),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      Icon(Icons.slideshow_rounded,
                          color: Colors.white, size: 32),
                      SizedBox(height: 10),
                      Text(
                        'AI Presentation Maker',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      SizedBox(height: 4),
                      Text(
                        'Enter your topic and we\'ll build a complete PPTX file with slides, bullets, and speaker notes',
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

                _label('Presentation Topic'),
                const SizedBox(height: 8),
                TextField(
                  controller: _topicCtrl,
                  maxLines: 3,
                  decoration: const InputDecoration(
                    hintText:
                        'e.g. "The Future of Electric Vehicles" or "Marketing Strategy for 2025"',
                    hintStyle: TextStyle(fontSize: 13),
                  ),
                ),

                const SizedBox(height: 20),
                _label('Design Style'),
                const SizedBox(height: 10),
                Wrap(
                  spacing: 10,
                  runSpacing: 10,
                  children: _styles.map((s) {
                    final selected = _style == s['key'];
                    return GestureDetector(
                      onTap: () => setState(() => _style = s['key']!),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 10),
                        decoration: BoxDecoration(
                          color: selected
                              ? const Color(0xFF6366F1)
                              : Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: selected
                                ? const Color(0xFF6366F1)
                                : const Color(0xFFE2E8F0),
                            width: 2,
                          ),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(s['emoji']!,
                                style: const TextStyle(fontSize: 16)),
                            const SizedBox(width: 8),
                            Text(
                              s['label']!,
                              style: TextStyle(
                                color: selected
                                    ? Colors.white
                                    : const Color(0xFF1E1B4B),
                                fontWeight: FontWeight.w600,
                                fontSize: 13,
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  }).toList(),
                ),

                const SizedBox(height: 20),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    _label('Number of Slides'),
                    Text(
                      '$_slideCount slides',
                      style: const TextStyle(
                        color: Color(0xFF6366F1),
                        fontWeight: FontWeight.w700,
                        fontSize: 14,
                      ),
                    ),
                  ],
                ),
                Slider(
                  value: _slideCount.toDouble(),
                  min: 5,
                  max: 20,
                  divisions: 15,
                  activeColor: const Color(0xFF6366F1),
                  inactiveColor: const Color(0xFFE0E7FF),
                  onChanged: (v) => setState(() => _slideCount = v.round()),
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: const [
                    Text('5', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11)),
                    Text('20', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11)),
                  ],
                ),

                const SizedBox(height: 32),
                ElevatedButton.icon(
                  onPressed: _loading ? null : _generate,
                  icon: const Icon(Icons.auto_awesome),
                  label: const Text('Generate Presentation'),
                ),
                const SizedBox(height: 12),
                const Center(
                  child: Text(
                    '⚡ Powered by Groq AI — usually ready in under 30s',
                    style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
                  ),
                ),
                const SizedBox(height: 40),
              ],
            ),
          ),
        ),
        if (_loading)
          const LoadingOverlay(
            message: 'AI is crafting your presentation...',
            color: Color(0xFF6366F1),
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
