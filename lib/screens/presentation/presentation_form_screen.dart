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
  String _style = 'corporate';
  int _slideCount = 8;
  bool _loading = false;

  final List<Map<String, dynamic>> _templates = [
    {
      'key': 'corporate',
      'name': 'Corporate Navy',
      'desc': 'Professional • Sidebar layout',
      'bg': const Color(0xFF0D1B4B),
      'accent': const Color(0xFF4A8FE7),
      'header': const Color(0xFF1A3A8F),
    },
    {
      'key': 'sunset',
      'name': 'Sunset Fire',
      'desc': 'Energetic • Diagonal accents',
      'bg': const Color(0xFF7C1D06),
      'accent': const Color(0xFFF97316),
      'header': const Color(0xFFC2410C),
    },
    {
      'key': 'forest',
      'name': 'Emerald Elite',
      'desc': 'Premium • Gold accents',
      'bg': const Color(0xFF052E16),
      'accent': const Color(0xFF4ADE80),
      'header': const Color(0xFF14532D),
    },
    {
      'key': 'royal',
      'name': 'Royal Gold',
      'desc': 'Elegant • Luxury style',
      'bg': const Color(0xFF2E1065),
      'accent': const Color(0xFFD4AF37),
      'header': const Color(0xFF4C1D95),
    },
    {
      'key': 'minimal',
      'name': 'Minimal Clean',
      'desc': 'Sleek • Maximum clarity',
      'bg': const Color(0xFF18181B),
      'accent': const Color(0xFF6366F1),
      'header': const Color(0xFF27272A),
    },
    {
      'key': 'bold',
      'name': 'Bold Impact',
      'desc': 'Powerful • High contrast',
      'bg': const Color(0xFF3F0808),
      'accent': const Color(0xFFF87171),
      'header': const Color(0xFF991B1B),
    },
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
          builder: (_) => PresentationResultScreen(topic: topic, filePath: filePath),
        ),
      );
    } catch (e) {
      if (mounted) _showSnack('Error: $e');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _showSnack(String msg) =>
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));

  @override
  Widget build(BuildContext context) {
    return Stack(children: [
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
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: const [
                  Icon(Icons.slideshow_rounded, color: Colors.white, size: 32),
                  SizedBox(height: 10),
                  Text('AI Presentation Maker',
                      style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w700)),
                  SizedBox(height: 4),
                  Text(
                    'Pick a template, enter your topic — AI creates detailed slides with stats, quotes, highlights & speaker notes',
                    style: TextStyle(color: Colors.white70, fontSize: 12, height: 1.5),
                  ),
                ]),
              ),
              const SizedBox(height: 24),

              // Topic input
              _label('Presentation Topic'),
              const SizedBox(height: 8),
              TextField(
                controller: _topicCtrl,
                maxLines: 3,
                decoration: const InputDecoration(
                  hintText: 'e.g. "Future of Electric Vehicles" or "AI in Healthcare 2025"',
                  hintStyle: TextStyle(fontSize: 13),
                ),
              ),
              const SizedBox(height: 24),

              // Template picker
              _label('Choose Template'),
              const SizedBox(height: 4),
              const Text(
                '6 professional designs — each with unique layouts, color schemes & slide styles',
                style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
              ),
              const SizedBox(height: 14),
              GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                  childAspectRatio: 1.52,
                ),
                itemCount: _templates.length,
                itemBuilder: (ctx, i) => _TemplateCard(
                  template: _templates[i],
                  selected: _style == (_templates[i]['key'] as String),
                  onTap: () => setState(() => _style = _templates[i]['key'] as String),
                ),
              ),
              const SizedBox(height: 24),

              // Slide count
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _label('Number of Slides'),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFF6366F1).withOpacity(0.1),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      '$_slideCount slides',
                      style: const TextStyle(
                          color: Color(0xFF6366F1), fontWeight: FontWeight.w700, fontSize: 13),
                    ),
                  ),
                ],
              ),
              Slider(
                value: _slideCount.toDouble(),
                min: 5, max: 20, divisions: 15,
                activeColor: const Color(0xFF6366F1),
                inactiveColor: const Color(0xFFE0E7FF),
                onChanged: (v) => setState(() => _slideCount = v.round()),
              ),
              const Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('5 slides', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11)),
                  Text('20 slides', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11)),
                ],
              ),

              const SizedBox(height: 28),
              ElevatedButton.icon(
                onPressed: _loading ? null : _generate,
                icon: const Icon(Icons.auto_awesome),
                label: const Text('Generate Presentation'),
              ),
              const SizedBox(height: 12),
              const Center(
                child: Text(
                  '⚡ Powered by Groq AI • Usually ready in 20-40 seconds',
                  style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
                ),
              ),
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
      if (_loading)
        const LoadingOverlay(message: 'AI is crafting your slides...', color: Color(0xFF6366F1)),
    ]);
  }

  Widget _label(String text) => Text(
        text,
        style: const TextStyle(color: Color(0xFF1E1B4B), fontWeight: FontWeight.w600, fontSize: 14),
      );

  @override
  void dispose() {
    _topicCtrl.dispose();
    super.dispose();
  }
}

// ── Template Preview Card ──────────────────────────────────────────────────────
class _TemplateCard extends StatelessWidget {
  final Map<String, dynamic> template;
  final bool selected;
  final VoidCallback onTap;

  const _TemplateCard({required this.template, required this.selected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final bg     = template['bg']     as Color;
    final accent = template['accent'] as Color;
    final header = template['header'] as Color;

    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: selected ? accent : Colors.transparent,
            width: 2.5,
          ),
          boxShadow: [
            BoxShadow(
              color: selected ? accent.withOpacity(0.35) : Colors.black.withOpacity(0.08),
              blurRadius: selected ? 14 : 6,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(12),
          child: Stack(children: [
            // Mini slide preview
            Container(
              color: bg,
              child: Column(children: [
                // Header band
                Container(
                  height: 22,
                  color: header,
                  child: Row(children: [
                    Container(width: 5, color: accent),
                    const SizedBox(width: 5),
                    Expanded(
                      child: Container(
                        height: 7,
                        margin: const EdgeInsets.symmetric(vertical: 7.5),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.55),
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                  ]),
                ),
                // Content: mini bullet cards
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(6, 5, 6, 4),
                    child: Column(children: [
                      _miniCard(accent, 0.75),
                      const SizedBox(height: 3),
                      _miniCard(accent, 0.55),
                      const SizedBox(height: 3),
                      _miniCard(accent, 0.65),
                      const SizedBox(height: 3),
                      // Highlight bar
                      Container(
                        height: 8,
                        decoration: BoxDecoration(
                          color: accent.withOpacity(0.75),
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                    ]),
                  ),
                ),
                // Bottom accent strip
                Container(height: 3, color: accent),
              ]),
            ),

            // Name overlay at bottom
            Positioned(
              bottom: 0, left: 0, right: 0,
              child: Container(
                padding: const EdgeInsets.fromLTRB(8, 10, 8, 6),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [bg.withOpacity(0.0), bg.withOpacity(0.95)],
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                  ),
                ),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisSize: MainAxisSize.min, children: [
                  Text(
                    template['name'] as String,
                    style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w700),
                  ),
                  Text(
                    template['desc'] as String,
                    style: TextStyle(color: accent, fontSize: 8, height: 1.3),
                  ),
                ]),
              ),
            ),

            // Selected badge
            if (selected)
              Positioned(
                top: 6, right: 6,
                child: Container(
                  width: 20, height: 20,
                  decoration: BoxDecoration(color: accent, shape: BoxShape.circle),
                  child: const Icon(Icons.check_rounded, color: Colors.white, size: 13),
                ),
              ),
          ]),
        ),
      ),
    );
  }

  Widget _miniCard(Color accent, double textWidth) {
    return Row(children: [
      Container(width: 8, height: 9, color: accent.withOpacity(0.8)),
      const SizedBox(width: 3),
      Expanded(
        child: Container(
          height: 9,
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.12),
            borderRadius: BorderRadius.circular(1),
          ),
          child: FractionallySizedBox(
            alignment: Alignment.centerLeft,
            widthFactor: textWidth,
            child: Container(
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.28),
                borderRadius: BorderRadius.circular(1),
              ),
            ),
          ),
        ),
      ),
    ]);
  }
}
