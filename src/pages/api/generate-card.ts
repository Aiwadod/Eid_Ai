import type { NextApiRequest, NextApiResponse } from 'next';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { userName, isClubMember } = req.body;

  if (!userName || typeof isClubMember === 'undefined') {
    return res.status(400).json({ message: 'Missing parameters' });
  }

  try {
    const imageDir = isClubMember ? 'ai' : 'others';
    const directoryPath = path.join(process.cwd(), 'public', imageDir);

    // Get list of image files in the directory
    const files = await fs.readdir(directoryPath);
    const imageFiles = files.filter(file => {
      const lowerCaseFile = file.toLowerCase();
      return lowerCaseFile.endsWith('.jpg') || lowerCaseFile.endsWith('.jpeg') || lowerCaseFile.endsWith('.png');
    });

    if (imageFiles.length === 0) {
      return res.status(404).json({ message: `No image files found in ${imageDir} directory.` });
    }

    // Select a random image file
    const randomImageName = imageFiles[Math.floor(Math.random() * imageFiles.length)];
    const imagePath = path.join(directoryPath, randomImageName);

    // Check if the image file exists (redundant after readdir but good practice)
    try {
      await fs.access(imagePath);
    } catch (error) {
      console.error(`Image file not found: ${imagePath}`, error);
      return res.status(404).json({ message: 'Selected background image not found.' });
    }

    let image = sharp(imagePath);
    const metadata = await image.metadata();

    // Calculate text position (closer to the top for header)
    const textYPercentage = 15; // Position at 15% of the height from the top
    const textY = (metadata.height * textYPercentage) / 100;

    // SVG for text overlay
    const svgText = `
      <svg width="${metadata.width}" height="${metadata.height}">
        <style>
          .title { fill: #ffffff; font-size: 60px; font-weight: bold; text-anchor: middle; font-family: 'Noto Sans Arabic', sans-serif; text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5); }
        </style>
        <text x="50%" y="${textY}" class="title">${userName}</text>
      </svg>
    `;

    const svgBuffer = Buffer.from(svgText);

    const compositeLayers: any[] = [
      { input: svgBuffer, gravity: 'northwest', top: 0, left: 0 }
    ];

    // Add logo if the user is a club member
    if (isClubMember) {
      const logoPath = path.join(process.cwd(), 'public', 'logo.png');
      try {
        await fs.access(logoPath);
        const logoBuffer = await fs.readFile(logoPath);
        
        // Resize logo if needed and calculate position
        const logo = sharp(logoBuffer).resize({ width: 100 }); // Adjust size as needed
        const logoMetadata = await logo.metadata();
        
        const logoX = (metadata.width - logoMetadata.width) / 2; // Center horizontally
        const logoY = 20; // Position 20px from the top (adjust as needed)

        compositeLayers.push({
          input: await logo.toBuffer(),
          top: logoY,
          left: logoX,
        });

      } catch (logoError) {
        console.error('Logo file not found or error processing logo:', logoError);
        // Optionally, you can still proceed without the logo or send an error
      }
    }

    const finalImageBuffer = await image
      .composite(compositeLayers)
      .png()
      .toBuffer();

    res.setHeader('Content-Type', 'image/png');
    res.status(200).send(finalImageBuffer);

  } catch (error) {
    console.error('Error generating card:', error);
    res.status(500).json({ message: 'Error generating card' });
  }
} 