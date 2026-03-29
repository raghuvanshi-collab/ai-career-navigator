const express = require('express');
const router = express.Router();
const CareerProfile = require('../models/CareerProfile');
const auth = require('../middleware/auth');

// POST /api/generate
// Handles form submission, calls Gemini API, returns and saves result
router.post('/generate', async (req, res) => {
  try {
    const { interests, skills, salary } = req.body;

    if (!interests || !skills || !salary) {
      return res.status(400).json({ error: 'Please provide all fields: interests, skills, salary.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured in the backend environment.' });
    }

    const prompt = `
      Act as an expert AI Career Navigator.
      Based on the following user details:
      Interests: ${interests}
      Skills: ${skills}
      Current Salary Expectation/Range: ${salary}

      Generate a comprehensive career path response in strict JSON format. 
      The JSON object must have exactly these keys:
      1. "careers": An array of exactly 3 objects, each with "title" (string) and "description" (string).
      2. "required_skills": An array of strings representing essential skills to learn or improve.
      3. "roadmap": An array of strings representing a step-by-step career progression guide.
      4. "salary_india": A string describing the expected realistic salary range in India (INR) for these roles.

      Return ONLY the raw JSON object. Do not include markdown code block formatting like \`\`\`json .
    `;

    // We use built-in fetch (Node 18+) to interact directly with Gemini REST API
    // Ensure response is forced to JSON
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { 
          responseMimeType: "application/json",
          temperature: 0.7 
        }
      })
    });

    const aiData = await response.json();

    if (!response.ok) {
      console.error('Gemini API Error:', aiData);
      throw new Error(aiData.error?.message || 'Failed to fetch from Gemini API');
    }

    if (!aiData.candidates || aiData.candidates.length === 0) {
      // Possible safety block or empty response
      const blockReason = aiData.promptFeedback?.blockReason || 'Unknown API Block';
      throw new Error(`Gemini API returned no candidates. Reason: ${blockReason}`);
    }

    let aiText = aiData.candidates[0].content?.parts[0]?.text;
    
    if (!aiText) {
      throw new Error('Gemini API returned an empty text payload.');
    }
    
    // Safety check: parse JSON
    let result;
    try {
      result = JSON.parse(aiText);
    } catch (parseErr) {
      console.error('Failed to parse Gemini response', aiText);
      // fallback cleanup if markdown got through
      aiText = aiText.replace(/```json/g, '').replace(/```/g, '');
      result = JSON.parse(aiText);
    }

    // Save to Database
    const profile = new CareerProfile({
      interests,
      skills,
      salary,
      result
    });

    await profile.save();

    res.status(200).json({
      success: true,
      data: profile
    });

  } catch (error) {
    console.error('Generation Error:', error);
    res.status(500).json({ error: error.message || 'Server Error' });
  }
});

// POST /api/career
// Analyzes user profile to suggest top careers
router.post('/career', async (req, res) => {
  try {
    const { interests, skills, currentRole, expectedSalary } = req.body;

    if (!interests || !skills) {
      return res.status(400).json({ error: 'Please provide interests and skills.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured in the backend environment.' });
    }

    const prompt = `
      Act as an expert AI Career Navigator.
      Based on the following user details:
      Interests: ${interests}
      Skills: ${skills}
      Current Role: ${currentRole || 'N/A'}
      Expected Salary: ${expectedSalary || 'N/A'}

      Generate a comprehensive career path response in strict JSON format. 
      The JSON object must have exactly these keys:
      1. "careers": An array of exactly 3 objects, each with "title" (string) and "description" (string).
      2. "required_skills": An array of strings representing essential skills to learn or improve.
      3. "salary_india": A string describing the expected realistic salary range in India (INR) for these roles.

      Return ONLY the raw JSON object. Do not include markdown code block formatting like \`\`\`json .
    `;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { 
          responseMimeType: "application/json",
          temperature: 0.7 
        }
      })
    });

    const aiData = await response.json();

    if (!response.ok) {
      throw new Error(aiData.error?.message || 'Failed to fetch from Gemini API');
    }

    let aiText = aiData.candidates[0].content?.parts[0]?.text;
    if (!aiText) throw new Error('Gemini API returned an empty text payload.');
    
    let result;
    try {
      result = JSON.parse(aiText);
    } catch (err) {
      aiText = aiText.replace(/```json/g, '').replace(/```/g, '');
      result = JSON.parse(aiText);
    }

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Career Generation Error:', error);
    res.status(500).json({ error: error.message || 'Server Error' });
  }
});

// POST /api/roadmap
// Generates a direct targeted roadmap for a specific goal career
router.post('/roadmap', async (req, res) => {
  try {
    const { goalCareer } = req.body;

    if (!goalCareer) {
      return res.status(400).json({ error: 'Please provide a goal career.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured in the backend environment.' });
    }

    const prompt = `
      Act as an expert AI Career Navigator.
      The user's targeted Dream Career is: ${goalCareer}

      Generate a comprehensive roadmap to achieve this exact career.
      The JSON object must have exactly these keys:
      1. "roadmap": An array of strings representing a step-by-step career progression guide.
      2. "required_skills": An array of strings representing essential skills to learn or master.
      3. "timeline": A number representing the statistically expected number of months (e.g. 18, 24, 36) to realistically achieve this from an entry position.

      Return ONLY the raw JSON object. Do not include markdown code block formatting like \`\`\`json .
    `;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.7 }
      })
    });

    const aiData = await response.json();

    if (!response.ok) throw new Error(aiData.error?.message || 'Failed to fetch from Gemini API');

    let aiText = aiData.candidates[0].content?.parts[0]?.text;
    if (!aiText) throw new Error('Gemini API returned an empty text payload.');
    
    let result;
    try {
      result = JSON.parse(aiText);
    } catch (err) {
      aiText = aiText.replace(/```json/g, '').replace(/```/g, '');
      result = JSON.parse(aiText);
    }

    res.status(200).json({ success: true, data: result });

  } catch (error) {
    console.error('Roadmap Generation Error:', error);
    res.status(500).json({ error: error.message || 'Server Error' });
  }
});

// POST /api/transition
// Analyzes transition overlap and gap between current skills and target career
router.post('/transition', async (req, res) => {
  try {
    const { currentSkills, targetCareer } = req.body;

    if (!currentSkills || !targetCareer) {
      return res.status(400).json({ error: 'Please provide current skills and target career.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured in the backend environment.' });
    }

    const prompt = `
      Act as an expert AI Career Transition Coach.
      User's Current Skills: ${currentSkills}
      User's Target Career: ${targetCareer}

      Calculate the transition path and return a JSON object with exactly these keys:
      1. "skill_gap": An array of strings describing exactly what skills are missing.
      2. "roadmap": An array of strings defining the transition steps.
      3. "difficulty": A string representing difficulty (e.g., "Medium", "High", "Low").
      4. "time_required": A string (e.g., "6 months", "1 year").
      5. "progress_percentage": An integer between 0 and 100 estimating how close their current skills already align with the goal.
      6. "smart_suggestions": An array of strings for practical advice.

      Return ONLY the raw JSON object. Do not include markdown code block formatting.
    `;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.7 }
      })
    });

    const aiData = await response.json();

    if (!response.ok) throw new Error(aiData.error?.message || 'Failed to fetch from Gemini API');

    let aiText = aiData.candidates[0].content?.parts[0]?.text;
    if (!aiText) throw new Error('Gemini API returned an empty text payload.');
    
    let result;
    try {
      result = JSON.parse(aiText);
    } catch (err) {
      aiText = aiText.replace(/```json/g, '').replace(/```/g, '');
      result = JSON.parse(aiText);
    }

    res.status(200).json({ success: true, data: result });

  } catch (error) {
    console.error('Transition Generation Error:', error);
    res.status(500).json({ error: error.message || 'Server Error' });
  }
});

// GET /api/profiles
// Retrieve all generated profiles for the Dashboard
router.get('/profiles', auth, async (req, res) => {
  try {
    const profiles = await CareerProfile.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: profiles });
  } catch (error) {
    console.error('Fetch Profiles Error:', error);
    res.status(500).json({ error: 'Server Error' });
  }
});

// GET /api/profiles/:id
router.get('/profiles/:id', auth, async (req, res) => {
  try {
    const profile = await CareerProfile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    console.error('Fetch Profile Error:', error);
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;
