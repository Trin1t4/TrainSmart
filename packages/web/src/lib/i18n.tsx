import { createContext, useContext, useState } from "react";

type Language = "it" | "en" | "fr" | "es";

interface Translations {
  [key: string]: {
    it: string;
    en: string;
    fr: string;
    es: string;
  };
}

const translations: Translations = {
  // Navigation & Common
  "nav.home": { it: "Home", en: "Home", fr: "Accueil", es: "Inicio" },
  "nav.program": { it: "Programma", en: "Program", fr: "Programme", es: "Programa" },
  "nav.progress": { it: "Progressi", en: "Progress", fr: "Progrès", es: "Progreso" },
  "nav.pricing": { it: "Prezzi", en: "Pricing", fr: "Tarifs", es: "Precios" },
  "nav.dashboard": { it: "Dashboard", en: "Dashboard", fr: "Tableau de bord", es: "Panel" },
  "nav.settings": { it: "Impostazioni", en: "Settings", fr: "Paramètres", es: "Ajustes" },
  "nav.profile": { it: "Profilo", en: "Profile", fr: "Profil", es: "Perfil" },
  "nav.community": { it: "Community", en: "Community", fr: "Communauté", es: "Comunidad" },
  "nav.stats": { it: "Statistiche", en: "Stats", fr: "Stats", es: "Estadísticas" },
  "nav.workout": { it: "Workout", en: "Workout", fr: "Entraînement", es: "Entrenamiento" },
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
  "onboarding.step_of": { it: "Step {{current}} di {{total}}", en: "Step {{current}} of {{total}}", fr: "Étape {{current}} sur {{total}}", es: "Paso {{current}} de {{total}}" },
  "onboarding.error.location_missing": { it: "⚠️ Errore: location non salvata. Riprova il step location.", en: "⚠️ Error: location not saved. Please retry the location step.", fr: "⚠️ Erreur: emplacement non enregistré. Veuillez réessayer l'étape emplacement.", es: "⚠️ Error: ubicación no guardada. Por favor, vuelve al paso de ubicación." },
  "onboarding.error.save_failed": { it: "❌ Errore nel salvare i dati. Riprova.", en: "❌ Error saving data. Please try again.", fr: "❌ Erreur lors de l'enregistrement des données. Veuillez réessayer.", es: "❌ Error al guardar los datos. Por favor, inténtalo de nuevo." },

  // Onboarding - Personal Info
  "onboarding.personal.title": { it: "Dati Biometrici", en: "Biometric Data", fr: "Données biométriques", es: "Datos biométricos" },
  "onboarding.personal.subtitle": { it: "Inserisci i tuoi dati per personalizzare il programma", en: "Enter your data to personalize the program", fr: "Entrez vos données pour personnaliser le programme", es: "Ingresa tus datos para personalizar el programa" },
  "onboarding.personal.gender": { it: "Genere", en: "Gender", fr: "Genre", es: "Género" },
  "onboarding.personal.male": { it: "Maschio", en: "Male", fr: "Homme", es: "Hombre" },
  "onboarding.personal.female": { it: "Femmina", en: "Female", fr: "Femme", es: "Mujer" },
  "onboarding.personal.other": { it: "Altro", en: "Other", fr: "Autre", es: "Otro" },
  "onboarding.personal.age": { it: "Età", en: "Age", fr: "Âge", es: "Edad" },
  "onboarding.personal.years": { it: "anni", en: "years", fr: "ans", es: "años" },
  "onboarding.personal.height": { it: "Altezza", en: "Height", fr: "Taille", es: "Altura" },
  "onboarding.personal.weight": { it: "Peso", en: "Weight", fr: "Poids", es: "Peso" },
  "onboarding.personal.bmi": { it: "BMI", en: "BMI", fr: "IMC", es: "IMC" },
  "onboarding.personal.agePlaceholder": { it: "Es: 25", en: "E.g.: 25", fr: "Ex: 25", es: "Ej: 25" },
  "onboarding.personal.heightPlaceholder": { it: "Es: 175", en: "E.g.: 175", fr: "Ex: 175", es: "Ej: 175" },
  "onboarding.personal.weightPlaceholder": { it: "Es: 70", en: "E.g.: 70", fr: "Ex: 70", es: "Ej: 70" },
  "onboarding.personal.circumferences": { it: "Circonferenze (Opzionale)", en: "Circumferences (Optional)", fr: "Circonférences (Optionnel)", es: "Circunferencias (Opcional)" },
  "onboarding.personal.circumferencesDesc": { it: "Per stima body fat accurata (Navy Method, ±3.5%)", en: "For accurate body fat estimation (Navy Method, ±3.5%)", fr: "Pour une estimation précise de la graisse corporelle (Méthode Navy, ±3.5%)", es: "Para estimación precisa de grasa corporal (Método Navy, ±3.5%)" },
  "onboarding.personal.neck": { it: "Collo (cm)", en: "Neck (cm)", fr: "Cou (cm)", es: "Cuello (cm)" },
  "onboarding.personal.neckPlaceholder": { it: "es: 38", en: "e.g.: 38", fr: "ex: 38", es: "ej: 38" },
  "onboarding.personal.waist": { it: "Vita (cm)", en: "Waist (cm)", fr: "Taille (cm)", es: "Cintura (cm)" },
  "onboarding.personal.waistPlaceholder": { it: "es: 85", en: "e.g.: 85", fr: "ex: 85", es: "ej: 85" },
  "onboarding.personal.hips": { it: "Fianchi (cm)", en: "Hips (cm)", fr: "Hanches (cm)", es: "Caderas (cm)" },
  "onboarding.personal.hipsPlaceholder": { it: "es: 95", en: "e.g.: 95", fr: "ex: 95", es: "ej: 95" },
  "onboarding.personal.waistNavel": { it: "(ombelico)", en: "(navel)", fr: "(nombril)", es: "(ombligo)" },
  "onboarding.personal.waistNarrowest": { it: "(punto più stretto)", en: "(narrowest point)", fr: "(point le plus étroit)", es: "(punto más estrecho)" },
  "onboarding.personal.hipsWidest": { it: "(punto più largo)", en: "(widest point)", fr: "(point le plus large)", es: "(punto más ancho)" },
  "onboarding.personal.navyMethodNote": { it: "💡 Se fornite, calcoleremo body fat % con formula Navy Method (validata scientificamente, accuracy ±3.5% vs DEXA)", en: "💡 If provided, we'll calculate body fat % with Navy Method formula (scientifically validated, ±3.5% accuracy vs DEXA)", fr: "💡 Si fourni, nous calculerons le % de graisse corporelle avec la formule Navy Method (validée scientifiquement, précision ±3.5% vs DEXA)", es: "💡 Si se proporciona, calcularemos el % de grasa corporal con la fórmula Navy Method (validada científicamente, precisión ±3.5% vs DEXA)" },

  // Onboarding - Location & Equipment
  "onboarding.location.title": { it: "Dove ti alleni?", en: "Where do you train?", fr: "Où vous entraînez-vous?", es: "¿Dónde entrenas?" },
  "onboarding.location.subtitle": { it: "Scegli dove ti allenerai principalmente", en: "Choose where you'll train primarily", fr: "Choisissez où vous vous entraînerez principalement", es: "Elige dónde entrenarás principalmente" },
  "onboarding.location.gym": { it: "Palestra", en: "Gym", fr: "Salle de sport", es: "Gimnasio" },
  "onboarding.location.gymDesc": { it: "Accesso a macchinari e pesi liberi", en: "Access to machines and free weights", fr: "Accès aux machines et poids libres", es: "Acceso a máquinas y pesos libres" },
  "onboarding.location.home": { it: "Casa", en: "Home", fr: "Maison", es: "Casa" },
  "onboarding.location.homeDesc": { it: "Allenamento a corpo libero o con piccola attrezzatura", en: "Bodyweight or small equipment training", fr: "Entraînement au poids du corps ou petit équipement", es: "Entrenamiento con peso corporal o equipamiento pequeño" },
  "onboarding.location.homeGym": { it: "Home Gym", en: "Home Gym", fr: "Home Gym", es: "Home Gym" },
  "onboarding.location.homeGymDesc": { it: "Garage o cantina attrezzata con bilanciere e rack", en: "Equipped garage or basement with barbell and rack", fr: "Garage ou sous-sol équipé avec barre et rack", es: "Garaje o sótano equipado con barra y rack" },
  "onboarding.location.homeGymEquipment": { it: "Attrezzatura Home Gym", en: "Home Gym Equipment", fr: "Équipement Home Gym", es: "Equipamiento Home Gym" },
  "onboarding.location.homeGymEquipmentDesc": { it: "Seleziona l'attrezzatura disponibile nella tua home gym", en: "Select available equipment in your home gym", fr: "Sélectionnez l'équipement disponible dans votre home gym", es: "Selecciona el equipamiento disponible en tu home gym" },
  "onboarding.location.homeGymSummary": { it: "Il programma sarà ottimizzato per la tua attrezzatura", en: "The program will be optimized for your equipment", fr: "Le programme sera optimisé pour votre équipement", es: "El programa será optimizado para tu equipamiento" },
  "onboarding.location.homeGymNote": { it: "Esercizi alternativi verranno suggeriti se manca qualcosa", en: "Alternative exercises will be suggested if something is missing", fr: "Des exercices alternatifs seront suggérés si quelque chose manque", es: "Se sugerirán ejercicios alternativos si falta algo" },
  "onboarding.location.equipment_type": { it: "Tipo di allenamento", en: "Training type", fr: "Type d'entraînement", es: "Tipo de entrenamiento" },
  "onboarding.location.bodyweight": { it: "Corpo libero", en: "Bodyweight", fr: "Poids du corps", es: "Peso corporal" },
  "onboarding.location.bodyweightDesc": { it: "Nessuna attrezzatura necessaria", en: "No equipment needed", fr: "Aucun équipement nécessaire", es: "Sin equipamiento necesario" },
  "onboarding.location.equipment": { it: "Piccoli Attrezzi", en: "Equipment", fr: "Équipement", es: "Equipamiento" },
  "onboarding.location.smallEquipment": { it: "Piccoli Attrezzi", en: "Small Equipment", fr: "Petit Équipement", es: "Equipamiento Pequeño" },
  "onboarding.location.smallEquipmentDesc": { it: "Manubri, bande elastiche, ecc.", en: "Dumbbells, resistance bands, etc.", fr: "Haltères, bandes élastiques, etc.", es: "Mancuernas, bandas elásticas, etc." },
  "onboarding.location.machines": { it: "Macchinari", en: "Machines", fr: "Machines", es: "Máquinas" },
  "onboarding.location.machinesDesc": { it: "Macchine guidate, leg press, chest press, lat machine", en: "Guided machines, leg press, chest press, lat machine", fr: "Machines guidées, leg press, chest press, lat machine", es: "Máquinas guiadas, prensa de piernas, press de pecho, polea dorsal" },
  "onboarding.location.select_equipment": { it: "Seleziona attrezzatura disponibile", en: "Select available equipment", fr: "Sélectionnez l'équipement disponible", es: "Selecciona el equipamiento disponible" },
  "onboarding.location.homeTrainingType": { it: "Che tipo di allenamento farai a casa?", en: "What type of training will you do at home?", fr: "Quel type d'entraînement ferez-vous à la maison?", es: "¿Qué tipo de entrenamiento harás en casa?" },
  "onboarding.location.gymArea": { it: "Che area della palestra userai?", en: "Which gym area will you use?", fr: "Quelle zone de la salle utiliserez-vous?", es: "¿Qué área del gimnasio usarás?" },
  "onboarding.location.gymAreaDesc": { it: "Seleziona l'area principale che userai", en: "Select the main area you'll use", fr: "Sélectionnez la zone principale que vous utiliserez", es: "Selecciona el área principal que usarás" },
  "onboarding.location.calisthenics": { it: "Area Calisthenics", en: "Calisthenics Area", fr: "Zone Calisthenics", es: "Área de Calistenia" },
  "onboarding.location.calisthenicsDesc": { it: "Sbarra, parallele, anelli per corpo libero avanzato", en: "Pull-up bar, parallel bars, rings for advanced bodyweight", fr: "Barre de traction, barres parallèles, anneaux pour poids du corps avancé", es: "Barra de dominadas, paralelas, anillas para peso corporal avanzado" },
  "onboarding.location.freeWeights": { it: "Sala Pesi - Pesi Liberi", en: "Weight Room - Free Weights", fr: "Salle de Musculation - Poids Libres", es: "Sala de Pesas - Pesos Libres" },
  "onboarding.location.freeWeightsDesc": { it: "Bilanciere, manubri, kettlebell, panca", en: "Barbell, dumbbells, kettlebells, bench", fr: "Barre, haltères, kettlebells, banc", es: "Barra, mancuernas, kettlebells, banco" },
  "onboarding.location.intermediateAdvanced": { it: "Intermedio/Avanzato", en: "Intermediate/Advanced", fr: "Intermédiaire/Avancé", es: "Intermedio/Avanzado" },
  "onboarding.location.allLevels": { it: "Tutti i livelli", en: "All levels", fr: "Tous niveaux", es: "Todos los niveles" },
  "onboarding.location.recommendedBeginners": { it: "Consigliato per principianti", en: "Recommended for beginners", fr: "Recommandé pour débutants", es: "Recomendado para principiantes" },
  "onboarding.location.equipmentConfigured": { it: "✓ Attrezzatura configurata automaticamente", en: "✓ Equipment configured automatically", fr: "✓ Équipement configuré automatiquement", es: "✓ Equipamiento configurado automáticamente" },
  "onboarding.location.calisthenicsEquipment": { it: "Sbarra, parallele, anelli, bande elastiche", en: "Pull-up bar, parallel bars, rings, resistance bands", fr: "Barre de traction, barres parallèles, anneaux, bandes élastiques", es: "Barra de dominadas, paralelas, anillas, bandas elásticas" },
  "onboarding.location.freeWeightsEquipment": { it: "Bilanciere, manubri (50kg), kettlebell (32kg), panca, sbarra", en: "Barbell, dumbbells (50kg), kettlebell (32kg), bench, pull-up bar", fr: "Barre, haltères (50kg), kettlebell (32kg), banc, barre de traction", es: "Barra, mancuernas (50kg), kettlebell (32kg), banco, barra de dominadas" },
  "onboarding.location.machinesEquipment": { it: "Macchine guidate, manubri leggeri (30kg), panca, sbarra", en: "Guided machines, light dumbbells (30kg), bench, pull-up bar", fr: "Machines guidées, haltères légers (30kg), banc, barre de traction", es: "Máquinas guiadas, mancuernas ligeras (30kg), banco, barra de dominadas" },
  "onboarding.location.homeEquipment": { it: "Attrezzatura casalinga disponibile", en: "Available home equipment", fr: "Équipement domestique disponible", es: "Equipamiento casero disponible" },
  "onboarding.location.selectAvailable": { it: "Seleziona cosa hai a disposizione", en: "Select what you have available", fr: "Sélectionnez ce que vous avez disponible", es: "Selecciona lo que tienes disponible" },
  "onboarding.location.frequency": { it: "Quante volte a settimana?", en: "How many times per week?", fr: "Combien de fois par semaine?", es: "¿Cuántas veces por semana?" },
  "onboarding.location.frequencyDesc": { it: "Includi sia allenamenti con i pesi che corsa", en: "Include both weight training and running", fr: "Inclure musculation et course", es: "Incluye entrenamiento con pesas y carrera" },

  // Equipment names
  "equipment.dumbbells": { it: "Manubri", en: "Dumbbells", fr: "Haltères", es: "Mancuernas" },
  "equipment.barbell": { it: "Bilanciere", en: "Barbell", fr: "Barre", es: "Barra" },
  "equipment.kettlebell": { it: "Kettlebell", en: "Kettlebell", fr: "Kettlebell", es: "Kettlebell" },
  "equipment.pullupBar": { it: "Barra per Trazioni", en: "Pull-up Bar", fr: "Barre de traction", es: "Barra de dominadas" },
  "equipment.pullup_bar": { it: "Barra per Trazioni", en: "Pull-up Bar", fr: "Barre de traction", es: "Barra de dominadas" },
  "equipment.loopBands": { it: "Bande Elastiche", en: "Resistance Bands", fr: "Bandes Élastiques", es: "Bandas Elásticas" },
  "equipment.bands": { it: "Bande Elastiche", en: "Resistance Bands", fr: "Bandes élastiques", es: "Bandas elásticas" },
  "equipment.bench": { it: "Panca", en: "Bench", fr: "Banc", es: "Banco" },
  "equipment.rings": { it: "Anelli", en: "Rings", fr: "Anneaux", es: "Anillas" },
  "equipment.parallelBars": { it: "Parallele", en: "Parallel Bars", fr: "Barres Parallèles", es: "Paralelas" },
  "equipment.parallels": { it: "Parallele", en: "Parallel Bars", fr: "Barres parallèles", es: "Paralelas" },
  "equipment.max_kg": { it: "Peso massimo (kg)", en: "Max weight (kg)", fr: "Poids max (kg)", es: "Peso máximo (kg)" },
  "equipment.maxWeight": { it: "Peso massimo (kg)", en: "Max weight (kg)", fr: "Poids max (kg)", es: "Peso máximo (kg)" },
  "equipment.weight": { it: "Peso (kg)", en: "Weight (kg)", fr: "Poids (kg)", es: "Peso (kg)" },
  "equipment.rack": { it: "Squat Rack", en: "Squat Rack", fr: "Rack de Squat", es: "Rack de Sentadillas" },
  "equipment.cables": { it: "Cavi / Pulley", en: "Cables / Pulley", fr: "Câbles / Poulie", es: "Cables / Polea" },

  // Onboarding - Activity
  "onboarding.activity.title": { it: "Frequenza Allenamento", en: "Training Frequency", fr: "Fréquence d'entraînement", es: "Frecuencia de entrenamiento" },
  "onboarding.activity.subtitle": { it: "Quanto tempo puoi dedicare all'allenamento?", en: "How much time can you dedicate to training?", fr: "Combien de temps pouvez-vous consacrer à l'entraînement?", es: "¿Cuánto tiempo puedes dedicar al entrenamiento?" },
  "onboarding.activity.frequency": { it: "Quante volte a settimana?", en: "How many times per week?", fr: "Combien de fois par semaine?", es: "¿Cuántas veces por semana?" },
  "onboarding.activity.daysPerWeek": { it: "Giorni a settimana", en: "Days per week", fr: "Jours par semaine", es: "Días por semana" },
  "onboarding.activity.times_week": { it: "volte/settimana", en: "times/week", fr: "fois/semaine", es: "veces/semana" },
  "onboarding.activity.duration": { it: "Durata sessione", en: "Session duration", fr: "Durée de la séance", es: "Duración de la sesión" },
  "onboarding.activity.sessionDuration": { it: "Durata di ogni sessione", en: "Duration of each session", fr: "Durée de chaque séance", es: "Duración de cada sesión" },
  "onboarding.activity.minutes": { it: "min", en: "min", fr: "min", es: "min" },
  "onboarding.activity.days": { it: "giorni", en: "days", fr: "jours", es: "días" },
  "onboarding.activity.oneDay": { it: "1 giorno", en: "1 day", fr: "1 jour", es: "1 día" },
  "onboarding.activity.sevenDays": { it: "7 giorni", en: "7 days", fr: "7 jours", es: "7 días" },

  // Onboarding - Goals
  "onboarding.goal.title": { it: "Obiettivo Principale", en: "Main Goal", fr: "Objectif principal", es: "Objetivo principal" },
  "onboarding.goal.subtitle": { it: "Scegli il tuo obiettivo principale", en: "Choose your main goal", fr: "Choisissez votre objectif principal", es: "Elige tu objetivo principal" },
  "onboarding.goal.strength": { it: "Forza", en: "Strength", fr: "Force", es: "Fuerza" },
  "onboarding.goal.strengthDesc": { it: "Aumenta la forza massima con bassi volumi e alta intensità", en: "Increase maximal strength with low volume and high intensity", fr: "Augmenter la force maximale avec faible volume et haute intensité", es: "Aumentar la fuerza máxima con bajo volumen y alta intensidad" },
  "onboarding.goal.hypertrophy": { it: "Ipertrofia", en: "Hypertrophy", fr: "Hypertrophie", es: "Hipertrofia" },
  "onboarding.goal.hypertrophyDesc": { it: "Aumenta la massa muscolare con volume medio-alto", en: "Increase muscle mass with medium-high volume", fr: "Augmenter la masse musculaire avec volume moyen-élevé", es: "Aumentar masa muscular con volumen medio-alto" },
  "onboarding.goal.toning": { it: "Tonificazione", en: "Toning", fr: "Tonification", es: "Tonificación" },
  "onboarding.goal.toningDesc": { it: "Definisci il corpo con esercizi mirati e cardio", en: "Define your body with targeted exercises and cardio", fr: "Définir le corps avec exercices ciblés et cardio", es: "Define tu cuerpo con ejercicios específicos y cardio" },
  "onboarding.goal.weight_loss": { it: "Dimagrimento", en: "Weight Loss", fr: "Perte de poids", es: "Pérdida de peso" },
  "onboarding.goal.weightLossDesc": { it: "Perdi peso con allenamenti ad alta intensità e deficit calorico", en: "Lose weight with high-intensity training and caloric deficit", fr: "Perdre du poids avec entraînements haute intensité et déficit calorique", es: "Pierde peso con entrenamientos de alta intensidad y déficit calórico" },
  "onboarding.goal.endurance": { it: "Resistenza", en: "Endurance", fr: "Endurance", es: "Resistencia" },
  "onboarding.goal.enduranceDesc": { it: "Migliora la resistenza cardiovascolare e muscolare", en: "Improve cardiovascular and muscular endurance", fr: "Améliorer l'endurance cardiovasculaire et musculaire", es: "Mejora la resistencia cardiovascular y muscular" },
  "onboarding.goal.sport": { it: "Prestazioni Sportive", en: "Sport Performance", fr: "Performance sportive", es: "Rendimiento deportivo" },
  "onboarding.goal.sportsDesc": { it: "Migliora le prestazioni nel tuo sport specifico", en: "Improve performance in your specific sport", fr: "Améliorer les performances dans votre sport spécifique", es: "Mejora el rendimiento en tu deporte específico" },
  "onboarding.goal.running": { it: "Corsa", en: "Running", fr: "Course à pied", es: "Carrera" },
  "onboarding.goal.runningDesc": { it: "Migliora resistenza aerobica e capacità di corsa", en: "Improve aerobic endurance and running capacity", fr: "Améliorer l'endurance aérobie et la capacité de course", es: "Mejora la resistencia aeróbica y capacidad de carrera" },
  "onboarding.goal.wellness": { it: "Benessere", en: "Wellness", fr: "Bien-être", es: "Bienestar" },
  "onboarding.goal.wellnessDesc": { it: "Mantieni la salute e il benessere generale", en: "Maintain overall health and wellness", fr: "Maintenir la santé et le bien-être général", es: "Mantén la salud y el bienestar general" },
  "onboarding.goal.recovery": { it: "Recupero Motorio", en: "Motor Recovery", fr: "Récupération motrice", es: "Recuperación motora" },
  "onboarding.goal.motorRecoveryDesc": { it: "Recupera mobilità e forza dopo infortunio o intervento", en: "Recover mobility and strength after injury or surgery", fr: "Récupérer mobilité et force après blessure ou chirurgie", es: "Recupera movilidad y fuerza después de lesión o cirugía" },
  "onboarding.goal.pregnancy": { it: "Gravidanza", en: "Pregnancy", fr: "Grossesse", es: "Embarazo" },
  "onboarding.goal.prePartumDesc": { it: "Allenamento sicuro durante la gravidanza", en: "Safe training during pregnancy", fr: "Entraînement sécurisé pendant la grossesse", es: "Entrenamiento seguro durante el embarazo" },
  "onboarding.goal.postPartumDesc": { it: "Recupero post-parto graduale e sicuro", en: "Gradual and safe post-partum recovery", fr: "Récupération post-partum graduelle et sécurisée", es: "Recuperación posparto gradual y segura" },
  "onboarding.goal.disability": { it: "Disabilità", en: "Disability", fr: "Handicap", es: "Discapacidad" },
  "onboarding.goal.disabilityDesc": { it: "Programma adattato per persone con disabilità", en: "Adapted program for people with disabilities", fr: "Programme adapté pour personnes handicapées", es: "Programa adaptado para personas con discapacidad" },
  "onboarding.goal.select_sport": { it: "Seleziona sport", en: "Select sport", fr: "Sélectionner un sport", es: "Seleccionar deporte" },
  "onboarding.goal.select_role": { it: "Seleziona ruolo", en: "Select role", fr: "Sélectionner un rôle", es: "Seleccionar rol" },
  "onboarding.goal.motorRecovery": { it: "Recupero Motorio", en: "Motor Recovery", fr: "Récupération motrice", es: "Recuperación motora" },
  "onboarding.goal.prePartum": { it: "Pre-Parto", en: "Pre-Partum", fr: "Pré-partum", es: "Pre-parto" },
  "onboarding.goal.postPartum": { it: "Post-Parto", en: "Post-Partum", fr: "Post-partum", es: "Posparto" },
  "onboarding.goal.importantNote": { it: "Nota Importante", en: "Important Note", fr: "Note importante", es: "Nota importante" },
  "onboarding.goal.recoveryNote1": { it: "Il programma è pensato per supportare il recupero, ma NON sostituisce la fisioterapia", en: "The program supports recovery but does NOT replace physical therapy", fr: "Le programme soutient la récupération mais ne remplace PAS la physiothérapie", es: "El programa apoya la recuperación pero NO reemplaza la fisioterapia" },
  "onboarding.goal.recoveryNote2": { it: "Consulta sempre il tuo medico o fisioterapista prima di iniziare", en: "Always consult your doctor or physiotherapist before starting", fr: "Consultez toujours votre médecin ou physiothérapeute avant de commencer", es: "Consulta siempre a tu médico o fisioterapeuta antes de comenzar" },
  "onboarding.goal.recoveryNote3": { it: "Gli esercizi saranno a bassa intensità e progressivi", en: "Exercises will be low intensity and progressive", fr: "Les exercices seront de faible intensité et progressifs", es: "Los ejercicios serán de baja intensidad y progresivos" },
  "onboarding.goal.recoveryNote4": { it: "Fermati immediatamente se senti dolore acuto", en: "Stop immediately if you feel acute pain", fr: "Arrêtez immédiatement si vous ressentez une douleur aiguë", es: "Detente inmediatamente si sientes dolor agudo" },
  "onboarding.goal.pregnancyImportant": { it: "Importante - Gravidanza", en: "Important - Pregnancy", fr: "Important - Grossesse", es: "Importante - Embarazo" },
  "onboarding.goal.pregnancyNote1": { it: "Consulta il tuo ginecologo prima di iniziare qualsiasi programma di allenamento", en: "Consult your gynecologist before starting any training program", fr: "Consultez votre gynécologue avant de commencer tout programme d'entraînement", es: "Consulta a tu ginecólogo antes de comenzar cualquier programa de entrenamiento" },
  "onboarding.goal.pregnancyNote2": { it: "Eviteremo esercizi ad alta intensità e impatto", en: "We will avoid high intensity and impact exercises", fr: "Nous éviterons les exercices à haute intensité et à impact", es: "Evitaremos ejercicios de alta intensidad e impacto" },
  "onboarding.goal.pregnancyNote3": { it: "Focus su mobilità, respirazione e rinforzo del pavimento pelvico", en: "Focus on mobility, breathing and pelvic floor strengthening", fr: "Accent sur la mobilité, la respiration et le renforcement du plancher pelvien", es: "Enfoque en movilidad, respiración y fortalecimiento del suelo pélvico" },
  "onboarding.goal.pregnancyNote4": { it: "Fermati se senti dolore, vertigini o contrazioni", en: "Stop if you feel pain, dizziness or contractions", fr: "Arrêtez si vous ressentez des douleurs, des vertiges ou des contractions", es: "Detente si sientes dolor, mareos o contracciones" },
  "onboarding.goal.postPartumIncludes": { it: "Post-Parto include:", en: "Post-Partum includes:", fr: "Post-partum comprend:", es: "Posparto incluye:" },
  "onboarding.goal.postPartumFeatures": { it: "Recupero diastasi addominale, rinforzo pavimento pelvico, ritorno graduale all'attività", en: "Diastasis recti recovery, pelvic floor strengthening, gradual return to activity", fr: "Récupération de la diastase abdominale, renforcement du plancher pelvien, retour progressif à l'activité", es: "Recuperación de diástasis abdominal, fortalecimiento del suelo pélvico, retorno gradual a la actividad" },
  "onboarding.goal.disabilityImportant": { it: "Importante - Disabilità", en: "Important - Disability", fr: "Important - Handicap", es: "Importante - Discapacidad" },
  "onboarding.goal.disabilityNote1": { it: "Questo programma è un supporto, non sostituisce la terapia specialistica", en: "This program is a support, not a replacement for specialized therapy", fr: "Ce programme est un soutien, pas un remplacement pour la thérapie spécialisée", es: "Este programa es un apoyo, no un reemplazo de la terapia especializada" },
  "onboarding.goal.disabilityNote2": { it: "Adatteremo gli esercizi alle tue capacità motorie", en: "We will adapt exercises to your motor capabilities", fr: "Nous adapterons les exercices à vos capacités motrices", es: "Adaptaremos los ejercicios a tus capacidades motoras" },
  "onboarding.goal.disabilityNote3": { it: "Consulta il tuo medico o terapista prima di iniziare", en: "Consult your doctor or therapist before starting", fr: "Consultez votre médecin ou thérapeute avant de commencer", es: "Consulta a tu médico o terapeuta antes de comenzar" },
  "onboarding.goal.disabilityNote4": { it: "Potrai modificare esercizi e intensità in base alle tue esigenze", en: "You can modify exercises and intensity based on your needs", fr: "Vous pouvez modifier les exercices et l'intensité en fonction de vos besoins", es: "Puedes modificar ejercicios e intensidad según tus necesidades" },
  "onboarding.goal.muscularFocus": { it: "Focus Muscolare", en: "Muscular Focus", fr: "Focus Musculaire", es: "Enfoque Muscular" },
  "onboarding.goal.muscularFocusDesc": { it: "Vuoi dare più enfasi a qualche gruppo muscolare? (opzionale)", en: "Want to emphasize any muscle group? (optional)", fr: "Voulez-vous mettre l'accent sur un groupe musculaire? (optionnel)", es: "¿Quieres enfatizar algún grupo muscular? (opcional)" },
  "onboarding.goal.noFocus": { it: "Nessun Focus", en: "No Focus", fr: "Aucun focus", es: "Sin enfoque" },
  "onboarding.goal.noFocusDesc": { it: "Programma bilanciato su tutto il corpo", en: "Balanced full-body program", fr: "Programme équilibré pour tout le corps", es: "Programa equilibrado de cuerpo completo" },
  "onboarding.goal.increasedVolume": { it: "Volume Aumentato", en: "Increased Volume", fr: "Volume augmenté", es: "Volumen aumentado" },
  "onboarding.goal.whichSport": { it: "Quale sport pratichi?", en: "Which sport do you practice?", fr: "Quel sport pratiquez-vous?", es: "¿Qué deporte practicas?" },
  "onboarding.goal.selectSport": { it: "Seleziona sport", en: "Select sport", fr: "Sélectionner un sport", es: "Seleccionar deporte" },
  "onboarding.goal.rolePosition": { it: "Ruolo/Posizione", en: "Role/Position", fr: "Rôle/Position", es: "Rol/Posición" },
  "onboarding.goal.selectRole": { it: "Seleziona ruolo", en: "Select role", fr: "Sélectionner un rôle", es: "Seleccionar rol" },
  "onboarding.goal.sportOptimized": { it: "Il programma sarà ottimizzato per il tuo sport e ruolo specifico", en: "The program will be optimized for your specific sport and role", fr: "Le programme sera optimisé pour votre sport et rôle spécifique", es: "El programa será optimizado para tu deporte y rol específico" },

  // Sports
  "sport.volleyball": { it: "Pallavolo", en: "Volleyball", fr: "Volleyball", es: "Voleibol" },
  "sport.basketball": { it: "Basket", en: "Basketball", fr: "Basketball", es: "Baloncesto" },
  "sport.soccer": { it: "Calcio", en: "Soccer", fr: "Football", es: "Fútbol" },
  "sport.tennis": { it: "Tennis", en: "Tennis", fr: "Tennis", es: "Tenis" },
  "sport.swimming": { it: "Nuoto", en: "Swimming", fr: "Natation", es: "Natación" },
  "sport.running": { it: "Corsa", en: "Running", fr: "Course", es: "Carrera" },
  "sport.cycling": { it: "Ciclismo", en: "Cycling", fr: "Cyclisme", es: "Ciclismo" },
  "sport.rugby": { it: "Rugby", en: "Rugby", fr: "Rugby", es: "Rugby" },
  "sport.crossfit": { it: "CrossFit", en: "CrossFit", fr: "CrossFit", es: "CrossFit" },
  "sport.powerlifting": { it: "Powerlifting", en: "Powerlifting", fr: "Powerlifting", es: "Powerlifting" },
  "sport.martial_arts": { it: "Arti Marziali", en: "Martial Arts", fr: "Arts martiaux", es: "Artes marciales" },
  "sport.other": { it: "Altro", en: "Other", fr: "Autre", es: "Otro" },

  // Volleyball roles
  "role.setter": { it: "Alzatore", en: "Setter", fr: "Passeur", es: "Colocador" },
  "role.opposite": { it: "Opposto", en: "Opposite", fr: "Opposé", es: "Opuesto" },
  "role.libero": { it: "Libero", en: "Libero", fr: "Libéro", es: "Líbero" },
  "role.middle": { it: "Centrale", en: "Middle Blocker", fr: "Central", es: "Central" },
  "role.outside": { it: "Schiacciatore", en: "Outside Hitter", fr: "Ailier", es: "Atacante" },
  "role.hitter": { it: "Attaccante", en: "Hitter", fr: "Frappeur", es: "Atacante" },

  // Soccer roles
  "role.goalkeeper": { it: "Portiere", en: "Goalkeeper", fr: "Gardien", es: "Portero" },
  "role.defender": { it: "Difensore", en: "Defender", fr: "Défenseur", es: "Defensor" },
  "role.midfielder": { it: "Centrocampista", en: "Midfielder", fr: "Milieu", es: "Centrocampista" },
  "role.striker": { it: "Attaccante", en: "Striker", fr: "Attaquant", es: "Delantero" },

  // Basketball roles
  "role.pointGuard": { it: "Playmaker", en: "Point Guard", fr: "Meneur", es: "Base" },
  "role.guard": { it: "Guardia", en: "Guard", fr: "Garde", es: "Escolta" },
  "role.forward": { it: "Ala", en: "Forward", fr: "Ailier", es: "Alero" },
  "role.center": { it: "Pivot", en: "Center", fr: "Pivot", es: "Pívot" },

  // Tennis roles
  "role.singles": { it: "Singolo", en: "Singles", fr: "Simple", es: "Individual" },
  "role.doubles": { it: "Doppio", en: "Doubles", fr: "Double", es: "Dobles" },

  // Swimming styles
  "role.freestyle": { it: "Stile Libero", en: "Freestyle", fr: "Nage libre", es: "Estilo libre" },
  "role.breaststroke": { it: "Rana", en: "Breaststroke", fr: "Brasse", es: "Braza" },
  "role.backstroke": { it: "Dorso", en: "Backstroke", fr: "Dos", es: "Espalda" },
  "role.butterfly": { it: "Farfalla", en: "Butterfly", fr: "Papillon", es: "Mariposa" },
  "role.medley": { it: "Misti", en: "Medley", fr: "Quatre nages", es: "Combinado" },
  "role.sprint": { it: "Sprint", en: "Sprint", fr: "Sprint", es: "Sprint" },
  "role.long": { it: "Lunghe Distanze", en: "Long Distance", fr: "Longue distance", es: "Larga distancia" },

  // Cycling roles
  "role.road": { it: "Strada", en: "Road", fr: "Route", es: "Carretera" },
  "role.mtb": { it: "Mountain Bike", en: "Mountain Bike", fr: "VTT", es: "Montaña" },
  "role.track": { it: "Pista", en: "Track", fr: "Piste", es: "Pista" },

  // Rugby roles
  "role.back": { it: "Tre Quarti", en: "Back", fr: "Arrière", es: "Tres cuartos" },
  "role.scrumHalf": { it: "Mediano di Mischia", en: "Scrum Half", fr: "Demi de mêlée", es: "Medio Scrum" },
  "role.prop": { it: "Pilone", en: "Prop", fr: "Pilier", es: "Pilar" },
  "role.hooker": { it: "Tallonatore", en: "Hooker", fr: "Talonneur", es: "Talonador" },
  "role.lock": { it: "Seconda Linea", en: "Lock", fr: "Deuxième ligne", es: "Segunda línea" },

  // Onboarding - Photo Analysis
  "onboarding.photo.title": { it: "Analisi Corporea", en: "Body Analysis", fr: "Analyse corporelle", es: "Análisis corporal" },
  "onboarding.photo.subtitle": { it: "Carica 3 foto per un'analisi più accurata (opzionale)", en: "Upload 3 photos for more accurate analysis (optional)", fr: "Téléchargez 3 photos pour une analyse plus précise (optionnel)", es: "Sube 3 fotos para un análisis más preciso (opcional)" },
  "onboarding.photo.tips": { it: "Foto in pose naturali con buona illuminazione. Puoi anche saltare questo step.", en: "Photos in natural poses with good lighting. You can also skip this step.", fr: "Photos en poses naturelles avec un bon éclairage. Vous pouvez également ignorer cette étape.", es: "Fotos en poses naturales con buena iluminación. También puedes omitir este paso." },
  "onboarding.photo.front": { it: "Fronte", en: "Front", fr: "Devant", es: "Frente" },
  "onboarding.photo.side": { it: "Lato", en: "Side", fr: "Côté", es: "Lado" },
  "onboarding.photo.back": { it: "Retro", en: "Back", fr: "Dos", es: "Atrás" },
  "onboarding.photo.upload": { it: "Carica", en: "Upload", fr: "Télécharger", es: "Subir" },
  "onboarding.photo.analyzing": { it: "Analisi in corso...", en: "Analyzing...", fr: "Analyse en cours...", es: "Analizando..." },
  "onboarding.photo.results": { it: "Risultati Analisi", en: "Analysis Results", fr: "Résultats de l'analyse", es: "Resultados del análisis" },
  "onboarding.photo.bodyFat": { it: "Body Fat Stimato", en: "Estimated Body Fat", fr: "Graisse corporelle estimée", es: "Grasa corporal estimada" },
  "onboarding.photo.muscleMass": { it: "Massa Muscolare", en: "Muscle Mass", fr: "Masse musculaire", es: "Masa muscular" },
  "onboarding.photo.suggestions": { it: "Suggerimenti", en: "Suggestions", fr: "Suggestions", es: "Sugerencias" },
  "onboarding.photo.continueBtn": { it: "Continua", en: "Continue", fr: "Continuer", es: "Continuar" },
  "onboarding.photo.skipBtn": { it: "Salta questo Step", en: "Skip this Step", fr: "Passer cette étape", es: "Omitir este paso" },
  "onboarding.photo.suggestion1": { it: "Considera deficit calorico per ridurre massa grassa", en: "Consider caloric deficit to reduce body fat", fr: "Envisagez un déficit calorique pour réduire la graisse corporelle", es: "Considera un déficit calórico para reducir grasa corporal" },
  "onboarding.photo.suggestion2": { it: "Focus su allenamento forza e surplus calorico", en: "Focus on strength training and caloric surplus", fr: "Concentrez-vous sur la musculation et l'excédent calorique", es: "Enfócate en entrenamiento de fuerza y superávit calórico" },
  "onboarding.photo.muscleMassLow": { it: "Bassa", en: "Low", fr: "Faible", es: "Baja" },
  "onboarding.photo.muscleMassAverage": { it: "Media", en: "Average", fr: "Moyenne", es: "Media" },
  "onboarding.photo.muscleMassHigh": { it: "Alta", en: "High", fr: "Élevée", es: "Alta" },

  // Onboarding - Pain
  "onboarding.pain.title": { it: "Dolori o Limitazioni", en: "Pain or Limitations", fr: "Douleurs ou limitations", es: "Dolores o limitaciones" },
  "onboarding.pain.subtitle": { it: "Ci aiuta a personalizzare il tuo programma", en: "Helps us personalize your program", fr: "Nous aide à personnaliser votre programme", es: "Nos ayuda a personalizar tu programa" },
  "onboarding.pain.question": { it: "Hai dolori o limitazioni fisiche?", en: "Do you have pain or physical limitations?", fr: "Avez-vous des douleurs ou limitations?", es: "¿Tienes dolores o limitaciones físicas?" },
  "onboarding.pain.feelGood": { it: "Mi sento bene", en: "I feel good", fr: "Je me sens bien", es: "Me siento bien" },
  "onboarding.pain.hasPain": { it: "Ho dolori", en: "I have pain", fr: "J'ai des douleurs", es: "Tengo dolores" },
  "onboarding.pain.specifyAreas": { it: "Specifica le aree", en: "Specify areas", fr: "Spécifier les zones", es: "Especificar áreas" },
  "onboarding.pain.none": { it: "Nessun dolore", en: "No pain", fr: "Aucune douleur", es: "Sin dolor" },
  "onboarding.pain.select_areas": { it: "Seleziona le aree interessate", en: "Select affected areas", fr: "Sélectionnez les zones concernées", es: "Selecciona las áreas afectadas" },
  "onboarding.pain.severity": { it: "Gravità", en: "Severity", fr: "Gravité", es: "Gravedad" },
  "onboarding.pain.mild": { it: "Lieve", en: "Mild", fr: "Léger", es: "Leve" },
  "onboarding.pain.moderate": { it: "Moderato", en: "Moderate", fr: "Modéré", es: "Moderado" },
  "onboarding.pain.severe": { it: "Grave", en: "Severe", fr: "Grave", es: "Grave" },
  "onboarding.pain.selectAreas": { it: "Seleziona le aree interessate", en: "Select affected areas", fr: "Sélectionnez les zones concernées", es: "Selecciona las áreas afectadas" },
  "onboarding.pain.intensity": { it: "Intensità del dolore", en: "Pain intensity", fr: "Intensité de la douleur", es: "Intensidad del dolor" },
  "onboarding.pain.mildRange": { it: "1-3: Lieve", en: "1-3: Mild", fr: "1-3: Léger", es: "1-3: Leve" },
  "onboarding.pain.moderateRange": { it: "4-7: Moderato", en: "4-7: Moderate", fr: "4-7: Modéré", es: "4-7: Moderado" },
  "onboarding.pain.severeRange": { it: "8-10: Grave", en: "8-10: Severe", fr: "8-10: Grave", es: "8-10: Grave" },
  "onboarding.pain.warning": { it: "⚠️ Il programma verrà adattato per proteggere le aree doloranti. Consulta un medico prima di iniziare qualsiasi programma di allenamento.", en: "⚠️ The program will be adapted to protect painful areas. Consult a doctor before starting any training program.", fr: "⚠️ Le programme sera adapté pour protéger les zones douloureuses. Consultez un médecin avant de commencer tout programme d'entraînement.", es: "⚠️ El programa se adaptará para proteger las áreas dolorosas. Consulta a un médico antes de comenzar cualquier programa de entrenamiento." },

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
  "body.lowerBack": { it: "Lombare", en: "Lower Back", fr: "Bas du dos", es: "Zona lumbar" },
  "body.neck": { it: "Collo", en: "Neck", fr: "Cou", es: "Cuello" },
  "body.hip": { it: "Anca", en: "Hip", fr: "Hanche", es: "Cadera" },
  "body.elbow": { it: "Gomiti", en: "Elbows", fr: "Coudes", es: "Codos" },
  "body.wrist": { it: "Polsi", en: "Wrists", fr: "Poignets", es: "Muñecas" },
  "body.ankle": { it: "Caviglia", en: "Ankle", fr: "Cheville", es: "Tobillo" },
  "body.ankles": { it: "Caviglie", en: "Ankles", fr: "Chevilles", es: "Tobillos" },

  // Muscular Focus
  "muscles.title": { it: "Focus Muscolare", en: "Muscular Focus", fr: "Focus Musculaire", es: "Enfoque Muscular" },
  "muscles.subtitle": { it: "Vuoi dare più enfasi a qualche gruppo muscolare?", en: "Want to emphasize any muscle group?", fr: "Voulez-vous mettre l'accent sur un groupe musculaire?", es: "¿Quieres enfatizar algún grupo muscular?" },
  "muscles.noFocus": { it: "Nessun Focus", en: "No Focus", fr: "Aucun focus", es: "Sin enfoque" },
  "muscles.noFocusDesc": { it: "Programma bilanciato su tutto il corpo", en: "Balanced full-body program", fr: "Programme équilibré pour tout le corps", es: "Programa equilibrado de cuerpo completo" },
  "muscles.increasedVolume": { it: "Volume Aumentato", en: "Increased Volume", fr: "Volume augmenté", es: "Volumen aumentado" },
  "muscles.glutes": { it: "Glutei", en: "Glutes", fr: "Fessiers", es: "Glúteos" },
  "muscles.glutesDesc": { it: "Enfasi su glutei con volume extra", en: "Emphasis on glutes with extra volume", fr: "Accent sur les fessiers avec volume supplémentaire", es: "Énfasis en glúteos con volumen extra" },
  "muscles.abs": { it: "Addominali", en: "Abs", fr: "Abdominaux", es: "Abdominales" },
  "muscles.absDesc": { it: "Core e addominali rafforzati", en: "Strengthened core and abs", fr: "Renforcement du tronc et des abdominaux", es: "Core y abdominales fortalecidos" },
  "muscles.chest": { it: "Petto", en: "Chest", fr: "Pectoraux", es: "Pecho" },
  "muscles.chestDesc": { it: "Sviluppo pettorali con volume extra", en: "Chest development with extra volume", fr: "Développement des pectoraux avec volume supplémentaire", es: "Desarrollo de pectorales con volumen extra" },
  "muscles.back": { it: "Schiena", en: "Back", fr: "Dos", es: "Espalda" },
  "muscles.backDesc": { it: "Dorsali e schiena con volume extra", en: "Lats and back with extra volume", fr: "Dorsaux et dos avec volume supplémentaire", es: "Dorsales y espalda con volumen extra" },
  "muscles.shoulders": { it: "Spalle", en: "Shoulders", fr: "Épaules", es: "Hombros" },
  "muscles.shouldersDesc": { it: "Deltoidi con volume extra", en: "Deltoids with extra volume", fr: "Deltoïdes avec volume supplémentaire", es: "Deltoides con volumen extra" },
  "muscles.legs": { it: "Gambe", en: "Legs", fr: "Jambes", es: "Piernas" },
  "muscles.legsDesc": { it: "Quadricipiti e femorali con volume extra", en: "Quads and hamstrings with extra volume", fr: "Quadriceps et ischio-jambiers avec volume supplémentaire", es: "Cuádriceps y femorales con volumen extra" },
  "muscles.arms": { it: "Braccia", en: "Arms", fr: "Bras", es: "Brazos" },
  "muscles.armsDesc": { it: "Bicipiti e tricipiti con volume extra", en: "Biceps and triceps with extra volume", fr: "Biceps et triceps avec volume supplémentaire", es: "Bíceps y tríceps con volumen extra" },
  "muscles.calves": { it: "Polpacci", en: "Calves", fr: "Mollets", es: "Gemelos" },
  "muscles.calvesDesc": { it: "Polpacci con volume extra", en: "Calves with extra volume", fr: "Mollets avec volume supplémentaire", es: "Gemelos con volumen extra" },

  // Language Selector
  "lang.select": { it: "Lingua", en: "Language", fr: "Langue", es: "Idioma" },
  "lang.it": { it: "Italiano", en: "Italian", fr: "Italien", es: "Italiano" },
  "lang.en": { it: "Inglese", en: "English", fr: "Anglais", es: "Inglés" },
  "lang.fr": { it: "Francese", en: "French", fr: "Français", es: "Francés" },
  "lang.es": { it: "Spagnolo", en: "Spanish", fr: "Espagnol", es: "Español" },

  // Dashboard
  "dashboard.title": { it: "Dashboard Intelligente", en: "Smart Dashboard", fr: "Tableau de Bord Intelligent", es: "Panel Inteligente" },
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

  // Dashboard - Titles & Status
  "dashboard.analytics.today": { it: "Oggi", en: "Today", fr: "Aujourd'hui", es: "Hoy" },
  "dashboard.analytics.yesterday": { it: "Ieri", en: "Yesterday", fr: "Hier", es: "Ayer" },
  "dashboard.analytics.days_ago": { it: "{{days}} giorni fa", en: "{{days}} days ago", fr: "Il y a {{days}} jours", es: "Hace {{days}} días" },
  "dashboard.sync_status.synced": { it: "Sincronizzato", en: "Synced", fr: "Synchronisé", es: "Sincronizado" },
  "dashboard.sync_status.syncing": { it: "Sincronizzazione...", en: "Syncing...", fr: "Synchronisation...", es: "Sincronizando..." },
  "dashboard.sync_status.offline": { it: "Offline", en: "Offline", fr: "Hors ligne", es: "Sin conexión" },

  // Dashboard - Reset Messages
  "dashboard.reset.button_label": { it: "Reset", en: "Reset", fr: "Réinitialiser", es: "Restablecer" },
  "dashboard.reset.complete_message": { it: "✅ Reset completo! Tutti i dati sono stati eliminati.\n\nVerrai reindirizzato all'onboarding.", en: "✅ Complete reset! All data has been deleted.\n\nYou will be redirected to onboarding.", fr: "✅ Réinitialisation complète! Toutes les données ont été supprimées.\n\nVous serez redirigé vers l'onboarding.", es: "✅ Reinicio completo! Todos los datos han sido eliminados.\n\nSerás redirigido al onboarding." },
  "dashboard.reset.error_message": { it: "Errore durante il reset. Alcuni dati potrebbero non essere stati eliminati.", en: "Error during reset. Some data may not have been deleted.", fr: "Erreur lors de la réinitialisation. Certaines données n'ont peut-être pas été supprimées.", es: "Error durante el reinicio. Es posible que algunos datos no se hayan eliminado." },
  "dashboard.reset.modal_title": { it: "🔄 Opzioni Reset", en: "🔄 Reset Options", fr: "🔄 Options de Réinitialisation", es: "🔄 Opciones de Reinicio" },
  "dashboard.reset.deep_reset": { it: "Reset Profondo", en: "Deep Reset", fr: "Réinitialisation Profonde", es: "Reinicio Profundo" },
  "dashboard.reset.deep_reset_desc": { it: "Elimina TUTTO: programmi, dati, progressi. Ricomincia da zero.", en: "Delete EVERYTHING: programs, data, progress. Start fresh.", fr: "Supprimer TOUT: programmes, données, progrès. Repartir de zéro.", es: "Eliminar TODO: programas, datos, progresos. Empezar de cero." },
  "dashboard.reset.executing": { it: "Reset in corso...", en: "Resetting...", fr: "Réinitialisation...", es: "Reiniciando..." },
  "dashboard.reset.execute_deep": { it: "Esegui Reset Profondo", en: "Execute Deep Reset", fr: "Exécuter la Réinitialisation Profonde", es: "Ejecutar Reinicio Profundo" },

  // Dashboard - Analytics
  "dashboard.analytics.total_volume": { it: "Volume Totale", en: "Total Volume", fr: "Volume Total", es: "Volumen Total" },
  "dashboard.analytics.weekly": { it: "Settimanale: {{volume}} reps/week", en: "Weekly: {{volume}} reps/week", fr: "Hebdomadaire: {{volume}} reps/semaine", es: "Semanal: {{volume}} reps/semana" },
  "dashboard.analytics.days_active": { it: "Giorni Attivi", en: "Days Active", fr: "Jours Actifs", es: "Días Activos" },
  "dashboard.analytics.progression": { it: "Progressione", en: "Progression", fr: "Progression", es: "Progresión" },
  "dashboard.analytics.last_workout": { it: "Ultimo Workout", en: "Last Workout", fr: "Dernier Entraînement", es: "Último Entrenamiento" },

  // Dashboard - Error Messages
  "dashboard.error.program_not_recovered": { it: "⚠️ Errore: Programma salvato ma non recuperato. Ricarica la pagina.", en: "⚠️ Error: Program saved but not recovered. Reload the page.", fr: "⚠️ Erreur: Programme enregistré mais non récupéré. Rechargez la page.", es: "⚠️ Error: Programa guardado pero no recuperado. Recarga la página." },
  "dashboard.error.saved_locally": { it: "⚠️ Programma generato (salvato localmente)", en: "⚠️ Program generated (saved locally)", fr: "⚠️ Programme généré (enregistré localement)", es: "⚠️ Programa generado (guardado localmente)" },
  "dashboard.error.cloud_sync": { it: "Errore sincronizzazione cloud", en: "Cloud sync error", fr: "Erreur de synchronisation cloud", es: "Error de sincronización en la nube" },
  "dashboard.error.adjustment": { it: "Errore nell'applicare l'adjustment. Riprova.", en: "Error applying adjustment. Try again.", fr: "Erreur lors de l'application de l'ajustement. Réessayez.", es: "Error al aplicar el ajuste. Inténtalo de nuevo." },

  // Dashboard - Program Generation
  "dashboard.program.your_program_title": { it: "✅ Il Tuo Programma", en: "✅ Your Program", fr: "✅ Votre Programme", es: "✅ Tu Programa" },
  "dashboard.program.generate_title": { it: "📋 Genera il Tuo Programma", en: "📋 Generate Your Program", fr: "📋 Générer Votre Programme", es: "📋 Generar Tu Programa" },
  "dashboard.generate.complete_screening_warning": { it: "⚠️ Completa prima lo screening per determinare il tuo livello!", en: "⚠️ Complete screening first to determine your level!", fr: "⚠️ Complétez d'abord le dépistage pour déterminer votre niveau!", es: "⚠️ ¡Completa primero el screening para determinar tu nivel!" },
  "dashboard.generate.success_message": { it: "✅ Programma {{level}} per {{goal}} generato e salvato su cloud!", en: "✅ {{level}} program for {{goal}} generated and saved to cloud!", fr: "✅ Programme {{level}} pour {{goal}} généré et sauvegardé sur le cloud!", es: "✅ ¡Programa {{level}} para {{goal}} generado y guardado en la nube!" },
  "dashboard.generate.error_message": { it: "Errore nella generazione del programma", en: "Error generating program", fr: "Erreur lors de la génération du programme", es: "Error al generar el programa" },
  "dashboard.regenerate.confirm_message": { it: "Vuoi rigenerare il programma?", en: "Do you want to regenerate the program?", fr: "Voulez-vous régénérer le programme?", es: "¿Quieres regenerar el programa?" },

  // Dashboard - Location Switch
  "dashboard.location_switch.success_message": { it: "✅ Location cambiata!\n\nNuovo programma per {{location}} generato con successo!", en: "✅ Location changed!\n\nNew program for {{location}} generated successfully!", fr: "✅ Lieu changé!\n\nNouveau programme pour {{location}} généré avec succès!", es: "✅ ¡Ubicación cambiada!\n\n¡Nuevo programa para {{location}} generado exitosamente!" },
  "dashboard.location_switch.error_message": { it: "Errore durante il cambio di location", en: "Error changing location", fr: "Erreur lors du changement de lieu", es: "Error al cambiar ubicación" },

  // Paywall Modal
  "paywall.congrats_title": { it: "🎉 Complimenti! Hai finito la settimana 1", en: "🎉 Congratulations! You finished week 1", fr: "🎉 Félicitations! Vous avez terminé la semaine 1", es: "🎉 ¡Felicidades! Has terminado la semana 1" },
  "paywall.unlock_subtitle": { it: "Sblocca le prossime 5 settimane e raggiungi i tuoi obiettivi", en: "Unlock the next 5 weeks and reach your goals", fr: "Débloquez les 5 prochaines semaines et atteignez vos objectifs", es: "Desbloquea las próximas 5 semanas y alcanza tus metas" },
  "paywall.workouts_completed": { it: "Workout Completati", en: "Workouts Completed", fr: "Entraînements Terminés", es: "Entrenamientos Completados" },
  "paywall.baseline_improvements": { it: "Miglioramenti Baseline", en: "Baseline Improvements", fr: "Améliorations de Base", es: "Mejoras de Línea Base" },
  "paywall.injuries_avoided": { it: "Esercizi Sostituiti (dolore evitato)", en: "Exercises Replaced (pain avoided)", fr: "Exercices Remplacés (douleur évitée)", es: "Ejercicios Reemplazados (dolor evitado)" },
  "paywall.most_chosen": { it: "⭐ PIÙ SCELTO", en: "⭐ MOST CHOSEN", fr: "⭐ PLUS CHOISI", es: "⭐ MÁS ELEGIDO" },
  "paywall.maximum": { it: "👑 MASSIMO", en: "👑 MAXIMUM", fr: "👑 MAXIMUM", es: "👑 MÁXIMO" },
  "paywall.per_6_weeks": { it: "per 6 settimane", en: "for 6 weeks", fr: "pour 6 semaines", es: "por 6 semanas" },
  "paywall.monthly_equivalent": { it: "(€{{price}}/mese equivalente)", en: "(€{{price}}/month equivalent)", fr: "(€{{price}}/mois équivalent)", es: "(€{{price}}/mes equivalente)" },
  "paywall.selected": { it: "✓ Selezionato", en: "✓ Selected", fr: "✓ Sélectionné", es: "✓ Seleccionado" },
  "paywall.select": { it: "Seleziona", en: "Select", fr: "Sélectionner", es: "Seleccionar" },
  "paywall.plan_selected_alert": { it: "Hai selezionato il piano {{plan}}! Integrazione Stripe in arrivo...", en: "You selected the {{plan}} plan! Stripe integration coming soon...", fr: "Vous avez sélectionné le plan {{plan}}! Intégration Stripe bientôt...", es: "¡Has seleccionado el plan {{plan}}! Integración de Stripe próximamente..." },

  // Paywall - Plan Features
  "paywall.feature.complete_program": { it: "Programma completo 6 settimane", en: "Complete 6-week program", fr: "Programme complet de 6 semaines", es: "Programa completo de 6 semanas" },
  "paywall.feature.progressive_overload": { it: "Progressive overload su misura", en: "Customized progressive overload", fr: "Surcharge progressive personnalisée", es: "Sobrecarga progresiva personalizada" },
  "paywall.feature.pain_management": { it: "Pain management system", en: "Pain management system", fr: "Système de gestion de la douleur", es: "Sistema de manejo del dolor" },
  "paywall.feature.workout_logger": { it: "Workout logger + tracking", en: "Workout logger + tracking", fr: "Journal d'entraînement + suivi", es: "Registro de entrenamiento + seguimiento" },
  "paywall.feature.deload_week": { it: "Deload week + retest", en: "Deload week + retest", fr: "Semaine de décharge + retest", es: "Semana de descarga + retest" },
  "paywall.feature.video_corrections": { it: "Video correzioni AI", en: "AI video corrections", fr: "Corrections vidéo IA", es: "Correcciones de video IA" },
  "paywall.feature.videos_included": { it: "{{count}} video inclusi", en: "{{count}} videos included", fr: "{{count}} vidéos incluses", es: "{{count}} videos incluidos" },
  "paywall.feature.all_base": { it: "Tutto del BASE", en: "Everything in BASE", fr: "Tout du BASE", es: "Todo del BASE" },
  "paywall.feature.12_videos": { it: "12 video correzioni AI", en: "12 AI video corrections", fr: "12 corrections vidéo IA", es: "12 correcciones de video IA" },
  "paywall.feature.per_week": { it: "{{count}}/settimana", en: "{{count}}/week", fr: "{{count}}/semaine", es: "{{count}}/semana" },
  "paywall.feature.technique_history": { it: "Storico progressi tecnica", en: "Technique progress history", fr: "Historique des progrès techniques", es: "Historial de progreso técnico" },
  "paywall.feature.hd_tutorials": { it: "Video tutorial HD", en: "HD video tutorials", fr: "Tutoriels vidéo HD", es: "Tutoriales de video HD" },
  "paywall.feature.exercise_library": { it: "Biblioteca 100+ esercizi", en: "100+ exercises library", fr: "Bibliothèque 100+ exercices", es: "Biblioteca de 100+ ejercicios" },
  "paywall.feature.pdf_export": { it: "Export PDF programma", en: "Program PDF export", fr: "Export PDF du programme", es: "Exportar programa en PDF" },
  "paywall.feature.all_pro": { it: "Tutto del PRO", en: "Everything in PRO", fr: "Tout du PRO", es: "Todo del PRO" },
  "paywall.feature.unlimited_videos": { it: "Video correzioni ILLIMITATE", en: "UNLIMITED video corrections", fr: "Corrections vidéo ILLIMITÉES", es: "Correcciones de video ILIMITADAS" },
  "paywall.feature.priority_support": { it: "Priority support <24h", en: "Priority support <24h", fr: "Support prioritaire <24h", es: "Soporte prioritario <24h" },
  "paywall.feature.early_access": { it: "Early access nuove features", en: "Early access to new features", fr: "Accès anticipé aux nouvelles fonctionnalités", es: "Acceso anticipado a nuevas funciones" },

  // Paywall - Why Different Section
  "paywall.why_different": { it: "Perché TrainSmart è diverso?", en: "Why is TrainSmart different?", fr: "Pourquoi TrainSmart est différent?", es: "¿Por qué TrainSmart es diferente?" },
  "paywall.benefit.pain_title": { it: "Pain Management Intelligente", en: "Intelligent Pain Management", fr: "Gestion Intelligente de la Douleur", es: "Gestión Inteligente del Dolor" },
  "paywall.benefit.pain_desc": { it: "L'app sostituisce automaticamente esercizi se hai dolore. Mai più fermi per infortuni.", en: "The app automatically replaces exercises if you have pain. Never stop for injuries again.", fr: "L'application remplace automatiquement les exercices si vous avez mal. Plus jamais d'arrêt pour blessures.", es: "La app reemplaza automáticamente ejercicios si tienes dolor. Nunca más paradas por lesiones." },
  "paywall.benefit.progressive_title": { it: "Progressive Overload su Misura", en: "Customized Progressive Overload", fr: "Surcharge Progressive Personnalisée", es: "Sobrecarga Progresiva Personalizada" },
  "paywall.benefit.progressive_desc": { it: "I carichi aumentano settimana per settimana basati sui TUOI risultati reali.", en: "Weights increase week by week based on YOUR actual results.", fr: "Les charges augmentent semaine après semaine selon VOS résultats réels.", es: "Los pesos aumentan semana a semana basados en TUS resultados reales." },
  "paywall.benefit.ai_title": { it: "AI Video Correction (PRO/PREMIUM)", en: "AI Video Correction (PRO/PREMIUM)", fr: "Correction Vidéo IA (PRO/PREMIUM)", es: "Corrección de Video IA (PRO/PREMIUM)" },
  "paywall.benefit.ai_desc": { it: "Il sistema analizza la tua tecnica e ti dice esattamente come migliorare con esercizi specifici.", en: "The system analyzes your technique and tells you exactly how to improve with specific exercises.", fr: "Le système analyse votre technique et vous dit exactement comment améliorer avec des exercices spécifiques.", es: "El sistema analiza tu técnica y te dice exactamente cómo mejorar con ejercicios específicos." },
  "paywall.benefit.no_commitment_title": { it: "Nessun Vincolo Mensile", en: "No Monthly Commitment", fr: "Aucun Engagement Mensuel", es: "Sin Compromiso Mensual" },
  "paywall.benefit.no_commitment_desc": { it: "Paghi per 6 settimane, vedi i risultati, decidi TU se continuare. Zero rinnovi nascosti.", en: "Pay for 6 weeks, see the results, YOU decide if to continue. Zero hidden renewals.", fr: "Payez pour 6 semaines, voyez les résultats, VOUS décidez de continuer. Zéro renouvellements cachés.", es: "Pagas por 6 semanas, ves los resultados, TÚ decides si continuar. Cero renovaciones ocultas." },

  // Paywall - Comparison Table
  "paywall.comparison_title": { it: "TrainSmart vs Alternative", en: "TrainSmart vs Alternatives", fr: "TrainSmart vs Alternatives", es: "TrainSmart vs Alternativas" },
  "paywall.comparison.pdf_sheets": { it: "Schede PDF", en: "PDF Sheets", fr: "Fiches PDF", es: "Fichas PDF" },
  "paywall.comparison.generic_apps": { it: "App Generiche", en: "Generic Apps", fr: "Apps Génériques", es: "Apps Genéricas" },
  "paywall.comparison.custom_weights": { it: "Carichi personalizzati", en: "Custom weights", fr: "Charges personnalisées", es: "Pesos personalizados" },
  "paywall.comparison.auto_progression": { it: "Progressione automatica", en: "Automatic progression", fr: "Progression automatique", es: "Progresión automática" },
  "paywall.comparison.pain_management": { it: "Pain management", en: "Pain management", fr: "Gestion de la douleur", es: "Manejo del dolor" },
  "paywall.comparison.video_correction": { it: "Video correzione AI", en: "AI video correction", fr: "Correction vidéo IA", es: "Corrección de video IA" },
  "paywall.comparison.12_videos": { it: "12 video", en: "12 videos", fr: "12 vidéos", es: "12 videos" },
  "paywall.comparison.price_6_weeks": { it: "Prezzo 6 settimane", en: "Price for 6 weeks", fr: "Prix pour 6 semaines", es: "Precio por 6 semanas" },

  // Paywall - Coach CTA
  "paywall.coach_title": { it: "🏋️ Vuoi un check personalizzato con un coach?", en: "🏋️ Want a personalized check with a coach?", fr: "🏋️ Vous voulez un check personnalisé avec un coach?", es: "🏋️ ¿Quieres una revisión personalizada con un coach?" },
  "paywall.coach_desc": { it: "Prenota una sessione individuale per analisi tecnica approfondita e programmazione su misura", en: "Book an individual session for in-depth technical analysis and custom programming", fr: "Réservez une session individuelle pour une analyse technique approfondie et une programmation sur mesure", es: "Reserva una sesión individual para análisis técnico profundo y programación personalizada" },
  "paywall.coach_button": { it: "📅 Prenota il tuo appuntamento", en: "📅 Book your appointment", fr: "📅 Réservez votre rendez-vous", es: "📅 Reserva tu cita" },

  // Paywall - Guarantee
  "paywall.guarantee": { it: "🔒 Garanzia 14 giorni soddisfatto o rimborsato", en: "🔒 14-day satisfaction guarantee or money back", fr: "🔒 Garantie satisfait ou remboursé de 14 jours", es: "🔒 Garantía de 14 días satisfecho o reembolso" },
  "paywall.no_auto_renewal": { it: "Nessun rinnovo automatico • Cancellazione in qualsiasi momento • Dati sicuri", en: "No automatic renewal • Cancel anytime • Secure data", fr: "Pas de renouvellement automatique • Annulation à tout moment • Données sécurisées", es: "Sin renovación automática • Cancelación en cualquier momento • Datos seguros" },

  // Paywall - Payment
  "paywall.pay_now": { it: "Paga Ora", en: "Pay Now", fr: "Payer Maintenant", es: "Pagar Ahora" },
  "paywall.processing": { it: "Elaborazione...", en: "Processing...", fr: "Traitement...", es: "Procesando..." },
  "paywall.accepts_cards": { it: "Carte di credito/debito", en: "Credit/debit cards", fr: "Cartes de crédit/débit", es: "Tarjetas de crédito/débito" },
  "paywall.secure_payment": { it: "Pagamento sicuro con Stripe", en: "Secure payment with Stripe", fr: "Paiement sécurisé avec Stripe", es: "Pago seguro con Stripe" },
  "paywall.error.not_logged_in": { it: "Devi essere loggato per acquistare", en: "You must be logged in to purchase", fr: "Vous devez être connecté pour acheter", es: "Debes iniciar sesión para comprar" },
  "paywall.error.generic": { it: "Errore durante il pagamento. Riprova.", en: "Error during payment. Please try again.", fr: "Erreur lors du paiement. Veuillez réessayer.", es: "Error durante el pago. Por favor, inténtalo de nuevo." },

  // Payment Success Page
  "payment_success.verifying": { it: "Verificando il pagamento...", en: "Verifying payment...", fr: "Vérification du paiement...", es: "Verificando el pago..." },
  "payment_success.please_wait": { it: "Attendi mentre confermiamo il tuo acquisto", en: "Please wait while we confirm your purchase", fr: "Veuillez patienter pendant que nous confirmons votre achat", es: "Espera mientras confirmamos tu compra" },
  "payment_success.title": { it: "Pagamento Completato!", en: "Payment Complete!", fr: "Paiement Terminé!", es: "¡Pago Completado!" },
  "payment_success.plan_activated": { it: "Piano {{plan}} Attivato", en: "{{plan}} Plan Activated", fr: "Plan {{plan}} Activé", es: "Plan {{plan}} Activado" },
  "payment_success.subscription_active": { it: "Abbonamento Attivo", en: "Subscription Active", fr: "Abonnement Actif", es: "Suscripción Activa" },
  "payment_success.ready_message": { it: "Sei pronto per iniziare le prossime 5 settimane di allenamento!", en: "You're ready to start the next 5 weeks of training!", fr: "Vous êtes prêt à commencer les 5 prochaines semaines d'entraînement!", es: "¡Estás listo para comenzar las próximas 5 semanas de entrenamiento!" },
  "payment_success.whats_next": { it: "Cosa succede ora?", en: "What's next?", fr: "Et maintenant?", es: "¿Qué sigue?" },
  "payment_success.next_1": { it: "Le settimane 2-6 sono ora sbloccate", en: "Weeks 2-6 are now unlocked", fr: "Les semaines 2 à 6 sont maintenant débloquées", es: "Las semanas 2-6 están ahora desbloqueadas" },
  "payment_success.next_2": { it: "I tuoi progressi sono salvati nel cloud", en: "Your progress is saved in the cloud", fr: "Votre progression est sauvegardée dans le cloud", es: "Tu progreso está guardado en la nube" },
  "payment_success.next_3": { it: "Riceverai una email di conferma", en: "You'll receive a confirmation email", fr: "Vous recevrez un email de confirmation", es: "Recibirás un email de confirmación" },
  "payment_success.go_to_dashboard": { it: "Vai alla Dashboard", en: "Go to Dashboard", fr: "Aller au Tableau de Bord", es: "Ir al Panel" },

  // Exercise Dislike Modal
  "exercise_dislike.title": { it: "Problema con l'esercizio?", en: "Problem with the exercise?", fr: "Problème avec l'exercice?", es: "¿Problema con el ejercicio?" },
  "exercise_dislike.current_weight": { it: "Peso attuale", en: "Current weight", fr: "Poids actuel", es: "Peso actual" },
  "exercise_dislike.why_not_like": { it: "Cosa non va?", en: "What's wrong?", fr: "Qu'est-ce qui ne va pas?", es: "¿Qué está mal?" },
  "exercise_dislike.too_heavy": { it: "È troppo pesante", en: "It's too heavy", fr: "C'est trop lourd", es: "Es demasiado pesado" },
  "exercise_dislike.too_heavy_desc": { it: "Ridurremo automaticamente il carico del 15%", en: "We'll automatically reduce the weight by 15%", fr: "Nous réduirons automatiquement le poids de 15%", es: "Reduciremos automáticamente el peso un 15%" },
  "exercise_dislike.feel_pain": { it: "Sento dolore", en: "I feel pain", fr: "Je ressens une douleur", es: "Siento dolor" },
  "exercise_dislike.feel_pain_desc": { it: "Ti aiuteremo a gestire il dolore in sicurezza", en: "We'll help you manage pain safely", fr: "Nous vous aiderons à gérer la douleur en toute sécurité", es: "Te ayudaremos a manejar el dolor de forma segura" },
  "exercise_dislike.dont_like": { it: "Non mi piace", en: "I don't like it", fr: "Je n'aime pas", es: "No me gusta" },
  "exercise_dislike.dont_like_desc": { it: "Proveremo prima con meno peso, altrimenti sostituiremo", en: "We'll try with less weight first, otherwise we'll replace", fr: "Nous essaierons d'abord avec moins de poids, sinon nous remplacerons", es: "Probaremos primero con menos peso, si no, reemplazaremos" },

  "exercise_dislike.where_pain": { it: "Dove senti dolore?", en: "Where do you feel pain?", fr: "Où ressentez-vous la douleur?", es: "¿Dónde sientes dolor?" },
  "exercise_dislike.pain_intensity": { it: "Quanto fa male? (1-10)", en: "How much does it hurt? (1-10)", fr: "À quel point ça fait mal? (1-10)", es: "¿Cuánto duele? (1-10)" },
  "exercise_dislike.pain_mild": { it: "Lieve", en: "Mild", fr: "Léger", es: "Leve" },
  "exercise_dislike.pain_moderate": { it: "Moderato", en: "Moderate", fr: "Modéré", es: "Moderado" },
  "exercise_dislike.pain_severe": { it: "Forte", en: "Severe", fr: "Fort", es: "Fuerte" },
  "exercise_dislike.pain_will_replace": { it: "Dolore alto - Sostituiremo l'esercizio con uno più sicuro", en: "High pain - We'll replace the exercise with a safer one", fr: "Douleur élevée - Nous remplacerons l'exercice par un plus sûr", es: "Dolor alto - Reemplazaremos el ejercicio por uno más seguro" },
  "exercise_dislike.pain_will_reduce": { it: "Dolore moderato - Ridurremo il carico del 20%", en: "Moderate pain - We'll reduce the weight by 20%", fr: "Douleur modérée - Nous réduirons le poids de 20%", es: "Dolor moderado - Reduciremos el peso un 20%" },
  "exercise_dislike.pain_will_adjust": { it: "Dolore lieve - Piccolo aggiustamento del 10%", en: "Mild pain - Small 10% adjustment", fr: "Douleur légère - Petit ajustement de 10%", es: "Dolor leve - Pequeño ajuste del 10%" },

  "exercise_dislike.dislike_try_lighter": { it: "Vuoi provare con meno peso prima di sostituire?", en: "Want to try with less weight before replacing?", fr: "Voulez-vous essayer avec moins de poids avant de remplacer?", es: "¿Quieres probar con menos peso antes de reemplazar?" },
  "exercise_dislike.dislike_lighter_suggestion": { it: "Spesso un esercizio non piace perché il carico è troppo alto. Prova con il 15% in meno!", en: "Often an exercise doesn't feel right because the weight is too high. Try with 15% less!", fr: "Souvent un exercice ne convient pas car le poids est trop élevé. Essayez avec 15% de moins!", es: "A menudo un ejercicio no gusta porque el peso es demasiado alto. ¡Prueba con 15% menos!" },
  "exercise_dislike.try_lighter": { it: "Provo con meno peso", en: "I'll try with less weight", fr: "J'essaie avec moins de poids", es: "Probaré con menos peso" },
  "exercise_dislike.replace_exercise": { it: "Sostituisci comunque", en: "Replace anyway", fr: "Remplacer quand même", es: "Reemplazar de todos modos" },

  "exercise_dislike.weight_reduced": { it: "Peso ridotto del 15%! Riprova con il nuovo carico.", en: "Weight reduced by 15%! Try again with the new weight.", fr: "Poids réduit de 15%! Réessayez avec le nouveau poids.", es: "¡Peso reducido un 15%! Inténtalo de nuevo con el nuevo peso." },
  "exercise_dislike.replaced_for_pain": { it: "Esercizio sostituito per proteggere la zona dolorante.", en: "Exercise replaced to protect the painful area.", fr: "Exercice remplacé pour protéger la zone douloureuse.", es: "Ejercicio reemplazado para proteger la zona dolorida." },
  "exercise_dislike.weight_reduced_for_pain": { it: "Peso ridotto del 20% per il dolore. Se persiste, segnalalo di nuovo.", en: "Weight reduced by 20% for pain. If it persists, report again.", fr: "Poids réduit de 20% pour la douleur. Si elle persiste, signalez-la à nouveau.", es: "Peso reducido un 20% por el dolor. Si persiste, repórtalo de nuevo." },
  "exercise_dislike.mild_pain_adjusted": { it: "Piccolo aggiustamento fatto. Continua con attenzione!", en: "Small adjustment made. Continue carefully!", fr: "Petit ajustement effectué. Continuez prudemment!", es: "¡Pequeño ajuste hecho. Continúa con cuidado!" },
  "exercise_dislike.weight_reduced_dislike": { it: "Peso ridotto! Vediamo se così va meglio.", en: "Weight reduced! Let's see if it's better now.", fr: "Poids réduit! Voyons si c'est mieux maintenant.", es: "¡Peso reducido! Veamos si ahora va mejor." },
  "exercise_dislike.replaced_for_dislike": { it: "Esercizio sostituito con variante equivalente.", en: "Exercise replaced with equivalent variant.", fr: "Exercice remplacé par une variante équivalente.", es: "Ejercicio reemplazado con variante equivalente." },
};



interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    // Load from localStorage or default to Italian
    const saved = localStorage.getItem("trainsmart_language");
    if (saved === "en" || saved === "fr" || saved === "es" || saved === "it") {
      return saved as Language;
    }
    return "it";
  });

  const setLanguage = (lang: Language) => {
    console.log(`🌍 Changing language from ${language} to ${lang}`);
    setLanguageState(lang);
    localStorage.setItem("trainsmart_language", lang);
    console.log(`🌍 Language changed to: ${lang}`);
    // Force a small delay to ensure state propagates
    setTimeout(() => {
      console.log(`🌍 Language state confirmed: ${lang}`);
    }, 100);
  };

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Missing translation for key: ${key}`);
      return key;
    }
    return translation[language] || translation.it || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within LanguageProvider");
  }
  return context;
}
