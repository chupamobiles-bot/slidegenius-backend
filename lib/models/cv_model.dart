class CvModel {
  // Personal Info
  String fullName;
  String title;
  String email;
  String phone;
  String location;
  String linkedin;
  String summary;

  // Experience
  List<WorkExperience> experience;

  // Education
  List<Education> education;

  // Skills
  List<String> skills;

  CvModel({
    this.fullName = '',
    this.title = '',
    this.email = '',
    this.phone = '',
    this.location = '',
    this.linkedin = '',
    this.summary = '',
    List<WorkExperience>? experience,
    List<Education>? education,
    List<String>? skills,
  })  : experience = experience ?? [WorkExperience()],
        education = education ?? [Education()],
        skills = skills ?? [];
}

class WorkExperience {
  String company;
  String role;
  String startDate;
  String endDate;
  String description;

  WorkExperience({
    this.company = '',
    this.role = '',
    this.startDate = '',
    this.endDate = '',
    this.description = '',
  });
}

class Education {
  String institution;
  String degree;
  String field;
  String year;

  Education({
    this.institution = '',
    this.degree = '',
    this.field = '',
    this.year = '',
  });
}
