import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class AppTheme {
  // Brand colours
  static const Color primary      = Color(0xFF6366F1); // indigo
  static const Color primaryDeep  = Color(0xFF4F46E5);
  static const Color secondary    = Color(0xFF8B5CF6);
  static const Color accent       = Color(0xFF3B82F6); // blue accent

  // Light blue-white surfaces
  static const Color surface      = Color(0xFFF0F5FF); // very light lavender-white
  static const Color cardBg       = Colors.white;
  static const Color inputBg      = Colors.white;
  static const Color dividerColor = Color(0xFFDDE8FF);

  // Text colours (navy on light bg)
  static const Color textDark     = Color(0xFF0F2051); // deep navy
  static const Color textMid      = Color(0xFF2E4A8B); // medium blue-navy
  static const Color textSoft     = Color(0xFF7B96C8); // soft blue-gray

  // Nav / AppBar colour
  static const Color navBg        = Color(0xFF0D1F4E); // deep navy blue

  // Hero gradient (home — kept dark for contrast)
  static const LinearGradient heroGradient = LinearGradient(
    colors: [Color(0xFF1A1A2E), Color(0xFF16213E), Color(0xFF0F3460)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  // Feature card gradients (unchanged)
  static const LinearGradient presentationGrad = LinearGradient(
    colors: [Color(0xFF6C63FF), Color(0xFFBC6BFF)],
    begin: Alignment.topLeft, end: Alignment.bottomRight,
  );
  static const LinearGradient cvGrad = LinearGradient(
    colors: [Color(0xFF11998E), Color(0xFF38EF7D)],
    begin: Alignment.topLeft, end: Alignment.bottomRight,
  );
  static const LinearGradient documentGrad = LinearGradient(
    colors: [Color(0xFFFF6348), Color(0xFFFFBE76)],
    begin: Alignment.topLeft, end: Alignment.bottomRight,
  );

  static ThemeData get dark {
    SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: Color(0xFF0D1F4E),
      systemNavigationBarIconBrightness: Brightness.light,
    ));

    return ThemeData(
      useMaterial3: true,
      fontFamily: 'Roboto',
      brightness: Brightness.light, // light mode — white cards read well
      colorScheme: ColorScheme.fromSeed(
        seedColor: primary,
        brightness: Brightness.light,
        surface: surface,
      ),
      scaffoldBackgroundColor: surface,
      appBarTheme: const AppBarTheme(
        backgroundColor: navBg,  // deep navy AppBar
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        titleTextStyle: TextStyle(
          color: Colors.white,
          fontSize: 19,
          fontWeight: FontWeight.w700,
          letterSpacing: -0.4,
        ),
        iconTheme: IconThemeData(color: Colors.white),
      ),
      cardTheme: CardThemeData(
        elevation: 0,
        color: cardBg,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: Color(0xFFDDE8FF)),
        ),
      ),
      inputDecorationTheme: const InputDecorationTheme(
        filled: true,
        fillColor: Colors.white,
        contentPadding: EdgeInsets.symmetric(horizontal: 18, vertical: 16),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.all(Radius.circular(14)),
          borderSide: BorderSide(color: Color(0xFFD0E1FF)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.all(Radius.circular(14)),
          borderSide: BorderSide(color: Color(0xFFD0E1FF)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.all(Radius.circular(14)),
          borderSide: BorderSide(color: primary, width: 2),
        ),
        hintStyle: TextStyle(color: Color(0xFF7B96C8), fontSize: 14),
        labelStyle: TextStyle(color: Color(0xFF2E4A8B)),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primary,
          foregroundColor: Colors.white,
          minimumSize: const Size(double.infinity, 54),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          elevation: 0,
          textStyle: const TextStyle(
              fontSize: 16, fontWeight: FontWeight.w700, letterSpacing: 0.3),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          minimumSize: const Size(double.infinity, 54),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          side: const BorderSide(color: primary, width: 1.5),
          foregroundColor: primary,
          textStyle: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
        ),
      ),
      sliderTheme: const SliderThemeData(
        activeTrackColor: primary,
        inactiveTrackColor: Color(0xFFDDE8FF),
        thumbColor: primary,
        overlayColor: Color(0x206366F1),
        trackHeight: 4,
      ),
      tabBarTheme: const TabBarThemeData(
        labelColor: primary,
        unselectedLabelColor: Color(0xFF7B96C8),
        indicatorColor: primary,
        labelStyle: TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
        unselectedLabelStyle:
            TextStyle(fontWeight: FontWeight.w500, fontSize: 13),
      ),
      bottomSheetTheme: const BottomSheetThemeData(
        backgroundColor: Colors.white,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
      ),
      dividerTheme: const DividerThemeData(color: Color(0xFFDDE8FF)),
      chipTheme: const ChipThemeData(
        backgroundColor: Color(0xFFEEF2FF),
        labelStyle: TextStyle(color: Color(0xFF6366F1), fontSize: 12),
        deleteIconColor: Color(0xFF6366F1),
        side: BorderSide(color: Color(0xFFC7D7FF)),
      ),
    );
  }

  // Light alias so main.dart doesn't need changing
  static ThemeData get light => dark;
}
