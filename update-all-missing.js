const fs = require('fs');
const path = require('path');

const updates = {
  en: {
    home: {
      applicationStatus: "Application Status",
      hrInviteTitle: "HR Invite",
      allLocations: "All Locations",
      allAreas: "All Areas",
      anywhere: "Anywhere"
    },
    locationScreen: {
      searchPlaceholder: "Search city or area...",
      selectCity: "Select City"
    },
    allJobs: {
      clearFilters: "Clear Filters"
    },
    jobDetail: {
      fresher: "Fresher",
      workLocation: "Work Location",
      workingDays: "Working Days",
      shifts: "Shifts",
      salaryIncentives: "Salary & Incentives",
      baseSalary: "Base Salary",
      salaryType: "Salary Type",
      incentives: "Incentives",
      bonus: "Bonus",
      requirements: "Requirements",
      ageRequirement: "Age Requirement",
      languages: "Languages",
      requiredAssets: "Required Assets",
      certifications: "Certifications",
      skillsRequired: "Skills Required",
      interviewDetails: "Interview Details",
      interviewType: "Interview Type",
      callTimings: "Call Timings",
      interviewLocation: "Interview Location",
      depositsFees: "Deposits & Fees",
      depositAmount: "Deposit Amount",
      feeWarning: "Fee Warning",
      purpose: "Purpose",
      takenWhen: "Taken When",
      joiningFee: "Joining Fee",
      yes: "Yes",
      perksBenefits: "Perks & Benefits",
      similarJobs: "Similar Jobs"
    },
    profileJobPreferences: {
      expectedMonthlySalary: "Expected Monthly Salary",
      languages: "Languages"
    }
  },
  hi: {
    home: {
      applicationStatus: "आवेदन की स्थिति",
      hrInviteTitle: "HR आमंत्रण",
      allLocations: "सभी स्थान",
      allAreas: "सभी क्षेत्र",
      anywhere: "कहीं भी"
    },
    locationScreen: {
      searchPlaceholder: "शहर या क्षेत्र खोजें...",
      selectCity: "शहर चुनें"
    },
    allJobs: {
      clearFilters: "फ़िल्टर हटाएं"
    },
    jobDetail: {
      fresher: "फ्रेशर",
      workLocation: "काम का स्थान",
      workingDays: "काम के दिन",
      shifts: "शिफ्ट",
      salaryIncentives: "वेतन और प्रोत्साहन",
      baseSalary: "मूल वेतन",
      salaryType: "वेतन प्रकार",
      incentives: "प्रोत्साहन",
      bonus: "बोनस",
      requirements: "आवश्यकताएं",
      ageRequirement: "आयु आवश्यकता",
      languages: "भाषाएं",
      requiredAssets: "आवश्यक संपत्तियां",
      certifications: "प्रमाणपत्र",
      skillsRequired: "आवश्यक कौशल",
      interviewDetails: "साक्षात्कार विवरण",
      interviewType: "साक्षात्कार का प्रकार",
      callTimings: "कॉल का समय",
      interviewLocation: "साक्षात्कार का स्थान",
      depositsFees: "जमा और शुल्क",
      depositAmount: "जमा राशि",
      feeWarning: "शुल्क चेतावनी",
      purpose: "उद्देश्य",
      takenWhen: "कब लिया गया",
      joiningFee: "शामिल होने का शुल्क",
      yes: "हां",
      perksBenefits: "सुविधाएं और लाभ",
      similarJobs: "समान नौकरियां"
    },
    profileJobPreferences: {
      expectedMonthlySalary: "अपेक्षित मासिक वेतन",
      languages: "भाषाएं"
    }
  },
  mr: {
    home: {
      applicationStatus: "अर्जाची स्थिती",
      hrInviteTitle: "HR आमंत्रण",
      allLocations: "सर्व ठिकाणे",
      allAreas: "सर्व क्षेत्रे",
      anywhere: "कुठेही"
    },
    locationScreen: {
      searchPlaceholder: "शहर किंवा क्षेत्र शोधा...",
      selectCity: "शहर निवडा"
    },
    allJobs: {
      clearFilters: "फिल्टर काढा"
    },
    jobDetail: {
      fresher: "फ्रेशर",
      workLocation: "कामाचे ठिकाण",
      workingDays: "कामाचे दिवस",
      shifts: "शिफ्ट्स",
      salaryIncentives: "पगार आणि प्रोत्साहन",
      baseSalary: "मूळ पगार",
      salaryType: "पगाराचा प्रकार",
      incentives: "प्रोत्साहन",
      bonus: "बोनस",
      requirements: "आवश्यकता",
      ageRequirement: "वयाची अट",
      languages: "भाषा",
      requiredAssets: "आवश्यक मालमत्ता",
      certifications: "प्रमाणपत्रे",
      skillsRequired: "आवश्यक कौशल्ये",
      interviewDetails: "मुलाखतीचे तपशील",
      interviewType: "मुलाखतीचा प्रकार",
      callTimings: "कॉलची वेळ",
      interviewLocation: "मुलाखतीचे ठिकाण",
      depositsFees: "ठेवी आणि शुल्क",
      depositAmount: "ठेवीची रक्कम",
      feeWarning: "शुल्क चेतावणी",
      purpose: "उद्देश",
      takenWhen: "कधी घेतले जाते",
      joiningFee: "सामील होण्याचे शुल्क",
      yes: "होय",
      perksBenefits: "सुविधा आणि फायदे",
      similarJobs: "समान नोकऱ्या"
    },
    profileJobPreferences: {
      expectedMonthlySalary: "अपेक्षित मासिक पगार",
      languages: "भाषा"
    }
  },
  kn: {
    home: {
      applicationStatus: "ಅರ್ಜಿ ಸ್ಥಿತಿ",
      hrInviteTitle: "HR ಆಹ್ವಾನ",
      allLocations: "ಎಲ್ಲಾ ಸ್ಥಳಗಳು",
      allAreas: "ಎಲ್ಲಾ ಪ್ರದೇಶಗಳು",
      anywhere: "ಎಲ್ಲಿಯಾದರೂ"
    },
    locationScreen: {
      searchPlaceholder: "ನಗರ ಅಥವಾ ಪ್ರದೇಶವನ್ನು ಹುಡುಕಿ...",
      selectCity: "ನಗರವನ್ನು ಆಯ್ಕೆಮಾಡಿ"
    },
    allJobs: {
      clearFilters: "ಫಿಲ್ಟರ್‌ಗಳನ್ನು ತೆಗೆದುಹಾಕಿ"
    },
    jobDetail: {
      fresher: "ಫ್ರೆಶರ್",
      workLocation: "ಕೆಲಸದ ಸ್ಥಳ",
      workingDays: "ಕೆಲಸದ ದಿನಗಳು",
      shifts: "ಶಿಫ್ಟ್‌ಗಳು",
      salaryIncentives: "ವೇತನ ಮತ್ತು ಪ್ರೋತ್ಸಾಹಕಗಳು",
      baseSalary: "ಮೂಲ ವೇತನ",
      salaryType: "ವೇತನ ಪ್ರಕಾರ",
      incentives: "ಪ್ರೋತ್ಸಾಹಕಗಳು",
      bonus: "ಬೋನಸ್",
      requirements: "ಅಗತ್ಯತೆಗಳು",
      ageRequirement: "ವಯಸ್ಸಿನ ಅಗತ್ಯತೆ",
      languages: "ಭಾಷೆಗಳು",
      requiredAssets: "ಅಗತ್ಯ ಸ್ವತ್ತುಗಳು",
      certifications: "ಪ್ರಮಾಣೀಕರಣಗಳು",
      skillsRequired: "ಅಗತ್ಯವಿರುವ ಕೌಶಲ್ಯಗಳು",
      interviewDetails: "ಸಂದರ್ಶನದ ವಿವರಗಳು",
      interviewType: "ಸಂದರ್ಶನ ಪ್ರಕಾರ",
      callTimings: "ಕರೆ ಸಮಯಗಳು",
      interviewLocation: "ಸಂದರ್ಶನದ ಸ್ಥಳ",
      depositsFees: "ಠೇವಣಿಗಳು ಮತ್ತು ಶುಲ್ಕಗಳು",
      depositAmount: "ಠೇವಣಿ ಮೊತ್ತ",
      feeWarning: "ಶುಲ್ಕ ಎಚ್ಚರಿಕೆ",
      purpose: "ಉದ್ದೇಶ",
      takenWhen: "ಯಾವಾಗ ತೆಗೆದುಕೊಳ್ಳಲಾಗಿದೆ",
      joiningFee: "ಸೇರುವ ಶುಲ್ಕ",
      yes: "ಹೌದು",
      perksBenefits: "ಸವಲತ್ತುಗಳು ಮತ್ತು ಪ್ರಯೋಜನಗಳು",
      similarJobs: "ಸಮಾನ ಉದ್ಯೋಗಗಳು"
    },
    profileJobPreferences: {
      expectedMonthlySalary: "ನಿರೀಕ್ಷಿತ ಮಾಸಿಕ ವೇತನ",
      languages: "ಭಾಷೆಗಳು"
    }
  }
};

for (const [lang, data] of Object.entries(updates)) {
  const filePath = path.join(__dirname, `src/i18n/locales/${lang}.json`);
  let fileData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  for (const [section, translations] of Object.entries(data)) {
    if (!fileData[section]) fileData[section] = {};
    Object.assign(fileData[section], translations);
  }

  fs.writeFileSync(filePath, JSON.stringify(fileData, null, 2), 'utf8');
}
console.log('All missing translations updated successfully.');
