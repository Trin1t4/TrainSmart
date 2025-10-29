// ✅ FORMULA CORRETTA: 70% PRACTICAL + 30% PHYSICAL (no quiz nella formula!)
const calculateFinalLevel = (practicalExercises: AssessmentExercise[]): LevelResult => {
  console.log('[ASSESSMENT] 🧮 Calculating final level...');
  
  const bodyweight = onboardingData.personalInfo?.weight || 70;
  const height = onboardingData.personalInfo?.height || 175;
  const age = onboardingData.personalInfo?.age || 30;
  const gender = onboardingData.personalInfo?.gender || 'male';
  
  // ✅ BODY COMPOSITION DA FOTO (se presente)
  const bodyComposition = onboardingData.bodyComposition;
  const hasBodScan = bodyComposition?.bodyFatPercentage;

  // ===== 1. PRACTICAL SCORE (70%) =====
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
    // HOME: Usa coefficienti
    let totalScore = 0;
    let count = 0;
    
    practicalExercises.forEach(ex => {
      if (ex.variant) {
        const level = ex.variant.level;
        const maxReps = ex.variant.maxReps;
        const coefficient = (ex.variant as any).coefficient || 1.0;
        
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
  
  console.log(`[ASSESSMENT] 💪 Practical Score (70% weight): ${practicalScore.toFixed(1)}%`);

  // ===== 2. PHYSICAL PARAMS SCORE (30%) =====
  let physicalScore = 0;
  
  // ✅ SE HAI BODY SCAN, USA BF% REALE
  if (hasBodyScan) {
    const bf = bodyComposition.bodyFatPercentage;
    
    // Standard BF% per livello
    // Uomo: 6-13% = advanced, 14-17% = intermediate, 18%+ = beginner
    // Donna: 14-20% = advanced, 21-24% = intermediate, 25%+ = beginner
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
    
    console.log(`[ASSESSMENT] 📸 Body Fat from photo: ${bf}% → ${bfScore}/100`);
    
    const ageScore = age <= 30 ? 100 :
                     age <= 40 ? 90 :
                     age <= 50 ? 80 :
                     age <= 60 ? 70 : 60;
    
    // 70% BF%, 30% età
    physicalScore = (bfScore * 0.7) + (ageScore * 0.3);
    
  } else {
    // ✅ ALTRIMENTI USA BMI
    const bmi = bodyweight / ((height / 100) ** 2);
    const bmiScore = bmi >= 18.5 && bmi <= 25 ? 100 : 
                     bmi < 18.5 ? Math.max(0, 50 + (bmi - 18.5) * 10) :
                     Math.max(0, 100 - (bmi - 25) * 5);

    const ageScore = age <= 30 ? 100 :
                     age <= 40 ? 90 :
                     age <= 50 ? 80 :
                     age <= 60 ? 70 : 60;

    // 60% BMI, 40% età
    physicalScore = (bmiScore * 0.6 + ageScore * 0.4);
    
    console.log(`[ASSESSMENT] 📊 BMI fallback: ${bmi.toFixed(1)} (${bmiScore.toFixed(0)}/100), Age ${age} (${ageScore}/100)`);
  }
  
  console.log(`[ASSESSMENT] 📊 Physical Score (30% weight): ${physicalScore.toFixed(1)}%`);

  // ===== 3. FINAL SCORE = 70% PRACTICAL + 30% PHYSICAL =====
  const finalScore = (practicalScore * 0.7) + (physicalScore * 0.3);
  
  let finalLevel: string;
  if (finalScore >= 75) {
    finalLevel = 'advanced';
  } else if (finalScore >= 50) {
    finalLevel = 'intermediate';
  } else {
    finalLevel = 'beginner';
  }
  
  console.log(`[ASSESSMENT] ⚖️ FINAL SCORE: ${practicalScore.toFixed(1)}% × 0.7 + ${physicalScore.toFixed(1)}% × 0.3 = ${finalScore.toFixed(1)}%`);
  console.log(`[ASSESSMENT] 🎯 FINAL LEVEL: ${finalLevel.toUpperCase()}`);
  
  return {
    level: finalLevel,
    finalScore: finalScore.toFixed(1),
    practicalScore: practicalScore.toFixed(1),
    physicalScore: physicalScore.toFixed(1),
    breakdown: {
      bmi: hasBodyScan ? 'N/A (body scan used)' : (bodyweight / ((height / 100) ** 2)).toFixed(1),
      bmiScore: hasBodyScan ? 'N/A' : bmiScore.toFixed(0),
      bodyFat: hasBodyScan ? bodyComposition.bodyFatPercentage.toFixed(1) : 'N/A',
      age,
      ageScore
    }
  };
};
