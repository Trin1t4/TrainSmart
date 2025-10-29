import Anthropic from '@anthropic-ai/sdk';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { frontImage, backImage, height, weight, age, gender } = req.body;
    
    if (!frontImage || !backImage) {
      return res.status(400).json({ error: 'Front and back images required' });
    }
    
    // ✅ USA CLAUDE VISION
    const anthropic = new Anthropic({ 
      apiKey: process.env.ANTHROPIC_API_KEY 
    });
    
    const prompt = `Analyze this person's body composition from photos.

Person details:
- Height: ${height}cm
- Weight: ${weight}kg
- Age: ${age}
- Gender: ${gender}

Estimate:
1. Body Fat Percentage (%) - Use visual cues: muscle definition, visible abs, vascularity, fat deposits
2. Body Shape classification (apple/pear/rectangle/hourglass/inverted_triangle)
3. Fat distribution pattern (upper/lower/central)

Standards for reference:
Male: 6-13% = athletic, 14-17% = fit, 18-24% = average, 25%+ = above average
Female: 14-20% = athletic, 21-24% = fit, 25-31% = average, 32%+ = above average

Return ONLY valid JSON:
{
  "bodyFatPercentage": <number>,
  "bodyShape": "<string>",
  "fatDistribution": "<string>",
  "confidence": "<high|medium|low>"
}`;
    
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      messages: [{
        role: "user",
        content: [
          { 
            type: "image", 
            source: { 
              type: "base64", 
              media_type: "image/jpeg", 
              data: frontImage.split(',')[1] // Remove "data:image/jpeg;base64," prefix
            } 
          },
          { 
            type: "image", 
            source: { 
              type: "base64", 
              media_type: "image/jpeg", 
              data: backImage.split(',')[1]
            } 
          },
          { type: "text", text: prompt }
        ]
      }]
    });
    
    // Parse Claude response
    const responseText = message.content[0].text;
    console.log('[BODY SCAN] Claude response:', responseText);
    
    // Extract JSON from response (Claude might wrap it in markdown)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON in Claude response');
    }
    
    const analysis = JSON.parse(jsonMatch[0]);
    
    // Validate
    if (!analysis.bodyFatPercentage || analysis.bodyFatPercentage < 3 || analysis.bodyFatPercentage > 60) {
      throw new Error('Invalid body fat percentage');
    }
    
    // Calculate masses
    const fatMassKg = (weight * analysis.bodyFatPercentage) / 100;
    const leanMassKg = weight - fatMassKg;
    
    console.log('[BODY SCAN] Analysis complete:', {
      bf: analysis.bodyFatPercentage,
      shape: analysis.bodyShape,
      confidence: analysis.confidence
    });
    
    return res.status(200).json({
      bodyFatPercentage: parseFloat(analysis.bodyFatPercentage.toFixed(1)),
      fatMassKg: parseFloat(fatMassKg.toFixed(1)),
      leanMassKg: parseFloat(leanMassKg.toFixed(1)),
      bodyShape: analysis.bodyShape,
      fatDistribution: analysis.fatDistribution,
      confidence: analysis.confidence
    });
    
  } catch (error) {
    console.error('[BODY SCAN] Error:', error);
    return res.status(500).json({ 
      error: 'Body composition analysis failed',
      details: error.message 
    });
  }
}
