import 'package:flutter/material.dart';
import 'package:open_filex/open_filex.dart';
import 'package:share_plus/share_plus.dart';
import '../../services/history_service.dart';

class PresentationResultScreen extends StatefulWidget {
  final String topic;
  final String filePath;

  const PresentationResultScreen({
    super.key,
    required this.topic,
    required this.filePath,
  });

  @override
  State<PresentationResultScreen> createState() => _PresentationResultScreenState();
}

class _PresentationResultScreenState extends State<PresentationResultScreen> {
  @override
  void initState() {
    super.initState();
    _saveToHistory();
  }

  Future<void> _saveToHistory() async {
    await HistoryService.addItem(HistoryItem(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      title: widget.topic,
      type: 'presentation',
      filePath: widget.filePath,
      createdAt: DateTime.now().toIso8601String(),
      emoji: '📊',
    ));
  }

  @override
  Widget build(BuildContext context) {
    final fileName = widget.filePath.split('/').last;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('Presentation Ready'),
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
                colors: [Color(0xFF6366F1), Color(0xFF8B5CF6)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF6366F1).withOpacity(0.4),
                  blurRadius: 30, offset: const Offset(0, 10),
                ),
              ],
            ),
            child: const Icon(Icons.check_rounded, color: Colors.white, size: 50),
          ),
          const SizedBox(height: 24),
          const Text(
            '🎉  Presentation Created!',
            style: TextStyle(
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
              border: Border.all(color: const Color(0xFFE0E7FF)),
            ),
            child: Row(children: [
              Container(
                width: 48, height: 48,
                decoration: BoxDecoration(
                  color: const Color(0xFFEEF2FF),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.slideshow_rounded, color: Color(0xFF6366F1), size: 26),
              ),
              const SizedBox(width: 14),
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(
                  fileName,
                  style: const TextStyle(
                    fontWeight: FontWeight.w600, fontSize: 13, color: Color(0xFF1E1B4B)),
                  overflow: TextOverflow.ellipsis,
                ),
                const Text('Saved to Downloads',
                  style: TextStyle(color: Color(0xFF64748B), fontSize: 11)),
              ])),
              const Icon(Icons.check_circle, color: Color(0xFF059669), size: 20),
            ]),
          ),
          const SizedBox(height: 20),

          // Open
          ElevatedButton.icon(
            onPressed: () async {
              final result = await OpenFilex.open(
                widget.filePath,
                type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
              );
              if (result.type != ResultType.done && context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: const Text('Install WPS Office or PowerPoint to open .pptx files'),
                    action: SnackBarAction(
                      label: 'Share',
                      onPressed: () => Share.shareXFiles(
                        [XFile(widget.filePath)], text: 'Presentation: ${widget.topic}'),
                    ),
                  ),
                );
              }
            },
            icon: const Icon(Icons.open_in_new_rounded),
            label: const Text('Open Presentation'),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF6366F1),
              minimumSize: const Size(double.infinity, 52),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            ),
          ),
          const SizedBox(height: 12),

          OutlinedButton.icon(
            onPressed: () => Share.shareXFiles(
              [XFile(widget.filePath)], text: 'Presentation: ${widget.topic}'),
            icon: const Icon(Icons.share_rounded),
            label: const Text('Share File'),
            style: OutlinedButton.styleFrom(
              minimumSize: const Size(double.infinity, 52),
              foregroundColor: const Color(0xFF6366F1),
              side: const BorderSide(color: Color(0xFF6366F1)),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            ),
          ),
          const SizedBox(height: 12),

          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('← Make Another Presentation',
              style: TextStyle(color: Color(0xFF6366F1))),
          ),
          const SizedBox(height: 40),
        ]),
      ),
    );
  }
}
