// ✅ NUOVO CALCOLO: 50% QUIZ + 30% TEST PRATICI + 20% AGE/BMI
const calculateFinalLevel = (practicalExercises: AssessmentExercise[]): LevelResult => {
  console.log('[ASSESSMENT] 🧮 Calculating final level (NEW FORMULA)...');
  
  const bodyweight = onboardingData.personalInfo?.weight || 70;
  const height = onboardingData.personalInfo?.height || 175;
  const age = onboardingData.personalInfo?.age || 30;
  const gender = onboardingData.personalInfo?.gender || 'male';
  
  // ===== 1. QUIZ SCORE (50%) =====
  const quizScore = quizData.score || 0; // 0-100
  console.log(`[ASSESSMENT] 📚 Quiz Score (50%): ${quizScore}%`);

  // ===== 2. PRACTICAL SCORE (30%) =====
  let practicalScore = 0;
  
  if (isGym) {
    const standards = {
      'Squat': gender === 'male' ? 1.5 : 1.0,
      'Stacco da terra': gender === 'male' ? 2.0 : 1.3,
      'Panca piana': gender === 'male' ? 1.0 : 0.6,
      'Trazioni/Lat machine': gender === 'male' ? 1.0 : 0.8,
      'Military press': gender === 'male' ? 0.75 : 0.5,
      'Pulley basso': gender === 'male' ? 0.9 : 0.7
    };
    
    let totalScore = 0;
    let count = 0;
    
    practicalExercises.forEach(ex => {
      if (ex.rm10 && ex.rm10 > 0) {
        const estimated1RM = ex.rm10 * 1.33;
        const relativeStrength = estimated1RM / bodyweight;
        const standard = standards[ex.name as keyof typeof standards] || 1.0;
        const percentOfStandard = (relativeStrength / standard) * 100;
        
        totalScore += Math.min(percentOfStandard, 150);
        count++;
        
        console.log(`[ASSESSMENT] 🏋️ ${ex.name}: ${ex.rm10}kg × 1.33 = ${estimated1RM.toFixed(0)}kg 1RM → ${relativeStrength.toFixed(2)}x BW (${percentOfStandard.toFixed(0)}% standard)`);
      }
    });
    
    practicalScore = count > 0 ? totalScore / count : 50;
    
  } else {
    let totalScore = 0;
    let count = 0;
    
    practicalExercises.forEach(ex => {
      if (ex.variant) {
        const level = ex.variant.level;
        const maxReps = ex.variant.maxReps;
        const coefficient = ex.variant.coefficient || 1.0;
        
        const virtualWeight = bodyweight * coefficient;
        const estimated1RM = virtualWeight * (1 + (maxReps / 30));
        const relativeStrength = estimated1RM / bodyweight;
        
        let percentScore = 0;
        if (relativeStrength >= 1.5) percentScore = 100;
        else if (relativeStrength >= 1.0) percentScore = 50 + ((relativeStrength - 1.0) / 0.5) * 50;
        else percentScore = (relativeStrength / 1.0) * 50;
        
        totalScore += percentScore;
        count++;
        
        console.log(`[ASSESSMENT] 🏠 ${ex.name}: level ${level}, ${maxReps} reps, coeff ${coefficient} → ${virtualWeight.toFixed(1)}kg → ${percentScore.toFixed(0)}% score`);
      }
    });
    
    practicalScore = count > 0 ? totalScore / count : 50;
  }
  
  console.log(`[ASSESSMENT] 💪 Practical Score (30%): ${practicalScore.toFixed(1)}%`);

  // ===== 3. AGE & BMI SCORE (20%) =====
  let ageBmiScore = 0;
  let bmiValue = 0;
  let bmiScore = 0;
  
  // Calcola BMI
  bmiValue = bodyweight / ((height / 100) ** 2);
  
  // ✅ SE HAI BODY SCAN, USA BF% REALE (ma calcolo BMI per fallback)
  const bodyComposition = onboardingData.bodyComposition;
  const hasBodyScan = bodyComposition?.bodyFatPercentage;
  
  if (hasBodyScan) {
    const bf = bodyComposition.bodyFatPercentage;
    
    let bfScore = 0;
    if (gender === 'male') {
      if (bf <= 13) bfScore = 100;
      else if (bf <= 17) bfScore = 80;
      else if (bf <= 22) bfScore = 60;
      else bfScore = 40;
    } else {
      if (bf <= 20) bfScore = 100;
      else if (bf <= 24) bfScore = 80;
      else if (bf <= 30) bfScore = 60;
      else bfScore = 40;
    }
    
    // Score Age
    let ageScore = 100;
    if (age < 20 || age > 50) {
      ageScore = Math.max(50, 100 - Math.abs(age - 35) * 2);
    } else if (age >= 20 && age <= 50) {
      ageScore = 100 - Math.abs(age - 30) * 2;
    }
    
    ageBmiScore = (bfScore * 0.7) + (ageScore * 0.3);
    
    console.log(`[ASSESSMENT] 📸 Body Fat from photo: ${bf}% → ${bfScore}/100, Age ${age} → ${ageScore}/100`);
    console.log(`[ASSESSMENT] 📊 Age/BMI Score (20%): ${ageBmiScore.toFixed(1)}% (70% BF + 30% Age)`);
    
  } else {
    // Fallback: BMI Score
    bmiScore = bmiValue >= 18.5 && bmiValue <= 25 ? 100 : 
               bmiValue < 18.5 ? Math.max(50, 100 - (18.5 - bmiValue) * 10) :
               Math.max(50, 100 - (bmiValue - 25) * 5);
    
    // Age Score
    let ageScore = 100;
    if (age < 20 || age > 50) {
      ageScore = Math.max(50, 100 - Math.abs(age - 35) * 2);
    } else if (age >= 20 && age <= 50) {
      ageScore = 100 - Math.abs(age - 30) * 2;
    }
    
    ageBmiScore = (bmiScore * 0.6) + (ageScore * 0.4);
    
    console.log(`[ASSESSMENT] 📊 BMI: ${bmiValue.toFixed(1)} → ${bmiScore.toFixed(0)}/100, Age ${age} → ${ageScore}/100`);
    console.log(`[ASSESSMENT] 📊 Age/BMI Score (20%): ${ageBmiScore.toFixed(1)}% (60% BMI + 40% Age)`);
  }

  // ===== 4. FINAL SCORE = 50% QUIZ + 30% PRACTICAL + 20% AGE/BMI =====
  const finalScore = (quizScore * 0.5) + (practicalScore * 0.3) + (ageBmiScore * 0.2);
  
  let finalLevel: string;
  if (finalScore >= 70) {
    finalLevel = 'advanced';
  } else if (finalScore >= 50) {
    finalLevel = 'intermediate';
  } else {
    finalLevel = 'beginner';
  }
  
  console.log(`[ASSESSMENT] ⚖️ FINAL SCORE: ${quizScore.toFixed(1)}% × 0.5 + ${practicalScore.toFixed(1)}% × 0.3 + ${ageBmiScore.toFixed(1)}% × 0.2 = ${finalScore.toFixed(1)}%`);
  console.log(`[ASSESSMENT] 🎯 FINAL LEVEL: ${finalLevel.toUpperCase()}`);
  
  return {
    level: finalLevel,
    finalScore: finalScore.toFixed(1),
    practicalScore: practicalScore.toFixed(1),
    physicalScore: ageBmiScore.toFixed(1),
    breakdown: {
      bmi: hasBodyScan ? 'N/A' : bmiValue.toFixed(1),
      bmiScore: hasBodyScan ? 'N/A' : bmiScore.toFixed(0),
      bodyFat: hasBodyScan ? bodyComposition.bodyFatPercentage.toFixed(1) : 'N/A',
      age,
      ageScore: age < 20 ? 50 : age > 50 ? 50 : Math.round(100 - Math.abs(age - 30) * 2)
    }
  };
};
