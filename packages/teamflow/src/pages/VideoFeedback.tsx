import { useParams } from 'react-router-dom';
import VideoFeedbackView from '../components/VideoFeedbackView';

export default function VideoFeedbackPage() {
  const { correctionId } = useParams<{ correctionId: string }>();

  if (!correctionId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Errore</h1>
          <p className="text-gray-400">ID correzione mancante</p>
        </div>
      </div>
    );
  }

  return <VideoFeedbackView correctionId={correctionId} />;
}
