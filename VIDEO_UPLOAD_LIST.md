# Lista Video Esercizi da Caricare

## Setup Supabase Storage

1. Vai su **Supabase Dashboard** > **SQL Editor**
2. Esegui lo script `supabase_storage_videos.sql`
3. Vai su **Storage** > vedrai il bucket `exercise-videos`

## Come Caricare i Video

1. Vai su **Storage** > **exercise-videos**
2. Click **Upload files**
3. Seleziona i video con i nomi esatti sotto

## Lista Completa Video (60 file)

### Lower Push (10 video)
| Esercizio | Nome File |
|-----------|-----------|
| Bodyweight Squat | `bodyweight-squat.mp4` |
| Goblet Squat | `goblet-squat.mp4` |
| Front Squat | `front-squat.mp4` |
| Back Squat | `back-squat.mp4` |
| Leg Press | `leg-press.mp4` |
| Bulgarian Split Squat | `bulgarian-split-squat.mp4` |
| Pistol Squat | `pistol-squat.mp4` |
| Lunges | `lunges.mp4` |
| Step-up | `step-up.mp4` |
| Leg Extension | `leg-extension.mp4` |

### Lower Pull (9 video)
| Esercizio | Nome File |
|-----------|-----------|
| Bodyweight Hip Hinge | `bodyweight-hip-hinge.mp4` |
| Conventional Deadlift | `conventional-deadlift.mp4` |
| Romanian Deadlift (RDL) | `romanian-deadlift-rdl.mp4` |
| Sumo Deadlift | `sumo-deadlift.mp4` |
| Good Morning | `good-morning.mp4` |
| Hip Thrust | `hip-thrust.mp4` |
| Glute Bridge | `glute-bridge.mp4` |
| Nordic Curl | `nordic-curl.mp4` |
| Leg Curl | `leg-curl.mp4` |

### Upper Push Horizontal (7 video)
| Esercizio | Nome File |
|-----------|-----------|
| Push-up | `push-up.mp4` |
| Bench Press | `bench-press.mp4` |
| Dumbbell Bench Press | `dumbbell-bench-press.mp4` |
| Incline Push-up | `incline-push-up.mp4` |
| Decline Push-up | `decline-push-up.mp4` |
| Diamond Push-up | `diamond-push-up.mp4` |
| Dips | `dips.mp4` |

### Upper Push Vertical (7 video)
| Esercizio | Nome File |
|-----------|-----------|
| Pike Push-up | `pike-push-up.mp4` |
| Handstand Push-up | `handstand-push-up.mp4` |
| Overhead Press | `overhead-press.mp4` |
| Dumbbell Shoulder Press | `dumbbell-shoulder-press.mp4` |
| Arnold Press | `arnold-press.mp4` |
| Lateral Raise | `lateral-raise.mp4` |
| Front Raise | `front-raise.mp4` |

### Upper Pull Horizontal (6 video)
| Esercizio | Nome File |
|-----------|-----------|
| Inverted Row | `inverted-row.mp4` |
| Barbell Row | `barbell-row.mp4` |
| Dumbbell Row | `dumbbell-row.mp4` |
| Cable Row | `cable-row.mp4` |
| T-Bar Row | `t-bar-row.mp4` |
| Face Pull | `face-pull.mp4` |

### Upper Pull Vertical (4 video)
| Esercizio | Nome File |
|-----------|-----------|
| Pull-up | `pull-up.mp4` |
| Chin-up | `chin-up.mp4` |
| Lat Pulldown | `lat-pulldown.mp4` |
| Assisted Pull-up | `assisted-pull-up.mp4` |

### Core (7 video)
| Esercizio | Nome File |
|-----------|-----------|
| Plank | `plank.mp4` |
| Dead Bug | `dead-bug.mp4` |
| Bird Dog | `bird-dog.mp4` |
| Hanging Leg Raise | `hanging-leg-raise.mp4` |
| Ab Wheel Rollout | `ab-wheel-rollout.mp4` |
| Cable Crunch | `cable-crunch.mp4` |
| Pallof Press | `pallof-press.mp4` |

### Tricipiti (3 video)
| Esercizio | Nome File |
|-----------|-----------|
| Tricep Dips | `tricep-dips.mp4` |
| Tricep Pushdown | `tricep-pushdown.mp4` |
| Skull Crushers | `skull-crushers.mp4` |

### Bicipiti (2 video)
| Esercizio | Nome File |
|-----------|-----------|
| Barbell Curl | `barbell-curl.mp4` |
| Hammer Curl | `hammer-curl.mp4` |

### Polpacci (2 video)
| Esercizio | Nome File |
|-----------|-----------|
| Standing Calf Raise | `standing-calf-raise.mp4` |
| Seated Calf Raise | `seated-calf-raise.mp4` |

---

## Specifiche Video Consigliate

- **Formato**: MP4 (H.264)
- **Risoluzione**: 720p (1280x720)
- **Durata**: 10-20 secondi
- **FPS**: 30
- **Bitrate**: 2-4 Mbps
- **Dimensione target**: 3-5 MB per video

## Tool per Compressione

- **HandBrake** (gratuito): preset "Fast 720p30"
- **FFmpeg** (command line):
  ```bash
  ffmpeg -i input.mp4 -vf scale=1280:720 -c:v libx264 -crf 23 -preset fast -c:a aac -b:a 128k output.mp4
  ```

## Verifica Upload

Dopo aver caricato i video, verifica che funzionino:

```
https://mhcdxqhhlrujbjxtgnmz.supabase.co/storage/v1/object/public/exercise-videos/push-up.mp4
```

Sostituisci `push-up.mp4` con il nome del file da testare.
