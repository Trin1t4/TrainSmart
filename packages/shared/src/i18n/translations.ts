export type Language = 'it' | 'en' | 'fr' | 'es';

export interface Translations {
  [key: string]: {
    it: string;
    en: string;
    fr: string;
    es: string;
  };
}

export const translations: Translations = {
  // Navigation & Common
  "nav.home": { it: "Home", en: "Home", fr: "Accueil", es: "Inicio" },
  "nav.program": { it: "Programma", en: "Program", fr: "Programme", es: "Programa" },
  "nav.progress": { it: "Progressi", en: "Progress", fr: "Progrès", es: "Progreso" },
  "nav.pricing": { it: "Prezzi", en: "Pricing", fr: "Tarifs", es: "Precios" },
  "nav.dashboard": { it: "Dashboard", en: "Dashboard", fr: "Tableau de bord", es: "Panel" },
  "nav.settings": { it: "Impostazioni", en: "Settings", fr: "Paramètres", es: "Ajustes" },
  "nav.profile": { it: "Profilo", en: "Profile", fr: "Profil", es: "Perfil" },
  "nav.logout": { it: "Esci", en: "Logout", fr: "Déconnexion", es: "Cerrar sesión" },

  "common.loading": { it: "Caricamento...", en: "Loading...", fr: "Chargement...", es: "Cargando..." },
  "common.save": { it: "Salva", en: "Save", fr: "Enregistrer", es: "Guardar" },
  "common.saving": { it: "Salvataggio...", en: "Saving...", fr: "Enregistrement...", es: "Guardando..." },
  "common.cancel": { it: "Annulla", en: "Cancel", fr: "Annuler", es: "Cancelar" },
  "common.continue": { it: "Continua", en: "Continue", fr: "Continuer", es: "Continuar" },
  "common.back": { it: "Indietro", en: "Back", fr: "Retour", es: "Atrás" },
  "common.next": { it: "Avanti", en: "Next", fr: "Suivant", es: "Siguiente" },
  "common.close": { it: "Chiudi", en: "Close", fr: "Fermer", es: "Cerrar" },
  "common.confirm": { it: "Conferma", en: "Confirm", fr: "Confirmer", es: "Confirmar" },
  "common.delete": { it: "Elimina", en: "Delete", fr: "Supprimer", es: "Eliminar" },
  "common.edit": { it: "Modifica", en: "Edit", fr: "Modifier", es: "Editar" },
  "common.yes": { it: "Sì", en: "Yes", fr: "Oui", es: "Sí" },
  "common.no": { it: "No", en: "No", fr: "Non", es: "No" },
  "common.or": { it: "oppure", en: "or", fr: "ou", es: "o" },
  "common.skip": { it: "Salta", en: "Skip", fr: "Passer", es: "Saltar" },
  "common.start": { it: "Inizia", en: "Start", fr: "Commencer", es: "Empezar" },
  "common.finish": { it: "Termina", en: "Finish", fr: "Terminer", es: "Terminar" },
  "common.retry": { it: "Riprova", en: "Retry", fr: "Réessayer", es: "Reintentar" },
  "common.error": { it: "Errore", en: "Error", fr: "Erreur", es: "Error" },
  "common.success": { it: "Successo", en: "Success", fr: "Succès", es: "Éxito" },

  // Auth
  "auth.login": { it: "Accedi", en: "Login", fr: "Connexion", es: "Iniciar sesión" },
  "auth.register": { it: "Registrati", en: "Register", fr: "S'inscrire", es: "Registrarse" },
  "auth.email": { it: "Email", en: "Email", fr: "Email", es: "Email" },
  "auth.password": { it: "Password", en: "Password", fr: "Mot de passe", es: "Contraseña" },
  "auth.confirm_password": { it: "Conferma Password", en: "Confirm Password", fr: "Confirmer le mot de passe", es: "Confirmar contraseña" },
  "auth.forgot_password": { it: "Password dimenticata?", en: "Forgot password?", fr: "Mot de passe oublié?", es: "¿Olvidaste la contraseña?" },
  "auth.no_account": { it: "Non hai un account?", en: "Don't have an account?", fr: "Pas de compte?", es: "¿No tienes cuenta?" },
  "auth.have_account": { it: "Hai già un account?", en: "Already have an account?", fr: "Déjà un compte?", es: "¿Ya tienes cuenta?" },
  "auth.password_requirements": { it: "La password deve essere di almeno 8 caratteri", en: "Password must be at least 8 characters", fr: "Le mot de passe doit contenir au moins 8 caractères", es: "La contraseña debe tener al menos 8 caracteres" },
  "auth.password_uppercase": { it: "Deve contenere almeno una lettera maiuscola", en: "Must contain at least one uppercase letter", fr: "Doit contenir au moins une majuscule", es: "Debe contener al menos una mayúscula" },
  "auth.password_number": { it: "Deve contenere almeno un numero", en: "Must contain at least one number", fr: "Doit contenir au moins un chiffre", es: "Debe contener al menos un número" },
  "auth.passwords_not_match": { it: "Le password non corrispondono", en: "Passwords do not match", fr: "Les mots de passe ne correspondent pas", es: "Las contraseñas no coinciden" },

  // Onboarding - General
  "onboarding.title": { it: "Setup Iniziale", en: "Initial Setup", fr: "Configuration initiale", es: "Configuración inicial" },
  "onboarding.subtitle": { it: "Personalizziamo il tuo programma", en: "Let's personalize your program", fr: "Personnalisons votre programme", es: "Personalicemos tu programa" },
  "onboarding.step": { it: "Passo", en: "Step", fr: "Étape", es: "Paso" },

  // Onboarding - Personal Info
  "onboarding.personal.title": { it: "Dati Biometrici", en: "Biometric Data", fr: "Données biométriques", es: "Datos biométricos" },
  "onboarding.personal.gender": { it: "Genere", en: "Gender", fr: "Genre", es: "Género" },
  "onboarding.personal.male": { it: "Maschio", en: "Male", fr: "Homme", es: "Hombre" },
  "onboarding.personal.female": { it: "Femmina", en: "Female", fr: "Femme", es: "Mujer" },
  "onboarding.personal.other": { it: "Altro", en: "Other", fr: "Autre", es: "Otro" },
  "onboarding.personal.age": { it: "Età", en: "Age", fr: "Âge", es: "Edad" },
  "onboarding.personal.years": { it: "anni", en: "years", fr: "ans", es: "años" },
  "onboarding.personal.height": { it: "Altezza", en: "Height", fr: "Taille", es: "Altura" },
  "onboarding.personal.weight": { it: "Peso", en: "Weight", fr: "Poids", es: "Peso" },
  "onboarding.personal.bmi": { it: "BMI", en: "BMI", fr: "IMC", es: "IMC" },

  // Onboarding - Location & Equipment
  "onboarding.location.title": { it: "Dove ti alleni?", en: "Where do you train?", fr: "Où vous entraînez-vous?", es: "¿Dónde entrenas?" },
  "onboarding.location.gym": { it: "Palestra", en: "Gym", fr: "Salle de sport", es: "Gimnasio" },
  "onboarding.location.home": { it: "Casa", en: "Home", fr: "Maison", es: "Casa" },
  "onboarding.location.equipment_type": { it: "Tipo di allenamento", en: "Training type", fr: "Type d'entraînement", es: "Tipo de entrenamiento" },
  "onboarding.location.bodyweight": { it: "Corpo libero", en: "Bodyweight", fr: "Poids du corps", es: "Peso corporal" },
  "onboarding.location.equipment": { it: "Piccoli Attrezzi", en: "Equipment", fr: "Équipement", es: "Equipamiento" },
  "onboarding.location.machines": { it: "Macchinari", en: "Machines", fr: "Machines", es: "Máquinas" },
  "onboarding.location.select_equipment": { it: "Seleziona attrezzatura disponibile", en: "Select available equipment", fr: "Sélectionnez l'équipement disponible", es: "Selecciona el equipamiento disponible" },

  // Equipment names
  "equipment.dumbbells": { it: "Manubri", en: "Dumbbells", fr: "Haltères", es: "Mancuernas" },
  "equipment.barbell": { it: "Bilanciere", en: "Barbell", fr: "Barre", es: "Barra" },
  "equipment.kettlebell": { it: "Kettlebell", en: "Kettlebell", fr: "Kettlebell", es: "Kettlebell" },
  "equipment.pullup_bar": { it: "Barra per Trazioni", en: "Pull-up Bar", fr: "Barre de traction", es: "Barra de dominadas" },
  "equipment.bands": { it: "Bande Elastiche", en: "Resistance Bands", fr: "Bandes élastiques", es: "Bandas elásticas" },
  "equipment.bench": { it: "Panca", en: "Bench", fr: "Banc", es: "Banco" },
  "equipment.rings": { it: "Anelli", en: "Rings", fr: "Anneaux", es: "Anillas" },
  "equipment.parallels": { it: "Parallele", en: "Parallel Bars", fr: "Barres parallèles", es: "Paralelas" },
  "equipment.max_kg": { it: "Peso massimo (kg)", en: "Max weight (kg)", fr: "Poids max (kg)", es: "Peso máximo (kg)" },

  // Onboarding - Activity
  "onboarding.activity.title": { it: "Frequenza Allenamento", en: "Training Frequency", fr: "Fréquence d'entraînement", es: "Frecuencia de entrenamiento" },
  "onboarding.activity.frequency": { it: "Quante volte a settimana?", en: "How many times per week?", fr: "Combien de fois par semaine?", es: "¿Cuántas veces por semana?" },
  "onboarding.activity.times_week": { it: "volte/settimana", en: "times/week", fr: "fois/semaine", es: "veces/semana" },
  "onboarding.activity.duration": { it: "Durata sessione", en: "Session duration", fr: "Durée de la séance", es: "Duración de la sesión" },
  "onboarding.activity.minutes": { it: "minuti", en: "minutes", fr: "minutes", es: "minutos" },

  // Onboarding - Goals
  "onboarding.goal.title": { it: "Obiettivo Principale", en: "Main Goal", fr: "Objectif principal", es: "Objetivo principal" },
  "onboarding.goal.strength": { it: "Forza", en: "Strength", fr: "Force", es: "Fuerza" },
  "onboarding.goal.hypertrophy": { it: "Ipertrofia", en: "Hypertrophy", fr: "Hypertrophie", es: "Hipertrofia" },
  "onboarding.goal.toning": { it: "Tonificazione", en: "Toning", fr: "Tonification", es: "Tonificación" },
  "onboarding.goal.weight_loss": { it: "Dimagrimento", en: "Weight Loss", fr: "Perte de poids", es: "Pérdida de peso" },
  "onboarding.goal.endurance": { it: "Resistenza", en: "Endurance", fr: "Endurance", es: "Resistencia" },
  "onboarding.goal.sport": { it: "Prestazioni Sportive", en: "Sport Performance", fr: "Performance sportive", es: "Rendimiento deportivo" },
  "onboarding.goal.wellness": { it: "Benessere", en: "Wellness", fr: "Bien-être", es: "Bienestar" },
  "onboarding.goal.recovery": { it: "Recupero Motorio", en: "Motor Recovery", fr: "Récupération motrice", es: "Recuperación motora" },
  "onboarding.goal.pregnancy": { it: "Gravidanza", en: "Pregnancy", fr: "Grossesse", es: "Embarazo" },
  "onboarding.goal.disability": { it: "Disabilità", en: "Disability", fr: "Handicap", es: "Discapacidad" },
  "onboarding.goal.select_sport": { it: "Seleziona sport", en: "Select sport", fr: "Sélectionner un sport", es: "Seleccionar deporte" },
  "onboarding.goal.select_role": { it: "Seleziona ruolo", en: "Select role", fr: "Sélectionner un rôle", es: "Seleccionar rol" },

  // Goal Descriptions
  "onboarding.goal.subtitle": {
    it: "Seleziona fino a 3 obiettivi (il primo sarà il principale)",
    en: "Select up to 3 goals (the first will be the main one)",
    fr: "Sélectionnez jusqu'à 3 objectifs (le premier sera le principal)",
    es: "Selecciona hasta 3 objetivos (el primero será el principal)"
  },
  "onboarding.goal.strengthDesc": { it: "Aumenta forza e potenza muscolare", en: "Increase strength and muscle power", fr: "Augmenter la force et la puissance musculaire", es: "Aumentar fuerza y potencia muscular" },
  "onboarding.goal.hypertrophyDesc": { it: "Costruisci massa muscolare", en: "Build muscle mass", fr: "Construire de la masse musculaire", es: "Construir masa muscular" },
  "onboarding.goal.toningDesc": { it: "Definisci e tonifica il corpo", en: "Define and tone your body", fr: "Définir et tonifier le corps", es: "Definir y tonificar el cuerpo" },
  "onboarding.goal.weightLossDesc": { it: "Perdi peso e grasso corporeo", en: "Lose weight and body fat", fr: "Perdre du poids et de la graisse", es: "Perder peso y grasa corporal" },
  "onboarding.goal.sportsDesc": { it: "Migliora per il tuo sport", en: "Improve for your sport", fr: "Améliorer pour votre sport", es: "Mejorar para tu deporte" },
  "onboarding.goal.wellnessDesc": { it: "Benessere generale e qualità del movimento", en: "General wellness and movement quality", fr: "Bien-être général et qualité du mouvement", es: "Bienestar general y calidad del movimiento" },
  "onboarding.goal.enduranceDesc": { it: "Aumenta resistenza e capacità aerobica", en: "Increase endurance and aerobic capacity", fr: "Augmenter l'endurance et la capacité aérobie", es: "Aumentar resistencia y capacidad aeróbica" },
  "onboarding.goal.motorRecovery": { it: "Recupero Motorio", en: "Motor Recovery", fr: "Récupération motrice", es: "Recuperación motora" },
  "onboarding.goal.motorRecoveryDesc": { it: "Riabilitazione e recupero funzionale", en: "Rehabilitation and functional recovery", fr: "Rééducation et récupération fonctionnelle", es: "Rehabilitación y recuperación funcional" },

  // Pre-Partum & Post-Partum
  "onboarding.goal.prePartum": { it: "Pre-Partum", en: "Pre-Partum", fr: "Pré-Partum", es: "Pre-Parto" },
  "onboarding.goal.prePartumDesc": { it: "Allenamento sicuro durante la gravidanza", en: "Safe training during pregnancy", fr: "Entraînement sûr pendant la grossesse", es: "Entrenamiento seguro durante el embarazo" },
  "onboarding.goal.postPartum": { it: "Post-Partum", en: "Post-Partum", fr: "Post-Partum", es: "Post-Parto" },
  "onboarding.goal.postPartumDesc": { it: "Recupero pavimento pelvico e diastasi", en: "Pelvic floor and diastasis recovery", fr: "Récupération plancher pelvien et diastasis", es: "Recuperación suelo pélvico y diástasis" },
  "onboarding.goal.disabilityDesc": { it: "Programma adattato alle tue capacità", en: "Program adapted to your abilities", fr: "Programme adapté à vos capacités", es: "Programa adaptado a tus capacidades" },

  // Motor Recovery Disclaimer
  "onboarding.goal.importantNote": { it: "Nota Importante", en: "Important Note", fr: "Note Importante", es: "Nota Importante" },
  "onboarding.goal.recoveryNote1": { it: "Questo programma è di supporto, non sostituisce la fisioterapia", en: "This program is supportive, it does not replace physiotherapy", fr: "Ce programme est un support, il ne remplace pas la physiothérapie", es: "Este programa es de apoyo, no reemplaza la fisioterapia" },
  "onboarding.goal.recoveryNote2": { it: "Consulta sempre il tuo medico o fisioterapista prima di iniziare", en: "Always consult your doctor or physiotherapist before starting", fr: "Consultez toujours votre médecin ou kinésithérapeute avant de commencer", es: "Consulta siempre a tu médico o fisioterapeuta antes de comenzar" },
  "onboarding.goal.recoveryNote3": { it: "Interrompi immediatamente in caso di dolore acuto", en: "Stop immediately in case of acute pain", fr: "Arrêtez immédiatement en cas de douleur aiguë", es: "Detente inmediatamente en caso de dolor agudo" },
  "onboarding.goal.recoveryNote4": { it: "Il programma verrà adattato alla tua condizione specifica", en: "The program will be adapted to your specific condition", fr: "Le programme sera adapté à votre condition spécifique", es: "El programa se adaptará a tu condición específica" },

  // Pregnancy Disclaimer
  "onboarding.goal.pregnancyImportant": { it: "Informazioni Importanti per la Gravidanza", en: "Important Pregnancy Information", fr: "Informations Importantes sur la Grossesse", es: "Información Importante sobre el Embarazo" },
  "onboarding.goal.pregnancyNote1": { it: "Ottieni sempre l'approvazione del tuo ginecologo prima di allenarti", en: "Always get approval from your gynecologist before training", fr: "Obtenez toujours l'approbation de votre gynécologue avant de vous entraîner", es: "Siempre obtén la aprobación de tu ginecólogo antes de entrenar" },
  "onboarding.goal.pregnancyNote2": { it: "Evita esercizi in posizione supina dopo il primo trimestre", en: "Avoid supine exercises after the first trimester", fr: "Évitez les exercices en position couchée après le premier trimestre", es: "Evita ejercicios en posición supina después del primer trimestre" },
  "onboarding.goal.pregnancyNote3": { it: "Non trattenere il respiro durante gli esercizi (no manovra di Valsalva)", en: "Do not hold your breath during exercises (no Valsalva maneuver)", fr: "Ne retenez pas votre souffle pendant les exercices (pas de manœuvre de Valsalva)", es: "No contengas la respiración durante los ejercicios (no maniobra de Valsalva)" },
  "onboarding.goal.pregnancyNote4": { it: "Interrompi se avverti vertigini, mal di testa, contrazioni o sanguinamento", en: "Stop if you experience dizziness, headache, contractions or bleeding", fr: "Arrêtez si vous ressentez des vertiges, maux de tête, contractions ou saignements", es: "Detente si experimentas mareos, dolor de cabeza, contracciones o sangrado" },
  "onboarding.goal.postPartumIncludes": { it: "Il programma Post-Partum include:", en: "Post-Partum program includes:", fr: "Le programme Post-Partum comprend:", es: "El programa Post-Parto incluye:" },
  "onboarding.goal.postPartumFeatures": {
    it: "Esercizi per pavimento pelvico (non solo Kegel), recupero diastasi dei retti, core profondo e respirazione diaframmatica",
    en: "Pelvic floor exercises (not just Kegel), diastasis recti recovery, deep core and diaphragmatic breathing",
    fr: "Exercices du plancher pelvien (pas seulement Kegel), récupération du diastasis, core profond et respiration diaphragmatique",
    es: "Ejercicios de suelo pélvico (no solo Kegel), recuperación de diástasis, core profundo y respiración diafragmática"
  },

  // Disability Disclaimer
  "onboarding.goal.disabilityImportant": { it: "Programma Adattato", en: "Adapted Program", fr: "Programme Adapté", es: "Programa Adaptado" },
  "onboarding.goal.disabilityNote1": { it: "Il programma verrà personalizzato in base alle tue capacità funzionali", en: "The program will be customized based on your functional abilities", fr: "Le programme sera personnalisé en fonction de vos capacités fonctionnelles", es: "El programa se personalizará según tus capacidades funcionales" },
  "onboarding.goal.disabilityNote2": { it: "Consulta il tuo medico o specialista prima di iniziare", en: "Consult your doctor or specialist before starting", fr: "Consultez votre médecin ou spécialiste avant de commencer", es: "Consulta a tu médico o especialista antes de comenzar" },
  "onboarding.goal.disabilityNote3": { it: "Gli esercizi saranno adattati alle tue possibilità di movimento", en: "Exercises will be adapted to your movement possibilities", fr: "Les exercices seront adaptés à vos possibilités de mouvement", es: "Los ejercicios se adaptarán a tus posibilidades de movimiento" },
  "onboarding.goal.disabilityNote4": { it: "Progressione molto graduale con focus sulla sicurezza", en: "Very gradual progression with focus on safety", fr: "Progression très graduelle avec focus sur la sécurité", es: "Progresión muy gradual con enfoque en la seguridad" },

  // Muscular Focus
  "onboarding.goal.muscularFocus": { it: "Focus Muscolare (opzionale)", en: "Muscular Focus (optional)", fr: "Focus Musculaire (optionnel)", es: "Enfoque Muscular (opcional)" },
  "onboarding.goal.muscularFocusDesc": { it: "Vuoi dare priorità a una zona specifica?", en: "Do you want to prioritize a specific area?", fr: "Voulez-vous donner la priorité à une zone spécifique?", es: "¿Quieres priorizar una zona específica?" },
  "onboarding.goal.noFocus": { it: "Nessun focus particolare", en: "No particular focus", fr: "Pas de focus particulier", es: "Sin enfoque particular" },
  "onboarding.goal.noFocusDesc": { it: "Programma bilanciato", en: "Balanced program", fr: "Programme équilibré", es: "Programa equilibrado" },
  "onboarding.goal.increasedVolume": { it: "Volume aumentato per questa zona", en: "Increased volume for this area", fr: "Volume augmenté pour cette zone", es: "Volumen aumentado para esta zona" },

  // Sport selection
  "onboarding.goal.whichSport": { it: "Quale sport pratichi?", en: "Which sport do you practice?", fr: "Quel sport pratiquez-vous?", es: "¿Qué deporte practicas?" },
  "onboarding.goal.selectSport": { it: "Seleziona sport", en: "Select sport", fr: "Sélectionner sport", es: "Seleccionar deporte" },
  "onboarding.goal.rolePosition": { it: "Ruolo / Posizione", en: "Role / Position", fr: "Rôle / Position", es: "Rol / Posición" },
  "onboarding.goal.selectRole": { it: "Seleziona ruolo", en: "Select role", fr: "Sélectionner rôle", es: "Seleccionar rol" },
  "onboarding.goal.sportOptimized": { it: "Il programma sarà ottimizzato per le richieste fisiche del tuo sport e ruolo", en: "The program will be optimized for your sport and role physical demands", fr: "Le programme sera optimisé pour les exigences physiques de votre sport et rôle", es: "El programa se optimizará para las demandas físicas de tu deporte y rol" },

  // Sports
  "sport.volleyball": { it: "Pallavolo", en: "Volleyball", fr: "Volleyball", es: "Voleibol" },
  "sport.basketball": { it: "Basket", en: "Basketball", fr: "Basketball", es: "Baloncesto" },
  "sport.soccer": { it: "Calcio", en: "Soccer", fr: "Football", es: "Fútbol" },
  "sport.tennis": { it: "Tennis", en: "Tennis", fr: "Tennis", es: "Tenis" },
  "sport.swimming": { it: "Nuoto", en: "Swimming", fr: "Natation", es: "Natación" },
  "sport.running": { it: "Corsa", en: "Running", fr: "Course", es: "Carrera" },
  "sport.cycling": { it: "Ciclismo", en: "Cycling", fr: "Cyclisme", es: "Ciclismo" },
  "sport.martial_arts": { it: "Arti Marziali", en: "Martial Arts", fr: "Arts martiaux", es: "Artes marciales" },

  // Volleyball roles
  "role.setter": { it: "Alzatore", en: "Setter", fr: "Passeur", es: "Colocador" },
  "role.opposite": { it: "Opposto", en: "Opposite", fr: "Opposé", es: "Opuesto" },
  "role.libero": { it: "Libero", en: "Libero", fr: "Libéro", es: "Líbero" },
  "role.middle": { it: "Centrale", en: "Middle Blocker", fr: "Central", es: "Central" },
  "role.outside": { it: "Schiacciatore", en: "Outside Hitter", fr: "Ailier", es: "Atacante" },

  // Onboarding - Pain
  "onboarding.pain.title": { it: "Dolori o Limitazioni", en: "Pain or Limitations", fr: "Douleurs ou limitations", es: "Dolores o limitaciones" },
  "onboarding.pain.question": { it: "Hai dolori o limitazioni fisiche?", en: "Do you have pain or physical limitations?", fr: "Avez-vous des douleurs ou limitations?", es: "¿Tienes dolores o limitaciones físicas?" },
  "onboarding.pain.none": { it: "Nessun dolore", en: "No pain", fr: "Aucune douleur", es: "Sin dolor" },
  "onboarding.pain.select_areas": { it: "Seleziona le aree interessate", en: "Select affected areas", fr: "Sélectionnez les zones concernées", es: "Selecciona las áreas afectadas" },
  "onboarding.pain.severity": { it: "Gravità", en: "Severity", fr: "Gravité", es: "Gravedad" },
  "onboarding.pain.mild": { it: "Lieve", en: "Mild", fr: "Léger", es: "Leve" },
  "onboarding.pain.moderate": { it: "Moderato", en: "Moderate", fr: "Modéré", es: "Moderado" },
  "onboarding.pain.severe": { it: "Grave", en: "Severe", fr: "Grave", es: "Grave" },

  // Workout Tracker
  "workout.complete": { it: "Completa", en: "Complete", fr: "Terminer", es: "Completar" },
  "workout.adapt": { it: "Adatta", en: "Adapt", fr: "Adapter", es: "Adaptar" },
  "workout.exercise": { it: "Esercizio", en: "Exercise", fr: "Exercice", es: "Ejercicio" },
  "workout.rest": { it: "Recupero", en: "Rest", fr: "Repos", es: "Descanso" },
  "workout.skip_rest": { it: "Salta Recupero", en: "Skip Rest", fr: "Passer Repos", es: "Saltar Descanso" },
  "workout.previous": { it: "Precedente", en: "Previous", fr: "Précédent", es: "Anterior" },
  "workout.next": { it: "Successivo", en: "Next", fr: "Suivant", es: "Siguiente" },
  "workout.notes": { it: "Note Workout", en: "Workout Notes", fr: "Notes Entraînement", es: "Notas Entrenamiento" },
  "workout.notes_placeholder": {
    it: "Come ti sei sentito? Difficoltà? Note tecniche...",
    en: "How did you feel? Difficulties? Technical notes...",
    fr: "Comment vous êtes-vous senti? Difficultés? Notes techniques...",
    es: "¿Cómo te sentiste? ¿Dificultades? Notas técnicas..."
  },

  // Adapt Location Dialog
  "adapt.title": { it: "Adatta Workout", en: "Adapt Workout", fr: "Adapter Entraînement", es: "Adaptar Entrenamiento" },
  "adapt.subtitle": { it: "Modifica dove farai l'allenamento oggi", en: "Change where you'll train today", fr: "Modifier où vous vous entraînerez aujourd'hui", es: "Cambiar dónde entrenarás hoy" },
  "adapt.location_question": { it: "Dove ti alleni oggi?", en: "Where are you training today?", fr: "Où vous entraînez-vous aujourd'hui?", es: "¿Dónde entrenas hoy?" },
  "adapt.gym": { it: "Palestra", en: "Gym", fr: "Salle de sport", es: "Gimnasio" },
  "adapt.gym_description": { it: "Attrezzatura completa", en: "Full equipment", fr: "Équipement complet", es: "Equipamiento completo" },
  "adapt.home": { it: "Casa", en: "Home", fr: "Maison", es: "Casa" },
  "adapt.home_description": { it: "Con o senza attrezzatura", en: "With or without equipment", fr: "Avec ou sans équipement", es: "Con o sin equipamiento" },
  "adapt.equipment_question": { it: "Che attrezzatura hai a disposizione?", en: "What equipment do you have?", fr: "Quel équipement avez-vous?", es: "¿Qué equipamiento tienes?" },
  "adapt.bodyweight": { it: "Solo Corpo Libero", en: "Bodyweight Only", fr: "Poids du Corps", es: "Solo Peso Corporal" },
  "adapt.bodyweight_description": { it: "Nessuna attrezzatura", en: "No equipment", fr: "Pas d'équipement", es: "Sin equipamiento" },
  "adapt.with_equipment": { it: "Ho Attrezzatura", en: "I Have Equipment", fr: "J'ai de l'Équipement", es: "Tengo Equipamiento" },
  "adapt.with_equipment_description": { it: "Manubri, bande, ecc.", en: "Dumbbells, bands, etc.", fr: "Haltères, bandes, etc.", es: "Mancuernas, bandas, etc." },
  "adapt.select_equipment": { it: "Seleziona cosa hai:", en: "Select what you have:", fr: "Sélectionnez ce que vous avez:", es: "Selecciona lo que tienes:" },
  "adapt.barbell": { it: "Bilanciere", en: "Barbell", fr: "Barre", es: "Barra" },
  "adapt.bands": { it: "Bande Elastiche", en: "Resistance Bands", fr: "Bandes Élastiques", es: "Bandas Elásticas" },
  "adapt.pullup_bar": { it: "Sbarra Trazioni", en: "Pull-up Bar", fr: "Barre de Traction", es: "Barra de Dominadas" },
  "adapt.bench": { it: "Panca", en: "Bench", fr: "Banc", es: "Banco" },
  "adapt.dumbbell_max": { it: "Manubri (kg massimi per mano):", en: "Dumbbells (max kg per hand):", fr: "Haltères (kg max par main):", es: "Mancuernas (kg máx por mano):" },
  "adapt.dumbbell_placeholder": { it: "Es. 20", en: "E.g. 20", fr: "Ex. 20", es: "Ej. 20" },
  "adapt.help_text": {
    it: "AdaptFlow sostituirà automaticamente gli esercizi con varianti adatte all'attrezzatura che hai indicato.",
    en: "AdaptFlow will automatically substitute exercises with variants suitable for your indicated equipment.",
    fr: "AdaptFlow remplacera automatiquement les exercices par des variantes adaptées à votre équipement.",
    es: "AdaptFlow sustituirá automáticamente los ejercicios con variantes adecuadas a tu equipamiento."
  },
  "adapt.confirm": { it: "✓ Adatta Workout", en: "✓ Adapt Workout", fr: "✓ Adapter Entraînement", es: "✓ Adaptar Entrenamiento" },
  "adapt.adapting": { it: "Adattamento...", en: "Adapting...", fr: "Adaptation...", es: "Adaptando..." },

  // Payment Modal
  "payment.title": { it: "Abbonamento", en: "Subscription", fr: "Abonnement", es: "Suscripción" },
  "payment.features": { it: "Cosa ottieni", en: "What you get", fr: "Ce que vous obtenez", es: "Lo que obtienes" },
  "payment.per_month": { it: "/mese", en: "/month", fr: "/mois", es: "/mes" },
  "payment.first_6_months": { it: "Primi 6 mesi", en: "First 6 months", fr: "6 premiers mois", es: "Primeros 6 meses" },
  "payment.then": { it: "poi", en: "then", fr: "puis", es: "luego" },
  "payment.credit_card": { it: "Carta di Credito/Debito", en: "Credit/Debit Card", fr: "Carte Crédit/Débit", es: "Tarjeta Crédito/Débito" },
  "payment.stripe_secure": { it: "Pagamento sicuro con Stripe", en: "Secure payment with Stripe", fr: "Paiement sécurisé avec Stripe", es: "Pago seguro con Stripe" },
  "payment.paypal": { it: "PayPal", en: "PayPal", fr: "PayPal", es: "PayPal" },
  "payment.paypal_fast": { it: "Pagamento rapido e sicuro", en: "Fast and secure payment", fr: "Paiement rapide et sécurisé", es: "Pago rápido y seguro" },
  "payment.proceed": { it: "Procedi al Pagamento", en: "Proceed to Payment", fr: "Procéder au Paiement", es: "Proceder al Pago" },
  "payment.redirecting": { it: "Reindirizzamento...", en: "Redirecting...", fr: "Redirection...", es: "Redirigiendo..." },
  "payment.security_note": {
    it: "🔒 Pagamenti sicuri • Nessun dato salvato sui nostri server",
    en: "🔒 Secure payments • No data saved on our servers",
    fr: "🔒 Paiements sécurisés • Aucune donnée enregistrée",
    es: "🔒 Pagos seguros • Ningún dato guardado"
  },

  // Pricing Plans
  "pricing.base": { it: "Base", en: "Base", fr: "Base", es: "Básico" },
  "pricing.premium": { it: "Premium", en: "Premium", fr: "Premium", es: "Premium" },
  "pricing.elite": { it: "Elite", en: "Elite", fr: "Élite", es: "Élite" },
  "pricing.most_popular": { it: "Più Popolare", en: "Most Popular", fr: "Plus Populaire", es: "Más Popular" },
  "pricing.current_plan": { it: "Piano Attuale", en: "Current Plan", fr: "Plan Actuel", es: "Plan Actual" },
  "pricing.subscribe": { it: "Abbonati", en: "Subscribe", fr: "S'abonner", es: "Suscribirse" },

  // Body Parts / Pain Areas
  "body.knee": { it: "Ginocchia", en: "Knees", fr: "Genoux", es: "Rodillas" },
  "body.shoulder": { it: "Spalle", en: "Shoulders", fr: "Épaules", es: "Hombros" },
  "body.back": { it: "Schiena", en: "Back", fr: "Dos", es: "Espalda" },
  "body.elbow": { it: "Gomiti", en: "Elbows", fr: "Coudes", es: "Codos" },
  "body.wrist": { it: "Polsi", en: "Wrists", fr: "Poignets", es: "Muñecas" },
  "body.ankles": { it: "Caviglie", en: "Ankles", fr: "Chevilles", es: "Tobillos" },

  // Language Selector
  "lang.select": { it: "Lingua", en: "Language", fr: "Langue", es: "Idioma" },
  "lang.it": { it: "Italiano", en: "Italian", fr: "Italien", es: "Italiano" },
  "lang.en": { it: "Inglese", en: "English", fr: "Anglais", es: "Inglés" },
  "lang.fr": { it: "Francese", en: "French", fr: "Français", es: "Francés" },
  "lang.es": { it: "Spagnolo", en: "Spanish", fr: "Espagnol", es: "Español" },

  // Dashboard
  "dashboard.title": { it: "Dashboard", en: "Dashboard", fr: "Tableau de bord", es: "Panel" },
  "dashboard.welcome": { it: "Bentornato", en: "Welcome back", fr: "Bon retour", es: "Bienvenido" },
  "dashboard.no_program": { it: "Nessun Programma Trovato", en: "No Program Found", fr: "Aucun programme trouvé", es: "No se encontró programa" },
  "dashboard.no_program_desc": { it: "Non hai ancora un programma attivo", en: "You don't have an active program yet", fr: "Vous n'avez pas encore de programme actif", es: "Aún no tienes un programa activo" },
  "dashboard.create_program": { it: "Crea Programma", en: "Create Program", fr: "Créer un programme", es: "Crear programa" },
  "dashboard.generating": { it: "Generazione programma...", en: "Generating program...", fr: "Génération du programme...", es: "Generando programa..." },
  "dashboard.current_week": { it: "Settimana corrente", en: "Current week", fr: "Semaine en cours", es: "Semana actual" },
  "dashboard.next_workout": { it: "Prossimo allenamento", en: "Next workout", fr: "Prochain entraînement", es: "Próximo entrenamiento" },
  "dashboard.start_workout": { it: "Inizia Allenamento", en: "Start Workout", fr: "Commencer l'entraînement", es: "Iniciar entrenamiento" },
  "dashboard.view_program": { it: "Vedi Programma", en: "View Program", fr: "Voir le programme", es: "Ver programa" },
  "dashboard.back_to_dashboard": { it: "Torna alla Dashboard", en: "Back to Dashboard", fr: "Retour au tableau de bord", es: "Volver al panel" },

  // Workout Session
  "workout.loading": { it: "Caricamento programma...", en: "Loading program...", fr: "Chargement du programme...", es: "Cargando programa..." },
  "workout.error_loading": { it: "Errore nel caricamento della sessione. Riprova.", en: "Error loading session. Please retry.", fr: "Erreur de chargement. Veuillez réessayer.", es: "Error al cargar la sesión. Reintentar." },
  "workout.sets": { it: "Serie", en: "Sets", fr: "Séries", es: "Series" },
  "workout.reps": { it: "Ripetizioni", en: "Reps", fr: "Répétitions", es: "Repeticiones" },
  "workout.weight": { it: "Peso", en: "Weight", fr: "Poids", es: "Peso" },
  "workout.intensity": { it: "Intensità", en: "Intensity", fr: "Intensité", es: "Intensidad" },
  "workout.timer": { it: "Timer", en: "Timer", fr: "Minuteur", es: "Temporizador" },
  "workout.completed": { it: "Completato", en: "Completed", fr: "Terminé", es: "Completado" },
  "workout.in_progress": { it: "In corso", en: "In progress", fr: "En cours", es: "En progreso" },
  "workout.session_complete": { it: "Sessione Completata!", en: "Session Complete!", fr: "Séance terminée!", es: "¡Sesión completada!" },
  "workout.great_job": { it: "Ottimo lavoro!", en: "Great job!", fr: "Excellent travail!", es: "¡Buen trabajo!" },
  "workout.exercise_of": { it: "Esercizio", en: "Exercise", fr: "Exercice", es: "Ejercicio" },
  "workout.set_of": { it: "Serie", en: "Set", fr: "Série", es: "Serie" },

  // Pre-workout Screening
  "screening.title": { it: "Check Pre-Allenamento", en: "Pre-Workout Check", fr: "Check pré-entraînement", es: "Check pre-entrenamiento" },
  "screening.subtitle": { it: "Aiutaci a personalizzare l'allenamento di oggi", en: "Help us personalize today's workout", fr: "Aidez-nous à personnaliser l'entraînement d'aujourd'hui", es: "Ayúdanos a personalizar el entrenamiento de hoy" },
  "screening.sleep": { it: "Ore di sonno stanotte", en: "Hours of sleep last night", fr: "Heures de sommeil cette nuit", es: "Horas de sueño anoche" },
  "screening.sleep_insufficient": { it: "Sonno insufficiente", en: "Insufficient sleep", fr: "Sommeil insuffisant", es: "Sueño insuficiente" },
  "screening.sleep_optimal": { it: "Sonno ottimale", en: "Optimal sleep", fr: "Sommeil optimal", es: "Sueño óptimo" },
  "screening.sleep_excessive": { it: "Sonno eccessivo", en: "Excessive sleep", fr: "Sommeil excessif", es: "Sueño excesivo" },
  "screening.stress": { it: "Livello di stress", en: "Stress level", fr: "Niveau de stress", es: "Nivel de estrés" },
  "screening.stress_relaxed": { it: "Completamente rilassato", en: "Completely relaxed", fr: "Complètement détendu", es: "Completamente relajado" },
  "screening.stress_max": { it: "Stress massimo", en: "Maximum stress", fr: "Stress maximum", es: "Estrés máximo" },
  "screening.pain_question": { it: "Dolori o fastidi?", en: "Pain or discomfort?", fr: "Douleurs ou gênes?", es: "¿Dolor o molestias?" },
  "screening.no_pain": { it: "Nessun dolore", en: "No pain", fr: "Aucune douleur", es: "Sin dolor" },
  "screening.have_pain": { it: "Ho dolori", en: "I have pain", fr: "J'ai des douleurs", es: "Tengo dolor" },
  "screening.pain_describe": { it: "Descrivi dove hai dolore", en: "Describe where you have pain", fr: "Décrivez où vous avez mal", es: "Describe dónde tienes dolor" },
  "screening.start_workout": { it: "Inizia Allenamento", en: "Start Workout", fr: "Commencer l'entraînement", es: "Iniciar entrenamiento" },

  // Menstrual Cycle
  "menstrual.title": { it: "Fase del ciclo mestruale", en: "Menstrual cycle phase", fr: "Phase du cycle menstruel", es: "Fase del ciclo menstrual" },
  "menstrual.track": { it: "Traccia Ciclo Mestruale", en: "Track Menstrual Cycle", fr: "Suivre le cycle menstruel", es: "Seguir ciclo menstrual" },
  "menstrual.not_track": { it: "Non Tracciare", en: "Don't Track", fr: "Ne pas suivre", es: "No seguir" },
  "menstrual.follicular": { it: "Follicolare", en: "Follicular", fr: "Folliculaire", es: "Folicular" },
  "menstrual.ovulation": { it: "Ovulazione", en: "Ovulation", fr: "Ovulation", es: "Ovulación" },
  "menstrual.luteal": { it: "Luteale", en: "Luteal", fr: "Lutéale", es: "Lútea" },
  "menstrual.menstruation": { it: "Mestruazione", en: "Menstruation", fr: "Menstruation", es: "Menstruación" },
  "menstrual.menopause": { it: "Menopausa", en: "Menopause", fr: "Ménopause", es: "Menopausia" },
  "menstrual.prefer_not_say": { it: "Preferisco non rispondere", en: "Prefer not to say", fr: "Je préfère ne pas répondre", es: "Prefiero no decir" },
  "menstrual.day": { it: "Giorno del ciclo", en: "Cycle day", fr: "Jour du cycle", es: "Día del ciclo" },

  // RPE Scale
  "rpe.title": { it: "Scala Borg RPE (1-10)", en: "Borg RPE Scale (1-10)", fr: "Échelle de Borg (1-10)", es: "Escala de Borg (1-10)" },
  "rpe.question": { it: "Quanto era faticosa questa serie?", en: "How hard was this set?", fr: "À quel point cette série était-elle difficile?", es: "¿Qué tan difícil fue esta serie?" },
  "rpe.target": { it: "Target", en: "Target", fr: "Cible", es: "Objetivo" },
  "rpe.1": { it: "Molto facile", en: "Very easy", fr: "Très facile", es: "Muy fácil" },
  "rpe.2": { it: "Facile", en: "Easy", fr: "Facile", es: "Fácil" },
  "rpe.3": { it: "Leggero", en: "Light", fr: "Léger", es: "Ligero" },
  "rpe.4": { it: "Moderato", en: "Moderate", fr: "Modéré", es: "Moderado" },
  "rpe.5": { it: "Moderato+", en: "Moderate+", fr: "Modéré+", es: "Moderado+" },
  "rpe.6": { it: "Impegnativo", en: "Challenging", fr: "Exigeant", es: "Desafiante" },
  "rpe.7": { it: "Difficile", en: "Hard", fr: "Difficile", es: "Difícil" },
  "rpe.8": { it: "Molto difficile", en: "Very hard", fr: "Très difficile", es: "Muy difícil" },
  "rpe.9": { it: "Quasi massimale", en: "Near maximal", fr: "Presque maximal", es: "Casi máximo" },
  "rpe.10": { it: "Massimale", en: "Maximal", fr: "Maximal", es: "Máximo" },

  // Post-set feedback
  "feedback.completed_set": { it: "Hai completato la serie?", en: "Did you complete the set?", fr: "Avez-vous terminé la série?", es: "¿Completaste la serie?" },
  "feedback.how_many_reps": { it: "Quante ripetizioni hai fatto?", en: "How many reps did you do?", fr: "Combien de répétitions avez-vous fait?", es: "¿Cuántas repeticiones hiciste?" },
  "feedback.why_not_complete": { it: "Perché non hai completato?", en: "Why didn't you complete?", fr: "Pourquoi n'avez-vous pas terminé?", es: "¿Por qué no completaste?" },
  "feedback.reason_pain": { it: "Dolore", en: "Pain", fr: "Douleur", es: "Dolor" },
  "feedback.reason_fatigue": { it: "Fatica", en: "Fatigue", fr: "Fatigue", es: "Fatiga" },
  "feedback.reason_other": { it: "Altro", en: "Other", fr: "Autre", es: "Otro" },
  "feedback.describe": { it: "Descrivi (opzionale)", en: "Describe (optional)", fr: "Décrivez (optionnel)", es: "Describe (opcional)" },
  "feedback.submit": { it: "Invia", en: "Submit", fr: "Envoyer", es: "Enviar" },

  // Deload
  "deload.title": { it: "Settimana di Deload", en: "Deload Week", fr: "Semaine de décharge", es: "Semana de descarga" },
  "deload.suggested": { it: "Deload Consigliato", en: "Deload Suggested", fr: "Décharge conseillée", es: "Descarga sugerida" },
  "deload.why": { it: "Perché il deload?", en: "Why deload?", fr: "Pourquoi la décharge?", es: "¿Por qué la descarga?" },
  "deload.guidelines": { it: "Linee guida rapide", en: "Quick guidelines", fr: "Directives rapides", es: "Pautas rápidas" },
  "deload.recovery": { it: "Recupero attivo prima del test", en: "Active recovery before test", fr: "Récupération active avant le test", es: "Recuperación activa antes del test" },
  "deload.reduce_volume": { it: "Riduzione Volume", en: "Reduce Volume", fr: "Réduire le volume", es: "Reducir volumen" },
  "deload.increase_volume": { it: "Aumento Volume", en: "Increase Volume", fr: "Augmenter le volume", es: "Aumentar volumen" },
  "deload.apply": { it: "Applica Deload", en: "Apply Deload", fr: "Appliquer la décharge", es: "Aplicar descarga" },
  "deload.postpone": { it: "Rimanda", en: "Postpone", fr: "Reporter", es: "Posponer" },
  "deload.ignore": { it: "Ignora", en: "Ignore", fr: "Ignorer", es: "Ignorar" },
  "deload.rpe_critical": { it: "RPE critico rilevato", en: "Critical RPE detected", fr: "RPE critique détecté", es: "RPE crítico detectado" },
  "deload.rpe_high": { it: "RPE troppo alto", en: "RPE too high", fr: "RPE trop élevé", es: "RPE demasiado alto" },

  // AdaptFlow
  "adaptflow.title": { it: "AdaptFlow - Adattamenti per oggi", en: "AdaptFlow - Today's Adaptations", fr: "AdaptFlow - Adaptations du jour", es: "AdaptFlow - Adaptaciones de hoy" },
  "adaptflow.no_adaptation": { it: "Nessun adattamento necessario - Allenamento standard", en: "No adaptation needed - Standard workout", fr: "Aucune adaptation nécessaire - Entraînement standard", es: "Sin adaptación necesaria - Entrenamiento estándar" },
  "adaptflow.volume_reduced": { it: "Volume ridotto", en: "Volume reduced", fr: "Volume réduit", es: "Volumen reducido" },
  "adaptflow.intensity_reduced": { it: "Intensità ridotta", en: "Intensity reduced", fr: "Intensité réduite", es: "Intensidad reducida" },
  "adaptflow.exercises_modified": { it: "Esercizi modificati per evitare zone doloranti", en: "Exercises modified to avoid painful areas", fr: "Exercices modifiés pour éviter les zones douloureuses", es: "Ejercicios modificados para evitar áreas dolorosas" },
  "adaptflow.menstrual_optimized": { it: "Intensità ottimizzata per fase mestruale", en: "Intensity optimized for menstrual phase", fr: "Intensité optimisée pour la phase menstruelle", es: "Intensidad optimizada para fase menstrual" },
  "adaptflow.menopause_optimized": { it: "Programma ottimizzato per menopausa", en: "Program optimized for menopause", fr: "Programme optimisé pour la ménopause", es: "Programa optimizado para menopausia" },

  // Days of week
  "day.monday": { it: "Lunedì", en: "Monday", fr: "Lundi", es: "Lunes" },
  "day.tuesday": { it: "Martedì", en: "Tuesday", fr: "Mardi", es: "Martes" },
  "day.wednesday": { it: "Mercoledì", en: "Wednesday", fr: "Mercredi", es: "Miércoles" },
  "day.thursday": { it: "Giovedì", en: "Thursday", fr: "Jeudi", es: "Jueves" },
  "day.friday": { it: "Venerdì", en: "Friday", fr: "Vendredi", es: "Viernes" },
  "day.saturday": { it: "Sabato", en: "Saturday", fr: "Samedi", es: "Sábado" },
  "day.sunday": { it: "Domenica", en: "Sunday", fr: "Dimanche", es: "Domingo" },
  "day.rest": { it: "Riposo", en: "Rest", fr: "Repos", es: "Descanso" },

  // Error messages
  "error.generic": { it: "Si è verificato un errore", en: "An error occurred", fr: "Une erreur s'est produite", es: "Se produjo un error" },
  "error.network": { it: "Errore di rete", en: "Network error", fr: "Erreur réseau", es: "Error de red" },
  "error.session_expired": { it: "Sessione scaduta", en: "Session expired", fr: "Session expirée", es: "Sesión expirada" },
  "error.unauthorized": { it: "Non autorizzato", en: "Unauthorized", fr: "Non autorisé", es: "No autorizado" },
  "error.not_found": { it: "Non trovato", en: "Not found", fr: "Non trouvé", es: "No encontrado" },
  "error.try_again": { it: "Riprova più tardi", en: "Try again later", fr: "Réessayez plus tard", es: "Inténtalo más tarde" },

  // Mood
  "mood.great": { it: "Ottimo", en: "Great", fr: "Super", es: "Genial" },
  "mood.good": { it: "Bene", en: "Good", fr: "Bien", es: "Bien" },
  "mood.ok": { it: "Ok", en: "OK", fr: "OK", es: "OK" },
  "mood.tired": { it: "Stanco", en: "Tired", fr: "Fatigué", es: "Cansado" },
  "mood.question": { it: "Come ti senti oggi?", en: "How do you feel today?", fr: "Comment vous sentez-vous aujourd'hui?", es: "¿Cómo te sientes hoy?" },
  "mood.energized": { it: "Carico", en: "Energized", fr: "Énergique", es: "Energizado" },
  "mood.normal": { it: "Normale", en: "Normal", fr: "Normal", es: "Normal" },
  "mood.stressed": { it: "Stressato", en: "Stressed", fr: "Stressé", es: "Estresado" },

  // Change location
  "location.change_today": { it: "Cambia Location per Oggi", en: "Change Location for Today", fr: "Changer de lieu pour aujourd'hui", es: "Cambiar ubicación para hoy" },
  "location.session_adapted": { it: "Sessione adattata per casa!", en: "Session adapted for home!", fr: "Séance adaptée pour la maison!", es: "¡Sesión adaptada para casa!" },
  "location.available_equipment": { it: "Attrezzatura Casa Disponibile", en: "Available Home Equipment", fr: "Équipement maison disponible", es: "Equipamiento de casa disponible" },

  // Workout Logger
  "workoutLogger.title": { it: "Registra Workout", en: "Log Workout", fr: "Enregistrer Entraînement", es: "Registrar Entrenamiento" },
  "workoutLogger.description": { it: "Compila i dati del tuo allenamento. L'RPE (Rate of Perceived Exertion) è la fatica percepita da 1 a 10.", en: "Fill in your workout data. RPE (Rate of Perceived Exertion) is your perceived effort from 1 to 10.", fr: "Remplissez les données de votre entraînement. L'RPE (Rate of Perceived Exertion) est l'effort perçu de 1 à 10.", es: "Completa los datos de tu entrenamiento. El RPE (Rate of Perceived Exertion) es el esfuerzo percibido de 1 a 10." },
  "workoutLogger.split": { it: "Split", en: "Split", fr: "Split", es: "Split" },
  "workoutLogger.sessionRPE": { it: "RPE Medio Sessione", en: "Session Average RPE", fr: "RPE Moyen Séance", es: "RPE Promedio Sesión" },
  "workoutLogger.exercises": { it: "Esercizi", en: "Exercises", fr: "Exercices", es: "Ejercicios" },
  "workoutLogger.sessionDetails": { it: "Dettagli Sessione", en: "Session Details", fr: "Détails Séance", es: "Detalles Sesión" },
  "workoutLogger.sleepQuality": { it: "Qualità del sonno ultima notte", en: "Sleep quality last night", fr: "Qualité du sommeil la nuit dernière", es: "Calidad del sueño anoche" },
  "workoutLogger.optional": { it: "Opzionale", en: "Optional", fr: "Optionnel", es: "Opcional" },
  "workoutLogger.vsBaseline": { it: "Rispetto al tuo baseline", en: "Compared to your baseline", fr: "Par rapport à votre baseline", es: "Comparado con tu baseline" },
  "workoutLogger.easier": { it: "Più facile", en: "Easier", fr: "Plus facile", es: "Más fácil" },
  "workoutLogger.asExpected": { it: "Come previsto", en: "As expected", fr: "Comme prévu", es: "Como esperado" },
  "workoutLogger.harder": { it: "Più duro", en: "Harder", fr: "Plus dur", es: "Más difícil" },
  "workoutLogger.notesOptional": { it: "Note (opzionale)", en: "Notes (optional)", fr: "Notes (optionnel)", es: "Notas (opcional)" },
  "workoutLogger.notesPlaceholder": { it: "es. Sentito dolore al gomito sinistro", en: "e.g. Felt pain in left elbow", fr: "ex. Douleur au coude gauche", es: "ej. Sentí dolor en el codo izquierdo" },
  "workoutLogger.rpeHigh": { it: "RPE Alto", en: "High RPE", fr: "RPE Élevé", es: "RPE Alto" },
  "workoutLogger.rpeWarning": { it: "Il tuo RPE medio è {rpe}/10. Se questo trend continua per 2+ sessioni, il sistema ridurrà automaticamente il volume per prevenire sovrallenamento.", en: "Your average RPE is {rpe}/10. If this trend continues for 2+ sessions, the system will automatically reduce volume to prevent overtraining.", fr: "Votre RPE moyen est de {rpe}/10. Si cette tendance se poursuit pendant 2+ séances, le système réduira automatiquement le volume pour éviter le surentraînement.", es: "Tu RPE promedio es {rpe}/10. Si esta tendencia continúa por 2+ sesiones, el sistema reducirá automáticamente el volumen para prevenir el sobreentrenamiento." },
};
