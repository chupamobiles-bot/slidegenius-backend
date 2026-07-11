import 'package:flutter/material.dart';
import 'app/theme.dart';
import 'screens/home/home_screen.dart';

void main() {
  runApp(const SlideGeniusApp());
}

class SlideGeniusApp extends StatelessWidget {
  const SlideGeniusApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SlideGenius',
      theme: AppTheme.light,
      debugShowCheckedModeBanner: false,
      home: const HomeScreen(),
    );
  }
}
