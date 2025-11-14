export default function handler(req, res) {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'TrainSmart API is running',
    version: '4.0.0'
  });
}
