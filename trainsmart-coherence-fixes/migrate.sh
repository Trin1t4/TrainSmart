#!/bin/bash

# ============================================================================
# TrainSmart Coherence Fixes - Migration Script
# ============================================================================
# 
# Questo script aiuta ad applicare i fix di coerenza al progetto TrainSmart.
# 
# UTILIZZO:
#   ./migrate.sh [--dry-run] [--step N]
#
# OPZIONI:
#   --dry-run    Mostra cosa verrà fatto senza applicare modifiche
#   --step N     Esegui solo lo step N (1-5)
#
# ============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Flags
DRY_RUN=false
STEP=""

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --step)
      STEP="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

log_info() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
  echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
  echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

run_or_dry() {
  if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}[DRY-RUN]${NC} Would run: $1"
  else
    eval "$1"
  fi
}

backup_file() {
  local file=$1
  if [ -f "$file" ]; then
    run_or_dry "cp '$file' '${file}.backup.$(date +%Y%m%d_%H%M%S)'"
    log_info "Backup created for $file"
  fi
}

# ============================================================================
# STEP 1: Goal Mapper
# ============================================================================

step_1_goal_mapper() {
  log_info "=== STEP 1: Installing Goal Mapper ==="
  
  local target="packages/shared/src/utils/goalMapper.ts"
  local source="./02-goalMapper-unified.ts"
  
  if [ ! -f "$source" ]; then
    log_error "Source file not found: $source"
    return 1
  fi
  
  # Create directory if needed
  run_or_dry "mkdir -p packages/shared/src/utils"
  
  # Copy file
  run_or_dry "cp '$source' '$target'"
  
  log_success "Goal Mapper installed at $target"
  
  # Update index.ts
  local index="packages/shared/src/index.ts"
  if [ -f "$index" ]; then
    if ! grep -q "goalMapper" "$index"; then
      log_info "Adding export to $index"
      run_or_dry "echo \"export * from './utils/goalMapper';\" >> '$index'"
    else
      log_warning "goalMapper already exported in $index"
    fi
  fi
}

# ============================================================================
# STEP 2: Exercise Descriptions DCSS
# ============================================================================

step_2_exercise_descriptions() {
  log_info "=== STEP 2: Updating Exercise Descriptions ==="
  
  local target="packages/web/src/utils/exerciseDescriptions.ts"
  local source="./01-exerciseDescriptions-DCSS.ts"
  
  if [ ! -f "$source" ]; then
    log_error "Source file not found: $source"
    return 1
  fi
  
  # Backup existing
  backup_file "$target"
  
  # Copy new file
  run_or_dry "cp '$source' '$target'"
  
  log_success "Exercise Descriptions updated with DCSS version"
}

# ============================================================================
# STEP 3: Multi-Goal Support
# ============================================================================

step_3_multi_goal() {
  log_info "=== STEP 3: Multi-Goal Support ==="
  
  log_warning "This step requires manual integration."
  log_info "See: 03-programGenerator-multiGoal.patch.ts"
  log_info ""
  log_info "Manual steps:"
  log_info "  1. Import normalizeGoal, combineGoalConfigs in programGenerator.js"
  log_info "  2. Update generateProgramAPI to accept goals array"
  log_info "  3. Update Dashboard.tsx to pass goals array"
  log_info ""
  
  if [ "$DRY_RUN" = false ]; then
    read -p "Press Enter when you've completed the manual integration..."
  fi
}

# ============================================================================
# STEP 4: Landing DCSS Section
# ============================================================================

step_4_landing_section() {
  log_info "=== STEP 4: Adding DCSS Landing Section ==="
  
  local target="packages/web/src/components/landing/DCSSPhilosophySection.tsx"
  local source="./04-landing-dcss-section.tsx"
  
  if [ ! -f "$source" ]; then
    log_error "Source file not found: $source"
    return 1
  fi
  
  # Create directory if needed
  run_or_dry "mkdir -p packages/web/src/components/landing"
  
  # Copy file
  run_or_dry "cp '$source' '$target'"
  
  log_success "DCSS Section created at $target"
  
  log_warning "Remember to import and add <DCSSPhilosophySection /> to Landing.tsx"
}

# ============================================================================
# STEP 5: i18n Updates
# ============================================================================

step_5_i18n() {
  log_info "=== STEP 5: i18n Updates ==="
  
  log_warning "This step requires manual integration."
  log_info "See: 05-i18n-complete.patch.ts"
  log_info ""
  log_info "Manual steps:"
  log_info "  1. Open packages/web/src/lib/i18n.tsx"
  log_info "  2. Copy the keys from 05-i18n-complete.patch.ts"
  log_info "  3. Add them to the translations object"
  log_info ""
  
  if [ "$DRY_RUN" = false ]; then
    read -p "Press Enter when you've completed the i18n updates..."
  fi
}

# ============================================================================
# MAIN
# ============================================================================

main() {
  echo ""
  echo "============================================"
  echo "  TrainSmart Coherence Fixes - Migration"
  echo "============================================"
  echo ""
  
  if [ "$DRY_RUN" = true ]; then
    log_warning "Running in DRY-RUN mode - no changes will be made"
    echo ""
  fi
  
  # Check if we're in the right directory
  if [ ! -f "package.json" ]; then
    log_error "This script should be run from the root of the TrainSmart project"
    log_info "Current directory: $(pwd)"
    exit 1
  fi
  
  # Run specific step or all steps
  if [ -n "$STEP" ]; then
    case $STEP in
      1) step_1_goal_mapper ;;
      2) step_2_exercise_descriptions ;;
      3) step_3_multi_goal ;;
      4) step_4_landing_section ;;
      5) step_5_i18n ;;
      *)
        log_error "Invalid step: $STEP (valid: 1-5)"
        exit 1
        ;;
    esac
  else
    step_1_goal_mapper
    echo ""
    step_2_exercise_descriptions
    echo ""
    step_3_multi_goal
    echo ""
    step_4_landing_section
    echo ""
    step_5_i18n
  fi
  
  echo ""
  log_success "Migration complete!"
  echo ""
  log_info "Next steps:"
  log_info "  1. Run: npm run build"
  log_info "  2. Run: npm test"
  log_info "  3. Test the app manually"
  echo ""
}

main
