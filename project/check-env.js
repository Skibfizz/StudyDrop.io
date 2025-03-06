// Simple script to check environment variables
const fs = require('fs');
const path = require('path');

// Read .env.local file manually
try {
  const envPath = path.resolve('.env.local');
  console.log('Reading from:', envPath);
  
  // Check if file exists
  if (!fs.existsSync(envPath)) {
    console.error('File does not exist:', envPath);
    process.exit(1);
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('File content length:', envContent.length);
  console.log('First 50 characters:', envContent.substring(0, 50));
  
  // Parse the file content
  const envLines = envContent.split('\n');
  console.log('Number of lines in file:', envLines.length);
  
  // Find OPENAI_API_KEY line
  const openaiKeyLine = envLines.findIndex(line => line.trim().startsWith('OPENAI_API_KEY='));
  if (openaiKeyLine >= 0) {
    console.log('OPENAI_API_KEY found at line:', openaiKeyLine + 1);
    console.log('Line content:', envLines[openaiKeyLine]);
    
    // Check next few lines to see if the key might be split
    for (let i = 1; i <= 3; i++) {
      if (openaiKeyLine + i < envLines.length) {
        console.log(`Next line ${i}:`, envLines[openaiKeyLine + i]);
      }
    }
  } else {
    console.log('OPENAI_API_KEY line not found');
  }
  
  // Check for lines containing OPENAI_API_KEY
  const openaiKeyLines = envLines.filter(line => 
    line.trim() && line.includes('OPENAI_API_KEY')
  );
  console.log('Lines containing OPENAI_API_KEY:', openaiKeyLines.length);
  openaiKeyLines.forEach((line, i) => console.log(`Match ${i+1}:`, line));
  
} catch (error) {
  console.error('Error reading .env.local file:', error);
} 