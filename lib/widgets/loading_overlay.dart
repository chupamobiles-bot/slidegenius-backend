import 'package:flutter/material.dart';
import '../app/theme.dart';

class LoadingOverlay extends StatefulWidget {
  final String message;
  final Color color;

  const LoadingOverlay({
    super.key,
    this.message = 'Generating with AI...',
    this.color = AppTheme.primary,
  });

  @override
  State<LoadingOverlay> createState() => _LoadingOverlayState();
}

class _LoadingOverlayState extends State<LoadingOverlay> with TickerProviderStateMixin {
  late AnimationController _rotCtrl;
  late AnimationController _pulseCtrl;
  late AnimationController _dotCtrl;
  late Animation<double> _rot;
  late Animation<double> _pulse;
  late Animation<double> _dotAnim;

  final _tips = [
    'Analyzing your topic...',
    'Writing expert content...',
    'Designing slide layouts...',
    'Adding stats & insights...',
    'Polishing the final output...',
  ];
  int _tipIdx = 0;

  @override
  void initState() {
    super.initState();
    _rotCtrl   = AnimationController(vsync: this, duration: const Duration(seconds: 2))..repeat();
    _pulseCtrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 1400))..repeat(reverse: true);
    _dotCtrl   = AnimationController(vsync: this, duration: const Duration(seconds: 4))..repeat();
    _rot   = Tween(begin: 0.0, end: 1.0).animate(_rotCtrl);
    _pulse = Tween(begin: 0.9, end: 1.1).animate(CurvedAnimation(parent: _pulseCtrl, curve: Curves.easeInOut));
    _dotAnim = Tween(begin: 0.0, end: 1.0).animate(_dotCtrl);

    // Cycle tips
    Future.doWhile(() async {
      await Future.delayed(const Duration(milliseconds: 1800));
      if (!mounted) return false;
      setState(() => _tipIdx = (_tipIdx + 1) % _tips.length);
      return true;
    });
  }

  @override
  void dispose() {
    _rotCtrl.dispose();
    _pulseCtrl.dispose();
    _dotCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.black.withOpacity(0.65),
      child: Center(
        child: Container(
          margin: const EdgeInsets.symmetric(horizontal: 32),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(28),
            boxShadow: [
              BoxShadow(color: widget.color.withOpacity(0.25), blurRadius: 40, offset: const Offset(0, 16)),
              BoxShadow(color: Colors.black.withOpacity(0.12), blurRadius: 20, offset: const Offset(0, 8)),
            ],
          ),
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            // Top gradient strip
            Container(
              height: 5,
              decoration: BoxDecoration(
                gradient: LinearGradient(colors: [widget.color, AppTheme.accent]),
                borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
              ),
            ),

            Padding(
              padding: const EdgeInsets.fromLTRB(28, 30, 28, 28),
              child: Column(mainAxisSize: MainAxisSize.min, children: [
                // Animated icon
                AnimatedBuilder(
                  animation: _pulse,
                  builder: (_, child) => Transform.scale(scale: _pulse.value, child: child),
                  child: AnimatedBuilder(
                    animation: _rot,
                    builder: (_, __) => Stack(alignment: Alignment.center, children: [
                      // Outer ring
                      SizedBox(width: 80, height: 80,
                        child: CircularProgressIndicator(
                          value: _rot.value,
                          color: widget.color.withOpacity(0.15),
                          backgroundColor: Colors.transparent,
                          strokeWidth: 6,
                        ),
                      ),
                      // Inner spinner
                      SizedBox(width: 60, height: 60,
                        child: CircularProgressIndicator(
                          color: widget.color,
                          backgroundColor: widget.color.withOpacity(0.1),
                          strokeWidth: 4,
                        ),
                      ),
                      // Center icon
                      Container(
                        width: 36, height: 36,
                        decoration: BoxDecoration(
                          gradient: LinearGradient(colors: [widget.color, AppTheme.secondary]),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.auto_awesome, color: Colors.white, size: 18),
                      ),
                    ]),
                  ),
                ),

                const SizedBox(height: 24),

                // Main message
                Text(widget.message,
                  textAlign: TextAlign.center,
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppTheme.textDark, letterSpacing: -0.2)),

                const SizedBox(height: 8),

                // Animated tip
                AnimatedSwitcher(
                  duration: const Duration(milliseconds: 400),
                  child: Text(
                    _tips[_tipIdx],
                    key: ValueKey(_tipIdx),
                    textAlign: TextAlign.center,
                    style: TextStyle(color: widget.color, fontSize: 13, fontWeight: FontWeight.w500),
                  ),
                ),

                const SizedBox(height: 20),

                // Animated dots progress
                AnimatedBuilder(
                  animation: _dotAnim,
                  builder: (_, __) {
                    return Row(mainAxisSize: MainAxisSize.min, children: List.generate(5, (i) {
                      final progress = (_dotAnim.value * 5 - i).clamp(0.0, 1.0);
                      return Container(
                        width: 8, height: 8,
                        margin: const EdgeInsets.symmetric(horizontal: 3),
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: Color.lerp(widget.color.withOpacity(0.2), widget.color, progress),
                        ),
                      );
                    }));
                  },
                ),

                const SizedBox(height: 16),

                Text('Usually ready in 20–40 seconds',
                  style: TextStyle(color: AppTheme.textSoft, fontSize: 11)),
              ]),
            ),
          ]),
        ),
      ),
    );
  }
}
