import 'package:flutter/material.dart';
import '../../services/purchase_service.dart';
import '../../services/usage_service.dart';

class ProScreen extends StatefulWidget {
  const ProScreen({super.key});

  @override
  State<ProScreen> createState() => _ProScreenState();
}

class _ProScreenState extends State<ProScreen> {
  bool _loading = false;
  String _price = '\$4.99';

  @override
  void initState() {
    super.initState();
    _loadPrice();
  }

  Future<void> _loadPrice() async {
    final p = await PurchaseService.getPrice();
    if (mounted && p != null) setState(() => _price = p);
  }

  Future<void> _buy() async {
    setState(() => _loading = true);
    try {
      final ok = await PurchaseService.buyPro();
      if (!ok && mounted) {
        _snack('Purchase could not be started. Check Play Store connection.');
      }
    } catch (e) {
      if (mounted) _snack('Error: $e');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _restore() async {
    setState(() => _loading = true);
    try {
      await PurchaseService.restorePurchases();
      await Future.delayed(const Duration(seconds: 2));
      if (!mounted) return;
      final isPro = await UsageService.isPro();
      if (isPro) {
        _snack('✅ Pro restored successfully!');
        Navigator.pop(context, true);
      } else {
        _snack('No previous purchase found.');
      }
    } catch (e) {
      if (mounted) _snack('Restore failed: $e');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _snack(String msg) =>
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0A12),
      body: Stack(
        children: [
          // Background gradient
          Container(
            decoration: const BoxDecoration(
              gradient: RadialGradient(
                center: Alignment(0, -0.4),
                radius: 0.8,
                colors: [Color(0xFF1E1B4B), Color(0xFF0A0A12)],
              ),
            ),
          ),
          SafeArea(
            child: Column(
              children: [
                // Close button
                Align(
                  alignment: Alignment.topRight,
                  child: IconButton(
                    icon: const Icon(Icons.close, color: Colors.white54),
                    onPressed: () => Navigator.pop(context),
                  ),
                ),

                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.fromLTRB(24, 0, 24, 0),
                    child: Column(
                      children: [
                        // Icon + title
                        Container(
                          width: 80,
                          height: 80,
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [Color(0xFF6366F1), Color(0xFF8B5CF6)],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                            borderRadius: BorderRadius.circular(24),
                            boxShadow: [
                              BoxShadow(
                                color: const Color(0xFF6366F1).withOpacity(0.5),
                                blurRadius: 30,
                                spreadRadius: 2,
                              ),
                            ],
                          ),
                          child: const Icon(Icons.auto_awesome,
                              color: Colors.white, size: 40),
                        ),
                        const SizedBox(height: 20),
                        const Text(
                          'OfficePilot AI Pro',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 26,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                        const SizedBox(height: 8),
                        const Text(
                          'Unlock unlimited AI power — one time, forever.',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            color: Colors.white54,
                            fontSize: 14,
                            height: 1.5,
                          ),
                        ),
                        const SizedBox(height: 32),

                        // Price badge
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 24, vertical: 14),
                          decoration: BoxDecoration(
                            border: Border.all(
                                color: const Color(0xFF6366F1), width: 1.5),
                            borderRadius: BorderRadius.circular(16),
                            color: const Color(0xFF6366F1).withOpacity(0.1),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                _price,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 32,
                                  fontWeight: FontWeight.w900,
                                ),
                              ),
                              const SizedBox(width: 12),
                              const Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text('One-Time',
                                      style: TextStyle(
                                          color: Color(0xFF6366F1),
                                          fontWeight: FontWeight.w700,
                                          fontSize: 13)),
                                  Text('Pay once, use forever',
                                      style: TextStyle(
                                          color: Colors.white54, fontSize: 11)),
                                ],
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 32),

                        // Feature list
                        _featureList(),
                        const SizedBox(height: 32),

                        // Free tier reminder
                        Container(
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.05),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                                color: Colors.white12),
                          ),
                          child: const Row(
                            children: [
                              Icon(Icons.info_outline,
                                  color: Colors.white38, size: 16),
                              SizedBox(width: 10),
                              Expanded(
                                child: Text(
                                  'Free plan: 5 generations per day. Pro: unlimited forever.',
                                  style: TextStyle(
                                      color: Colors.white38, fontSize: 12),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 32),
                      ],
                    ),
                  ),
                ),

                // Buy button
                Padding(
                  padding: const EdgeInsets.fromLTRB(24, 0, 24, 16),
                  child: Column(
                    children: [
                      SizedBox(
                        width: double.infinity,
                        child: _loading
                            ? const Center(
                                child: CircularProgressIndicator(
                                    color: Color(0xFF6366F1)))
                            : ElevatedButton(
                                onPressed: _buy,
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFF6366F1),
                                  minimumSize: const Size(0, 56),
                                  shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(16)),
                                  elevation: 8,
                                  shadowColor: const Color(0xFF6366F1)
                                      .withOpacity(0.5),
                                ),
                                child: const Text(
                                  'Unlock Pro — Pay Once',
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w700,
                                    color: Colors.white,
                                  ),
                                ),
                              ),
                      ),
                      const SizedBox(height: 12),
                      TextButton(
                        onPressed: _loading ? null : _restore,
                        child: const Text(
                          'Restore Previous Purchase',
                          style: TextStyle(
                              color: Colors.white38, fontSize: 13),
                        ),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Secure payment via Google Play. No subscription, no hidden fees.',
                        textAlign: TextAlign.center,
                        style:
                            TextStyle(color: Colors.white24, fontSize: 11),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _featureList() {
    const features = [
      ('Unlimited presentations', 'No daily cap, generate as many as you want'),
      ('Unlimited documents', 'All 12 document types, any length'),
      ('Unlimited CV builds', 'Full PDF exports with all 3 templates'),
      ('LinkedIn CV Import', 'AI auto-fills your entire CV from LinkedIn'),
      ('All 6 elite templates', 'Obsidian, Catalyst, Sovereign, Aurum, Vantage, Ignite'),
      ('Priority AI quality', 'McKinsey-level content on every generation'),
      ('All future features', 'Every new feature we add, at no extra cost'),
    ];
    return Column(
      children: features
          .map((f) => Padding(
                padding: const EdgeInsets.only(bottom: 14),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 22,
                      height: 22,
                      decoration: BoxDecoration(
                        color: const Color(0xFF6366F1).withOpacity(0.2),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.check,
                          color: Color(0xFF6366F1), size: 14),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(f.$1,
                              style: const TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.w600,
                                  fontSize: 14)),
                          Text(f.$2,
                              style: const TextStyle(
                                  color: Colors.white38, fontSize: 12)),
                        ],
                      ),
                    ),
                  ],
                ),
              ))
          .toList(),
    );
  }
}
