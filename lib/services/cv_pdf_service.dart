import 'dart:io';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:path_provider/path_provider.dart';
import '../models/cv_model.dart';

class CvPdfService {
  static const double _sw = 190.0; // sidebar width

  static Future<String> generatePdf(CvModel cv, {int template = 0}) async {
    switch (template) {
      case 1:
        return _emerald(cv);
      case 2:
        return _modern(cv);
      default:
        return _executive(cv);
    }
  }

  // ── TEMPLATE 0: EXECUTIVE (Navy Sidebar) ───────────────────────────────────
  static Future<String> _executive(CvModel cv) async {
    final doc = pw.Document();
    final sidebar = PdfColor.fromHex('#1A237E');
    final accent = PdfColor.fromHex('#3F51B5');
    final muted = PdfColor.fromHex('#9FA8DA');
    final bodyText = PdfColor.fromHex('#374151');

    doc.addPage(pw.Page(
      pageFormat: PdfPageFormat.a4,
      margin: pw.EdgeInsets.zero,
      build: (ctx) => pw.Row(
        crossAxisAlignment: pw.CrossAxisAlignment.start,
        children: [
          pw.Container(
            width: _sw,
            height: PdfPageFormat.a4.height,
            color: sidebar,
            padding: const pw.EdgeInsets.fromLTRB(18, 28, 18, 20),
            child: pw.Column(
              crossAxisAlignment: pw.CrossAxisAlignment.start,
              children: [
                _initials(cv.fullName, accent, PdfColors.white),
                pw.SizedBox(height: 14),
                pw.Text(cv.fullName,
                    style: pw.TextStyle(
                        font: pw.Font.helveticaBold(),
                        fontSize: 15,
                        color: PdfColors.white)),
                if (cv.title.isNotEmpty) ...[
                  pw.SizedBox(height: 4),
                  pw.Text(cv.title,
                      style: pw.TextStyle(
                          fontSize: 9,
                          color: muted,
                          fontStyle: pw.FontStyle.italic)),
                ],
                pw.SizedBox(height: 18),
                _sDivider(muted),
                pw.SizedBox(height: 14),
                _sLabel('CONTACT', muted),
                pw.SizedBox(height: 8),
                if (cv.email.isNotEmpty) _sItem(cv.email, muted),
                if (cv.phone.isNotEmpty) _sItem(cv.phone, muted),
                if (cv.location.isNotEmpty) _sItem(cv.location, muted),
                if (cv.linkedin.isNotEmpty) _sItem(cv.linkedin, muted),
                if (cv.skills.isNotEmpty) ...[
                  pw.SizedBox(height: 18),
                  _sDivider(muted),
                  pw.SizedBox(height: 14),
                  _sLabel('SKILLS', muted),
                  pw.SizedBox(height: 8),
                  pw.Wrap(
                    spacing: 4,
                    runSpacing: 4,
                    children: cv.skills
                        .map((s) => pw.Container(
                              padding: const pw.EdgeInsets.symmetric(
                                  horizontal: 8, vertical: 3),
                              decoration: pw.BoxDecoration(
                                color: accent,
                                borderRadius: const pw.BorderRadius.all(
                                    pw.Radius.circular(3)),
                              ),
                              child: pw.Text(s,
                                  style: pw.TextStyle(
                                      fontSize: 7.5,
                                      color: PdfColors.white,
                                      font: pw.Font.helveticaBold())),
                            ))
                        .toList(),
                  ),
                ],
                if (cv.education.any((e) => e.institution.isNotEmpty)) ...[
                  pw.SizedBox(height: 18),
                  _sDivider(muted),
                  pw.SizedBox(height: 14),
                  _sLabel('EDUCATION', muted),
                  pw.SizedBox(height: 8),
                  ...cv.education.where((e) => e.institution.isNotEmpty).map(
                        (e) => pw.Padding(
                          padding: const pw.EdgeInsets.only(bottom: 10),
                          child: pw.Column(
                            crossAxisAlignment: pw.CrossAxisAlignment.start,
                            children: [
                              pw.Text(
                                  '${e.degree}${e.field.isNotEmpty ? "\n${e.field}" : ""}',
                                  style: pw.TextStyle(
                                      fontSize: 8.5,
                                      color: PdfColors.white,
                                      font: pw.Font.helveticaBold())),
                              pw.Text(e.institution,
                                  style:
                                      pw.TextStyle(fontSize: 8, color: muted)),
                              if (e.year.isNotEmpty)
                                pw.Text(e.year,
                                    style: pw.TextStyle(
                                        fontSize: 7.5, color: muted)),
                            ],
                          ),
                        ),
                      ),
                ],
              ],
            ),
          ),
          pw.Expanded(
            child: pw.Container(
              height: PdfPageFormat.a4.height,
              color: PdfColors.white,
              padding: const pw.EdgeInsets.fromLTRB(28, 36, 28, 24),
              child: pw.Column(
                crossAxisAlignment: pw.CrossAxisAlignment.start,
                children: [
                  if (cv.summary.isNotEmpty) ...[
                    _mSection('PROFESSIONAL SUMMARY', accent),
                    pw.SizedBox(height: 8),
                    pw.Text(cv.summary,
                        style: pw.TextStyle(
                            fontSize: 9.5,
                            color: bodyText,
                            lineSpacing: 4,
                            font: pw.Font.helvetica())),
                    pw.SizedBox(height: 20),
                  ],
                  if (cv.experience.any((e) => e.company.isNotEmpty)) ...[
                    _mSection('WORK EXPERIENCE', accent),
                    pw.SizedBox(height: 10),
                    ...cv.experience
                        .where((e) => e.company.isNotEmpty)
                        .map((e) => _expBlock(e, accent, bodyText)),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    ));
    return _save(doc, cv);
  }

  // ── TEMPLATE 1: EMERALD (Green Sidebar) ────────────────────────────────────
  static Future<String> _emerald(CvModel cv) async {
    final doc = pw.Document();
    final sidebar = PdfColor.fromHex('#00695C');
    final accent = PdfColor.fromHex('#00897B');
    final muted = PdfColor.fromHex('#80CBC4');
    final bodyText = PdfColor.fromHex('#1F2937');
    final bgMain = PdfColor.fromHex('#FAFAFA');

    doc.addPage(pw.Page(
      pageFormat: PdfPageFormat.a4,
      margin: pw.EdgeInsets.zero,
      build: (ctx) => pw.Row(
        crossAxisAlignment: pw.CrossAxisAlignment.start,
        children: [
          pw.Container(
            width: _sw,
            height: PdfPageFormat.a4.height,
            color: sidebar,
            padding: const pw.EdgeInsets.fromLTRB(18, 28, 18, 20),
            child: pw.Column(
              crossAxisAlignment: pw.CrossAxisAlignment.start,
              children: [
                _initials(cv.fullName, accent, PdfColors.white),
                pw.SizedBox(height: 14),
                pw.Text(cv.fullName,
                    style: pw.TextStyle(
                        font: pw.Font.helveticaBold(),
                        fontSize: 15,
                        color: PdfColors.white)),
                if (cv.title.isNotEmpty) ...[
                  pw.SizedBox(height: 4),
                  pw.Text(cv.title,
                      style: pw.TextStyle(
                          fontSize: 9,
                          color: muted,
                          fontStyle: pw.FontStyle.italic)),
                ],
                pw.SizedBox(height: 18),
                _sDivider(muted),
                pw.SizedBox(height: 14),
                _sLabel('CONTACT', muted),
                pw.SizedBox(height: 8),
                if (cv.email.isNotEmpty) _sItem(cv.email, muted),
                if (cv.phone.isNotEmpty) _sItem(cv.phone, muted),
                if (cv.location.isNotEmpty) _sItem(cv.location, muted),
                if (cv.linkedin.isNotEmpty) _sItem(cv.linkedin, muted),
                if (cv.skills.isNotEmpty) ...[
                  pw.SizedBox(height: 18),
                  _sDivider(muted),
                  pw.SizedBox(height: 14),
                  _sLabel('SKILLS', muted),
                  pw.SizedBox(height: 8),
                  ...cv.skills.map((s) => pw.Padding(
                        padding: const pw.EdgeInsets.only(bottom: 6),
                        child: pw.Column(
                          crossAxisAlignment: pw.CrossAxisAlignment.start,
                          children: [
                            pw.Text(s,
                                style: pw.TextStyle(
                                    fontSize: 8.5, color: PdfColors.white)),
                            pw.SizedBox(height: 2),
                            pw.Container(
                                height: 2,
                                color: muted),
                          ],
                        ),
                      )),
                ],
                if (cv.education.any((e) => e.institution.isNotEmpty)) ...[
                  pw.SizedBox(height: 18),
                  _sDivider(muted),
                  pw.SizedBox(height: 14),
                  _sLabel('EDUCATION', muted),
                  pw.SizedBox(height: 8),
                  ...cv.education.where((e) => e.institution.isNotEmpty).map(
                        (e) => pw.Padding(
                          padding: const pw.EdgeInsets.only(bottom: 10),
                          child: pw.Column(
                            crossAxisAlignment: pw.CrossAxisAlignment.start,
                            children: [
                              pw.Text(
                                  '${e.degree}${e.field.isNotEmpty ? " - ${e.field}" : ""}',
                                  style: pw.TextStyle(
                                      fontSize: 8.5,
                                      color: PdfColors.white,
                                      font: pw.Font.helveticaBold())),
                              pw.Text(e.institution,
                                  style:
                                      pw.TextStyle(fontSize: 8, color: muted)),
                              if (e.year.isNotEmpty)
                                pw.Text(e.year,
                                    style: pw.TextStyle(
                                        fontSize: 7.5, color: muted)),
                            ],
                          ),
                        ),
                      ),
                ],
              ],
            ),
          ),
          pw.Expanded(
            child: pw.Container(
              height: PdfPageFormat.a4.height,
              color: bgMain,
              padding: const pw.EdgeInsets.fromLTRB(28, 36, 28, 24),
              child: pw.Column(
                crossAxisAlignment: pw.CrossAxisAlignment.start,
                children: [
                  if (cv.summary.isNotEmpty) ...[
                    _mSection('PROFESSIONAL SUMMARY', accent),
                    pw.SizedBox(height: 8),
                    pw.Text(cv.summary,
                        style: pw.TextStyle(
                            fontSize: 9.5,
                            color: bodyText,
                            lineSpacing: 4)),
                    pw.SizedBox(height: 20),
                  ],
                  if (cv.experience.any((e) => e.company.isNotEmpty)) ...[
                    _mSection('WORK EXPERIENCE', accent),
                    pw.SizedBox(height: 10),
                    ...cv.experience
                        .where((e) => e.company.isNotEmpty)
                        .map((e) => _expBlock(e, accent, bodyText)),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    ));
    return _save(doc, cv);
  }

  // ── TEMPLATE 2: MODERN (Bold Header) ───────────────────────────────────────
  static Future<String> _modern(CvModel cv) async {
    final doc = pw.Document();
    final header = PdfColor.fromHex('#0D47A1');
    final accent = PdfColor.fromHex('#1565C0');
    final light = PdfColor.fromHex('#E3F2FD');
    final bodyText = PdfColor.fromHex('#1F2937');
    final grey = PdfColor.fromHex('#6B7280');

    doc.addPage(pw.Page(
      pageFormat: PdfPageFormat.a4,
      margin: pw.EdgeInsets.zero,
      build: (ctx) => pw.Column(
        crossAxisAlignment: pw.CrossAxisAlignment.start,
        children: [
          // Header band
          pw.Container(
            width: PdfPageFormat.a4.width,
            color: header,
            padding:
                const pw.EdgeInsets.symmetric(horizontal: 36, vertical: 28),
            child: pw.Row(
              crossAxisAlignment: pw.CrossAxisAlignment.center,
              children: [
                _initials(cv.fullName, light, header),
                pw.SizedBox(width: 18),
                pw.Expanded(
                  child: pw.Column(
                    crossAxisAlignment: pw.CrossAxisAlignment.start,
                    children: [
                      pw.Text(cv.fullName,
                          style: pw.TextStyle(
                              font: pw.Font.helveticaBold(),
                              fontSize: 22,
                              color: PdfColors.white)),
                      if (cv.title.isNotEmpty) ...[
                        pw.SizedBox(height: 4),
                        pw.Text(cv.title,
                            style: pw.TextStyle(
                                fontSize: 11,
                                color: PdfColor.fromHex('#90CAF9'))),
                      ],
                    ],
                  ),
                ),
                pw.Column(
                  crossAxisAlignment: pw.CrossAxisAlignment.end,
                  children: [
                    if (cv.email.isNotEmpty)
                      _hContact(cv.email),
                    if (cv.phone.isNotEmpty)
                      _hContact(cv.phone),
                    if (cv.location.isNotEmpty)
                      _hContact(cv.location),
                    if (cv.linkedin.isNotEmpty)
                      _hContact(cv.linkedin),
                  ],
                ),
              ],
            ),
          ),
          // Body
          pw.Expanded(
            child: pw.Row(
              crossAxisAlignment: pw.CrossAxisAlignment.start,
              children: [
                // Left column
                pw.Container(
                  width: 175,
                  color: light,
                  padding: const pw.EdgeInsets.all(22),
                  child: pw.Column(
                    crossAxisAlignment: pw.CrossAxisAlignment.start,
                    children: [
                      if (cv.skills.isNotEmpty) ...[
                        _mSection('SKILLS', accent),
                        pw.SizedBox(height: 8),
                        ...cv.skills.map((s) => pw.Padding(
                              padding: const pw.EdgeInsets.only(bottom: 5),
                              child: pw.Row(children: [
                                pw.Container(
                                    width: 5,
                                    height: 5,
                                    decoration: pw.BoxDecoration(
                                        color: accent,
                                        shape: pw.BoxShape.circle)),
                                pw.SizedBox(width: 6),
                                pw.Expanded(
                                  child: pw.Text(s,
                                      style: pw.TextStyle(
                                          fontSize: 9, color: bodyText)),
                                ),
                              ]),
                            )),
                        pw.SizedBox(height: 18),
                      ],
                      if (cv.education.any((e) => e.institution.isNotEmpty)) ...[
                        _mSection('EDUCATION', accent),
                        pw.SizedBox(height: 8),
                        ...cv.education
                            .where((e) => e.institution.isNotEmpty)
                            .map((e) => pw.Padding(
                                  padding:
                                      const pw.EdgeInsets.only(bottom: 12),
                                  child: pw.Column(
                                    crossAxisAlignment:
                                        pw.CrossAxisAlignment.start,
                                    children: [
                                      pw.Text(
                                          '${e.degree}${e.field.isNotEmpty ? "\n${e.field}" : ""}',
                                          style: pw.TextStyle(
                                              fontSize: 9,
                                              font: pw.Font.helveticaBold(),
                                              color: bodyText)),
                                      pw.Text(e.institution,
                                          style: pw.TextStyle(
                                              fontSize: 8.5, color: grey)),
                                      if (e.year.isNotEmpty)
                                        pw.Text(e.year,
                                            style: pw.TextStyle(
                                                fontSize: 8,
                                                color: accent,
                                                font:
                                                    pw.Font.helveticaBold())),
                                    ],
                                  ),
                                )),
                      ],
                    ],
                  ),
                ),
                // Right column
                pw.Expanded(
                  child: pw.Container(
                    color: PdfColors.white,
                    padding: const pw.EdgeInsets.fromLTRB(24, 22, 24, 20),
                    child: pw.Column(
                      crossAxisAlignment: pw.CrossAxisAlignment.start,
                      children: [
                        if (cv.summary.isNotEmpty) ...[
                          _mSection('ABOUT ME', accent),
                          pw.SizedBox(height: 8),
                          pw.Text(cv.summary,
                              style: pw.TextStyle(
                                  fontSize: 9.5,
                                  color: bodyText,
                                  lineSpacing: 4)),
                          pw.SizedBox(height: 20),
                        ],
                        if (cv.experience
                            .any((e) => e.company.isNotEmpty)) ...[
                          _mSection('EXPERIENCE', accent),
                          pw.SizedBox(height: 10),
                          ...cv.experience
                              .where((e) => e.company.isNotEmpty)
                              .map((e) => _expBlock(e, accent, bodyText)),
                        ],
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    ));
    return _save(doc, cv);
  }

  // ── SHARED HELPERS ─────────────────────────────────────────────────────────
  static pw.Widget _initials(String name, PdfColor bg, PdfColor fg) {
    final parts = name.trim().split(' ');
    final i = parts.length >= 2
        ? '${parts.first[0]}${parts.last[0]}'.toUpperCase()
        : (name.isEmpty ? '?' : name[0].toUpperCase());
    return pw.Container(
      width: 54,
      height: 54,
      decoration: pw.BoxDecoration(color: bg, shape: pw.BoxShape.circle),
      alignment: pw.Alignment.center,
      child: pw.Text(i,
          style: pw.TextStyle(
              font: pw.Font.helveticaBold(), fontSize: 20, color: fg)),
    );
  }

  static pw.Widget _sLabel(String t, PdfColor c) => pw.Text(t,
      style: pw.TextStyle(
          fontSize: 8,
          font: pw.Font.helveticaBold(),
          color: c,
          letterSpacing: 1.5));

  static pw.Widget _sItem(String t, PdfColor c) => pw.Padding(
      padding: const pw.EdgeInsets.only(bottom: 4),
      child: pw.Text(t,
          style: pw.TextStyle(fontSize: 8.5, color: c),
          maxLines: 2,
          overflow: pw.TextOverflow.clip));

  static pw.Widget _sDivider(PdfColor c) =>
      pw.Container(height: 0.5, color: c);

  static pw.Widget _mSection(String title, PdfColor accent) => pw.Column(
        crossAxisAlignment: pw.CrossAxisAlignment.start,
        children: [
          pw.Text(title,
              style: pw.TextStyle(
                  font: pw.Font.helveticaBold(),
                  fontSize: 10,
                  color: accent,
                  letterSpacing: 1.2)),
          pw.SizedBox(height: 3),
          pw.Container(height: 2, width: 36, color: accent),
        ],
      );

  static pw.Widget _expBlock(
      WorkExperience e, PdfColor accent, PdfColor body) =>
      pw.Padding(
        padding: const pw.EdgeInsets.only(bottom: 14),
        child: pw.Column(
          crossAxisAlignment: pw.CrossAxisAlignment.start,
          children: [
            pw.Row(
              mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
              children: [
                pw.Expanded(
                  child: pw.Text(e.role,
                      style: pw.TextStyle(
                          font: pw.Font.helveticaBold(),
                          fontSize: 10.5,
                          color: body)),
                ),
                pw.Text(
                    '${e.startDate} - ${e.endDate.isEmpty ? "Present" : e.endDate}',
                    style: pw.TextStyle(
                        fontSize: 8.5,
                        color: accent,
                        font: pw.Font.helveticaBold())),
              ],
            ),
            pw.SizedBox(height: 2),
            pw.Text(e.company,
                style: pw.TextStyle(
                    fontSize: 9.5,
                    color: PdfColor.fromHex('#6B7280'),
                    fontStyle: pw.FontStyle.italic)),
            if (e.description.isNotEmpty) ...[
              pw.SizedBox(height: 5),
              pw.Text(e.description,
                  style: pw.TextStyle(
                      fontSize: 9, color: body, lineSpacing: 3)),
            ],
          ],
        ),
      );

  static pw.Widget _hContact(String text) => pw.Padding(
      padding: const pw.EdgeInsets.only(bottom: 3),
      child: pw.Text(text,
          style:
              pw.TextStyle(fontSize: 8.5, color: PdfColor.fromHex('#BBDEFB'))));

  static Future<String> _save(pw.Document doc, CvModel cv) async {
    final dir = await getDownloadsDirectory() ??
        await getApplicationDocumentsDirectory();
    final slug = cv.fullName.isEmpty
        ? 'cv'
        : cv.fullName.toLowerCase().replaceAll(RegExp(r'\s+'), '_');
    final file = File('${dir.path}/${slug}_cv.pdf');
    await file.writeAsBytes(await doc.save());
    return file.path;
  }
}
