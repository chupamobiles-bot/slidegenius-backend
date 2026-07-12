import 'package:flutter/material.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;
import 'package:permission_handler/permission_handler.dart';
import '../../app/theme.dart';
import '../../services/api_service.dart';
import '../../widgets/loading_overlay.dart';
import 'document_result_screen.dart';

class DocumentFormScreen extends StatefulWidget {
  final String? initialDocType;
  final String? initialTopic;

  const DocumentFormScreen({
    super.key,
    this.initialDocType,
    this.initialTopic,
  });

  @override
  State<DocumentFormScreen> createState() => _DocumentFormScreenState();
}

class _DocumentFormScreenState extends State<DocumentFormScreen> {
  late final TextEditingController _topicCtrl;
  late String _docType;
  String _length = 'medium';
  String _language = 'English';
  bool _loading = false;

  // Voice
  final _speech = stt.SpeechToText();
  bool _isListening = false;

  static const _docTypes = [
    {'key': 'report',            'label': 'Business Report',    'emoji': '📊', 'desc': 'Research & analysis'},
    {'key': 'proposal',          'label': 'Proposal',           'emoji': '💡', 'desc': 'Win new business'},
    {'key': 'cover_letter',      'label': 'Cover Letter',       'emoji': '📨', 'desc': 'Job applications'},
    {'key': 'business_proposal', 'label': 'Business Proposal',  'emoji': '💼', 'desc': 'Formal bid document'},
    {'key': 'meeting_minutes',   'label': 'Meeting Minutes',    'emoji': '📝', 'desc': 'Record decisions'},
    {'key': 'business_plan',     'label': 'Business Plan',      'emoji': '📈', 'desc': 'Investor-ready plan'},
    {'key': 'assignment',        'label': 'Assignment / Essay', 'emoji': '📚', 'desc': 'Academic writing'},
    {'key': 'project_report',    'label': 'Project Report',     'emoji': '🗂️', 'desc': 'Status & progress'},
    {'key': 'email',             'label': 'Professional Email', 'emoji': '✉️', 'desc': 'Business email'},
    {'key': 'letter',            'label': 'Formal Letter',      'emoji': '📜', 'desc': 'Official correspondence'},
    {'key': 'summary',           'label': 'Executive Summary',  'emoji': '📑', 'desc': 'C-suite briefing'},
    {'key': 'plan',              'label': 'Project Plan',       'emoji': '📅', 'desc': 'Timeline & milestones'},
    {'key': 'article',           'label': 'Article / Blog',     'emoji': '📰', 'desc': 'Thought leadership'},
    {'key': 'announcement',      'label': 'Announcement',       'emoji': '📢', 'desc': 'Corporate comms'},
  ];

  static const _lengths = [
    {'key': 'short',  'label': 'Short',  'desc': '~500 words'},
    {'key': 'medium', 'label': 'Medium', 'desc': '~1000 words'},
    {'key': 'long',   'label': 'Long',   'desc': '~1800 words'},
  ];

  static const _languages = [
    'English', 'Arabic', 'Urdu', 'Hindi', 'Spanish',
    'French', 'German', 'Chinese', 'Japanese', 'Korean',
    'Portuguese', 'Turkish', 'Indonesian',
  ];

  @override
  void initState() {
    super.initState();
    _docType = widget.initialDocType ?? 'report';
    _topicCtrl = TextEditingController(text: widget.initialTopic ?? '');
    // Validate initialDocType
    final validKeys = _docTypes.map((t) => t['key']!).toSet();
    if (!validKeys.contains(_docType)) _docType = 'report';
  }

  @override
  void dispose() {
    _topicCtrl.dispose();
    super.dispose();
  }

  Future<void> _toggleVoice() async {
    if (_isListening) {
      await _speech.stop();
      if (mounted) setState(() => _isListening = false);
      return;
    }
    final status = await Permission.microphone.request();
    if (!status.isGranted) return;
    final available = await _speech.initialize(
      onStatus: (s) {
        if (s == 'done' || s == 'notListening') {
          if (mounted) setState(() => _isListening = false);
        }
      },
      onError: (_) { if (mounted) setState(() => _isListening = false); },
    );
    if (available && mounted) {
      setState(() => _isListening = true);
      await _speech.listen(
        onResult: (r) {
          if (mounted) setState(() => _topicCtrl.text = r.recognizedWords);
        },
        listenFor: const Duration(seconds: 30),
        pauseFor: const Duration(seconds: 4),
      );
    }
  }

  Future<void> _generate() async {
    final topic = _topicCtrl.text.trim();
    if (topic.isEmpty) {
      _showSnack('Please enter a topic or description');
      return;
    }
    setState(() => _loading = true);
    try {
      final filePath = await ApiService.generateDocument(
        topic: topic,
        docType: _docType,
        length: _length,
        language: _language,
      );
      if (!mounted) return;
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (_) => DocumentResultScreen(
            topic: topic,
            filePath: filePath,
            docType: _docType,
          ),
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

  Map<String, dynamic>? get _currentDocType =>
      _docTypes.firstWhere((t) => t['key'] == _docType, orElse: () => _docTypes.first);

  @override
  Widget build(BuildContext context) {
    final ct = _currentDocType!;
    return Stack(children: [
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
              // Header card — shows current selection
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFFEA580C), Color(0xFFD97706)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(18),
                ),
                child: Row(children: [
                  Text(ct['emoji'] as String,
                    style: const TextStyle(fontSize: 36)),
                  const SizedBox(width: 14),
                  Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text(ct['label'] as String,
                      style: const TextStyle(
                        color: Colors.white, fontSize: 17, fontWeight: FontWeight.w800)),
                    const SizedBox(height: 3),
                    const Text(
                      'AI creates a professional document based on your topic',
                      style: TextStyle(color: Colors.white70, fontSize: 12, height: 1.4),
                    ),
                  ])),
                ]),
              ),
              const SizedBox(height: 24),

              // Topic input with voice
              _label('Topic / Description'),
              const SizedBox(height: 8),
              TextField(
                controller: _topicCtrl,
                maxLines: 3,
                decoration: InputDecoration(
                  hintText: _hintFor(_docType),
                  hintStyle: const TextStyle(fontSize: 13),
                  suffixIcon: GestureDetector(
                    onTap: _toggleVoice,
                    child: Container(
                      margin: const EdgeInsets.all(10),
                      width: 36, height: 36,
                      decoration: BoxDecoration(
                        color: _isListening
                            ? Colors.red.withOpacity(0.1)
                            : AppTheme.primary.withOpacity(0.07),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Icon(
                        _isListening ? Icons.mic : Icons.mic_none_rounded,
                        color: _isListening ? Colors.red : AppTheme.primary,
                        size: 20,
                      ),
                    ),
                  ),
                ),
              ),
              if (_isListening)
                Padding(
                  padding: const EdgeInsets.only(top: 6),
                  child: Row(children: [
                    Container(
                      width: 8, height: 8,
                      decoration: const BoxDecoration(color: Colors.red, shape: BoxShape.circle),
                    ),
                    const SizedBox(width: 6),
                    const Text('Listening...', style: TextStyle(color: Colors.red, fontSize: 12, fontWeight: FontWeight.w500)),
                  ]),
                ),

              const SizedBox(height: 22),
              _label('Document Type'),
              const SizedBox(height: 10),
              Wrap(
                spacing: 8, runSpacing: 8,
                children: _docTypes.map((t) {
                  final selected = _docType == t['key'];
                  return GestureDetector(
                    onTap: () => setState(() => _docType = t['key'] as String),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 180),
                      padding: const EdgeInsets.symmetric(horizontal: 11, vertical: 8),
                      decoration: BoxDecoration(
                        color: selected ? const Color(0xFFEA580C) : Colors.white,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: selected ? const Color(0xFFEA580C) : const Color(0xFFE2E8F0),
                          width: 2,
                        ),
                        boxShadow: selected
                            ? [BoxShadow(color: const Color(0xFFEA580C).withOpacity(0.25), blurRadius: 8, offset: const Offset(0, 3))]
                            : null,
                      ),
                      child: Row(mainAxisSize: MainAxisSize.min, children: [
                        Text(t['emoji'] as String, style: const TextStyle(fontSize: 14)),
                        const SizedBox(width: 5),
                        Text(
                          t['label'] as String,
                          style: TextStyle(
                            color: selected ? Colors.white : const Color(0xFF1E1B4B),
                            fontWeight: FontWeight.w600, fontSize: 12,
                          ),
                        ),
                      ]),
                    ),
                  );
                }).toList(),
              ),

              const SizedBox(height: 22),
              _label('Document Length'),
              const SizedBox(height: 10),
              Row(
                children: _lengths.map((l) {
                  final selected = _length == l['key'];
                  return Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => _length = l['key'] as String),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 180),
                        margin: EdgeInsets.only(right: l['key'] != 'long' ? 8 : 0),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        decoration: BoxDecoration(
                          color: selected ? const Color(0xFFEA580C) : Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: selected ? const Color(0xFFEA580C) : const Color(0xFFE2E8F0),
                            width: 2,
                          ),
                        ),
                        child: Column(children: [
                          Text(l['label'] as String,
                            style: TextStyle(
                              color: selected ? Colors.white : const Color(0xFF1E1B4B),
                              fontWeight: FontWeight.w700, fontSize: 13,
                            )),
                          Text(l['desc'] as String,
                            style: TextStyle(
                              color: selected ? Colors.white70 : const Color(0xFF94A3B8),
                              fontSize: 10,
                            )),
                        ]),
                      ),
                    ),
                  );
                }).toList(),
              ),

              const SizedBox(height: 22),
              _label('Output Language'),
              const SizedBox(height: 10),
              Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFE2E8F0), width: 1.5),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: _language,
                    isExpanded: true,
                    padding: const EdgeInsets.symmetric(horizontal: 14),
                    borderRadius: BorderRadius.circular(14),
                    icon: const Icon(Icons.keyboard_arrow_down_rounded, color: AppTheme.textSoft),
                    items: _languages.map((lang) => DropdownMenuItem(
                      value: lang,
                      child: Row(children: [
                        const Icon(Icons.language_rounded, size: 16, color: AppTheme.textSoft),
                        const SizedBox(width: 8),
                        Text(lang, style: const TextStyle(fontSize: 14, color: AppTheme.textDark)),
                      ]),
                    )).toList(),
                    onChanged: (v) => setState(() => _language = v ?? 'English'),
                  ),
                ),
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
              const SizedBox(height: 10),
              const Center(
                child: Text('⚡ Usually ready in 20–40 seconds',
                  style: TextStyle(color: AppTheme.textSoft, fontSize: 12)),
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
    ]);
  }

  String _hintFor(String type) {
    const hints = {
      'cover_letter':      'e.g. "Software Engineer position at Google — 5 years React experience"',
      'business_proposal': 'e.g. "Digital transformation consulting for retail banking sector"',
      'meeting_minutes':   'e.g. "Q4 strategy planning meeting with leadership team"',
      'business_plan':     'e.g. "AI-powered fitness coaching app targeting Gen Z"',
      'assignment':        'e.g. "Impact of social media on mental health in teenagers"',
      'project_report':    'e.g. "E-commerce platform migration project — Month 3 update"',
      'email':             'e.g. "Request for meeting with potential investor to discuss Series A"',
      'announcement':      'e.g. "Company rebrand and new product launch announcement"',
      'report':            'e.g. "Q3 Sales Performance Report for Asia Pacific region"',
      'proposal':          'e.g. "Website redesign proposal for hospitality chain"',
      'letter':            'e.g. "Letter of intent for commercial property lease"',
      'summary':           'e.g. "Board briefing on AI strategy and competitive landscape"',
      'plan':              'e.g. "Mobile app development project — 6 month roadmap"',
      'article':           'e.g. "How AI is transforming the financial services industry"',
    };
    return hints[type] ?? 'Describe what this document should cover...';
  }

  Widget _label(String text) => Text(
    text,
    style: const TextStyle(
      color: Color(0xFF1E1B4B), fontWeight: FontWeight.w600, fontSize: 14),
  );
}
