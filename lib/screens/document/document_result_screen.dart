import 'package:flutter/material.dart';
import 'package:open_filex/open_filex.dart';
import 'package:share_plus/share_plus.dart';
import '../../services/history_service.dart';
import '../../services/api_service.dart';
import '../../widgets/loading_overlay.dart';

class DocumentResultScreen extends StatefulWidget {
  final String topic;
  final String filePath;
  final String docType;

  const DocumentResultScreen({
    super.key,
    required this.topic,
    required this.filePath,
    this.docType = 'report',
  });

  @override
  State<DocumentResultScreen> createState() => _DocumentResultScreenState();
}

class _DocumentResultScreenState extends State<DocumentResultScreen> {
  bool _rewriting = false;

  @override
  void initState() {
    super.initState();
    _saveToHistory();
  }

  Future<void> _saveToHistory() async {
    await HistoryService.addItem(HistoryItem(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      title: widget.topic,
      type: 'document',
      filePath: widget.filePath,
      createdAt: DateTime.now().toIso8601String(),
      docType: widget.docType,
      emoji: HistoryService.emojiForDocType(widget.docType),
    ));
  }

  void _showRewriteSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => _RewriteSheet(
        onTone: (tone) {
          Navigator.pop(ctx);
          _rewrite(tone);
        },
      ),
    );
  }

  Future<void> _rewrite(String tone) async {
    setState(() => _rewriting = true);
    try {
      final newPath = await ApiService.rewriteDocument(
        topic: widget.topic,
        docType: widget.docType,
        tone: tone,
      );
      if (!mounted) return;
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (_) => DocumentResultScreen(
            topic: '${widget.topic} [${_capitalize(tone)} Tone]',
            filePath: newPath,
            docType: widget.docType,
          ),
        ),
      );
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text('Rewrite failed: $e')));
      }
    } finally {
      if (mounted) setState(() => _rewriting = false);
    }
  }

  String _capitalize(String s) =>
      s.isEmpty ? s : '${s[0].toUpperCase()}${s.substring(1)}';

  @override
  Widget build(BuildContext context) {
    final fileName = widget.filePath.split('/').last;

    return Stack(children: [
      Scaffold(
        backgroundColor: const Color(0xFFF8FAFC),
        appBar: AppBar(
          title: const Text('Document Ready'),
          backgroundColor: Colors.white,
          automaticallyImplyLeading: false,
          leading: IconButton(
            icon: const Icon(Icons.home_outlined),
            onPressed: () => Navigator.of(context).popUntil((r) => r.isFirst),
          ),
        ),
        body: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(children: [
            const SizedBox(height: 16),
            // Success circle
            Container(
              width: 100, height: 100,
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFFEA580C), Color(0xFFD97706)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFFEA580C).withOpacity(0.4),
                    blurRadius: 30, offset: const Offset(0, 10),
                  ),
                ],
              ),
              child: const Icon(Icons.check_rounded, color: Colors.white, size: 50),
            ),
            const SizedBox(height: 24),

            Text(
              '${HistoryService.emojiForDocType(widget.docType)}  Document Created!',
              style: const TextStyle(
                fontSize: 22, fontWeight: FontWeight.w800, color: Color(0xFF1E1B4B)),
            ),
            const SizedBox(height: 8),
            Text(
              widget.topic,
              textAlign: TextAlign.center,
              style: const TextStyle(color: Color(0xFF64748B), fontSize: 14),
            ),
            const SizedBox(height: 32),

            // File info card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFFFEDD5)),
              ),
              child: Row(children: [
                Container(
                  width: 48, height: 48,
                  decoration: BoxDecoration(
                    color: const Color(0xFFFFF7ED),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Center(
                    child: Text(HistoryService.emojiForDocType(widget.docType),
                      style: const TextStyle(fontSize: 22)),
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(fileName,
                    style: const TextStyle(
                      fontWeight: FontWeight.w600, fontSize: 13, color: Color(0xFF1E1B4B)),
                    overflow: TextOverflow.ellipsis),
                  const Text('Saved to Downloads',
                    style: TextStyle(color: Color(0xFF64748B), fontSize: 11)),
                ])),
                const Icon(Icons.check_circle, color: Color(0xFF059669), size: 20),
              ]),
            ),
            const SizedBox(height: 20),

            // Open button
            ElevatedButton.icon(
              onPressed: () async {
                final result = await OpenFilex.open(
                  widget.filePath,
                  type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                );
                if (result.type != ResultType.done && context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: const Text('Install WPS Office or Google Docs to open .docx files'),
                      action: SnackBarAction(
                        label: 'Share',
                        onPressed: () => Share.shareXFiles(
                          [XFile(widget.filePath)], text: 'Document: ${widget.topic}'),
                      ),
                    ),
                  );
                }
              },
              icon: const Icon(Icons.open_in_new_rounded),
              label: const Text('Open Document'),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFEA580C),
                minimumSize: const Size(double.infinity, 52),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
            ),
            const SizedBox(height: 10),

            // Rewrite As button
            OutlinedButton.icon(
              onPressed: _showRewriteSheet,
              icon: const Icon(Icons.auto_fix_high_rounded),
              label: const Text('Rewrite As...'),
              style: OutlinedButton.styleFrom(
                minimumSize: const Size(double.infinity, 52),
                foregroundColor: const Color(0xFFEA580C),
                side: const BorderSide(color: Color(0xFFEA580C)),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
            ),
            const SizedBox(height: 10),

            // Share button
            OutlinedButton.icon(
              onPressed: () => Share.shareXFiles(
                [XFile(widget.filePath)], text: 'Document: ${widget.topic}'),
              icon: const Icon(Icons.share_rounded),
              label: const Text('Share File'),
              style: OutlinedButton.styleFrom(
                minimumSize: const Size(double.infinity, 52),
                foregroundColor: const Color(0xFF64748B),
                side: const BorderSide(color: Color(0xFFE2E8F0)),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
            ),
            const SizedBox(height: 12),

            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('← Make Another Document',
                style: TextStyle(color: Color(0xFFEA580C))),
            ),
            const SizedBox(height: 40),
          ]),
        ),
      ),
      if (_rewriting)
        const LoadingOverlay(
          message: 'AI is rewriting your document...',
          color: Color(0xFFEA580C),
        ),
    ]);
  }
}

// ── Rewrite Tone Sheet ────────────────────────────────────────────────────────
class _RewriteSheet extends StatelessWidget {
  final Function(String) onTone;
  const _RewriteSheet({required this.onTone});

  @override
  Widget build(BuildContext context) {
    const tones = [
      {
        'key': 'professional',
        'label': 'Professional',
        'desc': 'Formal, authoritative, business-appropriate',
        'icon': Icons.business_center_outlined,
        'color': Color(0xFF6C63FF),
      },
      {
        'key': 'friendly',
        'label': 'Friendly',
        'desc': 'Warm, approachable, human & conversational',
        'icon': Icons.sentiment_satisfied_outlined,
        'color': Color(0xFF20BF6B),
      },
      {
        'key': 'formal',
        'label': 'Highly Formal',
        'desc': 'Legal / government / academic style',
        'icon': Icons.gavel_outlined,
        'color': Color(0xFF2D98DA),
      },
      {
        'key': 'concise',
        'label': 'Concise',
        'desc': '40% shorter — same impact, less reading',
        'icon': Icons.compress_outlined,
        'color': Color(0xFFEB3B5A),
      },
    ];

    return Padding(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
      ),
      child: Container(
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 28),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          // Handle bar
          Center(
            child: Container(
              width: 40, height: 4,
              decoration: BoxDecoration(
                color: Colors.grey[300],
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 20),
          const Align(
            alignment: Alignment.centerLeft,
            child: Text('Rewrite As',
              style: TextStyle(
                fontSize: 20, fontWeight: FontWeight.w800, color: Color(0xFF1E1B4B))),
          ),
          const SizedBox(height: 4),
          const Align(
            alignment: Alignment.centerLeft,
            child: Text('AI regenerates your document in a new tone (~30 seconds)',
              style: TextStyle(color: Color(0xFF94A3B8), fontSize: 13)),
          ),
          const SizedBox(height: 18),
          ...tones.map((t) {
            final color = t['color'] as Color;
            return Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: Material(
                color: Colors.transparent,
                child: InkWell(
                  onTap: () => onTone(t['key'] as String),
                  borderRadius: BorderRadius.circular(14),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                    decoration: BoxDecoration(
                      color: color.withOpacity(0.05),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: color.withOpacity(0.2)),
                    ),
                    child: Row(children: [
                      Container(
                        width: 40, height: 40,
                        decoration: BoxDecoration(
                          color: color.withOpacity(0.12),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Icon(t['icon'] as IconData, color: color, size: 20),
                      ),
                      const SizedBox(width: 14),
                      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Text(t['label'] as String,
                          style: const TextStyle(
                            fontWeight: FontWeight.w700, fontSize: 14, color: Color(0xFF1E1B4B))),
                        Text(t['desc'] as String,
                          style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12)),
                      ])),
                      Icon(Icons.arrow_forward_ios_rounded, size: 13, color: color),
                    ]),
                  ),
                ),
              ),
            );
          }).toList(),
        ]),
      ),
    );
  }
}
