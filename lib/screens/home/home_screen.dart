import 'package:flutter/material.dart';
import 'dart:math' as math;
import 'package:speech_to_text/speech_to_text.dart' as stt;
import 'package:permission_handler/permission_handler.dart';
import 'package:open_filex/open_filex.dart';
import '../../app/theme.dart';
import '../../services/history_service.dart';
import '../presentation/presentation_form_screen.dart';
import '../cv/cv_form_screen.dart';
import '../document/document_form_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});
  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> with TickerProviderStateMixin {
  final _inputCtrl = TextEditingController();
  late AnimationController _pulseCtrl, _floatCtrl;
  late Animation<double> _pulse, _float;
  final _speech = stt.SpeechToText();
  bool _isListening = false;
  List<HistoryItem> _recentFiles = [];
  bool _historyLoaded = false;

  static const _quickTemplates = [
    {'key': 'presentation',     'label': 'Slides',       'emoji': '📊'},
    {'key': 'cv',               'label': 'CV/Resume',    'emoji': '📄'},
    {'key': 'cover_letter',     'label': 'Cover Letter', 'emoji': '📨'},
    {'key': 'business_proposal','label': 'Proposal',     'emoji': '💼'},
    {'key': 'business_plan',    'label': 'Biz Plan',     'emoji': '📈'},
    {'key': 'report',           'label': 'Report',       'emoji': '📋'},
    {'key': 'assignment',       'label': 'Essay',        'emoji': '📚'},
    {'key': 'meeting_minutes',  'label': 'Minutes',      'emoji': '📝'},
    {'key': 'project_report',   'label': 'Project',      'emoji': '🗂️'},
    {'key': 'email',            'label': 'Email',        'emoji': '✉️'},
  ];

  @override
  void initState() {
    super.initState();
    _pulseCtrl = AnimationController(vsync: this, duration: const Duration(seconds: 3))..repeat(reverse: true);
    _floatCtrl = AnimationController(vsync: this, duration: const Duration(seconds: 4))..repeat(reverse: true);
    _pulse = Tween(begin: 0.95, end: 1.05).animate(CurvedAnimation(parent: _pulseCtrl, curve: Curves.easeInOut));
    _float = Tween(begin: -6.0, end: 6.0).animate(CurvedAnimation(parent: _floatCtrl, curve: Curves.easeInOut));
    _loadHistory();
  }

  @override
  void dispose() {
    _pulseCtrl.dispose();
    _floatCtrl.dispose();
    _inputCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadHistory() async {
    final items = await HistoryService.getHistory();
    if (mounted) setState(() { _recentFiles = items; _historyLoaded = true; });
  }

  Future<void> _toggleVoice() async {
    if (_isListening) {
      await _speech.stop();
      if (mounted) setState(() => _isListening = false);
      return;
    }
    final status = await Permission.microphone.request();
    if (!status.isGranted) return;
    final ok = await _speech.initialize(
      onStatus: (s) { if ((s == 'done' || s == 'notListening') && mounted) setState(() => _isListening = false); },
      onError:  (_) { if (mounted) setState(() => _isListening = false); },
    );
    if (ok && mounted) {
      setState(() => _isListening = true);
      await _speech.listen(
        onResult: (r) { if (mounted) setState(() => _inputCtrl.text = r.recognizedWords); },
        listenFor: const Duration(seconds: 30),
        pauseFor:  const Duration(seconds: 4),
      );
    }
  }

  void _openTemplate(String key) {
    final topic = _inputCtrl.text.trim();
    if (key == 'presentation') {
      Navigator.push(context, MaterialPageRoute(builder: (_) => PresentationFormScreen(initialTopic: topic)));
    } else if (key == 'cv') {
      Navigator.push(context, MaterialPageRoute(builder: (_) => const CvFormScreen()));
    } else {
      Navigator.push(context, MaterialPageRoute(builder: (_) => DocumentFormScreen(initialDocType: key, initialTopic: topic)));
    }
  }

  String _timeAgo(DateTime dt) {
    final d = DateTime.now().difference(dt);
    if (d.inMinutes < 1)  return 'just now';
    if (d.inMinutes < 60) return '${d.inMinutes}m ago';
    if (d.inHours   < 24) return '${d.inHours}h ago';
    return '${d.inDays}d ago';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.surface,
      body: CustomScrollView(slivers: [
        SliverAppBar(
          expandedHeight: 400,
          floating: false,
          pinned: true,
          elevation: 0,
          backgroundColor: const Color(0xFF0F3460),
          flexibleSpace: FlexibleSpaceBar(
            collapseMode: CollapseMode.pin,
            background: _buildHero(),
          ),
          title: Row(children: [
            Container(
              width: 32, height: 32,
              decoration: BoxDecoration(gradient: AppTheme.presentationGrad, borderRadius: BorderRadius.circular(8)),
              child: const Icon(Icons.auto_awesome, color: Colors.white, size: 18)),
            const SizedBox(width: 10),
            const Text('AI Office Assistant',
              style: TextStyle(color: Colors.white, fontSize: 17, fontWeight: FontWeight.w800, letterSpacing: -0.3)),
          ]),
        ),
        SliverPadding(
          padding: const EdgeInsets.fromLTRB(20, 28, 20, 32),
          sliver: SliverList(delegate: SliverChildListDelegate([
            const Text('AI-Powered Tools',
              style: TextStyle(color: AppTheme.textDark, fontSize: 20, fontWeight: FontWeight.w800, letterSpacing: -0.4)),
            const SizedBox(height: 4),
            const Text('Professional results in under 30 seconds',
              style: TextStyle(color: AppTheme.textSoft, fontSize: 13)),
            const SizedBox(height: 22),

            _FeatureCard(
              gradient: AppTheme.presentationGrad,
              icon: Icons.slideshow_rounded,
              iconBg: const Color(0xFF4834D4), tag: 'PPTX', tagBg: const Color(0xFF8B7FFF),
              title: 'Presentation Maker',
              subtitle: 'AI builds slides with stats, quotes, speaker notes & 6 beautiful templates',
              highlights: const ['6 Templates', 'Transitions', 'Speaker notes'],
              highlightColor: const Color(0xFFBDB4FF),
              onTap: () => _openTemplate('presentation'),
            ),
            const SizedBox(height: 16),
            _FeatureCard(
              gradient: AppTheme.cvGrad,
              icon: Icons.badge_outlined,
              iconBg: const Color(0xFF0A7A6A), tag: 'PDF • Offline', tagBg: const Color(0xFF20C997),
              title: 'CV Builder',
              subtitle: 'Professional resume PDF with AI-enhanced content & designer templates',
              highlights: const ['AI Enhance', '3 Templates', 'Offline'],
              highlightColor: const Color(0xFFA8F5DC),
              onTap: () => _openTemplate('cv'),
            ),
            const SizedBox(height: 16),
            _FeatureCard(
              gradient: AppTheme.documentGrad,
              icon: Icons.article_outlined,
              iconBg: const Color(0xFFCC3A22), tag: 'DOCX • 14 Types', tagBg: const Color(0xFFFF8C6B),
              title: 'Document Generator',
              subtitle: 'Reports, proposals, cover letters, business plans & 10 more document types',
              highlights: const ['14 Types', 'AI Rewrite', 'Any Language'],
              highlightColor: const Color(0xFFFFDDB8),
              onTap: () => _openTemplate('report'),
            ),

            if (_historyLoaded && _recentFiles.isNotEmpty) ...[
              const SizedBox(height: 36),
              Row(children: [
                const Expanded(child: Text('Recent Files',
                  style: TextStyle(color: AppTheme.textDark, fontSize: 18, fontWeight: FontWeight.w800))),
                TextButton(
                  onPressed: () async {
                    await HistoryService.clearHistory();
                    if (mounted) setState(() => _recentFiles = []);
                  },
                  child: const Text('Clear all', style: TextStyle(color: AppTheme.textSoft, fontSize: 12)),
                ),
              ]),
              const SizedBox(height: 12),
              _buildRecentList(),
            ],

            const SizedBox(height: 32),
            _buildStats(),
            const SizedBox(height: 24),
            _buildPoweredBy(),
          ])),
        ),
      ]),
    );
  }

  Widget _buildRecentList() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 16, offset: const Offset(0, 4))],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(18),
        child: Column(
          children: List.generate(math.min(5, _recentFiles.length), (i) {
            final item = _recentFiles[i];
            final isLast = i == math.min(5, _recentFiles.length) - 1;
            final typeColor = item.type == 'presentation'
                ? const Color(0xFF6C63FF)
                : item.type == 'cv' ? const Color(0xFF11998E) : const Color(0xFFEA580C);
            final ext = item.type == 'presentation' ? 'PPTX' : item.type == 'cv' ? 'PDF' : 'DOCX';
            final dt = DateTime.tryParse(item.createdAt);
            final ago = dt != null ? _timeAgo(dt) : '';
            return InkWell(
              onTap: () async {
                final mime = item.type == 'presentation'
                    ? 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
                    : item.type == 'cv'
                        ? 'application/pdf'
                        : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                await OpenFilex.open(item.filePath, type: mime);
              },
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                decoration: BoxDecoration(
                  border: isLast ? null : const Border(bottom: BorderSide(color: Color(0xFFF0F4F8))),
                ),
                child: Row(children: [
                  Container(
                    width: 42, height: 42,
                    decoration: BoxDecoration(color: typeColor.withOpacity(0.1), borderRadius: BorderRadius.circular(10)),
                    child: Center(child: Text(item.emoji, style: const TextStyle(fontSize: 20))),
                  ),
                  const SizedBox(width: 12),
                  Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text(
                      item.title.length > 36 ? '${item.title.substring(0, 36)}...' : item.title,
                      style: const TextStyle(color: AppTheme.textDark, fontSize: 13, fontWeight: FontWeight.w600),
                    ),
                    Text('$ext  •  $ago', style: const TextStyle(color: AppTheme.textSoft, fontSize: 11)),
                  ])),
                  Icon(Icons.open_in_new_rounded, size: 16, color: typeColor),
                ]),
              ),
            );
          }),
        ),
      ),
    );
  }

  Widget _buildHero() {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [Color(0xFF1A1A2E), Color(0xFF16213E), Color(0xFF0F3460)],
          begin: Alignment.topLeft, end: Alignment.bottomRight,
        ),
      ),
      child: Stack(children: [
        Positioned(top: -40, right: -40,
          child: AnimatedBuilder(animation: _pulse, builder: (_, __) => Transform.scale(
            scale: _pulse.value,
            child: Container(width: 200, height: 200,
              decoration: BoxDecoration(shape: BoxShape.circle, border: Border.all(color: Colors.white.withOpacity(0.06), width: 1.5))),
          )),
        ),
        Positioned(top: 80, right: 60,
          child: AnimatedBuilder(animation: _float, builder: (_, __) => Transform.translate(
            offset: Offset(0, _float.value),
            child: Container(width: 18, height: 18,
              decoration: BoxDecoration(color: const Color(0xFF6C63FF).withOpacity(0.35), borderRadius: BorderRadius.circular(5),
                border: Border.all(color: const Color(0xFF6C63FF).withOpacity(0.6)))),
          )),
        ),
        Positioned(top: 140, right: 110,
          child: AnimatedBuilder(animation: _float, builder: (_, __) => Transform.translate(
            offset: Offset(0, -_float.value * 0.7),
            child: Container(width: 12, height: 12,
              decoration: BoxDecoration(color: const Color(0xFFFF6584).withOpacity(0.35), borderRadius: BorderRadius.circular(4),
                border: Border.all(color: const Color(0xFFFF6584).withOpacity(0.6)))),
          )),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 96, 20, 16),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
              decoration: BoxDecoration(color: AppTheme.primary.withOpacity(0.2), borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppTheme.primary.withOpacity(0.4))),
              child: const Row(mainAxisSize: MainAxisSize.min, children: [
                Icon(Icons.auto_awesome, color: Color(0xFFBDB4FF), size: 13),
                SizedBox(width: 6),
                Text('AI-Powered • 14 Document Types • Free',
                  style: TextStyle(color: Color(0xFFBDB4FF), fontSize: 11, fontWeight: FontWeight.w600)),
              ]),
            ),
            const SizedBox(height: 12),
            const Text('Your AI Office\nAssistant',
              style: TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.w800, height: 1.2, letterSpacing: -0.8)),
            const SizedBox(height: 6),
            Text('Presentations, CVs & 12 more document types\nin under 30 seconds',
              style: TextStyle(color: Colors.white.withOpacity(0.6), fontSize: 13, height: 1.5)),
            const SizedBox(height: 18),
            Container(
              decoration: BoxDecoration(color: Colors.white.withOpacity(0.1), borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.white.withOpacity(0.22))),
              child: TextField(
                controller: _inputCtrl,
                style: const TextStyle(color: Colors.white, fontSize: 14),
                decoration: InputDecoration(
                  hintText: 'Describe what you need... e.g. "marketing strategy"',
                  hintStyle: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 13),
                  filled: false, border: InputBorder.none,
                  contentPadding: const EdgeInsets.fromLTRB(16, 14, 8, 14),
                  suffixIcon: GestureDetector(
                    onTap: _toggleVoice,
                    child: Container(
                      margin: const EdgeInsets.all(8), width: 36, height: 36,
                      decoration: BoxDecoration(
                        color: _isListening ? Colors.red.withOpacity(0.8) : Colors.white.withOpacity(0.14),
                        borderRadius: BorderRadius.circular(10)),
                      child: Icon(_isListening ? Icons.mic : Icons.mic_none_rounded, color: Colors.white, size: 18),
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 12),
            SizedBox(
              height: 36,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                physics: const BouncingScrollPhysics(),
                itemCount: _quickTemplates.length,
                separatorBuilder: (_, __) => const SizedBox(width: 8),
                itemBuilder: (_, i) {
                  final t = _quickTemplates[i];
                  return GestureDetector(
                    onTap: () => _openTemplate(t['key'] as String),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                      decoration: BoxDecoration(color: Colors.white.withOpacity(0.11), borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: Colors.white.withOpacity(0.18))),
                      child: Row(mainAxisSize: MainAxisSize.min, children: [
                        Text(t['emoji'] as String, style: const TextStyle(fontSize: 13)),
                        const SizedBox(width: 5),
                        Text(t['label'] as String, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
                      ]),
                    ),
                  );
                },
              ),
            ),
          ]),
        ),
      ]),
    );
  }

  Widget _buildStats() {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 8),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 16, offset: const Offset(0, 4))]),
      child: Row(children: [
        _statItem(Icons.palette_outlined,     '6',    'Templates'),
        _statItem(Icons.bolt_outlined,        '30s',  'Avg. Speed'),
        _statItem(Icons.lock_open_outlined,   '∞',    'Free'),
        _statItem(Icons.description_outlined, '14',   'Doc Types'),
      ]),
    );
  }

  Widget _statItem(IconData icon, String value, String label) => Expanded(child: Column(children: [
    Container(width: 40, height: 40, decoration: BoxDecoration(color: AppTheme.primary.withOpacity(0.1), shape: BoxShape.circle),
      child: Icon(icon, color: AppTheme.primary, size: 19)),
    const SizedBox(height: 8),
    Text(value, style: const TextStyle(color: AppTheme.textDark, fontSize: 18, fontWeight: FontWeight.w800)),
    const SizedBox(height: 2),
    Text(label, style: const TextStyle(color: AppTheme.textSoft, fontSize: 11, fontWeight: FontWeight.w500)),
  ]));

  Widget _buildPoweredBy() {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        gradient: LinearGradient(colors: [AppTheme.primary.withOpacity(0.08), AppTheme.secondary.withOpacity(0.06)],
          begin: Alignment.topLeft, end: Alignment.bottomRight),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppTheme.primary.withOpacity(0.15)),
      ),
      child: Row(children: [
        Container(width: 40, height: 40, decoration: BoxDecoration(gradient: AppTheme.presentationGrad, shape: BoxShape.circle),
          child: const Icon(Icons.auto_awesome, color: Colors.white, size: 18)),
        const SizedBox(width: 14),
        const Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('Powered by Groq AI', style: TextStyle(color: AppTheme.textDark, fontWeight: FontWeight.w700, fontSize: 13)),
          SizedBox(height: 2),
          Text('llama-3.3-70b • Ultra-fast • Always free', style: TextStyle(color: AppTheme.textSoft, fontSize: 12)),
        ])),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
          decoration: BoxDecoration(color: const Color(0xFF22C55E).withOpacity(0.12), borderRadius: BorderRadius.circular(20),
            border: Border.all(color: const Color(0xFF22C55E).withOpacity(0.3))),
          child: const Text('FREE', style: TextStyle(color: Color(0xFF16A34A), fontSize: 10, fontWeight: FontWeight.w800, letterSpacing: 0.5)),
        ),
      ]),
    );
  }
}

// ── Feature Card ──────────────────────────────────────────────────────────────
class _FeatureCard extends StatefulWidget {
  final LinearGradient gradient;
  final IconData icon;
  final Color iconBg, tagBg, highlightColor;
  final String tag, title, subtitle;
  final List<String> highlights;
  final VoidCallback onTap;

  const _FeatureCard({
    required this.gradient, required this.icon, required this.iconBg,
    required this.tag, required this.tagBg, required this.title,
    required this.subtitle, required this.highlights,
    required this.highlightColor, required this.onTap,
  });

  @override
  State<_FeatureCard> createState() => _FeatureCardState();
}

class _FeatureCardState extends State<_FeatureCard> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => setState(() => _pressed = true),
      onTapUp: (_) { setState(() => _pressed = false); widget.onTap(); },
      onTapCancel: () => setState(() => _pressed = false),
      child: AnimatedScale(
        scale: _pressed ? 0.97 : 1.0,
        duration: const Duration(milliseconds: 120),
        child: Container(
          decoration: BoxDecoration(
            gradient: widget.gradient,
            borderRadius: BorderRadius.circular(24),
            boxShadow: [BoxShadow(color: widget.gradient.colors.first.withOpacity(0.38), blurRadius: 24, offset: const Offset(0, 10))],
          ),
          child: Stack(children: [
            Positioned(right: -20, bottom: -20,
              child: Container(width: 120, height: 120,
                decoration: BoxDecoration(shape: BoxShape.circle, color: Colors.white.withOpacity(0.07)))),
            Padding(
              padding: const EdgeInsets.all(22),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Row(children: [
                  Container(width: 52, height: 52,
                    decoration: BoxDecoration(color: widget.iconBg, borderRadius: BorderRadius.circular(16)),
                    child: Icon(widget.icon, color: Colors.white, size: 26)),
                  const SizedBox(width: 12),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 3),
                    decoration: BoxDecoration(color: widget.tagBg.withOpacity(0.35), borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: widget.tagBg.withOpacity(0.5))),
                    child: Text(widget.tag, style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w700))),
                  const Spacer(),
                  Container(width: 36, height: 36,
                    decoration: BoxDecoration(color: Colors.white.withOpacity(0.15), shape: BoxShape.circle),
                    child: const Icon(Icons.arrow_forward_rounded, color: Colors.white, size: 18)),
                ]),
                const SizedBox(height: 16),
                Text(widget.title, style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w800, letterSpacing: -0.3)),
                const SizedBox(height: 5),
                Text(widget.subtitle, style: TextStyle(color: Colors.white.withOpacity(0.78), fontSize: 13, height: 1.45)),
                const SizedBox(height: 14),
                Wrap(spacing: 8, children: widget.highlights.map((h) => Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(color: Colors.white.withOpacity(0.14), borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: widget.highlightColor.withOpacity(0.4))),
                  child: Text(h, style: TextStyle(color: widget.highlightColor, fontSize: 11, fontWeight: FontWeight.w600)),
                )).toList()),
              ]),
            ),
          ]),
        ),
      ),
    );
  }
}
