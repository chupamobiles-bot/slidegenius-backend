import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'app/theme.dart';
import 'screens/splash/splash_screen.dart';
import 'services/purchase_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await PurchaseService.init();
  final prefs = await SharedPreferences.getInstance();
  final onboardingDone = prefs.getBool('onboarding_done') ?? false;
  runApp(SlideGeniusApp(showOnboarding: !onboardingDone));
}

class SlideGeniusApp extends StatelessWidget {
  final bool showOnboarding;
  const SlideGeniusApp({super.key, required this.showOnboarding});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'OfficePilot AI',
      theme: AppTheme.dark,
      debugShowCheckedModeBanner: false,
      home: SplashScreen(showOnboarding: showOnboarding),
    );
  }
}
