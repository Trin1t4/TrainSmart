# PowerShell script to rename and copy exercise videos
# Run from FitnessFlow root folder

$source = ".\final"
$dest = ".\packages\web\public\videos\exercises"

# Create destination if not exists
New-Item -ItemType Directory -Force -Path $dest | Out-Null

# Mapping: Original filename -> New filename (kebab-case)
$mapping = @{
    "### 1. Bodyweight Squat.mp4" = "bodyweight-squat.mp4"
    "### 2. Goblet Squat.mp4" = "goblet-squat.mp4"
    "### 3. Front Squat.mp4" = "front-squat.mp4"
    "### 4. Back Squat.mp4" = "back-squat.mp4"
    "### 5. Leg Press.mp4" = "leg-press.mp4"
    "### 6. Bulgarian Split Squat.mp4" = "bulgarian-split-squat.mp4"
    "### 7. Pistol Squat.mp4" = "pistol-squat.mp4"
    "### 8. Lunges.mp4" = "lunges.mp4"
    "### 9. Step-up.mp4" = "step-up.mp4"
    "### 10. Leg Extension.mp4" = "leg-extension.mp4"
    "### 11. Bodyweight Hip Hinge.mp4" = "bodyweight-hip-hinge.mp4"
    "### 12. Conventional Deadlift.mp4" = "conventional-deadlift.mp4"
    "### 13. Romanian Deadlift (RDL).mp4" = "romanian-deadlift.mp4"
    "### 14. Sumo Deadlift.mp4" = "sumo-deadlift.mp4"
    "### 15. Good Morning.mp4" = "good-morning.mp4"
    "### 16. Hip Thrust.mp4" = "hip-thrust.mp4"
    "### 17. Glute Bridge.mp4" = "glute-bridge.mp4"
    "### 18. Nordic Curl.mp4" = "nordic-hamstring-curl.mp4"
    "Leg curl.mp4" = "leg-curl.mp4"
    "### 20. Push-up.mp4" = "standard-push-up.mp4"
    "### 21. Bench Press.mp4" = "flat-barbell-bench-press.mp4"
    "### 22. Dumbbell Bench Press.mp4" = "dumbbell-bench-press.mp4"
    "### 23. Incline Push-up.mp4" = "incline-push-up.mp4"
    "### 24. Decline Push-up.mp4" = "decline-push-up.mp4"
    "### 25. Diamond Push-up.mp4" = "diamond-push-up.mp4"
    "### 26. Dips.mp4" = "chest-dips.mp4"
    "### 27. Pike Push-up.mp4" = "pike-push-up.mp4"
    "### 28. Handstand Push-up.mp4" = "wall-handstand-push-up.mp4"
    "### 29. Overhead Press.mp4" = "military-press.mp4"
    "### 30. Dumbbell Shoulder Press.mp4" = "dumbbell-shoulder-press.mp4"
    "### 31. Arnold Press.mp4" = "arnold-press.mp4"
    "### 32. Lateral Raise.mp4" = "lateral-raise.mp4"
    "### 33. Front Raise.mp4" = "front-raise.mp4"
    "### 34. Inverted Row.mp4" = "inverted-row.mp4"
    "### 35. Barbell Row.mp4" = "barbell-row.mp4"
    "### 36. Single Dumbbell Row.mp4" = "dumbbell-row.mp4"
    "### 37. Cable Row.mp4" = "seated-cable-row.mp4"
    "### 38. T-Bar Row with Straddle bar.mp4" = "t-bar-row.mp4"
    "### 39. Face Pull.mp4" = "face-pull.mp4"
    "### 40. Pull-up.mp4" = "standard-pull-up.mp4"
    "### 41. Chin-up.mp4" = "chin-up.mp4"
    "### 42. Lat Pulldown.mp4" = "lat-pulldown.mp4"
    "### 43. Assisted Pull-up.mp4" = "assisted-pull-up.mp4"
    "### 44. Plank.mp4" = "plank.mp4"
    "### 45. Dead Bug.mp4" = "dead-bug.mp4"
    "### 46. Bird Dog.mp4" = "bird-dog.mp4"
    "### 47. Hanging Leg Raise.mp4" = "hanging-leg-raise.mp4"
    "### 48. Ab Wheel Rollout.mp4" = "ab-wheel-rollout.mp4"
    "### 49. Cable Crunch.mp4" = "cable-crunch.mp4"
    "### 50. Pallof Press.mp4" = "pallof-press.mp4"
    "### 51. Tricep Dips.mp4" = "tricep-dips.mp4"
    "### 52. Tricep Pushdown.mp4" = "tricep-pushdown.mp4"
    "### 53. Skull Crushers.mp4" = "skull-crushers.mp4"
    "### 54. Barbell Curl.mp4" = "barbell-curl.mp4"
    "### 55. Hammer Curl.mp4" = "hammer-curl.mp4"
    "### 56. Standing Calf Raise.mp4" = "standing-calf-raise.mp4"
    "### 57. Seated Calf Raise.mp4" = "seated-calf-raise.mp4"
    "### 58. Connection Breath.mp4" = "connection-breath.mp4"
    "### 59. Diaphragmatic Breathin.mp4" = "diaphragmatic-breathing.mp4"
    "### 60. Pelvic Floor Activation.mp4" = "pelvic-floor-activation.mp4"
    "### 61. Deep Squat Hold.mp4" = "deep-squat-hold.mp4"
    "### 62. Happy Baby Stretch.mp4" = "happy-baby-stretch.mp4"
    "### 63. Pelvic Tilts.mp4" = "pelvic-tilts.mp4"
    "### 64. Bridge with Ball Squeeze.mp4" = "bridge-ball-squeeze.mp4"
    "### 65. Clamshells.mp4" = "clamshells.mp4"
    "### 66. Bird Dog (Modified).mp4" = "bird-dog-modified.mp4"
    "### 67. Cat-Cow.mp4" = "cat-cow.mp4"
    "### 68. Squat to Stand.mp4" = "squat-to-stand.mp4"
    "### 69. Dead Bug Heel Slides.mp4" = "dead-bug-heel-slides.mp4"
    "### 70. Toe Taps.mp4" = "toe-taps.mp4"
    "### 71. Supine Marching.mp4" = "supine-marching.mp4"
    "### 72. Dead Bug Progression.mp4" = "dead-bug-progression.mp4"
    "### 73. Pallof Press (Kneeling).mp4" = "pallof-press-kneeling.mp4"
    "### 74. Side Plank (Modified).mp4" = "side-plank-modified.mp4"
    "### 75. Bear Hold.mp4" = "bear-hold.mp4"
    "### 76. Wall Sit with Breathing.mp4" = "wall-sit-breathing.mp4"
    "### 77. Seated Knee Lifts.mp4" = "seated-knee-lifts.mp4"
    "### 78. Half Kneeling Chop.mp4" = "half-kneeling-chop.mp4"
    "### 79. Wall Push-up.mp4" = "wall-push-up.mp4"
    "### 80. Seated Row (Band).mp4" = "seated-row-band.mp4"
    "### 81. Standing Leg Curl.mp4" = "standing-leg-curl.mp4"
    "### 82. Side Lying Leg Lift.mp4" = "side-lying-leg-lift.mp4"
    "### 83. Modified Squat.mp4" = "modified-squat.mp4"
    "### 84. Standing Hip Circles.mp4" = "standing-hip-circles.mp4"
    "### 85. Shoulder Blade Squeeze.mp4" = "shoulder-blade-squeeze.mp4"
    "### 86. Standing March.mp4" = "standing-march.mp4"
}

$count = 0
foreach ($item in $mapping.GetEnumerator()) {
    $sourcePath = Join-Path $source $item.Key
    $destPath = Join-Path $dest $item.Value

    if (Test-Path $sourcePath) {
        Copy-Item -Path $sourcePath -Destination $destPath -Force
        Write-Host "Copied: $($item.Key) -> $($item.Value)" -ForegroundColor Green
        $count++
    } else {
        Write-Host "NOT FOUND: $($item.Key)" -ForegroundColor Red
    }
}

Write-Host "`nTotal: $count videos copied to $dest" -ForegroundColor Cyan
