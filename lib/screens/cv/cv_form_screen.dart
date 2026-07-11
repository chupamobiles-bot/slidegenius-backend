import 'package:flutter/material.dart';
import '../../models/cv_model.dart';
import '../../services/cv_pdf_service.dart';
import '../../services/api_service.dart';
import '../../widgets/loading_overlay.dart';
import 'cv_preview_screen.dart';

class CvFormScreen extends StatefulWidget {
  const CvFormScreen({super.key});

  @override
  State<CvFormScreen> createState() => _CvFormScreenState();
}

class _CvFormScreenState extends State<CvFormScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tab;
  bool _loading = false;
  String _loadingMsg = 'Building your CV...';
  int _template = 0; // 0=Executive, 1=Emerald, 2=Modern

  // Personal
  final _name = TextEditingController();
  final _title = TextEditingController();
  final _email = TextEditingController();
  final _phone = TextEditingController();
  final _location = TextEditingController();
  final _linkedin = TextEditingController();
  final _summary = TextEditingController();

  // Skills
  final _skillCtrl = TextEditingController();
  final List<String> _skills = [];

  // Experience / Education
  final List<Map<String, TextEditingController>> _experiences = [_newExp()];
  final List<Map<String, TextEditingController>> _educations = [_newEdu()];

  static Map<String, TextEditingController> _newExp() => {
        'company': TextEditingController(),
        'role': TextEditingController(),
        'start': TextEditingController(),
        'end': TextEditingController(),
        'desc': TextEditingController(),
      };

  static Map<String, TextEditingController> _newEdu() => {
        'institution': TextEditingController(),
        'degree': TextEditingController(),
        'field': TextEditingController(),
        'year': TextEditingController(),
      };

  @override
  void initState() {
    super.initState();
    _tab = TabController(length: 5, vsync: this);
  }

  CvModel _buildCv() => CvModel(
        fullName: _name.text.trim(),
        title: _title.text.trim(),
        email: _email.text.trim(),
        phone: _phone.text.trim(),
        location: _location.text.trim(),
        linkedin: _linkedin.text.trim(),
        summary: _summary.text.trim(),
        experience: _experiences
            .map((e) => WorkExperience(
                  company: e['company']!.text.trim(),
                  role: e['role']!.text.trim(),
                  startDate: e['start']!.text.trim(),
                  endDate: e['end']!.text.trim(),
                  description: e['desc']!.text.trim(),
                ))
            .toList(),
        education: _educations
            .map((e) => Education(
                  institution: e['institution']!.text.trim(),
                  degree: e['degree']!.text.trim(),
                  field: e['field']!.text.trim(),
                  year: e['year']!.text.trim(),
                ))
            .toList(),
        skills: List.from(_skills),
      );

  void _applyEnhanced(CvModel enhanced) {
    _summary.text = enhanced.summary;
    for (int i = 0; i < enhanced.experience.length && i < _experiences.length; i++) {
      _experiences[i]['desc']!.text = enhanced.experience[i].description;
    }
    if (enhanced.summary.isNotEmpty && _summary.text != enhanced.summary) {
      _summary.text = enhanced.summary;
    }
  }

  Future<void> _aiEnhance() async {
    if (_name.text.trim().isEmpty) {
      _showSnack('Please enter your name first');
      return;
    }
    setState(() {
      _loading = true;
      _loadingMsg = 'AI is enhancing your CV...\nThis may take 30 seconds';
    });
    try {
      final enhanced = await ApiService.enhanceCv(_buildCv());
      if (!mounted) return;
      setState(() => _applyEnhanced(enhanced));
      _showSnack('✨ CV enhanced by AI!');
    } catch (e) {
      if (mounted) _showSnack('Enhancement failed — check your backend URL');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _generate() async {
    final name = _name.text.trim();
    if (name.isEmpty) {
      _showSnack('Please enter your full name');
      _tab.animateTo(0);
      return;
    }
    setState(() {
      _loading = true;
      _loadingMsg = 'Building your CV PDF...';
    });
    try {
      final path = await CvPdfService.generatePdf(_buildCv(), template: _template);
      if (!mounted) return;
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (_) => CvPreviewScreen(name: name, filePath: path),
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
    return Stack(
      children: [
        Scaffold(
          backgroundColor: const Color(0xFFF8FAFC),
          appBar: AppBar(
            title: const Text('CV Builder'),
            backgroundColor: Colors.white,
            bottom: TabBar(
              controller: _tab,
              labelColor: const Color(0xFF059669),
              unselectedLabelColor: const Color(0xFF64748B),
              indicatorColor: const Color(0xFF059669),
              isScrollable: true,
              tabs: const [
                Tab(text: 'Personal'),
                Tab(text: 'Experience'),
                Tab(text: 'Education'),
                Tab(text: 'Skills'),
                Tab(text: 'Design'),
              ],
            ),
          ),
          body: TabBarView(
            controller: _tab,
            children: [
              _personalTab(),
              _experienceTab(),
              _educationTab(),
              _skillsTab(),
              _designTab(),
            ],
          ),
          bottomNavigationBar: SafeArea(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
              child: Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: _loading ? null : _aiEnhance,
                      icon: const Icon(Icons.auto_awesome, size: 16),
                      label: const Text('AI Enhance'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: const Color(0xFF6366F1),
                        side: const BorderSide(color: Color(0xFF6366F1)),
                        minimumSize: const Size(0, 50),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14)),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    flex: 2,
                    child: ElevatedButton.icon(
                      onPressed: _loading ? null : _generate,
                      icon: const Icon(Icons.picture_as_pdf_outlined),
                      label: const Text('Generate CV PDF'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF059669),
                        minimumSize: const Size(0, 50),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
        if (_loading)
          LoadingOverlay(
            message: _loadingMsg,
            color: const Color(0xFF059669),
          ),
      ],
    );
  }

  // ── TABS ───────────────────────────────────────────────────────────────────

  Widget _personalTab() => SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _field('Full Name *', _name, hint: 'John Smith'),
            _field('Professional Title', _title, hint: 'Senior Software Engineer'),
            _field('Email', _email,
                hint: 'john@email.com',
                keyboard: TextInputType.emailAddress),
            _field('Phone', _phone,
                hint: '+1 234 567 8900', keyboard: TextInputType.phone),
            _field('Location', _location, hint: 'New York, USA'),
            _field('LinkedIn', _linkedin, hint: 'linkedin.com/in/johnsmith'),
            _field('Professional Summary', _summary,
                hint:
                    'Experienced professional with 5+ years...\n\n(Tip: fill basics then use AI Enhance to improve this)',
                maxLines: 5),
            const SizedBox(height: 80),
          ],
        ),
      );

  Widget _experienceTab() => ListView(
        padding: const EdgeInsets.all(20),
        children: [
          ..._experiences.asMap().entries.map((entry) {
            final i = entry.key;
            final e = entry.value;
            return _sectionCard(
              title: 'Experience ${i + 1}',
              color: const Color(0xFF059669),
              onRemove: _experiences.length > 1
                  ? () => setState(() => _experiences.removeAt(i))
                  : null,
              children: [
                _field('Company', e['company']!, hint: 'Google Inc.'),
                _field('Job Title', e['role']!, hint: 'Software Engineer'),
                Row(children: [
                  Expanded(
                      child:
                          _field('Start Date', e['start']!, hint: 'Jan 2022')),
                  const SizedBox(width: 12),
                  Expanded(
                      child: _field('End Date', e['end']!, hint: 'Present')),
                ]),
                _field('Key Achievements', e['desc']!,
                    hint:
                        'What did you accomplish? (AI Enhance will improve this)',
                    maxLines: 4),
              ],
            );
          }),
          TextButton.icon(
            onPressed: () => setState(() => _experiences.add(_newExp())),
            icon: const Icon(Icons.add_circle_outline),
            label: const Text('Add Another Position'),
            style: TextButton.styleFrom(
                foregroundColor: const Color(0xFF059669)),
          ),
          const SizedBox(height: 80),
        ],
      );

  Widget _educationTab() => ListView(
        padding: const EdgeInsets.all(20),
        children: [
          ..._educations.asMap().entries.map((entry) {
            final i = entry.key;
            final e = entry.value;
            return _sectionCard(
              title: 'Education ${i + 1}',
              color: const Color(0xFF059669),
              onRemove: _educations.length > 1
                  ? () => setState(() => _educations.removeAt(i))
                  : null,
              children: [
                _field('Institution', e['institution']!, hint: 'MIT'),
                _field('Degree', e['degree']!,
                    hint: 'Bachelor of Science'),
                _field('Field of Study', e['field']!,
                    hint: 'Computer Science'),
                _field('Year', e['year']!, hint: '2020'),
              ],
            );
          }),
          TextButton.icon(
            onPressed: () => setState(() => _educations.add(_newEdu())),
            icon: const Icon(Icons.add_circle_outline),
            label: const Text('Add Another Education'),
            style: TextButton.styleFrom(
                foregroundColor: const Color(0xFF059669)),
          ),
          const SizedBox(height: 80),
        ],
      );

  Widget _skillsTab() => SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Add Your Skills',
                style: TextStyle(
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF1E1B4B),
                    fontSize: 15)),
            const SizedBox(height: 6),
            const Text('Type a skill and press Add or Enter',
                style: TextStyle(color: Color(0xFF64748B), fontSize: 12)),
            const SizedBox(height: 16),
            Row(children: [
              Expanded(
                child: TextField(
                  controller: _skillCtrl,
                  decoration: const InputDecoration(
                      hintText: 'e.g. Flutter, Python, Leadership...'),
                  onSubmitted: (_) => _addSkill(),
                ),
              ),
              const SizedBox(width: 10),
              ElevatedButton(
                onPressed: _addSkill,
                style: ElevatedButton.styleFrom(
                    minimumSize: const Size(60, 50),
                    backgroundColor: const Color(0xFF059669)),
                child: const Text('Add'),
              ),
            ]),
            const SizedBox(height: 20),
            if (_skills.isNotEmpty) ...[
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: _skills
                    .map((s) => Chip(
                          label: Text(s),
                          backgroundColor: const Color(0xFFD1FAE5),
                          labelStyle: const TextStyle(
                              color: Color(0xFF065F46),
                              fontWeight: FontWeight.w600,
                              fontSize: 12),
                          deleteIcon: const Icon(Icons.close,
                              size: 14, color: Color(0xFF065F46)),
                          onDeleted: () =>
                              setState(() => _skills.remove(s)),
                        ))
                    .toList(),
              ),
              const SizedBox(height: 10),
              Text('${_skills.length} skill${_skills.length != 1 ? "s" : ""} added',
                  style: const TextStyle(
                      color: Color(0xFF64748B), fontSize: 12)),
            ],
            const SizedBox(height: 80),
          ],
        ),
      );

  Widget _designTab() => SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Choose CV Template',
                style: TextStyle(
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF1E1B4B),
                    fontSize: 16)),
            const SizedBox(height: 4),
            const Text(
                'Select a professional design for your CV',
                style:
                    TextStyle(color: Color(0xFF64748B), fontSize: 13)),
            const SizedBox(height: 20),
            _templateCard(
              index: 0,
              name: 'Executive',
              desc: 'Dark navy sidebar with skills chips\nClean white main content',
              sidebarColor: const Color(0xFF1A237E),
              accentColor: const Color(0xFF3F51B5),
            ),
            const SizedBox(height: 14),
            _templateCard(
              index: 1,
              name: 'Emerald',
              desc: 'Deep green sidebar with skill bars\nWarm off-white main content',
              sidebarColor: const Color(0xFF00695C),
              accentColor: const Color(0xFF00897B),
            ),
            const SizedBox(height: 14),
            _templateCard(
              index: 2,
              name: 'Modern Blue',
              desc: 'Bold blue header with initials\nTwo-column layout, ATS-friendly',
              sidebarColor: const Color(0xFF0D47A1),
              accentColor: const Color(0xFF1565C0),
              isHeader: true,
            ),
            const SizedBox(height: 28),
            // AI Enhance section
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF6366F1), Color(0xFF8B5CF6)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.auto_awesome, color: Colors.white, size: 20),
                      SizedBox(width: 8),
                      Text('AI Content Enhancement',
                          style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w700,
                              fontSize: 15)),
                    ],
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Let Groq AI rewrite your summary and job descriptions using strong action verbs and quantified achievements.',
                    style: TextStyle(
                        color: Colors.white70, fontSize: 12, height: 1.5),
                  ),
                  const SizedBox(height: 14),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: _loading ? null : _aiEnhance,
                      icon: const Icon(Icons.auto_awesome),
                      label: const Text('Enhance My CV with AI'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: const Color(0xFF6366F1),
                        minimumSize: const Size(0, 48),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 80),
          ],
        ),
      );

  Widget _templateCard({
    required int index,
    required String name,
    required String desc,
    required Color sidebarColor,
    required Color accentColor,
    bool isHeader = false,
  }) {
    final selected = _template == index;
    return GestureDetector(
      onTap: () => setState(() => _template = index),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: selected ? const Color(0xFF059669) : Colors.grey.shade200,
            width: selected ? 2.5 : 1,
          ),
          boxShadow: selected
              ? [
                  BoxShadow(
                    color: const Color(0xFF059669).withOpacity(0.15),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  )
                ]
              : [],
        ),
        child: Row(
          children: [
            // Template mini-preview
            ClipRRect(
              borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(15),
                  bottomLeft: Radius.circular(15)),
              child: Container(
                width: 80,
                height: 100,
                color: isHeader ? accentColor : sidebarColor,
                child: isHeader
                    ? Column(children: [
                        Container(
                          height: 36,
                          color: sidebarColor,
                          child: Center(
                            child: Container(
                              width: 24,
                              height: 24,
                              decoration: BoxDecoration(
                                color: accentColor.withOpacity(0.5),
                                shape: BoxShape.circle,
                              ),
                            ),
                          ),
                        ),
                        Expanded(
                          child: Container(
                            color: const Color(0xFFE3F2FD),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: List.generate(
                                  3,
                                  (i) => Padding(
                                        padding: const EdgeInsets.symmetric(
                                            vertical: 2, horizontal: 6),
                                        child: Container(
                                          height: 4,
                                          color: i == 0
                                              ? accentColor
                                              : Colors.grey.shade300,
                                        ),
                                      )),
                            ),
                          ),
                        ),
                      ])
                    : Row(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          Container(
                            width: 30,
                            color: sidebarColor,
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: List.generate(
                                  5,
                                  (i) => Padding(
                                        padding: const EdgeInsets.symmetric(
                                            vertical: 2),
                                        child: Container(
                                          width: 18,
                                          height: 3,
                                          color: Colors.white.withOpacity(0.5),
                                        ),
                                      )),
                            ),
                          ),
                          Expanded(
                            child: Container(
                              color: Colors.white,
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: List.generate(
                                    4,
                                    (i) => Padding(
                                          padding: const EdgeInsets.fromLTRB(
                                              6, 2, 6, 2),
                                          child: Container(
                                            height: 4,
                                            color: i == 0
                                                ? accentColor
                                                : Colors.grey.shade200,
                                          ),
                                        )),
                              ),
                            ),
                          ),
                        ],
                      ),
              ),
            ),
            // Info
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(name,
                            style: const TextStyle(
                                fontWeight: FontWeight.w700,
                                fontSize: 14,
                                color: Color(0xFF1E1B4B))),
                        if (selected) ...[
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: const Color(0xFFD1FAE5),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: const Text('Selected',
                                style: TextStyle(
                                    color: Color(0xFF065F46),
                                    fontSize: 10,
                                    fontWeight: FontWeight.w600)),
                          ),
                        ],
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(desc,
                        style: const TextStyle(
                            color: Color(0xFF64748B),
                            fontSize: 11,
                            height: 1.5)),
                  ],
                ),
              ),
            ),
            Container(
              width: 24,
              height: 24,
              margin: const EdgeInsets.only(right: 12),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: selected ? const Color(0xFF059669) : Colors.transparent,
                border: Border.all(
                  color: selected
                      ? const Color(0xFF059669)
                      : Colors.grey.shade300,
                  width: 2,
                ),
              ),
              child: selected
                  ? const Icon(Icons.check, color: Colors.white, size: 14)
                  : null,
            ),
          ],
        ),
      ),
    );
  }

  void _addSkill() {
    final skill = _skillCtrl.text.trim();
    if (skill.isNotEmpty && !_skills.contains(skill)) {
      setState(() {
        _skills.add(skill);
        _skillCtrl.clear();
      });
    }
  }

  Widget _field(
    String label,
    TextEditingController ctrl, {
    String hint = '',
    int maxLines = 1,
    TextInputType keyboard = TextInputType.text,
  }) =>
      Padding(
        padding: const EdgeInsets.only(bottom: 14),
        child: TextField(
          controller: ctrl,
          maxLines: maxLines,
          keyboardType: keyboard,
          decoration: InputDecoration(labelText: label, hintText: hint),
        ),
      );

  Widget _sectionCard({
    required String title,
    required Color color,
    required List<Widget> children,
    VoidCallback? onRemove,
  }) =>
      Container(
        margin: const EdgeInsets.only(bottom: 16),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: Colors.grey.shade100),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(title,
                    style: TextStyle(
                        fontWeight: FontWeight.w700, color: color, fontSize: 13)),
                if (onRemove != null)
                  GestureDetector(
                    onTap: onRemove,
                    child: const Icon(Icons.remove_circle_outline,
                        color: Color(0xFFEF4444), size: 20),
                  ),
              ],
            ),
            const SizedBox(height: 12),
            ...children,
          ],
        ),
      );

  @override
  void dispose() {
    _tab.dispose();
    _name.dispose();
    _title.dispose();
    _email.dispose();
    _phone.dispose();
    _location.dispose();
    _linkedin.dispose();
    _summary.dispose();
    _skillCtrl.dispose();
    super.dispose();
  }
}
